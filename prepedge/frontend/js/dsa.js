// DSA Tracker Manager
class DSAManager {
    static currentFilter = 'all';
    static problemsData = null;
    
    static async loadProblems() {
        if (!AuthService.isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }
        
        try {
            // Load user name
            const user = AuthService.getUser();
            if (user && user.name) {
                document.getElementById('user-name').textContent = user.name.split(' ')[0];
            }
            
            // Load stats first
            await this.loadStats();
            
            // Load problems
            this.problemsData = await APIService.get('/dsa/problems');
            this.renderProblems();
            
            // Setup filters
            this.setupFilters();
            
        } catch (error) {
            console.error('Failed to load problems:', error);
            this.showError('Failed to load problems. Please refresh the page.');
        }
    }
    
    static async loadStats() {
        try {
            const stats = await APIService.get('/dsa/stats');
            document.getElementById('total-solved').textContent = stats.totalSolved || 0;
            document.getElementById('easy-solved').textContent = stats.easy || 0;
            document.getElementById('medium-solved').textContent = stats.medium || 0;
            document.getElementById('hard-solved').textContent = stats.hard || 0;
            document.getElementById('streak').textContent = stats.streak || 0;
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }
    
    static setupFilters() {
        const filters = document.querySelectorAll('.filter-btn');
        filters.forEach(btn => {
            btn.addEventListener('click', () => {
                filters.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.renderProblems();
            });
        });
    }
    
    static renderProblems() {
        const container = document.getElementById('problems-container');
        if (!container || !this.problemsData) return;
        
        let html = '';
        
        for (const [topic, problems] of Object.entries(this.problemsData)) {
            // Apply filter
            if (this.currentFilter !== 'all' && this.currentFilter !== topic) {
                continue;
            }
            
            const solvedCount = problems.filter(p => p.solved).length;
            const totalCount = problems.length;
            const percentage = Math.floor((solvedCount / totalCount) * 100);
            
            html += `
                <div class="topic-section" data-topic="${topic}">
                    <div class="topic-header">
                        <div class="topic-title">${topic.charAt(0).toUpperCase() + topic.slice(1)}</div>
                        <div class="topic-progress">${solvedCount}/${totalCount} solved (${percentage}%)</div>
                    </div>
                    <div class="problems-list">
            `;
            
            problems.forEach(problem => {
                html += `
                    <div class="problem-item ${problem.solved ? 'solved' : ''}" data-problem-id="${problem.id}">
                        <div class="problem-info">
                            <span class="problem-name">${problem.name}</span>
                            <span class="problem-difficulty difficulty-${problem.difficulty}">${problem.difficulty}</span>
                            ${problem.leetcodeLink ? `<a href="${problem.leetcodeLink}" target="_blank" class="leetcode-link">🔗 LeetCode</a>` : ''}
                        </div>
                        ${!problem.solved ? `
                            <button class="solve-btn" onclick="DSAManager.markSolved('${topic}', '${problem.difficulty}', ${problem.id})">
                                ✓ Mark Solved
                            </button>
                        ` : '<span class="solved-badge">✅ Solved</span>'}
                    </div>
                `;
            });
            
            html += `</div></div>`;
        }
        
        container.innerHTML = html;
    }
    
    static async markSolved(topic, difficulty, problemId) {
        try {
            const result = await APIService.post('/dsa/solve', { 
                topic, 
                difficulty,
                problemId 
            });
            
            if (result.success) {
                this.showNotification('🎉 Problem marked as solved!', 'success');
                
                // Update local data
                if (this.problemsData && this.problemsData[topic]) {
                    const problem = this.problemsData[topic].find(p => p.id === problemId);
                    if (problem) {
                        problem.solved = true;
                    }
                }
                
                // Refresh UI
                this.renderProblems();
                await this.loadStats();
                
                // Update dashboard if needed
                if (typeof DashboardManager !== 'undefined') {
                    DashboardManager.loadDashboard();
                }
            }
        } catch (error) {
            console.error('Failed to mark problem:', error);
            this.showNotification('Failed to mark problem. Please try again.', 'error');
        }
    }
    
    static showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    static showError(message) {
        const container = document.querySelector('.dsa-container');
        if (container) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            container.prepend(errorDiv);
            setTimeout(() => errorDiv.remove(), 5000);
        }
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DSAManager.loadProblems());
} else {
    DSAManager.loadProblems();
}