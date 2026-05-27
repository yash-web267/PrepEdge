// Analytics Manager
class AnalyticsManager {
    static analyticsData = null;
    
    static async init() {
        // Load user name
        const user = AuthService.getUser();
        if (user && user.name) {
            document.getElementById('user-name').textContent = user.name.split(' ')[0];
        }
        
        await this.loadAnalytics();
    }
    
    static async loadAnalytics() {
        try {
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'loading';
            loadingDiv.textContent = 'Loading analytics...';
            
            const container = document.querySelector('.analytics-container');
            if (container) {
                container.prepend(loadingDiv);
            }
            
            this.analyticsData = await APIService.get('/analytics/overview');
            
            if (loadingDiv) loadingDiv.remove();
            
            this.renderAnalytics();
        } catch (error) {
            console.error('Failed to load analytics:', error);
            this.showError('Failed to load analytics data');
        }
    }
    
    static renderAnalytics() {
        if (!this.analyticsData) return;
        
        // Update stats
        document.getElementById('total-solved').textContent = this.analyticsData.totalSolved || 0;
        document.getElementById('difficulty-breakdown').textContent = 
            `${this.analyticsData.easySolved || 0} / ${this.analyticsData.mediumSolved || 0} / ${this.analyticsData.hardSolved || 0}`;
        document.getElementById('total-interviews').textContent = this.analyticsData.totalInterviews || 0;
        document.getElementById('avg-score').textContent = this.analyticsData.avgInterviewScore || 0;
        document.getElementById('predicted-score').textContent = `${this.analyticsData.predictedInterviewScore || 0}%`;
        document.getElementById('streak').textContent = this.analyticsData.consistency || 0;
        
        // Render strong areas
        this.renderStrongWeakAreas();
        
        // Render recommendations
        this.renderRecommendations();
        
        // Render charts
        this.renderTopicChart();
        this.renderInterviewChart();
    }
    
    static renderStrongWeakAreas() {
        const strongContainer = document.getElementById('strong-areas');
        const weakContainer = document.getElementById('weak-areas');
        
        if (strongContainer) {
            if (!this.analyticsData.strongAreas || this.analyticsData.strongAreas.length === 0) {
                strongContainer.innerHTML = '<p class="text-muted">Keep practicing to identify strong areas</p>';
            } else {
                strongContainer.innerHTML = this.analyticsData.strongAreas
                    .map(area => `<span class="strength-badge">✓ ${area}</span>`)
                    .join('');
            }
        }
        
        if (weakContainer) {
            if (!this.analyticsData.weakAreas || this.analyticsData.weakAreas.length === 0) {
                weakContainer.innerHTML = '<p class="text-muted">Great job! No major weak areas identified</p>';
            } else {
                weakContainer.innerHTML = this.analyticsData.weakAreas
                    .map(area => `<span class="weakness-badge">⚠ ${area}</span>`)
                    .join('');
            }
        }
    }
    
    static renderRecommendations() {
        const container = document.getElementById('recommendations');
        if (!container) return;
        
        const recommendations = this.analyticsData.recommendations || [
            'Complete at least 50 DSA problems',
            'Take 5 mock interviews',
            'Review weak topics daily'
        ];
        
        container.innerHTML = recommendations.map(rec => `<li>💡 ${rec}</li>`).join('');
    }
    
    static renderTopicChart() {
        const canvas = document.getElementById('topicChart');
        if (!canvas || !this.analyticsData.topicWiseData) return;
        
        const ctx = canvas.getContext('2d');
        const data = this.analyticsData.topicWiseData;
        
        // Set canvas dimensions
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        const barWidth = Math.min(60, (canvas.width - 100) / data.length - 10);
        const startX = 50;
        const startY = canvas.height - 50;
        const maxHeight = canvas.height - 100;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        data.forEach((item, index) => {
            const x = startX + index * (barWidth + 20);
            const height = (item.percentage / 100) * maxHeight;
            const y = startY - height;
            
            // Draw bar
            const gradient = ctx.createLinearGradient(x, y, x, startY);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, height);
            
            // Draw label
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.fillText(item.topic, x + 5, startY + 20);
            
            // Draw percentage
            ctx.fillStyle = '#667eea';
            ctx.font = 'bold 11px Arial';
            ctx.fillText(`${item.percentage}%`, x + barWidth / 2 - 15, y - 5);
            
            // Draw solved count
            ctx.fillStyle = '#999';
            ctx.font = '9px Arial';
            ctx.fillText(`${item.solved}/${item.total}`, x + barWidth / 2 - 15, startY + 35);
        });
    }
    
    static renderInterviewChart() {
        const canvas = document.getElementById('interviewChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const data = this.analyticsData.interviewTrend || [];
        
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (data.length === 0) {
            ctx.fillStyle = '#999';
            ctx.font = '14px Arial';
            ctx.fillText('No interview data yet. Take a mock interview!', 50, 100);
            return;
        }
        
        const startX = 60;
        const startY = canvas.height - 50;
        const stepX = (canvas.width - 100) / (data.length - 1);
        const maxScore = 10;
        
        // Draw line
        ctx.beginPath();
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 3;
        
        data.forEach((item, index) => {
            const x = startX + (index * stepX);
            const y = startY - (item.score / maxScore) * (canvas.height - 100);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
        
        // Draw points and labels
        data.forEach((item, index) => {
            const x = startX + (index * stepX);
            const y = startY - (item.score / maxScore) * (canvas.height - 100);
            
            // Draw circle
            ctx.fillStyle = '#667eea';
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw score
            ctx.fillStyle = '#333';
            ctx.font = 'bold 10px Arial';
            ctx.fillText(item.score, x - 8, y - 8);
            
            // Draw date
            ctx.fillStyle = '#999';
            ctx.font = '9px Arial';
            const dateParts = item.date.split('-');
            const shortDate = `${dateParts[1]}/${dateParts[2]}`;
            ctx.fillText(shortDate, x - 15, startY + 15);
        });
        
        // Draw target line (7/10)
        const targetY = startY - (7 / maxScore) * (canvas.height - 100);
        ctx.beginPath();
        ctx.strokeStyle = '#ff9800';
        ctx.setLineDash([5, 5]);
        ctx.moveTo(startX - 10, targetY);
        ctx.lineTo(canvas.width - 20, targetY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#ff9800';
        ctx.font = '10px Arial';
        ctx.fillText('Target (7/10)', startX - 10, targetY - 5);
    }
    
    static showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            background: #ffebee;
            color: #c62828;
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem;
            border-left: 4px solid #c62828;
        `;
        errorDiv.textContent = message;
        document.querySelector('.analytics-container').prepend(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }
}

// Initialize analytics when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AnalyticsManager.init());
} else {
    AnalyticsManager.init();
}