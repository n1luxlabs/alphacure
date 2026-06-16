const COMIC_CHAPTERS = [
    {
        id: "covid19",
        title: "COVID-19: The Battle for Cell City",
        tagline: "A 14-page science adventure comic about the immune system vs. the coronavirus.",
        imageBase: "/static/assets/comics/covid19/",
        pages: [
            {
                title: "Page 1 — Peace in Cell City",
                caption: "Inside the human body, Cell City thrives peacefully.",
                dialogues: [
                    { speaker: "Antibody Captain", text: "All sectors secure." },
                    { speaker: "Oxy Squad", text: "Oxygen deliveries are on schedule!" }
                ]
            },
            {
                title: "Page 2 — A Strange Signal",
                caption: "Far beyond Cell City, an unknown intruder approaches.",
                dialogues: [
                    { speaker: "Scout Cell", text: "Captain, I'm detecting unusual spike signatures!" },
                    { speaker: "Antibody Captain", text: "Everyone stay alert." }
                ]
            },
            {
                title: "Page 3 — The Arrival of Spike King",
                caption: "A dangerous virus enters the body.",
                dialogues: [
                    { speaker: "Spike King", text: "Cell City will belong to me!" },
                    { speaker: "Corona Minions", text: "Long live Spike King!" }
                ]
            },
            {
                title: "Page 4 — The Cell Gate Attack",
                caption: "Spike King searches for a way into the city's cells.",
                dialogues: [
                    { speaker: "Spike King", text: "I only need one unlocked gate." },
                    { speaker: "Cell Citizen", text: "Close the barriers!" }
                ]
            },
            {
                title: "Page 5 — Invasion",
                caption: "The virus begins creating copies of itself.",
                dialogues: [
                    { speaker: "Spike King", text: "Replicate! Replicate!" },
                    { speaker: "Corona Minions", text: "The city will be overwhelmed!" }
                ]
            },
            {
                title: "Page 6 — Emergency Alert",
                caption: "The immune system launches a response.",
                dialogues: [
                    { speaker: "Antibody Captain", text: "All guardians mobilize!" },
                    { speaker: "Immune Team", text: "Defending Cell City!" }
                ]
            },
            {
                title: "Page 7 — The First Battle",
                caption: "Immune defenders confront the invaders.",
                dialogues: [
                    { speaker: "Antibody Captain", text: "You will go no farther." },
                    { speaker: "Spike King", text: "Try and stop me!" }
                ]
            },
            {
                title: "Page 8 — Oxygen Crisis",
                caption: "The infection affects the lungs, slowing oxygen delivery.",
                dialogues: [
                    { speaker: "Oxy Squad", text: "Routes are becoming blocked!" },
                    { speaker: "Cell Citizens", text: "We need more oxygen!" }
                ]
            },
            {
                title: "Page 9 — Scientists Investigate",
                caption: "Outside the body, researchers race against time.",
                dialogues: [
                    { speaker: "Scientist", text: "We must understand this virus." },
                    { speaker: "Research Team", text: "Every second counts." }
                ]
            },
            {
                title: "Page 10 — AI Science Guardian Arrives",
                caption: "A new ally joins the fight.",
                dialogues: [
                    { speaker: "AI Science Guardian", text: "I can analyze millions of biological patterns." },
                    { speaker: "Scientists", text: "Let's find a solution." }
                ]
            },
            {
                title: "Page 11 — Decoding the Enemy",
                caption: "The virus structure is revealed.",
                dialogues: [
                    { speaker: "AI Science Guardian", text: "I have mapped the spike architecture." },
                    { speaker: "Scientists", text: "Now we know its weakness." }
                ]
            },
            {
                title: "Page 12 — The Vaccine Vanguard",
                caption: "A powerful new defender is created.",
                dialogues: [
                    { speaker: "Vaccine Vanguard", text: "I will train the guardians before the next attack." },
                    { speaker: "Antibody Captain", text: "Welcome to the team." }
                ]
            },
            {
                title: "Page 13 — Immune Training",
                caption: "The immune system learns to recognize the enemy.",
                dialogues: [
                    { speaker: "Vaccine Vanguard", text: "Remember this spike pattern." },
                    { speaker: "Immune Recruits", text: "We won't forget." }
                ]
            },
            {
                title: "Page 14 — Final Showdown",
                caption: "Spike King launches one final assault.",
                dialogues: [
                    { speaker: "Spike King", text: "This city is mine!" },
                    { speaker: "Antibody Captain", text: "Not today." },
                    { speaker: "Vaccine Vanguard", text: "Defenders, move out!" }
                ]
            }
        ]
    },
    {
        id: "hemo-hero",
        title: "Hemo Hero: The Oxygen Guardian & The Shape Decoder",
        tagline: "\"One tiny mutation changed everything... until science learned to see the invisible.\"",
        imageBase: "/static/assets/comics/hemo-hero/",
        pages: [
            {
                title: "Page 1 — Introduction",
                caption: "Inside the human body exists a hidden world. Trillions of cells depend on one tiny hero for survival...",
                dialogues: [
                    { speaker: "Hemo Hero", text: "Another day, another trillion oxygen molecules to deliver! Up we go!" },
                    { speaker: "Oxy #1", text: "Ready for delivery!" },
                    { speaker: "Oxy #2", text: "Let's fuel those muscles!" }
                ]
            },
            {
                title: "Page 2 — The DNA Factory",
                caption: "Deep inside the nucleus, DNA stores the master blueprint of life.",
                dialogues: [
                    { speaker: "DNA Queen", text: "Every protein must follow the code exactly." },
                    { speaker: "Ribo", text: "Copying instructions now!" }
                ]
            },
            {
                title: "Page 3 — The Mutation Villain Appears",
                caption: "But one tiny mistake changes everything...",
                dialogues: [
                    { speaker: "Mutato", text: "Mwahaha! I will replace Glutamic Acid at position 6 with a sticky Valine!" },
                    { speaker: "DNA Queen", text: "No! That single change could be disastrous!" }
                ]
            },
            {
                title: "Page 4 — Wrong Protein Created",
                caption: "The ribosome unknowingly follows the corrupted instructions.",
                dialogues: [
                    { speaker: "Ribo", text: "Blueprint received. Building Hemoglobin." },
                    { speaker: "Mutato", text: "Hehehe... exactly as planned." }
                ]
            },
            {
                title: "Page 5 — Oxygen Delivery",
                caption: "At first, everything seems normal.",
                dialogues: [
                    { speaker: "Hemo Hero", text: "Mission proceeding normally." },
                    { speaker: "Oxy Squad", text: "Destination: Muscle City!" }
                ]
            },
            {
                title: "Page 6 — The Sticky Curse",
                caption: "The new Valine behaves differently...",
                dialogues: [
                    { speaker: "Valine", text: "I'm hydrophobic. I like sticking to other hemoglobins." },
                    { speaker: "Hemo Hero", text: "Wait... why am I sticking together?" }
                ]
            },
            {
                title: "Page 7 — Sickle Cell Transformation",
                caption: "The red blood cells lose their flexibility.",
                dialogues: [
                    { speaker: "Red Cell Citizen", text: "Something's wrong!" },
                    { speaker: "Hemo Hero", text: "We're turning rigid!" }
                ]
            },
            {
                title: "Page 8 — Body in Danger",
                caption: "The sickled cells block blood flow and reduce oxygen delivery.",
                dialogues: [
                    { speaker: "Muscle Cell", text: "We need oxygen!" },
                    { speaker: "Hemo Hero", text: "I'm trying!" }
                ]
            },
            {
                title: "Page 9 — Scientists Struggle",
                caption: "For decades, scientists tried to uncover protein structures.",
                dialogues: [
                    { speaker: "Scientist #1", text: "We have spent 5 years trying to crystallize this protein!" },
                    { speaker: "Scientist #2", text: "There must be a faster way." }
                ]
            },
            {
                title: "Page 10 — Antibody Guardians",
                caption: "Meanwhile, another team of heroes patrols the body.",
                dialogues: [
                    { speaker: "Antibody Captain", text: "Intruder alert! Spike glycoprotein detected at the cell gate!" }
                ]
            },
            {
                title: "Page 11 — Lock and Key Battle",
                caption: "The antibody perfectly fits the spike protein.",
                dialogues: [
                    { speaker: "Spike Monster", text: "I will invade this cell!" },
                    { speaker: "Antibody Captain", text: "Not today!" }
                ]
            },
            {
                title: "Page 12 — The Arrival of AlphaFold",
                caption: "Then a new hero emerged...",
                dialogues: [
                    { speaker: "AlphaFold", text: "You spent years guessing shapes. I can predict them from sequence." }
                ]
            },
            {
                title: "Page 13 — The Evoformer Engine",
                caption: "Using attention layers called Evoformer blocks...",
                dialogues: [
                    { speaker: "AlphaFold", text: "I analyze patterns hidden in millions of protein sequences." }
                ]
            },
            {
                title: "Page 14 — The Shape Revealed",
                caption: "Millions of previously unknown proteins become visible.",
                dialogues: [
                    { speaker: "Scientists", text: "Incredible!" },
                    { speaker: "AlphaFold", text: "The structure is ready." }
                ]
            }
        ]
    }
];

