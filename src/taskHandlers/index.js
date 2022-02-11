// !task start 4
const getTaskId = (args) => {
  return args[0]
}

// !task title This is a new Title
const getText = (args) => {
  return args.join(" ")
}

// !task edit 3 The new title
const getTextAfterTaskId = (args) => {
  return args.slice(1).join(" ")
}

// !task move 3 4
const getMoveTaskIds = (args) => {
  return {
    from:  args[0],
    to:  args[1]
  }
}

// { taskCommand: commandCallback }
const taskHandlers = {
  start: ({ command, args, tasks, setTasks }) => {
    const taskId = getTaskId(args)
    const updatedTasks = [...tasks]
    const task = taskId ? updatedTasks[taskId - 1] : updatedTasks.find(t => !t.endTime)

    if (!task) {
      console.error(command, '// could not find a task to start, ignoring command', taskId)
      return
    }
    
    if (task.startTime || task.endTime) {
      console.log(command, '// task already started or ended, ignoring command')
      return
    }

    task.startTime = Date.now()
    if (task.accumulatedTime) {
      task.startTime -= task.accumulatedTime
      delete task.accumulatedTime
    }
    console.log(command, '// starting new task', task)
    setTasks(updatedTasks)
  },

  next: (args) => {
    // end any task in progress
    taskHandlers.end(args)

    // start next available task or use taskId
    taskHandlers.start(args)
  },

  pause: ({ command, args, tasks, setTasks }) => {
    const taskId = getTaskId(args)
    const updatedTasks = [...tasks]
    const task = taskId ? updatedTasks[taskId - 1] : updatedTasks.find(t => t.startTime && !t.endTime)

    if (!task) {
      console.log(command, '// could not find a task to pause, ignoring command', taskId)
      return
    }

    if (!task.startTime) {
      console.log(command, `// task has not been started`, {
        taskId,
        task
      })
      return
    }

    task.accumulatedTime = Date.now() - task.startTime
    delete task.startTime
    console.log(command, `// pausing task`, {
      taskId,
      task
    })
    setTasks(updatedTasks)
  },

  end: ({ command, args, tasks, setTasks }) => {
    const taskId = getTaskId(args)
    const updatedTasks = [...tasks]
    const task = taskId ? updatedTasks[taskId - 1] : updatedTasks.find(t => t.startTime && !t.endTime)

    if (!task) {
      console.log(command, '// could not find a task to end', taskId)
      return
    }

    if (task.accumulatedTime) {
      task.startTime = Date.now() - task.accumulatedTime
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
  },

  title: ({ args, setTitle }) => {
    const title = getText(args)
    setTitle(title)
  },

  add: ({ command, args, tasks, setTasks }) => {
    const name = getText(args)

    if (command === "add") {
      setTasks([
        ...tasks,
        {
          name
        }
      ])
    }
  },

  edit: ({ command, args, tasks, setTasks }) => {
    const taskId = getTaskId(args)
    const name = getTextAfterTaskId(args)
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
  },

  move: ({ args, tasks, setTasks }) => {
    const moveTaskIds = getMoveTaskIds(args)
    const fromTask = tasks.find((t, i) => i+1 === Number(moveTaskIds.from))

    if (!fromTask) {
      console.log(message, `Could not find fromTaskId ${moveTaskIds.from}`)
      return
    }

    const toTask = tasks.find((t, i) => i+1 === Number(moveTaskIds.to))

    if (!toTask) {
      console.log(message, `Could not find toTaskId ${moveTaskIds.to}`)
      return
    }

    const updatedTasks = tasks.map((task, index) => {
      if (index + 1 === Number(moveTaskIds.from)) {
        return toTask
      }
      if (index + 1 === Number(moveTaskIds.to)) {
        return fromTask
      }

      return task
    })
    setTasks(updatedTasks)
  },

  swap: (args) => {
    taskHandlers.move(args)
  },

  sort: ({ tasks, setTasks }) => {
    // 1: all completed tasks
    const completedTasks = []
    // 2: in progress tasks
    const inProgressTasks = []
    // 3: non-started tasks
    const toDoTasks = []

    tasks.forEach((task) => {
      if (task.endTime) {
        completedTasks.push(task)
      }
      else if (task.startTime) {
        inProgressTasks.push(task)
      }
      else {
        toDoTasks.push(task)
      }
    })

    setTasks(
      completedTasks
      .concat(inProgressTasks)
      .concat(toDoTasks)
    )
  },

  reset: ({ command, args, tasks, setTasks }) => {
    const taskId = getTaskId(args)
    const task = tasks[taskId - 1]

    if (!task) {
      console.log(command, "// could not find task", taskId)
      return
    }

    setTasks(tasks.map((t, index) => Number(taskId) === index + 1 ? ({ name: task.name }) : t))
  },

  clear: ({ args, tasks, setTasks }) => {
    const taskId = getTaskId(args)
    // clear all completed
    if (!taskId) {
      setTasks(tasks.filter(task => !task.endTime))
      return
    }

    setTasks(tasks.filter((task, index) => Number(taskId) !== index + 1))
  }
}

export default taskHandlers