# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a full-stack monorepo with:
- **Backend**: Node.js/Koa.js server in `/server/` 
- **Frontend**: React/Vite application in `/react-route/`

## Development Commands

### Server (from `/server/`)
```bash
npm start          # Start the server
```

### React Frontend (from `/react-route/`)
```bash
npm run dev        # Start development server with HMR
npm run build      # Build for production
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

### Docker
```bash
docker-compose up  # Run full stack in containers
```

## Architecture Overview

### Backend (`/server/`)
- **Framework**: Koa.js with modular architecture in `/server/modules/`
- **Database**: PostgreSQL with JSONB document store
- **Key Modules**:
  - `data/` - Document store operations
  - `mqtt/` - Message queue integration  
  - `s3/` - AWS S3 file storage
  - `shortUrl/` - URL shortening service
  - `xstate/` - State machine workflows

### API Design
- RESTful document store: `GET/POST/PUT /data/:path*`
- File uploads: `/upload`, `/uploads3`
- URL shortening: `/s/:shortUrl`
- WebSocket: `/ws` endpoint
- Authentication: `/auth`

### State Management
The application uses XState (v5.0.0) for complex workflow management. State machines are integrated throughout the backend for handling educational workflows and real-time collaboration.

### Database Schema
- `document_store` - JSON documents with JSONB storage
- `short_urls` - URL shortening mappings
- `blob_store` - Binary file storage

## Configuration

Server requires `.env` file with:
- Database: `EDDY_DB_URL` or `CLASS_DB_URL`
- AWS: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`
- MQTT: `MQTT_SERVER`, `MQTT_USER`, `MQTT_PASS`
- SSL: `SSL_KEY_PATH`, `SSL_CERT_PATH`
- Server: `HTTP_PORT`, `HTTPS_PORT`, `BASE_URL`

## Setup Requirements

1. Run `/server/create_db.sql` to initialize PostgreSQL database
2. Configure environment variables in `/server/.env`
3. Install dependencies in both `/server/` and `/react-route/`

## Key Technologies

- **Backend**: Koa.js, PostgreSQL, XState, AWS S3, MQTT
- **Frontend**: React 18, Vite, ESLint
- **Infrastructure**: Docker, WebSockets, SSL support