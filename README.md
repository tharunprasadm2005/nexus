# Real-Time Client Project Dashboard

A full-stack web application for managing client projects, tracking task progress, and monitoring team activity in real time with role-based access control.

## Tech Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Frontend** | React 18 + TypeScript | Type safety, component reusability, large ecosystem |
| **Backend** | Node.js + Express | Mature ecosystem, extensive middleware support, straightforward WebSocket integration with Socket.io |
| **Database** | PostgreSQL + Prisma | Relational data model with foreign keys, Prisma provides type-safe queries and auto-generated TypeScript types |
| **Real-time** | Socket.io | Built-in room support for project-scoped feeds, auto-reconnection for missed event catchup, auth middleware |
| **State Mgmt** | React Query + Context | Server state caching with automatic refetch, WebSocket event-driven invalidation |
| **Background Jobs** | node-cron | Lightweight scheduled task execution, no additional infrastructure (Redis) needed |
| **Validation** | Zod | Runtime validation with static TypeScript type inference |

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Docker (optional, for database)

### Using Docker (Recommended)

```bash
# Start PostgreSQL
docker-compose up -d

# Install server dependencies
cd server
npm install

# Generate Prisma client and push schema
npx prisma generate
npx prisma db push

# Seed the database
npx tsx prisma/seed.ts

# Start the server
npm run dev

# In a new terminal, install and start client
cd ../client
npm install
npm run dev
```

### Without Docker

Ensure PostgreSQL is running and update `server/.env` with your database URL:
```
DATABASE_URL="postgresql://user:password@localhost:5432/project_dashboard?schema=public"
```

Then follow the same steps as above.

### Access
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@velozity.com | password123 |
| Project Manager | pm1@velozity.com | password123 |
| Project Manager | pm2@velozity.com | password123 |
| Developer | dev1@velozity.com | password123 |
| Developer | dev2@velozity.com | password123 |
| Developer | dev3@velozity.com | password123 |
| Developer | dev4@velozity.com | password123 |

## Database Schema

### Tables

```
User
├── id (UUID, PK)
├── email (String, unique)
├── password (String, hashed)
├── name (String)
├── role (Enum: ADMIN, PROJECT_MANAGER, DEVELOPER)
├── isActive (Boolean)
├── createdAt, updatedAt

RefreshToken
├── id (UUID, PK)
├── token (String, unique)
├── userId (FK → User)
├── expiresAt (DateTime)

Client
├── id (UUID, PK)
├── name, email, company

Project
├── id (UUID, PK)
├── name, description
├── clientId (FK → Client)
├── createdById (FK → User)

Task
├── id (UUID, PK)
├── title, description
├── projectId (FK → Project)
├── assignedToId (FK → User, nullable)
├── status (Enum: TODO, IN_PROGRESS, IN_REVIEW, DONE)
├── priority (Enum: LOW, MEDIUM, HIGH, CRITICAL)
├── dueDate (DateTime, nullable)
├── isOverdue (Boolean)

ActivityLog
├── id (UUID, PK)
├── taskId (FK → Task)
├── userId (FK → User)
├── action, oldValue, newValue, message
├── createdAt

Notification
├── id (UUID, PK)
├── userId (FK → User)
├── type, title, message
├── isRead (Boolean)
├── relatedTaskId (nullable)
```

### Indexing Decisions

| Table | Index | Purpose |
|-------|-------|---------|
| User | `email` | Login lookups, unique constraint |
| User | `role` | Role-based filtering (admin dashboard) |
| Task | `projectId` | Most common join for project views |
| Task | `assignedToId` | Developer task views |
| Task | `status` | Status filtering |
| Task | `dueDate + isOverdue` | Overdue checker background job |
| Task | `projectId + status` | Compound: dashboard aggregate queries |
| Task | `assignedToId + status` | Compound: developer task filtering |
| ActivityLog | `taskId + createdAt` | Paginated activity feed per task |
| ActivityLog | `createdAt` | Global feed ordering |
| Notification | `userId + isRead` | Unread badge count query |
| RefreshToken | `token` | Token lookup during refresh |

## Architectural Decisions

### WebSocket Library: Socket.io
Socket.io was chosen over native WebSocket for several reasons:
1. **Room-based broadcasting**: Each project gets its own room, making it trivial to broadcast task updates only to users viewing that project
2. **Automatic reconnection**: Built-in reconnection with exponential backoff ensures missed events can be caught up via the `/api/activity/missed` endpoint
3. **Authentication middleware**: Socket.io supports middleware for verifying JWT tokens on connection
4. **WebSocket-only transport**: Configured with `transports: ['websocket']` to comply with WebSocket-only requirements, ensuring pure WebSocket communication without HTTP long-polling fallback

