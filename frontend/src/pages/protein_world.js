import { MolStarViewer } from "../components/viewer_molstar.js";
import { api } from "../services/api.js";

const WORLD_PROTEINS = {
    human: {
        name: "Hemoglobin Subunit Beta (Homo sapiens)",
        pdbId: "1a3n",
        kingdom: "Human / Mammal",
        desc: "Crucial oxygen-carrier in blood cells, utilizing iron-binding heme units.",
        fact: "Every red cell holds 270 million Hemoglobin units, carrying oxygen from the lungs to muscle mitochondria."
    },
    animal: {
        name: "Firefly Luciferase (Photinus pyralis)",
        pdbId: "2d1s",
        kingdom: "Animalia / Insecta",
        desc: "Enzymatic protein catalyzing light-emission reactions (bioluminescence).",
        fact: "Luciferase oxidizes luciferin inside the insect tail, releasing energy as visible light with nearly 100% heat-free efficiency."
    },
    plant: {
        name: "RuBisCO (Spinacia oleracea)",
        pdbId: "1rcx",
        kingdom: "Plantae / Spinach",
        desc: "Carbon-fixing catalyst driving photosynthesis.",
        fact: "RuBisCO is the most abundant protein on Earth, responsible for capturing carbon dioxide from the air and locking it into plant sugars."
    },
    bacteria: {
        name: "Green Fluorescent Protein (Aequorea victoria)",
        pdbId: "1gfl",
        kingdom: "Bacteria / Jellyfish",
        desc: "Fluorescent tag absorbing blue light and emitting bright green glow.",
        fact: "GFP has a unique beta-barrel fold structure. The center holds a fluorophore made of three residues that emit light naturally under UV rays."
    },
    viral: {
        name: "SARS-CoV-2 Spike Glycoprotein",
        pdbId: "6vxx",
        kingdom: "Viral / Coronavirus",
        desc: "Receptor-binding spike locking onto human ACE2 cell channels.",
        fact: "Spike glycoproteins cover the viral envelope like a crown. The receptor binding domains flip up to latch onto human cells, starting infection."
    }
};

export class ProteinWorld {
    constructor(containerId, initialCifData) {
        this.container = document.getElementById(containerId);
        this.defaultCif = initialCifData;
        this.viewer = null;
        this.activeKey = "human";
        
        if (this.container) {
            this.render();
            this.init3D();
            this.loadTaxon("human");
            this.bindEvents();
        }
    }
    
    render() {
        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="t-headline-lg">Protein <span class="t-primary">World Explorer</span></h1>
                <p class="t-body-md" style="margin-top:var(--space-2);">Explore structural variations and evolutionary nanomachines across the kingdoms of life.</p>
            </div>
            
            <div class="viewer-split-layout">
                <div style="display:flex; flex-direction:column; gap:20px;">
                    <div class="glass-panel" style="padding:15px; display:flex; gap:10px; flex-wrap:wrap;">
                        ${Object.entries(WORLD_PROTEINS).map(([key, value]) => `
                            <button class="btn btn-secondary taxon-select" id="btn-taxon-${key}" data-key="${key}">${value.kingdom.split("/")[0]}</button>
                        `).join("")}
                    </div>
                    
                    <div class="glass-panel" style="padding:0; overflow:hidden;">
                        <div class="viewer-3d-box">
                            <div id="viewer-world-3d" class="viewer-canvas"></div>
                            <div class="viewer-overlay" id="world-viewer-overlay">3D Taxonomy Rendering</div>
                        </div>
                    </div>
                </div>
                
                <div style="display:flex; flex-direction:column; gap:25px;">
                    <div class="glass-panel" style="flex-grow:1;">
                        <h3 id="taxon-protein-name" style="color:var(--color-primary-hover);">Protein Name</h3>
                        <div style="margin-top:15px; display:flex; flex-direction:column; gap:12px; font-size:1.25rem;">
                            <div>
                                <strong style="color:var(--color-primary-hover);">Kingdom Classification:</strong>
                                <span id="taxon-kingdom" style="color:var(--color-text-secondary);"></span>
                            </div>
                            <div>
                                <strong style="color:var(--color-primary-hover);">Biological Action:</strong>
                                <span id="taxon-desc" style="color:var(--color-text-secondary);"></span>
                            </div>
                            <div style="border-top:1px solid var(--color-border); padding-top:12px;">
                                <strong style="color:var(--color-primary-hover);">Evolutionary Fact:</strong>
                                <p style="font-size:1rem; color:var(--color-text-secondary); margin-top:5px; margin-bottom:0;" id="taxon-fact"></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    async init3D() {
        this.viewer = new MolStarViewer("viewer-world-3d");
        await this.viewer.ready();
    }
    
    bindEvents() {
        const btns = this.container.querySelectorAll(".taxon-select");
        btns.forEach(btn => {
            btn.addEventListener("click", () => {
                const key = btn.getAttribute("data-key");
                this.loadTaxon(key);
            });
        });
    }
    
    async loadTaxon(key) {
        this.activeKey = key;
        const p = WORLD_PROTEINS[key];
        
        // Active button styles
        const btns = this.container.querySelectorAll(".taxon-select");
        btns.forEach(btn => {
            btn.classList.remove("active");
            if (btn.getAttribute("data-key") === key) btn.classList.add("active");
        });
        
        document.getElementById("taxon-protein-name").textContent = p.name;
        document.getElementById("taxon-kingdom").textContent = p.kingdom;
        document.getElementById("taxon-desc").textContent = p.desc;
        document.getElementById("taxon-fact").textContent = p.fact;
        
        const overlay = document.getElementById("world-viewer-overlay");
        overlay.textContent = `Downloading ${p.name}...`;
        
        try {
            if (key === "human" && this.defaultCif) {
                await this.viewer.loadModel(this.defaultCif);
                overlay.textContent = `${p.name} (Local structural model)`;
            } else {
                const structure = await api.getStructure(p.pdbId);
                await this.viewer.loadModel(structure.data);
                overlay.textContent = `${p.name} (${structure.source})`;
            }
        } catch (e) {
            overlay.textContent = `Offline. Structure failed.`;
        }
    }
}
