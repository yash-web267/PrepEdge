// Roadmap Manager
class RoadmapManager {
    static currentRoadmap = null;
    
    static async init() {
        // Load user name
        const user = AuthService.getUser();
        if (user && user.name) {
            const userNameSpan = document.getElementById('user-name');
            if (userNameSpan) {
                userNameSpan.textContent = user.name.split(' ')[0];
            }
        }
        
        // Load existing roadmap
        await this.loadRoadmap();
        
        // Setup generate button
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.onclick = () => this.generateRoadmap();
        }
    }
    
    static async generateRoadmap() {
        const generateBtn = document.getElementById('generateBtn');
        const originalText = generateBtn.textContent;
        generateBtn.textContent = '⏳ Generating...';
        generateBtn.disabled = true;
        
        try {
            const roadmap = await APIService.get('/roadmap/generate');
            this.currentRoadmap = roadmap;
            this.renderRoadmap(roadmap);
            this.showNotification('✨ New personalized roadmap generated!', 'success');
        } catch (error) {
            console.error('Failed to generate roadmap:', error);
            this.showError('Failed to generate roadmap. Please try again.');
        } finally {
            generateBtn.textContent = originalText;
            generateBtn.disabled = false;
        }
    }
    
    static async loadRoadmap() {
        try {
            const roadmap = await APIService.get('/roadmap/current');
            if (roadmap.hasRoadmap) {
                this.currentRoadmap = { weeklyPlan: roadmap.weeklyPlan };
                this.renderRoadmap({ weeklyPlan: roadmap.weeklyPlan });
                this.updateProgressOverview(roadmap);
            }
        } catch (error) {
            console.error('Failed to load roadmap:', error);
        }
    }
    
    static renderRoadmap(roadmap) {
        const container = document.getElementById('roadmap-content');
        if (!container || !roadmap.weeklyPlan) return;
        
        let html = '<div class="timeline">';
        
        roadmap.weeklyPlan.forEach((week, index) => {
            const weekNumber = week.week || (index + 1);
            const isCompleted = week.completed || false;
            const statusClass = isCompleted ? 'completed' : '';
            
            html += `
                <div class="week-card ${statusClass}" data-week="${weekNumber}">
                    <div class="week-number">${weekNumber}</div>
                    <div class="week-title">${week.title || `Week ${weekNumber}`}</div>
                    <div class="week-date">${week.targetDate ? new Date(week.targetDate).toLocaleDateString() : 'Target: This week'}</div>
                    
                    <div class="topics-list">
                        ${week.topics.map(topic => `<span class="topic-tag">📚 ${topic}</span>`).join('')}
                    </div>
                    
                    <ul class="tasks-list">
                        ${week.tasks.map((task, taskIndex) => `
                            <li>
                                <input type="checkbox" class="task-checkbox" 
                                    data-week="${weekNumber}" 
                                    data-task="${taskIndex}"
                                    ${isCompleted ? 'checked disabled' : ''}
                                    onchange="RoadmapManager.updateTask(${weekNumber}, ${taskIndex}, this.checked)">
                                <span class="task-text ${isCompleted ? 'completed' : ''}">${task}</span>
                            </li>
                        `).join('')}
                    </ul>
                    
                    ${week.resources && week.resources.length > 0 ? `
                        <div>
                            ${week.resources.map(resource => `
                                <a href="${resource}" target="_blank" class="resources-link">📖 Learning Resource</a>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    ${!isCompleted ? `
                        <button class="btn-primary" style="margin-top: 1rem;" onclick="RoadmapManager.completeWeek(${weekNumber})">
                            ✓ Mark Week ${weekNumber} as Complete
                        </button>
                    ` : '<span class="badge-success">✅ Week Completed</span>'}
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
        // Show progress overview
        const progressOverview = document.getElementById('progress-overview');
        if (progressOverview) {
            progressOverview.style.display = 'block';
        }
        this.updateProgress();
    }
    
    static async updateTask(weekNumber, taskIndex, completed) {
        const weekCard = document.querySelector(`.week-card[data-week="${weekNumber}"]`);
        const checkboxes = weekCard.querySelectorAll('.task-checkbox');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        
        if (allChecked && !weekCard.classList.contains('completed')) {
            await this.completeWeek(weekNumber);
        }
    }
    
    static async completeWeek(weekNumber) {
        try {
            const result = await APIService.put(`/roadmap/update-week/${weekNumber}`, { completed: true });
            
            if (result.success) {
                this.showNotification(`Week ${weekNumber} marked as completed! 🎉`, 'success');
                await this.loadRoadmap();
            }
        } catch (error) {
            console.error('Failed to complete week:', error);
            this.showError('Failed to update progress');
        }
    }
    
    static updateProgressOverview(roadmapData) {
        if (!roadmapData) return;
        
        const progressPercent = parseInt(roadmapData.overallProgress) || 0;
        const progressFill = document.getElementById('overall-progress-fill');
        if (progressFill) {
            progressFill.style.width = `${progressPercent}%`;
        }
        
        const progressText = document.getElementById('progress-text');
        if (progressText) {
            progressText.textContent = `${progressPercent}% completed`;
        }
        
        const estimatedCompletion = document.getElementById('estimated-completion');
        if (estimatedCompletion && roadmapData.estimatedCompletion) {
            const date = new Date(roadmapData.estimatedCompletion);
            estimatedCompletion.innerHTML = `<strong>Estimated completion:</strong> ${date.toLocaleDateString()}`;
        }
    }
    
    static updateProgress() {
        const weeks = document.querySelectorAll('.week-card');
        const completedWeeks = document.querySelectorAll('.week-card.completed');
        const percentage = weeks.length > 0 ? (completedWeeks.length / weeks.length) * 100 : 0;
        
        const progressFill = document.getElementById('overall-progress-fill');
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        
        const progressText = document.getElementById('progress-text');
        if (progressText) {
            progressText.textContent = `${Math.floor(percentage)}% completed`;
        }
    }
    
    static showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            padding: 1rem;
            background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
            color: white;
            border-radius: 8px;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    static showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        const container = document.querySelector('.roadmap-container');
        if (container) {
            container.prepend(errorDiv);
            setTimeout(() => errorDiv.remove(), 5000);
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    RoadmapManager.init();
});