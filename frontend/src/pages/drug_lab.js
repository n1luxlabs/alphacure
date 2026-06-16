import { MolStarViewer } from "../components/viewer_molstar.js";
import { api } from "../services/api.js";

const DRUG_TARGETS = {
    covid: {
        name: "SARS-CoV-2 Main Protease (Mpro)",
        pdbId: "6lu7",
        activeSiteResi: 145, // Cys145 catalytic dyad
        candidates: [
            {
                name: "Paxlovid (Nirmatrelvir)",
                type: "specific",
                affinity: "-9.8 kcal/mol",
                result: "Success! High-affinity specific hydrogen bonding occurs at catalytic Cys145 site. Paxlovid forms a covalent bond, locking the protease active pocket, preventing viral replication.",
                efficiency: 98
            },
            {
                name: "Remdesivir",
                type: "moderate",
                affinity: "-6.2 kcal/mol",
                result: "Weak binding! Remdesivir is an RNA-dependent RNA polymerase inhibitor. While it has mild affinity, it doesn't target the protease active site specifically, yielding low enzymatic block efficiency.",
                efficiency: 25
            },
            {
                name: "Generic Aspirin",
                type: "poor",
                affinity: "-2.8 kcal/mol",
                result: "Failed! Aspirin is too small and lacks matching charge configurations to stay docked in the protease active pocket. It washes away with zero therapeutic block efficiency.",
                efficiency: 0
            }
        ]
    },
    alzheimer_plaques: {
        name: "Amyloid-Beta Fibril aggregate",
        pdbId: "2mxu",
        activeSiteResi: 22, // Glu22 aggregation point
        candidates: [
            {
                name: "LMTM (Tau/Amyloid Aggregation Inhibitor)",
                type: "specific",
                affinity: "-8.4 kcal/mol",
                result: "Success! LMTM binds specifically to the hydrophobic aggregation core, disrupting beta-sheet stack assembly, preventing further plaque deposition.",
                efficiency: 85
            },
            {
                name: "Paxlovid",
                type: "poor",
                affinity: "-3.1 kcal/mol",
                result: "Failed! Paxlovid's molecular structure does not match the flat, hydrophobic surface of the amyloid aggregates, yielding zero plaque disruption capability.",
                efficiency: 0
            },
            {
                name: "Generic Aspirin",
                type: "poor",
                affinity: "-2.5 kcal/mol",
                result: "Failed! Small molecule shows no specific binding interaction along the amyloid stacks. Aggregation proceeds normally.",
                efficiency: 0
            }
        ]
    }
};

export class DrugLab {
    constructor(containerId, triggerMascotAlert) {
        this.container = document.getElementById(containerId);
        this.triggerMascot = triggerMascotAlert;
        
        this.activeTargetKey = "covid";
        this.selectedCandidate = null;
        this.viewer = null;
        
        if (this.container) {
            this._renderSkeleton();
            this.initPage();
        }
    }
    
    async initPage() {
        this.render();
        await this.init3D();
        await this.loadTarget("covid");
        this.bindEvents();
    }
    
    _renderSkeleton() {
        this.container.innerHTML = `
            <div class="page-header">
                <div class="skeleton skeleton-line" style="height:2.5rem; width:55%; margin-bottom:16px;"></div>
                <div class="skeleton skeleton-line-sm" style="height:1.05rem; width:40%;"></div>
            </div>
        `;
    }
    
