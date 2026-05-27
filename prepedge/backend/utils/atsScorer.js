// Advanced ATS scoring utilities
class ATSScorer {
    static calculateScore(resumeText, jobDescription = null) {
        let score = 70;
        const details = {};
        
        // Check for common sections
        const sections = ['experience', 'education', 'skills', 'projects', 'certifications'];
        const foundSections = sections.filter(s => 
            resumeText.toLowerCase().includes(s)
        );
        details.sectionsFound = foundSections;
        score += foundSections.length * 3;
        
        // Check for quantifiable achievements
        const hasNumbers = /\d+%|\d+\s+years|\d+\s*\+/.test(resumeText);
        if (hasNumbers) {
            score += 10;
            details.hasQuantifiable = true;
        }
        
        // Check for keywords (industry-specific)
        const commonKeywords = ['leadership', 'teamwork', 'communication', 'problem solving', 'analytical'];
        const matchedKeywords = commonKeywords.filter(k => 
            resumeText.toLowerCase().includes(k)
        );
        details.matchedKeywords = matchedKeywords;
        score += matchedKeywords.length * 2;
        
        // Check formatting (simplified)
        const hasBulletPoints = (resumeText.match(/[•\-*]/g) || []).length > 5;
        if (hasBulletPoints) {
            score += 5;
            details.formatting = 'Good use of bullet points';
        }
        
        return {
            score: Math.min(100, score),
            details,
            suggestions: this.generateSuggestions(foundSections, matchedKeywords, hasNumbers)
        };
    }
    
    static generateSuggestions(sections, keywords, hasNumbers) {
        const suggestions = [];
        
        if (!sections.includes('experience')) {
            suggestions.push("Add a detailed work experience section");
        }
        if (!sections.includes('skills')) {
            suggestions.push("Include a technical skills section");
        }
        if (!hasNumbers) {
            suggestions.push("Add quantifiable achievements (e.g., 'Improved efficiency by 25%')");
        }
        if (keywords.length < 3) {
            suggestions.push("Include more industry-relevant keywords");
        }
        suggestions.push("Customize your resume for each job application");
        
        return suggestions;
    }
}

module.exports = ATSScorer;