const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const app = express();
const PORT = 8000;
const SECRET_KEY = 'your_secret_key';

// Database Configuration
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'SchoolSystem',
});

// Middleware
app.use(bodyParser.json());

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  const { firstName, lastName, email, password, userType } = req.body;

  // Validate input
  if (!firstName || !lastName || !email || !password || !userType) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Check if the email already exists
  const checkQuery = `SELECT * FROM tblUsers WHERE Email = ?`;
  db.query(checkQuery, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error.' });
    }
    if (results.length > 0) {
      return res.status(400).json({ error: 'Email already exists.' });
    }

    // Hash the password and insert the user
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO tblUsers (FirstName, LastName, Email, Password, UserType, CreationDateTime) VALUES (?, ?, ?, ?, ?, NOW())`;

    db.query(query, [firstName, lastName, email, hashedPassword, userType], (err, result) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.status(201).json({ message: 'User registered successfully.' });
    });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const query = `SELECT * FROM tblUsers WHERE Email = ?`;

  db.query(query, [email], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.Password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { userId: user.UserID, email: user.Email, userType: user.UserType },
      SECRET_KEY,
      { expiresIn: '1h' }
    );
    res.status(200).json({
      token,
      user: {
        firstName: user.FirstName,
        lastName: user.LastName,
        userType: user.UserType,
      },
    });
  });
});

// Middleware to verify JWT tokens
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header is missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded; // Attach decoded token data to the request
    next();
  });
}

// Example protected route
app.get('/api/protected', verifyToken, (req, res) => {
  res.status(200).json({ message: 'This is a protected route.', user: req.user });
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});