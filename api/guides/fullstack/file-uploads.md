---
title: "File Uploads"
subTitle: "Handling Files in Full-Stack Apps"
excerpt: "Upload files securely from frontend to backend to storage."
featureImage: "/img/file-uploads.png"
date: "2026-02-01"
order: 905
---

# Explanation

## File Upload Architecture

File uploads involve the frontend collecting files, the backend processing them, and storage saving them permanently. Each layer has security considerations.

### Upload Flow

```
Browser → API Server → Storage (S3/Cloud/Disk)
   ↑           ↓
   └─── Progress/Response
```

---

# Demonstration

## Example 1: Frontend File Input

```jsx
// Basic file input
function FileUpload() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        // Validate file
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError('File too large (max 5MB)');
            return;
        }

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
            setError('Invalid file type');
            return;
        }

        setFile(selectedFile);
        setError(null);

        // Create preview for images
        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleUpload = async () => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            console.log('Uploaded:', data.url);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
            />

            {preview && <img src={preview} alt="Preview" />}
            {error && <p className="error">{error}</p>}

            <button onClick={handleUpload} disabled={!file}>
                Upload
            </button>
        </div>
    );
}

// Drag and drop
function DragDropUpload({ onUpload }) {
    const [isDragging, setIsDragging] = useState(false);
    const dropRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragIn = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    };

    const handleDragOut = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onUpload(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    return (
        <div
            ref={dropRef}
            className={`drop-zone ${isDragging ? 'dragging' : ''}`}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            Drop files here or click to browse
            <input type="file" onChange={(e) => onUpload(e.target.files[0])} />
        </div>
    );
}
```

## Example 2: Upload with Progress

```javascript
// XMLHttpRequest for progress tracking
function uploadWithProgress(file, onProgress) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('file', file);

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                onProgress(percent);
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.response));
            } else {
                reject(new Error(`Upload failed: ${xhr.status}`));
            }
        });

        xhr.addEventListener('error', () => {
            reject(new Error('Upload failed'));
        });

        xhr.open('POST', '/api/upload');
        xhr.send(formData);
    });
}

// React component with progress
function UploadWithProgress() {
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (file) => {
        setUploading(true);
        setProgress(0);

        try {
            const result = await uploadWithProgress(file, setProgress);
            console.log('Uploaded:', result);
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <input
                type="file"
                onChange={(e) => handleUpload(e.target.files[0])}
                disabled={uploading}
            />

            {uploading && (
                <div className="progress-bar">
                    <div
                        className="progress"
                        style={{ width: `${progress}%` }}
                    />
                    <span>{progress}%</span>
                </div>
            )}
        </div>
    );
}
```

## Example 3: Backend (Express + Multer)

```javascript
const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = crypto.randomBytes(8).toString('hex');
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 5
    }
});

// Routes
const router = express.Router();

// Single file
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
        url: `/uploads/${req.file.filename}`,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
    });
});

// Multiple files
router.post('/upload/multiple', upload.array('files', 5), (req, res) => {
    const files = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        originalName: file.originalname,
        size: file.size
    }));

    res.json({ files });
});

// Error handling
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large' });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: 'Too many files' });
        }
    }

    res.status(400).json({ error: error.message });
});
```

## Example 4: Cloud Storage (S3)

```javascript
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Configure S3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

// Multer S3 storage
const upload = multer({
    storage: multerS3({
        s3,
        bucket: process.env.S3_BUCKET,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
            const folder = req.userId || 'uploads';
            const filename = `${folder}/${Date.now()}-${file.originalname}`;
            cb(null, filename);
        }
    }),
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Direct upload to S3 (presigned URL)
router.get('/upload/presigned', authenticate, async (req, res) => {
    const { filename, contentType } = req.query;
    const key = `uploads/${req.userId}/${Date.now()}-${filename}`;

    const params = {
        Bucket: process.env.S3_BUCKET,
        Key: key,
        ContentType: contentType,
        Expires: 300 // 5 minutes
    };

    try {
        const url = await s3.getSignedUrlPromise('putObject', params);
        res.json({
            uploadUrl: url,
            key,
            publicUrl: `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}`
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate upload URL' });
    }
});

// Frontend: Direct S3 upload
async function uploadToS3(file) {
    // Get presigned URL
    const { uploadUrl, publicUrl } = await fetch(
        `/api/upload/presigned?filename=${file.name}&contentType=${file.type}`
    ).then(r => r.json());

    // Upload directly to S3
    await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
    });

    return publicUrl;
}
```

## Example 5: Image Processing

