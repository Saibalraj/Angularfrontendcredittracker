const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8084;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:51242', 'http://localhost:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'student_management',
  port: process.env.DB_PORT || 3306
};

let db;

// Initialize database connection
async function initDatabase() {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully');

    // Create database if it doesn't exist
    await db.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await db.execute(`USE ${dbConfig.database}`);

    // Create students table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS students (
        id INT PRIMARY KEY AUTO_INCREMENT,
        rollNo INT UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        program VARCHAR(100) NOT NULL,
        requiredCredits INT NOT NULL,
        password VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database and tables initialized');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

// Initialize database on startup
initDatabase();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Student Management API is running',
    timestamp: new Date().toISOString()
  });
});

// Student registration endpoint
app.post('/api/signup', async (req, res) => {
  try {
    const { rollNo, name, program, requiredCredits, password } = req.body;

    // Validation
    if (!rollNo || !name || !program || !requiredCredits || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if student already exists
    const [existingStudent] = await db.execute(
      'SELECT id FROM students WHERE rollNo = ?',
      [rollNo]
    );

    if (existingStudent.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Student with this roll number already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert new student
    const [result] = await db.execute(
      'INSERT INTO students (rollNo, name, program, requiredCredits, password) VALUES (?, ?, ?, ?, ?)',
      [rollNo, name, program, requiredCredits, hashedPassword]
    );

    // Return student data (without password)
    const [newStudent] = await db.execute(
      'SELECT id, rollNo, name, program, requiredCredits, createdAt FROM students WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      student: newStudent[0]
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
});

// Student login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { rollNo, password } = req.body;

    // Validation
    if (!rollNo || !password) {
      return res.status(400).json({
        success: false,
        message: 'Roll number and password are required'
      });
    }

    // Find student by roll number
    const [students] = await db.execute(
      'SELECT id, rollNo, name, program, requiredCredits, password, createdAt FROM students WHERE rollNo = ?',
      [rollNo]
    );

    if (students.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid roll number or password'
      });
    }

    const student = students[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, student.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid roll number or password'
      });
    }

    // Remove password from response
    delete student.password;

    res.json({
      success: true,
      message: 'Login successful',
      student: student
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

// Get all students endpoint (for admin purposes)
app.get('/api/students', async (req, res) => {
  try {
    const [students] = await db.execute(
      'SELECT id, rollNo, name, program, requiredCredits, createdAt FROM students ORDER BY createdAt DESC'
    );

    res.json({
      success: true,
      students: students
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get student by ID endpoint
app.get('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [students] = await db.execute(
      'SELECT id, rollNo, name, program, requiredCredits, createdAt FROM students WHERE id = ?',
      [id]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      student: students[0]
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  if (db) {
    await db.end();
    console.log('✅ Database connection closed');
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  if (db) {
    await db.end();
    console.log('✅ Database connection closed');
  }
  process.exit(0);
});








