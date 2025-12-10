# Booking Dashboard

A full-stack booking management system built with React, TypeScript, Express, Prisma, and MySQL.

## Features

- **Frontend**: React 18 with TypeScript, Tailwind CSS, React Router v6
- **State Management**: Redux Toolkit with typed slices
- **Backend**: Express.js with TypeScript, Prisma ORM, MySQL
- **Authentication**: JWT-based authentication
- **Server-side Pagination**: Efficient data loading with caching
- **Optimistic UI Updates**: Instant feedback with rollback on error
- **Performance Optimizations**: React.memo, useMemo, useCallback, lazy loading
- **Testing**: Supertest for backend, React Testing Library for frontend

## Tech Stack

### Frontend
- React 18.2
- TypeScript (strict mode)
- Tailwind CSS
- React Router v6
- Redux Toolkit
- Axios
- Create React App

### Backend
- Express.js
- TypeScript (strict mode)
- Prisma ORM
- MySQL
- JWT Authentication
- Zod Validation
- Bcrypt

## Project Structure

```
bookings/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── scripts/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── __tests__/
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   │   ├── slices/
│   │   │   ├── index.ts
│   │   │   └── hooks.ts
│   │   ├── types/
│   │   ├── utils/
│   │   ├── __tests__/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Prerequisites

- Node.js 18+ and npm/yarn
- MySQL 8.0+
- Git

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd bookings
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL="mysql://user:password@localhost:3306/bookings_db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
```

Update the `DATABASE_URL` with your MySQL credentials.

### 3. Database Setup

```bash
# Generate Prisma Client
npm run generate

# Run migrations
npm run migrate

# Seed the database (optional)
npm run seed
```

The seed script creates:
- A default user: `admin@example.com` / `password123`
- 50 sample bookings

### 4. Frontend Setup

```bash
cd ../frontend
npm install
```

The frontend is configured to proxy API requests to `http://localhost:3001` via `setupProxy.js`.

### 5. Run the Application

**Backend** (from `backend` directory):
```bash
npm run dev
```

**Frontend** (from `frontend` directory):
```bash
npm start
```

The application will be available at:
- Frontend: http://localhost:3000 (opens automatically)
- Backend API: http://localhost:3001

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user (dev only)

### Bookings
- `GET /api/bookings` - Get paginated bookings
  - Query params: `status`, `page`, `limit`, `search`
- `GET /api/bookings/:id` - Get booking by ID
- `PATCH /api/bookings/:id/status` - Update booking status
  - Body: `{ status: number, comment?: string }`
- `GET /api/bookings/counts` - Get booking counts by status
- `POST /api/bookings/seed` - Seed bookings (dev only)

All booking endpoints require JWT authentication.

## Usage

1. **Login**: Use `admin@example.com` / `password123` (or create a new account)
2. **Dashboard**: View booking counts by status (New, Follow Up, Cancelled, Completed)
3. **Bookings Page**: Click on a status card to view filtered bookings
4. **Update Status**: For "New" bookings, use the action buttons:
   - **Follow Up**: Opens modal to add follow-up notes
   - **Cancel**: Opens modal to add cancellation reason
   - **Completed**: Confirms and marks as completed
5. **Search**: Use the search bar to filter by name, mobile, vehicle number, or city
6. **Pagination**: Navigate through pages using pagination controls

## Development

### Backend Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Frontend Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Testing

### Backend Tests
```bash
cd backend
npm test
```

Tests use Supertest for API endpoint testing.

### Frontend Tests
```bash
cd frontend
npm test
```

Tests use Vitest and React Testing Library.

## Performance Optimizations

- **React.memo**: Memoized components to prevent unnecessary re-renders
- **useMemo**: Cached computed values
- **useCallback**: Stable function references
- **Lazy Loading**: Code-split routes with React.lazy
- **Pagination Caching**: Cached paginated results in Redux store
- **Debounced Search**: Search input debounced to reduce API calls

## Environment Variables

### Backend
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - JWT expiration time
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

### Frontend
- API proxy is configured via `setupProxy.js` to proxy `/api` requests to `http://localhost:3001`

## Database Schema

### User
- `id` (UUID)
- `email` (unique)
- `password` (hashed)
- `name` (optional)
- `createdAt`, `updatedAt`

### Booking
- `id` (UUID)
- `name`
- `address`
- `city`
- `mobile`
- `vehicleNo`
- `status` (1: New, 2: Follow Up, 3: Cancelled, 4: Completed)
- `comment` (optional)
- `createdAt`, `updatedAt`

## License

ISC

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

