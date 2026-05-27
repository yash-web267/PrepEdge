const User = require('../models/User');

// @desc    Get DSA problems with user progress
// @route   GET /api/dsa/problems
// @access  Private
const getProblems = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        
        const problems = {
            arrays: [
                { id: 1, name: "Two Sum", difficulty: "easy", leetcodeLink: "https://leetcode.com/problems/two-sum" },
                { id: 2, name: "Best Time to Buy and Sell Stock", difficulty: "easy", leetcodeLink: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock" },
                { id: 3, name: "Maximum Subarray", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/maximum-subarray" },
                { id: 4, name: "Container With Most Water", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/container-with-most-water" },
                { id: 5, name: "3Sum", difficulty: "hard", leetcodeLink: "https://leetcode.com/problems/3sum" },
                { id: 6, name: "Contains Duplicate", difficulty: "easy", leetcodeLink: "https://leetcode.com/problems/contains-duplicate" },
                { id: 7, name: "Product of Array Except Self", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/product-of-array-except-self" },
                { id: 8, name: "Find Minimum in Rotated Sorted Array", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array" },
                { id: 9, name: "Search in Rotated Sorted Array", difficulty: "hard", leetcodeLink: "https://leetcode.com/problems/search-in-rotated-sorted-array" },
                { id: 10, name: "Maximum Product Subarray", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/maximum-product-subarray" },
                { id: 11, name: "Find the Duplicate Number", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/find-the-duplicate-number" },
                { id: 12, name: "Subarray Sum Equals K", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/subarray-sum-equals-k" },
                { id: 13, name: "Move Zeroes", difficulty: "easy", leetcodeLink: "https://leetcode.com/problems/move-zeroes" },
                { id: 14, name: "Best Time to Buy and Sell Stock II", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii" },
                { id: 15, name: "Jump Game", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/jump-game" }
            ],
            strings: [
                { id: 1, name: "Valid Palindrome", difficulty: "easy", leetcodeLink: "https://leetcode.com/problems/valid-palindrome" },
                { id: 2, name: "Longest Substring Without Repeating Characters", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/longest-substring-without-repeating-characters" },
                { id: 3, name: "Group Anagrams", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/group-anagrams" },
                { id: 4, name: "Longest Palindromic Substring", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/longest-palindromic-substring" },
                { id: 5, name: "Valid Parentheses", difficulty: "easy", leetcodeLink: "https://leetcode.com/problems/valid-parentheses" },
                { id: 6, name: "Implement strStr()", difficulty: "easy", leetcodeLink: "https://leetcode.com/problems/implement-strstr" },
                { id: 7, name: "String to Integer (atoi)", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/string-to-integer-atoi" },
                { id: 8, name: "Valid Anagram", difficulty: "easy", leetcodeLink: "https://leetcode.com/problems/valid-anagram" },
                { id: 9, name: "Palindrome Pairs", difficulty: "hard", leetcodeLink: "https://leetcode.com/problems/palindrome-pairs" },
                { id: 10, name: "Longest Common Prefix", difficulty: "easy", leetcodeLink: "https://leetcode.com/problems/longest-common-prefix" },
                { id: 11, name: "Minimum Window Substring", difficulty: "hard", leetcodeLink: "https://leetcode.com/problems/minimum-window-substring" },
                { id: 12, name: "Decode String", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/decode-string" }
            ],
            linkedlist: [
                { id: 1, name: "Reverse Linked List", difficulty: "easy", leetcodeLink: "https://leetcode.com/problems/reverse-linked-list" },
                { id: 2, name: "Linked List Cycle", difficulty: "easy", leetcodeLink: "https://leetcode.com/problems/linked-list-cycle" },
                { id: 3, name: "Merge Two Sorted Lists", difficulty: "easy", leetcodeLink: "https://leetcode.com/problems/merge-two-sorted-lists" },
                { id: 4, name: "Remove Nth Node From End of List", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/remove-nth-node-from-end-of-list" },
                { id: 5, name: "Palindrome Linked List", difficulty: "easy", leetcodeLink: "https://leetcode.com/problems/palindrome-linked-list" },
                { id: 6, name: "Intersection of Two Linked Lists", difficulty: "easy", leetcodeLink: "https://leetcode.com/problems/intersection-of-two-linked-lists" },
                { id: 7, name: "Remove Linked List Elements", difficulty: "easy", leetcodeLink: "https://leetcode.com/problems/remove-linked-list-elements" },
                { id: 8, name: "Middle of the Linked List", difficulty: "easy", leetcodeLink: "https://leetcode.com/problems/middle-of-the-linked-list" },
                { id: 9, name: "Add Two Numbers", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/add-two-numbers" },
                { id: 10, name: "Copy List with Random Pointer", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/copy-list-with-random-pointer" },
                { id: 11, name: "Reorder List", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/reorder-list" },
                { id: 12, name: "Sort List", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/sort-list" }
            ],
            trees: [
                { id: 1, name: "Maximum Depth of Binary Tree", difficulty: "easy", leetcodeLink: "https://leetcode.com/problems/maximum-depth-of-binary-tree" },
                { id: 2, name: "Binary Tree Inorder Traversal", difficulty: "easy", leetcodeLink: "https://leetcode.com/problems/binary-tree-inorder-traversal" },
                { id: 3, name: "Binary Tree Level Order Traversal", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/binary-tree-level-order-traversal" },
                { id: 4, name: "Validate Binary Search Tree", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/validate-binary-search-tree" },
                { id: 5, name: "Symmetric Tree", difficulty: "easy", leetcodeLink: "https://leetcode.com/problems/symmetric-tree" },
                { id: 6, name: "Invert Binary Tree", difficulty: "easy", leetcodeLink: "https://leetcode.com/problems/invert-binary-tree" },
                { id: 7, name: "Lowest Common Ancestor of BST", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree" },
                { id: 8, name: "Binary Tree Zigzag Level Order", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal" },
                { id: 9, name: "Construct Binary Tree from Preorder", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal" },
                { id: 10, name: "Kth Smallest Element in BST", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/kth-smallest-element-in-a-bst" },
                { id: 11, name: "Diameter of Binary Tree", difficulty: "easy", leetcodeLink: "https://leetcode.com/problems/diameter-of-binary-tree" },
                { id: 12, name: "Binary Tree Maximum Path Sum", difficulty: "hard", leetcodeLink: "https://leetcode.com/problems/binary-tree-maximum-path-sum" }
            ],
            graphs: [
                { id: 1, name: "Number of Islands", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/number-of-islands" },
                { id: 2, name: "Clone Graph", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/clone-graph" },
                { id: 3, name: "Course Schedule", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/course-schedule" },
                { id: 4, name: "Pacific Atlantic Water Flow", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/pacific-atlantic-water-flow" },
                { id: 5, name: "Surrounded Regions", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/surrounded-regions" },
                { id: 6, name: "Word Search", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/word-search" },
                { id: 7, name: "Graph Valid Tree", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/graph-valid-tree" },
                { id: 8, name: "Redundant Connection", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/redundant-connection" },
                { id: 9, name: "Network Delay Time", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/network-delay-time" },
                { id: 10, name: "Cheapest Flights Within K Stops", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/cheapest-flights-within-k-stops" }
            ],
            dp: [
                { id: 1, name: "Climbing Stairs", difficulty: "easy", leetcodeLink: "https://leetcode.com/problems/climbing-stairs" },
                { id: 2, name: "House Robber", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/house-robber" },
                { id: 3, name: "Longest Common Subsequence", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/longest-common-subsequence" },
                { id: 4, name: "Coin Change", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/coin-change" },
                { id: 5, name: "Word Break", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/word-break" },
                { id: 6, name: "Maximum Subarray", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/maximum-subarray" },
                { id: 7, name: "Longest Increasing Subsequence", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/longest-increasing-subsequence" },
                { id: 8, name: "Unique Paths", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/unique-paths" },
                { id: 9, name: "Jump Game II", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/jump-game-ii" },
                { id: 10, name: "Partition Equal Subset Sum", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/partition-equal-subset-sum" },
                { id: 11, name: "Decode Ways", difficulty: "medium", leetcodeLink: "https://leetcode.com/problems/decode-ways" },
                { id: 12, name: "Best Time to Buy and Sell Stock IV", difficulty: "hard", leetcodeLink: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv" }
            ]
        };
        
        // Mark which problems are solved based on user progress
        for (const [topic, topicProblems] of Object.entries(problems)) {
            const solvedCount = user.dsaProgress.topics[topic] || 0;
            topicProblems.forEach((problem, index) => {
                problem.solved = index < solvedCount;
            });
        }
        
        res.json(problems);
    } catch (error) {
        console.error('Get problems error:', error);
        res.status(500).json({ error: error.message });
    }
};

// @desc    Mark problem as solved
// @route   POST /api/dsa/solve
// @access  Private
const markSolved = async (req, res) => {
    try {
        const { topic, difficulty, problemId } = req.body;
        const user = await User.findById(req.userId);
        
        // Check if already solved
        const alreadySolved = user.dsaProgress.topics[topic] > problemId - 1;
        
        if (alreadySolved) {
            return res.json({ 
                success: true, 
                message: 'Problem already solved!',
                totalSolved: user.dsaProgress.totalSolved 
            });
        }
        
        // Update progress
        user.dsaProgress[difficulty] += 1;
        user.dsaProgress.totalSolved += 1;
        user.dsaProgress.topics[topic] += 1;
        
        // Update streak
        const today = new Date().toDateString();
        if (user.dsaProgress.lastActive !== today) {
            user.dsaProgress.streak = (user.dsaProgress.streak || 0) + 1;
            user.dsaProgress.lastActive = today;
        }
        
        await user.save();
        
        res.json({ 
            success: true,
            message: 'Problem marked as solved! 🎉',
            totalSolved: user.dsaProgress.totalSolved,
            topicProgress: user.dsaProgress.topics[topic],
            streak: user.dsaProgress.streak,
            difficulty: difficulty
        });
    } catch (error) {
        console.error('Mark solved error:', error);
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get user progress stats
// @route   GET /api/dsa/stats
// @access  Private
const getStats = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        
        res.json({
            totalSolved: user.dsaProgress.totalSolved,
            easy: user.dsaProgress.easy,
            medium: user.dsaProgress.medium,
            hard: user.dsaProgress.hard,
            streak: user.dsaProgress.streak,
            topicWise: user.dsaProgress.topics
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getProblems, markSolved, getStats };