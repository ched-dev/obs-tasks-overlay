import { useState, useEffect } from 'react'
import dates from '../utils/dates'

export default function TimeAgo({
  timestamp, // start time
  now = () => Date.now(), // end time
  live = false
}) {
  const [lastRefresh, setLastRefresh] = useState(Date.now())

  useEffect(() => {
    let timeout

    if (live) {
      timeout = setTimeout(() => setLastRefresh(Date.now()), 60000)
    }

    return () => clearTimeout(timeout)
  }, [live, lastRefresh, setLastRefresh])

  return (
    <span data-last-refresh={lastRefresh}>
      {dates.getFormattedTime((now() - timestamp) / 1000)}
    </span>
  )
}