import { api } from "../services/api.js";

export class AIMentor {
    constructor() {
        this.userId = "default_user";
        this.isOpen = false;
        this.history = [];
        this.context = {
            level: 0,
            protein: "Hemoglobin",
            view: "Museum"
        };
        this.dom = {};
        this.dragging = false;
        this.wasDragged = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        
        this.initDOM();
        this.bindEvents();
        this.initPosition();
        
        this.addMessage("mentor", "Welcome to **AlphaCure**! I'm **N1LUX**, your digital learning guide. Select a hall in the virtual museum or jump into the structured RPG learning pathway to begin!");
    }
    
    initPosition() {
        const w = this.dom.widget;
        w.style.bottom = "100px";
        w.style.right = "30px";
    }
    
    initDOM() {
        const container = document.createElement("div");
        container.className = "mentor-widget";
        container.id = "n1lux-mentor";
        
        container.innerHTML = `
            <div class="mentor-chat-window" id="mentor-chat">
                <div class="mentor-chat-header">
                    <div>
                        <div class="mentor-chat-title">N1LUX AI</div>
                        <div class="mentor-chat-subtitle">Science Companion • Online</div>
                    </div>
                    <button class="mentor-chat-close" id="mentor-close">×</button>
                </div>
                <div class="mentor-chat-messages" id="mentor-msgs"></div>
                <div class="mentor-chat-input-area">
                    <input type="text" class="mentor-text-input" id="mentor-input" placeholder="Ask N1LUX a science question..." />
                    <button class="mentor-send-btn" id="mentor-send">➔</button>
                </div>
            </div>

            <button id="mentor-trigger" class="mentor-btn">
                <span class="gradient-text" style="font-size:1.1rem; font-weight:800; letter-spacing:1px;">N1LUX AI</span>
            </button>
        `;
        
        document.body.appendChild(container);
        
        this.dom.widget = container;
        this.dom.chatWindow = document.getElementById("mentor-chat");
        this.dom.trigger = document.getElementById("mentor-trigger");
        this.dom.closeBtn = document.getElementById("mentor-close");
        this.dom.msgs = document.getElementById("mentor-msgs");
        this.dom.input = document.getElementById("mentor-input");
        this.dom.sendBtn = document.getElementById("mentor-send");
    }
    
    bindEvents() {
        this.dom.trigger.addEventListener("click", () => this.toggleChat());
        this.dom.closeBtn.addEventListener("click", () => this.toggleChat(false));
        
        this.dom.sendBtn.addEventListener("click", () => this.handleSendMessage());
        this.dom.input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") this.handleSendMessage();
        });
        
        this.dom.trigger.addEventListener("mousedown", (e) => this.startDrag(e));
        document.addEventListener("mousemove", (e) => this.onDrag(e));
        document.addEventListener("mouseup", () => this.stopDrag());
        
        this.dom.trigger.addEventListener("touchstart", (e) => this.startDrag(e), { passive: false });
        document.addEventListener("touchmove", (e) => this.onDrag(e), { passive: false });
        document.addEventListener("touchend", () => this.stopDrag());
    }
    
    startDrag(e) {
        if (e.target.closest("#mentor-chat")) return;
        e.preventDefault();
        const pos = e.type.startsWith("touch") ? e.touches[0] : e;
        const rect = this.dom.widget.getBoundingClientRect();
        
        this.dom.widget.style.bottom = "auto";
        this.dom.widget.style.right = "auto";
        this.dom.widget.style.left = rect.left + "px";
        this.dom.widget.style.top = rect.top + "px";
        
        this.dragStartX = pos.clientX;
        this.dragStartY = pos.clientY;
        this.dragOffsetX = pos.clientX - rect.left;
        this.dragOffsetY = pos.clientY - rect.top;
        this.dragging = true;
        this.wasDragged = false;
        this.dom.widget.classList.add("dragging");
    }
    
    onDrag(e) {
        if (!this.dragging) return;
        e.preventDefault();
        const pos = e.type.startsWith("touch") ? e.touches[0] : e;
        const dx = Math.abs(pos.clientX - this.dragStartX);
        const dy = Math.abs(pos.clientY - this.dragStartY);
        if (dx > 5 || dy > 5) this.wasDragged = true;
        const x = pos.clientX - this.dragOffsetX;
        const y = pos.clientY - this.dragOffsetY;
        this.dom.widget.style.left = Math.max(0, x) + "px";
        this.dom.widget.style.top = Math.max(0, y) + "px";
    }
    
    stopDrag() {
        if (!this.dragging) return;
        this.dragging = false;
        this.dom.widget.classList.remove("dragging");
    }
    
    toggleChat(forceState) {
        if (this.wasDragged) { this.wasDragged = false; return; }
        this.isOpen = forceState !== undefined ? forceState : !this.isOpen;
        if (this.isOpen) {
            this.dom.chatWindow.style.display = "flex";
            this.dom.input.focus();
        } else {
            this.dom.chatWindow.style.display = "none";
        }
    }
    
    updateContext(newContext) {
        this.context = { ...this.context, ...newContext };
        
        if (newContext.triggerAlert) {
            this.addMessage("mentor", newContext.triggerAlert);
        }
    }
    
    addMessage(role, text) {
        const bubble = document.createElement("div");
        bubble.className = `chat-bubble ${role}`;
        
        // Support standard markdown formatting easily
        let formattedText = text
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>")
            .replace(/`(.*?)`/g, "<code>$1</code>");
            
        bubble.innerHTML = formattedText;
        this.dom.msgs.appendChild(bubble);
        this.dom.msgs.scrollTop = this.dom.msgs.scrollHeight;
        
        this.history.push({ role, content: text });
    }
    
    async handleSendMessage() {
        const text = this.dom.input.value.trim();
        if (!text) return;
        
        this.dom.input.value = "";
        this.addMessage("user", text);
        
        try {
            const reply = await api.chat(this.userId, text, this.context, this.history);
            this.addMessage("mentor", reply);
        } catch (error) {
            this.addMessage("mentor", "Sorry, my neural connection is a bit unstable right now. But keep exploring! Ask me again shortly.");
        }
    }
}
