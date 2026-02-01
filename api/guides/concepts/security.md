---
title: "Web Security Fundamentals"
subTitle: "Protecting Your Applications"
excerpt: "Security isn't optional - it's essential."
featureImage: "/img/security.png"
date: "2026-02-01"
order: 809
---

# Explanation

## Why Security Matters

One security breach can destroy user trust and your business. Understanding common vulnerabilities and how to prevent them is essential for every developer.

### OWASP Top 10

1. Broken Access Control
2. Cryptographic Failures
3. Injection
4. Insecure Design
5. Security Misconfiguration
6. Vulnerable Components
7. Authentication Failures
8. Data Integrity Failures
9. Security Logging Failures
10. Server-Side Request Forgery

---

# Demonstration

## Example 1: SQL Injection Prevention

```javascript
// VULNERABLE - Never do this!
const query = `SELECT * FROM users WHERE email = '${email}'`;
// Input: ' OR '1'='1
// Result: SELECT * FROM users WHERE email = '' OR '1'='1'

// SAFE - Use parameterized queries
// PostgreSQL with pg
const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
);

// MySQL with mysql2
const [rows] = await connection.execute(
    'SELECT * FROM users WHERE email = ?',
    [email]
);

// MongoDB - still validate input!
// VULNERABLE
const user = await User.findOne({ email: req.body.email });
// Input: { "$ne": null }
// Result: Returns first user!

// SAFE - Validate and sanitize
const email = String(req.body.email).toLowerCase().trim();
if (!isValidEmail(email)) {
    throw new Error('Invalid email');
}
const user = await User.findOne({ email });

// ORM with TypeORM
const user = await userRepository.findOne({
    where: { email }  // Automatically parameterized
});
```

## Example 2: XSS Prevention

```javascript
// VULNERABLE - Inserting user content directly
document.innerHTML = `<div>${userInput}</div>`;
// Input: <script>alert('XSS')</script>

// SAFE - Use textContent for plain text
document.querySelector('.message').textContent = userInput;

// SAFE - Escape HTML entities
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, char => map[char]);
}

document.innerHTML = `<div>${escapeHtml(userInput)}</div>`;

// React automatically escapes
function Comment({ text }) {
    return <div>{text}</div>;  // Safe!
}

// DANGEROUS - Only use when absolutely necessary
function RichContent({ html }) {
    // Sanitize first!
    const clean = DOMPurify.sanitize(html);
    return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}

// Content Security Policy header
// Prevents inline scripts
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
    );
    next();
});
```

## Example 3: CSRF Protection

```javascript
// Express CSRF protection
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

app.get('/form', csrfProtection, (req, res) => {
    res.render('form', { csrfToken: req.csrfToken() });
});

app.post('/submit', csrfProtection, (req, res) => {
    // Valid CSRF token required
    res.json({ success: true });
});

// HTML form with token
// <form method="POST" action="/submit">
//     <input type="hidden" name="_csrf" value="{{csrfToken}}">
//     <!-- form fields -->
// </form>

// For APIs - use SameSite cookies
app.use(session({
    cookie: {
        sameSite: 'strict',  // Prevents CSRF for APIs
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }
}));

// Or use custom headers for AJAX
// Client sends: X-Requested-With: XMLHttpRequest
// Server validates header presence
app.use((req, res, next) => {
    if (req.method !== 'GET' && !req.xhr) {
        return res.status(403).json({ error: 'CSRF validation failed' });
    }
    next();
});
```

## Example 4: Secure Authentication