    render() {
        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="t-headline-lg">Drug Discovery <span class="t-primary">Lab</span></h1>
                <p class="t-body-md" style="margin-top:var(--space-2);">Simulate molecular docking. Select targets, test inhibitor candidate molecules, and analyze binding energies.</p>
            </div>
            
            <div class="viewer-split-layout">
                <div style="display:flex; flex-direction:column; gap:20px;">
                    <div class="glass-panel" style="padding:15px; display:flex; gap:10px; flex-wrap:wrap;">
                        <button class="btn btn-secondary active target-select" data-key="covid">SARS-CoV-2 Mpro (COVID-19)</button>
                        <button class="btn btn-secondary target-select" data-key="alzheimer_plaques">Amyloid-Beta Aggregates (Alzheimer's)</button>
                    </div>
                    
                    <div class="glass-panel" style="padding:0; overflow:hidden;">
                        <div class="viewer-3d-box">
                            <div id="viewer-drug-3d" class="viewer-canvas"></div>
                            <div class="viewer-overlay" id="drug-viewer-overlay">Interactive Target Protein Model</div>
                        </div>
                    </div>
                </div>
                
                <div style="display:flex; flex-direction:column; gap:25px;">
                    <div class="glass-panel">
                        <h3>Inhibitor Docking Station</h3>
                        <p style="font-size:1.05rem; color:var(--color-text-secondary); margin-bottom:20px;">Select a candidate compound to run docking test equations:</p>
                        
                        <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:20px;" id="drug-candidate-list"></div>
                        
                        <div class="progress-bar-container" style="display:none; margin:15px 0; height:8px;" id="dock-progress-box">
                            <div class="progress-bar" id="dock-progress-bar" style="width:0%;"></div>
                        </div>
                        
                        <button class="btn btn-primary" id="btn-run-docking" style="width:100%;">Run Docking Analysis</button>
                    </div>
                    
                    <div class="glass-panel" id="drug-result-card" style="flex-grow:1; display:none;">
                        <h3 style="color:var(--color-text-primary);">Binding Result</h3>
                        <div style="margin-top:15px; display:flex; flex-direction:column; gap:12px; font-size:1.05rem;">
                            <div>
                                <strong style="color:var(--color-primary);">Binding Affinity Score:</strong>
                                <span id="res-affinity" style="font-family:monospace; font-size:1.25rem; color:var(--color-danger); font-weight:700;">-9.8 kcal/mol</span>
                            </div>
                            <div>
                                <strong style="color:var(--color-primary);">Docking Analysis:</strong>
                                <span id="res-desc" style="color:var(--color-text-secondary);"></span>
                            </div>
                            <div class="profile-xp-bar" style="height:6px; margin-top:10px;">
                                <div class="profile-xp-fill" id="res-bar-fill" style="width: 0%; background:var(--color-success);"></div>
                            </div>
                            <div style="display:flex; justify-content:space-between; font-size:0.95rem; color:var(--color-text-secondary);">
                                <span>Inhibitor Block Efficiency:</span>
                                <span id="res-efficiency-lbl">0%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    async init3D() {
        this.viewer = new MolStarViewer("viewer-drug-3d");
        await this.viewer.ready();
    }
    
    bindEvents() {
        const targetBtns = this.container.querySelectorAll(".target-select");
        targetBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                targetBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                
                const key = btn.getAttribute("data-key");
                this.loadTarget(key);
            });
        });
        
        const runBtn = document.getElementById("btn-run-docking");
        runBtn.addEventListener("click", () => {
            this.runDockingSimulation();
        });
    }
    
    async loadTarget(key) {
        this.activeTargetKey = key;
        const target = DRUG_TARGETS[key];
        
        document.getElementById("drug-result-card").style.display = "none";
        this.selectedCandidate = null;
        
        // Populate drug list
        const listContainer = document.getElementById("drug-candidate-list");
        listContainer.innerHTML = target.candidates.map((c, i) => `
            <button class="option-btn cand-btn" data-idx="${i}">
                <strong>${c.name}</strong>
            </button>
        `).join("");
        
        // Bind candidate selection click - auto show result
        const candBtns = listContainer.querySelectorAll(".cand-btn");
        candBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                candBtns.forEach(b => {
                    b.classList.remove("active");
                    b.style.boxShadow = "none";
                });
                btn.classList.add("active");
                btn.style.boxShadow = "0 0 20px rgba(91, 107, 255, 0.4)";
                
                const idx = parseInt(btn.getAttribute("data-idx"), 10);
                this.selectedCandidate = target.candidates[idx];
                this.showDockingResult(this.selectedCandidate, target);
            });
        });
        
        // Load target structure
        const overlay = document.getElementById("drug-viewer-overlay");
        overlay.textContent = `Downloading ${target.name}...`;
        
        try {
            const structure = await api.getStructure(target.pdbId);
            await this.viewer.loadModel(structure.data);
            overlay.textContent = `${target.name} (${structure.source})`;
        } catch (e) {
            overlay.textContent = `Offline. Coords failed to load.`;
        }
    }
    
    runDockingSimulation() {
        if (!this.selectedCandidate) {
            this.triggerMascot("Please pick a drug candidate molecule from the docking station first!");
            return;
        }
        
        const cand = this.selectedCandidate;
        const target = DRUG_TARGETS[this.activeTargetKey];
        
        const progressBox = document.getElementById("dock-progress-box");
        const progressBar = document.getElementById("dock-progress-bar");
        const runBtn = document.getElementById("btn-run-docking");
        
        progressBox.style.display = "block";
        progressBar.style.width = "0%";
        runBtn.disabled = true;
        
        // Animate simulated calculation steps then highlight 3D
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            progressBar.style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    progressBox.style.display = "none";
                    runBtn.disabled = false;
                    this.highlightBinding(cand, target);
                }, 400);
            }
        }, 150);
    }
    
    async highlightBinding(cand, target) {
        if (cand.type === "specific") {
            await this.viewer.highlightMutation(target.activeSiteResi, "Bound Inhibitor Ligand");
            this.triggerMascot(`🔬 **${cand.name}** successfully bound to **${target.name}** with score **${cand.affinity}**! 3D view updated.`);
        } else {
            await this.viewer.applyStyle("cartoon");
            this.triggerMascot(`❌ **${cand.name}** could not block **${target.name}**. No specific binding detected.`);
        }
    }
    
    async showDockingResult(cand, target) {
        const card = document.getElementById("drug-result-card");
        const affinityEl = document.getElementById("res-affinity");
        const descEl = document.getElementById("res-desc");
        const fillEl = document.getElementById("res-bar-fill");
        const effLbl = document.getElementById("res-efficiency-lbl");
        
        card.style.display = "block";
        
        affinityEl.textContent = cand.affinity;
        descEl.innerHTML = cand.result;
        fillEl.style.width = `${cand.efficiency}%`;
        effLbl.textContent = `${cand.efficiency}%`;
        
        // Set color depending on affinity success
        if (cand.type === "specific") {
            affinityEl.style.color = "var(--color-success)";
            fillEl.style.background = "var(--color-success)";
        } else {
            affinityEl.style.color = "var(--color-danger)";
            fillEl.style.background = "var(--color-danger)";
        }
    }
}
