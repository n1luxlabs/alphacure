import { MolStarViewer } from "../components/viewer_molstar.js";
import { api } from "../services/api.js";

const CODON_MAP = {
    "AUG": "Met (M)",
    "CCA": "Pro (P)",
    "UUG": "Leu (L)",
    "GCA": "Ala (A)",
    "UGA": "STOP"
};

export class ProteinFactory {
    constructor(containerId, triggerMascotAlert) {
        this.container = document.getElementById(containerId);
        this.triggerMascot = triggerMascotAlert;
        this.stage = "transcription"; // transcription, export, translation, folding, complete
        this.dnaSeq = ["T", "A", "C", "G", "G", "T", "A", "A", "C", "C", "G", "T", "A", "C", "T"];
        this.mrnaSeq = [];
        this.translationIndex = 0;
        this.polypeptide = [];
        this.viewer = null;
        
        if (this.container) {
            this.render();
        }
    }
    
    render() {
        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="t-headline-lg">Protein <span class="t-primary">Factory Simulator</span></h1>
                <p class="t-body-md" style="margin-top:var(--space-2);">Transcribe genes, translate codons, and fold custom amino acid sequences in real time.</p>
            </div>
            
            <div class="viewer-split-layout">
                <div class="glass-panel" style="display:flex; flex-direction:column; justify-content:center; align-items:center; min-height:480px; position:relative;" id="factory-visual-core">
                    <!-- Dynamic rendering area based on current stage -->
                    <div id="factory-stage-content" style="width:100%;"></div>
                </div>
                
                <div style="display:flex; flex-direction:column; gap:25px;">
                    <div class="glass-panel">
                        <h3>Factory Control Panel</h3>
                        <p style="font-size:1rem; color:var(--color-text-secondary); margin-bottom:20px;" id="factory-control-desc">Click Transcribe to begin RNA Polymerase processing.</p>
                        
                        <div id="factory-btns" style="display:flex; flex-direction:column; gap:12px;">
                            <button class="btn btn-primary" id="btn-fac-action">Transcribe DNA</button>
                            <button class="btn btn-secondary" id="btn-fac-reset" style="display:none;">Reset Simulator</button>
                        </div>
                    </div>
                    
                    <div class="glass-panel" style="flex-grow:1;">
                        <h3 style="color:var(--color-primary-hover);">Cellular Compartment</h3>
                        <div style="margin-top:15px; font-size:1.05rem; display:flex; flex-direction:column; gap:10px;">
                            <div style="display:flex; justify-content:space-between;">
                                <span>Active organelle:</span>
                                <strong id="lbl-organelle" style="color:var(--color-primary-hover);">Nucleus (Vault)</strong>
                            </div>
                            <div style="border-top:1px solid var(--color-border); padding-top:10px;">
                                <strong style="color:var(--color-primary-hover);">Scientific Fact:</strong>
                                <p style="font-size:1rem; color:var(--color-text-secondary); margin-top:5px; margin-bottom:0;" id="lbl-cell-fact">
                                    DNA houses the hard-coded instructions. RNA polymerase unzips the strands to create a copy.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.updateStageView();
        this.bindEvents();
    }
    
    bindEvents() {
        const actionBtn = document.getElementById("btn-fac-action");
        const resetBtn = document.getElementById("btn-fac-reset");
        
        actionBtn.addEventListener("click", () => {
            this.handleAction();
        });
        
        resetBtn.addEventListener("click", () => {
            this.resetSimulator();
        });
    }
    
