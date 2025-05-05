// Importing required libraries
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, '../CSC 3100 Final Project/Project')));
const PORT = 8000;
const SECRET_KEY = 'your_secret_key';

const dbSource = "SchoolSystem.sqlite"; // SQLite database file
const db = new sqlite3.Database(dbSource, (err) => {
    if (err) {
        console.error("Error connecting to SQLite database:", err.message);
    } else {
        console.log("Connected to SQLite database:", dbSource);
    }
});

// Middleware
app.use(cors());
app.use(express.json());

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

// Authentication Endpoints
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    const query = `SELECT * FROM tblUsers WHERE Email = ?`;
    db.get(query, [email], async (err, user) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ error: 'Database error.' });
        }
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

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

app.post('/api/auth/logout', (req, res) => {
    // Optional: Clear session or token
    res.status(200).json({ message: 'Logout successful.' });
});

// Courses Endpoints
app.get('/api/courses', verifyToken, (req, res) => {
    const query = `SELECT * FROM tblCourses`;
    db.all(query, [], (err, courses) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ error: 'Failed to fetch courses.' });
        }
        res.status(200).json(courses);
    });
});

app.post('/api/courses', verifyToken, (req, res) => {
    const { courseName, courseCode, semester, description } = req.body;

    if (!courseName || !courseCode || !semester) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const query = `INSERT INTO tblCourses (CourseName, CourseCode, Semester, Description) VALUES (?, ?, ?, ?)`;
    db.run(query, [courseName, courseCode, semester, description], function (err) {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ error: 'Failed to create course.' });
        }
        res.status(201).json({ message: 'Course created successfully.', courseID: this.lastID });
    });
});

app.put('/api/courses/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { courseName, courseCode, semester, description } = req.body;

    const query = `UPDATE tblCourses SET CourseName = ?, CourseCode = ?, Semester = ?, Description = ? WHERE CourseID = ?`;
    db.run(query, [courseName, courseCode, semester, description, id], function (err) {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ error: 'Failed to update course.' });
        }
        res.status(200).json({ message: 'Course updated successfully.' });
    });
});

app.delete('/api/courses/:id', verifyToken, (req, res) => {
    const { id } = req.params;

    const query = `DELETE FROM tblCourses WHERE CourseID = ?`;
    db.run(query, [id], function (err) {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ error: 'Failed to delete course.' });
        }
        res.status(200).json({ message: 'Course deleted successfully.' });
    });
});

// Teams Endpoints
app.get('/api/courses/:courseId/teams', verifyToken, (req, res) => {
    const { courseId } = req.params;

    const query = `SELECT * FROM tblCourseGroups WHERE CourseID = ?`;
    db.all(query, [courseId], (err, teams) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ error: 'Failed to fetch teams.' });
        }
        res.status(200).json(teams);
    });
});

app.post('/api/courses/:courseId/teams', verifyToken, (req, res) => {
    const { courseId } = req.params;
    const { groupName } = req.body;

    const query = `INSERT INTO tblCourseGroups (CourseID, GroupName) VALUES (?, ?)`;
    db.run(query, [courseId, groupName], function (err) {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ error: 'Failed to create team.' });
        }
        res.status(201).json({ message: 'Team created successfully.', groupID: this.lastID });
    });
});

app.delete('/api/teams/:teamId', verifyToken, (req, res) => {
    const { teamId } = req.params;

    const query = `DELETE FROM tblCourseGroups WHERE GroupID = ?`;
    db.run(query, [teamId], function (err) {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ error: 'Failed to delete team.' });
        }
        res.status(200).json({ message: 'Team deleted successfully.' });
    });
});

// Reviews Endpoints
app.get('/api/reviews', verifyToken, (req, res) => {
    const { courseId } = req.query;

    const query = courseId
        ? `SELECT * FROM tblAssessments WHERE CourseID = ?`
        : `SELECT * FROM tblAssessments`;
    db.all(query, courseId ? [courseId] : [], (err, reviews) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ error: 'Failed to fetch reviews.' });
        }
        res.status(200).json(reviews);
    });
});

app.post('/api/reviews', verifyToken, (req, res) => {
    const { courseId, groupId, assessmentType, startDate, endDate } = req.body;

    const query = `INSERT INTO tblAssessments (CourseID, GroupID, AssessmentType, StartDate, EndDate) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [courseId, groupId, assessmentType, startDate, endDate], function (err) {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ error: 'Failed to create review.' });
        }
        res.status(201).json({ message: 'Review created successfully.', assessmentID: this.lastID });
    });
});

app.put('/api/reviews/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { courseId, groupId, assessmentType, startDate, endDate } = req.body;

    const query = `UPDATE tblAssessments SET CourseID = ?, GroupID = ?, AssessmentType = ?, StartDate = ?, EndDate = ? WHERE AssessmentID = ?`;
    db.run(query, [courseId, groupId, assessmentType, startDate, endDate, id], function (err) {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ error: 'Failed to update review.' });
        }
        res.status(200).json({ message: 'Review updated successfully.' });
    });
});

app.delete('/api/reviews/:id', verifyToken, (req, res) => {
    const { id } = req.params;

    const query = `DELETE FROM tblAssessments WHERE AssessmentID = ?`;
    db.run(query, [id], function (err) {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ error: 'Failed to delete review.' });
        }
        res.status(200).json({ message: 'Review deleted successfully.' });
    });
});

// Reports Endpoints
app.get('/api/reports/:courseId', verifyToken, (req, res) => {
    const { courseId } = req.params;

    const query = `SELECT * FROM tblAssessments WHERE CourseID = ?`;
    db.all(query, [courseId], (err, reports) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ error: 'Failed to fetch reports.' });
        }
        res.status(200).json(reports);
    });
});

app.get('/api/reports/:courseId/team/:teamId', verifyToken, (req, res) => {
    const { courseId, teamId } = req.params;

    const query = `SELECT * FROM tblAssessments WHERE CourseID = ? AND GroupID = ?`;
    db.all(query, [courseId, teamId], (err, reports) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ error: 'Failed to fetch team reports.' });
        }
        res.status(200).json(reports);
    });
});

// Default Route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Backend is running!' });
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});