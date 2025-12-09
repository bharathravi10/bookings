# Booking Dashboard (TypeScript)

Full-stack booking management dashboard with React TypeScript frontend, Node.js TypeScript backend, and MySQL database.

## Tech Stack

- **Frontend**: React 18 + TypeScript, React Router v6, Context API, Axios
- **Backend**: Node.js + Express + TypeScript, MySQL2, JWT
- **Database**: MySQL

## Quick Start

### Prerequisites

- Node.js (v16+)
- MySQL (v8+)
- npm or yarn

### Database Setup

1. Start MySQL server
2. Run the schema file:
   ```bash
   mysql -u root -p < server/models/booking.sql
   ```

### Backend Setup

1. Navigate to server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Create `.env` file and update with your database credentials:
     ```
     PORT=5000
     DB_HOST=localhost
     DB_USER=root
     DB_PASS=yourpassword
     DB_NAME=bookings_db
     JWT_SECRET=your-super-secret-jwt-key-change-in-production
     ADMIN_USER=admin
     ADMIN_PASS=plainpass
     ```

4. For development:
   ```bash
   npm run dev
   ```

5. For production:
   ```bash
   npm run build
   npm start
   ```

   Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   App will run on `http://localhost:3000`

## API Endpoints

- `POST /api/auth/login` - Login with username/password
- `GET /api/bookings/counts` - Get booking counts by status
- `GET /api/bookings?status=1&page=1&limit=10` - Get paginated bookings
- `PATCH /api/bookings/:id/status` - Update booking status

## Features

- ✅ TypeScript throughout (backend and frontend)
- ✅ JWT-based authentication
- ✅ Protected routes
- ✅ Dashboard with status counts
- ✅ Paginated booking tables
- ✅ Status updates with optimistic UI
- ✅ Comment modal for Follow Up/Cancel actions
- ✅ Context API for global state management
- ✅ Responsive design
- ✅ Memoized components for performance

## Default Credentials

- Username: `admin`
- Password: `plainpass`

## TypeScript Build

### Backend
- Development: Uses `ts-node-dev` for hot reloading
- Production: Compiles TypeScript to `dist/` folder using `tsc`

### Frontend
- Uses `react-scripts` with TypeScript support
- Type checking enabled via `tsconfig.json`

## Testing

Use Postman or similar tool to test API endpoints. Make sure to include the JWT token in the Authorization header for protected routes:

```
Authorization: Bearer <your-token>
```
