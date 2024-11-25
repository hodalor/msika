const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error('Only image files (jpg, jpeg, png, gif) are allowed!'), false);
  }
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Error handling middleware
const handleUpload = (req, res, next) => {
  const uploader = upload.single('image');

  uploader(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size cannot be larger than 5MB!'
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message
      });
    } else if (err) {
      // An unknown error occurred
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    // Everything went fine
    next();
  });
};

// Upload single image
router.post('/', auth, handleUpload, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    // Return the complete URL for the image
    const imageUrl = `${process.env.REACT_APP_API_URL}/uploads/${req.file.filename}`;
    console.log('Image uploaded:', imageUrl);
    
    res.json({ 
      success: true,
      imageUrl,
      message: 'Image uploaded successfully' 
    });
  } catch (error) {
    console.error('Upload error:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path); // Clean up on error
    }
    res.status(500).json({ 
      success: false,
      message: 'Error uploading file',
      error: error.message 
    });
  }
});

module.exports = router; 