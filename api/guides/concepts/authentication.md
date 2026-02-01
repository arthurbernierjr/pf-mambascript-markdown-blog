---
title: "Authentication Fundamentals"
subTitle: "Verifying User Identity"
excerpt: "Security is not a feature - it's a requirement."
featureImage: "/img/authentication.png"
date: "2026-02-01"
order: 803
---

# Explanation

## What is Authentication?

Authentication (AuthN) answers "Who are you?" while Authorization (AuthZ) answers "What can you do?" Authentication verifies identity before granting access.

### Key Concepts

- **Session-Based**: Server stores user state
- **Token-Based**: Client stores JWT token
- **OAuth**: Delegated authentication (Login with Google)
- **Multi-Factor**: Something you know + have + are

### Session vs JWT

| Feature | Sessions | JWT |
|---------|----------|-----|
| Storage | Server-side | Client-side |
| Scalability | Requires shared state | Stateless |
| Revocation | Easy | Harder |
| Size | Cookie is small | Token can be large |

---

# Demonstration

## Example 1: Session-Based Authentication

```javascript
// server.js - Express with sessions
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000  // 24 hours
    }
}));

// Mock user database
const users = new Map();

// Register
app.post('/auth/register', async (req, res) => {
    const { email, password } = req.body;

    if (users.has(email)) {
        return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
        id: Date.now().toString(),
        email,
        password: hashedPassword
    };

    users.set(email, user);

    // Auto-login after registration
    req.session.userId = user.id;
    res.status(201).json({ user: { id: user.id, email } });
});

// Login
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    const user = users.get(email);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.userId = user.id;
    res.json({ user: { id: user.id, email } });
});

// Logout
app.post('/auth/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logged out' });
});

// Auth middleware
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    next();
};

// Protected route
app.get('/profile', requireAuth, (req, res) => {
    const user = [...users.values()].find(u => u.id === req.session.userId);
    res.json({ user: { id: user.id, email: user.email } });
});
```

## Example 2: JWT Authentication

```javascript
// auth.js - JWT implementation
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = '24h';

const users = new Map();

// Generate tokens
function generateTokens(userId) {
    const accessToken = jwt.sign(
        { userId },
        JWT_SECRET,
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        { userId, type: 'refresh' },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
}

// Register
app.post('/auth/register', async (req, res) => {
    const { email, password } = req.body;

    if (users.has(email)) {
        return res.status(400).json({ error: 'Email exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
        id: Date.now().toString(),
        email,
        password: hashedPassword
    };

    users.set(email, user);

    const tokens = generateTokens(user.id);
    res.status(201).json({
        user: { id: user.id, email },
        ...tokens
    });
});

// Login
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    const user = users.get(email);
    if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const tokens = generateTokens(user.id);
    res.json({
        user: { id: user.id, email },
        ...tokens
    });
});

// Refresh token
app.post('/auth/refresh', (req, res) => {
    const { refreshToken } = req.body;

    try {
        const payload = jwt.verify(refreshToken, JWT_SECRET);

        if (payload.type !== 'refresh') {
            throw new Error('Invalid token type');
        }

        const tokens = generateTokens(payload.userId);
        res.json(tokens);
    } catch (error) {
        res.status(401).json({ error: 'Invalid refresh token' });
    }
});

// Auth middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];  // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.userId = payload.userId;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Protected route
app.get('/profile', authenticateToken, (req, res) => {
    const user = [...users.values()].find(u => u.id === req.userId);
    res.json({ user: { id: user.id, email: user.email } });
});
```

## Example 3: OAuth 2.0 (Google Login)

```javascript
// oauth.js - Google OAuth with Passport
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    // Find or create user
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
        user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            avatar: profile.photos[0]?.value
        });
    }

    return done(null, user);
}));

// Routes
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Generate JWT or create session
        const token = generateToken(req.user.id);
        res.redirect(`/auth/success?token=${token}`);
    }
);

// Frontend implementation
// <a href="/auth/google">Login with Google</a>
```

## Example 4: Password Security

```javascript
// security.js - Password best practices
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Hashing passwords
async function hashPassword(password) {
    // Salt rounds (10-12 recommended)
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}

// Password strength validation
function validatePassword(password) {
    const errors = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain a number');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
        errors.push('Password must contain a special character');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

// Password reset tokens
function generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
}

async function createPasswordReset(email) {
    const user = await User.findOne({ email });
    if (!user) {
        // Don't reveal if email exists
        return { message: 'If email exists, reset link sent' };
    }

    const token = generateResetToken();
    const expires = new Date(Date.now() + 3600000);  // 1 hour

    await PasswordReset.create({
        userId: user.id,
        token: await hashPassword(token),  // Hash the token too!
        expires
    });

    // Send email with reset link
    await sendEmail({
        to: email,
        subject: 'Password Reset',
        body: `Reset link: https://app.com/reset?token=${token}`
    });

    return { message: 'If email exists, reset link sent' };
}

