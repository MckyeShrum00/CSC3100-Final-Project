// Backend Code (Note: Still in progress, not complete yet)
const express = require('express')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mysql = require('mysql2')
const app = express()
const PORT = 8000
const SECRET_KEY = 'your_secret_key'

// Database Configuration
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'your_password',
    database: 'SchoolSystem',
})

// Middleware
app.use(bodyParser.json())

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body

    // Validate input
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: 'All fields are required.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const query = `INSERT INTO tblUsers (FirstName, LastName, Email, Password, CreationDateTime) VALUES (?, ?, ?, ?, NOW())`

    db.query(query, [firstName, lastName, email, hashedPassword], (err, result) => {
        if (err) {
            return res.status(400).json({ error: err.message })
        }
        res.status(201).json({ message: 'User registered successfully.' })
    })
})

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body
    const query = `SELECT * FROM tblUsers WHERE Email = ?`

    db.query(query, [email], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password.' })
        }

        const user = results[0]
        const isPasswordValid = await bcrypt.compare(password, user.Password)

        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid email or password.' })
        }

        const token = jwt.sign({ userId: user.UserID, email: user.Email }, SECRET_KEY, { expiresIn: '1h' })
        res.status(200).json({ token, message: 'Login successful.' })
    })
})

// Middleware to verify JWT token
function verifyToken(req,res,next){
    const authHeader = req.headers.authorization
    if(!authHeader){
        return res.status(401).json({error:"Authorization header is missing"})
    }

    const strToken = authHeader.split(' ')[1]
    if(!strToken){
        return res.status(401).json({error:"Token is missing"})
    }
    
    jwt.verify(strToken, SECRET_KEY,(err,user) => {
        if(err){
            return res.status(401).json({error:"Invalid session identifier"})
        } else {
            req.user = user
            next()
        }
    })
}

// Course Management Routes
app.get('/api/courses',verifyToken, (req, res) => {
    const query = `SELECT * FROM tblCourses`
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message })
        }
        res.status(200).json(results)
    })
})

app.post('/api/courses',verifyToken, (req, res) => {
    const { courseName, courseNumber, courseSection, courseTerm, startDate, endDate } = req.body

    // Validate input
    if (!courseName || !courseNumber || !courseSection || !courseTerm || !startDate || !endDate) {
        return res.status(400).json({ error: 'All course fields are required.' })
    }

    const query = `INSERT INTO tblCourses (CourseName, CourseNumber, CourseSection, CourseTerm, StartDate, EndDate) VALUES (?, ?, ?, ?, ?, ?)`

    db.query(query, [courseName, courseNumber, courseSection, courseTerm, startDate, endDate], (err, result) => {
        if (err) {
            return res.status(400).json({ error: err.message })
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