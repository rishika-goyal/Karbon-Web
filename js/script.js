// Configuration
const CONFIG = {
    API_BASE_URL: "https://agentic-ai-wine.vercel.app",
    STORAGE_KEYS: {
        HISTORY: "karbon_history",
        THEME: "karbon_theme"
    },
    TYPEWRITER_TEXTS: [
        "Frontend Apps",
        "React Components", 
        "Vue.js Projects",
        "Landing Pages",
        "Dashboards",
        "Mobile Apps",
        "Web Games",
        "Portfolio Sites"
    ],
    ANIMATION_DURATION: 300
};

// State Management
class AppState {
    constructor() {
        this.currentCode = "";
        this.isGenerating = false;
        this.currentTheme = this.loadTheme();
        this.history = this.loadHistory();
    }

    loadTheme() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || "light";
    }

    saveTheme(theme) {
        this.currentTheme = theme;
        localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, theme);
    }

    loadHistory() {
        try {
            return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.HISTORY)) || [];
        } catch {
            return [];
        }
    }

    saveHistory() {
        localStorage.setItem(CONFIG.STORAGE_KEYS.HISTORY, JSON.stringify(this.history));
    }

    addToHistory(prompt, code) {
        const entry = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            prompt: prompt.trim(),
            code,
            date: new Date().toLocaleDateString()
        };
        
        this.history = [entry, ...this.history.slice(0, 9)]; // Keep only 10 items
        this.saveHistory();
    }
}

// Utility Functions
const utils = {
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    },

    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    },

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
};

// Initialize App State
let appState;
let elements = {};

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize app state
    appState = new AppState();
    
    // Get DOM Elements
    elements = {
        // Theme
        themeToggle: document.getElementById('themeToggle'),
        
        // Input
        promptInput: document.getElementById('promptInput'),
        generateBtn: document.getElementById('generateBtn'),
        
        // Suggestions
        suggestionChips: document.querySelectorAll('.chip'),
        
        // Controls
        controlsPanel: document.getElementById('controlsPanel'),
        showCodeToggle: document.getElementById('showCodeToggle'),
        copyCodeBtn: document.getElementById('copyCodeBtn'),
        downloadCodeBtn: document.getElementById('downloadCodeBtn'),
        historySelect: document.getElementById('historySelect'),
        fullscreenBtn: document.getElementById('fullscreenBtn'),
        
        // Preview
        previewContainer: document.getElementById('previewContainer'),
        previewFrame: document.getElementById('previewFrame'),
        loadingOverlay: document.getElementById('loadingOverlay'),
        tabButtons: document.querySelectorAll('.tab-btn'),
        refreshBtn: document.getElementById('refreshBtn'),
        shareBtn: document.getElementById('shareBtn'),
        
        // Error
        errorContainer: document.getElementById('errorContainer'),
        errorMessage: document.getElementById('errorMessage'),
        
        // Notifications
        notificationContainer: document.getElementById('notificationContainer'),
        
        // Typewriter
        typewriter: document.getElementById('typewriter')
    };

    // Initialize all components
    initializeApp();
});

// Notification System
class NotificationManager {
    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <i class="fas fa-${this.getIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        elements.notificationContainer.appendChild(notification);

        // Show animation
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Auto remove
        setTimeout(() => {
            this.remove(notification);
        }, duration);

        return notification;
    }

    remove(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, CONFIG.ANIMATION_DURATION);
    }

    getIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-triangle',
            warning: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Typewriter Effect
class TypewriterEffect {
    constructor(element, texts, speed = 100) {
        this.element = element;
        this.texts = texts;
        this.speed = speed;
        this.textIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.start();
    }

    start() {
        this.type();
    }

    type() {
        const currentText = this.texts[this.textIndex];
        
        if (this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.charIndex - 1);
            this.charIndex--;
        } else {
            this.element.textContent = currentText.substring(0, this.charIndex + 1);
            this.charIndex++;
        }

        let typeSpeed = this.speed;

