import { api } from "../services/api.js";

export class Leaderboard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.timeframe = "all_time";
        this.filter = "global";
        this.records = [];
        
        if (this.container) {
            this.render();
        }
    }
    
    render() {
        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="t-headline-lg">Leaderboard <span class="t-primary">Rankings</span></h1>
                <p class="t-body-md" style="margin-top:var(--space-2);">Track your progress against peers across classes and schools.</p>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px; flex-wrap:wrap; gap:15px;">
                <div style="display:flex; gap:10px;">
                    <div class="skeleton" style="width:80px; height:36px; border-radius:12px;"></div>
                    <div class="skeleton" style="width:80px; height:36px; border-radius:12px;"></div>
                    <div class="skeleton" style="width:80px; height:36px; border-radius:12px;"></div>
                </div>
                <div style="display:flex; gap:10px;">
                    <div class="skeleton" style="width:70px; height:36px; border-radius:12px;"></div>
                    <div class="skeleton" style="width:80px; height:36px; border-radius:12px;"></div>
                    <div class="skeleton" style="width:80px; height:36px; border-radius:12px;"></div>
                </div>
            </div>
            <div class="glass-panel" style="padding:0; overflow:hidden;">
                <table style="width:100%; border-collapse:collapse; text-align:left; font-size:1.25rem;" id="leaderboard-table">
                    <thead>
                        <tr style="background:var(--color-primary-soft); border-bottom:1px solid var(--color-border); color:var(--color-primary-hover);">
                            <th style="padding:15px 20px; font-weight:700; width:80px;">Rank</th>
                            <th style="padding:15px 20px; font-weight:700;">Student Name</th>
                            <th style="padding:15px 20px; font-weight:700; width:150px;">Class</th>
                            <th style="padding:15px 20px; font-weight:700; width:180px;">School</th>
                            <th style="padding:15px 20px; font-weight:700; width:100px;">Level</th>
                            <th style="padding:15px 20px; font-weight:700; width:120px; text-align:right;">Total XP</th>
                        </tr>
                    </thead>
                    <tbody id="leaderboard-rows" style="color:var(--text-main);">
                        ${Array(5).fill().map(() => `
                            <tr>
                                <td style="padding:12px 20px;"><div class="skeleton" style="width:30px; height:20px;"></div></td>
                                <td style="padding:12px 20px;"><div class="skeleton skeleton-line" style="width:60%;"></div></td>
                                <td style="padding:12px 20px;"><div class="skeleton skeleton-line-sm" style="width:50%;"></div></td>
                                <td style="padding:12px 20px;"><div class="skeleton skeleton-line-sm" style="width:45%;"></div></td>
                                <td style="padding:12px 20px;"><div class="skeleton" style="width:40px; height:20px;"></div></td>
                                <td style="padding:12px 20px; text-align:right;"><div class="skeleton" style="width:50px; height:20px; margin-left:auto;"></div></td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
        
        this.bindEvents();
        this.loadLeaderboard();
    }
    
    bindEvents() {
        const timeBtns = this.container.querySelectorAll(".time-filter");
        timeBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                timeBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                this.timeframe = btn.getAttribute("data-time");
                this.loadLeaderboard();
            });
        });
        
        const groupBtns = this.container.querySelectorAll(".group-filter");
        groupBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                groupBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                this.filter = btn.getAttribute("data-filter");
                this.loadLeaderboard();
            });
        });
    }
    
    async loadLeaderboard() {
        const rowsDiv = document.getElementById("leaderboard-rows");
        rowsDiv.innerHTML = `<tr><td colspan="6" style="padding:40px; text-align:center; color:var(--color-text-muted);">Loading rankings data...</td></tr>`;
        
        try {
            const ranks = await api.getLeaderboard(this.timeframe);
            const user = await api.getProfile("default_user") || {};
            
            // Apply filtering logic locally to mock multi-user values
            let filtered = [...ranks];
            
            // If API returns no ranks, show friendly message
            if (!filtered || filtered.length === 0) {
                rowsDiv.innerHTML = `<tr><td colspan="6" style="padding:40px; text-align:center; color:var(--color-text-muted);">No leaderboard data available yet. Start playing to appear on the leaderboard.</td></tr>`;
                return;
            }
            
            // Filter list based on selected filter group
            if (this.filter === "class" && user.class_name) {
                filtered = filtered.filter(item => item.class_name === user.class_name);
            } else if (this.filter === "school" && user.school) {
                filtered = filtered.filter(item => item.school === user.school);
            }
            
            if (filtered.length === 0) {
                rowsDiv.innerHTML = `<tr><td colspan="6" style="padding:40px; text-align:center; color:var(--color-text-muted);">No matching students found in this group.</td></tr>`;
                return;
            }
            
            rowsDiv.innerHTML = filtered.map((r, i) => {
                const rank = i + 1;
                let rankStr = rank;
                
                if (rank === 1) rankStr = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;color:var(--color-warning);vertical-align:middle;"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M3 20h18"/></svg> 1`;
                else if (rank === 2) rankStr = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;color:var(--color-text-secondary);vertical-align:middle;"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg> 2`;
                else if (rank === 3) rankStr = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;color:var(--color-text-muted);vertical-align:middle;"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg> 3`;
                
                // Highlight current active user
                const isCurrUser = r.username === user.username;
                const rowBg = isCurrUser ? "var(--color-primary-soft)" : "";
                
                return `
                    <tr style="background:${rowBg}; border-bottom:1px solid var(--color-border); transition: background 0.2s;">
                        <td style="padding:12px 20px; font-weight:700; color:${rank <= 3 ? 'var(--color-primary-hover)' : 'var(--color-text-muted)'};">${rankStr}</td>
                        <td style="padding:12px 20px; font-weight:600; color:${isCurrUser ? '#fff' : 'var(--color-text-secondary)'};">
                            ${r.name} <span style="font-size:1.05rem; color:var(--color-text-muted); font-weight:normal; margin-left:5px;">@${r.username}</span>
                        </td>
                        <td style="padding:12px 20px; color:var(--color-text-muted); font-size:1rem;">${r.class_name}</td>
                        <td style="padding:12px 20px; color:var(--color-text-muted); font-size:1rem;">${r.school || 'Self Study'}</td>
                        <td style="padding:12px 20px; font-weight:700; color:var(--color-primary-hover);">Lvl ${r.current_level}</td>
                        <td style="padding:12px 20px; text-align:right; font-family:monospace; font-weight:700; color:var(--color-primary);">${r.xp}</td>
                    </tr>
                `;
            }).join("");
            
        } catch (e) {
            rowsDiv.innerHTML = `<tr><td colspan="6" style="padding:40px; text-align:center; color:var(--color-danger);">Failed to load leaderboard ranks.</td></tr>`;
        }
    }
}
