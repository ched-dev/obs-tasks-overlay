import { useState, useEffect, useCallback } from 'react'
import tmi from 'tmi.js'
import Head from 'next/head'
import TimeAgo from '../components/timeAgo'
import shortStrings from 'react-timeago/lib/language-strings/en-short'
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter'
 
const formatter = buildFormatter(shortStrings)

const streamInfo = {
  startTime: 1619399058463
}
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

export default function Home() {
  let initialTasks = []
  if (typeof window !== 'undefined') {
    initialTasks = JSON.parse(localStorage.getItem('obs-tasks') || '[]')
  }
  const [tasks, setTasks] = useState(initialTasks)

  const startTask = useCallback((command, taskId) => {
    const updatedTasks = [...tasks]
    const task = taskId ? updatedTasks[taskId - 1] : updatedTasks.find(t => !t.startTime)
    
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

  useEffect(() => {
    const client = new tmi.Client({
      connection: { reconnect: true },
      channels: [ 'ched_dev' ]
    });

    client.connect();

    client.on('message', (channel, tags, message, self) => {
      // "Alca: Hello, World!"
      console.log(`${tags['display-name']}: ${message}`);
      console.log({
        channel,
        tags,
        message,
        self
      })

      const cleanedMessage = message.trim()

      // is me
      if (tags.username === "ched_dev") {
        if (cleanedMessage.toLowerCase().startsWith("!task ")) {
          handleTask(cleanedMessage)
        }
      }

      if (tags.mod) {
        // is a moderator
      }

      if (tags['msg-id'] === "highlighted-message") {
        // is a highlighted message
      }
    });

    return () => client.disconnect()
  }, [handleTask])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('obs-tasks', JSON.stringify(tasks))
    }
  }, [tasks])

  return (
    <div className="h-full text-white flex">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="m-5 w-1/5 ml-auto mt-36 h-96">
        <h1 className="text-xl">Stream Tasks</h1>
        <ul className="my-3">
          {tasks.length === 0 && <em className="block text-center opacity-50">None yet.</em>}
          {tasks.map((task, index) => (
            <li key={task.name} className="flex items-center">
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
      </main>
    </div>
  )
}
