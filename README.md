# OBS Tasks Overlay

> An browser application to show Tasks in an OBS Browser Source, controlled via Twitch chat commands (`!task add A New Task`)

> https://obs-tasks-overlay.vercel.app/?username=ched_dev&title=Stream%20Tasks&scale=2&verticalAlign=middle

![Tasks Scaled and Centered](./public/screenshots/tasks-big-screen.png)

> https://obs-tasks-overlay.vercel.app/?username=ched_dev&title=Stream%20Tasks

![Tasks Sidebar](./public/screenshots/tasks-sidebar.png)

## Features

- [x] `!task add Task Title`
- [x] `!task start [taskId]`
- [ ] `!task pause [taskId]`
- [x] `!task end [taskId]`
- [x] `!task edit taskId New Task Title`
- [ ] `!task move 4 3`
- [x] `!task clear [taskId]`
- [x] Saved to localStorage (enabled by default)
- [ ] Saved to database
- [ ] Light/Dark Mode

## OBS Installation

Load a new Browser Source to the URL:

```
https://obs-tasks-overlay.vercel.app/?username=twitchUsername
```

Additional configuration options are available as query parameters:

> allowMods=true

Allow Mods to run the `!task` commands on your behalf.

> title=Title Text

Show a Title above the task list

> scale=2

Scale of the text on the page. Defaults to `1`, increments by `.1`. E.g. `1.4` is valid

> verticalAlign=middle

Vertically aligns the list within your OBS browser source window. Options are `top`, `center`, `middle`, `bottom`. Defaults to `top`.

**Fully Configured Example URL:**
```
https://obs-tasks-overlay.vercel.app/?username=ched_dev&title=Stream%20Tasks&scale=2&verticalAlign=middle
```

## Getting Started

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
