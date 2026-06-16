import { MolStarViewer } from "../components/viewer_molstar.js";
import { api } from "../services/api.js";

const BODY_PROTEINS = {
    hair: {
        name: "Keratin (Hair & Nails)",
        pdbId: "3tid",
        role: "Structural integrity, tensile strength, and water protection.",
        details: "Keratin forms tough helical bundles. It is packed with Cysteine amino acids that form strong disulfide bridges (cross-links) with neighboring chains, giving rigidity.",
        disease: "Epidermolysis bullosa simplex (EBS) - genetic disease making skin fragile due to faulty keratin folding."
    },
    brain: {
        name: "Tau Protein (Brain)",
        pdbId: "5o3l",
        role: "Microtubule stabilization inside cerebral neurons.",
        details: "Tau is an intrinsically disordered protein that normally binds to and stabilizes microtubules (the structural skeleton of cells). When overphosphorylated, it detaches and misfolds.",
        disease: "Alzheimer's Disease & Dementia (Tau proteins clump together forming neurofibrillary tangles that choke cells from the inside)."
    },
    organs: {
        name: "EGFR Receptor (Lung / Organs)",
        pdbId: "1ivo",
        role: "Cell division and cell growth signalling gateway.",
        details: "EGFR (Epidermal Growth Factor Receptor) sits on cell membranes. When a growth signal binds to its extracellular domain, the receptor pairs up (dimerizes), triggering cell division commands.",
        disease: "Lung Cancer & Glioblastomas (mutated EGFR channels stay stuck 'ON' permanently, driving rapid uncontrolled cell division)."
    },
    skin: {
        name: "Collagen (Skin & Bone)",
        pdbId: "1bkv",
        role: "Tissue support, elasticity, and extracellular matrix scaffolding.",
        details: "Collagen molecule folds into a signature triple-helix structure. Repeating Glycine-Proline-Hydroxyproline sequences wind tightly together, stabilized by proline modifications.",
        disease: "Osteogenesis Imperfecta (brittle bone disease) or Scurvy (vitamin C deficiency disrupts helix stabilization)."
    },
    blood: {
        name: "Hemoglobin (Blood & Oxygen)",
        pdbId: "1a3n",
        role: "Transport of oxygen molecules from lungs to metabolic tissues.",
        details: "Hemoglobin has a quaternary fold consisting of four subunits (two alpha, two beta). Each subunit holds a flat chemical ring called a Heme group with an iron atom.",
        disease: "Sickle Cell Disease or Thalassemia (impaired subunit production causing severe anemia)."
    },
    muscle: {
        name: "Myosin (Muscle Motors)",
        pdbId: "1w7j",
        role: "ATP-powered mechanical contraction and force generation.",
        details: "Myosin is a molecular motor. Its globular head binds to actin filaments and hydrolyzes ATP. This chemical reaction triggers a conformational walk, generating contraction force.",
        disease: "Hypertrophic cardiomyopathy (heart muscle thickens abnormally, causing arrhythmias)."
    },
    pancreas: {
        name: "Insulin (Hormone Regulation)",
        pdbId: "1trz",
        role: "Hormonal control of cellular glucose uptake and blood sugar levels.",
        details: "Insulin is a small hormone peptide built of two chains (A and B) linked by multiple disulfide bonds, locking it into a highly stable folding structure.",
        disease: "Type 1 Diabetes (autoimmune destruction of pancreatic beta cells) or Type 2 Diabetes (insulin receptor resistance)."
    },
    immune: {
        name: "Immunoglobulin (Antibodies)",
        pdbId: "1igy",
        role: "Pathogen recognition, antigen binding, and immune tagging.",
        details: "Antibodies are Y-shaped proteins. The tips of the Y form hypervariable loops (antigen-binding sites) that mutate rapidly to tag specific viral or bacterial coat structures.",
        disease: "Autoimmune disorders (where antibodies mistakenly tag healthy body tissue) or immunodeficiencies."
    }
};

const BODY_PART_TO_PROTEINS = {
    "head": ["brain", "hair"],
    "left-shoulder": ["immune", "skin"],
    "right-shoulder": ["immune", "skin"],
    "left-arm": ["skin"],
    "right-arm": ["skin"],
    "chest": ["blood", "organs", "immune"],
    "stomach": ["pancreas", "organs"],
    "left-leg": ["muscle"],
    "right-leg": ["muscle"],
    "left-hand": ["skin"],
    "right-hand": ["skin"],
    "left-foot": ["skin"],
    "right-foot": ["skin"]
};

