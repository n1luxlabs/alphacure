import { initParticles } from "./utils/particles.js";
import { api } from "./services/api.js";
import { AIMentor } from "./components/mentor.js";
import { FuxStepper } from "./components/fux_stepper.js";
import { ScienceMuseum } from "./pages/museum.js";
import { RpgPath } from "./pages/rpg_path.js";
import { ReverseLab } from "./pages/reverse_lab.js";
import { MutationPlayground } from "./pages/mutation_playground.js";
import { BodyMap } from "./pages/body_map.js";
import { DrugLab } from "./pages/drug_lab.js";
import { CareerCenter } from "./pages/career_center.js";

// V3.1 New Imports
import { ProteinCollection } from "./pages/collection.js";
import { ProteinFactory } from "./pages/factory_sim.js";
import { DiseaseDetective } from "./pages/disease_detective.js";
import { ProteinWorld } from "./pages/protein_world.js";
import { Leaderboard } from "./pages/leaderboard.js";
import { ScienceComics } from "./pages/comics.js";
import { ScienceNews } from "./pages/news_hub.js";

document.addEventListener("DOMContentLoaded", async () => {
    // Global loader controls
    window.showLoader = () => {
        const g = document.getElementById("global-loader");
        if (g) g.style.display = "flex";
    };
    window.hideLoader = () => {
        const g = document.getElementById("global-loader");
        if (g) g.style.display = "none";
    };
    // 1. Initialize Background Molecular Particles
    const cleanupParticles = initParticles("particles-bg");
    
    // 2. Initialize Floating N1LUX AI Mentor
    const mentor = new AIMentor();
    
    // 3. Setup global helper methods
    window.openModal = (title, bodyHtml) => {
        const modal = document.getElementById("global-modal");
        const titleEl = document.getElementById("modal-title");
        const bodyEl = document.getElementById("modal-body-content");
        
        titleEl.textContent = title;
        bodyEl.innerHTML = bodyHtml;
        modal.style.display = "flex";
    };
    
    // Close modal bindings
    const modalCloseTrigger = document.getElementById("modal-close-trigger");
    const globalModal = document.getElementById("global-modal");
    
    modalCloseTrigger.addEventListener("click", () => {
        globalModal.style.display = "none";
    });
    
    globalModal.addEventListener("click", (e) => {
        if (e.target === globalModal) {
            globalModal.style.display = "none";
        }
    });
    
    // Helper to pass alerts to N1LUX mascot
    const triggerMascotAlert = (text) => {
        mentor.updateContext({ triggerAlert: text });
    };
    
    // 4. Initialize Pages (Pass callbacks)
    const navigateToPage = (pageId) => {
        switchPage(pageId);
    };
    
    const defaultCif = typeof modelCifData !== "undefined" ? modelCifData : null;
    
    // Instantiate Page components
    const museum = new ScienceMuseum("page-museum", window.openModal, navigateToPage);
    const reverseLab = new ReverseLab("page-reverse-lab", defaultCif);
    const mutationPlayground = new MutationPlayground("page-playground", defaultCif, triggerMascotAlert);
    const bodyMap = new BodyMap("page-body-map", defaultCif);
    const drugLab = new DrugLab("page-drug-lab", triggerMascotAlert);
    let careerCenter = new CareerCenter("page-career", triggerMascotAlert);
    
    // V3.1 Instantiations
    const collection = new ProteinCollection("page-collection", triggerMascotAlert);
    const factorySim = new ProteinFactory("page-factory-sim", triggerMascotAlert);
    const diseaseDetective = new DiseaseDetective("page-disease-detective", triggerMascotAlert);
    const proteinWorld = new ProteinWorld("page-protein-world", defaultCif);
    const leaderboard = new Leaderboard("page-leaderboard");
    const comics = new ScienceComics("page-comics");
    const newsHub = new ScienceNews("page-news-hub");
    const rpgPath = new RpgPath("page-journey", window.openModal, updateSidebarProfile, triggerMascotAlert);
    
    // Load profile and run onboarding wizard if new
    let userProfile = { name: "Curious Visitor", current_level: 1, xp: 0 };
    try {
        const profile = await api.getProfile("default_user");
        if (profile) {
            userProfile = profile;
        }
    } catch (e) {
        console.error("Failed fetching starting user profile:", e);
    }
    
    // Launch Setup Stepper if name is default Curious Visitor or username missing
    const fuxStepper = new FuxStepper(userProfile, (updatedProfile) => {
        userProfile = updatedProfile;
        rpgPath.userProfile = updatedProfile;
        updateSidebarProfile(updatedProfile);
        switchPage("museum");
        triggerMascotAlert(`Awesome, **${updatedProfile.name}**! Your profile is set up. Let's begin checking the galleries!`);
    });
    
    // 5. SPA Routing Control
    const navItems = document.querySelectorAll(".nav-item");
    const validPagesList = ["museum", "journey", "factory-sim", "reverse-lab", "playground", "disease-detective", "body-map", "collection", "protein-world", "drug-lab", "comics", "leaderboard", "news-hub", "career", "nilay", "about", "all-tools"];

    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();

            const targetPage = item.getAttribute("data-page");
            const targetPath = targetPage === "journey" ? "journey" : targetPage;

            // Show loader for visual feedback on navigation
            try { window.showLoader(); } catch (e) {}

            if (window.location.pathname !== `/${targetPath}`) {
                window.history.pushState(null, "", `/${targetPath}`);
            }
            switchPage(targetPage);

            // Hide loader shortly after switch
            setTimeout(() => { try { window.hideLoader(); } catch (e) {} }, 500);
        });
    });
    
    function switchPage(pageId) {
        if (pageId === "dashboard") pageId = "museum";
        
        // Toggle page visibility
        const pages = document.querySelectorAll(".page-view");
        pages.forEach(p => p.classList.remove("active"));
        
        const targetView = document.getElementById(`page-${pageId}`);
        if (targetView) {
            targetView.classList.add("active");
        }
        
        // Update navigation sidebar state active button class
        navItems.forEach(nav => {
            nav.classList.remove("active");
            if (nav.getAttribute("data-page") === pageId) {
                nav.classList.add("active");
            }
        });
        
        // Dynamic reloads for custom pages
        if (pageId === "career") {
            careerCenter.loadProfile();
        } else if (pageId === "collection") {
            collection.loadProfile();
        } else if (pageId === "leaderboard") {
            leaderboard.loadLeaderboard();
        } else if (pageId === "nilay") {
            renderNilayPage();
        } else if (pageId === "about") {
            renderAboutPage();
        } else if (pageId === "all-tools") {
            renderAllToolsPage();
        }
        
        // Resize 3D viewers after page becomes visible
        setTimeout(() => {
            const viewers = [
                pageId === "reverse-lab" && reverseLab.viewer,
                pageId === "playground" && mutationPlayground.viewer,
                pageId === "body-map" && bodyMap.viewer,
                pageId === "drug-lab" && drugLab.viewer,
                pageId === "factory-sim" && factorySim.viewer,
                pageId === "disease-detective" && diseaseDetective.viewer,
                pageId === "protein-world" && proteinWorld.viewer
            ];
            viewers.forEach(v => { if (v) v.handleResize(); });
        }, 100);
        
        // Fetch or resolve current protein label for AI context
        let currentProtein = "Hemoglobin";
        if (pageId === "playground") {
            currentProtein = mutationPlayground.activeKey;
        } else if (pageId === "body-map") {
            currentProtein = document.getElementById("body-protein-title")?.textContent || "Hemoglobin";
        } else if (pageId === "drug-lab") {
            currentProtein = drugLab.activeTargetKey;
        } else if (pageId === "protein-world") {
            currentProtein = proteinWorld.activeKey;
        }
        
        // Update mentor context
        mentor.updateContext({
            view: pageId,
            level: rpgPath.userProfile.current_level,
            protein: currentProtein
        });
    }
    
    // 7. Sidebar profile update binding
    function updateSidebarProfile(newProfile) {
        const usernameEl = document.getElementById("sb-username");
        const levelTextEl = document.getElementById("sb-level-text");
        const xpTextEl = document.getElementById("sb-xp-text");
        const xpFillEl = document.getElementById("sb-xp-fill");
        
        // Fetch latest profile values
        const profile = newProfile || rpgPath.userProfile || {};
        const username = profile.name || "Curious Visitor";
        const level = profile.current_level || 1;
        const totalXp = profile.xp || 0;
        
        usernameEl.textContent = username;
        levelTextEl.textContent = `Level ${level}`;
        xpTextEl.textContent = `${totalXp} XP`;
        
        // Streak indicator visual append if streak > 1
        if (profile.daily_streak > 1) {
            usernameEl.innerHTML = `${username} <span style="font-size:0.8rem; color:#ef4444;" title="Daily Streak">🔥 ${profile.daily_streak}</span>`;
        }
        
        // Progress fill calculates matching current level progress (max 10)
        const fillPercent = Math.min(100, (level / 10) * 100);
        xpFillEl.style.width = `${fillPercent}%`;
    }
    
    // Parse URL path to load initial page
    const initialPath = window.location.pathname.substring(1) || "museum";
    const mappedInitialPage = initialPath === "dashboard" ? "museum" : initialPath;
    
    if (validPagesList.includes(mappedInitialPage)) {
        switchPage(mappedInitialPage);
    } else {
        switchPage("museum");
    }
    
    // Bind browser back/forward buttons
    window.addEventListener("popstate", () => {
        const currentPath = window.location.pathname.substring(1) || "museum";
        const mappedPage = currentPath === "dashboard" ? "museum" : currentPath;
        if (validPagesList.includes(mappedPage)) {
            try { window.showLoader(); } catch (e) {}
            switchPage(mappedPage);
            setTimeout(() => { try { window.hideLoader(); } catch (e) {} }, 400);
        }
    });

    // Nilay page renderer
    function renderNilayPage() {
        const container = document.getElementById("page-nilay");
        if (!container) return;
        const p = userProfile || {};
        const name = p.name || "NILAY SINGH";
        const level = p.current_level || 1;
        const xp = p.xp || 0;
        const streak = p.daily_streak || 0;
        container.innerHTML = `
            <div class="page-header" style="text-align:center; padding:60px 0;">
                <span style="font-size:5rem; display:block; margin-bottom:20px;">🔥</span>
                <h1 class="t-headline-lg">${name.split(" ")[0] || "NILAY"} <span class="t-primary">${name.split(" ").slice(1).join(" ") || "SINGH"}</span></h1>
                <p class="t-body-md" style="margin-top:var(--space-2);">Level ${level} Explorer • AlphaCure Prodigy</p>
                <div style="margin-top:30px; display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div class="stat-tile stat-sm" style="min-width:120px;">
                        <div class="stat-eyebrow">Level</div>
                        <div class="stat-value" style="font-size:1.5rem;">${level}</div>
                    </div>
                    <div class="stat-tile stat-sm" style="min-width:120px;">
                        <div class="stat-eyebrow">XP</div>
                        <div class="stat-value" style="font-size:1.5rem;">${xp}</div>
                    </div>
                    <div class="stat-tile stat-sm" style="min-width:120px;">
                        <div class="stat-eyebrow">Streak</div>
                        <div class="stat-value" style="font-size:1.5rem;">${streak > 0 ? `🔥${streak}` : '0'}</div>
                    </div>
                </div>
                <div style="margin-top:30px;">
                    <button class="btn btn-primary btn-lg" id="profile-career-btn" style="padding:14px 32px; font-size:1.1rem;">
                        ⭐ Career & Achievements
                    </button>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            const careerBtn = document.getElementById("profile-career-btn");
            if (careerBtn) {
                careerBtn.addEventListener("click", () => {
                    window.history.pushState(null, "", "/career");
                    switchPage("career");
                });
            }
        }, 50);
    }

    // All Tools page renderer
    function renderAllToolsPage() {
        const container = document.getElementById("page-all-tools");
        if (!container) return;
        const tools = [
            { page: "museum", icon: "🏛️", name: "Science Museum", desc: "Explore the world of proteins through interactive exhibits." },
            { page: "factory-sim", icon: "🏭", name: "Factory Simulator", desc: "Build and manage your own protein factory." },
            { page: "reverse-lab", icon: "🔬", name: "Reverse Lab", desc: "Analyze protein structures in 3D." },
            { page: "playground", icon: "🧪", name: "Mutation Playground", desc: "Experiment with protein mutations." },
            { page: "disease-detective", icon: "🔍", name: "Disease Detective", desc: "Solve biomedical mysteries." },
            { page: "body-map", icon: "🧍", name: "Human Protein Map", desc: "Explore proteins in the human body." },
            { page: "collection", icon: "🖼️", name: "Protein Album", desc: "Collect and catalog protein cards." },
            { page: "protein-world", icon: "🌍", name: "Protein World", desc: "Discover protein taxonomy across life." },
            { page: "drug-lab", icon: "💊", name: "Drug Discovery Lab", desc: "Design drugs to target diseases." },
            { page: "comics", icon: "📚", name: "Science Comics", desc: "Learn through illustrated science stories." },
            { page: "leaderboard", icon: "🏆", name: "Leaderboards", desc: "Compete with fellow explorers." },
            { page: "news-hub", icon: "📰", name: "Science News", desc: "Stay updated with latest discoveries." },
            { page: "journey", icon: "🧬", name: "RPG Pathway", desc: "Level up your molecular biology knowledge." },
            { page: "nilay", icon: "👤", name: "My Profile", desc: "View your stats and achievements." },
            { page: "about", icon: "ℹ️", name: "About", desc: "Learn more about ProteinVerse." }
        ];
        container.innerHTML = `
            <div class="page-header">
                <h1 class="t-headline-lg">All <span class="t-primary">Tools</span></h1>
            </div>
            <div class="all-tools-grid">
                ${tools.map(t => `
                    <a href="#${t.page}" class="tool-card" data-page="${t.page}">
                        <span class="tool-card-icon">${t.icon}</span>
                        <span class="tool-card-name">${t.name}</span>
                        <span class="tool-card-desc">${t.desc}</span>
                    </a>
                `).join("")}
            </div>
        `;
        container.querySelectorAll(".tool-card").forEach(card => {
            card.addEventListener("click", (e) => {
                e.preventDefault();
                const page = card.getAttribute("data-page");
                const targetPath = page === "journey" ? "journey" : page;
                if (window.location.pathname !== `/${targetPath}`) {
                    window.history.pushState(null, "", `/${targetPath}`);
                }
                switchPage(page);
            });
        });
    }

    // About ProteinVerse page renderer
    function renderAboutPage() {
        const container = document.getElementById("page-about");
        if (!container) return;
        container.innerHTML = `
            <div class="page-header">
                <h1 class="t-headline-lg">About <span class="t-primary">ProteinVerse</span></h1>
            </div>
            
            <div class="glass-panel">
                <h2 class="t-headline-md" style="margin-bottom:var(--space-4);">Welcome to ProteinVerse</h2>
                <p class="t-body-md">ProteinVerse is an interactive educational platform designed to help students explore the fascinating world of proteins, molecular biology, artificial intelligence, and structural biology.</p>
                <p class="t-body-md">This project demonstrates how modern Artificial Intelligence can solve scientific challenges that once required years of research. By using advanced AI systems such as AlphaFold, protein structures can now be predicted in minutes instead of years.</p>
                <p class="t-body-md">Our goal is to make complex scientific concepts easy, visual, interactive, and enjoyable for students of all levels.</p>
            </div>
            
            <div class="glass-panel">
                <h2 class="t-headline-md" style="margin-bottom:var(--space-4);">School Information</h2>
                <p class="t-body-md"><strong>+2 Raghunathpur High School</strong><br>Dumka – 814148<br>Jharkhand, India</p>
                <p class="t-body-md">This project was created as an educational science initiative to demonstrate the role of Artificial Intelligence in modern biological research and protein structure prediction.</p>
            </div>
            
            <div class="glass-panel">
                <h2 class="t-headline-md" style="margin-bottom:var(--space-4);">Project Vision</h2>
                <p class="t-body-md">AlphaCure aims to bridge the gap between biology and artificial intelligence by transforming difficult scientific concepts into interactive learning experiences.</p>
                <p class="t-body-md">Students can explore:</p>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-2); margin-top:var(--space-3);">
                    ${["Proteins and Amino Acids", "DNA and RNA", "Protein Folding", "AlphaFold Technology", "Disease Mechanisms", "Drug Discovery", "Bioinformatics", "Future AI Applications in Biology"].map(s => `<span style="color:var(--color-text-secondary);">✦ ${s}</span>`).join("")}
                </div>
            </div>
            
            <div class="glass-panel">
                <h2 class="t-headline-md" style="margin-bottom:var(--space-4);">Tools & Technologies Used</h2>
                <h3 class="t-title-md" style="margin-bottom:var(--space-2); color:var(--color-text-secondary);">Artificial Intelligence</h3>
                <div style="display:flex; flex-wrap:wrap; gap:var(--space-2); margin-bottom:var(--space-5);">
                    ${["Artificial Intelligence", "ChatGPT", "Gemini", "AlphaFold", "NotebookLM", "Gamma AI", "nano banana", "wisk ai", "claude"].map(t => `<span class="chip">${t}</span>`).join("")}
                </div>
                <h3 class="t-title-md" style="margin-bottom:var(--space-2); color:var(--color-text-secondary);">Development & Infrastructure</h3>
                <div style="display:flex; flex-wrap:wrap; gap:var(--space-2); margin-bottom:var(--space-5);">
                    ${["GitHub", "Hostinger", "Modern Web Technologies"].map(t => `<span class="chip">${t}</span>`).join("")}
                </div>
                <h3 class="t-title-md" style="margin-bottom:var(--space-2); color:var(--color-text-secondary);">Scientific Resources</h3>
                <div style="display:flex; flex-wrap:wrap; gap:var(--space-2);">
                    ${["UniProt", "AlphaFold Database", "Protein Data Bank (PDB)", "EMBL-EBI Resources", "alphafold database"].map(t => `<span class="chip">${t}</span>`).join("")}
                </div>
            </div>
            
            <div class="glass-panel">
                <h2 class="t-headline-md" style="margin-bottom:var(--space-4);">Project Team</h2>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:var(--space-4);">
                    ${[
                        {name: "Nilay Singh", role: "Website Developer"},
                        {name: "Beauty Mandal", role: "Team Leader"},
                        {name: "Kanchan Kumari", role: "Team Member"},
                        {name: "Shrinandi", role: "Team Member"},
                        {name: "Soumi Pal", role: "Team Member"},
                        {name: "Shekh Soyel", role: "Team Member"},
                        {name: "Subhoshree", role: "Team Member"}
                    ].map(m => `
                        <div class="stat-tile stat-sm" style="text-align:center;">
                            <div class="stat-eyebrow">${m.role}</div>
                            <div class="t-title-md" style="margin-top:var(--space-1);">${m.name}</div>
                        </div>
                    `).join("")}
                </div>
            </div>
            
            <div class="glass-panel">
                <h2 class="t-headline-md" style="margin-bottom:var(--space-4);">Acknowledgements</h2>
                <p class="t-body-md">We express our gratitude to the scientific community, educational institutions, AI researchers, and open scientific databases that have made advanced biological knowledge accessible to students worldwide.</p>
            </div>
            
            <div class="glass-panel">
                <h2 class="t-headline-md" style="margin-bottom:var(--space-4);">Contact</h2>
                <p class="t-body-md"><strong>Developer:</strong> Nilay Singh</p>
                <p class="t-body-md"><strong>Email:</strong> nilaysinghofficial@hotmail.com</p>
                <p class="t-body-md"><strong>GitHub:</strong> @n1luxlabs</p>
                <p class="t-body-md"><strong>Instagram:</strong> @n1lux.os</p>
                <p class="t-body-md"><strong>Telegram:</strong> @n1luxlabs</p>
            </div>
            
            <div class="glass-panel" style="text-align:center; border-color:var(--color-primary);">
                <h2 class="t-headline-md" style="margin-bottom:var(--space-3);">Thank You</h2>
                <p class="t-body-md" style="font-style:italic; font-size:1.3rem; color:var(--color-primary-hover);">"The Future of Biology is Computed."</p>
                <p class="t-body-md">From amino acid sequences to life-saving discoveries, Artificial Intelligence is transforming the future of science, medicine, and research.</p>
                <p class="t-body-md">Thank you for exploring ProteinVerse.</p>
            </div>
        `;
    }

    // Sync starting profile details inside sidebar summary
    setTimeout(() => {
        updateSidebarProfile(userProfile);
    }, 500);
});
