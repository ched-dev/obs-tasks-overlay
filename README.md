# OBS Tasks Overlay

> A browser application to show Tasks in an OBS Browser Source, controlled via Twitch chat commands (`!task add A New Task`)


```
OBS Browser Source URL: 
https://obs-tasks-overlay.vercel.app/?channelName=ched_dev&title=Stream%20Tasks&scale=2&verticalAlign=middle
Width: 800
Height: 800
```

![Tasks Scaled and Centered](./public/screenshots/tasks-big-screen.png)

```
OBS Browser Source URL: 
https://obs-tasks-overlay.vercel.app/?channelName=ched_dev&title=Stream%20Tasks&scale=1.2
Width: 400
Height: 400
```

![Tasks Sidebar](./public/screenshots/tasks-sidebar.png)

## Features

- [x] `!task add Task Title` adds task to end of list
- [x] `!task start [taskId]` starts taskId or next available task
- [ ] `!task pause [taskId]` pauses current task
- [x] `!task next [taskId]` ends current task, starts taskId or next available task
- [x] `!task end [taskId]` ends current task
- [x] `!task edit taskId New Task Title`
- [ ] `!task move 4 3` or `!task swap 4 3` swaps task from #4 to #3
- [x] `!task clear [taskId]` removes taskId or ALL from list
- [x] Saved to localStorage (enabled by default)
- [x] Configuration: Command Name, Allow Mods, Title Text, Scale, Vertical Align
- [ ] Configuration: Colors, Font Family
- [ ] Configuration UI

## OBS Installation

Load a new Browser Source to the URL:

```
https://obs-tasks-overlay.vercel.app/?channelName=twitchUsername
```

The task list will stretch the full width of the browser source, allowing you to create it at your desired size.

Additional configuration options are available as query parameters:

> channelName=twitchUsername

**Required**

The Twitch channel chat to join and watch for messages. By default, only the broadcaster can run the `!task` commands.

> command=!task

Set the command you wish to listen for. We use `!task` by default. No spaces allowed in command.

> allowMods=true

Allow mods to run the `!task` commands on your behalf. Defaults `false`.

> title=Title Text

Show a Title above the task list

> scale=2

Scale of the text on the page. Defaults to `1`, increments by `.1`. E.g. `1.4` is valid

> verticalAlign=middle

Vertically aligns the list within your OBS browser source window. Options are `top`, `center`, `middle`, `bottom`. Defaults to `top`.

**Fully Configured Example URL:**
```
https://obs-tasks-overlay.vercel.app/?channelName=ched_dev&title=Stream%20Tasks&scale=2&verticalAlign=middle
```

## Getting Setup for Development

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
