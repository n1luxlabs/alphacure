const L_ICON_HALL = (path) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="width:28px;height:28px;color:var(--color-primary-hover);margin-bottom:var(--space-4);">${path}</svg>`;

const HALL_DATA = [
    { id: "origins", icon: L_ICON_HALL('<path d="M10.5 2v2M6.5 12a4 4 0 0 0 4 4h2a4 4 0 0 0 0-8h-2"/><path d="M2 22v-2a6 6 0 0 1 6-6h8a6 6 0 0 1 6 6v2"/><path d="M10.5 22v-6"/>'), title: "Hall 1: Cell Life", desc: "Discover how single cells coordinate thousands of biological processes using molecular nanomachines." },
    { id: "dna", icon: L_ICON_HALL('<path d="M16 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2"/><path d="M8 2v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2"/><path d="M12 12v6"/><path d="M4 20h16"/><path d="M12 22v-4"/>'), title: "Hall 2: DNA Blueprint", desc: "Uncover the double helix ladder, nucleotides, and the digital storage of genetic codes." },
    { id: "rna", icon: L_ICON_HALL('<rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><path d="M8 22h8"/><path d="M12 14v8"/><path d="M2 10v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4"/>'), title: "Hall 3: RNA Transcripts", desc: "Learn how DNA code is copied into sliding messenger RNA codes for transfer to the cytoplasm." },
    { id: "protein", icon: L_ICON_HALL('<polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22 8.5 12 15.5 2 8.5"/>'), title: "Hall 4: Protein Gallery", desc: "Learn how simple amino acid strings translate on ribosomes and fold into complex 3D structures." },
    { id: "disease", icon: L_ICON_HALL('<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'), title: "Hall 5: Disease Pathology", desc: "See what happens when folding goes wrong, triggering aggregates in Alzheimer's and Parkinson's." },
    { id: "ai", icon: L_ICON_HALL('<path d="M12 8V4m0 0L9 7m3-3l3 3"/><rect x="4" y="11" width="16" height="11" rx="2" ry="2"/><path d="M8 15v4"/><path d="M16 15v4"/><path d="M12 22v-4"/>'), title: "Hall 6: AlphaFold AI", desc: "Witness the deep learning breakthroughs that solved biology's greatest folding mystery in seconds." },
    { id: "drug", icon: L_ICON_HALL('<path d="M10 2v2M14 2v2"/><path d="M6 22h12"/><path d="M12 14v-6"/><path d="M7 22c0-5 5-12 5-12s5 7 5 12"/>'), title: "Hall 7: Drug Discovery", desc: "Simulate receptor-ligand locking and learn how computational models block active viral sites." },
    { id: "future", icon: L_ICON_HALL('<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>'), title: "Hall 8: Future Biology", desc: "Inspect custom chloroplasts, engineered plastic-breaking enzymes, and synthetic lifeforms." }
];

export class ScienceMuseum {
    constructor(containerId, openModalCallback, navigateToPageCallback) {
        this.container = document.getElementById(containerId);
        this.openModal = openModalCallback;
        this.navigateToPage = navigateToPageCallback;
        
        if (this.container) {
            this.render();
        }
    }
    
    render() {
        this.container.innerHTML = `
            <div class="page-header">
                <div class="skeleton skeleton-line" style="height:2.5rem; width:55%; margin-bottom:16px;"></div>
                <div class="skeleton skeleton-line-sm" style="height:1.05rem; width:38%;"></div>
            </div>
            <div class="museum-halls-grid">
                ${Array(8).fill().map(() => `
                    <div class="skeleton-card">
                        <div class="skeleton skeleton-circle" style="margin-bottom:15px;"></div>
                        <div class="skeleton skeleton-line" style="height:1.35rem; width:70%; margin-bottom:12px;"></div>
                        <div class="skeleton skeleton-line" style="margin-bottom:6px;"></div>
                        <div class="skeleton skeleton-line skeleton-line-sm"></div>
                    </div>
                `).join("")}
            </div>
        `;
        setTimeout(() => {
            this._renderContent();
            this.bindEvents();
        }, 150);
    }

    _renderContent() {
        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="t-headline-lg">Virtual <span class="t-primary">Science Museum</span></h1>
                <p class="t-body-md" style="margin-top:var(--space-2);">Walk through themed galleries discovering the architectural secrets of cellular life.</p>
            </div>
            
            <div class="museum-halls-grid">
                ${HALL_DATA.map(h => `
                    <div class="hall-card" data-hall="${h.id}">
                        ${h.icon}
                        <h3>${h.title}</h3>
                        <p>${h.desc}</p>
                    </div>
                `).join("")}
            </div>
        `;
    }
    
    bindEvents() {
        const cards = this.container.querySelectorAll(".hall-card");
        cards.forEach(card => {
            card.addEventListener("click", () => {
                const hallType = card.getAttribute("data-hall");
                this.showHallDetails(hallType);
            });
        });
    }
    
    showHallDetails(hall) {
        let content = {};
        
        switch(hall) {
            case "origins":
                content = {
                    title: "Hall 1: Cell Life",
                    html: `
                        <div class="museum-slide">
                            <p class="t-body-md" style="margin-bottom:var(--space-5);">Every living organism is made of <strong>cells</strong>. Think of a cell as a fully automated chemical factory. It needs instructions, raw materials, power plants, and machinery to function.</p>
                            <p class="t-body-md" style="margin-bottom:var(--space-5);">Inside the nucleus, the cell stores its instructions. But the actual physical labor—processing nutrients, transporting cargo, replicating instructions, and forming structures—is carried out by <strong>proteins</strong>.</p>
                            <h4 class="t-title-md" style="color:var(--color-primary-hover); margin:var(--space-4) 0 var(--space-2);">Key Discoveries:</h4>
                            <ul class="t-body-md" style="margin-left:20px; color:var(--color-text-secondary); margin-bottom:var(--space-5);">
                                <li>The cell membrane maintains structural integrity.</li>
                                <li>Ribosomes translate sequence blueprints.</li>
                                <li>Mitochondria yield chemical energy (ATP) for engines.</li>
                            </ul>
                            <button class="btn btn-primary" id="go-to-level-1">Play Level 2: Cell Explorer</button>
                        </div>
                    `
                };
                break;
                
            case "dna":
                content = {
                    title: "Hall 2: DNA Blueprint",
                    html: `
                        <div class="museum-slide">
                            <p class="t-body-md" style="margin-bottom:var(--space-5);"><strong>Deoxyribonucleic Acid (DNA)</strong> is a double-stranded molecule carrying genetic code. The backbone is built of sugar-phosphates, connected by four bases:</p>
                            <div class="t-mono-sm" style="background:var(--color-primary-soft); padding:var(--space-4); border-radius:var(--radius-md); color:var(--color-primary-hover); margin-bottom:var(--space-5); line-height:1.7;">
                                <strong>Adenine (A)</strong> pairs with <strong>Thymine (T)</strong><br>
                                <strong>Cytosine (C)</strong> pairs with <strong>Guanine (G)</strong>
                            </div>
                            <p class="t-body-md" style="margin-bottom:var(--space-5);">The hydrogen bonds between complementary nucleotides hold the double helix ladder securely coiled inside histones.</p>
                            <button class="btn btn-primary" id="go-to-level-2">Play Level 3: DNA Explorer</button>
                        </div>
                    `
                };
                break;
                
            case "rna":
                content = {
                    title: "Hall 3: RNA Transcripts",
                    html: `
                        <div class="museum-slide">
                            <p class="t-body-md" style="margin-bottom:var(--space-5);">To build a protein, the cell cannot take the DNA out of the nucleus—it might get damaged. Instead, an enzyme called RNA Polymerase copies the DNA sequence into a temporary single-stranded copy called <strong>Messenger RNA (mRNA)</strong>.</p>
                            <p class="t-body-md" style="margin-bottom:var(--space-5);">RNA replaces Thymine (T) with <strong>Uracil (U)</strong>. This single-stranded transcript slides out of nuclear pores into the cytoplasm where ribosomes capture it for translation.</p>
                            <button class="btn btn-primary" id="go-to-level-3">Play Level 4: RNA Messenger</button>
                        </div>
                    `
                };
                break;
                
            case "protein":
                content = {
                    title: "Hall 4: Protein Gallery",
                    html: `
                        <div class="museum-slide">
                            <p class="t-body-md" style="margin-bottom:var(--space-5);">Proteins are linear chains of <strong>Amino Acids</strong>. There are 20 standard amino acids, each with a unique chemical side chain (polar, non-polar, charged, or aromatic).</p>
                            <p class="t-body-md" style="margin-bottom:var(--space-5);">As the ribosome links amino acids in a 1D chain, the chain folds into secondary shapes: coiled <strong>Alpha-Helices</strong> and flat <strong>Beta-Sheets</strong>. These pack together to create a 3D <strong>Tertiary Structure</strong> which determines the protein's mechanical function.</p>
                            <button class="btn btn-primary" id="go-to-reverse-lab">Open Reverse Engineering Lab</button>
                        </div>
                    `
                };
                break;
                
            case "disease":
                content = {
                    title: "Hall 5: Disease Pathology",
                    html: `
                        <div class="museum-slide">
                            <p class="t-body-md" style="margin-bottom:var(--space-5);">A protein's shape is extremely delicate. If a single amino acid is mutated, or if environmental factors fluctuate, the protein can misfold.</p>
                            <p class="t-body-md" style="margin-bottom:var(--space-5);">Misfolded proteins often expose hydrophobic patches that normally hide inside. These sticky patches cause the proteins to aggregate, forming long toxic fibers called amyloid fibrils, which clog neurons in diseases like <strong>Alzheimer's</strong>, <strong>Parkinson's</strong>, and <strong>ALS</strong>.</p>
                            <button class="btn btn-primary" id="go-to-playground">Open Mutation Playground</button>
                        </div>
                    `
                };
                break;
                
            case "ai":
                content = {
                    title: "Hall 6: AlphaFold AI",
                    html: `
                        <div class="museum-slide">
                            <p class="t-body-md" style="margin-bottom:var(--space-5);">For 50 years, structural biologists struggled to predict a protein's 3D shape from its 1D amino acid sequence. Traditional lab techniques like X-ray crystallography could take months or years of struggle per protein.</p>
                            <p class="t-body-md" style="margin-bottom:var(--space-5);">In 2020, DeepMind released <strong>AlphaFold v2</strong>, which uses deep neural networks (specifically attention mechanism blocks called Evoformers) to learn from the PDB's historical records. It predicts coordinates to atomic accuracy in seconds, unlocking structures for hundreds of millions of proteins.</p>
                            <button class="btn btn-primary" id="go-to-level-7">Play Level 8: AlphaFold Analyst</button>
                        </div>
                    `
                };
                break;
                
            case "drug":
                content = {
                    title: "Hall 7: Drug Discovery Lab",
                    html: `
                        <div class="museum-slide">
                            <p class="t-body-md" style="margin-bottom:var(--space-5);">Once we know the exact shape of a disease-causing protein, we can design inhibitors. If a viral enzyme (like SARS-CoV-2 main protease) is responsible for viral duplication, we design a small chemical drug that fits precisely into its active catalytic site pocket.</p>
                            <p class="t-body-md" style="margin-bottom:var(--space-5);">This "lock-and-key" binding blocks the enzyme's function, halting the disease. AI accelerating this dock prediction reduces drug design cycles from years to days.</p>
                            <button class="btn btn-primary" id="go-to-drug-lab">Open Drug Discovery Simulator</button>
                        </div>
                    `
                };
                break;
                
            case "future":
                content = {
                    title: "Hall 8: Future Biology",
                    html: `
                        <div class="museum-slide">
                            <p class="t-body-md" style="margin-bottom:var(--space-5);">We are moving from reading genomes to writing them. **Synthetic Biology** allows scientists to design brand-new proteins that do not exist in nature.</p>
                            <p class="t-body-md" style="margin-bottom:var(--space-5);">Examples include engineered **PETase enzymes** that eat plastic waste, custom **biosensors** that detect heavy metal toxicity in water, and artificial **carbon-fixing complexes** designed to capture greenhouse gases 10x faster than normal trees.</p>
                            <button class="btn btn-primary" id="go-to-factory">Open Protein Factory</button>
                        </div>
                    `
                };
                break;
        }
        
        this.openModal(content.title, content.html);
        
        // Bind button redirections inside modal
        setTimeout(() => {
            const btnLevel1 = document.getElementById("go-to-level-1");
            const btnLevel2 = document.getElementById("go-to-level-2");
            const btnLevel3 = document.getElementById("go-to-level-3");
            const btnLevel7 = document.getElementById("go-to-level-7");
            const btnReverse = document.getElementById("go-to-reverse-lab");
            const btnPlayground = document.getElementById("go-to-playground");
            const btnDrug = document.getElementById("go-to-drug-lab");
            const btnFactory = document.getElementById("go-to-factory");
            
            const closeAndNav = (pageId) => {
                const closeBtn = document.querySelector(".modal-close");
                if (closeBtn) closeBtn.click();
                if (this.navigateToPage) this.navigateToPage(pageId);
            };
            
            if (btnLevel1) btnLevel1.addEventListener("click", () => closeAndNav("journey"));
            if (btnLevel2) btnLevel2.addEventListener("click", () => closeAndNav("journey"));
            if (btnLevel3) btnLevel3.addEventListener("click", () => closeAndNav("journey"));
            if (btnLevel7) btnLevel7.addEventListener("click", () => closeAndNav("journey"));
            if (btnReverse) btnReverse.addEventListener("click", () => closeAndNav("reverse-lab"));
            if (btnPlayground) btnPlayground.addEventListener("click", () => closeAndNav("playground"));
            if (btnDrug) btnDrug.addEventListener("click", () => closeAndNav("drug-lab"));
            if (btnFactory) btnFactory.addEventListener("click", () => closeAndNav("factory-sim"));
        }, 100);
    }
}
