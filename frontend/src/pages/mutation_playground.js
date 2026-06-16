import { MolStarViewer } from "../components/viewer_molstar.js";
import { api } from "../services/api.js";

const MUTATION_PROTEINS = {
    hemoglobin: {
        name: "Hemoglobin Subunit Beta",
        pdbId: "1a3n",
        sequence: "MVHLTPEEKSAVTALWGKVNVDEVGGEALGRLLVVYPWTQRFFESFGDLSTPDAVMGNPKVKAHGKKVLGAFSDGLAHLDNLKGTFATLSELHCDKLHVDPENFRLLGNVLVCVLAHHFGKEFTPPVQAAYQKVVAGVANALAHKYH",
        mutations: [
            {
                index: 6,
                wildType: "E",
                mutant: "V",
                disease: "Sickle Cell Anemia",
                description: "Substituting Glutamic Acid (hydrophilic, negative charge) at position 6 with Valine (hydrophobic) creates a sticky patch on the protein's outer shell. In low-oxygen conditions, these patches lock together, aggregating hemoglobins into long, stiff fibers that distort red blood cells into crescent shapes, clogging blood flow."
            }
        ]
    },
    amyloid: {
        name: "Amyloid-Beta Peptide",
        pdbId: "2mxu",
        sequence: "DAEFRHDSGYEVHHQKLVFFAEDVGSNKGAIIGLMVGGVVIA",
        mutations: [
            {
                index: 22,
                wildType: "E",
                mutant: "Q",
                disease: "Alzheimer's Disease (Dutch Mutation)",
                description: "Substituting Glutamic Acid (charged negative) at position 22 with Glutamine (polar neutral) removes a repulsive charge, facilitating amyloid peptide aggregation. This accelerates the assembly of neurotoxic oligomers and beta-sheet plaque deposits on brain cells, leading to severe cognitive decline."
            }
        ]
    },
    synuclein: {
        name: "Alpha-Synuclein",
        pdbId: "1xq8",
        sequence: "MDVFMKGLSKAKEGVVAAAEKTKQGVAEAAGKTKEGVLYVGSKTKEGVVHGVATVAEKTKEQVTNVGGAVVTGVTAVAQKTVEGAGSIAAATGFVKKDQLGKNEEGAPQEGILEDMPVDPDNEAYEMPSEEGYQDYEPEA",
        mutations: [
            {
                index: 53,
                wildType: "A",
                mutant: "T",
                disease: "Parkinson's Disease (Familial)",
                description: "Substituting Alanine (small hydrophobic) at position 53 with Threonine (larger polar) alters the structural flexibility of the central NAC region. This shift increases the protein's tendency to fold into cross-beta amyloid aggregates, forming toxic Lewy bodies inside dopaminergic neurons."
            }
        ]
    }
};

export class MutationPlayground {
    constructor(containerId, initialCifData, triggerMascotAlert) {
        this.container = document.getElementById(containerId);
        this.defaultCif = initialCifData;
        this.triggerMascot = triggerMascotAlert;
        
        this.activeKey = "hemoglobin";
        this.viewer = null;
        this.selectedResiIdx = null;
        this.selectedMutantAA = null;
        
        if (this.container) {
            this._renderSkeleton();
            this.render();
            this.init3D();
            this.loadProtein("hemoglobin");
            this.bindEvents();
        }
    }
    
    _renderSkeleton() {
        this.container.innerHTML = `
            <div class="page-header">
                <div class="skeleton skeleton-line" style="height:2.5rem; width:55%; margin-bottom:16px;"></div>
                <div class="skeleton skeleton-line-sm" style="height:1.05rem; width:40%;"></div>
            </div>
            <div class="viewer-split-layout">
                <div style="display:flex; flex-direction:column; gap:20px;">
                    <div class="glass-panel" style="padding:15px;">
                        <div style="display:flex; gap:10px; flex-wrap:wrap;">
                            <div class="skeleton" style="width:180px; height:36px; border-radius:8px;"></div>
                            <div class="skeleton" style="width:180px; height:36px; border-radius:8px;"></div>
                            <div class="skeleton" style="width:200px; height:36px; border-radius:8px;"></div>
                        </div>
                    </div>
                    <div class="glass-panel" style="padding:0; overflow:hidden;">
                        <div style="height:300px; display:flex; align-items:center; justify-content:center;">
                            <div class="skeleton" style="width:90%; height:90%; border-radius:8px;"></div>
                        </div>
                    </div>
                </div>
                <div style="display:flex; flex-direction:column; gap:25px;">
                    <div class="glass-panel">
                        <div class="skeleton skeleton-line" style="height:1.5rem; width:45%; margin-bottom:15px;"></div>
                        <div class="skeleton skeleton-line-sm" style="height:0.9rem; width:60%; margin-bottom:20px;"></div>
                        <div style="display:grid; grid-template-columns:repeat(10,1fr); gap:4px;">
                            ${Array(30).fill().map(() => `
                                <div class="skeleton" style="aspect-ratio:1; border-radius:4px;"></div>
                            `).join("")}
                        </div>
                    </div>
                    <div class="glass-panel">
                        <div class="skeleton skeleton-line" style="height:1.2rem; width:50%; margin-bottom:10px;"></div>
                        <div class="skeleton skeleton-line-sm" style="height:0.9rem; width:70%;"></div>
                    </div>
                </div>
            </div>
        `;
    }
    
