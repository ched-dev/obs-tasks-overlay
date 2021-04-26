import { useState } from 'react'
import Head from 'next/head'
import TimeAgo from 'react-timeago'
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
  const [tasks, setTasks] = useState(streamTasks)

  return (
    <div className="h-full text-white flex">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="m-5 w-1/6 ml-auto mt-40 bg-gray-800 h-96">
        <h1 className="text-xl">Stream Tasks</h1>
        <ul className="my-5 pl-3">
          {tasks.map(task => (
            <li key={task.name} className="flex items-center space-x-2">
              {task.endTime ? (
                <>
                  <strike className="opacity-50">{task.name}</strike>
                  <span className="opacity-50">
                    <TimeAgo
                      now={() => task.endTime}
                      date={task.startTime}
                      formatter={formatter}
                      live={false}
                    />
                  </span>
                </>
              ) : (
                <span>{task.name}</span>
              )}
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
