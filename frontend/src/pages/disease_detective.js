import { MolStarViewer } from "../components/viewer_molstar.js";
import { api } from "../services/api.js";

const PREMADE_CASES = [
    {
        id: 1,
        title: "Case File #001: The Tired Patient",
        symptoms: "A 12-year-old boy complains of extreme tiredness, pale skin, and pain in his hands and feet. Blood tests show his red blood cells are shaped like sickles (crescent moons) instead of round discs.",
        proteinClue: "Hemoglobin is the protein that carries oxygen in red blood cells. A small change in this protein makes red blood cells change shape.",
        mutationClue: "There is a tiny change in DNA: the 6th amino acid in beta-globin changed from Glutamic Acid (Glu) to Valine (Val). Just one letter change in the genetic code!",
        pdbId: "1a3n",
        uniprotAccession: "P68871",
        resi: 6,
        correctDiagnosis: "Sickle Cell Anemia",
        options: ["Sickle Cell Anemia", "Common Cold", "Food Poisoning", "Broken Bone"],
        explanation: "Sickle Cell Anemia is caused by a single DNA letter change in the hemoglobin gene. This changes red blood cell shape, blocking blood vessels and reducing oxygen flow."
    },
    {
        id: 2,
        title: "Case File #002: The Milk Mystery",
        symptoms: "A 14-year-old girl feels stomach pain, bloating, and diarrhoea every time she drinks milk. She is fine eating other foods. Her parents think she might have a food allergy.",
        proteinClue: "Lactase is an enzyme that breaks down lactose - the sugar found in milk. Some people stop making enough lactase as they grow up.",
        mutationClue: "A change in the DNA region that controls the LCT gene reduces lactase production after childhood.",
        pdbId: "3o7p",
        uniprotAccession: "P09848",
        resi: 1,
        correctDiagnosis: "Lactose Intolerance",
        options: ["Lactose Intolerance", "Milk Allergy", "Stomach Flu", "Appendicitis"],
        explanation: "Lactose Intolerance happens when the body doesn't make enough lactase enzyme. Without lactase, milk sugar stays undigested, causing gas and stomach pain."
    },
    {
        id: 3,
        title: "Case File #003: The Color Confusion",
        symptoms: "A 10-year-old boy mixes up red and green colors in his school books. He cannot tell these colors apart. His vision is otherwise perfect and he is healthy.",
        proteinClue: "Photoreceptor proteins in the eye's cone cells detect colors. Opsin proteins sense red and green light wavelengths.",
        mutationClue: "The OPN1MW gene on the X chromosome has a mutation that changes the opsin protein's structure, affecting green-light detection.",
        pdbId: "2mxu",
        uniprotAccession: "P04000",
        resi: 153,
        correctDiagnosis: "Color Blindness (Red-Green)",
        options: ["Color Blindness (Red-Green)", "Eye Infection", "Vitamin Deficiency", "Reading Problem"],
        explanation: "Red-Green Color Blindness is an X-linked genetic disorder. The affected opsin protein cannot properly detect green light, making it hard to tell red and green apart."
    }
];

export class DiseaseDetective {
    constructor(containerId, triggerMascotAlert) {
        this.container = document.getElementById(containerId);
        this.triggerMascot = triggerMascotAlert;
        this.activeCaseIdx = 0;
        this.unlockedClues = { protein: false, mutation: false, structure: false };
        this.solvedCases = [];
        this.viewer = null;

        if (this.container) {
            this.render();
            this.init3D();
            this.cases = PREMADE_CASES;
            this.renderTabs();
            if (this.cases.length > 0) {
                this.loadCase(0);
            }
            this.bindEvents();
        }
    }

    async fetchSequence(uniprotAccession) {
        try {
            const url = `https://rest.uniprot.org/uniprotkb/${uniprotAccession}.fasta`;
            const resp = await fetch(url);
            if (!resp.ok) throw new Error("UniProt fetch failed");
            const fasta = await resp.text();
            const lines = fasta.split("\n");
            const seq = lines.slice(1).join("").replace(/\s/g, "");
            return { header: lines[0], sequence: seq };
        } catch (e) {
            console.error("Failed to fetch UniProt sequence:", e);
            return null;
        }
    }

