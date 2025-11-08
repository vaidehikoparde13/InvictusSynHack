# Frontend Setup Guide

## Quick Start

### 1. Navigate to Client Directory

```bash
cd client
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Auth.css
│   │   ├── Resident/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Complaints.jsx
│   │   │   └── ComplaintDetail.jsx
│   │   ├── Admin/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Complaints.jsx
│   │   │   └── Analytics.jsx
│   │   ├── Worker/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Tasks.jsx
│   │   │   └── TaskDetail.jsx
│   │   └── Layout/
│   │       ├── Layout.jsx
│   │       └── Layout.css
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Features Implemented

### ✅ Authentication
- Login page
- Registration page
- JWT token management
- Protected routes
- Role-based access control

### ✅ Resident Portal
- Dashboard with statistics
- Submit new complaints
- View all complaints with filters
- Complaint detail view
- File upload for attachments

### ✅ Admin Panel
- Dashboard with analytics overview
- Manage all complaints
- Approve/Reject complaints
- Assign complaints to workers
- Verify completed work
- Analytics dashboard with KPIs

### ✅ Worker Panel
- Dashboard with task statistics
- View assigned tasks
- Update task status
- Upload proof of work
- Task detail view

## API Integration

All API calls are handled through `src/services/api.js`:
- Automatic token injection
- Error handling
- Request/response interceptors

## Routing

Routes are defined in `src/App.jsx`:
- `/login` - Login page
- `/register` - Registration page
- `/resident/*` - Resident portal routes
- `/admin/*` - Admin panel routes
- `/worker/*` - Worker panel routes

## Styling

- Global styles in `index.css`
- Component-specific styles in respective CSS files
- Responsive design
- Modern UI with cards, badges, and tables

## Testing the Application

1. **Start Backend**: Make sure backend is running on port 5000
2. **Start Frontend**: Run `npm run dev` in client directory
3. **Register Users**:
   - Register as resident
   - Register as admin (or use existing admin)
   - Register as worker
4. **Test Flow**:
   - Resident submits complaint
   - Admin approves and assigns to worker
   - Worker updates status and uploads proof
   - Admin verifies work

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## Troubleshooting

### Port Already in Use
Change the port in `vite.config.js`:
```js
server: {
  port: 3001, // Change from 3000
}
```

### API Connection Errors
- Verify backend is running on port 5000
- Check `VITE_API_URL` in `.env` file
- Check CORS settings in backend

### Module Not Found
Run `npm install` again to ensure all dependencies are installed.

