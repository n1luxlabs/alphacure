import { api } from "../services/api.js";

const LEVEL_DATA = [
    {
        level: 0,
        title: "The Curious Visitor",
        subtitle: "Enter the Molecular Universe",
        topic: "general biology",
        story: "You arrive at the threshold of the cell. Microscopic nanomachines are buzzing around you, performing tasks that keep you alive. You wonder: what rules govern this hidden universe? Let's start with a simple truth: life is structural. Structure determines function.",
        challengeType: "info",
        challengePrompt: "Click 'Understand' below to initialize your cellular scanning visor."
    },
    {
        level: 1,
        title: "Cell Explorer",
        subtitle: "Tour the Cellular Factory",
        topic: "cells",
        story: "Your visor boots up. You see that you are inside a cell. It is crowded! Vesicles carry cargo along microtubule tracks like trains, powered by motor proteins. At the center is the nucleus, containing the blueprint vault. Ribosomes are translating messages into working machines.",
        challengeType: "click",
        challengePrompt: "Where are new proteins built?",
        challengeOptions: ["Mitochondria", "Ribosome", "Cell Membrane", "Lysosome"],
        challengeAnswer: "Ribosome"
    },
    {
        level: 2,
        title: "DNA Explorer",
        subtitle: "Unlock the Vault",
        topic: "dna",
        story: "You enter the nucleus vault. Inside lies the double-stranded helix: DNA. The code uses only 4 base letters: A, T, C, G. It contains the instructions for every protein. DNA is stable, wrapping around histones like a secure hard drive.",
        challengeType: "match",
        challengePrompt: "Complete the base pair for this DNA sequence: <strong>A - T - C - G</strong>",
        challengeOptions: ["T-A-G-C", "A-T-C-G", "U-A-C-G", "G-C-T-A"],
        challengeAnswer: "T-A-G-C"
    },
    {
        level: 3,
        title: "RNA Messenger",
        subtitle: "The Transcription Transmit",
        topic: "rna",
        story: "To build a protein, the cell cannot take the DNA out of the nucleus—it might get damaged. Instead, an enzyme called RNA Polymerase copies the DNA sequence into a temporary single-stranded copy called Messenger RNA (mRNA). Uracil (U) takes the place of Thymine (T).",
        challengeType: "click",
        challengePrompt: "Which nucleotide base is found in RNA but NOT DNA?",
        challengeOptions: ["Adenine", "Uracil", "Guanine", "Thymine"],
        challengeAnswer: "Uracil"
    },
    {
        level: 4,
        title: "Protein Builder",
        subtitle: "The Ribosomal Translation",
        topic: "proteins",
        story: "The mRNA strand exits the nucleus and enters a ribosome. The ribosome reads the mRNA in triplets called 'codons'. Each codon matches a specific amino acid. The ribosome acts as a literal assembly line, linking amino acids together into a peptide chain.",
        challengeType: "match",
        challengePrompt: "If amino acids are beads, what is the string that holds them together?",
        challengeOptions: ["Hydrogen bonds", "Peptide bonds", "Ionic bonds", "Disulfide links"],
        challengeAnswer: "Peptide bonds"
    },
    {
        level: 5,
        title: "Protein Folder",
        subtitle: "The 3D Morphing Game",
        topic: "folding",
        story: "The long chain of amino acids cannot perform work as a straight line. It must fold. Local parts form coils (alpha-helices) or flat sheets (beta-sheets). Then, hydrophobic forces pack non-polar sections inside, creating a stable 3D shape.",
        challengeType: "click",
        challengePrompt: "What is the primary folding force that drives oily amino acids to hide inside?",
        challengeOptions: ["Hydrophobic effect", "Disulfide bonds", "Backbone vibrations", "Thermal cooling"],
        challengeAnswer: "Hydrophobic effect"
    },
    {
        level: 6,
        title: "Mutation Detective",
        subtitle: "Identify the Genetic Error",
        topic: "mutations",
        story: "Sometimes, DNA transcription makes mistakes, or radiation damages a base. If a single base changes, the ribosome might place a different amino acid in the chain. This point mutation can disrupt the folding, rendering the machine broken, leading to disease.",
        challengeType: "click",
        challengePrompt: "A single amino acid mutation (Glu6Val) in hemoglobin causes what condition?",
        challengeOptions: ["Alzheimer's", "Parkinson's", "Sickle Cell Disease", "Diabetes"],
        challengeAnswer: "Sickle Cell Disease"
    },
    {
        level: 7,
        title: "AlphaFold Analyst",
        subtitle: "Solving the 50-Year Mystery",
        topic: "alphafold",
        story: "Predicting a protein's 3D shape from its sequence was an unsolved problem for 50 years. Biologists had to spend years crystallizing proteins. DeepMind created AlphaFold, using deep learning to predict coordinates to atomic accuracy in seconds.",
        challengeType: "click",
        challengePrompt: "What parameter does AlphaFold use to report the structural confidence of its predictions?",
        challengeOptions: ["R-factor", "pLDDT score", "B-factor", "K-value"],
        challengeAnswer: "pLDDT score"
    },
    {
        level: 8,
        title: "Drug Discovery Researcher",
        subtitle: "Design the Molecular Key",
        topic: "drug discovery",
        story: "With predicted structures in hand, researchers find active binding pockets on disease proteins. Using computational docking models, they test chemical structures to find an inhibitor that locks into the target site, blocking the pathogen's function.",
        challengeType: "click",
        challengePrompt: "In drug discovery, a target molecule is usually blocked by a drug that acts as a:",
        challengeOptions: ["Laser beam", "Chemical lock-and-key inhibitor", "Heat generator", "Protein cutter"],
        challengeAnswer: "Chemical lock-and-key inhibitor"
    },
    {
        level: 9,
        title: "Bioinformatics Scientist",
        subtitle: "Navigate the Global Databases",
        topic: "bioinformatics",
        story: "Bioinformaticians query massive public servers like UniProt (sequences) and the PDB (3D structures) to align genomes and compare homologous structures across species, tracing the evolutionary branches of life.",
        challengeType: "click",
        challengePrompt: "Which database stores all verified 3D molecular protein models?",
        challengeOptions: ["PubMed", "UniProt", "Protein Data Bank (PDB)", "GenBank"],
        challengeAnswer: "Protein Data Bank (PDB)"
    },
    {
        level: 10,
        title: "Protein Master",
        subtitle: "The Grand Evaluation",
        topic: "molecular biology",
        story: "You have traversed the entire cell, decoded DNA, folded sequences, diagnosed mutations, and docked pharmaceutical candidates. You are ready to take your final assessment to receive your Protein Master Certification.",
        challengeType: "info",
        challengePrompt: "Click below to begin your master exam. Standard certification requires 100% correct answers on all questions."
    }
];

