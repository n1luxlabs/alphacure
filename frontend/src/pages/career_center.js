import { api } from "../services/api.js";

const CAREER_TRACKS = [
    {
        title: "Bioinformatics",
        role: "Database architect & sequence analyst.",
        skills: "Python, BLAST sequence alignment, SQL, genomics mapping.",
        tools: "UniProt, NCBI GenBank, Ensembl, BLAST."
    },
    {
        title: "AI Drug Discovery",
        role: "Predictive chemist & docking researcher.",
        skills: "Machine learning, molecular dynamics, receptor modeling.",
        tools: "AutoDock Vina, Schrödinger Suite, PyMOL."
    },
    {
        title: "Structural Biology",
        role: "3D macromolecular visualizer & biophysicist.",
        skills: "X-ray crystallography, Cryo-EM, structure validation.",
        tools: "PDB, Mol*, PyMOL, ChimeraX."
    }
];

const L_BADGE = (path) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="width:24px;height:24px;">${path}</svg>`;

const ALL_BADGES = [
    { name: "Protein Beginner", desc: "Started the journey at Level 0", icon: L_BADGE('<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>') },
    { name: "Cell Explorer", desc: "Completed Level 1: Cellular Machinery", icon: L_BADGE('<path d="M10.5 2v2M6.5 12a4 4 0 0 0 4 4h2a4 4 0 0 0 0-8h-2"/><path d="M2 22v-2a6 6 0 0 1 6-6h8a6 6 0 0 1 6 6v2"/><path d="M10.5 22v-6"/>') },
    { name: "DNA Explorer", desc: "Completed Level 2: Blueprint bases", icon: L_BADGE('<path d="M16 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2"/><path d="M8 2v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2"/><path d="M12 12v6"/><path d="M4 20h16"/><path d="M12 22v-4"/>') },
    { name: "Protein Builder", desc: "Completed Level 4: Ribosome translation", icon: L_BADGE('<rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><path d="M8 22h8"/><path d="M12 14v8"/><path d="M2 10v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4"/>') },
    { name: "Protein Explorer", desc: "Completed Level 5: Folds and helices", icon: L_BADGE('<polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22 8.5 12 15.5 2 8.5"/>') },
    { name: "Mutation Hunter", desc: "Completed Level 6: Sequence substitution", icon: L_BADGE('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>') },
    { name: "AlphaFold Analyst", desc: "Completed Level 7: Machine learning predictions", icon: L_BADGE('<path d="M12 8V4m0 0L9 7m3-3l3 3"/><rect x="4" y="11" width="16" height="11" rx="2" ry="2"/><path d="M8 15v4"/><path d="M16 15v4"/><path d="M12 22v-4"/>') },
    { name: "Drug Discovery Intern", desc: "Completed Level 8: Inhibitor binding", icon: L_BADGE('<path d="M10 2v2M14 2v2"/><path d="M6 22h12"/><path d="M12 14v-6"/><path d="M7 22c0-5 5-12 5-12s5 7 5 12"/>') },
    { name: "Protein Master", desc: "Cleared Level 10 and issued final certificate", icon: L_BADGE('<path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M3 20h18"/>') }
];

export class CareerCenter {
    constructor(containerId, triggerMascotAlert) {
        this.container = document.getElementById(containerId);
        this.triggerMascot = triggerMascotAlert;
        this.userProfile = {
            name: "Curious Visitor",
            current_level: 0,
            achievements: []
        };
        
        if (this.container) {
            this._renderSkeleton();
            this.loadProfile();
        }
    }
    
    async loadProfile() {
        try {
            const profile = await api.getProfile("default_user");
            if (profile) {
                this.userProfile = profile;
            }
        } catch (e) {
            console.error("Failed loading profile in Career page:", e);
        }
        this.render();
        this.bindEvents();
    }
    
    _renderSkeleton() {
        this.container.innerHTML = `
            <div class="page-header">
                <div class="skeleton skeleton-line" style="height:2.5rem; width:55%; margin-bottom:16px;"></div>
                <div class="skeleton skeleton-line-sm" style="height:1.05rem; width:38%;"></div>
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:30px; margin-bottom:40px;">
                <div class="glass-panel">
                    <div class="skeleton skeleton-line" style="height:1.35rem; width:45%; margin-bottom:16px;"></div>
                    <div class="skeleton skeleton-line-sm" style="height:0.85rem; width:60%; margin-bottom:24px;"></div>
                    <div class="achievements-grid">
                        ${Array(9).fill().map(() => `
                            <div style="background:var(--color-surface); border:1px solid var(--color-border); border-radius:12px; padding:20px 10px; text-align:center;">
                                <div class="skeleton skeleton-circle" style="width:2.2rem; height:2.2rem; margin:0 auto 10px;"></div>
                                <div class="skeleton skeleton-line" style="height:0.8rem; width:70%; margin:0 auto 6px;"></div>
                                <div class="skeleton skeleton-line-sm" style="height:0.7rem; width:50%; margin:0 auto;"></div>
                            </div>
                        `).join("")}
                    </div>
                </div>
                <div class="glass-panel">
                    <div class="skeleton skeleton-line" style="height:1.35rem; width:40%; margin-bottom:16px;"></div>
                    <div class="skeleton skeleton-line" style="margin-bottom:8px;"></div>
                    <div class="skeleton skeleton-line-sm" style="margin-bottom:20px;"></div>
                    <div class="skeleton" style="width:100%; height:80px; border-radius:12px;"></div>
                </div>
            </div>
        `;
    }

    render() {
        const curLvl = this.userProfile.current_level;
        const achievements = this.userProfile.achievements || [];
        
        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="t-headline-lg">Career & <span class="t-primary">Achievements</span></h1>
                <p class="t-body-md" style="margin-top:var(--space-2);">Examine your unlocked badges, download certifications, and inspect computational biology roadmaps.</p>
            </div>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:30px; margin-bottom:40px;">
                <!-- Achievements list -->
                <div class="glass-panel">
                    <h3 class="t-headline-md">Your Achievements</h3>
                    <p class="t-body-sm" style="margin-bottom:var(--space-5);">Complete RPG checkpoints and clear quizzes to color badges:</p>
                    <div class="achievements-grid">
                        ${ALL_BADGES.map(b => {
                            const isUnlocked = achievements.includes(b.name);
                            return `
                                <div class="badge-item ${isUnlocked ? 'unlocked' : ''}">
                                    <div class="badge-icon">${b.icon}</div>
                                    <div class="badge-name">${b.name}</div>
                                    <div class="badge-desc">${b.desc}</div>
                                </div>
                            `;
                        }).join("")}
                    </div>
                </div>
                
                <!-- Certificate generator block -->
                <div class="glass-panel" style="display:flex; flex-direction:column; justify-content:space-between;">
                    <div>
                        <h3 class="t-headline-md">Certification Center</h3>
                        <p class="t-body-sm" style="margin-bottom:var(--space-5);">
                            Students who reach **Level 10 (Protein Master)** are eligible for a verified Certificate of Completion.
                        </p>
                    </div>
                    
                    ${curLvl >= 10 ? `
                        <div style="border-top:var(--border-width) solid var(--color-border); padding-top:var(--space-5);">
                            <div class="slider-group" style="margin-bottom:var(--space-4);">
                                <div class="slider-label"><span class="t-body-sm">Enter your Certificate Full Name:</span></div>
                                <input type="text" id="cert-student-name" class="mentor-text-input" value="${this.userProfile.name !== 'Curious Visitor' ? this.userProfile.name : ''}" placeholder="Jane Doe" style="width:100%;" />
                            </div>
                            <button class="btn btn-primary" id="btn-create-cert" style="width:100%;">Draw Certificate</button>
                        </div>
                    ` : `
                        <div class="surface" style="background:var(--color-danger-soft); border-color:rgba(255,58,92,0.2); padding:var(--space-4); color:var(--color-danger); font-size:1.05rem;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;display:inline;vertical-align:middle;margin-right:var(--space-2);"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            Certificate locked. You are currently at Level ${curLvl}. Advance to Level 10 on the structured RPG journey map to unlock certification draws.
                        </div>
                    `}
                </div>
            </div>
            
            <!-- Certificate display modal wrapper -->
            <div id="cert-render-box" style="display:none;" class="glass-panel text-center">
                <h3 class="t-headline-md" style="color:var(--color-primary-hover); margin-bottom:var(--space-5);">Your Generated Certificate</h3>
                <canvas id="cert-canvas" class="certificate-canvas" width="800" height="560"></canvas>
                <div class="row" style="justify-content:center; gap:var(--space-4);">
                    <button class="btn btn-primary" id="btn-download-cert">Download Image (PNG)</button>
                    <button class="btn btn-secondary" id="btn-hide-cert">Close Display</button>
                </div>
            </div>
            
            <!-- Career roadmaps -->
            <div class="glass-panel" style="margin-top:var(--space-5);">
                <h3 class="t-headline-md">Computational Biology Roadmaps</h3>
                <p class="t-body-sm" style="margin-bottom:var(--space-6);">Scientific disciplines utilizing these computational workflows:</p>
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:var(--space-5);">
                    ${CAREER_TRACKS.map(t => `
                        <div class="surface" style="background:var(--color-primary-soft); border-color:var(--color-border); padding:var(--space-5);">
                            <h4 class="t-title-md" style="color:var(--color-primary-hover); margin-bottom:var(--space-2);">${t.title}</h4>
                            <p class="t-body-sm" style="color:var(--color-text-primary); margin-bottom:var(--space-2);">${t.role}</p>
                            <div class="t-label-sm" style="color:var(--color-text-secondary); margin-bottom:var(--space-1);">Core Skills: ${t.skills}</div>
                            <div class="t-label-sm" style="color:var(--color-primary-hover);">Key Tools: ${t.tools}</div>
                        </div>
                    `).join("")}
                </div>
            </div>
        `;
    }
    
    bindEvents() {
        const createBtn = document.getElementById("btn-create-cert");
        if (createBtn) {
            createBtn.addEventListener("click", () => {
                this.generateCertificateCanvas();
            });
        }
        
        const hideBtn = document.getElementById("btn-hide-cert");
        if (hideBtn) {
            hideBtn.addEventListener("click", () => {
                document.getElementById("cert-render-box").style.display = "none";
            });
        }
        
        const downloadBtn = document.getElementById("btn-download-cert");
        if (downloadBtn) {
            downloadBtn.addEventListener("click", () => {
                this.downloadCertificate();
            });
        }
    }
    
    async generateCertificateCanvas() {
        const inputName = document.getElementById("cert-student-name").value.trim() || "Protein Master Student";
        
        // Update user profile name if they changed it
        try {
            await api.updateProfile("default_user", inputName);
            this.userProfile.name = inputName;
        } catch (e) {}
        
        let certDetails = null;
        try {
            certDetails = await api.issueCertificate("default_user", inputName, 100);
        } catch (e) {
            console.error("Failed issuing certificate:", e);
            // offline fallback id
            certDetails = {
                id: `PVX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                name: inputName,
                issued_at: new Date().toISOString()
            };
        }
        
        document.getElementById("cert-render-box").style.display = "block";
        document.getElementById("cert-render-box").scrollIntoView({ behavior: "smooth" });
        
        const canvas = document.getElementById("cert-canvas");
        const ctx = canvas.getContext("2d");
        
        // Draw elegant Certificate Layout
        ctx.fillStyle = "#011c40"; // Dark navy background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Outer molecular double borders
        ctx.strokeStyle = "#54ACBF";
        ctx.lineWidth = 3;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
        
        ctx.strokeStyle = "#A7EBF2";
        ctx.lineWidth = 1;
        ctx.strokeRect(26, 26, canvas.width - 52, canvas.height - 52);
        
        // Certificate Title
        ctx.fillStyle = "#A7EBF2";
        ctx.font = "bold 32px 'Inter', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("CERTIFICATE OF COMPLETION", canvas.width / 2, 90);
        
        ctx.fillStyle = "#90b8c9";
        ctx.font = "italic 16px 'Inter', sans-serif";
        ctx.fillText("This is proudly awarded to", canvas.width / 2, 160);
        
        // Student Name
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 38px 'Inter', sans-serif";
        ctx.fillText(certDetails.name, canvas.width / 2, 220);
        
        // Content Body
        ctx.fillStyle = "#e8f4f8";
        ctx.font = "16px 'Inter', sans-serif";
        ctx.fillText("for successfully completing the 10-level advanced structured curriculum in", canvas.width / 2, 290);
        ctx.fillStyle = "#A7EBF2";
        ctx.font = "bold 18px 'Inter', sans-serif";
        ctx.fillText("AlphaCure: Computational Molecular Biology & AI Drug Design", canvas.width / 2, 320);
        
        ctx.fillStyle = "#90b8c9";
        ctx.font = "14px 'Inter', sans-serif";
        ctx.fillText("The student demonstrated expertise in Cells, transcription, ribosome translation, 3D folding,", canvas.width / 2, 360);
        ctx.fillText("point mutation pathologies, and AlphaFold neural coordinates prediction analyses.", canvas.width / 2, 385);
        
        // Verification ID & Date
        ctx.fillStyle = "#54ACBF";
        ctx.font = "13px 'JetBrains Mono', monospace";
        ctx.textAlign = "left";
        ctx.fillText(`Verification ID: ${certDetails.id}`, 50, 470);
        
        const dateStr = new Date(certDetails.issued_at).toLocaleDateString();
        ctx.fillText(`Issue Date: ${dateStr}`, 50, 495);
        
        // Draw stylized Verification QR block
        ctx.fillStyle = "#A7EBF2";
        ctx.fillRect(canvas.width - 150, canvas.height - 150, 100, 100);
        
        // Simulate QR pixels
        ctx.fillStyle = "#011c40";
        ctx.fillRect(canvas.width - 145, canvas.height - 145, 90, 90);
        
        ctx.fillStyle = "#A7EBF2";
        // QR corners
        ctx.fillRect(canvas.width - 140, canvas.height - 140, 25, 25);
        ctx.fillRect(canvas.width - 90, canvas.height - 140, 25, 25);
        ctx.fillRect(canvas.width - 140, canvas.height - 90, 25, 25);
        // Inner white blocks
        ctx.fillStyle = "#011c40";
        ctx.fillRect(canvas.width - 135, canvas.height - 135, 15, 15);
        ctx.fillRect(canvas.width - 85, canvas.height - 135, 15, 15);
        ctx.fillRect(canvas.width - 135, canvas.height - 85, 15, 15);
        
        // Center text signatures
        ctx.fillStyle = "#e8f4f8";
        ctx.font = "italic 16px 'Inter', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("N1LUX AI", canvas.width / 2, 470);
        ctx.strokeStyle = "#54ACBF";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 60, 480);
        ctx.lineTo(canvas.width / 2 + 60, 480);
        ctx.stroke();
        ctx.fillStyle = "#90b8c9";
        ctx.font = "12px 'Inter', sans-serif";
        ctx.fillText("Director of Cellular Engineering", canvas.width / 2, 495);
        
        this.triggerMascot(`Incredible achievement! Your certificate has been issued and drawn on the Canvas. You can download the high-resolution PNG file below!`);
    }
    
    downloadCertificate() {
        const canvas = document.getElementById("cert-canvas");
        if (!canvas) return;
        
        // Trigger file download
        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = `AlphaCure_Certificate_${this.userProfile.name.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}