export class ScienceComics {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.activeChapter = 0;
        this.activePage = 0;

        if (this.container) {
            this.render();
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="page-header">
                <div class="skeleton skeleton-line" style="height:2.5rem; width:50%; margin-bottom:16px;"></div>
                <div class="skeleton skeleton-line-sm" style="height:1.05rem; width:40%;"></div>
            </div>
            <div class="viewer-split-layout">
                <div class="glass-panel text-center" style="display:flex; flex-direction:column; justify-content:center; align-items:center; min-height:380px;">
                    <div class="skeleton" style="width:100%; height:400px; border-radius:12px; margin-bottom:20px;"></div>
                    <div class="skeleton skeleton-line" style="height:1.05rem; width:70%;"></div>
                </div>
                <div style="display:flex; flex-direction:column; justify-content:space-between;">
                    <div class="glass-panel" style="flex-grow:1;">
                        <div class="skeleton skeleton-line" style="height:1.35rem; width:55%; margin-bottom:15px;"></div>
                        <div class="skeleton skeleton-line" style="margin-bottom:4px;"></div>
                        <div class="skeleton skeleton-line" style="margin-bottom:4px;"></div>
                        <div class="skeleton skeleton-line-sm"></div>
                    </div>
                    <div class="glass-panel" style="display:flex; justify-content:space-between; margin-top:20px; padding:20px;">
                        <div class="skeleton" style="width:80px; height:38px; border-radius:12px;"></div>
                        <div class="skeleton" style="width:60px; height:20px; border-radius:4px;"></div>
                        <div class="skeleton" style="width:80px; height:38px; border-radius:12px;"></div>
                    </div>
                </div>
            </div>
        `;
        setTimeout(() => {
            this._renderContent();
            this.loadChapter(0, 0);
            this.bindEvents();
        }, 150);
    }

    _renderContent() {
        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="t-headline-lg">Interactive <span class="t-primary">Comic Stories</span></h1>
                <p class="t-body-md" style="margin-top:var(--space-2);" id="comic-tagline">Select a comic to begin reading.</p>
            </div>

            <div class="viewer-split-layout">
                <div class="glass-panel text-center" style="display:flex; flex-direction:column; justify-content:flex-start; align-items:center; min-height:420px; padding:12px;">
                    <div id="comic-image-container" style="width:100%; max-height:480px; overflow:hidden; border-radius:12px; margin-bottom:12px; background:var(--color-surface); display:flex; align-items:center; justify-content:center;">
                        <img id="comic-page-image" src="" alt="Comic Page" style="width:100%; height:auto; object-fit:contain; border-radius:12px;">
                    </div>
                    <div id="comic-caption" style="font-style:italic; color:var(--color-text-secondary); font-size:1.25rem; max-width:500px; line-height:1.5; padding:0 8px;">
                        Caption
                    </div>
                </div>

                <div style="display:flex; flex-direction:column; justify-content:space-between;">
                    <div class="glass-panel" style="flex-grow:1;">
                        <h3 id="comic-page-title" style="color:var(--color-primary-hover); margin-bottom:12px; font-size:1.35rem;">Page Title</h3>
                        <div id="comic-dialogues" style="color:var(--color-text-secondary); font-size:1.25rem; line-height:1.7;"></div>
                    </div>

                    <div class="glass-panel" style="display:flex; justify-content:space-between; margin-top:20px; padding:20px;">
                        <button class="btn btn-secondary" id="btn-comic-prev">Previous</button>
                        <div style="display:flex; align-items:center; font-size:1rem; color:var(--color-text-muted);" id="comic-page-lbl">Page 1 / 14</div>
                        <button class="btn btn-primary" id="btn-comic-next">Next</button>
                    </div>
                </div>
            </div>

            <div class="glass-panel" style="margin-top:20px; padding:16px; display:flex; gap:10px; flex-wrap:wrap; justify-content:center;">
                ${COMIC_CHAPTERS.map((c, i) => `
                    <button class="btn btn-tertiary comic-chap-btn" data-idx="${i}" style="font-weight:600;">${c.title}</button>
                `).join("")}
            </div>

            <div class="glass-panel" style="margin-top:12px; padding:12px; display:flex; gap:6px; flex-wrap:wrap; justify-content:center;" id="comic-page-btns">
            </div>
        `;
    }

