const BASE_URL = ""; // Relative URLs to match our Flask backend routing

export async function request(url, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };
    const skipLoader = options.skipLoader || false;
    // Show global loader if available
    if (!skipLoader) {
        try {
            if (window && typeof window.showLoader === 'function') window.showLoader();
        } catch (e) {}
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });
        const result = await response.json();
        if (response.ok && result.success) {
            return result;
        }
        throw new Error(result.error || `HTTP error ${response.status}`);
    } catch (error) {
        console.error(`API Request failed on ${url}:`, error);
        throw error;
    } finally {
        if (!skipLoader) {
            try {
                if (window && typeof window.hideLoader === 'function') window.hideLoader();
            } catch (e) {}
        }
    }
}

export const api = {
    // User Profile
    getProfile: async (userId = "default_user") => {
        try {
            const res = await request(`/api/auth/profile?user_id=${encodeURIComponent(userId)}`);
            return res.profile;
        } catch (e) {
            return null;
        }
    },
    
    updateProfile: async (userId, profileData) => {
        const res = await request("/api/auth/profile", {
            method: "POST",
            body: JSON.stringify({ user_id: userId, ...profileData })
        });
        return res.profile;
    },
    
    // AI Mentor
    chat: async (userId, message, context, history) => {
        const res = await request("/api/mentor/chat", {
            method: "POST",
            skipLoader: true,
            body: JSON.stringify({ user_id: userId, message, context, history })
        });
        return res.reply;
    },
    
    generateQuiz: async (userId, topic, difficulty) => {
        const res = await request("/api/mentor/quiz", {
            method: "POST",
            body: JSON.stringify({ user_id: userId, topic, difficulty })
        });
        return res.quiz;
    },
    
    // Protein coordinates
    getStructure: async (proteinId) => {
        const res = await request(`/api/protein/structure?id=${encodeURIComponent(proteinId)}`);
        return res; // returns { id, data, format, source }
    },
    
    // User RPG Progress & achievements
    updateProgress: async (userId, currentLevel, achievements, quizScores) => {
        const res = await request("/api/progress/update", {
            method: "POST",
            body: JSON.stringify({ user_id: userId, current_level: currentLevel, achievements, quiz_scores: quizScores })
        });
        return res.profile;
    },
    
    // Certificates
    issueCertificate: async (userId, name, score, level = 10) => {
        const res = await request("/api/progress/certificate/issue", {
            method: "POST",
            body: JSON.stringify({ user_id: userId, name, score, level })
        });
        return res.certificate;
    },
    
    verifyCertificate: async (certId) => {
        const res = await request(`/api/progress/certificate/verify?id=${encodeURIComponent(certId)}`);
        return res.certificate;
    },
    
    getLeaderboard: async (timeframe = "all_time") => {
        const res = await request(`/api/progress/leaderboard?timeframe=${encodeURIComponent(timeframe)}`);
        return res.leaderboard;
    },
    
    getDailyChallenge: async () => {
        const res = await request("/api/progress/daily_challenge");
        return res.challenge;
    },

    // Science News
    getScienceNews: async () => {
        const res = await request("/api/mentor/news");
        return res.news;
    },

    // Clinical Cases (AI-generated)
    getClinicalCases: async () => {
        const res = await request("/api/mentor/cases");
        return res.cases;
    }
};