    displaySequence(seqData) {
        const el = document.getElementById("case-sequence");
        if (!seqData || !seqData.sequence) {
            el.innerHTML = `<span style="opacity:0.6;">No sequence data available.</span>`;
            return;
        }
        const s = seqData.sequence;
        const show = s.length > 120 ? s.slice(0, 120) + "..." : s;
        el.innerHTML = `
            <div style="font-size:1.05rem; color:var(--color-text-secondary); margin-bottom:4px;">
                <span style="color:var(--color-primary-hover);">${seqData.header || ""}</span>
            </div>
            <code style="font-size:0.85rem; color:var(--color-text-secondary); word-break:break-all; line-height:1.5; display:block; max-height:80px; overflow-y:auto; background:var(--color-surface); padding:8px; border-radius:4px; border:1px solid var(--color-border);">${show}</code>
        `;
    }

    renderTabs() {
        const tabContainer = this.container.querySelector(".case-tabs");
        if (!tabContainer) return;
        tabContainer.innerHTML = this.cases.map((c, i) => `
            <button class="btn-style case-select ${this.solvedCases.includes(c.id) ? 'solved' : ''}" id="btn-case-tab-${i}" data-idx="${i}">Case ${i+1}</button>
        `).join("");

        const tabs = tabContainer.querySelectorAll(".case-select");
        tabs.forEach(t => {
            t.addEventListener("click", () => {
                const idx = parseInt(t.getAttribute("data-idx"), 10);
                this.loadCase(idx);
            });
        });
    }

