# Quick Start Guide

## Prerequisites Check
- [ ] Node.js installed (v14+)
- [ ] PostgreSQL installed and running
- [ ] Database created

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Create PostgreSQL Database
```bash
# Using psql
psql -U postgres
CREATE DATABASE vnit_grievance;
\q

# Or using createdb command
createdb vnit_grievance
```

### 3. Configure Environment
Create `.env` file in root directory:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vnit_grievance
DB_USER=postgres
DB_PASSWORD=your_password

PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this
FRONTEND_URL=http://localhost:3000
```

### 4. Initialize Database Schema
```bash
npm run init-db
```

Or manually:
```bash
psql -U postgres -d vnit_grievance -f server/database/schema.sql
```

### 5. Create Admin User
```bash
npm run create-admin admin@vnit.ac.in admin123 "Admin User" ADMIN001
```

### 6. Start Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Testing the API

### 1. Register a Resident
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@vnit.ac.in",
    "password": "student123",
    "full_name": "John Doe",
    "role": "resident",
    "student_id": "2021BCS001",
    "floor": "2",
    "room": "201"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@vnit.ac.in",
    "password": "student123"
  }'
```

Save the token from response.

### 3. Submit a Complaint (as Resident)
```bash
curl -X POST http://localhost:5000/api/resident/complaints \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "WiFi not working",
    "description": "Unable to connect to WiFi in room 201",
    "category": "Infrastructure",
    "subcategory": "Internet",
    "priority": "High"
  }'
```

### 4. Login as Admin
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vnit.ac.in",
    "password": "admin123"
  }'
```

### 5. Approve Complaint (as Admin)
```bash
curl -X POST http://localhost:5000/api/admin/complaints/COMPLAINT_ID/approve \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### 6. Get Analytics (as Admin)
```bash
curl -X GET http://localhost:5000/api/admin/analytics \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

## API Testing Tools

You can also use:
- **Postman**: Import the API endpoints
- **Thunder Client** (VS Code extension)
- **Insomnia**
- **httpie**: `http POST localhost:5000/api/auth/login email=admin@vnit.ac.in password=admin123`

## Common Issues

### Database Connection Error
- Check PostgreSQL is running: `pg_isready`
- Verify database credentials in `.env`
- Ensure database exists: `psql -U postgres -l`

### Port Already in Use
- Change PORT in `.env` file
- Or kill the process: `lsof -ti:5000 | xargs kill`

### JWT Token Expired
- Tokens expire after 7 days
- Login again to get a new token

### File Upload Errors
- Ensure `server/uploads/` directory exists
- Check file size (max 10MB)
- Verify file type is allowed

## Next Steps

1. **Frontend Development**: Start building React.js frontend
2. **Add More Features**: 
   - Email notifications
   - Real-time updates (WebSockets)
   - Advanced filtering
   - Export reports
3. **Production Deployment**:
   - Use environment-specific configs
   - Set up proper file storage (S3/Cloudinary)
   - Configure HTTPS
   - Set up monitoring

