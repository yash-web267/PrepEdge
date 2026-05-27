// Dashboard Manager
class DashboardManager {
    static async loadDashboard() {
        if (!AuthService.isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }
        
        try {
            // Show loading state
            this.showLoading();
            
            const data = await APIService.get('/dashboard/dashboard-data');
            console.log('Dashboard Data Received:', data);
            
            this.updateUI(data);
            
            // Render charts after a small delay to ensure canvas is ready
            setTimeout(() => {
                if (data.analytics.topicMastery) {
                    this.renderTopicChart(data.analytics.topicMastery);
                }
                
                if (data.analytics.weeklyActivity) {
                    this.renderActivityChart(data.analytics.weeklyActivity);
                }
            }, 100);
            
        } catch (error) {
            console.error('Failed to load dashboard:', error);
            this.showError('Failed to load dashboard data');
        }
    }
    
    static showLoading() {
        const elements = ['total-problems', 'avg-score', 'resume-score', 'readiness'];
        elements.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '...';
        });
        
        const recentActivity = document.getElementById('recent-activity');
        if (recentActivity) {
            recentActivity.innerHTML = '<div style="text-align: center; padding: 2rem;">Loading...</div>';
        }
    }
    
    static updateUI(data) {
        console.log('Updating UI with data:', data);
        
        // Update user name
        const userNameSpan = document.getElementById('user-name');
        if (userNameSpan && data.user) {
            userNameSpan.textContent = data.user.name;
        }
        
        // Update stats
        const totalProblems = data.dsaProgress?.totalSolved || 0;
        const avgScore = data.analytics?.averageInterviewScore || 0;
        const resumeScore = data.analytics?.resumeScore || 0;
        const readiness = data.analytics?.completionRate || 0;
        
        document.getElementById('total-problems').textContent = totalProblems;
        document.getElementById('avg-score').textContent = avgScore;
        document.getElementById('resume-score').textContent = resumeScore;
        document.getElementById('readiness').textContent = readiness;
        
        // Update progress bar
        const progressPercent = readiness;
        const progressBar = document.getElementById('problems-progress');
        if (progressBar) {
            progressBar.style.width = `${progressPercent}%`;
        }
        
        // Update recent activity
        this.updateRecentActivity(data.mockInterviews);
    }
    
    static updateRecentActivity(interviews) {
        const container = document.getElementById('recent-activity');
        if (!container) {
            console.error('Recent activity container not found');
            return;
        }
        
        console.log('Updating recent activity with:', interviews);
        
        if (!interviews || interviews.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; background: #f9f9f9; border-radius: 8px;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎯</div>
                    <div style="color: #666;">No recent activity yet!</div>
                    <div style="font-size: 0.85rem; color: #999; margin-top: 0.5rem;">
                        Go to <a href="interview.html" style="color: #667eea;">Mock Interview</a> to get started
                    </div>
                </div>
            `;
            return;
        }
        
        // Show actual interviews
        container.innerHTML = interviews.map(interview => `
            <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: #f9f9f9; border-radius: 8px; margin-bottom: 0.5rem;">
                <div style="font-size: 1.5rem;">🎤</div>
                <div style="flex: 1;">
                    <div style="font-weight: bold;">Mock Interview</div>
                    <div style="color: #4CAF50;">Score: ${interview.score}/10</div>
                    <div style="font-size: 0.8rem; color: #999;">${new Date(interview.date).toLocaleDateString()}</div>
                </div>
            </div>
        `).join('');
    }
    
    static renderTopicChart(topicMastery) {
        const canvas = document.getElementById('topicChart');
        if (!canvas) {
            console.error('Topic chart canvas not found');
            return;
        }
        
        console.log('Rendering topic chart with:', topicMastery);
        
        const ctx = canvas.getContext('2d');
        const topics = Object.keys(topicMastery);
        const scores = Object.values(topicMastery);
        
        // Set canvas dimensions
        canvas.width = canvas.offsetWidth || 400;
        canvas.height = canvas.offsetHeight || 200;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (topics.length === 0) {
            ctx.fillStyle = '#999';
            ctx.font = '14px Arial';
            ctx.fillText('No data yet. Solve some problems!', 50, 100);
            return;
        }
        
        const barWidth = Math.min(50, (canvas.width - 100) / topics.length - 10);
        const startX = 50;
        const startY = canvas.height - 50;
        const maxHeight = canvas.height - 100;
        
        topics.forEach((topic, index) => {
            const x = startX + (index * (barWidth + 20));
            const height = (scores[index] / 100) * maxHeight;
            const y = startY - height;
            
            // Draw bar
            const gradient = ctx.createLinearGradient(x, y, x, startY);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, Math.max(height, 2));
            
            // Draw label
            ctx.fillStyle = '#333';
            ctx.font = '10px Arial';
            const displayTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
            ctx.fillText(displayTopic, x + 5, startY + 15);
            
            // Draw percentage
            ctx.fillStyle = '#667eea';
            ctx.font = 'bold 10px Arial';
            ctx.fillText(`${Math.floor(scores[index])}%`, x + barWidth / 2 - 15, y - 5);
        });
    }
    
    static renderActivityChart(weeklyActivity) {
        const canvas = document.getElementById('activityChart');
        if (!canvas) {
            console.error('Activity chart canvas not found');
            return;
        }
        
        console.log('Rendering activity chart with:', weeklyActivity);
        
        const ctx = canvas.getContext('2d');
        
        canvas.width = canvas.offsetWidth || 400;
        canvas.height = canvas.offsetHeight || 200;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (!weeklyActivity || weeklyActivity.length === 0) {
            ctx.fillStyle = '#999';
            ctx.font = '14px Arial';
            ctx.fillText('No activity data yet', 50, 100);
            return;
        }
        
        const dates = weeklyActivity.map(w => {
            const date = new Date(w.date);
            return `${date.getMonth() + 1}/${date.getDate()}`;
        });
        const solved = weeklyActivity.map(w => w.solved || 0);
        
        const startX = 50;
        const startY = canvas.height - 40;
        const stepX = (canvas.width - 100) / (dates.length - 1);
        const maxSolved = Math.max(...solved, 5);
        
        // Draw line
        ctx.beginPath();
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        
        solved.forEach((value, index) => {
            const x = startX + (index * stepX);
            const y = startY - (value / maxSolved) * (canvas.height - 80);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
        
        // Draw points
        solved.forEach((value, index) => {
            const x = startX + (index * stepX);
            const y = startY - (value / maxSolved) * (canvas.height - 80);
            
            // Draw circle
            ctx.fillStyle = '#4CAF50';
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw date
            ctx.fillStyle = '#999';
            ctx.font = '9px Arial';
            ctx.fillText(dates[index], x - 12, startY + 15);
            
            // Draw value
            if (value > 0) {
                ctx.fillStyle = '#333';
                ctx.font = 'bold 9px Arial';
                ctx.fillText(value.toString(), x - 3, y - 5);
            }
        });
    }
    
    static showError(message) {
        const container = document.querySelector('.dashboard-container');
        if (container) {
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                background: #ffebee;
                color: #c62828;
                padding: 1rem;
                border-radius: 8px;
                margin-bottom: 1rem;
                border-left: 4px solid #c62828;
            `;
            errorDiv.textContent = message;
            container.prepend(errorDiv);
            setTimeout(() => errorDiv.remove(), 5000);
        }
    }
}

// Initialize dashboard when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DashboardManager.loadDashboard());
} else {
    DashboardManager.loadDashboard();
}