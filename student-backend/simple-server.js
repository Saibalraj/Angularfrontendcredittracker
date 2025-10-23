const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 8084;

// Middleware
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:51242', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory storage for testing (replace with database later)
let students = [];
let nextId = 1;

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

    console.log('Registration request:', { rollNo, name, program, requiredCredits });

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
    const existingStudent = students.find(s => s.rollNo === rollNo);

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: 'Student with this roll number already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new student
    const newStudent = {
      id: nextId++,
      rollNo,
      name,
      program,
      requiredCredits,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    students.push(newStudent);

    // Return student data (without password)
    const { password: _, ...studentResponse } = newStudent;

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      student: studentResponse
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

    console.log('Login request for rollNo:', rollNo);

    // Validation
    if (!rollNo || !password) {
      return res.status(400).json({
        success: false,
        message: 'Roll number and password are required'
      });
    }

    // Find student by roll number
    const student = students.find(s => s.rollNo === rollNo);

    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid roll number or password'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, student.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid roll number or password'
      });
    }

    // Return student data (without password)
    const { password: _, ...studentResponse } = student;

    res.json({
      success: true,
      message: 'Login successful',
      student: studentResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

// Get all students endpoint
app.get('/api/students', (req, res) => {
  try {
    const studentsWithoutPasswords = students.map(({ password, ...student }) => student);

    res.json({
      success: true,
      students: studentsWithoutPasswords
    });
  } catch (error) {
    console.error('Get students error:', error);
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
  console.log(`📝 Students stored in memory (for testing)`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});