### Token Storage: HttpOnly Cookie (Refresh) + Memory (Access)
- **Refresh token**: Stored in HttpOnly, Secure, SameSite=Strict cookie. Immune to XSS attacks since JavaScript cannot access it.
- **Access token**: Stored only in memory (JavaScript variable). Not persisted to localStorage/sessionStorage. Must re-authenticate on tab close.
- **Refresh flow**: On 401 response, the client interceptor automatically calls `/api/auth/refresh` which reads the HttpOnly cookie and issues a new access token.

### Background Jobs: node-cron
For the overdue task checker, `node-cron` was chosen over Bull/Redis queue because:
- Simple scheduled execution (every 5 minutes) doesn't require job queuing or retry logic
- No additional infrastructure dependency (Redis)
- Lightweight and easy to understand

### Role-Based Access Enforcement
Role checks are enforced at the API level through Express middleware:
1. `authenticate` middleware verifies JWT and attaches user to request
2. `authorize(...roles)` middleware checks if the user's role is allowed
3. `checkProjectAccess` middleware verifies PM ownership of projects
4. `checkTaskAccess` middleware verifies task ownership for developers

This means a Developer cannot access another Developer's tasks even by directly hitting API endpoints with modified tokens.

### Notification Delivery
Notifications are written to PostgreSQL first (durable), then pushed to the user's socket room `user:${userId}` via WebSocket. This ensures notifications survive server restarts and are delivered in real time. The unread count is pushed as a separate `notification:count` event, keeping the badge always current without polling.

### Missed Event Catchup
On WebSocket reconnect, the client reads `ws:lastSeen` from localStorage and calls `GET /api/activity/missed?lastSeen=<timestamp>`. The server queries activity logs after that timestamp, scoped by role, and returns the last 20 events in chronological order. This handles network drops, tab backgrounding, and app restarts without any in-memory caching.

### Validation Strategy
Zod validation is applied at two layers: request body (POST/PUT endpoints) and query parameters (GET list/filter endpoints). The `taskFiltersSchema` validates status, priority, dueDateFrom, dueDateTo, page, and limit on every task list endpoint, rejecting malformed queries with structured error responses before they reach the service layer.

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login (returns access token, sets refresh cookie)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Clear refresh token

### Projects
- `GET /api/projects` - List projects (role-filtered)
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create project (Admin, PM)
- `PUT /api/projects/:id` - Update project (Admin, PM owner)
- `DELETE /api/projects/:id` - Delete project (Admin only)

### Tasks
- `GET /api/projects/:projectId/tasks` - List tasks with filters
- `GET /api/tasks/:id` - Get task details
- `POST /api/projects/:projectId/tasks` - Create task (Admin, PM)
- `PUT /api/tasks/:id` - Update task (role-based)
- `GET /api/tasks/my-tasks` - Developer's assigned tasks

### Activity
- `GET /api/activity/global` - Global feed (Admin)
- `GET /api/activity/project/:projectId` - Project feed
- `GET /api/activity/missed` - Missed events catchup
- `GET /api/activity/task/:taskId` - Task activity log

### Notifications
- `GET /api/notifications` - User's notifications
- `GET /api/notifications/unread-count` - Unread count
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read

### Clients
- `GET /api/clients` - List all clients
- `GET /api/clients/:id` - Get client by ID
- `POST /api/clients` - Create client (Admin only)
- `PUT /api/clients/:id` - Update client (Admin only)
- `DELETE /api/clients/:id` - Delete client (Admin only)

### Users
- `GET /api/users/developers` - List developers (Admin, PM)
- `GET /api/users` - List all users (Admin only)
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Dashboard
- `GET /api/dashboard/admin` - Admin stats
- `GET /api/dashboard/pm` - PM stats
- `GET /api/dashboard/developer` - Developer stats

## Seed Data

The seed script creates:
- 1 Admin, 2 Project Managers, 4 Developers
- 3 clients (Acme Corp, TechStart Inc, DataCo)
- 3 projects with 16 tasks in various statuses
- 2 overdue tasks (past due date, status not DONE)
- Pre-existing activity log entries and notifications

## Known Limitations

1. **Single-server WebSocket**: WebSocket state is in-memory; horizontal scaling requires Redis adapter
2. **No file attachments**: Task descriptions are text-only
3. **No email notifications**: All notifications are in-app only
4. **No offline action queue**: Actions performed while offline are lost on reconnect
5. **No task deletion**: Tasks can be marked DONE but not permanently deleted
6. **Refresh token rotation only**: No token revocation list for force-logout across devices