async function resetPassword(token, newPassword) {
    const reset = await PasswordReset.findOne({
        expires: { $gt: new Date() }
    });

    if (!reset || !await verifyPassword(token, reset.token)) {
        throw new Error('Invalid or expired token');
    }

    await User.updateOne(
        { _id: reset.userId },
        { password: await hashPassword(newPassword) }
    );

    await PasswordReset.deleteOne({ _id: reset._id });

    return { message: 'Password updated' };
}
```

**Key Takeaways:**
- Never store plain-text passwords
- Use bcrypt with appropriate salt rounds
- JWTs are stateless but harder to revoke
- Sessions need server-side storage
- Always validate password strength

---

# Imitation

### Challenge 1: Add Rate Limiting

**Task:** Implement rate limiting for login attempts.

<details>
<summary>Solution</summary>

```javascript
const rateLimit = new Map();

function checkRateLimit(ip, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    const now = Date.now();
    const record = rateLimit.get(ip) || { attempts: 0, windowStart: now };

    // Reset window if expired
    if (now - record.windowStart > windowMs) {
        record.attempts = 0;
        record.windowStart = now;
    }

    record.attempts++;
    rateLimit.set(ip, record);

    if (record.attempts > maxAttempts) {
        const retryAfter = Math.ceil((record.windowStart + windowMs - now) / 1000);
        return { allowed: false, retryAfter };
    }

    return { allowed: true };
}

app.post('/auth/login', async (req, res) => {
    const { allowed, retryAfter } = checkRateLimit(req.ip);

    if (!allowed) {
        return res.status(429).json({
            error: 'Too many attempts',
            retryAfter
        });
    }

    // ... rest of login logic
});
```

</details>

### Challenge 2: Implement 2FA

**Task:** Add TOTP-based two-factor authentication.

<details>
<summary>Solution</summary>

```javascript
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

// Enable 2FA
app.post('/auth/2fa/enable', authenticateToken, async (req, res) => {
    const secret = speakeasy.generateSecret({
        name: `MyApp:${req.user.email}`
    });

    // Store secret (encrypted in production)
    await User.updateOne(
        { _id: req.userId },
        { twoFactorSecret: secret.base32, twoFactorEnabled: false }
    );

    // Generate QR code
    const qrCode = await qrcode.toDataURL(secret.otpauth_url);

    res.json({ secret: secret.base32, qrCode });
});

// Verify and activate 2FA
app.post('/auth/2fa/verify', authenticateToken, async (req, res) => {
    const { token } = req.body;
    const user = await User.findById(req.userId);

    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token
    });

    if (!verified) {
        return res.status(400).json({ error: 'Invalid code' });
    }

    await User.updateOne(
        { _id: req.userId },
        { twoFactorEnabled: true }
    );

    res.json({ message: '2FA enabled' });
});

// Login with 2FA
app.post('/auth/login', async (req, res) => {
    const { email, password, twoFactorToken } = req.body;

    // Verify password...
    const user = await User.findOne({ email });

    if (user.twoFactorEnabled) {
        if (!twoFactorToken) {
            return res.json({ requiresTwoFactor: true });
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: twoFactorToken
        });

        if (!verified) {
            return res.status(401).json({ error: 'Invalid 2FA code' });
        }
    }

    // Generate tokens and respond...
});
```

</details>

---

# Practice

### Exercise 1: Magic Link Login
**Difficulty:** Intermediate

Implement passwordless login via email:
- Generate secure token
- Send email with login link
- Verify and create session

### Exercise 2: API Key Authentication
**Difficulty:** Advanced

Build API key authentication:
- Generate/revoke keys
- Rate limiting per key
- Usage tracking
- Key rotation

---

## Summary

**What you learned:**
- Session vs token-based auth
- Password hashing with bcrypt
- JWT implementation
- OAuth 2.0 basics
- Security best practices

**Next Steps:**
- Read: [Authorization Patterns](/api/guides/concepts/authorization)
- Practice: Build a complete auth system
- Explore: OAuth providers integration

---

## Resources

- [OWASP Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT.io](https://jwt.io/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