const LEGEND_ITEMS = [
    { label: "Head", regionId: "head", proteins: "Tau (Brain), Keratin (Hair)" },
    { label: "Shoulders", regionId: "left-shoulder", alternates: ["right-shoulder"], proteins: "Immunoglobulin (Antibodies)" },
    { label: "Chest", regionId: "chest", proteins: "Hemoglobin (Blood), EGFR (Lung)" },
    { label: "Stomach", regionId: "stomach", proteins: "Insulin (Pancreas), EGFR (Organs)" },
    { label: "Arms & Hands", regionId: "left-arm", alternates: ["right-arm", "left-hand", "right-hand"], proteins: "Collagen (Skin & Bone)" },
    { label: "Legs", regionId: "left-leg", alternates: ["right-leg"], proteins: "Myosin (Muscle Motors)" },
    { label: "Feet", regionId: "left-foot", alternates: ["right-foot"], proteins: "Collagen (Bones)" }
];

export class BodyMap {
    constructor(containerId, initialCifData) {
        this.container = document.getElementById(containerId);
        this.defaultCif = initialCifData; // hemoglobin cif
        this.viewer = null;
        this.currentRegion = "chest"; // start at chest / hemoglobin
        this.activeProteinKey = "blood";
        
        if (this.container) {
            this.render();
            this.bindEvents();
            this.init3D().then(() => this.selectRegion("chest", "blood"));
        }
    }
    
