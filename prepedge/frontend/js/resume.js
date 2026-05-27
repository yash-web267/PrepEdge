// Resume Manager
class ResumeManager {
    static async init() {
        // Load user name
        const user = AuthService.getUser();
        if (user && user.name) {
            document.getElementById('user-name').textContent = user.name.split(' ')[0];
        }
        
        // Setup file upload
        const fileInput = document.getElementById('resume-file');
        fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Load existing resume
        await this.loadResumeAnalysis();
    }
    
    static async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            this.showError('Please upload PDF or DOC/DOCX file only.');
            return;
        }
        
        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showError('File size must be less than 5MB.');
            return;
        }
        
        // Show uploading state
        const uploadArea = document.getElementById('upload-area');
        const originalContent = uploadArea.innerHTML;
        uploadArea.innerHTML = '<div class="upload-icon">⏳</div><h3>Uploading and analyzing...</h3><p>Please wait</p>';
        uploadArea.classList.add('uploading');
        
        try {
            const result = await APIService.upload('/resume/upload', file);
            
            if (result.success) {
                this.showNotification('Resume uploaded and analyzed successfully!', 'success');
                await this.loadResumeAnalysis();
            } else {
                this.showError(result.error || 'Failed to analyze resume');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            this.showError('Failed to upload resume. Please try again.');
        } finally {
            uploadArea.innerHTML = originalContent;
            uploadArea.classList.remove('uploading');
            event.target.value = ''; // Reset file input
        }
    }
    
    static async loadResumeAnalysis() {
        try {
            const analysis = await APIService.get('/resume/analysis');
            
            if (analysis.hasResume) {
                this.displayAnalysis(analysis);
                document.getElementById('analysis-results').style.display = 'block';
            } else {
                document.getElementById('analysis-results').style.display = 'none';
            }
        } catch (error) {
            console.error('Failed to load analysis:', error);
        }
    }
    
    static displayAnalysis(analysis) {
        // Display filename
        document.getElementById('resume-filename').textContent = analysis.filename;
        
        // Display ATS score
        const score = analysis.atsScore;
        document.getElementById('ats-score').textContent = score;
        
        // Draw score meter
        this.drawScoreMeter(score);
        
        // Display suggestions
        const suggestionsList = document.getElementById('suggestions-list');
        suggestionsList.innerHTML = analysis.suggestions.map(s => `<li>${s}</li>`).join('');
        
        // Animate score
        this.animateScore(0, score);
    }
    
    static drawScoreMeter(score) {
        const canvas = document.getElementById('score-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const percentage = score / 100;
        const angle = percentage * 360;
        
        ctx.clearRect(0, 0, 200, 200);
        
        // Draw background circle
        ctx.beginPath();
        ctx.arc(100, 100, 80, 0, 2 * Math.PI);
        ctx.strokeStyle = '#f0f0f0';
        ctx.lineWidth = 15;
        ctx.stroke();
        
        // Draw score arc
        ctx.beginPath();
        ctx.arc(100, 100, 80, -Math.PI / 2, (-Math.PI / 2) + (angle * Math.PI / 180));
        ctx.strokeStyle = score >= 70 ? '#4CAF50' : score >= 50 ? '#ff9800' : '#f44336';
        ctx.lineWidth = 15;
        ctx.stroke();
        
        // Draw inner circle
        ctx.beginPath();
        ctx.arc(100, 100, 70, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
    }
    
    static animateScore(start, end) {
        const duration = 1000;
        const stepTime = 20;
        const steps = duration / stepTime;
        const increment = (end - start) / steps;
        let current = start;
        let step = 0;
        
        const interval = setInterval(() => {
            current += increment;
            step++;
            document.getElementById('ats-score').textContent = Math.floor(current);
            
            if (step >= steps) {
                document.getElementById('ats-score').textContent = end;
                clearInterval(interval);
            }
        }, stepTime);
    }
    
    static async deleteResume() {
        if (!confirm('Are you sure you want to delete your resume?')) return;
        
        try {
            const result = await APIService.delete('/resume/delete');
            if (result.success) {
                this.showNotification('Resume deleted successfully', 'success');
                document.getElementById('analysis-results').style.display = 'none';
            }
        } catch (error) {
            console.error('Failed to delete resume:', error);
            this.showError('Failed to delete resume');
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
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-error';
        errorDiv.textContent = message;
        document.querySelector('.resume-card').prepend(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ResumeManager.init());
} else {
    ResumeManager.init();
}