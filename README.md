# VNIT Grievance Management System

A comprehensive digital grievance redressal system for VNIT hostel that streamlines communication between residents, administrators, and maintenance workers.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Frontend**: React.js (to be implemented)

## Features

### Resident Portal
- Secure login with VNIT student ID
- Submit complaints with detailed descriptions and media attachments
- View dashboard of all submitted complaints with real-time status
- Receive notifications for status changes

### Admin Panel
- View and filter all complaints
- Approve/reject complaints
- Assign complaints to workers
- Track worker progress
- Verify completed work with proof
- Analytics dashboard with KPIs

### Worker Panel
- View assigned tasks
- Update task status (In Progress, Completed, Rejected)
- Upload proof of work (before/after images)
- Receive notifications for new assignments

## Project Structure

```
server/
├── config/
│   └── database.js          # PostgreSQL connection
├── database/
│   ├── schema.sql           # Database schema
│   └── init.js              # Database initialization
├── middleware/
│   ├── auth.js              # JWT authentication
│   └── upload.js            # Multer file upload config
├── models/
│   ├── User.js              # User model
│   ├── Complaint.js         # Complaint model
│   ├── Comment.js           # Comment model
│   ├── Attachment.js        # Attachment model
│   └── Notification.js      # Notification model
├── routes/
│   ├── authRoutes.js        # Authentication routes
│   ├── residentRoutes.js    # Resident portal routes
│   ├── adminRoutes.js       # Admin panel routes
│   └── workerRoutes.js      # Worker panel routes
└── app.js                   # Main Express app
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vnit_grievance
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb vnit_grievance
   
   # Or using psql
   psql -U postgres
   CREATE DATABASE vnit_grievance;
   ```

4. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=vnit_grievance
   DB_USER=postgres
   DB_PASSWORD=your_password

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-change-in-production

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000
   ```

5. **Initialize database schema**
   ```bash
   # Option 1: Run the init script
   node server/database/init.js

   # Option 2: Run schema.sql directly
   psql -U postgres -d vnit_grievance -f server/database/schema.sql
   ```

6. **Start the server**
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Resident Routes (Protected)
- `POST /api/resident/complaints` - Submit new complaint
- `GET /api/resident/complaints` - Get all complaints by resident
- `GET /api/resident/complaints/:id` - Get complaint details
- `POST /api/resident/complaints/:id/attachments` - Upload attachments
- `GET /api/resident/notifications` - Get notifications
- `PUT /api/resident/notifications/:id/read` - Mark notification as read

### Admin Routes (Protected - Admin only)
- `GET /api/admin/complaints` - Get all complaints with filters
- `GET /api/admin/complaints/:id` - Get complaint details
- `POST /api/admin/complaints/:id/approve` - Approve complaint
- `POST /api/admin/complaints/:id/reject` - Reject complaint
- `POST /api/admin/complaints/:id/assign` - Assign complaint to worker
- `POST /api/admin/complaints/:id/verify` - Verify completed work
- `GET /api/admin/workers` - Get all workers
- `GET /api/admin/analytics` - Get analytics data
- `POST /api/admin/complaints/:id/comments` - Add comment

### Worker Routes (Protected - Worker only)
- `GET /api/worker/tasks` - Get all assigned tasks
- `GET /api/worker/tasks/:id` - Get task details
- `PUT /api/worker/tasks/:id/status` - Update task status
- `POST /api/worker/tasks/:id/proof` - Upload proof of work
- `POST /api/worker/tasks/:id/comments` - Add comment
- `GET /api/worker/notifications` - Get notifications

## Database Schema

### Users Table
- Stores residents, admins, and workers
- Roles: `resident`, `admin`, `worker`

### Complaints Table
- Status flow: `Pending` → `Approved` → `Assigned` → `In Progress` → `Worker Pending` → `Completed` → `Resolved`
- Tracks time taken for resolution

### Attachments Table
- Stores media files for complaints
- Supports proof of work uploads

### Comments Table
- Threaded comments on complaints

### Notifications Table
- Real-time notifications for all users

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## File Uploads

- Maximum file size: 10MB
- Allowed types: Images (jpeg, jpg, png, gif) and Documents (pdf, doc, docx)
- Maximum files per upload: 5
- Files are stored in `server/uploads/` directory

## Status Flow

1. **Pending**: Complaint submitted, waiting for admin approval
2. **Approved**: Admin approved, ready for assignment
3. **Assigned**: Assigned to a worker
4. **In Progress**: Worker started working
5. **Worker Pending**: Worker completed, waiting for admin verification
6. **Completed**: Admin verified the work
7. **Resolved**: Final status after verification
8. **Rejected**: Complaint or work rejected

## Analytics

The analytics endpoint provides:
- Total complaints count
- Resolved complaints count
- In progress complaints
- Pending complaints
- Average resolution time
- Active workers count
- Category-wise statistics
- Status-wise statistics
- Pending time analysis (24h, 48h, 72h, 120h)

## Development

### Running in Development Mode
```bash
npm run dev
```

### Environment Variables
Make sure to set all required environment variables in `.env` file.

### Database Migrations
Currently using direct SQL schema. For production, consider using a migration tool like `node-pg-migrate` or `knex.js`.

## Production Considerations

1. Change `JWT_SECRET` to a strong, random string
2. Set `NODE_ENV=production`
3. Configure proper CORS origins
4. Use environment-specific database credentials
5. Set up proper file storage (S3, Cloudinary, etc.) instead of local storage
6. Implement rate limiting
7. Add request validation middleware
8. Set up logging (Winston, Morgan)
9. Configure HTTPS
10. Set up database backups

## License

ISC