        if (this.isDeleting) {
            typeSpeed /= 2;
        }

        if (!this.isDeleting && this.charIndex === currentText.length) {
            typeSpeed = 2000; // Pause at end
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.textIndex = (this.textIndex + 1) % this.texts.length;
            typeSpeed = 500; // Pause before next word
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

// Error Handling
class ErrorHandler {
    show(message) {
        elements.errorMessage.textContent = message;
        elements.errorContainer.classList.add('show');
        
        setTimeout(() => {
            this.hide();
        }, 5000);
    }

    hide() {
        elements.errorContainer.classList.remove('show');
    }
}

// Theme Management
class ThemeManager {
    constructor() {
        this.init();
    }

    init() {
        this.setTheme(appState.currentTheme);
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (elements.themeToggle) {
            elements.themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggle();
            });
        }
    }

    toggle() {
        const newTheme = appState.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        appState.saveTheme(newTheme);
        
        if (typeof notifications !== 'undefined') {
            notifications.show(`Switched to ${newTheme} theme`, 'success', 2000);
        }
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
        appState.currentTheme = theme;
        this.updateToggleIcon();
    }

    updateToggleIcon() {
        if (!elements.themeToggle) return;
        
        const sunIcon = elements.themeToggle.querySelector('.fa-sun');
        const moonIcon = elements.themeToggle.querySelector('.fa-moon');
        
        if (sunIcon && moonIcon) {
            if (appState.currentTheme === 'dark') {
                sunIcon.style.opacity = '0';
                moonIcon.style.opacity = '1';
                elements.themeToggle.style.background = '#334155';
            } else {
                sunIcon.style.opacity = '1';
                moonIcon.style.opacity = '0';
                elements.themeToggle.style.background = '#f1f5f9';
            }
        }
    }
}

// History Management
class HistoryManager {
    constructor() {
        this.updateDropdown();
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (elements.historySelect) {
            elements.historySelect.addEventListener('change', (e) => {
                const id = e.target.value;
                if (id) {
                    this.loadItem(id);
                }
            });
        }

        if (elements.showCodeToggle) {
            elements.showCodeToggle.addEventListener('change', () => {
                this.updatePreview();
            });
        }
    }

