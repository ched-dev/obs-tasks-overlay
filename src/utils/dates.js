export default {

  getFormattedTime(seconds) {
    const DAY = (1 * 24 * 60 * 60) // d * h * m * s
    const HOUR = (1 * 60 * 60) // h * m * s
    const MINUTE = (1 * 60) // m * s
    let formattedTime = ``
    let remainingSeconds = seconds

    let days = Math.floor(remainingSeconds / DAY)
    if (days >= 1) {
      days = Math.floor(days)
      remainingSeconds -= DAY * days
      formattedTime += `${days}d `
    }

    let hours = Math.floor(remainingSeconds / HOUR)
    if (hours >= 1) {
      hours = Math.floor(hours)
      remainingSeconds -= HOUR * hours
      formattedTime += `${hours}h `
    }

    let minutes = Math.floor(remainingSeconds / MINUTE)
    if (minutes >= 1) {
      minutes = Math.floor(minutes)
      remainingSeconds -= MINUTE * minutes
      formattedTime += `${minutes}m `
    } else {
      formattedTime += `0m `
    }

    return formattedTime.trim()
  }
  
}