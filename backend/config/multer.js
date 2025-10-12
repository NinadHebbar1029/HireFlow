const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  console.log('File upload attempt:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype
  });

  if (file.fieldname === 'resume') {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    // More comprehensive MIME type check for resumes
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const mimetypeValid = allowedMimeTypes.includes(file.mimetype);
    
    if (extname || mimetypeValid) {
      console.log('Resume file accepted:', file.originalname);
      return cb(null, true);
    } else {
      console.log('Resume file rejected:', file.originalname, file.mimetype);
      cb(new Error('Only PDF, DOC, and DOCX files are allowed for resumes'));
    }
  } else if (file.fieldname === 'profileImage' || file.fieldname === 'companyLogo' || file.fieldname === 'faceImage') {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    // More comprehensive MIME type check for images
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];
    const mimetypeValid = allowedMimeTypes.includes(file.mimetype);
    
    if (extname || mimetypeValid) {
      console.log('Image file accepted:', file.originalname);
      return cb(null, true);
    } else {
      console.log('Image file rejected:', file.originalname, file.mimetype);
      cb(new Error('Only JPEG, JPG, and PNG files are allowed for images'));
    }
  } else {
    console.log('Invalid field name:', file.fieldname);
    cb(new Error('Invalid field name'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;
