// Importing required libraries
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const app = express()
app.use(express.static(path.join(__dirname, '../CSC 3100 Final Project/Project')))
const PORT = 8000
const SECRET_KEY = 'your_secret_key'

const dbSource = "SchoolSystem.sqlite" // SQLite database file
const db = new sqlite3.Database(dbSource, (err) => {
    if (err) {
        console.error("Error connecting to SQLite database:", err.message)
    } else {
        console.log("Connected to SQLite database:", dbSource)

        // Debug: List all tables in the database
        db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
            if (err) {
                console.error("Error fetching tables:", err.message)
            } else {
                console.log("Tables in database:", tables.map(table => table.name))
            }
        })
    }
})

// Middleware
app.use(cors())
app.use(express.json())

// User Registration
app.post('/api/auth/register', async (req, res) => {
    const { firstName, lastName, email, password, userType } = req.body

    // Validate input
    if (!firstName || !lastName || !email || !password || !userType) {
        return res.status(400).json({ error: 'All fields are required.' })
    }

    // Check if the email already exists
    const checkQuery = `SELECT * FROM tblUsers WHERE Email = ?`
    db.get(checkQuery, [email], async (err, user) => {
        if (err) {
            console.error("Database error:", err.message)
            return res.status(500).json({ error: 'Database error.' })
        }
        if (user) {
            return res.status(400).json({ error: 'Email already exists.' })
        }

        // Hash the password and insert the user
        const hashedPassword = await bcrypt.hash(password, 10)
        const insertQuery = `
            INSERT INTO tblUsers (FirstName, LastName, Email, Password, UserType, CreationDateTime)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
        `
        db.run(insertQuery, [firstName, lastName, email, hashedPassword, userType], function (err) {
            if (err) {
                console.error("Database error:", err.message)
                return res.status(500).json({ error: 'Failed to register user.' })
            }
            res.status(201).json({ message: 'User registered successfully.' })
        })
    })
})

// User Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' })
    }

    const query = `SELECT * FROM tblUsers WHERE Email = ?`
    db.get(query, [email], async (err, user) => {
        if (err) {
            console.error("Database error:", err.message)
            return res.status(500).json({ error: 'Database error.' })
        }
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password.' })
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.Password)
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid email or password.' })
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.UserID, email: user.Email, userType: user.UserType },
            SECRET_KEY,
            { expiresIn: '1h' }
        )
        res.status(200).json({
            token,
            user: {
                firstName: user.FirstName,
                lastName: user.LastName,
                userType: user.UserType,
            },
        })
    })
})

// Middleware to verify JWT tokens
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization']
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization header is missing or invalid' })
    }

    const token = authHeader.split(' ')[1]
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' })
        }
        req.user = decoded // Attach decoded token data to the request
        next()
    })
}

// Fetch All Courses
app.get('/api/courses', verifyToken, (req, res) => {
    const query = `SELECT * FROM tblCourses`
    db.all(query, [], (err, courses) => {
        if (err) {
            console.error("Database error:", err.message)
            return res.status(500).json({ error: 'Failed to fetch courses.' })
        }
        res.status(200).json(courses)
    })
})

// Add a New Course
app.post('/api/courses', verifyToken, (req, res) => {
    const { courseName, courseNumber, courseSection, courseTerm, startDate, endDate } = req.body

    // Validate input
    if (!courseName || !courseNumber || !courseSection || !courseTerm || !startDate || !endDate) {
        return res.status(400).json({ error: 'All fields are required.' })
    }

    const query = `
        INSERT INTO tblCourses (CourseName, CourseNumber, CourseSection, CourseTerm, StartDate, EndDate)
        VALUES (?, ?, ?, ?, ?, ?)
    `
    db.run(query, [courseName, courseNumber, courseSection, courseTerm, startDate, endDate], function (err) {
        if (err) {
            console.error("Database error:", err.message)
            return res.status(500).json({ error: 'Failed to add course.' })
        }
        res.status(201).json({ message: 'Course added successfully.' })
    })
})

// Default Route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Backend is running!' })
})

// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})