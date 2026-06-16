import { api } from "../services/api.js";

const L_ICON_COL = (path) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="width:36px;height:36px;">${path}</svg>`;

const COLLECTION_PROTEINS = [
    { key: "hemoglobin", name: "Hemoglobin", icon: L_ICON_COL('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>'), role: "Oxygen Transport", desc: "Found in red blood cells. Binds oxygen inside four iron-rich heme pockets." },
    { key: "insulin", name: "Insulin", icon: L_ICON_COL('<path d="M10.5 2v2M6.5 12a4 4 0 0 0 4 4h2a4 4 0 0 0 0-8h-2"/><path d="M2 22v-2a6 6 0 0 1 6-6h8a6 6 0 0 1 6 6v2"/><path d="M10.5 22v-6"/>'), role: "Hormone Regulator", desc: "Pancreatic hormone peptide. Regulates cellular glucose gates." },
    { key: "collagen", name: "Collagen", icon: L_ICON_COL('<path d="M3 3v18h18"/><path d="M4 12h16"/><path d="M7 12a5 5 0 0 1 5 5"/><path d="M17 12a5 5 0 0 0-5 5"/>'), role: "Skin & Bone Scaffold", desc: "Tough structural triple-helix providing skin elasticity and bone support." },
    { key: "egfr", name: "EGFR", icon: L_ICON_COL('<rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>'), role: "Division Signaling", desc: "Gateway receptor guiding cell growth. Often mutated in cancers." },
    { key: "tau", name: "Tau Protein", icon: L_ICON_COL('<circle cx="12" cy="5" r="1.5"/><path d="M9 22v-5l-3-4 2-7h8l2 7-3 4v5"/>'), role: "Neuron Skeleton", desc: "Stabilizes microtubules in brain axons. Forms tangles in dementia." },
    { key: "myosin", name: "Myosin", icon: L_ICON_COL('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'), role: "Muscle Motor", desc: "Molecular motor pulling actin filaments to contract muscles." }
];

export class ProteinCollection {
    constructor(containerId, triggerMascotAlert) {
        this.container = document.getElementById(containerId);
        this.triggerMascot = triggerMascotAlert;
        this.profile = {
            collected_proteins: ["hemoglobin"],
            favorite_proteins: []
        };
        
        if (this.container) {
            this._renderSkeleton();
            this.loadProfile();
        }
    }
    
    async loadProfile() {
        try {
            const p = await api.getProfile("default_user");
            if (p) {
                this.profile = p;
            }
        } catch (e) {
            console.error("Failed loading profile in album:", e);
        }
        this.render();
        this.bindEvents();
    }
    
    _renderSkeleton() {
        this.container.innerHTML = `
            <div class="page-header">
                <div class="skeleton skeleton-line" style="height:2.5rem; width:50%; margin-bottom:16px;"></div>
                <div class="skeleton skeleton-line-sm" style="height:1.05rem; width:42%;"></div>
            </div>
            <div class="museum-halls-grid">
                ${Array(6).fill().map(() => `
                    <div class="skeleton-card">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                            <div class="skeleton skeleton-circle" style="width:2.8rem; height:2.8rem;"></div>
                            <div class="skeleton" style="width:60px; height:28px; border-radius:6px;"></div>
                        </div>
                        <div class="skeleton skeleton-line" style="height:1.2rem; width:65%; margin-bottom:8px;"></div>
                        <div class="skeleton skeleton-line" style="height:0.8rem; width:40%; margin-bottom:10px;"></div>
                        <div class="skeleton skeleton-line" style="margin-bottom:4px;"></div>
                        <div class="skeleton skeleton-line skeleton-line-sm"></div>
                    </div>
                `).join("")}
            </div>
        `;
    }

    render() {
        const collected = this.profile.collected_proteins || ["hemoglobin"];
        const favorites = this.profile.favorite_proteins || [];
        
        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="t-headline-lg">Protein <span class="t-primary">Collection Album</span></h1>
                <p class="t-body-md" style="margin-top:var(--space-2);">Collect and inspect biological nanomachines as you complete RPG chapters. Progress: ${collected.length} / ${COLLECTION_PROTEINS.length}</p>
            </div>
            
            <div class="museum-halls-grid">
                ${COLLECTION_PROTEINS.map(p => {
                    const isUnlocked = collected.includes(p.key);
                    const isFavorite = favorites.includes(p.name);
                    
                    return `
                        <div class="hall-card ${isUnlocked ? 'unlocked' : 'locked'}" style="opacity: ${isUnlocked ? 1 : 0.45}; filter: ${isUnlocked ? 'none' : 'grayscale(100%)'}; cursor: ${isUnlocked ? 'default' : 'not-allowed'};">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-3);">
                                <span style="color:var(--color-primary-hover);">${p.icon}</span>
                                ${isUnlocked ? `
                                    <button class="btn btn-tertiary btn-sm fav-btn ${isFavorite ? 'active' : ''}" data-name="${p.name}" style="margin:0; gap:4px;">
                                        <svg viewBox="0 0 24 24" fill="${isFavorite ? 'var(--color-danger)' : 'none'}" stroke="var(--color-danger)" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                                        <span>${isFavorite ? 'Fav' : 'Fav'}</span>
                                    </button>
                                ` : `
                                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                `}
                            </div>
                            <h3 class="t-title-md" style="margin-bottom:2px;">${p.name}</h3>
                            <p class="t-label-sm" style="color:var(--color-primary-hover); margin-bottom:var(--space-3);">${p.role}</p>
                            <p class="t-body-sm" style="margin:0;">
                                ${isUnlocked ? p.desc : "Unlock this card by completing related challenges or finding it on the body map."}
                            </p>
                        </div>
                    `;
                }).join("")}
            </div>
        `;
    }
    
    bindEvents() {
        const favBtns = this.container.querySelectorAll(".fav-btn");
        favBtns.forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.stopPropagation();
                const protName = btn.getAttribute("data-name");
                try {
                    const updated = await api.updateProfile("default_user", {
                        favorite_protein: protName
                    });
                    if (updated) {
                        this.profile = updated;
                        this.render();
                        this.bindEvents(); // Rebind
                        
                        const isFavNow = this.profile.favorite_proteins.includes(protName);
                        this.triggerMascot(isFavNow ? `You added **${protName}** to your Favorite Proteins list!` : `Removed **${protName}** from favorites.`);
                    }
                } catch (e) {
                    console.error("Failed toggling favorite:", e);
                }
            });
        });
    }
}