    bindEvents() {
        document.getElementById("btn-comic-prev").addEventListener("click", () => this.navigatePage(-1));
        document.getElementById("btn-comic-next").addEventListener("click", () => this.navigatePage(1));

        this.container.querySelectorAll(".comic-chap-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const idx = parseInt(btn.getAttribute("data-idx"), 10);
                this.loadChapter(idx, 0);
            });
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "ArrowLeft") this.navigatePage(-1);
            if (e.key === "ArrowRight") this.navigatePage(1);
        });
    }

    loadChapter(chapIdx, pageIdx) {
        this.activeChapter = chapIdx;
        this.activePage = pageIdx;

        const chap = COMIC_CHAPTERS[chapIdx];

        this.container.querySelectorAll(".comic-chap-btn").forEach(btn => {
            btn.classList.remove("active");
            if (parseInt(btn.getAttribute("data-idx"), 10) === chapIdx) btn.classList.add("active");
        });

        document.getElementById("comic-tagline").textContent = chap.tagline;

        const pages = chap.pages;
        const btnsContainer = document.getElementById("comic-page-btns");
        btnsContainer.innerHTML = pages.map((p, i) => `
            <button class="btn btn-tertiary comic-page-btn" data-idx="${i}" style="font-size:0.9rem; padding:6px 10px;">${i + 1}</button>
        `).join("");

        btnsContainer.querySelectorAll(".comic-page-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const idx = parseInt(btn.getAttribute("data-idx"), 10);
                this.loadPage(idx);
            });
        });

        this.loadPage(pageIdx);
    }

    loadPage(idx) {
        const chap = COMIC_CHAPTERS[this.activeChapter];
        const pages = chap.pages;

        if (idx < 0 || idx >= pages.length) return;
        this.activePage = idx;

        const page = pages[idx];

        this.container.querySelectorAll(".comic-page-btn").forEach(btn => {
            btn.classList.remove("active");
            if (parseInt(btn.getAttribute("data-idx"), 10) === idx) btn.classList.add("active");
        });

        document.getElementById("comic-page-title").textContent = page.title;
        document.getElementById("comic-caption").textContent = `"${page.caption}"`;
        document.getElementById("comic-page-lbl").textContent = `Page ${idx + 1} / ${pages.length}`;

        const img = document.getElementById("comic-page-image");
        img.src = `${chap.imageBase}page-${idx + 1}.png`;
        img.alt = page.title;
        img.onerror = function() {
            this.style.display = "none";
            document.getElementById("comic-image-container").innerHTML = `
                <div style="padding:60px 20px; color:var(--color-text-muted); font-size:1.05rem; text-align:center;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:48px;height:48px;margin-bottom:12px;">
                        <rect x="2" y="2" width="20" height="20" rx="2" ry="2"/>
                        <path d="M10 8l6 4-6 4V8z"/>
                    </svg>
                    <br>Image not found
                </div>
            `;
        };
        img.onload = function() {
            this.style.display = "";
        };

        const dialoguesHtml = page.dialogues.map(d => `
            <div style="margin-bottom:10px; padding:10px 14px; background:var(--color-surface); border-left:3px solid var(--color-primary-hover); border-radius:0 8px 8px 0;">
                <strong style="color:var(--color-primary-hover); font-size:1rem;">${d.speaker}:</strong>
                <span style="display:block; margin-top:4px; font-size:1.25rem;">"${d.text}"</span>
            </div>
        `).join("");

        document.getElementById("comic-dialogues").innerHTML = dialoguesHtml;
    }

    navigatePage(dir) {
        const chap = COMIC_CHAPTERS[this.activeChapter];
        const next = this.activePage + dir;
        if (next >= 0 && next < chap.pages.length) {
            this.loadPage(next);
        }
    }
}