export class RpgPath {
    constructor(containerId, openModalCallback, onLevelChangeCallback, triggerMascotAlert) {
        this.container = document.getElementById(containerId);
        this.openModal = openModalCallback;
        this.onLevelChange = onLevelChangeCallback;
        this.triggerMascot = triggerMascotAlert;
        
        this.userProfile = {
            name: "Curious Visitor",
            current_level: 0,
            achievements: []
        };
        
        this.activeLevelData = null;
        
        if (this.container) {
            this._renderSkeleton();
            this.loadProfile();
        }
    }
    
    async loadProfile() {
        try {
            const profile = await api.getProfile("default_user");
            if (profile) {
                this.userProfile = profile;
            }
        } catch (e) {
            console.error("Failed to load profile, using mock progress:", e);
        }
        this.render();
    }
    
    _renderSkeleton() {
        this.container.innerHTML = `
            <div class="page-header">
                <div class="skeleton skeleton-line" style="height:2.5rem; width:55%; margin-bottom:16px;"></div>
                <div class="skeleton skeleton-line-sm" style="height:1.05rem; width:40%;"></div>
            </div>
            <div class="glass-panel" style="margin-bottom:40px;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px;">
                    <div style="flex:1;">
                        <div class="skeleton skeleton-line" style="height:1.35rem; width:60%; margin-bottom:8px;"></div>
                        <div class="skeleton skeleton-line-sm" style="height:0.95rem; width:35%;"></div>
                    </div>
                    <div class="skeleton" style="width:120px; height:44px; border-radius:12px;"></div>
                </div>
            </div>
            <div class="rpg-levels-grid">
                ${Array(11).fill().map((_, i) => `
                    <div class="level-card" style="pointer-events:none;">
                        <div class="skeleton" style="width:50px; height:50px; border-radius:50%; flex-shrink:0;"></div>
                        <div class="level-details" style="background:var(--color-surface);">
                            <div style="flex:1;">
                                <div class="skeleton skeleton-line" style="height:1.25rem; width:55%; margin-bottom:6px;"></div>
                                <div class="skeleton skeleton-line-sm" style="height:0.9rem; width:35%;"></div>
                            </div>
                            <div class="skeleton" style="width:70px; height:28px; border-radius:20px; flex-shrink:0;"></div>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
    }

