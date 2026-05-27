const User = require('../models/User');

const questions = [
    { id: 1, question: "Explain the difference between let, const, and var in JavaScript.", difficulty: "easy", category: "JavaScript", expectedKeywords: ["scope", "hoisting", "redeclare", "reassign"] },
    { id: 2, question: "What is the event loop in JavaScript?", difficulty: "medium", category: "JavaScript", expectedKeywords: ["call stack", "callback queue", "async", "non-blocking"] },
    { id: 3, question: "Explain closures in JavaScript with an example.", difficulty: "medium", category: "JavaScript", expectedKeywords: ["inner function", "outer function", "lexical scope", "encapsulation"] },
    { id: 4, question: "What is the time complexity of quicksort in worst case?", difficulty: "medium", category: "DSA", expectedKeywords: ["O(n²)", "pivot", "partition"] },
    { id: 5, question: "Explain how React's virtual DOM works.", difficulty: "hard", category: "React", expectedKeywords: ["diffing", "reconciliation", "real DOM", "efficient updates"] },
    { id: 6, question: "What is the difference between SQL and NoSQL databases?", difficulty: "easy", category: "Database", expectedKeywords: ["schema", "relations", "scalability", "structure"] },
    { id: 7, question: "Explain the concept of middleware in Express.js.", difficulty: "medium", category: "Backend", expectedKeywords: ["request", "response", "next", "pipeline"] }
];

// @desc    Get random interview question
// @route   GET /api/interview/random-question
// @access  Private
const getRandomQuestion = async (req, res) => {
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    res.json({
        ...randomQuestion,
        expectedKeywords: undefined // Don't send keywords to client
    });
};

// @desc    Submit interview answer and get score
// @route   POST /api/interview/submit
// @access  Private
const submitAnswer = async (req, res) => {
    try {
        const { questionId, answer, timeSpent } = req.body;
        const user = await User.findById(req.userId);
        
        const question = questions.find(q => q.id === questionId);
        if (!question) {
            return res.status(400).json({ error: 'Invalid question ID' });
        }
        
        // Advanced scoring algorithm
        let score = 5; // Base score
        let strengths = [];
        let improvements = [];
        
        // Check answer length
        if (answer.length > 200) {
            score += 2;
            strengths.push("Detailed explanation");
        } else if (answer.length < 50) {
            score -= 1;
            improvements.push("Provide more detailed answers");
        }
        
        // Check for keywords
        const matchedKeywords = question.expectedKeywords.filter(keyword => 
            answer.toLowerCase().includes(keyword.toLowerCase())
        );
        score += matchedKeywords.length;
        if (matchedKeywords.length > 0) {
            strengths.push(`Used key concepts: ${matchedKeywords.join(', ')}`);
        } else {
            improvements.push(`Include technical terms like: ${question.expectedKeywords.join(', ')}`);
        }
        
        // Check response time
        if (timeSpent < 120) {
            score += 1;
            strengths.push("Quick response time");
        } else if (timeSpent > 300) {
            score -= 1;
            improvements.push("Try to answer more quickly");
        }
        
        // Check structure
        if (answer.includes('first') || answer.includes('second') || answer.includes('finally')) {
            score += 1;
            strengths.push("Structured answer");
        }
        
        // Cap score between 0 and 10
        score = Math.min(10, Math.max(0, score));
        
        // Generate feedback
        let feedback = "";
        if (score >= 8) {
            feedback = "Excellent answer! You demonstrated strong understanding.";
        } else if (score >= 6) {
            feedback = "Good answer! Keep practicing to perfect your responses.";
        } else {
            feedback = "Good effort! Review the key concepts and try again.";
        }
        
        // Save interview result
        user.mockInterviews.push({
            date: new Date(),
            score: score,
            feedback: feedback,
            difficulty: question.difficulty,
            questionId: questionId,
            timeSpent: timeSpent
        });
        
        await user.save();
        
        res.json({
            success: true,
            score: score,
            feedback: feedback,
            strengths: strengths,
            improvements: improvements,
            category: question.category
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get interview history
// @route   GET /api/interview/history
// @access  Private
const getHistory = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const history = user.mockInterviews.sort((a, b) => b.date - a.date);
        
        res.json({
            total: history.length,
            averageScore: user.avgInterviewScore,
            interviews: history
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getRandomQuestion, submitAnswer, getHistory };