    render() {
        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="t-headline-lg">Mutation <span class="t-primary">Playground</span></h1>
                <p class="t-body-md" style="margin-top:var(--space-2);">Inject point mutations into protein sequences, modify side chains, and examine physical disease outcomes.</p>
            </div>
            
            <div class="viewer-split-layout">
                <div style="display:flex; flex-direction:column; gap:20px;">
                    <div class="glass-panel" style="padding: 15px;">
                        <div style="display:flex; gap:10px; flex-wrap:wrap;">
                            <button class="btn btn-secondary active prot-select" data-key="hemoglobin">Hemoglobin (Sickle Cell)</button>
                            <button class="btn btn-secondary prot-select" data-key="amyloid">Amyloid-Beta (Alzheimer's)</button>
                            <button class="btn btn-secondary prot-select" data-key="synuclein">Alpha-Synuclein (Parkinson's)</button>
                        </div>
                    </div>
                    
                    <div class="glass-panel" style="padding:0; overflow:hidden;">
                        <div class="viewer-3d-box">
                            <div id="viewer-mutation-3d" class="viewer-canvas"></div>
                            <div class="viewer-toolbar" id="mutation-viewer-overlay">Interactive Model</div>
                        </div>
                    </div>
                </div>
                
                <div style="display:flex; flex-direction:column; gap:25px;">
                    <div class="glass-panel">
                        <h3 id="playground-protein-name">Hemoglobin</h3>
                        <p style="font-size:1.05rem; color:var(--color-text-secondary); margin-bottom:15px;">Click a residue cell in the sequence map below to mutatively select it:</p>
                        
                        <div class="residue-grid" id="playground-residue-grid"></div>
                        
                        <div id="mutation-controls-box" style="display:none; border-top:1px solid var(--color-border); padding-top:20px;">
                            <h4 style="color:var(--color-primary-hover); margin-bottom:12px; font-size:1.25rem;">Select Substitution Residue:</h4>
                            <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px;" id="mutant-aa-list">
                                ${["VAL", "THR", "GLN", "GLY", "LEU", "ARG", "ASP", "PHE"].map(aa => `
                                    <button class="btn-style aa-mut-select" data-aa="${aa}">${aa}</button>
                                `).join("")}
                            </div>
                            <button class="btn btn-primary" id="btn-apply-mutation" style="width:100%;">Synthesize Mutant Protein</button>
                        </div>
                    </div>
                    
                    <div class="glass-panel" id="playground-report-card" style="flex-grow:1; display:none;">
                        <h3 style="color:var(--color-danger);" id="report-disease-title">Disease Outcome</h3>
                        <p id="report-disease-desc" style="font-size:1.25rem; line-height:1.6; color:var(--color-text-secondary);"></p>
                    </div>
                </div>
            </div>
        `;
    }
    
    async init3D() {
        this.viewer = new MolStarViewer("viewer-mutation-3d");
        await this.viewer.ready();
    }
    
    bindEvents() {
        const protBtns = this.container.querySelectorAll(".prot-select");
        protBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                protBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                
                const key = btn.getAttribute("data-key");
                this.loadProtein(key);
            });
        });
        
        // Applying mutations
        const applyBtn = document.getElementById("btn-apply-mutation");
        applyBtn.addEventListener("click", () => {
            this.synthesizeMutation();
        });
    }
    
    async loadProtein(key) {
        this.activeKey = key;
        const p = MUTATION_PROTEINS[key];
        
        document.getElementById("playground-protein-name").textContent = p.name;
        document.getElementById("mutation-controls-box").style.display = "none";
        document.getElementById("playground-report-card").style.display = "none";
        this.selectedResiIdx = null;
        this.selectedMutantAA = null;
        
        // Reset amino acid mut selected active button states
        const mutBtns = this.container.querySelectorAll(".aa-mut-select");
        mutBtns.forEach(b => b.classList.remove("active"));
        
        // Build sequence grid
        const grid = document.getElementById("playground-residue-grid");
        grid.innerHTML = p.sequence.split('').map((char, i) => {
            const idx = i + 1;
            let chemClass = "polar";
            
            if (["A", "V", "L", "I", "M", "F", "W", "P"].includes(char)) chemClass = "hydrophobic";
            else if (["K", "R", "H"].includes(char)) chemClass = "charged-pos";
            else if (["D", "E"].includes(char)) chemClass = "charged-neg";
            
            return `
                <div class="residue-node ${chemClass}" data-idx="${idx}" data-char="${char}">
                    ${char}${idx}
                </div>
            `;
        }).join("");
        
        // Bind grid clicks
        const nodes = grid.querySelectorAll(".residue-node");
        nodes.forEach(node => {
            node.addEventListener("click", () => {
                nodes.forEach(n => n.classList.remove("active"));
                node.classList.add("active");
                
                this.selectedResiIdx = parseInt(node.getAttribute("data-idx"), 10);
                this.selectedWildAA = node.getAttribute("data-char");
                
                document.getElementById("mutation-controls-box").style.display = "block";
            });
        });
        
        // Bind mutant amino acid selection
        const aaBtns = this.container.querySelectorAll(".aa-mut-select");
        aaBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                aaBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                this.selectedMutantAA = btn.getAttribute("data-aa");
            });
        });
        
        // Load model
        document.getElementById("mutation-viewer-overlay").textContent = `Loading ${p.name}...`;
        try {
            if (key === "hemoglobin" && this.defaultCif) {
                await this.viewer.loadModel(this.defaultCif);
                document.getElementById("mutation-viewer-overlay").textContent = `${p.name} (Active structure)`;
            } else {
                const res = await api.getStructure(p.pdbId);
                await this.viewer.loadModel(res.data);
                document.getElementById("mutation-viewer-overlay").textContent = `${p.name} (${res.source})`;
            }
        } catch (e) {
            document.getElementById("mutation-viewer-overlay").textContent = `Failed to download 3D coords.`;
        }
    }
    
    async synthesizeMutation() {
        if (!this.selectedResiIdx || !this.selectedMutantAA) {
            this.triggerMascot("Please click an index residue in the sequence map, then select a substitution amino acid!");
            return;
        }
        
        const p = MUTATION_PROTEINS[this.activeKey];
        const resi = this.selectedResiIdx;
        const aaMap = {
            VAL: "V", THR: "T", GLN: "Q", GLY: "G", LEU: "L", ARG: "R", ASP: "D", PHE: "F"
        };
        const mut1Letter = aaMap[this.selectedMutantAA] || "X";
        
        const matchedMut = p.mutations.find(m => m.index === resi && m.mutant === mut1Letter);
        
        await this.viewer.highlightMutation(resi, this.selectedMutantAA);
        
        const reportCard = document.getElementById("playground-report-card");
        const reportTitle = document.getElementById("report-disease-title");
        const reportDesc = document.getElementById("report-disease-desc");
        
        reportCard.style.display = "block";
        
        if (matchedMut) {
            reportTitle.style.color = "var(--color-danger)";
            reportTitle.textContent = `Pathology Result: ${matchedMut.disease}`;
            reportDesc.innerHTML = `
                <strong>Substitution:</strong> ${this.selectedWildAA}${resi} substituted with ${mut1Letter} (${this.selectedMutantAA})
                <br><br>
                ${matchedMut.description}
            `;
            this.triggerMascot(`⚠️ Warning! You created a pathological mutation which results in **${matchedMut.disease}**. See the report details.`);
        } else {
            reportTitle.style.color = "var(--color-success)";
            reportTitle.textContent = "Benign Synthesis Outcome";
            reportDesc.innerHTML = `
                <strong>Substitution:</strong> ${this.selectedWildAA}${resi} substituted with ${mut1Letter} (${this.selectedMutantAA})
                <br><br>
                This mutation changes the local residue charge but does not match any known high-risk clinical disease aggregates. 
                The protein's globular tertiary folding structure remains stable and functional under normal homeostatic cellular conditions.
            `;
            this.triggerMascot(`Synthesis complete. Substituting ${this.selectedWildAA} with ${mut1Letter} is benign. The fold remains active!`);
        }
    }
}
