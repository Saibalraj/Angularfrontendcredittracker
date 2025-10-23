# Student Management Backend API

A Node.js/Express backend server for the Student Management System with MySQL database integration.

## 🚀 Features

- **Student Registration**: Create new student accounts
- **Student Login**: Authenticate students
- **Password Security**: Bcrypt hashing for secure password storage
- **Database Integration**: MySQL database with automatic table creation
- **CORS Support**: Cross-origin requests from frontend
- **Rate Limiting**: API protection against abuse
- **Security Headers**: Helmet.js for security
- **Error Handling**: Comprehensive error handling

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up MySQL database:**
   - Install MySQL on your system
   - Create a database (optional - will be created automatically)
   - Update database credentials in `config.js` if needed

3. **Start the server:**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## 🔧 Configuration

The server uses the following default configuration:

- **Port**: 8084
- **Database**: student_management
- **Host**: localhost
- **User**: root
- **Password**: (empty)

You can override these by setting environment variables:

```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=student_management
DB_PORT=3306
PORT=8084
```

## 📡 API Endpoints

### Health Check
- **GET** `/health` - Server health status

### Student Management
- **POST** `/api/signup` - Register new student
- **POST** `/api/login` - Student login
- **GET** `/api/students` - Get all students
- **GET** `/api/students/:id` - Get student by ID

## 📊 Database Schema

The API automatically creates the following table:

```sql
CREATE TABLE students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rollNo INT UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  program VARCHAR(100) NOT NULL,
  requiredCredits INT NOT NULL,
  password VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🔐 Security Features

- **Password Hashing**: Bcrypt with 12 rounds
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configured for frontend domains
- **Security Headers**: Helmet.js protection
- **Input Validation**: Server-side validation for all inputs

## 🧪 Testing the API

### Test Registration:
```bash
curl -X POST http://localhost:8084/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "rollNo": 12345,
    "name": "John Doe",
    "program": "B.Tech",
    "requiredCredits": 120,
    "password": "password123"
  }'
```

### Test Login:
```bash
curl -X POST http://localhost:8084/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "rollNo": 12345,
    "password": "password123"
  }'
```

## 🚨 Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## 🔄 Development

- **Auto-restart**: Use `npm run dev` for development
- **Logging**: Console logs for debugging
- **Database**: Automatic table creation on startup
- **CORS**: Configured for localhost development

## 📝 License

MIT License - see LICENSE file for details








