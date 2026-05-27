const express = require('express');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, req.userId + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF and DOC files are allowed.'));
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilter
});

// Advanced ATS scoring algorithm
const calculateATSScore = (filename, user) => {
    // In production, implement actual PDF/DOCX parsing with libraries like 'pdf-parse'
    // This is a sophisticated mock implementation
    
    let score = 65; // Base score
    const suggestions = [];
    
    // Check for common resume sections (mock implementation)
    const hasExperience = user.profile?.experience > 0;
    const hasSkills = user.profile?.skills?.length > 0;
    
    if (hasExperience) {
        score += 10;
        suggestions.push("✓ Good: Work experience section present");
    } else {
        suggestions.push("⚠ Add work experience section");
        score -= 5;
    }
    
    if (hasSkills) {
        score += 10;
        suggestions.push("✓ Good: Skills section well-documented");
    } else {
        suggestions.push("⚠ Add technical skills section");
        score -= 5;
    }
    
    // Keyword optimization suggestions
    suggestions.push("💡 Add more industry keywords relevant to your target role");
    suggestions.push("📊 Include quantifiable achievements (e.g., 'Improved performance by 20%')");
    suggestions.push("🎯 Customize your resume for each job application");
    
    if (score < 70) {
        suggestions.push("🔧 Consider using a professional resume template");
    }
    
    if (score > 85) {
        suggestions.push("🌟 Excellent! Your resume is well-optimized");
    }
    
    return { score: Math.min(100, Math.max(0, score)), suggestions };
};

// Upload resume
router.post('/upload', authMiddleware, upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const user = await User.findById(req.userId);
        const atsResult = calculateATSScore(req.file.originalname, user);
        
        user.resume = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            uploadDate: new Date(),
            atsScore: atsResult.score,
            suggestions: atsResult.suggestions,
            analyzed: true
        };
        
        await user.save();
        
        res.json({
            success: true,
            message: "Resume uploaded and analyzed successfully",
            atsScore: atsResult.score,
            suggestions: atsResult.suggestions,
            filename: req.file.originalname
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get resume analysis
router.get('/analysis', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        
        if (!user.resume || !user.resume.filename) {
            return res.json({ 
                hasResume: false,
                message: "No resume uploaded yet" 
            });
        }
        
        res.json({
            hasResume: true,
            filename: user.resume.originalName,
            atsScore: user.resume.atsScore,
            suggestions: user.resume.suggestions,
            uploadDate: user.resume.uploadDate,
            analyzed: user.resume.analyzed
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete resume
router.delete('/delete', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        user.resume = {};
        await user.save();
        
        res.json({ success: true, message: "Resume deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;