import { useState, useEffect, useRef } from 'react'
import tmi from 'tmi.js'
import Head from 'next/head'
import { useRouter } from 'next/router'
import TimeAgo from '../components/timeAgo'
import taskHandlers from '../taskHandlers'

let client = null
let timeoutError = false

const streamTasks = [
  { // completed
    name: "Create Next.js App with Tailwind",
    startTime: 1619399058463,
    endTime: 1619400608599
  },
  { // in progress
    name: "Load up screen in OBS",
    startTime: 1619400608599
  },
  { // paused
    name: "Add Task functionality",
    accumulatedTime: 180000
  },
  { // to do
    name: "Chat commands"
  }
]

const defaultConfig = {
  command: "!task",
  channelName: null,
  allowMods: false,
  scale: 1,
  verticalAlign: 'top'
}

const applyScale = (scale) => {
  const el = document.querySelector('html')
  
  el.style = `
    font-size: ${scale}em;
  `
}

export default function Home() {
  let initialTasks = []
  let initialTitle
  if (typeof window !== 'undefined') {
    initialTasks = JSON.parse(localStorage.getItem('obs-tasks') || '[]')
    initialTitle = JSON.parse(localStorage.getItem('obs-tasks-title'))
  }
  const [title, setTitle] = useState(initialTitle)
  const [tasks, setTasks] = useState(initialTasks)
  const [error, setError] = useState()
  const [config, setConfig] = useState(defaultConfig)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // set timeoutError
  useEffect(() => {
    timeoutError = setTimeout(() => {
      setError(`Could not load query params`)
    }, 3000)

    return () => clearTimeout(timeoutError)
  }, [])

  // update the config from query params
  useEffect(() => {
    if (!Object.keys(router.query).length) {
      // no config found
      return
    }

    const newConfig = {
      ...defaultConfig,
      ...router.query
    }
    newConfig.allowMods = ['true', '1'].includes(newConfig.allowMods)
    newConfig.scale = Number(newConfig.scale)
    newConfig.command = newConfig.command.trim()

    setConfig(newConfig)
    console.log('setConfig', newConfig)
  }, [router.query])

  // config error checking & applying
  useEffect(() => {
    if (loading) {
      return
    }

    if (!config.channelName) {
      setError(`Query Param Missing: A 'channelName' is required`)
      return
    }
    if (isNaN(config.scale)) {
      setError(`Query Param Error: 'scale' must be a number`)
      return
    }
    if (!['top', 'center', 'middle', 'bottom'].includes(config.verticalAlign)) {
      setError(`Query Param Error: 'verticalAlign' must be 'top' | 'center' | 'middle' | 'bottom'`)
      return
    }

    // apply config
    applyScale(config.scale)

    setError(null)
  }, [config, loading])

  const handleTask = (message) => {
    // message examples:
    //   !task start [taskId]
    //   !task end [taskId]
    //   !task add Name of the task
    //   !task edit 3 New name of the task
    const [, rawCommand, ...args] = message.split(" ")
    const command = rawCommand.toLowerCase()
    console.log('handleTask', {
      command,
      message,
      args
    })

    if (taskHandlers.hasOwnProperty(command)) {
      const runCommand = taskHandlers[command]

      runCommand({
        command,
        args,
        title,
        setTitle,
        tasks,
        setTasks
      })
      return
    }
    
    console.log(command, `// did not recognize command`, {
      command,
      args
    })
  }

  const triggerTask = useRef(handleTask);
  triggerTask.current = handleTask

  // launch client and listen for callbacks
  useEffect(() => {
    // don't accidentally run
    if (!config.channelName || client) {
      return
    }

    clearTimeout(timeoutError)
    timeoutError = false

    client = new tmi.Client({
      connection: { reconnect: true },
      channels: [config.channelName]
    })

    client.connect()

    // _promiseJoin is the "channel join" event
    client.on('_promiseJoin', (message, channel) => {
      if (message === 'No response from Twitch.') {
        setError(`Channel Join Failed: ${channel}`)
      }
      else if (!message) {
        setLoading(false)
        console.log('Channel Join:', channel, message || 'Success')
      }
    })

    client.on('message', (channel, tags, message, self) => {
      console.log(`${tags['display-name']}: ${message}`);
      console.log({
        channel,
        tags,
        message,
        self
      })

      const cleanedMessage = message.trim()

      if (
          // is broadcaster
          tags.badges && tags.badges.broadcaster ||
          // is a moderator and mods allowed
          tags.mod && config.allowMods
        ) {
        if (cleanedMessage.toLowerCase().startsWith(`${config.command} `)) {
          triggerTask.current(cleanedMessage)
        }
      }
    });

    return () => {
      console.log("DISCONNECT")
      client.disconnect()
      client = null
    }
  }, [config])

  // save tasks to localstorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('obs-tasks', JSON.stringify(tasks))
    }
  }, [tasks])

  // save title to localstorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('obs-tasks-title', JSON.stringify(title))
    }
  }, [title])

  const getTaskStatus = (task) => ({
    isInProgress: !task.endTime && task.startTime,
    isPaused: task.accumulatedTime,
    isCompleted: task.endTime,
    isToDo: !task.endTime && !task.startTime && !task.accumulatedTime
  })

  return (
    <div className="h-full text-white flex">
      <Head>
        <title>OBS Tasks Overlay</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={`m-3 w-full flex flex-col ` + {
        top: 'justify-start',
        center: 'justify-center',
        middle: 'justify-center',
        bottom: 'justify-end'
      }[config.verticalAlign] || ''}>
        {error && <p className="text-xl font-bold text-red-500 animate-fade-in">OBS Tasks Overlay Error:<br/>{error}</p>}

        {!error && !loading && (
          <section className="animate-fade-in">
            <h1 className="text-xl">{title || "Stream Tasks"}</h1>
            <ul className="my-3 w-full">
              {tasks.length === 0 && <em className="block text-center opacity-50">None yet.</em>}
              {tasks.map((task, index) => {
                const status = getTaskStatus(task)
                const taskId = index + 1

                return (
                  <li key={taskId} className="flex items-center justify-between">
                    <span className="status-icon">
                      {status.isToDo && (
                        <span><i className="far fa-circle opacity-30 mr-2" /></span>
                      )}
                      {status.isInProgress && (
                        <span><i className="fas fa-circle text-red-700 mr-2 animate-pulse" /></span>
                      )}
                      {status.isCompleted && (
                        <span><i className="fas fa-check text-green-600 mr-2" /></span>
                      )}
                      {status.isPaused && (
                        <span><i className="far fa-pause-circle opacity-30 mr-2" /></span>
                      )}
                    </span>
                    <span className="opacity-30 mr-2">{taskId}</span>
                    {status.isToDo && (
                      <>
                        <span>{task.name}</span>
                        <span className="ml-auto whitespace-nowrap"></span>
                      </>
                    )}
                    {status.isInProgress && (
                      <>
                        <span className="animate-pulse">{task.name}</span>
                        <span className="ml-auto whitespace-nowrap">
                          <TimeAgo
                            timestamp={task.startTime}
                            live={true}
                          />
                        </span>
                      </>
                    )}
                    {status.isCompleted && (
                      <>
                        <span className="opacity-50">{task.name}</span>
                        <span className="opacity-50 ml-auto whitespace-nowrap">
                          <TimeAgo
                            now={() => task.endTime}
                            timestamp={task.startTime}
                          />
                        </span>
                      </>
                    )}
                    {status.isPaused && (
                      <>
                        <span>{task.name}</span>
                        <span className="ml-auto whitespace-nowrap">
                          <TimeAgo
                            now={() => Date.now() + task.accumulatedTime}
                            timestamp={Date.now()}
                          />
                        </span>
                      </>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </main>
    </div>
  )
}
