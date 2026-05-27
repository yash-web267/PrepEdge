const express = require('express');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

router.get('/overview', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        
        // Calculate topic-wise progress percentages
        const topicWiseData = [];
        const topicTotals = {
            arrays: 50,
            strings: 30,
            linkedlist: 20,
            trees: 20,
            graphs: 15,
            dp: 15
        };
        
        for (const [topic, solved] of Object.entries(user.dsaProgress.topics)) {
            const total = topicTotals[topic] || 20;
            const percentage = Math.min(100, Math.floor((solved / total) * 100));
            topicWiseData.push({
                topic: topic.charAt(0).toUpperCase() + topic.slice(1),
                solved: solved,
                total: total,
                percentage: percentage
            });
        }
        
        // Sort by percentage (lowest first - weak areas)
        topicWiseData.sort((a, b) => a.percentage - b.percentage);
        
        // Get last 6 interviews for trend
        const interviewTrend = user.mockInterviews
            .sort((a, b) => a.date - b.date)
            .slice(-6)
            .map(interview => ({
                date: interview.date.toISOString().split('T')[0],
                score: interview.score
            }));
        
        // Identify strong and weak areas
        const strongAreas = [];
        const weakAreas = [];
        
        topicWiseData.forEach(topic => {
            if (topic.percentage >= 70) {
                strongAreas.push(topic.topic);
            } else if (topic.percentage < 40 && topic.solved > 0) {
                weakAreas.push(topic.topic);
            } else if (topic.solved === 0) {
                weakAreas.push(topic.topic);
            }
        });
        
        // Add mock interview insights
        const avgInterviewScore = user.avgInterviewScore;
        if (avgInterviewScore >= 7) {
            strongAreas.push("Interview Communication");
        } else if (avgInterviewScore < 5 && user.mockInterviews.length > 0) {
            weakAreas.push("Interview Communication");
        }
        
        // Calculate predicted interview score (0-100%)
        const dsaProgressScore = Math.min(100, (user.dsaProgress.totalSolved / 100) * 100);
        const interviewScorePercent = avgInterviewScore * 10;
        const predictedScore = Math.floor((dsaProgressScore * 0.6) + (interviewScorePercent * 0.4));
        
        // Generate recommendations
        const recommendations = [];
        
        if (weakAreas.includes("Arrays") || weakAreas.includes("Strings")) {
            recommendations.push("Focus on basic data structures - Arrays and Strings need improvement");
        }
        if (weakAreas.includes("Linkedlist")) {
            recommendations.push("Practice Linked List problems - implementation and traversal");
        }
        if (weakAreas.includes("Trees")) {
            recommendations.push("Master tree traversals - inorder, preorder, postorder");
        }
        if (weakAreas.includes("Graphs")) {
            recommendations.push("Learn BFS and DFS algorithms for graph problems");
        }
        if (weakAreas.includes("DP")) {
            recommendations.push("Start with basic DP patterns like Fibonacci and Climbing Stairs");
        }
        if (weakAreas.includes("Interview Communication")) {
            recommendations.push("Take more mock interviews to improve communication skills");
        }
        if (user.dsaProgress.totalSolved < 50) {
            recommendations.push("Solve at least 5 problems daily to build consistency");
        }
        if (user.mockInterviews.length < 3) {
            recommendations.push("Complete at least 3 mock interviews to gauge your readiness");
        }
        
        if (recommendations.length === 0) {
            recommendations.push("Great progress! Start applying to companies");
            recommendations.push("Help others by sharing your preparation journey");
        }
        
        res.json({
            totalSolved: user.dsaProgress.totalSolved,
            easySolved: user.dsaProgress.easy,
            mediumSolved: user.dsaProgress.medium,
            hardSolved: user.dsaProgress.hard,
            totalInterviews: user.mockInterviews.length,
            avgInterviewScore: avgInterviewScore,
            topicWiseData: topicWiseData,
            interviewTrend: interviewTrend,
            strongAreas: strongAreas.slice(0, 5),
            weakAreas: weakAreas.slice(0, 5),
            completionRate: Math.min(100, Math.floor((user.dsaProgress.totalSolved / 100) * 100)),
            predictedInterviewScore: Math.min(100, predictedScore),
            consistency: user.dsaProgress.streak || 0,
            recommendations: recommendations.slice(0, 4)
        });
        
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;