```javascript
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Password hashing
async function hashPassword(password) {
    const saltRounds = 12;  // Adjust based on your security needs
    return bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}

// Secure JWT implementation
const JWT_SECRET = process.env.JWT_SECRET;  // Never hardcode!
const JWT_EXPIRES = '15m';
const REFRESH_EXPIRES = '7d';

function generateTokens(userId) {
    const accessToken = jwt.sign(
        { userId, type: 'access' },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES }
    );

    const refreshToken = jwt.sign(
        { userId, type: 'refresh' },
        JWT_SECRET,
        { expiresIn: REFRESH_EXPIRES }
    );

    return { accessToken, refreshToken };
}

// Rate limiting for login
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 5,  // 5 attempts
    message: { error: 'Too many login attempts. Try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});

app.post('/login', loginLimiter, async (req, res) => {
    // Login logic
});

// Account lockout
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000;  // 30 minutes

async function handleLogin(email, password) {
    const user = await User.findOne({ email });

    // Check lockout
    if (user?.lockoutUntil && user.lockoutUntil > Date.now()) {
        throw new Error('Account locked. Try again later.');
    }

    if (!user || !await verifyPassword(password, user.passwordHash)) {
        if (user) {
            user.failedAttempts = (user.failedAttempts || 0) + 1;

            if (user.failedAttempts >= MAX_FAILED_ATTEMPTS) {
                user.lockoutUntil = Date.now() + LOCKOUT_DURATION;
            }

            await user.save();
        }
        throw new Error('Invalid credentials');
    }

    // Reset on successful login
    user.failedAttempts = 0;
    user.lockoutUntil = null;
    await user.save();

    return generateTokens(user.id);
}
```

## Example 5: Security Headers

```javascript
const helmet = require('helmet');

app.use(helmet());

// Or configure individually
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://api.example.com'],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
    }
}));

app.use(helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
}));

app.use(helmet.noSniff());
app.use(helmet.frameguard({ action: 'deny' }));

// Manually set additional headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=()');
    next();
});
```

## Example 6: Input Validation

```javascript
const { body, validationResult } = require('express-validator');
const validator = require('validator');

// Express-validator middleware
const validateUser = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email required'),

    body('password')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain uppercase, lowercase, and number'),

    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .escape()  // Prevent XSS
        .withMessage('Name must be 2-50 characters'),

    body('age')
        .optional()
        .isInt({ min: 0, max: 150 })
        .toInt(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

app.post('/users', validateUser, createUser);

// Manual validation
function validateInput(data) {
    const errors = [];

    if (!data.email || !validator.isEmail(data.email)) {
        errors.push('Invalid email');
    }

    if (!data.url || !validator.isURL(data.url, {
        protocols: ['https'],
        require_protocol: true
    })) {
        errors.push('Invalid URL (HTTPS required)');
    }

    // Prevent path traversal
    if (data.filename && data.filename.includes('..')) {
        errors.push('Invalid filename');
    }

    return errors;
}
```

**Key Takeaways:**
- Always use parameterized queries
- Escape output, not just input
- Use secure, HttpOnly cookies
- Implement rate limiting
- Set security headers

---

# Imitation

### Challenge 1: Implement Secure File Upload

**Task:** Create a secure file upload endpoint.

<details>
<summary>Solution</summary>

```javascript
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Allowed file types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        // Random filename to prevent overwrites
        const random = crypto.randomBytes(16).toString('hex');
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${random}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: MAX_SIZE },
    fileFilter: (req, file, cb) => {
        // Check MIME type
        if (!ALLOWED_TYPES.includes(file.mimetype)) {
            return cb(new Error('Invalid file type'));
        }

        // Check extension
        const ext = path.extname(file.originalname).toLowerCase();
        if (!['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
            return cb(new Error('Invalid extension'));
        }

        cb(null, true);
    }
});

app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Verify file is actually an image
    const fileBuffer = await fs.promises.readFile(req.file.path);
    const fileType = await FileType.fromBuffer(fileBuffer);

    if (!fileType || !ALLOWED_TYPES.includes(fileType.mime)) {
        await fs.promises.unlink(req.file.path);
        return res.status(400).json({ error: 'Invalid file content' });
    }

    res.json({ filename: req.file.filename });
});
```

</details>

---

# Practice

### Exercise 1: Security Audit
**Difficulty:** Intermediate

Audit a codebase for:
- SQL injection vulnerabilities
- XSS vulnerabilities
- Insecure dependencies

### Exercise 2: Implement 2FA
**Difficulty:** Advanced

Add two-factor authentication:
- TOTP generation
- Backup codes
- Recovery flow

---

## Summary

**What you learned:**
- Preventing injection attacks
- XSS and CSRF protection
- Secure authentication
- Security headers
- Input validation

**Next Steps:**
- Read: [Authentication Patterns](/api/guides/concepts/authentication)
- Practice: Run OWASP ZAP scan
- Explore: Bug bounty programs

---

## Resources

- [OWASP](https://owasp.org/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
