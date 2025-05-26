# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

vtbs.moe is a real-time VTuber monitoring platform for Bilibili streamers, combining Vue.js frontend with Node.js cluster-based backend, WebSocket communication, and LevelDB persistence.

## Development Commands

### Setup and Dependencies
```bash
git submodule update --init --recursive  # Initialize submodules (required)
npm install                               # Install dependencies
```

### Development Workflow
```bash
npm run serve                            # Frontend dev server with hot reload
npm run dev                              # Compile TypeScript in watch mode
npm run tsc                              # Compile TypeScript once
npm run build                            # Full production build (tsc + vue build)
npm run lint                             # Lint Vue components
npm run test                             # Run tests (alias for build)
```

### Backend Development
```bash
node api/mock                            # Run with mocked external services
node index.cjs                           # Run full backend (requires external deps)
```

### Utility Scripts
```bash
node script/db2json                      # Export database to JSON
node script/json2db                      # Import JSON to database
node script/fixdb                        # Database repair utilities
```

## Architecture

### Core Components
- **Frontend**: Vue 2.x with Vuex, Element UI, Socket.IO client
- **Backend**: Multi-process Node.js cluster with sticky sessions
- **Database**: LevelDB with custom abstractions (`rave-level`)
- **Communication**: Primary via WebSocket (Socket.IO), secondary REST API

### Process Architecture
- **Primary Process**: Spider coordination, database updates, worker orchestration
- **Worker Processes**: HTTP/WebSocket handling (up to 6 workers)
- **Inter-Process**: Cluster messaging for data sharing

### Database Classes (api/database.ts)
- `LevelDatabase`: Basic key-value operations
- `ArrayDatabase`: Time-series data with bulk operations  
- `SubLevelDatabase`: Namespaced data with JSON encoding

### Data Flow
```
External APIs → Spider → LevelDB → WebSocket → Frontend Vuex → Components
```

### Priority Update System
- Queue 1: Top 100 VTubers (always updated)
- Queue 2-4: Lower priority VTubers (staggered update cycles)

## Key Files and Patterns

### Backend Core
- `index.cjs`: Main cluster coordinator
- `api/spider.js`: Data collection from external APIs
- `api/socket.js`: WebSocket event handlers
- `api/database.ts`: Database abstraction layers
- `api/interface/`: External service integrations (VDB, Bilibili API)

### Frontend Structure
- `src/main.js`: Vue app initialization
- `src/App.vue`: Root component with Socket.IO integration
- `src/socket.js`: WebSocket client logic
- `src/store.js`: Vuex state management
- `src/views/`: Page components
- `src/components/`: Reusable UI components

### External Dependencies
- **VDB Integration**: External VTuber registry (vdb.vtbs.moe)
- **State Center**: Internal microservice (file:state-center)
- **BiliChat**: Embedded danmaku chat system

## Development Guidelines

### Adding New Features
1. **Backend data sources**: Extend `api/spider.js` and relevant interface files
2. **Frontend pages**: Add to `src/views/` and update `src/router.js`
3. **WebSocket events**: Modify handler table in `api/socket.js`
4. **Database schemas**: Extend classes in `api/database.ts`

### Code Conventions
- TypeScript for backend API layer
- Vue 2.x Single File Components for frontend
- Socket.IO rooms for targeted real-time updates
- LevelDB async operations with proper error handling

### Critical Notes
- Socket.IO version must support cluster sticky sessions
- Vue 2.x architecture (not Vue 3) 
- LevelDB operations are async and require careful error handling
- Node.js >= 18 required for ES modules and modern features