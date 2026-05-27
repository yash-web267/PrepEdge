const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    dsaProgress: {
        easy: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        hard: { type: Number, default: 0 },
        totalSolved: { type: Number, default: 0 },
        streak: { type: Number, default: 0 },
        lastActive: { type: Date, default: null },
        topics: {
            arrays: { type: Number, default: 0 },
            strings: { type: Number, default: 0 },
            linkedlist: { type: Number, default: 0 },
            trees: { type: Number, default: 0 },
            graphs: { type: Number, default: 0 },
            dp: { type: Number, default: 0 }
        }
    },
    mockInterviews: [{
        date: { type: Date, default: Date.now },
        score: { type: Number, min: 0, max: 10 },
        feedback: String,
        difficulty: String,
        questionId: Number,
        timeSpent: Number
    }],
    resume: {
        filename: String,
        originalName: String,
        uploadDate: Date,
        atsScore: { type: Number, default: 0 },
        suggestions: [String],
        analyzed: { type: Boolean, default: false }
    },
    profile: {
        avatar: String,
        targetRole: String,
        targetCompany: String,
        skills: [String],
        experience: Number,
        bio: String,
        completionPercentage: { type: Number, default: 0 }
    },
    skillGaps: [{
        skill: String,
        currentLevel: Number,
        requiredLevel: Number,
        priority: { type: String, enum: ['high', 'medium', 'low'] }
    }],
    roadmap: {
        weeklyPlan: [{
            week: Number,
            topics: [String],
            tasks: [String],
            completed: { type: Boolean, default: false },
            targetDate: Date
        }],
        generatedDate: Date,
        lastUpdated: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Virtual for total interviews
userSchema.virtual('totalInterviews').get(function() {
    return this.mockInterviews.length;
});

// Virtual for average interview score
userSchema.virtual('avgInterviewScore').get(function() {
    if (this.mockInterviews.length === 0) return 0;
    const sum = this.mockInterviews.reduce((acc, i) => acc + i.score, 0);
    return (sum / this.mockInterviews.length).toFixed(1);
});

module.exports = mongoose.model('User', userSchema);