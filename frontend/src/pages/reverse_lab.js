import { MolStarViewer } from "../components/viewer_molstar.js";

export class ReverseLab {
    constructor(containerId, initialCifData) {
        this.container = document.getElementById(containerId);
        this.cifData = initialCifData;
        this.viewer = null;
        this.currentStep = "sequence";
        
        if (this.container) {
            this._renderSkeleton();
            this.render();
            this.init3D();
            this.bindEvents();
            this.selectStep("sequence");
        }
    }
    
    render() {
        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="t-headline-lg">Reverse Engineering <span class="t-primary">Lab</span></h1>
                <p class="t-body-md" style="margin-top:var(--space-2);">Deconstruct a complex 3D protein fold layer-by-layer back to its fundamental amino acid sequence.</p>
            </div>
            
            <div class="viewer-split-layout">
                <div class="glass-panel" style="padding: 0; overflow:hidden;">
                    <div class="viewer-3d-box">
                        <div id="viewer-reverse-3d" class="viewer-canvas"></div>
                        <div class="viewer-toolbar" id="reverse-viewer-overlay">Interactive 3D model (Hemoglobin)</div>
                        <div class="viewer-legends" id="reverse-legends" style="display:none;"></div>
                    </div>
                </div>
                
                <div style="display:flex; flex-direction:column; gap:25px;">
                    <div class="glass-panel controls-card">
                        <h3>Deconstruction Steps</h3>
                        <p style="font-size:1.05rem; color:var(--color-text-secondary); margin-bottom:20px;">Click each architectural layer to peel it back:</p>
                        
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            <button class="btn btn-secondary step-btn active" data-step="sequence">
                                <strong>Layer 1: Raw Sequence</strong><br>
                                <span style="font-size:0.95rem; opacity:0.8;">The raw DNA-decoded text string</span>
                            </button>
                            
                            <button class="btn btn-secondary step-btn" data-step="primary">
                                <strong>Layer 2: Primary Structure</strong><br>
                                <span style="font-size:0.95rem; opacity:0.8;">The linear chain of amino acid chemical beads</span>
                            </button>
                            
                            <button class="btn btn-secondary step-btn" data-step="secondary">
                                <strong>Layer 3: Secondary Structure</strong><br>
                                <span style="font-size:0.95rem; opacity:0.8;">Alpha-helices and beta-sheets components</span>
                            </button>
                            
                            <button class="btn btn-secondary step-btn" data-step="tertiary">
                                <strong>Layer 4: Tertiary Structure</strong><br>
                                <span style="font-size:0.95rem; opacity:0.8;">The complete 3D active molecule fold</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="glass-panel" style="flex-grow:1;">
                        <h3 id="step-title">Tertiary Fold</h3>
                        <div id="step-desc" style="font-size:1.25rem; color:var(--color-text-secondary); line-height:1.6; margin-bottom:20px;"></div>
                        
                        <div id="sequence-display-box" style="display:none;">
                            <h4 style="color:var(--color-primary-hover); margin-bottom:10px; font-size:1.05rem; font-family: monospace;">Sequence Decoder:</h4>
                            <div id="reverse-seq-letters" style="font-family:monospace; word-break:break-all; font-size:1.25rem; line-height:1.8; letter-spacing:1px; background:var(--color-surface); padding:15px; border-radius:8px; border:1px solid var(--color-border); max-height:150px; overflow-y:auto; color:var(--color-primary-hover);"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    _renderSkeleton() {
        this.container.innerHTML = `
            <div class="page-header">
                <div class="skeleton skeleton-line" style="height:2.5rem; width:50%; margin-bottom:16px;"></div>
                <div class="skeleton skeleton-line-sm" style="height:1.05rem; width:42%;"></div>
            </div>
            <div class="viewer-split-layout">
                <div class="skeleton-card" style="height:320px;"></div>
                <div style="display:flex; flex-direction:column; gap:25px;">
                    <div class="skeleton-card" style="height:300px;">
                        <div class="skeleton skeleton-line" style="height:1.2rem; width:45%; margin-bottom:12px;"></div>
                        <div class="skeleton skeleton-line-sm" style="margin-bottom:6px;"></div>
                        <div class="skeleton skeleton-line-sm" style="width:35%;"></div>
                        <div style="display:flex; flex-direction:column; gap:12px; margin-top:25px;">
                            <div class="skeleton skeleton-line" style="height:3.2rem; border-radius:8px;"></div>
                            <div class="skeleton skeleton-line" style="height:3.2rem; border-radius:8px;"></div>
                            <div class="skeleton skeleton-line" style="height:3.2rem; border-radius:8px;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async init3D() {
        this.viewer = new MolStarViewer("viewer-reverse-3d");
        await this.viewer.ready();
        if (this.cifData) {
            await this.viewer.loadModel(this.cifData);
        }
    }
    
    bindEvents() {
        const stepBtns = this.container.querySelectorAll(".step-btn");
        stepBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                stepBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                
                const step = btn.getAttribute("data-step");
                this.selectStep(step);
            });
        });
    }
    
    async selectStep(step) {
        this.currentStep = step;
        const titleEl = document.getElementById("step-title");
        const descEl = document.getElementById("step-desc");
        const seqBox = document.getElementById("sequence-display-box");
        const legends = document.getElementById("reverse-legends");
        const overlay = document.getElementById("reverse-viewer-overlay");
        
        if (!this.viewer) return;
        await this.viewer.ready();
        if (!this.viewer.initialized) return;
        
        switch (step) {
            case "sequence":
                titleEl.textContent = "Raw Sequence Codes";
                descEl.innerHTML = `
                    At the bottom layer, the protein is simply a string of letters—the <strong>Amino Acid Sequence</strong>. 
                    Each letter corresponds to an amino acid residue. 
                    This sequence is decoded directly from DNA codons in the nucleus. 
                    Hover over letters to trace them in the 3D model.
                `;
                seqBox.style.display = "block";
                legends.style.display = "none";
                overlay.textContent = "Amino Acid String Translation";
                
                const sequence = "MVHLTPEEKSAVTALWGKVNVDEVGGEALGRLLVVYPWTQRFFESFGDLSTPDAVMGNPKVKAHGKKVLGAFSDGLAHLDNLKGTFATLSELHCDKLHVDPENFRLLGNVLVCVLAHHFGKEFTPPVQAAYQKVVAGVANALAHKYH";
                const seqDisplay = document.getElementById("reverse-seq-letters");
                
                seqDisplay.innerHTML = sequence.split('').map((char, i) => `
                    <span class="seq-char" data-idx="${i + 1}" style="cursor:pointer; padding:2px; display:inline-block; font-weight:700; transition:all 0.2s;">${char}</span>
                `).join("");
                
                await this.viewer.applyStyle("stick");
                await this.viewer.focusStructure();
                
                const letterSpans = seqDisplay.querySelectorAll(".seq-char");
                letterSpans.forEach(span => {
                    span.addEventListener("mouseenter", async () => {
                        span.style.color = "var(--color-text-primary)";
                        span.style.background = "var(--color-primary)";
                        span.style.transform = "scale(1.2)";
                        
                        const idx = parseInt(span.getAttribute("data-idx"), 10);
                        await this.viewer.highlightMutation(idx, span.textContent);
                    });
                    
                    span.addEventListener("mouseleave", () => {
                        span.style.color = "";
                        span.style.background = "";
                        span.style.transform = "";
                    });
                });
                break;
                
            case "primary":
                titleEl.textContent = "Primary Structure";
                descEl.innerHTML = `
                    The <strong>Primary Structure</strong> is the sequence of amino acids linked together by strong covalent peptide bonds. 
                    Think of it like a chain of beads, where each bead has a chemical side-group defining its charge, hydrophobicity, or size. 
                    This sequence contains all instructions needed for folding.
                `;
                seqBox.style.display = "none";
                legends.style.display = "block";
                legends.innerHTML = `
                    <div class="legend-item"><div class="legend-color" style="background:#3b82f6;"></div>Hydrophobic</div>
                    <div class="legend-item"><div class="legend-color" style="background:#10b981;"></div>Charged Positive</div>
                    <div class="legend-item"><div class="legend-color" style="background:#ef4444;"></div>Charged Negative</div>
                    <div class="legend-item"><div class="legend-color" style="background:#eab308;"></div>Polar Neutral</div>
                `;
                overlay.textContent = "Chemical Properties Mapping";
                await this.viewer.applyStyle("sphere");
                await this.viewer.focusStructure();
                break;
                
            case "secondary":
                titleEl.textContent = "Secondary Structure";
                descEl.innerHTML = `
                    By analyzing the backbone hydrogen bonds, we reveal <strong>Secondary Structures</strong>: local folding shapes. 
                    The most common are coiled <strong>Alpha-Helices</strong> (spirals) and flat <strong>Beta-Sheets</strong> (arrows). 
                    The loops connecting them are highly flexible.
                    <br><br>
                    <em>Interactivity:</em> The visualizer highlights helices in Cyan and sheets in Yellow/Red. Notice that Hemoglobin is primarily alpha-helical.
                `;
                seqBox.style.display = "none";
                legends.style.display = "block";
                legends.innerHTML = `
                    <div class="legend-item"><div class="legend-color" style="background:#0053d6;"></div>Alpha Helix</div>
                    <div class="legend-item"><div class="legend-color" style="background:#ef4444;"></div>Beta Sheet</div>
                    <div class="legend-item"><div class="legend-color" style="background:var(--color-text-secondary);"></div>Random Loop</div>
                `;
                overlay.textContent = "Highlighted Secondary Layers";
                await this.viewer.applyStyle("cartoon");
                await this.viewer.focusStructure();
                break;
                
            case "tertiary":
                titleEl.textContent = "Tertiary Structure";
                descEl.innerHTML = `
                    The <strong>Tertiary Structure</strong> represents the complete, fully-folded 3D arrangement of the protein chain in space. 
                    This 3D conformation creates active pockets and binding receptors, giving the protein its specific chemical abilities (such as Hemoglobin carrying oxygen molecules).
                    <br><br>
                    <em>Interactivity:</em> Drag to rotate and examine the outer pocket channels. Notice how it forms a compact globular core.
                `;
                seqBox.style.display = "none";
                legends.style.display = "none";
                overlay.textContent = "Interactive 3D model (Hemoglobin Subunit Beta)";
                await this.viewer.applyStyle("cartoon");
                await this.viewer.focusStructure();
                break;
        }
    }
}
