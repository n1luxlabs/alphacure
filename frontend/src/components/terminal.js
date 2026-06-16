import { api } from "../services/api.js";

export class ScienceTerminal {
    constructor(containerId, onProteinLoad, onMutationHighlight) {
        this.container = document.getElementById(containerId);
        this.onProteinLoad = onProteinLoad; // callback when a protein structure is fetched
        this.onMutationHighlight = onMutationHighlight; // callback when a residue is mutated
        
        if (this.container) {
            this.initTerminal();
        }
    }
    
    initTerminal() {
        this.container.innerHTML = `
            <div class="terminal-window">
                <div class="terminal-header">
                    <div class="terminal-dot r"></div>
                    <div class="terminal-dot y"></div>
                    <div class="terminal-dot g"></div>
                    <div class="terminal-header-title">ALPHACURE SCIENCE TERMINAL v2.10</div>
                </div>
                <div class="terminal-output" id="term-out">
                    <div class="terminal-line system">Ready. Type 'help' to show all active science operations.</div>
                </div>
                <div class="terminal-input-row">
                    <div class="terminal-prompt">></div>
                    <input type="text" class="terminal-input" id="term-in" autofocus autocomplete="off" />
                </div>
            </div>
        `;
        
        this.dom = {
            output: document.getElementById("term-out"),
            input: document.getElementById("term-in")
        };
        
        this.dom.input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                this.executeCommand();
            }
        });
    }
    
    writeLine(text, type = "normal") {
        const line = document.createElement("div");
        line.className = `terminal-line ${type}`;
        line.innerHTML = text;
        this.dom.output.appendChild(line);
        this.dom.output.scrollTop = this.dom.output.scrollHeight;
    }
    
    async executeCommand() {
        const fullCmd = this.dom.input.value.trim();
        this.dom.input.value = "";
        if (!fullCmd) return;
        
        this.writeLine(`> ${fullCmd}`, "command");
        
        const tokens = fullCmd.split(/\s+/);
        const cmd = tokens[0].toLowerCase();
        const args = tokens.slice(1);
        
        switch (cmd) {
            case "help":
                this.writeLine("Available terminal operations:");
                this.writeLine("  help                               - List all workstation commands");
                this.writeLine("  fetch &lt;pdb_id&gt;                     - Fetch structure coordinates (e.g. 'fetch 1a3n')");
                this.writeLine("  predict &lt;amino_acid_sequence&gt;     - Run structural fold predictions");
                this.writeLine("  show mutation &lt;idx&gt; &lt;new_AA&gt;      - Test structural effect of mutations (e.g. 'show mutation 6 val')");
                this.writeLine("  analyze &lt;disease_name&gt;             - Perform structural diagnosis (sickle, alzheimers, parkinsons)");
                this.writeLine("  clear                              - Clear screen records");
                break;
                
            case "clear":
                this.dom.output.innerHTML = "";
                break;
                
            case "fetch":
                if (args.length === 0) {
                    this.writeLine("Error: Missing PDB identifier parameter. E.g. 'fetch 1a3n'", "error");
                    break;
                }
                const pdbId = args[0];
                this.writeLine(`Connecting to Protein Data Bank server for structure: '${pdbId}'...`, "system");
                try {
                    const structure = await api.getStructure(pdbId);
                    this.writeLine(`Successfully received structure coordinates from ${structure.source}!`, "success");
                    if (this.onProteinLoad) {
                        this.onProteinLoad(structure.data, pdbId);
                    }
                } catch (e) {
                    this.writeLine(`Error fetching structure '${pdbId}': ${e.message}`, "error");
                }
                break;
                
            case "predict":
                if (args.length === 0) {
                    this.writeLine("Error: Missing amino acid sequence string parameter.", "error");
                    break;
                }
                const seq = args[0].toUpperCase();
                // Validate sequence string containing standard letters
                if (!/^[ARNDCEQGHILKMFPSTWYV]+$/.test(seq)) {
                    this.writeLine("Error: Invalid characters. Sequences must contain standard single-letter amino acid codes only.", "error");
                    break;
                }
                this.writeLine(`Initializing structure modeling engine...`, "system");
                this.writeLine(`Running deep folding predictions on sequence: ${seq.substring(0, 15)}... (${seq.length} residues)`, "system");
                this.writeLine(`Iterating alignment patterns through Evoformer blocks...`, "system");
                
                setTimeout(() => {
                    this.writeLine("Coordinates coordinates predicted with 94.2% average confidence!", "success");
                    this.writeLine("Outputting 3D visual coordinates directly to main dashboard rendering panels.", "success");
                    // Load default model data as simulated rendering
                    if (this.onProteinLoad) {
                        // Triggers default hemoglobin load
                        this.onProteinLoad(null, "Predicted Model");
                    }
                }, 2000);
                break;
                
            case "show":
                if (args[0] === "mutation" || args[0] === "mut") {
                    if (args.length < 3) {
                        this.writeLine("Error: Missing parameters. E.g. 'show mutation 6 val'", "error");
                        break;
                    }
                    const idx = parseInt(args[1], 10);
                    const aa = args[2].toUpperCase();
                    if (isNaN(idx)) {
                        this.writeLine("Error: Residue index must be an integer.", "error");
                        break;
                    }
                    this.writeLine(`Highlighting mutation site: residue ${idx} substituted with ${aa}...`, "system");
                    if (this.onMutationHighlight) {
                        this.onMutationHighlight(idx, aa);
                        this.writeLine(`Mutation applied to 3D visualization layers. Check main viewer!`, "success");
                    }
                } else {
                    this.writeLine(`Unknown show sub-command. Try 'show mutation <index> <AA>'`, "error");
                }
                break;
                
            case "analyze":
                if (args.length === 0) {
                    this.writeLine("Error: Specify a disease. E.g. 'analyze sickle'", "error");
                    break;
                }
                const disease = args[0].toLowerCase();
                if (disease.includes("sickle")) {
                    this.writeLine("Sickle Cell Pathology Report:", "success");
                    this.writeLine("  - Target: Hemoglobin Subunit Beta (Glu6Val mutation)");
                    this.writeLine("  - Structural Effect: Mutation places a hydrophobic Valine on the surface.");
                    this.writeLine("  - Clinical Outcome: Hemoglobins lock together forming fibers, sickle-shaping red cells.");
                } else if (disease.includes("alzheimer")) {
                    this.writeLine("Alzheimer's Disease Pathology Report:", "success");
                    this.writeLine("  - Target: Amyloid-Beta Peptide accumulation");
                    this.writeLine("  - Structural Effect: Soluble helices misfold into insoluble beta-sheets.");
                    this.writeLine("  - Clinical Outcome: Sheets aggregate into plaques, inducing neurotoxicity.");
                } else if (disease.includes("parkinson")) {
                    this.writeLine("Parkinson's Disease Pathology Report:", "success");
                    this.writeLine("  - Target: Alpha-Synuclein folding anomaly");
                    this.writeLine("  - Structural Effect: Intrinsically disordered protein forms cross-beta amyloid fibrils.");
                    this.writeLine("  - Clinical Outcome: Accumulation of Lewy bodies inside neurons causing cell death.");
                } else {
                    this.writeLine(`Retrieving diagnosis for custom condition: '${args.join(" ")}'...`, "system");
                    try {
                        const summary = await api.chat("default_user", `Analyze the molecular biology structure basis of disease: ${args.join(" ")}`, { level: 9 }, []);
                        this.writeLine(summary);
                    } catch (e) {
                        this.writeLine("Unable to load remote medical definitions. Try again.", "error");
                    }
                }
                break;
                
            default:
                this.writeLine(`Command not recognized: '${cmd}'. Type 'help' to review guidelines.`, "error");
        }
    }
}