    render() {
        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="t-headline-lg">Disease <span class="t-primary">Detective Lab</span></h1>
                <p class="t-body-md" style="margin-top:var(--space-2);">Solve clinical mysteries by tracing patient symptoms to mutations and protein misfolding structures.</p>
            </div>

            <div class="viewer-split-layout">
                <div style="display:flex; flex-direction:column; gap:20px;">
                    <div class="glass-panel case-tabs" style="padding:15px; display:flex; gap:10px; flex-wrap:wrap;">
                    </div>

                    <div class="glass-panel" style="padding:0; overflow:hidden;">
                        <div class="viewer-3d-box">
                            <div id="viewer-detective-3d" class="viewer-canvas"></div>
                            <div class="viewer-overlay" id="detective-viewer-overlay">3D Clue Visualizer</div>
                        </div>
                    </div>
                </div>

                <div style="display:flex; flex-direction:column; gap:20px;">
                    <div class="glass-panel">
                        <h3 id="case-title" style="color:var(--color-primary-hover);">Case Title</h3>
                        <p style="margin-top:10px; font-size:1.05rem; color:var(--color-text-secondary); line-height:1.6;" id="case-symptoms"></p>

                        <div style="display:flex; gap:10px; margin-top:20px; margin-bottom:20px; flex-wrap:wrap;">
                            <button class="btn btn-secondary clue-trigger" data-type="protein" style="flex:1; padding:8px 12px; font-size:0.95rem; min-width:110px;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg> Protein Clue</button>
                            <button class="btn btn-secondary clue-trigger" data-type="mutation" style="flex:1; padding:8px 12px; font-size:0.95rem; min-width:110px;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><path d="M16 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2"/><path d="M8 2v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2"/><path d="M12 12v6"/><path d="M4 20h16"/><path d="M12 22v-4"/></svg> Mutation Clue</button>
                            <button class="btn btn-secondary clue-trigger" data-type="structure" style="flex:1; padding:8px 12px; font-size:0.95rem; min-width:110px;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22 8.5 12 15.5 2 8.5"/></svg> 3D Clue</button>
                        </div>

                        <div id="case-clue-logs" style="background:var(--color-surface); border:1px solid var(--color-border); padding:15px; border-radius:8px; font-size:1rem; line-height:1.6; color:var(--color-text-secondary); min-height:100px; margin-bottom:20px;">
                            <span style="opacity:0.6;">Awaiting clue requests...</span>
                        </div>

                            <div style="margin-top:12px; border-top:1px solid var(--color-border); padding-top:12px;">
                            <div style="font-size:0.95rem; color:var(--color-primary-hover); font-weight:600; margin-bottom:6px;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;display:inline;vertical-align:middle;"><path d="M16 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2"/><path d="M8 2v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2"/></svg> Protein Sequence (UniProt)</div>
                            <div id="case-sequence"><span style="opacity:0.6;">Fetching sequence...</span></div>
                        </div>
                    </div>

                    <div class="glass-panel" id="diagnosis-panel">
                        <h3>Diagnostic Diagnosis</h3>
                        <p style="font-size:0.95rem; color:var(--color-text-secondary); margin-bottom:15px;">Submit your final medical diagnostic judgment:</p>
                        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px;" id="diagnosis-opts"></div>
                        <button class="btn btn-primary" id="btn-submit-diagnosis" style="width:100%;">Submit Case Report</button>
                    </div>
                </div>
            </div>
        `;
    }

    async init3D() {
        this.viewer = new MolStarViewer("viewer-detective-3d");
        await this.viewer.ready();
    }

    bindEvents() {
        const triggers = this.container.querySelectorAll(".clue-trigger");
        triggers.forEach(trig => {
            trig.addEventListener("click", () => {
                const type = trig.getAttribute("data-type");
                this.revealClue(type);
            });
        });

        document.getElementById("btn-submit-diagnosis").addEventListener("click", () => {
            this.checkDiagnosis();
        });
    }

    loadCase(idx) {
        this.activeCaseIdx = idx;
        const c = this.cases[idx];
        if (!c) return;
        this.unlockedClues = { protein: false, mutation: false, structure: false };

        const tabs = this.container.querySelectorAll(".case-select");
        tabs.forEach(t => {
            t.classList.remove("active");
            if (parseInt(t.getAttribute("data-idx"), 10) === idx) {
                t.classList.add("active");
            }
        });

        document.getElementById("case-title").textContent = c.title;
        document.getElementById("case-symptoms").innerHTML = `<strong>Symptoms:</strong> ${c.symptoms}`;
        document.getElementById("case-clue-logs").innerHTML = `<span style="opacity:0.6;">Awaiting diagnostic clue requests...</span>`;
        document.getElementById("case-sequence").innerHTML = `<span style="opacity:0.6;">Fetching sequence...</span>`;

        if (c.uniprotAccession) {
            this.fetchSequence(c.uniprotAccession).then(data => this.displaySequence(data));
        } else {
            document.getElementById("case-sequence").innerHTML = `<span style="opacity:0.6;">No UniProt accession available.</span>`;
        }

        const submitBtn = document.getElementById("btn-submit-diagnosis");
        const isSolved = this.solvedCases.includes(c.id);
        submitBtn.disabled = isSolved;
        submitBtn.textContent = isSolved ? "✓ Solved & Closed" : "Submit Case Report";

        const optsDiv = document.getElementById("diagnosis-opts");
        optsDiv.innerHTML = c.options.map(opt => `
            <button class="option-btn diag-opt" data-val="${opt}">${opt}</button>
        `).join("");

        const optBtns = optsDiv.querySelectorAll(".diag-opt");
        optBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                optBtns.forEach(b => {
                    b.classList.remove("active");
                    b.style.boxShadow = "none";
                });
                btn.classList.add("active");
                btn.style.boxShadow = "0 0 20px rgba(91, 107, 255, 0.4)";
            });
        });

        document.getElementById("detective-viewer-overlay").textContent = "Awaiting PDB model coordinate fetch...";
        this.viewer.clear();
    }

    async revealClue(type) {
        const c = this.cases[this.activeCaseIdx];
        if (!c) return;
        const logs = document.getElementById("case-clue-logs");

        this.unlockedClues[type] = true;

        let logHtml = "";
        if (this.unlockedClues.protein) {
            logHtml += `<div style="margin-bottom:10px;"><strong style="color:var(--color-primary-hover);">[PROTEIN CLUE]:</strong> ${c.proteinClue}</div>`;
        }
        if (this.unlockedClues.mutation) {
            logHtml += `<div style="margin-bottom:10px;"><strong style="color:var(--color-primary-hover);">[GENOMIC CLUE]:</strong> ${c.mutationClue}</div>`;
        }
        if (this.unlockedClues.structure) {
            logHtml += `<div><strong style="color:var(--color-primary-hover);">[3D COORDS CLUE]:</strong> Visual coordinates downloaded. mutant residue ${c.resi} focused and colored.</div>`;
            this.loadCaseStructure(c);
        }

        logs.innerHTML = logHtml || `<span style="opacity:0.6;">Awaiting clue requests...</span>`;
    }

    async loadCaseStructure(c) {
        const overlay = document.getElementById("detective-viewer-overlay");
        const upAcc = c.uniprotAccession;
        if (!upAcc) {
            overlay.textContent = `Fetching PDB ${c.pdbId}...`;
            try {
                const res = await api.getStructure(c.pdbId);
                await this.viewer.loadModel(res.data);
                await this.viewer.highlightMutation(c.resi, "Target Mutant");
                overlay.textContent = `PDB ${c.pdbId} Loaded. Highlighted residue: ${c.resi}`;
            } catch (e) {
                overlay.textContent = "Coordinates error. Fallback loaded.";
            }
            return;
        }
        overlay.textContent = `Fetching AlphaFold model for ${upAcc}...`;
        try {
            const afResp = await fetch(`https://alphafold.ebi.ac.uk/api/prediction/${upAcc}`);
            if (afResp.ok) {
                const models = await afResp.json();
                const model = Array.isArray(models) ? models[0] : models;
                const cifUrl = model.cifUrl;
                if (cifUrl) {
                    const cifResp = await fetch(cifUrl);
                    if (cifResp.ok) {
                        const cifData = await cifResp.text();
                        await this.viewer.loadModel(cifData);
                        await this.viewer.highlightMutation(c.resi, "Target Mutant");
                        overlay.textContent = `AlphaFold ${upAcc} Loaded. Residue ${c.resi} highlighted.`;
                        return;
                    }
                }
            }
            overlay.textContent = `Fetching PDB ${c.pdbId}...`;
            const res = await api.getStructure(c.pdbId);
            await this.viewer.loadModel(res.data);
            await this.viewer.highlightMutation(c.resi, "Target Mutant");
            overlay.textContent = `PDB ${c.pdbId} Loaded. Highlighted residue: ${c.resi}`;
        } catch (e) {
            overlay.textContent = "Coordinates error. Fallback loaded.";
        }
    }

    async checkDiagnosis() {
        const activeOpt = document.querySelector("#diagnosis-opts .diag-opt.active");
        if (!activeOpt) {
            this.triggerMascot("Please select one of the diagnosis options before submitting!");
            return;
        }

        const selVal = activeOpt.getAttribute("data-val");
        const c = this.cases[this.activeCaseIdx];

        if (selVal === c.correctDiagnosis) {
            this.solvedCases.push(c.id);
            this.triggerMascot(`🎉 Correct! You successfully diagnosed **${c.correctDiagnosis}**. ${c.explanation}`);

            try {
                await api.updateProfile("default_user", {
                    xp: 150,
                    collected_protein: c.pdbId === "1a3n" ? "hemoglobin" : c.pdbId === "2mxu" ? "tau" : "myosin"
                });

                if (this.solvedCases.length >= 2) {
                    await api.updateProgress("default_user", undefined, ["Disease Detective"], {});
                }
            } catch (e) {
                console.error(e);
            }

            const submitBtn = document.getElementById("btn-submit-diagnosis");
            submitBtn.disabled = true;
            submitBtn.textContent = "✓ Solved & Closed";

            const nextUnsolvedIdx = this.cases.findIndex((caseItem, idx) => {
                return idx !== this.activeCaseIdx && !this.solvedCases.includes(caseItem.id);
            });

            if (nextUnsolvedIdx !== -1) {
                this.triggerMascot(`✅ Case closed! Moving to the next case in 2 seconds...`);
                setTimeout(() => this.loadCase(nextUnsolvedIdx), 2000);
            } else {
                this.triggerMascot(`🏆 All cases solved! You are a master detective!`);
            }
        } else {
            activeOpt.classList.add("wrong");
            this.triggerMascot("Incorrect diagnosis. Review the protein and sequencing mutation clues, and try again!");
            setTimeout(() => activeOpt.classList.remove("wrong"), 1000);
        }
    }
}
