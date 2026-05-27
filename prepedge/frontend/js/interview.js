// Mock Interview Manager
class InterviewManager {
    static currentQuestion = null;
    static timer = null;
    static timeLeft = 180; // 3 minutes
    static selectedDifficulty = 'medium';
    static currentAnswer = '';
    
    static init() {
        // Load user name
        const user = AuthService.getUser();
        if (user && user.name) {
            const userNameSpan = document.getElementById('user-name');
            if (userNameSpan) {
                userNameSpan.textContent = user.name.split(' ')[0];
            }
        }
        
        // Setup difficulty selection
        const difficultyBtns = document.querySelectorAll('.difficulty-btn');
        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                difficultyBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.selectedDifficulty = btn.dataset.difficulty;
            });
        });
        
        // Load interview history
        this.loadHistory();
    }
    
    static async startInterview() {
        console.log('Starting interview...');
        
        // Reset state
        this.timeLeft = 180;
        this.currentAnswer = '';
        const answerInput = document.getElementById('answer-input');
        if (answerInput) answerInput.value = '';
        
        // Hide setup, show interview
        const setupSection = document.getElementById('setup-section');
        const interviewActive = document.getElementById('interview-active');
        const resultsSection = document.getElementById('results-section');
        
        if (setupSection) setupSection.style.display = 'none';
        if (interviewActive) interviewActive.style.display = 'block';
        if (resultsSection) resultsSection.style.display = 'none';
        
        // Load question
        await this.loadQuestion();
        
        // Start timer
        this.startTimer();
    }
    
    static async loadQuestion() {
        try {
            this.currentQuestion = await APIService.get('/interview/random-question');
            
            const questionText = document.getElementById('question-text');
            const questionCategory = document.getElementById('question-category');
            const questionDifficulty = document.getElementById('question-difficulty');
            
            if (questionText) questionText.textContent = this.currentQuestion.question;
            if (questionCategory) questionCategory.textContent = this.currentQuestion.category;
            
            if (questionDifficulty) {
                questionDifficulty.textContent = this.currentQuestion.difficulty;
                questionDifficulty.className = `question-difficulty difficulty-${this.currentQuestion.difficulty}`;
            }
            
        } catch (error) {
            console.error('Failed to load question:', error);
            this.showError('Failed to load question. Please try again.');
        }
    }
    
    static startTimer() {
        if (this.timer) clearInterval(this.timer);
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            
            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = this.timeLeft % 60;
            const timerDisplay = document.getElementById('timer');
            
            if (timerDisplay) {
                timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
            
            // Warning when 30 seconds left
            if (this.timeLeft === 30 && timerDisplay) {
                timerDisplay.style.color = '#ff9800';
            }
            
            // Time's up
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                this.submitAnswer();
            }
        }, 1000);
    }
    
    static async submitAnswer() {
        clearInterval(this.timer);
        
        const answerInput = document.getElementById('answer-input');
        const answer = answerInput ? answerInput.value : '';
        const timeSpent = 180 - this.timeLeft;
        
        if (!answer.trim()) {
            this.showError('Please provide an answer before submitting.');
            this.startInterview();
            return;
        }
        
        // Show loading state
        const submitBtn = document.querySelector('.submit-btn');
        const originalText = submitBtn ? submitBtn.textContent : 'Submit';
        if (submitBtn) {
            submitBtn.textContent = 'Analyzing...';
            submitBtn.disabled = true;
        }
        
        try {
            const result = await APIService.post('/interview/submit', {
                questionId: this.currentQuestion.id,
                answer: answer,
                timeSpent: timeSpent
            });
            
            this.showResults(result);
            
        } catch (error) {
            console.error('Failed to submit answer:', error);
            this.showError('Failed to submit answer. Please try again.');
            this.startInterview();
        } finally {
            if (submitBtn) {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }
    }
    
    static showResults(result) {
        const interviewActive = document.getElementById('interview-active');
        const resultsSection = document.getElementById('results-section');
        
        if (interviewActive) interviewActive.style.display = 'none';
        if (resultsSection) resultsSection.style.display = 'block';
        
        // Update score
        const scoreDisplay = document.getElementById('score-display');
        if (scoreDisplay) scoreDisplay.textContent = result.score;
        
        const feedbackText = document.getElementById('feedback-text');
        if (feedbackText) feedbackText.textContent = result.feedback;
        
        // Render strengths and improvements
        const strengthsList = document.getElementById('strengths-list');
        if (strengthsList) {
            strengthsList.innerHTML = (result.strengths || []).map(s => `<li>✅ ${s}</li>`).join('');
        }
        
        const improvementsList = document.getElementById('improvements-list');
        if (improvementsList) {
            improvementsList.innerHTML = (result.improvements || []).map(i => `<li>⚠️ ${i}</li>`).join('');
        }
        
        // Reload history
        this.loadHistory();
    }
    
    static async retryInterview() {
        const resultsSection = document.getElementById('results-section');
        const setupSection = document.getElementById('setup-section');
        const answerInput = document.getElementById('answer-input');
        
        if (resultsSection) resultsSection.style.display = 'none';
        if (setupSection) setupSection.style.display = 'block';
        if (answerInput) answerInput.value = '';
        
        // Reset timer color
        const timerDisplay = document.getElementById('timer');
        if (timerDisplay) timerDisplay.style.color = '#f44336';
    }
    
    static async loadHistory() {
        try {
            const history = await APIService.get('/interview/history');
            const container = document.getElementById('interview-history');
            
            if (!container) return;
            
            if (!history.interviews || history.interviews.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #999;">No interviews taken yet. Start practicing!</p>';
                return;
            }
            
            container.innerHTML = `
                <p style="margin-bottom: 0.5rem;"><strong>Average Score: ${history.averageScore}/10</strong></p>
                ${history.interviews.slice(0, 5).map(interview => `
                    <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: #f9f9f9; margin-bottom: 0.5rem; border-radius: 5px;">
                        <span>${new Date(interview.date).toLocaleDateString()}</span>
                        <span style="color: ${interview.score >= 7 ? '#4CAF50' : interview.score >= 5 ? '#ff9800' : '#f44336'}">
                            Score: ${interview.score}/10
                        </span>
                    </div>
                `).join('')}
            `;
        } catch (error) {
            console.error('Failed to load history:', error);
        }
    }
    
    static showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-error';
        errorDiv.style.cssText = `
            background: #ffebee;
            color: #c62828;
            padding: 0.75rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            border-left: 4px solid #c62828;
        `;
        errorDiv.textContent = message;
        const card = document.querySelector('.interview-card');
        if (card) {
            card.prepend(errorDiv);
            setTimeout(() => errorDiv.remove(), 5000);
        }
    }
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => InterviewManager.init());
} else {
    InterviewManager.init();
}

// Create global reference for HTML onclick handlers
window.InterviewManager = InterviewManager;