    render() {
        const curLvl = this.userProfile.current_level;
        
        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="t-headline-lg">RPG <span class="t-primary">Learning Pathway</span></h1>
                <p class="t-body-md" style="margin-top:var(--space-2);">Embark on a gamified quest from Curious Visitor to Protein Master. Unlock checkpoints and badges.</p>
            </div>
            
            <div class="glass-panel" style="margin-bottom: 40px;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap: 15px;">
                    <div>
                        <h3 style="color:var(--color-text-primary);">Your Progress: Level ${curLvl} - ${LEVEL_DATA[curLvl].title}</h3>
                        <p style="margin-bottom:0; font-size:1.25rem;">Unlocks and certificate become available at Level 10.</p>
                    </div>
                    <button class="btn-primary" id="btn-play-current">Resume Quest</button>
                </div>
            </div>
            
            <div class="rpg-levels-grid">
                ${LEVEL_DATA.map((lvl) => {
                    let status = "locked";
                    let statusText = "Locked";
                    
                    if (lvl.level < curLvl) {
                        status = "completed";
                        statusText = "Completed";
                    } else if (lvl.level === curLvl) {
                        status = "active";
                        statusText = "Active";
                    }
                    
                    return `
                        <div class="level-card ${status}" data-level="${lvl.level}">
                            <div class="level-badge-circle">${lvl.level}</div>
                            <div class="level-details">
                                <div class="level-text">
                                    <h4>${lvl.title}</h4>
                                    <p>${lvl.subtitle}</p>
                                </div>
                                <div class="level-status ${status}">${statusText}</div>
                            </div>
                        </div>
                    `;
                }).join("")}
            </div>
        `;
        
        this.bindEvents();
    }
    
    bindEvents() {
        const cards = this.container.querySelectorAll(".level-card");
        cards.forEach(card => {
            card.addEventListener("click", () => {
                const lvlNum = parseInt(card.getAttribute("data-level"), 10);
                if (lvlNum <= this.userProfile.current_level) {
                    this.startLevelQuest(lvlNum);
                } else {
                    this.triggerMascot("This level is locked! You must complete earlier checkpoints first.");
                }
            });
        });
        
        const resumeBtn = document.getElementById("btn-play-current");
        if (resumeBtn) {
            resumeBtn.addEventListener("click", () => {
                this.startLevelQuest(this.userProfile.current_level);
            });
        }
    }
    
    startLevelQuest(lvlNum) {
        const lvl = LEVEL_DATA[lvlNum];
        this.activeLevelData = lvl;
        
        let challengeHtml = "";
        
        if (lvl.challengeType === "click") {
            challengeHtml = `
                <div class="quiz-container" style="margin-top:20px;">
                    <div class="quiz-question">${lvl.challengePrompt}</div>
                    <div class="quiz-options">
                        ${lvl.challengeOptions.map(opt => `
                            <button class="option-btn challenge-opt" data-ans="${opt}">${opt}</button>
                        `).join("")}
                    </div>
                </div>
            `;
        } else if (lvl.challengeType === "match") {
            challengeHtml = `
                <div class="quiz-container" style="margin-top:20px;">
                    <div class="quiz-question">${lvl.challengePrompt}</div>
                    <div class="quiz-options">
                        ${lvl.challengeOptions.map(opt => `
                            <button class="option-btn challenge-opt" data-ans="${opt}">${opt}</button>
                        `).join("")}
                    </div>
                </div>
            `;
        } else {
            challengeHtml = `
                <div style="margin-top:25px; text-align:center;">
                    <p style="font-size:1.15rem; color:var(--color-text-primary);">${lvl.challengePrompt}</p>
                    <button class="btn-primary" id="btn-checkpoint-confirm">Understand</button>
                </div>
            `;
        }
        
        const modalHtml = `
            <div style="line-height:1.7;">
                <h3 style="color:var(--color-text-primary); font-size:1.75rem; margin-bottom:15px;">Quest: ${lvl.title}</h3>
                <p style="margin-bottom:20px; font-size:1.25rem; border-left:3px solid var(--color-border-strong); padding-left:15px; background:var(--color-surface); padding-top:10px; padding-bottom:10px;">
                    ${lvl.story}
                </p>
                <h4 style="margin-bottom:10px; color:var(--color-text-primary);">Interactive Checkpoint</h4>
                ${challengeHtml}
                <div id="checkpoint-feedback" style="margin-top:15px; font-weight:600; text-align:center;"></div>
            </div>
        `;
        
        this.openModal(`Level ${lvl.level} Story Mode`, modalHtml);
        
        // Bind checkpoint actions
        setTimeout(() => {
            const optBtns = document.querySelectorAll(".challenge-opt");
            const feedbackDiv = document.getElementById("checkpoint-feedback");
            
            if (optBtns.length > 0) {
                optBtns.forEach(btn => {
                    btn.addEventListener("click", () => {
                        const selVal = btn.getAttribute("data-ans");
                        if (selVal === lvl.challengeAnswer) {
                            btn.classList.add("correct");
                            feedbackDiv.innerHTML = "<span style='color:var(--color-success);'>Correct Checkpoint Cleared! Loading Level Quiz...</span>";
                            setTimeout(() => this.loadLevelQuiz(lvlNum), 1500);
                        } else {
                            btn.classList.add("wrong");
                            feedbackDiv.innerHTML = "<span style='color:var(--color-danger);'>Incorrect sequence. Try again!</span>";
                            setTimeout(() => btn.classList.remove("wrong"), 1000);
                        }
                    });
                });
            }
            
            const confirmBtn = document.getElementById("btn-checkpoint-confirm");
            if (confirmBtn) {
                confirmBtn.addEventListener("click", () => {
                    feedbackDiv.innerHTML = "<span style='color:var(--color-success);'>Checkpoint initialized. Loading Level Quiz...</span>";
                    setTimeout(() => this.loadLevelQuiz(lvlNum), 1000);
                });
            }
        }, 100);
    }
    
    async loadLevelQuiz(lvlNum) {
        const lvl = LEVEL_DATA[lvlNum];
        this.openModal(`Level ${lvlNum} Adaptive Quiz`, `
            <div style="text-align:center; padding:30px;">
                <p style="color:var(--color-text-primary);">Initializing N1LUX AI Quiz engine...</p>
                <div class="profile-xp-bar" style="max-width:300px; margin:20px auto; overflow:hidden;">
                    <div class="profile-xp-fill" style="width:100%; animation: textPulse 1.5s infinite alternate;"></div>
                </div>
            </div>
        `);
        
        let quizData = null;
        try {
            quizData = await api.generateQuiz("default_user", lvl.topic, "easy");
        } catch (e) {
            console.error("AI Quiz failed, using mock data:", e);
        }
        
        if (!quizData || !quizData.questions) {
            // Local fallback quiz dataset if api completely fails
            quizData = {
                questions: [
                    {
                        question: `Review Question: Which concept fits directly with ${lvl.topic}?`,
                        options: ["Structural machines", "Non-folding sheets", "Base combinations", "Peptide networks"],
                        answer: "Structural machines",
                        explanation: "Molecular biology entities act as nanoscale machines with strict structures."
                    }
                ]
            };
        }
        
        this.renderQuizQuestions(lvlNum, quizData.questions, 0, 0);
    }
    
    renderQuizQuestions(lvlNum, questions, currentIdx, score) {
        const q = questions[currentIdx];
        const title = `Level ${lvlNum} Quiz: Question ${currentIdx + 1}/${questions.length}`;
        
        const html = `
            <div>
                <div class="quiz-question" style="font-size:1.35rem; margin-bottom:20px;">
                    ${q.question}
                </div>
                <div class="quiz-options">
                    ${q.options.map(opt => `
                        <button class="option-btn quiz-opt" data-opt="${opt}">${opt}</button>
                    `).join("")}
                </div>
                <div id="quiz-feedback" style="margin-top:20px; padding:15px; border-radius:8px; display:none;"></div>
                <button class="btn-primary" id="btn-quiz-next" style="display:none; margin-top:20px; float:right;">Next Question</button>
            </div>
        `;
        
        this.openModal(title, html);
        
        setTimeout(() => {
            const optBtns = document.querySelectorAll(".quiz-opt");
            const feedbackDiv = document.getElementById("quiz-feedback");
            const nextBtn = document.getElementById("btn-quiz-next");
            let answered = false;
            
            optBtns.forEach(btn => {
                btn.addEventListener("click", () => {
                    if (answered) return;
                    answered = true;
                    
                    const sel = btn.getAttribute("data-opt");
                    feedbackDiv.style.display = "block";
                    
                    if (sel === q.answer) {
                        btn.classList.add("correct");
                        score++;
                        feedbackDiv.className = "quiz-explanation";
                        feedbackDiv.style.borderLeftColor = "var(--color-success)";
                        feedbackDiv.innerHTML = `<strong style="color:var(--color-success);">Correct!</strong><br>${q.explanation}`;
                    } else {
                        btn.classList.add("wrong");
                        feedbackDiv.className = "quiz-explanation";
                        feedbackDiv.style.borderLeftColor = "var(--color-danger)";
                        feedbackDiv.innerHTML = `<strong style="color:var(--color-danger);">Incorrect.</strong> Correct answer: <strong>${q.answer}</strong><br>${q.explanation}`;
                    }
                    
                    nextBtn.style.display = "block";
                });
            });
            
            nextBtn.addEventListener("click", () => {
                if (currentIdx + 1 < questions.length) {
                    this.renderQuizQuestions(lvlNum, questions, currentIdx + 1, score);
                } else {
                    this.completeLevelQuiz(lvlNum, score, questions.length);
                }
            });
        }, 100);
    }
    
    async completeLevelQuiz(lvlNum, score, total) {
        const passed = score >= Math.ceil(total * 0.6);
        let statusHtml = "";
        
        if (passed) {
            let badgeToUnlock = null;
            // Map levels to badges
            if (lvlNum === 1) badgeToUnlock = "Cell Explorer";
            if (lvlNum === 2) badgeToUnlock = "DNA Explorer";
            if (lvlNum === 4) badgeToUnlock = "Protein Builder";
            if (lvlNum === 5) badgeToUnlock = "Protein Explorer";
            if (lvlNum === 6) badgeToUnlock = "Mutation Hunter";
            if (lvlNum === 7) badgeToUnlock = "AlphaFold Analyst";
            if (lvlNum === 8) badgeToUnlock = "Drug Discovery Intern";
            
            // Advance user level
            const nextLvl = Math.max(this.userProfile.current_level, lvlNum + 1);
            const achievements = badgeToUnlock ? [badgeToUnlock] : [];
            
            if (lvlNum === 0 && !this.userProfile.achievements.includes("Protein Beginner")) {
                achievements.push("Protein Beginner");
            }
            
            try {
                const updatedProfile = await api.updateProgress("default_user", nextLvl, achievements, {
                    [`level_${lvlNum}`]: score
                });
                if (updatedProfile) {
                    this.userProfile = updatedProfile;
                }
            } catch (e) {
                console.error("Failed saving level progress:", e);
                // offline fallback progress advance
                this.userProfile.current_level = Math.max(this.userProfile.current_level, lvlNum + 1);
                if (badgeToUnlock && !this.userProfile.achievements.includes(badgeToUnlock)) {
                    this.userProfile.achievements.push(badgeToUnlock);
                }
            }
            
            statusHtml = `
                <div style="text-align:center; padding:20px;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="width:48px;height:48px;margin:0 auto;"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 9 6 9 9v1"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 15 6 15 9v1"/><path d="M4 22h16"/><path d="M10 22V9"/><path d="M14 22V9"/><path d="M12 2v2"/></svg>
                    <h3 class="t-headline-md" style="color:var(--color-success); margin-top:var(--space-4); margin-bottom:var(--space-3);">Quest Completed!</h3>
                    <p class="t-body-md">You scored <strong>${score}/${total}</strong> on the quiz.</p>
                    <p class="t-body-md" style="margin-top:var(--space-3); color:var(--color-text-primary);">Congratulations! You unlocked: <strong>Level ${lvlNum + 1} - ${LEVEL_DATA[Math.min(10, lvlNum + 1)].title}</strong></p>
                    ${badgeToUnlock ? `<p class="t-body-md" style="color:var(--color-primary-hover); font-weight:600;">Unlocked Badge: ${badgeToUnlock}</p>` : ""}
                    <button class="btn-primary" id="btn-quest-close" style="margin-top:20px;">Return to Map</button>
                </div>
            `;
            
            this.triggerMascot(`Awesome job! You cleared Level ${lvlNum}. Ready to advance?`);
        } else {
            statusHtml = `
                <div style="text-align:center; padding:20px;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="width:48px;height:48px;margin:0 auto;"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    <h3 class="t-headline-md" style="color:var(--color-danger); margin-top:var(--space-4); margin-bottom:var(--space-3);">Quest Failed</h3>
                    <p class="t-body-md">You scored <strong>${score}/${total}</strong>. You need at least 60% to pass.</p>
                    <p class="t-body-md" style="margin-top:var(--space-4);">Hint: Ask N1LUX AI for guidance on this level topic, review the study cards, and try again!</p>
                    <div class="row" style="justify-content:center; margin-top:var(--space-5);">
                        <button class="btn btn-secondary" id="btn-quest-retry">Retry Quest</button>
                        <button class="btn btn-primary" id="btn-quest-close">Return to Map</button>
                    </div>
                </div>
            `;
            this.triggerMascot(`You fell a bit short on the quiz, but don't worry! Let me know if you need help explaining these concepts.`);
        }
        
        this.openModal(`Level ${lvlNum} Quest Result`, statusHtml);
        
        setTimeout(() => {
            const closeBtn = document.getElementById("btn-quest-close");
            const retryBtn = document.getElementById("btn-quest-retry");
            
            if (closeBtn) {
                closeBtn.addEventListener("click", () => {
                    document.querySelector(".modal-close").click();
                    this.render(); // update map visual
                    if (this.onLevelChange) this.onLevelChange(this.userProfile.current_level);
                });
            }
            
            if (retryBtn) {
                retryBtn.addEventListener("click", () => {
                    this.startLevelQuest(lvlNum);
                });
            }
        }, 100);
    }
}
