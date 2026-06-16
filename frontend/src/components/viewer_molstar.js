export class MolStarViewer {
    constructor(elementId, options = {}) {
        this.element = document.getElementById(elementId);
        this.viewer = null;
        this.options = {
            layoutShowControls: false,
            layoutShowSequence: false,
            layoutShowLog: false,
            layoutShowLeftPanel: false,
            layoutShowRemoteState: false,
            collapseLeftPanel: true,
            ...options
        };
        this._ready = null;
        this._readyResolve = null;
        this._lastData = null;
        this._lastFormat = "mmcif";
        
        if (this.element && typeof molstar !== "undefined") {
            this._ready = new Promise((resolve) => { this._readyResolve = resolve; });
            this.init();
        } else if (this.element) {
            console.error("Mol* library not loaded");
        } else {
            this._ready = Promise.resolve();
        }
    }
    
    async init() {
        try {
            this.viewer = await molstar.Viewer.create(this.element, this.options);
            this.initialized = true;
            this._readyResolve();
        } catch (e) {
            console.error("Failed to init Mol* viewer:", e);
            if (this._readyResolve) this._readyResolve();
        }
    }
    
    async ready() {
        if (this._ready) await this._ready;
    }
    
    async loadStructureFromUrl(url, format = "mmcif") {
        if (!this.initialized || !this.viewer) return;
        try {
            await this.viewer.loadStructureFromUrl(url, format);
        } catch (e) {
            console.error("Mol* load structure failed:", e);
        }
    }
    
    async loadAlphaFold(uniprotAccession) {
        if (!this.initialized || !this.viewer) return;
        try {
            await this.viewer.loadAlphaFoldDb(uniprotAccession);
        } catch (e) {
            console.error("Mol* load AlphaFold failed:", e);
        }
    }
    
    async loadStructureFromData(data, format = "mmcif") {
        if (!this.initialized || !this.viewer) return;
        try {
            await this.viewer.loadStructureFromData(data, format);
            this._lastData = data;
            this._lastFormat = format;
        } catch (e) {
            console.error("Mol* load data failed:", e);
        }
    }
    
    async loadPdb(pdbString) {
        if (!this.initialized || !this.viewer) return;
        try {
            await this.viewer.loadPdb(pdbString);
            this._lastData = pdbString;
            this._lastFormat = "pdb";
        } catch (e) {
            console.error("Mol* load PDB failed:", e);
        }
    }

    async loadModel(data, format = "mmcif") {
        await this.ready();
        if (this.initialized) {
            this.clear();
        }
        await this.loadStructureFromData(data, format);
    }

    async applyStyle(styleType) {
        await this.ready();
        if (!this.initialized || !this.viewer) return;
        try {
            const plugin = this.viewer.plugin;
            const structures = plugin.managers.structure.hierarchy.current;
            if (structures.length === 0) return;
            const structure = structures[0];
            if (!structure.cell) return;
            
            if (styleType === "cartoon") {
                await plugin.builders.structure.representation.addRepresentation(structure.cell, {
                    type: "cartoon",
                    color: "chain-id"
                });
            } else if (styleType === "sphere") {
                await plugin.builders.structure.representation.addRepresentation(structure.cell, {
                    type: "sphere",
                    color: "element-symbol"
                });
            } else if (styleType === "stick") {
                await plugin.builders.structure.representation.addRepresentation(structure.cell, {
                    type: "ball-and-stick",
                    color: "element-symbol"
                });
            } else {
                await plugin.builders.structure.representation.addRepresentation(structure.cell, {
                    type: "cartoon",
                    color: "chain-id"
                });
            }
            await plugin.canvas3d?.commit();
        } catch (e) {
            console.error("Mol* applyStyle failed:", e);
        }
    }

    async highlightMutation(residueIndex, labelText) {
        await this.ready();
        if (!this.initialized || !this.viewer) return;
        try {
            const plugin = this.viewer.plugin;
            const structures = plugin.managers.structure.hierarchy.current;
            if (structures.length === 0) return;
            const structure = structures[0];
            if (!structure.cell) return;

            await plugin.builders.structure.representation.addRepresentation(structure.cell, {
                type: "cartoon",
                color: "chain-id"
            });

            await plugin.builders.structure.representation.addRepresentation(structure.cell, {
                type: "ball-and-stick",
                color: { scheme: "element-symbol" },
                focus: { resi: residueIndex }
            });

            await plugin.canvas3d?.commit();
        } catch (e) {
            console.error("Mol* highlightMutation failed:", e);
        }
    }
    
    clear() {
        if (!this.initialized || !this.viewer) return;
        try {
            this.viewer.plugin.clear();
        } catch (e) {
            console.error("Mol* clear failed:", e);
        }
    }
    
    handleResize() {
        if (this.initialized && this.viewer) {
            this.viewer.handleResize();
        }
    }
    
    async focusStructure() {
        await this.ready();
        if (!this.initialized || !this.viewer) return;
        try {
            const plugin = this.viewer.plugin;
            const structures = plugin.managers.structure.hierarchy.current;
            if (structures.length === 0) return;
            const structure = structures[0];
            if (structure.cell) {
                await plugin.managers.camera.focusStructure(structure.cell);
                await plugin.canvas3d?.commit();
            }
        } catch (e) {
            try {
                const plugin = this.viewer.plugin;
                await plugin.managers.camera.reset();
                await plugin.canvas3d?.commit();
            } catch (e2) {
                console.error("Mol* focus failed:", e2);
            }
        }
    }

    async loadFromUrlOrFallback(url, format, fallbackUrl, fallbackFormat) {
        try {
            await this.loadStructureFromUrl(url, format);
        } catch {
            console.warn("Primary URL failed, trying fallback");
            if (fallbackUrl) {
                await this.loadStructureFromUrl(fallbackUrl, fallbackFormat || format);
            }
        }
    }
}
