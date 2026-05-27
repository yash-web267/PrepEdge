// Authentication Service
class AuthService {
    static async signup(name, email, password) {
        try {
            const data = await APIService.post('/auth/signup', { name, email, password });
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                return { success: true };
            }
            return { success: false, error: data.error || 'Signup failed' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    static async login(email, password) {
        try {
            const data = await APIService.post('/auth/login', { email, password });
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                return { success: true };
            }
            return { success: false, error: data.error || 'Login failed' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    static isAuthenticated() {
        return !!localStorage.getItem('token');
    }
    
    static getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
    
    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}

// Make available globally
window.AuthService = AuthService;