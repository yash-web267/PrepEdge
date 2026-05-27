const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    leetcodeId: String,
    leetcodeLink: String,
    description: String,
    solution: String,
    hints: [String],
    companies: [String],
    frequency: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
problemSchema.index({ topic: 1, difficulty: 1 });
problemSchema.index({ companies: 1 });

module.exports = mongoose.model('Problem', problemSchema);