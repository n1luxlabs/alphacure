import { api } from "../services/api.js";

export class FuxStepper {
    constructor(userProfile, onCompleteCallback) {
        this.profile = userProfile;
        this.onComplete = onCompleteCallback;
        this.currentStep = 1;
        this.formData = {
            name: "",
            username: "",
            class_name: "Class 10",
            school: "",
            country: ""
        };
        this.assessmentAnswers = {
            q1: "",
            q2: "",
            q3: ""
        };
        
        if (this.profile && (this.profile.name === "Curious Visitor" || !this.profile.username || this.profile.username === "curious_visitor")) {
            this.initDOM();
            this.showStep(1);
            this.bindEvents();
        }
    }
    
    initDOM() {
        const overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.id = "fux-wizard-overlay";
        overlay.style.display = "flex";
        
        overlay.innerHTML = `
            <div class="modal-content" style="max-width: 600px; padding: 40px;" id="fux-content">
                <div style="display:flex; justify-content:space-between; margin-bottom:25px; font-size:0.95rem; color:#54ACBF; font-weight:700;">
                    <span>PORTAL ONBOARDING</span>
                    <span id="fux-step-indicator">Step 1 of 5</span>
                </div>
                
                <!-- Step 1: Welcome -->
                <div class="fux-step" id="fux-step-1">
                        <h2 class="gradient-text" style="font-size:2.6rem; margin-bottom:15px;">Welcome to AlphaCure</h2>
                    <p style="margin-bottom:25px; font-size:1.25rem; color:#90b8c9; line-height:1.7;">
                        Enter a molecular universe. This platform is designed to teach you cells, DNA, proteins, folding, mutations, and AI Drug Discovery in a gamified RPG pathway.
                    </p>
                    <div style="text-align:right;">
                        <button class="btn-primary fux-next" data-next="2">Begin Onboarding</button>
                    </div>
                </div>
                
                <!-- Step 2: Create Profile -->
                <div class="fux-step" id="fux-step-2" style="display:none;">
                    <h2 class="gradient-text" style="font-size:2.2rem; margin-bottom:15px;">Create Your Profile</h2>
                    <p style="font-size:1.1rem; color:#90b8c9; margin-bottom:20px;">Provide details to customize your learning journey:</p>
                    
                    <div style="display:flex; flex-direction:column; gap:15px; margin-bottom:25px;">
                        <div class="slider-group" style="margin-bottom:0;">
                            <div class="slider-label"><span>Full Name:</span></div>
                            <input type="text" id="fux-name" class="mentor-text-input" placeholder="Jane Doe" style="width:100%;" required />
                        </div>
                        <div class="slider-group" style="margin-bottom:0;">
                            <div class="slider-label"><span>Username:</span></div>
                            <input type="text" id="fux-username" class="mentor-text-input" placeholder="jane_doe12" style="width:100%;" required />
                        </div>
                        <div class="slider-group" style="margin-bottom:0;">
                            <div class="slider-label"><span>Class / Grade:</span></div>
                            <select id="fux-class" class="mentor-text-input" style="width:100%; background: #022f4d; color: #fff;">
                                <option value="Class 9">Class 9 (Junior High)</option>
                                <option value="Class 10" selected>Class 10 (High School)</option>
                                <option value="Class 11">Class 11 (Senior High)</option>
                                <option value="Class 12">Class 12 (Advanced Level)</option>
                            </select>
                        </div>
                        <div class="slider-group" style="margin-bottom:0;">
                            <div class="slider-label"><span>School (Optional):</span></div>
                            <input type="text" id="fux-school" class="mentor-text-input" placeholder="Dumka High School" style="width:100%;" />
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <button class="btn-primary" id="fux-submit-profile">Next: Meet Companion</button>
                    </div>
                </div>
                
                <!-- Step 3: AI Intro -->
                <div class="fux-step" id="fux-step-3" style="display:none;">
                    <div style="display:flex; align-items:center; gap:25px; margin-bottom:20px;">
                        <div style="font-size:4rem; width:90px; height:90px; border-radius:50%; background:radial-gradient(circle, #A7EBF2, #26658C); display:flex; justify-content:center; align-items:center; box-shadow: 0 0 20px rgba(167,235,242,0.3);">🤖</div>
                        <div>
                            <h2 class="gradient-text" style="font-size:2.2rem;">Meet N1LUX AI</h2>
                            <p style="font-size:1.05rem; color:#54ACBF; margin-bottom:0;">Your Personal Science Companion</p>
                        </div>
                    </div>
                    <p style="color:#90b8c9; font-size:1.2rem; line-height:1.7; margin-bottom:25px;">
                        Hello! I am <strong>N1LUX</strong>. I will float on the side of your dashboard. As you navigate labs, explore proteins, or work in the retro workstation, I will offer context tips, explain quiz errors, and guide your curriculum choices.
                    </p>
                    <div style="text-align:right;">
                        <button class="btn-primary fux-next" data-next="4">Take Placement Test</button>
                    </div>
                </div>
                
                <!-- Step 4: Skill Assessment -->
                <div class="fux-step" id="fux-step-4" style="display:none;">
                    <h2 class="gradient-text" style="font-size:2rem; margin-bottom:15px;">Biology Placement Test</h2>
                    <p style="font-size:1.1rem; color:#90b8c9; margin-bottom:20px;">Answer these 3 quick checkpoints to calculate your starting XP bonus:</p>
                    
                    <div style="display:flex; flex-direction:column; gap:20px; text-align:left; margin-bottom:25px;">
                        <div>
                            <p style="margin-bottom:8px; font-weight:600; color:#e8f4f8; font-size:1.15rem;">Q1: In what sequence direction is DNA read and synthesized?</p>
                            <div style="display:flex; gap:10px;">
                                <button class="btn-style ass-q1-btn" style="flex:1; padding:10px;" data-val="5to3">5' to 3'</button>
                                <button class="btn-style ass-q1-btn" style="flex:1; padding:10px;" data-val="3to5">3' to 5'</button>
                                <button class="btn-style ass-q1-btn" style="flex:1; padding:10px;" data-val="left">Left to Right</button>
                            </div>
                        </div>
                        <div>
                            <p style="margin-bottom:8px; font-weight:600; color:#e8f4f8; font-size:1.15rem;">Q2: Which cellular organelle functions as the translation factory?</p>
                            <div style="display:flex; gap:10px;">
                                <button class="btn-style ass-q2-btn" style="flex:1; padding:10px;" data-val="nucleus">Nucleus</button>
                                <button class="btn-style ass-q2-btn" style="flex:1; padding:10px;" data-val="ribosome">Ribosome</button>
                                <button class="btn-style ass-q2-btn" style="flex:1; padding:10px;" data-val="mitochondria">Mitochondria</button>
                            </div>
                        </div>
                        <div>
                            <p style="margin-bottom:8px; font-weight:600; color:#e8f4f8; font-size:1.15rem;">Q3: What chemical effect drives non-polar side chains inside a fold?</p>
                            <div style="display:flex; gap:10px;">
                                <button class="btn-style ass-q3-btn" style="flex:1; padding:8px;" data-val="hydrophobic">Hydrophobic collapse</button>
                                <button class="btn-style ass-q3-btn" style="flex:1; padding:8px;" data-val="magnetic">Magnetic alignment</button>
                                <button class="btn-style ass-q3-btn" style="flex:1; padding:8px;" data-val="covalent">Disulfide locking</button>
                            </div>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <button class="btn-primary" id="fux-submit-assessment">Complete Placement</button>
                    </div>
                </div>
                
                <!-- Step 5: Dashboard Unlock -->
                <div class="fux-step" id="fux-step-5" style="display:none;">
                    <div style="text-align:center; padding:15px;">
                        <span style="font-size:5rem; animation: float 3s infinite;">🔓</span>
                        <h2 class="gradient-text" style="font-size:2.4rem; margin-top:15px; margin-bottom:10px;">Dashboard Unlocked!</h2>
                        <p style="color:#e8f4f8; margin-bottom:15px; font-size:1.2rem;" id="fux-xp-bonus-lbl">You unlocked 300 XP</p>
                        <p style="color:#90b8c9; font-size:1.1rem; max-width:400px; margin:0 auto 25px;">
                            We adjusted your learning roadmap paths. Ready to begin? Load the factory simulator or head straight to Level 1!
                        </p>
                            <button class="btn-primary" id="btn-fux-finish" style="width:100%;">Enter AlphaCure</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        this.dom = {
            overlay,
            indicator: document.getElementById("fux-step-indicator"),
            nameInput: document.getElementById("fux-name"),
            usernameInput: document.getElementById("fux-username"),
            classSelect: document.getElementById("fux-class"),
            schoolInput: document.getElementById("fux-school"),
            bonusLabel: document.getElementById("fux-xp-bonus-lbl")
        };
    }
    
    showStep(stepNum) {
        this.currentStep = stepNum;
        this.dom.indicator.textContent = `Step ${stepNum} of 5`;
        
        document.querySelectorAll(".fux-step").forEach(step => {
            step.style.display = "none";
        });
        document.getElementById(`fux-step-${stepNum}`).style.display = "block";
    }
    
    bindEvents() {
        // Navigation buttons
        this.dom.overlay.querySelectorAll(".fux-next").forEach(btn => {
            btn.addEventListener("click", () => {
                const nextVal = parseInt(btn.getAttribute("data-next"), 10);
                this.showStep(nextVal);
            });
        });
        
        // Step 2 profile validation & save
        document.getElementById("fux-submit-profile").addEventListener("click", () => {
            const name = this.dom.nameInput.value.trim();
            const username = this.dom.usernameInput.value.trim();
            if (!name || !username) {
                alert("Please fill in both Name and Username!");
                return;
            }
            this.formData.name = name;
            this.formData.username = username;
            this.formData.class_name = this.dom.classSelect.value;
            this.formData.school = this.dom.schoolInput.value.trim();
            
            this.showStep(3);
        });
        
        // Step 4 assessment button selections
        const bindAssessBtns = (btnClass, ansKey) => {
            const btns = this.dom.overlay.querySelectorAll(btnClass);
            btns.forEach(btn => {
                btn.addEventListener("click", () => {
                    btns.forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                    this.assessmentAnswers[ansKey] = btn.getAttribute("data-val");
                });
            });
        };
        bindAssessBtns(".ass-q1-btn", "q1");
        bindAssessBtns(".ass-q2-btn", "q2");
        bindAssessBtns(".ass-q3-btn", "q3");
        
        // Complete placement test
        document.getElementById("fux-submit-assessment").addEventListener("click", () => {
            if (!this.assessmentAnswers.q1 || !this.assessmentAnswers.q2 || !this.assessmentAnswers.q3) {
                alert("Please select answers for all 3 questions!");
                return;
            }
            
            // Calculate XP score
            let scoreXp = 0;
            if (this.assessmentAnswers.q1 === "5to3") scoreXp += 100;
            if (this.assessmentAnswers.q2 === "ribosome") scoreXp += 100;
            if (this.assessmentAnswers.q3 === "hydrophobic") scoreXp += 100;
            
            this.formData.xp = scoreXp;
            this.dom.bonusLabel.innerHTML = `Onboarding assessment complete. You earned: <strong style="color:#A7EBF2;">${scoreXp} XP</strong> starting bonus!`;
            
            this.showStep(5);
        });
        
        // Final completion & save
        document.getElementById("btn-fux-finish").addEventListener("click", async () => {
            this.dom.overlay.style.opacity = "0.5";
            try {
                // Submit details to database
                const updatedProfile = await api.updateProfile("default_user", {
                    name: this.formData.name,
                    username: this.formData.username,
                    class_name: this.formData.class_name,
                    school: this.formData.school,
                    xp: this.formData.xp
                });
                
                this.dom.overlay.remove();
                if (this.onComplete) {
                    this.onComplete(updatedProfile);
                }
            } catch (e) {
                console.error("FUX Profile save failed, continuing locally:", e);
                this.dom.overlay.remove();
                if (this.onComplete) {
                    this.onComplete({
                        name: this.formData.name,
                        username: this.formData.username,
                        class_name: this.formData.class_name,
                        school: this.formData.school,
                        xp: this.formData.xp,
                        current_level: Math.floor(this.formData.xp / 500) + 1,
                        achievements: ["Protein Beginner"]
                    });
                }
            }
        });
    }
}
