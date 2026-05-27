const express = require('express');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// Generate personalized roadmap based on user progress
router.get('/generate', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        
        // Analyze user's progress
        const totalSolved = user.dsaProgress.totalSolved || 0;
        const easySolved = user.dsaProgress.easy || 0;
        const mediumSolved = user.dsaProgress.medium || 0;
        const hardSolved = user.dsaProgress.hard || 0;
        
        // Find weak topics
        const weakTopics = [];
        const strongTopics = [];
        const topicProgress = user.dsaProgress.topics || {};
        
        Object.entries(topicProgress).forEach(([topic, count]) => {
            if (count < 3) weakTopics.push(topic);
            else if (count > 8) strongTopics.push(topic);
        });
        
        // Calculate level
        let level = 'Beginner';
        if (totalSolved > 50) level = 'Intermediate';
        if (totalSolved > 150) level = 'Advanced';
        
        const weeklyPlan = [];
        let week = 1;
        
        // Week 1: Fundamentals
        weeklyPlan.push({
            week: week++,
            title: "DSA Fundamentals",
            topics: ["Arrays", "Strings", "Basic Loops"],
            tasks: [
                "Solve 5 array problems (Two Sum, Best Time to Buy Stock)",
                "Solve 5 string problems (Valid Palindrome, Anagram)",
                "Complete 1 mock interview on basics"
            ],
            resources: ["https://leetcode.com/study-plan/programming-skills/"],
            completed: totalSolved >= 10,
            targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        
        // Week 2: Data Structures
        weeklyPlan.push({
            week: week++,
            title: "Data Structures",
            topics: ["Hash Maps", "Stacks", "Queues"],
            tasks: [
                "Learn HashMap implementation",
                "Solve 5 stack problems (Valid Parentheses)",
                "Practice queue problems"
            ],
            resources: ["https://www.youtube.com/watch?v=RBSGKlAvoiM"],
            completed: totalSolved >= 20,
            targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        });
        
        // Week 3: Linked Lists
        weeklyPlan.push({
            week: week++,
            title: "Linked Lists Mastery",
            topics: ["Singly Linked List", "Doubly Linked List", "Cycle Detection"],
            tasks: [
                "Implement LinkedList from scratch",
                "Solve Reverse Linked List",
                "Solve Linked List Cycle detection",
                "Complete 3 medium LinkedList problems"
            ],
            resources: ["https://www.youtube.com/watch?v=NobHlGUjV3g"],
            completed: (topicProgress.linkedlist || 0) >= 5,
            targetDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
        });
        
        // Week 4: Trees
        weeklyPlan.push({
            week: week++,
            title: "Tree Data Structures",
            topics: ["Binary Trees", "BST", "Tree Traversals"],
            tasks: [
                "Learn inorder, preorder, postorder traversal",
                "Solve Maximum Depth of Binary Tree",
                "Solve Inorder Traversal",
                "Complete 4 tree problems"
            ],
            resources: ["https://www.youtube.com/watch?v=Hr5iLG7c9zc"],
            completed: (topicProgress.trees || 0) >= 5,
            targetDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000)
        });
        
        // Week 5: Graphs
        weeklyPlan.push({
            week: week++,
            title: "Graph Algorithms",
            topics: ["BFS", "DFS", "Graph Representation"],
            tasks: [
                "Implement BFS and DFS",
                "Solve Number of Islands",
                "Understand graph traversals",
                "Complete 3 graph problems"
            ],
            resources: ["https://www.youtube.com/watch?v=tWVWeAqZ0WU"],
            completed: (topicProgress.graphs || 0) >= 3,
            targetDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000)
        });
        
        // Week 6: Dynamic Programming
        weeklyPlan.push({
            week: week++,
            title: "Dynamic Programming",
            topics: ["Memoization", "Tabulation", "Common Patterns"],
            tasks: [
                "Understand recursion first",
                "Solve Climbing Stairs",
                "Solve House Robber",
                "Complete 4 DP problems"
            ],
            resources: ["https://www.youtube.com/watch?v=oBt53YbR9Kk"],
            completed: (topicProgress.dp || 0) >= 4,
            targetDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000)
        });
        
        // Week 7: Mock Interviews
        const interviewCount = user.mockInterviews?.length || 0;
        weeklyPlan.push({
            week: week++,
            title: "Interview Preparation",
            topics: ["Mock Interviews", "Communication Skills", "Problem Explanation"],
            tasks: [
                "Take 2 mock interviews this week",
                "Practice explaining your thought process",
                "Record yourself solving problems",
                "Review feedback and improve"
            ],
            resources: [],
            completed: interviewCount >= 5,
            targetDate: new Date(Date.now() + 49 * 24 * 60 * 60 * 1000)
        });
        
        // Week 8: Final Review
        weeklyPlan.push({
            week: week++,
            title: "Final Review & Applications",
            topics: ["Company-Specific Prep", "System Design Basics", "Application Strategy"],
            tasks: [
                "Review all weak topics",
                "Apply to 5 target companies",
                "Complete 2 final mock interviews",
                "Practice behavioral questions"
            ],
            resources: [],
            completed: false,
            targetDate: new Date(Date.now() + 56 * 24 * 60 * 60 * 1000)
        });
        
        // Save roadmap to user
        user.roadmap = {
            weeklyPlan,
            generatedDate: new Date(),
            lastUpdated: new Date()
        };
        await user.save();
        
        const completedWeeks = weeklyPlan.filter(w => w.completed).length;
        const overallProgress = Math.floor((completedWeeks / weeklyPlan.length) * 100);
        
        res.json({
            success: true,
            weeklyPlan,
            totalWeeks: weeklyPlan.length,
            overallProgress: `${overallProgress}%`,
            estimatedCompletionDate: weeklyPlan[weeklyPlan.length - 1]?.targetDate,
            weakFocus: weakTopics,
            strongAreas: strongTopics,
            currentLevel: level,
            message: `Personalized roadmap generated! Based on your ${totalSolved} solved problems.`
        });
        
    } catch (error) {
        console.error('Roadmap generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get current roadmap
router.get('/current', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        
        if (!user.roadmap || !user.roadmap.weeklyPlan || user.roadmap.weeklyPlan.length === 0) {
            return res.json({ 
                hasRoadmap: false,
                message: "No roadmap generated yet. Click 'Generate New Roadmap' to create one."
            });
        }
        
        const completedWeeks = user.roadmap.weeklyPlan.filter(w => w.completed).length;
        const totalWeeks = user.roadmap.weeklyPlan.length;
        const overallProgress = Math.floor((completedWeeks / totalWeeks) * 100);
        
        res.json({
            hasRoadmap: true,
            weeklyPlan: user.roadmap.weeklyPlan,
            generatedDate: user.roadmap.generatedDate,
            overallProgress: `${overallProgress}%`,
            currentWeek: completedWeeks + 1,
            estimatedCompletion: user.roadmap.weeklyPlan[totalWeeks - 1]?.targetDate,
            totalSolved: user.dsaProgress.totalSolved,
            interviewCount: user.mockInterviews?.length || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update week progress
router.put('/update-week/:weekNumber', authMiddleware, async (req, res) => {
    try {
        const { weekNumber } = req.params;
        const { completed } = req.body;
        
        const user = await User.findById(req.userId);
        
        if (user.roadmap && user.roadmap.weeklyPlan[weekNumber - 1]) {
            user.roadmap.weeklyPlan[weekNumber - 1].completed = completed;
            user.roadmap.lastUpdated = new Date();
            await user.save();
            
            const completedWeeks = user.roadmap.weeklyPlan.filter(w => w.completed).length;
            const totalWeeks = user.roadmap.weeklyPlan.length;
            
            res.json({
                success: true,
                message: `Week ${weekNumber} marked as ${completed ? 'completed' : 'incomplete'}`,
                overallProgress: `${Math.floor((completedWeeks / totalWeeks) * 100)}%`
            });
        } else {
            res.status(404).json({ error: 'Week not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;