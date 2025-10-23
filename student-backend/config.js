module.exports = {
  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'student_management',
    port: process.env.DB_PORT || 3306
  },

  // Server Configuration
  server: {
    port: process.env.PORT || 8084,
    environment: process.env.NODE_ENV || 'development'
  },

  // Security Configuration
  security: {
    bcryptRounds: 12,
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key_here'
  },

  // CORS Configuration
  cors: {
    origins: [
      'http://localhost:4200',
      'http://localhost:51242',
      'http://localhost:3000'
    ]
  }
};








