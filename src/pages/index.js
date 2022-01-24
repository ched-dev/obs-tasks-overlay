import { useState, useEffect, useCallback } from 'react'
import tmi from 'tmi.js'
import Head from 'next/head'
import { useRouter } from 'next/router'
import TimeAgo from '../components/timeAgo'

let client = null
let timeoutError = false

const streamTasks = [
  {
    name: "Create Next.js App with Tailwind",
    startTime: 1619399058463,
    endTime: 1619400608599
  },
  {
    name: "Load up screen in OBS",
    startTime: 1619400608599,
    endTime: 1619401242030
  },
  {
    name: "Add Task functionality"
  },
  {
    name: "Chat commands"
  }
]

const defaultConfig = {
  command: "!task",
  channelName: null,
  allowMods: false,
  title: null,
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
  if (typeof window !== 'undefined') {
    initialTasks = JSON.parse(localStorage.getItem('obs-tasks') || '[]')
  }
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

  const startTask = useCallback((command, taskId) => {
    const updatedTasks = [...tasks]
    const task = taskId ? updatedTasks[taskId - 1] : updatedTasks.find(t => !t.endTime)
    
    if (task.startTime || task.endTime) {
      console.log(command, '// task already started or ended, ignoring command')
      return
    }

    task.startTime = Date.now()
    console.log(command, '// starting new task', task)
    setTasks(updatedTasks)
  }, [tasks])

  const endTask = useCallback((command, taskId) => {
    const updatedTasks = [...tasks]
    const task = taskId ? updatedTasks[taskId - 1] : updatedTasks.find(t => t.startTime && !t.endTime)

    if (!task) {
      console.log(command, `// task ${taskId} does not exist`)
      return
    }

    if (!task.startTime) {
      console.log(command, `// task has not been started`, {
        taskId,
        task
      })
      return
    }

    task.endTime = Date.now()
    console.log(command, `// ending task`, {
      taskId,
      task
    })
    setTasks(updatedTasks)
  }, [tasks])

  const addNewTask = useCallback((command, name) => {
    if (command === "add") {
      setTasks([
        ...tasks,
        {
          name
        }
      ])
    }
  }, [tasks])

  const editTask = useCallback((command, taskId, name) => {
    const updatedTasks = [...tasks]
    const task = taskId ? updatedTasks[taskId - 1] : false

    if (!task) {
      console.log(command, `// task ${taskId} does not exist`)
      return
    }

    task.name = name
    console.log(command, `// editing task`, {
      taskId,
      task
    })
    setTasks(updatedTasks)
  }, [tasks])

  const clearTask = useCallback((command, taskId) => {
    // clear all
    if (!taskId) {
      setTasks([])
      return
    }

    setTasks(tasks.filter((task, index) => Number(taskId) !== index + 1))
  }, [tasks])

  const handleTask = useCallback((message) => {
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

    if (command === 'start') {
      startTask(command, args[0])
      return
    }
    if (command === 'add') {
      addNewTask(command, args.join(" "))
      return
    }
    if (command === 'end') {
      endTask(command, args[0])
      return
    }
    if (command === 'edit') {
      editTask(command, args[0], args.slice(1).join(" "))
    }
    if (command === 'clear') {
      clearTask(command, args[0])
    }
    
    console.log(command, `// did not recognize command`, {
      command,
      args
    })
  }, [startTask, addNewTask, editTask, endTask])

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
          handleTask(cleanedMessage)
        }
      }
    });

    return () => {
      client.disconnect()
      client = null
    }
  }, [handleTask, config])

  // save tasks to localstorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('obs-tasks', JSON.stringify(tasks))
    }
  }, [tasks])

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
            {config.title && <h1 className="text-xl">{config.title}</h1>}
            <ul className="my-3 w-full">
              {tasks.length === 0 && <em className="block text-center opacity-50">None yet.</em>}
              {tasks.map((task, index) => (
                <li key={task.name} className="flex items-center justify-between">
                  <span className="opacity-30 mr-2">{index + 1}</span>
                  {task.endTime ? (
                    <>
                      <span><i className="fas fa-check text-green-600 mr-2" /></span>
                      <span className="opacity-50">{task.name}</span>
                      <span className="opacity-50 ml-auto whitespace-nowrap">
                        <TimeAgo
                          now={() => task.endTime}
                          timestamp={task.startTime}
                        />
                      </span>
                    </>
                  ) : (
                    <>
                      <span className={task.startTime ? 'animate-pulse' : ''}>{task.name}</span>
                      <span className="ml-auto whitespace-nowrap">
                        {task.startTime && (
                          <TimeAgo
                            timestamp={task.startTime}
                            live={true}
                          />
                        )}
                      </span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  )
}