    render() {
        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="t-headline-lg">Human Body <span class="t-primary">Protein Map</span></h1>
                <p class="t-body-md" style="margin-top:var(--space-2);">Inspect protein distribution across the human anatomy. Click any body part or list item to load its 3D structures.</p>
            </div>
            
            <div class="viewer-split-layout">
                <!-- Human Body SVG Container & Legend Column -->
                <div style="display:flex; flex-direction:column; gap:20px;">
                    <div class="body-svg-container" style="position:relative; width:100%; min-height:520px; display:flex; justify-content:center; align-items:flex-start; background:var(--color-surface); border-radius: var(--radius-md); border: var(--border-glass); overflow:visible; padding:20px 0;">
                        
                        <!-- Dynamic Tooltip -->
                        <div id="body-part-tooltip" style="position:absolute; display:none; background:var(--color-elevated); border:1px solid var(--color-border-strong); color:var(--color-text-primary); padding:10px 14px; border-radius:6px; font-size:0.9rem; pointer-events:none; z-index:10002; box-shadow:0 4px 15px rgba(0,0,0,0.5); width:180px; backdrop-filter:blur(8px);">
                            <div style="font-weight:700; color:var(--color-primary-hover); border-bottom:1px solid var(--color-border); padding-bottom:4px; margin-bottom:4px;" id="tooltip-title">Part</div>
                            <div style="color:var(--color-text-secondary);" id="tooltip-body">Proteins</div>
                        </div>
                        
                        <!-- Detailed Interactive SVG Human Body Map -->
                        <div class="human-body" style="z-index: 1;">
                            <svg data-position='head' id='head' class='head' xmlns='http://www.w3.org/2000/svg' width='56.594' height='95.031' viewBox='0 0 56.594 95.031'><path d='M15.92 68.5l8.8 12.546 3.97 13.984-9.254-7.38-4.622-15.848zm27.1 0l-8.8 12.546-3.976 13.988 9.254-7.38 4.622-15.848zm6.11-27.775l.108-11.775-21.16-14.742L8.123 26.133 8.09 40.19l-3.24.215 1.462 9.732 5.208 1.81 2.36 11.63 9.72 11.018 10.856-.324 9.56-10.37 1.918-11.952 5.207-1.81 1.342-9.517zm-43.085-1.84l-.257-13.82L28.226 11.9l23.618 15.755-.216 10.37 4.976-17.085L42.556 2.376 25.49 0 10.803 3.673.002 24.415z'/></svg>
                            <svg data-position='left-shoulder' id='left-shoulder' class='left-shoulder' xmlns='http://www.w3.org/2000/svg' width='109.532' height='46.594' viewBox='0 0 109.532 46.594'><path d='m 38.244,-0.004 1.98,9.232 -11.653,2.857 -7.474,-2.637 z M 17.005,10.536 12.962,8.35 0.306,22.35 0.244,27.675 c 0,0 16.52,-17.015 16.764,-17.14 z m 1.285,0.58 C 18.3,11.396 0.528,30.038 0.528,30.038 L -0.01,46.595 6.147,36.045 18.017,30.989 26.374,15.6 Z'/></svg>
                            <svg data-position='right-shoulder' id='right-shoulder' class='right-shoulder' xmlns='http://www.w3.org/2000/svg' width='109.532' height='46.594' viewBox='0 0 109.532 46.594'><path d='m 3.2759972,-0.004 -1.98,9.232 11.6529998,2.857 7.473999,-2.637 z m 21.2379988,10.54 4.044,-2.187 12.656,14 0.07,5.33 c 0,0 -16.524,-17.019 -16.769,-17.144 z m -1.285,0.58 c -0.008,0.28 17.762,18.922 17.762,18.922 l 0.537,16.557 -6.157,-10.55 -11.871,-5.057 L 15.147997,15.6 Z'/></svg>
                            <svg data-position='left-arm' id='left-arm' class='left-arm' xmlns='http://www.w3.org/2000/svg' width='156.344' height='119.25' viewBox='0 0 156.344 119.25'><path d='m21.12,56.5a1.678,1.678 0 0 1 -0.427,0.33l0.935,8.224l12.977,-13.89l1.2,-8.958a168.2,168.2 0 0 0 -14.685,14.294zm1.387,12.522l-18.07,48.91l5.757,1.333l19.125,-39.44l3.518,-22.047l-10.33,11.244zm-5.278,-18.96l2.638,18.74l-17.2,46.023l-2.657,-1.775l6.644,-35.518l10.575,-27.47zm18.805,-12.323a1.78,1.78 0 0 1 0.407,-0.24l3.666,-27.345l-7.037,-10.139l-7.258,10.58l-6.16,37.04l0.566,4.973a151.447,151.447 0 0 1 15.808,-14.87l0.008,0.001zm-13.742,-28.906l-3.3,35.276l-2.2,-26.238l5.5,-9.038z'/></svg>
                            <svg data-position='right-arm' id='right-arm' class='right-arm' xmlns='http://www.w3.org/2000/svg' width='156.344' height='119.25' viewBox='0 0 156.344 119.25'><path d='m 18.997,56.5 a 1.678,1.678 0 0 0 0.427,0.33 L 18.489,65.054 5.512,51.164 4.312,42.206 A 168.2,168.2 0 0 1 18.997,56.5 Z m -1.387,12.522 18.07,48.91 -5.757,1.333 L 10.798,79.825 7.28,57.778 17.61,69.022 Z m 5.278,-18.96 -2.638,18.74 17.2,46.023 2.657,-1.775 L 33.463,77.532 22.888,50.062 Z M 4.083,37.739 A 1.78,1.78 0 0 0 3.676,37.499 L 0.01,10.154 7.047,0.015 l 7.258,10.58 6.16,37.04 -0.566,4.973 A 151.447,151.447 0 0 0 4.091,37.738 l -0.008,10e-4 z m 13.742,-28.906 3.3,35.276 2.2,-26.238 -5.5,-9.038 z'/></svg>
                            <svg data-position='chest' id='chest' class='chest' xmlns='http://www.w3.org/2000/svg' width='86.594' height='45.063' viewBox='0 0 86.594 45.063'><path d='M19.32 0l-9.225 16.488-10.1 5.056 6.15 4.836 4.832 14.07 11.2 4.616 17.85-8.828-4.452-34.7zm47.934 0l9.225 16.488 10.1 5.056-6.15 4.836-4.833 14.07-11.2 4.616-17.844-8.828 4.45-34.7z'/></svg>
                            <svg data-position='stomach' id='stomach' class='stomach' xmlns='http://www.w3.org/2000/svg' width='75.25' height='107.594' viewBox='0 0 75.25 107.594'><path d='M19.25 7.49l16.6-7.5-.5 12.16-14.943 7.662zm-10.322 8.9l6.9 3.848-.8-9.116zm5.617-8.732L1.32 2.15 6.3 15.6zm-8.17 9.267l9.015 5.514 1.54 11.028-8.795-5.735zm15.53 5.89l.332 8.662 12.286-2.665.664-11.826zm14.61 84.783L33.28 76.062l-.08-20.53-11.654-5.736-1.32 37.5zM22.735 35.64L22.57 46.3l11.787 3.166.166-16.657zm-14.16-5.255L16.49 35.9l1.1 11.25-8.8-7.06zm8.79 22.74l-9.673-7.28-.84 9.78L-.006 68.29l10.564 14.594 5.5.883 1.98-20.735zM56 7.488l-16.6-7.5.5 12.16 14.942 7.66zm10.32 8.9l-6.9 3.847.8-9.116zm-5.617-8.733L73.93 2.148l-4.98 13.447zm8.17 9.267l-9.015 5.514-1.54 11.03 8.8-5.736zm-15.53 5.89l-.332 8.662-12.285-2.665-.664-11.827zm-14.61 84.783l3.234-31.536.082-20.532 11.65-5.735 1.32 37.5zm13.78-71.957l.166 10.66-11.786 3.168-.166-16.657zm14.16-5.256l-7.915 5.514-1.1 11.25 8.794-7.06zm-8.79 22.743l9.673-7.28.84 9.78 6.862 12.66-10.564 14.597-5.5.883-1.975-20.74z'/></svg>
                            <svg data-position='left-leg' id='left-leg' class='left-leg' xmlns='http://www.w3.org/2000/svg' width='93.626' height='250.625' viewBox='0 0 93.626 250.625'><path d='m 18.00179,139.99461 -0.664,5.99 4.647,5.77 1.55,9.1 3.1,1.33 2.655,-13.755 1.77,-4.88 -1.55,-3.107 z m 20.582,0.444 -3.32,9.318 -7.082,13.755 1.77,12.647 5.09,-14.2 4.205,-7.982 z m -26.557,-12.645 5.09,27.29 -3.32,-1.777 -2.656,8.875 z m 22.795,42.374 -1.55,4.88 -3.32,20.634 -0.442,27.51 4.65,26.847 -0.223,-34.39 4.87,-13.754 0.663,-15.087 z m -10.623,12.424 1.106,41.267 c 14.157565,64.57987 -5.846437,10.46082 -16.8199998,-29.07 l 5.5329998,-36.384 z m -9.71,-178.164003 0,22.476 15.71,31.073 9.923,30.850003 -1.033,-21.375 z m 25.49,30.248 0.118,-0.148 -0.793,-2.024 -16.545,-18.16 -1.242,-0.44 10.984,28.378 z m -6.255,10.766 6.812,17.6 2.274,-21.596 -1.344,-3.43 z m -26.4699998,17.82 0.827,25.340003 12.8159998,35.257 -3.928,10.136 -12.6099998,-44.51 z M 31.81879,76.04161 l 0.345,0.826 6.47,15.48 -4.177,38.342 -6.594,-3.526 5.715,-35.7 z m -21.465,-74.697003 0.827,21.373 L 4.1527902,65.02561 0.84679017,30.870607 Z m 2.068,27.323 14.677,32.391 3.307,26.000003 -6.2,36.58 -13.437,-37.241 -0.8269998,-38.342003 z'/></svg>
                            <svg data-position='right-leg' id='right-leg' class='right-leg' xmlns='http://www.w3.org/2000/svg' width='80' height='250.625' viewBox='0 0 80 250.625'><path d='m 26.664979,139.7913 0.663,5.99 -4.647,5.77 -1.55,9.1 -3.1,1.33 -2.655,-13.755 -1.77,-4.88 1.55,-3.107 z m -20.5820002,0.444 3.3200005,9.318 7.0799997,13.755 -1.77,12.647 -5.0899997,-14.2 -4.2000005,-7.987 z m 3.7620005,29.73 1.5499997,4.88 3.32,20.633 0.442,27.51 -4.648,26.847 0.22,-34.39 -4.8670002,-13.754 -0.67,-15.087 z m 10.6229997,12.424 -1.107,41.267 -8.852,33.28 9.627,-4.55 16.046,-57.8 -5.533,-36.384 z m -13.9460002,74.991 c -5.157661,19.45233 -2.5788305,9.72616 0,0 z M 30.177979,4.225305 l 0,22.476 -15.713,31.072 -9.9230002,30.850005 1.033,-21.375005 z m -25.4930002,30.249 -0.118,-0.15 0.793,-2.023 16.5450002,-18.16 1.24,-0.44 -10.98,28.377 z m 6.2550002,10.764 -6.8120002,17.6 -2.274,-21.595 1.344,-3.43 z m 26.47,17.82 -0.827,25.342005 -12.816,35.25599 3.927,10.136 12.61,-44.50999 z m -24.565,12.783005 -0.346,0.825 -6.4700002,15.48 4.1780002,38.34199 6.594,-3.527 -5.715,-35.69999 z m 19.792,51.74999 -5.09,27.29 3.32,-1.776 2.655,8.875 z m 1.671,-126.452995 -0.826,21.375 7.03,42.308 3.306,-34.155 z m -2.066,27.325 -14.677,32.392 -3.308,26.000005 6.2,36.57999 13.436,-37.23999 0.827,-38.340005 z'/></svg>
                            <svg data-position='left-hand' id='left-hand' class='left-hand' xmlns='http://www.w3.org/2000/svg' width='90' height='38.938' viewBox='0 0 90 38.938'><path d='m 21.255,-0.00198191 2.88,6.90000201 8.412,1.335 0.664,12.4579799 -4.427,17.8 -2.878,-0.22 2.8,-11.847 -2.99,-0.084 -4.676,12.6 -3.544,-0.446 4.4,-12.736 -3.072,-0.584 -5.978,13.543 -4.428,-0.445 6.088,-14.1 -2.1,-1.25 L 4.878,34.934 1.114,34.489 12.4,12.9 11.293,11.12 0.665,15.57 0,13.124 8.635,5.3380201 Z' /></svg>
                            <svg data-position='right-hand' id='right-hand' class='right-hand' xmlns='http://www.w3.org/2000/svg' width='90' height='38.938' viewBox='0 0 90 38.938'><path d='m 13.793386,-0.00198533 -2.88,6.90000163 -8.4120002,1.335 -0.664,12.4579837 4.427,17.8 2.878,-0.22 -2.8,-11.847 2.99,-0.084 4.6760002,12.6 3.544,-0.446 -4.4,-12.736 3.072,-0.584 5.978,13.543 4.428,-0.445 -6.088,-14.1 2.1,-1.25 7.528,12.012 3.764,-0.445 -11.286,-21.589 1.107,-1.78 10.628,4.45 0.665,-2.447 -8.635,-7.7859837 z'/></svg>
                            <svg data-position='left-foot' id='left-foot' class='left-foot' xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'><path d='m 19.558357,1.92821 c -22.1993328,20.55867 -11.0996668,10.27933 0,0 z m 5.975,5.989 -0.664,18.415 -1.55,6.435 -4.647,0 -1.327,-4.437 -1.55,-0.222 0.332,4.437 -5.864,-1.778 -1.5499998,-0.887 -6.64,-1.442 -0.22,-5.214 6.418,-10.87 4.4259998,-5.548 c 9.991542,-3.26362 9.41586,-8.41457 12.836,1.111 z'/></svg>
                            <svg data-position='right-foot' id='right-foot' class='right-foot' xmlns='http://www.w3.org/2000/svg' width='90' height='38.938' viewBox='0 0 90 38.938'><path d='m 11.723492,2.35897 c -40.202667,20.558 -20.1013335,10.279 0,0 z m -5.9740005,5.989 0.663,18.415 1.546,6.435 4.6480005,0 1.328,-4.437 1.55,-0.222 -0.333,4.437 5.863,-1.778 1.55,-0.887 6.638,-1.442 0.222,-5.214 -6.418,-10.868 -4.426,-5.547 -10.8440005,-4.437 z'/> </svg>
                        </div>
                    </div>
                    
                    <!-- Biological Region Mappings Card List -->
                    <div class="glass-panel" style="padding:15px; margin-top:0;">
                        <h4 style="color:var(--color-primary-hover); margin-bottom:12px; font-weight:600; font-size:1.25rem; border-bottom:1px solid var(--color-border); padding-bottom:8px;">Region & Protein Mappings</h4>
                        <div id="body-map-legend" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(230px, 1fr)); gap:10px; max-height: 250px; overflow-y: auto;">
                            ${LEGEND_ITEMS.map(item => `
                                <div class="legend-item" data-region="${item.regionId}" data-alternates="${item.alternates ? item.alternates.join(",") : ''}" style="padding:8px 12px; background:var(--color-primary-soft); border:1px solid var(--color-border); border-radius:6px; cursor:pointer; font-size:0.95rem; transition:all 0.3s ease;">
                                    <div style="font-weight:700; color:var(--color-primary-hover); display:flex; justify-content:space-between;">
                                        <span>${item.label}</span>
                                        <span style="font-size:1.05rem; color:var(--color-text-muted); font-weight:normal;">Click to Map</span>
                                    </div>
                                    <div style="color:var(--color-text-muted); font-size:1.05rem; margin-top:4px;">${item.proteins}</div>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                </div>
                
                <!-- 3D Visualization and Details Column -->
                <div style="display:flex; flex-direction:column; gap:20px;">
                    <div class="glass-panel" style="padding:0; overflow:hidden;">
                        <div class="viewer-3d-box">
                            <div id="viewer-bodymap-3d" class="viewer-canvas"></div>
                            <div class="viewer-overlay" id="bodymap-viewer-overlay" style="font-size:1.05rem;">Interactive 3D Viewer</div>
                        </div>
                    </div>
                    
                    <div class="glass-panel" style="flex-grow:1; display:flex; flex-direction:column; gap:10px;">
                        <h3 id="body-protein-title" style="color:var(--color-primary-hover);">Hemoglobin</h3>
                        
                        <!-- Selector panel for regional proteins -->
                        <div id="body-protein-selector" style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:5px;"></div>
                        
                        <div style="margin-top:10px; display:flex; flex-direction:column; gap:12px; font-size:1.05rem; border-top:1px solid var(--color-border); padding-top:15px;">
                            <div>
                                <strong style="color:var(--color-primary-hover);">Biological Function:</strong>
                                <span id="body-protein-role" style="color:var(--color-text-secondary);"></span>
                            </div>
                            <div>
                                <strong style="color:var(--color-primary-hover);">Structural Architecture:</strong>
                                <span id="body-protein-details" style="color:var(--color-text-secondary);"></span>
                            </div>
                            <div>
                                <strong style="color:var(--color-danger);">Disease Association:</strong>
                                <span id="body-protein-disease" style="color:var(--color-text-secondary);"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    async init3D() {
        this.viewer = new MolStarViewer("viewer-bodymap-3d", {
            layoutShowControls: false,
            layoutShowSequence: false,
            layoutShowLog: false,
            layoutShowLeftPanel: false,
            layoutShowRemoteState: false,
            collapseLeftPanel: true,
        });
        await this.viewer.ready();
    }
    
    bindEvents() {
        const self = this;
        const svgs = this.container.querySelectorAll(".human-body svg");
        const legendItems = this.container.querySelectorAll(".legend-item");
        const tooltip = document.getElementById("body-part-tooltip");
        const tooltipTitle = document.getElementById("tooltip-title");
        const tooltipBody = document.getElementById("tooltip-body");
        const container = this.container.querySelector(".body-svg-container");
        
        // svg clicks
        svgs.forEach(svg => {
            const pos = svg.getAttribute("data-position");
            
            svg.addEventListener("click", () => {
                if (pos && BODY_PART_TO_PROTEINS[pos]) {
                    const proteins = BODY_PART_TO_PROTEINS[pos];
                    self.selectRegion(pos, proteins[0]);
                }
            });
            
            // svg hovers (tooltips)
            svg.addEventListener("mouseenter", () => {
                if (pos) {
                    const legendItem = LEGEND_ITEMS.find(item => item.regionId === pos || (item.alternates && item.alternates.includes(pos)));
                    if (legendItem) {
                        tooltipTitle.textContent = legendItem.label;
                        tooltipBody.textContent = legendItem.proteins;
                        tooltip.style.display = "block";
                    }
                }
            });
            
            svg.addEventListener("mousemove", (e) => {
                const rect = container.getBoundingClientRect();
                const x = e.clientX - rect.left + 15;
                const y = e.clientY - rect.top + 15;
                tooltip.style.left = `${x}px`;
                tooltip.style.top = `${y}px`;
            });
            
            svg.addEventListener("mouseleave", () => {
                tooltip.style.display = "none";
            });
        });
        
        // legend item clicks
        legendItems.forEach(item => {
            const regionId = item.getAttribute("data-region");
            item.addEventListener("click", () => {
                if (regionId && BODY_PART_TO_PROTEINS[regionId]) {
                    const proteins = BODY_PART_TO_PROTEINS[regionId];
                    self.selectRegion(regionId, proteins[0]);
                }
            });
            
            // legend item hovers (highlights SVG part)
            item.addEventListener("mouseenter", () => {
                const alternatesAttr = item.getAttribute("data-alternates");
                const alternates = alternatesAttr ? alternatesAttr.split(",") : [];
                svgs.forEach(svg => {
                    const pos = svg.getAttribute("data-position");
                    if (pos === regionId || alternates.includes(pos)) {
                        svg.style.fill = "var(--color-info)";
                        svg.style.filter = "drop-shadow(0 0 10px var(--color-info))";
                    }
                });
            });
            
            item.addEventListener("mouseleave", () => {
                svgs.forEach(svg => {
                    const pos = svg.getAttribute("data-position");
                    if (pos === self.currentRegion) {
                        svg.style.fill = "";
                        svg.style.filter = "";
                    } else {
                        svg.style.fill = "";
                        svg.style.filter = "";
                    }
                });
            });
        });
    }
    
    selectRegion(regionId, proteinKey) {
        this.currentRegion = regionId;
        this.activeProteinKey = proteinKey;
        
        // Highlight active SVG element in body map
        const svgs = this.container.querySelectorAll(".human-body svg");
        svgs.forEach(svg => {
            svg.style.fill = "";
            svg.style.filter = "";
            if (svg.getAttribute("data-position") === regionId) {
                svg.classList.add("active");
            } else {
                svg.classList.remove("active");
            }
        });
        
        // Highlight active legend item
        const legendItems = this.container.querySelectorAll(".legend-item");
        legendItems.forEach(item => {
            const regId = item.getAttribute("data-region");
            const alternatesAttr = item.getAttribute("data-alternates");
            const alternates = alternatesAttr ? alternatesAttr.split(",") : [];
            
            if (regId === regionId || alternates.includes(regionId)) {
                item.style.borderColor = "var(--color-warning)";
                item.style.background = "var(--color-warning-soft)";
            } else {
                item.style.borderColor = "";
                item.style.background = "";
            }
        });
        
        // Render selector buttons for this region
        const selectorContainer = document.getElementById("body-protein-selector");
        if (selectorContainer) {
            const keys = BODY_PART_TO_PROTEINS[regionId] || [];
            if (keys.length > 1) {
                selectorContainer.innerHTML = keys.map(k => {
                    const isSelected = k === proteinKey;
                    const name = BODY_PROTEINS[k]?.name.split(" ")[0] || k;
                    return `<button class="${isSelected ? 'btn-primary' : 'btn-secondary'}" data-key="${k}" style="padding:6px 12px; font-size:0.95rem; margin:0; cursor:pointer;">${name}</button>`;
                }).join("");
                
                // Add click handlers to buttons
                selectorContainer.querySelectorAll("button").forEach(btn => {
                    btn.addEventListener("click", () => {
                        const key = btn.getAttribute("data-key");
                        this.selectRegion(regionId, key);
                    });
                });
            } else {
                selectorContainer.innerHTML = "";
            }
        }
        
        // Load details and 3D structure
        this.loadProteinData(proteinKey);
    }
    
    async loadProteinData(key) {
        const p = BODY_PROTEINS[key];
        if (!p) return;
        
        document.getElementById("body-protein-title").textContent = p.name;
        document.getElementById("body-protein-role").textContent = p.role;
        document.getElementById("body-protein-details").textContent = p.details;
        document.getElementById("body-protein-disease").textContent = p.disease;
        
        const overlay = document.getElementById("bodymap-viewer-overlay");
        overlay.textContent = `Loading ${p.name}...`;
        
        try {
            if (key === "blood" && this.defaultCif) {
                await this.viewer.loadStructureFromData(this.defaultCif, "mmcif");
                overlay.textContent = `${p.name} (Local structural model)`;
            } else {
                const structure = await api.getStructure(p.pdbId);
                await this.viewer.loadStructureFromData(structure.data, "mmcif");
                overlay.textContent = `${p.name} (${structure.source})`;
            }
        } catch (e) {
            overlay.textContent = `Offline. Coords failed.`;
        }
    }
}
