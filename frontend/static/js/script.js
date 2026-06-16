// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Data
const sequence = "MVHLTPEEKSAVTALWGKVNVDEVGGEALGRLLVVYPWTQRFFESFGDLSTPDAVMGNPKVKAHGKKVLGAFSDGLAHLDNLKGTFATLSELHCDKLHVDPENFRLLGNVLVCVLAHHFGKEFTPPVQAAYQKVVAGVANALAHKYH";

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Hero Animations
    gsap.to(".hero-title", { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.2 });
    gsap.to(".hero-subtitle", { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.4 });
    gsap.to(".cta-btn", { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.6 });
    gsap.to(".scroll-indicator", { opacity: 1, duration: 1, delay: 1.5 });

    // 2. Sequence Typing Animation
    const seqContainer = document.getElementById("protein-sequence");
    
    // Wrap each letter in a span for individual animation
    sequence.split('').forEach(char => {
        const span = document.createElement('span');
        span.textContent = char;
        seqContainer.appendChild(span);
    });

    gsap.to("#protein-sequence span", {
        scrollTrigger: {
            trigger: ".sequence-section",
            start: "top center",
            end: "bottom center",
            toggleActions: "play none none reverse"
        },
        opacity: 1,
        stagger: 0.02,
        duration: 0.1
    });

    // 3. AI Processing Animation
    const tlProcessing = gsap.timeline({
        scrollTrigger: {
            trigger: ".processing",
            start: "top 70%",
            end: "bottom center",
            toggleActions: "play none none reverse"
        }
    });

    tlProcessing.to(".progress-bar", { width: "100%", duration: 4, ease: "power1.inOut" }, 0);
    
    const logs = document.querySelectorAll(".processing-logs p");
    logs.forEach((log, i) => {
        tlProcessing.to(log, { opacity: 1, duration: 0.2 }, i * 0.8);
    });

    // 4. 3D Structure Initialization (3Dmol.js)
    let glviewer = null;
    let isViewerInitialized = false;

    ScrollTrigger.create({
        trigger: ".structure-section",
        start: "top 60%",
        onEnter: () => {
            if (!isViewerInitialized) {
                init3Dmol();
                isViewerInitialized = true;
            }
        }
    });

    function init3Dmol() {
        if (typeof $3Dmol === "undefined" || typeof modelCifData === "undefined") {
            console.error("3Dmol or model data not loaded.");
            return;
        }

        let element = document.getElementById('viewer-3d');
        let config = { backgroundColor: '#000000' };
        glviewer = $3Dmol.createViewer(element, config);

        // Load the CIF data from the generated model_data.js
        glviewer.addModel(modelCifData, "cif");
        
        // Default style: Cartoon (showing helices and sheets)
        glviewer.setStyle({}, { cartoon: { color: 'spectrum' } });
        
        glviewer.zoomTo();
        glviewer.render();

        // Optional auto-rotation
        // glviewer.spin("y", 0.5); // Spin around Y axis
        
        // Custom continuous spin via requestAnimationFrame for smoother control
        let isSpinning = true;
        function spin() {
            if(isSpinning) {
                glviewer.rotate(0.5, "y");
            }
            requestAnimationFrame(spin);
        }
        spin();

        // Pause spin on hover
        element.addEventListener('mouseenter', () => isSpinning = false);
        element.addEventListener('mouseleave', () => isSpinning = true);
    }

    // 5. Structure Breakdown Controls
    const styleDescriptions = {
        'cartoon': '<strong>Cartoon Model:</strong> Shows the secondary structures like alpha-helices (coils) and beta-sheets (arrows). It gives the best overview of the protein\'s overall fold.',
        'sphere': '<strong>Spacefill (Atoms):</strong> Represents every single atom as a solid sphere, showing the true volume the protein takes up in space.',
        'stick': '<strong>Bonds & Sticks:</strong> Highlights the chemical bonds between atoms, useful for seeing detailed interactions at the atomic level.',
        'surface': '<strong>Molecular Surface:</strong> Shows the outermost boundary of the protein where other molecules, drugs, or water would interact.'
    };

    const descElement = document.getElementById("style-desc");
    const buttons = document.querySelectorAll(".view-btn");

    buttons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            // Update active button state
            buttons.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");

            // Get style type
            const styleType = e.target.getAttribute("data-style");
            
            // Update description
            descElement.innerHTML = styleDescriptions[styleType];

            // Change 3Dmol style
            if (glviewer) {
                glviewer.removeAllSurfaces();
                
                let styleObj = {};
                if (styleType === 'cartoon') {
                    styleObj = { cartoon: { color: 'spectrum' } };
                } else if (styleType === 'sphere') {
                    styleObj = { sphere: { scale: 0.5 } }; // slightly scaled down to see depth better
                } else if (styleType === 'stick') {
                    styleObj = { stick: { radius: 0.15 } };
                } else if (styleType === 'surface') {
                    // Surface requires a different call
                    glviewer.setStyle({}, { cartoon: { color: 'white', opacity: 0.3 } });
                    glviewer.addSurface($3Dmol.SurfaceType.VDW, {
                        opacity: 0.85,
                        color: 'cyan'
                    });
                    glviewer.render();
                    return; // Skip normal setStyle for surface
                }

                glviewer.setStyle({}, styleObj);
                glviewer.render();
            }
        });
    });

    // 6. Impact Cards Animation
    gsap.from(".card", {
        scrollTrigger: {
            trigger: ".impact",
            start: "top 70%",
        },
        y: 50,
        opacity: 0,
        stagger: 0.2,
        duration: 0.8,
        ease: "power2.out"
    });

    // 7. New Sections Animations
    const fadeSections = [".problem-section", ".solution-section", ".future-section", ".team-section", ".thank-you-section"];
    fadeSections.forEach(sec => {
        gsap.from(sec, {
            scrollTrigger: {
                trigger: sec,
                start: "top 80%",
            },
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power2.out"
        });
    });

    gsap.from(".tool-card", {
        scrollTrigger: {
            trigger: ".tools-section",
            start: "top 70%",
        },
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out"
    });

});
