# test-project

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Deploy on Vercel

Import `wondermagi1/quiz-backend` and use the repository root (`./`).
The checked-in `vercel.json` configures Vue CLI, `npm ci`, `npm run build`, and the `dist` output directory. Node.js 24.x is selected in `package.json`.

This repository contains the Vue management frontend. Routing uses hash mode (`/#/user` and `/#/quiz`), so static hosting does not require history-mode rewrites. Question data is stored in the current browser's localStorage. The user-management page contains demonstration data and does not connect to a backend.