    updateStageView() {
        const contentDiv = document.getElementById("factory-stage-content");
        const descEl = document.getElementById("factory-control-desc");
        const actionBtn = document.getElementById("btn-fac-action");
        const resetBtn = document.getElementById("btn-fac-reset");
        const organelleEl = document.getElementById("lbl-organelle");
        const factEl = document.getElementById("lbl-cell-fact");
        
        switch (this.stage) {
            case "transcription":
                descEl.textContent = "Click Transcribe to read the DNA templates and construct the mRNA transcript.";
                actionBtn.textContent = "Transcribe DNA";
                actionBtn.style.display = "block";
                resetBtn.style.display = "none";
                organelleEl.textContent = "Nucleus (Vault)";
                factEl.textContent = "DNA molecules are double-stranded and locked inside the cell nucleus. The RNA Polymerase enzyme copies the code into a single-stranded messenger RNA.";
                
                contentDiv.innerHTML = `
                    <div style="text-align:center; padding:20px;">
                        <h4 style="color:var(--color-primary-hover); font-family:monospace; margin-bottom:15px;">DNA Template Strand:</h4>
                        <div style="display:flex; justify-content:center; gap:5px; font-family:monospace; font-size:1.35rem; font-weight:700; margin-bottom:25px;">
                            ${this.dnaSeq.map(b => `<div style="background:var(--color-border-soft); border:1px solid var(--color-border); width:32px; height:40px; display:flex; justify-content:center; align-items:center; border-radius:4px; color:var(--color-primary-hover);">${b}</div>`).join("")}
                        </div>
                        <h4 style="color:var(--color-primary-hover); font-family:monospace; margin-bottom:15px;">mRNA Transcript (Synthesized):</h4>
                        <div id="fac-mrna-grid" style="display:flex; justify-content:center; gap:5px; font-family:monospace; font-size:1.35rem; font-weight:700; min-height:40px;">
                            <span style="color:var(--color-text-muted); font-size:1.05rem;">Awaiting RNA polymerase activation...</span>
                        </div>
                    </div>
                `;
                break;
                
            case "export":
                descEl.textContent = "The mRNA copy has been compiled. Click Export to slide it through nuclear pores into the Cytoplasm.";
                actionBtn.textContent = "Export mRNA to Cytoplasm";
                organelleEl.textContent = "Nuclear Pores";
                factEl.textContent = "Nuclear pores act as gatekeepers, letting small messenger RNA copies pass through, while keeping the primary DNA vaults safe inside.";
                
                contentDiv.innerHTML = `
                    <div style="text-align:center; padding:20px; overflow:hidden;" id="fac-export-box">
                        <div style="background:var(--color-primary-soft); padding:20px; border-radius:10px; border:1px solid var(--color-primary-hover); max-width:400px; margin: 40px auto; font-family:monospace;">
                            <strong style="color:var(--color-primary-hover);">mRNA STRAND</strong><br>
                            <span style="font-size:1.35rem; font-weight:700; color:var(--color-success); letter-spacing:3px;">${this.mrnaSeq.join("")}</span>
                        </div>
                    </div>
                `;
                break;
                
            case "translation":
                descEl.textContent = "Click Translate to capture incoming tRNAs, read codons in triplets, and build the polypeptide.";
                actionBtn.textContent = "Translate Codon";
                organelleEl.textContent = "Ribosome (Cytoplasm)";
                factEl.textContent = "Ribosomes read mRNA in triplets called 'codons'. Each codon attracts a transfer RNA (tRNA) holding a specific amino acid bead, linking them with peptide bonds.";
                
                const currentCodon = this.getCurrentCodon();
                contentDiv.innerHTML = `
                    <div style="padding:20px; text-align:center;">
                        <h4 style="color:var(--color-primary-hover); margin-bottom:15px; font-family:monospace;">mRNA template sequence:</h4>
                        <div style="display:flex; justify-content:center; gap:5px; font-family:monospace; font-size:1.25rem; margin-bottom:20px;">
                            ${this.mrnaSeq.map((b, i) => {
                                const activeCodonIdx = Math.floor(this.translationIndex / 3);
                                const currentLetterCodonIdx = Math.floor(i / 3);
                                const isCurrent = activeCodonIdx === currentLetterCodonIdx;
                                return `<div style="background:${isCurrent ? 'var(--color-success-soft)' : 'var(--color-border-soft)'}; border:1px solid ${isCurrent ? 'var(--color-success)' : 'var(--color-border)'}; width:24px; height:32px; display:flex; justify-content:center; align-items:center; border-radius:4px; font-weight:700; color:${isCurrent ? 'var(--color-success)' : 'var(--color-text-muted)'};">${b}</div>`;
                            }).join("")}
                        </div>
                        
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; text-align:left; margin-bottom:20px;">
                            <div style="background:var(--color-surface); padding:15px; border-radius:8px; border:1px solid var(--color-border);">
                                <strong style="color:var(--color-primary-hover); font-size:1rem;">Active Codon:</strong><br>
                                <span style="font-size:1.55rem; font-weight:800; color:var(--color-primary-hover); font-family:monospace;">${currentCodon || 'STOP'}</span>
                                <br><span style="font-size:0.95rem; color:var(--color-text-muted);">Decodes to: ${CODON_MAP[currentCodon] || 'Stop Codon'}</span>
                            </div>
                            <div style="background:var(--color-surface); padding:15px; border-radius:8px; border:1px solid var(--color-border);">
                                <strong style="color:var(--color-primary-hover); font-size:1rem;">Polypeptide Chain:</strong><br>
                                <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">
                                    ${this.polypeptide.length > 0 
                                        ? this.polypeptide.map(p => `<span style="background:var(--color-primary); padding:2px 8px; border-radius:12px; font-size:1.05rem; font-family:monospace; color:var(--color-primary-hover);">${p}</span>`).join("")
                                        : '<span style="color:var(--color-text-muted); font-size:0.95rem;">[Empty]</span>'}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                break;
                
            case "folding":
                descEl.textContent = "The polypeptide is built! Click Fold to simulate molecular chaperones packing it into active 3D coordinates.";
                actionBtn.textContent = "Fold Polypeptide";
                organelleEl.textContent = "Cytoplasm chaperones";
                factEl.textContent = "Folding happens instantly. Hydrophobic collapses drive non-polar amino acids to pack into the core, stabilizing the active 3D conformation.";
                
                contentDiv.innerHTML = `
                    <div style="text-align:center; padding:20px;">
                        <h4 style="color:var(--color-primary-hover); margin-bottom:15px;">Completed Polypeptide Bead Chain:</h4>
                        <div style="display:flex; justify-content:center; gap:8px; margin-bottom:30px;">
                            ${this.polypeptide.map(p => `
                                <div style="width:36px; height:36px; border-radius:50%; background:radial-gradient(circle at 30% 30%, var(--color-primary-hover), var(--color-surface)); display:flex; justify-content:center; align-items:center; font-family:monospace; font-size:1.05rem; font-weight:700; color:var(--color-text-primary); box-shadow:0 4px 10px rgba(0,0,0,0.3); animation: float 3s infinite alternate;">${p.substring(0,3)}</div>
                            `).join(" <span style='color:var(--color-primary-hover); display:flex; align-items:center;'>-</span> ")}
                        </div>
                    </div>
                `;
                break;
                
            case "complete":
                descEl.textContent = "Folding complete! You have synthesized Insulin (Hormone regulator). insulin card has been unlocked in your album!";
                actionBtn.style.display = "none";
                resetBtn.style.display = "block";
                organelleEl.textContent = "Active hormone";
                factEl.textContent = "Congratulations! You completed the Central Dogma workflow: DNA transcribed to mRNA, translated to polypeptides, and folded to a biological regulator.";
                
                contentDiv.innerHTML = `
                    <div style="display:grid; grid-template-columns:1fr; gap:15px; padding:15px;">
                        <div class="viewer-3d-box" style="min-height:200px;">
                            <div id="viewer-factory-3d" class="viewer-canvas"></div>
                        </div>
                        <div style="background:var(--color-success-soft); border:1px solid var(--color-success); padding:10px; border-radius:8px; text-align:center; color:var(--color-success); font-weight:700;">
                            ✨ Collected Card Unlocked: Insulin Peptide
                        </div>
                    </div>
                `;
                
                // Initialize 3D molecular display for Insulin
                setTimeout(() => {
                    this.init3DInsulin();
                }, 100);
                break;
        }
    }
    
    getCurrentCodon() {
        if (this.translationIndex >= this.mrnaSeq.length) return null;
        return this.mrnaSeq.slice(this.translationIndex, this.translationIndex + 3).join("");
    }
    
    async handleAction() {
        const actionBtn = document.getElementById("btn-fac-action");
        actionBtn.disabled = true;
        
        if (this.stage === "transcription") {
            // Animate building RNA
            const rnaGrid = document.getElementById("fac-mrna-grid");
            rnaGrid.innerHTML = "";
            
            // Map bases
            const rnaMap = { "T": "A", "A": "U", "C": "G", "G": "C" };
            this.mrnaSeq = this.dnaSeq.map(b => rnaMap[b] || "X");
            
            let idx = 0;
            const timer = setInterval(() => {
                if (idx < this.mrnaSeq.length) {
                    const block = document.createElement("div");
                    block.style.background = "var(--color-success-soft)";
                    block.style.border = "1px solid var(--color-success)";
                    block.style.width = "32px";
                    block.style.height = "40px";
                    block.style.display = "flex";
                    block.style.justifyContent = "center";
                    block.style.alignItems = "center";
                    block.style.borderRadius = "4px";
                    block.style.color = "var(--color-success)";
                    block.style.opacity = "0";
                    block.style.transform = "translateY(-15px)";
                    block.textContent = this.mrnaSeq[idx];
                    
                    rnaGrid.appendChild(block);
                    gsap.to(block, { opacity: 1, y: 0, duration: 0.3 });
                    
                    idx++;
                } else {
                    clearInterval(timer);
                    actionBtn.disabled = false;
                    this.stage = "export";
                    this.triggerMascot("RNA polymerase processing complete! You have compiled the mRNA strand. Let's export it.");
                    this.updateStageView();
                }
            }, 200);
            
        } else if (this.stage === "export") {
            const box = document.getElementById("fac-export-box");
            gsap.to(box, {
                x: window.innerWidth,
                opacity: 0,
                duration: 1,
                ease: "power2.in",
                onComplete: () => {
                    actionBtn.disabled = false;
                    this.stage = "translation";
                    this.triggerMascot("The mRNA strand has entered the Cytoplasm and attached to a Ribosome. Let's translate it!");
                    this.updateStageView();
                }
            });
            
        } else if (this.stage === "translation") {
            const currentCodon = this.getCurrentCodon();
            
            if (currentCodon) {
                const aa = CODON_MAP[currentCodon];
                if (aa && aa !== "STOP") {
                    this.polypeptide.push(aa);
                }
                
                this.translationIndex += 3;
                this.triggerMascot(`Translated codon triplet: **${currentCodon}** -> **${aa || 'STOP'}**.`);
                
                if (this.translationIndex >= this.mrnaSeq.length || aa === "STOP") {
                    this.stage = "folding";
                    this.triggerMascot("Polypeptide assembly complete! Let's fold the chain into its active conformation.");
                }
                
                actionBtn.disabled = false;
                this.updateStageView();
            }
            
        } else if (this.stage === "folding") {
            const visualCore = document.getElementById("factory-visual-core");
            // Add flash and ripple animation
            gsap.to(visualCore, {
                backgroundColor: "rgba(167, 235, 242, 0.15)",
                duration: 0.4,
                yoyo: true,
                repeat: 1,
                onComplete: async () => {
                    this.stage = "complete";
                    actionBtn.disabled = false;
                    this.updateStageView();
                    
                    // Unlock Insulin in profiles
                    try {
                        await api.updateProfile("default_user", {
                            collected_protein: "insulin",
                            xp: 150 // XP reward for completing factory sim
                        });
                    } catch (e) {
                        console.error(e);
                    }
                }
            });
        }
    }
    
    async init3DInsulin() {
        this.viewer = new MolStarViewer("viewer-factory-3d");
        await this.viewer.ready();
        try {
            const structure = await api.getStructure("insulin");
            await this.viewer.loadModel(structure.data);
            await this.viewer.applyStyle("cartoon");
        } catch (e) {
            console.error("Insulin coordinate load failed inside factory simulator:", e);
        }
    }
    
    resetSimulator() {
        this.stage = "transcription";
        this.mrnaSeq = [];
        this.translationIndex = 0;
        this.polypeptide = [];
        this.updateStageView();
    }
}
