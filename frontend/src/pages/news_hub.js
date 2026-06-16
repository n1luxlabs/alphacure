import { api } from "../services/api.js";

export class ScienceNews {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.articles = [];
        
        if (this.container) {
            this.render();
            this.loadNews();
        }
    }
    
    render() {
        this.container.innerHTML = `
            <div class="page-header">
                <div class="skeleton skeleton-line" style="height:2.5rem; width:40%; margin-bottom:16px;"></div>
                <div class="skeleton skeleton-line-sm" style="height:1.05rem; width:45%;"></div>
            </div>
            <div id="news-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:25px;">
                ${Array(6).fill().map(() => `
                    <div class="skeleton-card" style="padding:24px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                            <div class="skeleton" style="width:60px; height:22px; border-radius:4px;"></div>
                            <div class="skeleton" style="width:50px; height:22px; border-radius:4px;"></div>
                        </div>
                        <div class="skeleton skeleton-line" style="height:1.15rem; margin-bottom:10px;"></div>
                        <div class="skeleton skeleton-line" style="margin-bottom:4px;"></div>
                        <div class="skeleton skeleton-line" style="margin-bottom:4px;"></div>
                        <div class="skeleton skeleton-line-sm" style="margin-bottom:15px;"></div>
                        <div class="skeleton" style="width:80px; height:18px; border-radius:4px;"></div>
                    </div>
                `).join("")}
            </div>
        `;

        setTimeout(() => this._renderContent(), 100);
    }

    _renderContent() {
        const header = this.container.querySelector(".page-header");
        if (header) {
            header.innerHTML = `
                <h1 class="t-headline-lg">Science <span class="t-primary">News Hub</span></h1>
                <p class="t-body-md" style="margin-top:var(--space-2);">Latest breakthroughs in computational biology and molecular medicine.</p>
            `;
        }
    }
    
    async loadNews() {
        try {
            const articles = await api.getScienceNews();
            if (articles && articles.length > 0) {
                this.articles = articles.sort((a, b) => {
                    const da = new Date(a.date);
                    const db = new Date(b.date);
                    return db - da;
                });
            }
        } catch (e) {
            console.error("Failed to fetch news:", e);
        }
        
        this.displayNews();
    }
    
    displayNews() {
        const grid = document.getElementById("news-grid");
        if (!grid) return;
        
        if (this.articles.length === 0) {
            grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--color-text-muted);">Could not fetch live news. Check your connection and try again.</div>`;
            return;
        }
        
        grid.innerHTML = this.articles.map(art => `
            <div class="hall-card unlocked" style="padding:24px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; font-size:1.05rem;">
                    <span style="background:var(--color-primary-soft); color:var(--color-primary-hover); padding:3px 8px; border-radius:4px; font-weight:700;">${art.category || "Science"}</span>
                    <span style="color:var(--color-text-muted);">${art.date || "Recent"}</span>
                </div>
                <h3 class="t-title-md" style="color:var(--text-main); margin-bottom:10px;">${art.title}</h3>
                <p class="t-body-sm" style="color:var(--color-text-secondary); margin-bottom:15px;">${art.summary}</p>
                <div style="font-size:1.05rem; color:var(--color-primary-hover); font-weight:700;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;display:inline;vertical-align:middle;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${art.readTime || "3 min read"}</div>
            </div>
        `).join("");
    }
}