    updateDropdown() {
        if (!elements.historySelect) return;
        
        elements.historySelect.innerHTML = '<option value="">⏳ History</option>';
        
        appState.history.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = `${utils.truncateText(item.prompt, 40)} - ${item.date}`;
            elements.historySelect.appendChild(option);
        });
    }

    loadItem(id) {
        const item = appState.history.find(h => h.id === id);
        if (item) {
            elements.promptInput.value = item.prompt;
            appState.currentCode = item.code;
            this.updateUI();
            if (typeof notifications !== 'undefined') {
                notifications.show('Loaded from history', 'success', 2000);
            }
        }
    }

    updateUI() {
        if (elements.copyCodeBtn) elements.copyCodeBtn.disabled = !appState.currentCode;
        if (elements.downloadCodeBtn) elements.downloadCodeBtn.disabled = !appState.currentCode;
        
        if (appState.currentCode) {
            elements.controlsPanel?.classList.add('show');
            elements.previewContainer?.classList.add('show');
            this.updatePreview();
        }
    }

    updatePreview() {
        if (!appState.currentCode || !elements.previewFrame) return;

        const isDark = appState.currentTheme === 'dark';

        if (elements.showCodeToggle?.checked) {
            this.showCode();
        } else {
            this.showPreview(isDark);
        }
    }

    showCode() {
        const escaped = appState.currentCode
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        const isDark = appState.currentTheme === 'dark';

        elements.previewFrame.srcdoc = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Code View</title>
                <style>
                    body {
                        font-family: 'Fira Code', 'Consolas', monospace;
                        margin: 0;
                        padding: 2rem;
                        background: ${isDark ? '#0f172a' : '#f8fafc'};
                        color: ${isDark ? '#e2e8f0' : '#334155'};
                        line-height: 1.6;
                        font-size: 14px;
                    }
                    .code-container {
                        background: ${isDark ? '#1e293b' : '#ffffff'};
                        border: 1px solid ${isDark ? '#334155' : '#e2e8f0'};
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
                    }
                    .code-header {
                        background: ${isDark ? '#334155' : '#f1f5f9'};
                        padding: 1rem 1.5rem;
                        border-bottom: 1px solid ${isDark ? '#475569' : '#e2e8f0'};
                        font-weight: 600;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    }
                    .code-content {
                        padding: 1.5rem;
                        overflow-x: auto;
                        max-height: 70vh;
                    }
                    pre {
                        margin: 0;
                        white-space: pre-wrap;
                        word-wrap: break-word;
                    }
                </style>
            </head>
            <body>
                <div class="code-container">
                    <div class="code-header">
                        <span style="color: #10b981;">●</span>
                        <span style="color: #f59e0b;">●</span>
                        <span style="color: #ef4444;">●</span>
                        <span style="margin-left: 1rem;">Generated Code</span>
                    </div>
                    <div class="code-content">
                        <pre><code>${escaped}</code></pre>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    showPreview(isDark) {
        const baseStyles = isDark ? 
            `<style>body { background: #0f172a; color: #e2e8f0; }</style>` : '';
        
        elements.previewFrame.srcdoc = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                ${baseStyles}
            </head>
            <body>
                ${appState.currentCode}
            </body>
            </html>
        `;
    }
}

// Code Generation
class CodeGenerator {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (elements.generateBtn) {
            elements.generateBtn.addEventListener('click', () => {
                const prompt = elements.promptInput?.value.trim();
                if (prompt) {
                    this.generate(prompt);
                } else {
                    if (typeof errorHandler !== 'undefined') {
                        errorHandler.show('Please enter a description for your app');
                    }
                }
            });
        }

        if (elements.promptInput) {
            elements.promptInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const prompt = e.target.value.trim();
                    if (prompt) {
                        this.generate(prompt);
                    }
                }
            });
        }
    }

    async generate(prompt) {
        if (appState.isGenerating) return;
        
        appState.isGenerating = true;
        this.updateGenerateButton(true);
        this.showLoading(true);
        if (typeof errorHandler !== 'undefined') {
            errorHandler.hide();
        }

        try {
            const response = await fetch(
                `${CONFIG.API_BASE_URL}/generate?q=${encodeURIComponent(prompt)}`
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get("content-type") || "";
            if (!contentType.includes("application/json")) {
                throw new Error("Invalid response format");
            }

            const data = await response.json();
            
            if (!data.code) {
                throw new Error("No code returned from server");
            }

            appState.currentCode = data.code;
            appState.addToHistory(prompt, data.code);
            
            this.updateUI();
            if (typeof historyManager !== 'undefined') {
                historyManager.updateDropdown();
            }
            
            if (typeof notifications !== 'undefined') {
                notifications.show('App generated successfully!', 'success');
            }

        } catch (error) {
            console.error('Generation error:', error);
            this.handleError(error);
        } finally {
            appState.isGenerating = false;
            this.updateGenerateButton(false);
            this.showLoading(false);
        }
    }

    updateGenerateButton(loading) {
        if (!elements.generateBtn) return;
        
        elements.generateBtn.classList.toggle('loading', loading);
        elements.generateBtn.disabled = loading;
    }

    showLoading(show) {
        if (elements.loadingOverlay) {
            elements.loadingOverlay.classList.toggle('show', show);
        }
        
        if (show) {
            elements.controlsPanel?.classList.add('show');
            elements.previewContainer?.classList.add('show');
        }
    }

    updateUI() {
        if (elements.copyCodeBtn) elements.copyCodeBtn.disabled = false;
        if (elements.downloadCodeBtn) elements.downloadCodeBtn.disabled = false;
        if (typeof historyManager !== 'undefined') {
            historyManager.updatePreview();
        }
    }

    handleError(error) {
        let message = "Something went wrong. Please try again.";
        
        if (error.message.includes('HTTP')) {
            message = "Server error. Please try again later.";
        } else if (error.message.includes('network')) {
            message = "Network error. Check your connection.";
        }
        
        if (typeof errorHandler !== 'undefined') {
            errorHandler.show(`❌ ${message}`);
        }
        if (typeof notifications !== 'undefined') {
            notifications.show(message, 'error');
        }
    }
}

// Copy to Clipboard
class ClipboardManager {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (elements.copyCodeBtn) {
            elements.copyCodeBtn.addEventListener('click', () => {
                if (appState.currentCode) {
                    this.copy(appState.currentCode);
                }
            });
        }
    }

    async copy(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.updateCopyButton();
            if (typeof notifications !== 'undefined') {
                notifications.show('Code copied to clipboard!', 'success', 2000);
            }
        } catch (error) {
            console.error('Copy failed:', error);
            if (typeof notifications !== 'undefined') {
                notifications.show('Failed to copy code', 'error');
            }
        }
    }

    updateCopyButton() {
        if (!elements.copyCodeBtn) return;
        
        const span = elements.copyCodeBtn.querySelector('span');
        const icon = elements.copyCodeBtn.querySelector('i');
        
        if (span && icon) {
            const originalText = span.textContent;
            span.textContent = 'Copied!';
            icon.className = 'fas fa-check';
            
            setTimeout(() => {
                span.textContent = originalText;
                icon.className = 'fas fa-copy';
            }, 2000);
        }
    }
}

// File Download
class DownloadManager {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (elements.downloadCodeBtn) {
            elements.downloadCodeBtn.addEventListener('click', () => {
                if (appState.currentCode) {
                    this.download(appState.currentCode);
                }
            });
        }
    }

    download(content, filename = 'karbon-generated.html') {
        try {
            const blob = new Blob([content], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            if (typeof notifications !== 'undefined') {
                notifications.show('File downloaded successfully!', 'success', 2000);
            }
        } catch (error) {
            console.error('Download failed:', error);
            if (typeof notifications !== 'undefined') {
                notifications.show('Failed to download file', 'error');
            }
        }
    }
}

// Button Ripple Effect
class RippleEffect {
    static add(button, event) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('btn-ripple');
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
}

// Suggestion Chips Handler
function setupSuggestionChips() {
    elements.suggestionChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const prompt = chip.getAttribute('data-prompt');
            if (prompt && elements.promptInput) {
                elements.promptInput.value = prompt;
                elements.promptInput.focus();
            }
        });
    });
}

// Add ripple effect to buttons
function setupRippleEffects() {
    const buttons = document.querySelectorAll('.generate-btn, .control-btn, .chip');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            RippleEffect.add(this, e);
        });
    });
}

// Main initialization function
function initializeApp() {
    try {
        // Initialize managers
        const notifications = new NotificationManager();
        const errorHandler = new ErrorHandler();
        const themeManager = new ThemeManager();
        const historyManager = new HistoryManager();
        const codeGenerator = new CodeGenerator();
        const clipboardManager = new ClipboardManager();
        const downloadManager = new DownloadManager();

        // Setup additional features
        setupSuggestionChips();
        setupRippleEffects();

        // Initialize typewriter effect
        if (elements.typewriter) {
            new TypewriterEffect(elements.typewriter, CONFIG.TYPEWRITER_TEXTS, 150);
        }

        // Make managers globally available
        window.notifications = notifications;
        window.errorHandler = errorHandler;
        window.themeManager = themeManager;
        window.historyManager = historyManager;
        window.codeGenerator = codeGenerator;

        console.log('Karbon AI initialized successfully!');

    } catch (error) {
        console.error('Initialization error:', error);
    }
}

// Tab functionality
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.getAttribute('data-tab');
            
            // Update active tab
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update toggle based on tab
            if (elements.showCodeToggle) {
                elements.showCodeToggle.checked = (tab === 'code');
                // Trigger change event
                elements.showCodeToggle.dispatchEvent(new Event('change'));
            }
        });
    });
});