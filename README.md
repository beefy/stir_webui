# stir_webui

A React + TypeScript web UI for [stir_webserver](https://github.com/beefy/stir_webserver). Provides a simple interface for sending anonymous messages, viewing message history, reacting/reporting/blocking, and managing blocked users.

## Pages

- **Send Message** (`/`) — Register/login and send a message to a random eligible user.
- **Message History** (`/history`) — View all sent and received messages sorted by timestamp. For received messages you can react (👍/👎), report, or block the sender. For sent messages you can see if the recipient reacted or reported.
- **Block History** (`/blocks`) — View all users you've blocked along with their messages. You can unblock users from this page.

## Prerequisites

- Node.js 18+
- npm

## Setup

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Copy the environment file and adjust if needed:

```bash
cp .env.example .env
```

By default the app expects the API at `http://localhost:8000`. If your server runs elsewhere, edit `.env`:

```
VITE_API_BASE_URL=http://localhost:8000
```

## Development

Start the Vite dev server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build for Production

```bash
npm run build
```

The output will be in the `dist/` directory and can be served by any static file server.

## API

This UI communicates with the [stir_webserver](https://github.com/beefy/stir_webserver) API. See `API_DOCS.md` for the full specification.
