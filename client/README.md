# VNIT Grievance Management System - Frontend

React.js frontend for the VNIT Grievance Management System.

## Features

- **Resident Portal**: Submit complaints, track status, view details
- **Admin Panel**: Manage complaints, assign workers, view analytics
- **Worker Panel**: View tasks, update status, upload proof of work
- **Authentication**: JWT-based authentication with role-based access
- **Real-time Updates**: Status tracking and notifications

## Setup

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Configure Environment

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── Auth/          # Login, Register
│   │   ├── Resident/      # Resident portal components
│   │   ├── Admin/         # Admin panel components
│   │   ├── Worker/        # Worker panel components
│   │   └── Layout/        # Layout and navigation
│   ├── context/           # React context (Auth)
│   ├── services/          # API service layer
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
├── package.json
└── vite.config.js
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Usage

1. **Register/Login**: Create an account or login
2. **Resident**: Submit complaints and track their status
3. **Admin**: Approve, assign, and manage complaints
4. **Worker**: Update task status and upload proof of work

## API Integration

The frontend communicates with the backend API at `http://localhost:5000/api`. Make sure the backend server is running.

## Technologies

- React 18
- React Router v6
- Axios
- Vite
- React Toastify
- date-fns

