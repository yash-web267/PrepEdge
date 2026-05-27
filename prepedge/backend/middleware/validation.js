const { body, validationResult } = require('express-validator');

// Signup validation rules
const validateSignup = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

// Login validation rules
const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

// DSA progress validation
const validateDSAProgress = [
    body('topic')
        .isIn(['arrays', 'strings', 'linkedlist', 'trees', 'graphs', 'dp'])
        .withMessage('Invalid topic'),
    body('difficulty')
        .isIn(['easy', 'medium', 'hard'])
        .withMessage('Invalid difficulty')
];

// Interview submission validation
const validateInterview = [
    body('answer')
        .isLength({ min: 20 })
        .withMessage('Answer must be at least 20 characters long'),
    body('questionId')
        .isInt()
        .withMessage('Invalid question ID')
];

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            errors: errors.array(),
            message: 'Validation failed'
        });
    }
    next();
};

module.exports = {
    validateSignup,
    validateLogin,
    validateDSAProgress,
    validateInterview,
    handleValidationErrors
};