```javascript
const sharp = require('sharp');
const path = require('path');

// Process uploaded image
async function processImage(inputPath, options = {}) {
    const {
        width = 800,
        height = 600,
        quality = 80,
        format = 'webp'
    } = options;

    const outputPath = inputPath.replace(
        path.extname(inputPath),
        `.${format}`
    );

    await sharp(inputPath)
        .resize(width, height, {
            fit: 'inside',
            withoutEnlargement: true
        })
        .toFormat(format, { quality })
        .toFile(outputPath);

    return outputPath;
}

// Generate thumbnails
async function generateThumbnails(inputPath) {
    const sizes = [
        { name: 'thumb', width: 150, height: 150 },
        { name: 'small', width: 320, height: 240 },
        { name: 'medium', width: 640, height: 480 }
    ];

    const results = {};

    for (const size of sizes) {
        const outputPath = inputPath.replace(
            /(\.[^.]+)$/,
            `-${size.name}$1`
        );

        await sharp(inputPath)
            .resize(size.width, size.height, {
                fit: 'cover',
                position: 'center'
            })
            .toFile(outputPath);

        results[size.name] = outputPath;
    }

    return results;
}

// Upload route with processing
router.post('/upload/image', upload.single('image'), async (req, res) => {
    try {
        // Process image
        const processed = await processImage(req.file.path, {
            width: 1200,
            format: 'webp'
        });

        // Generate thumbnails
        const thumbnails = await generateThumbnails(processed);

        // Delete original if different format
        if (processed !== req.file.path) {
            await fs.unlink(req.file.path);
        }

        res.json({
            url: `/uploads/${path.basename(processed)}`,
            thumbnails: Object.fromEntries(
                Object.entries(thumbnails).map(([key, value]) => [
                    key,
                    `/uploads/${path.basename(value)}`
                ])
            )
        });
    } catch (error) {
        res.status(500).json({ error: 'Image processing failed' });
    }
});
```

## Example 6: Chunked Uploads

```javascript
// Backend: Chunked upload
const uploadDir = 'uploads/chunks';

router.post('/upload/chunk', upload.single('chunk'), async (req, res) => {
    const { uploadId, chunkIndex, totalChunks, filename } = req.body;
    const chunkDir = path.join(uploadDir, uploadId);

    await fs.mkdir(chunkDir, { recursive: true });

    const chunkPath = path.join(chunkDir, `chunk-${chunkIndex}`);
    await fs.rename(req.file.path, chunkPath);

    // Check if all chunks received
    const files = await fs.readdir(chunkDir);
    if (files.length === parseInt(totalChunks)) {
        // Merge chunks
        const finalPath = path.join('uploads', `${uploadId}-${filename}`);
        const writeStream = fs.createWriteStream(finalPath);

        for (let i = 0; i < totalChunks; i++) {
            const chunk = await fs.readFile(path.join(chunkDir, `chunk-${i}`));
            writeStream.write(chunk);
        }

        writeStream.end();

        // Cleanup chunks
        await fs.rm(chunkDir, { recursive: true });

        res.json({
            status: 'complete',
            url: `/uploads/${path.basename(finalPath)}`
        });
    } else {
        res.json({
            status: 'pending',
            received: files.length,
            total: parseInt(totalChunks)
        });
    }
});

// Frontend: Chunked upload
async function uploadInChunks(file, chunkSize = 1024 * 1024) {
    const uploadId = crypto.randomUUID();
    const totalChunks = Math.ceil(file.size / chunkSize);

    for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('uploadId', uploadId);
        formData.append('chunkIndex', i);
        formData.append('totalChunks', totalChunks);
        formData.append('filename', file.name);

        const response = await fetch('/api/upload/chunk', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.status === 'complete') {
            return data.url;
        }
    }
}
```

**Key Takeaways:**
- Validate files on both frontend and backend
- Use presigned URLs for direct cloud uploads
- Process images server-side
- Support large files with chunked uploads
- Clean up temporary files

---

# Imitation

### Challenge 1: Build Avatar Upload

**Task:** Create an avatar upload with crop and resize.

<details>
<summary>Solution</summary>

```jsx
function AvatarUpload({ currentAvatar, onUpload }) {
    const [preview, setPreview] = useState(currentAvatar);
    const fileInputRef = useRef();

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate
        if (!file.type.startsWith('image/')) {
            alert('Please select an image');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);

        // Upload
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await fetch('/api/upload/avatar', {
            method: 'POST',
            body: formData
        });

        const { url } = await response.json();
        onUpload(url);
    };

    return (
        <div className="avatar-upload">
            <img
                src={preview || '/default-avatar.png'}
                alt="Avatar"
                onClick={() => fileInputRef.current.click()}
            />
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                hidden
            />
        </div>
    );
}
```

</details>

---

# Practice

### Exercise 1: Multi-File Upload
**Difficulty:** Intermediate

Build a gallery upload with drag-and-drop.

### Exercise 2: Video Upload
**Difficulty:** Advanced

Handle video uploads with transcoding queue.

---

## Summary

**What you learned:**
- Frontend file handling
- Progress tracking
- Backend processing with Multer
- Cloud storage integration
- Image processing

**Next Steps:**
- Read: [Security](/api/guides/concepts/security)
- Practice: Build a media library
- Explore: FFmpeg, Cloudinary

---

## Resources

- [Multer Documentation](https://github.com/expressjs/multer)
- [AWS S3 SDK](https://docs.aws.amazon.com/sdk-for-javascript/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
