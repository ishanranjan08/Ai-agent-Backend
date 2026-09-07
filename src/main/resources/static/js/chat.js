/**
 * Ishan's AI - Classic Chat UI Controller
 * Features: Dark/Light Mode, Asynchronous /chat Integration, Classic Typography & Formatting
 */
document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-btn');
    const clearButton = document.getElementById('clear-btn');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    const themeLabel = document.getElementById('theme-label');

    let isWaitingForResponse = false;

    // --- Theme Management (Dark / Light) ---
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'light') {
            setTheme('light');
        } else if (savedTheme === 'dark' || systemPrefersDark) {
            setTheme('dark');
        } else {
            // Default to dark classic
            setTheme('dark');
        }
    }

    function setTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            if (sunIcon) sunIcon.classList.remove('hidden');
            if (moonIcon) moonIcon.classList.add('hidden');
            if (themeLabel) themeLabel.textContent = 'Light Mode';
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            if (sunIcon) sunIcon.classList.add('hidden');
            if (moonIcon) moonIcon.classList.remove('hidden');
            if (themeLabel) themeLabel.textContent = 'Dark Mode';
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isDark = document.documentElement.classList.contains('dark');
            setTheme(isDark ? 'light' : 'dark');
        });
    }

    initTheme();

    // Auto-focus input on load
    if (messageInput) {
        messageInput.focus();
    }

    // Auto-resize textarea height
    function autoResizeTextarea() {
        if (!messageInput) return;
        messageInput.style.height = 'auto';
        const newHeight = Math.min(messageInput.scrollHeight, 180);
        messageInput.style.height = (newHeight > 48 ? newHeight : 48) + 'px';
    }

    if (messageInput) {
        messageInput.addEventListener('input', autoResizeTextarea);
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitChat();
            }
        });
    }

    if (sendButton) {
        sendButton.addEventListener('click', (e) => {
            e.preventDefault();
            submitChat();
        });
    }

    if (clearButton) {
        clearButton.addEventListener('click', () => {
            if (confirm('Clear the current conversation?')) {
                resetChat();
            }
        });
    }

    /**
     * Submit chat message to /chat API
     */
    async function submitChat() {
        if (isWaitingForResponse || !messageInput) return;

        const text = messageInput.value.trim();
        if (!text) return;

        // Reset input field
        messageInput.value = '';
        autoResizeTextarea();

        const timeStr = getCurrentTime();

        // 1. Render User Message
        appendMessage('user', text, timeStr);

        // 2. Show Typing Indicator
        setLoadingState(true);
        showTypingIndicator();
        scrollToBottom();

        try {
            // Send POST request to /chat
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json, text/plain'
                },
                body: JSON.stringify({ message: text })
            });

            removeTypingIndicator();

            if (!response.ok) {
                const errorText = await response.text();
                appendMessage('assistant', `⚠️ Server returned status ${response.status}: ${errorText || 'Unable to process request.'}`, getCurrentTime(), true);
                return;
            }

            const contentType = response.headers.get('content-type') || '';
            let replyText = '';

            if (contentType.includes('application/json')) {
                const data = await response.json();
                replyText = data.response || JSON.stringify(data);
            } else {
                replyText = await response.text();
            }

            // Append Assistant response
            appendMessage('assistant', replyText, getCurrentTime());

        } catch (error) {
            console.error('Chat error:', error);
            removeTypingIndicator();
            appendMessage('assistant', `❌ Connection error: Could not reach the /chat service. Please ensure the backend is running. (${error.message})`, getCurrentTime(), true);
        } finally {
            setLoadingState(false);
            if (messageInput) {
                messageInput.focus();
            }
            scrollToBottom();
        }
    }

    /**
     * Format time string (e.g. 01:45 PM)
     */
    function getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    /**
     * Set loading UI state
     */
    function setLoadingState(loading) {
        isWaitingForResponse = loading;
        if (sendButton) {
            sendButton.disabled = loading;
            if (loading) {
                sendButton.innerHTML = `
                    <svg class="animate-spin h-4 w-4 text-slate-900 dark:text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span class="text-xs font-semibold uppercase tracking-wider font-cinzel">Thinking</span>
                `;
                sendButton.classList.add('opacity-70', 'cursor-not-allowed');
            } else {
                sendButton.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transform rotate-45 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span class="text-xs font-semibold uppercase tracking-wider font-cinzel">Send</span>
                `;
                sendButton.classList.remove('opacity-70', 'cursor-not-allowed');
            }
        }
    }

    /**
     * Append a message bubble to the chat container
     */
    function appendMessage(role, content, timestamp, isError = false) {
        if (!chatContainer) return;

        const messageEl = document.createElement('div');
        messageEl.className = 'message-animate flex w-full my-5 ' + (role === 'user' ? 'justify-end' : 'justify-start');

        if (role === 'user') {
            messageEl.innerHTML = `
                <div class="flex items-start gap-3 max-w-[85%] sm:max-w-[75%] flex-row-reverse">
                    <!-- User Avatar Monogram -->
                    <div class="flex-shrink-0 w-9 h-9 rounded-full bg-[#1e293b] dark:bg-amber-600 border border-[#334155] dark:border-amber-400/40 flex items-center justify-center text-white text-xs font-cinzel font-bold shadow-md">
                        Ishan
                    </div>
                    <!-- User Bubble -->
                    <div class="flex flex-col items-end">
                        <div class="bg-[#1e293b] dark:bg-blue-600 text-white px-5 py-3.5 rounded-2xl rounded-tr-xs shadow-md border border-[#334155] dark:border-blue-500/30 text-sm leading-relaxed whitespace-pre-wrap font-sans break-words">
                            ${escapeHtml(content)}
                        </div>
                        <span class="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-mono tracking-wider">${timestamp}</span>
                    </div>
                </div>
            `;
        } else {
            const formattedContent = renderFormattedMarkdown(content);
            const rawEscaped = encodeURIComponent(content);

            messageEl.innerHTML = `
                <div class="flex items-start gap-3.5 max-w-[92%] sm:max-w-[85%]">
                    <!-- Classic Seal Avatar -->
                    <div class="flex-shrink-0 w-9 h-9 rounded-full bg-[#f4f0e6] dark:bg-[#111722] border border-[#d6cec0] dark:border-amber-500/40 flex items-center justify-center text-amber-800 dark:text-amber-400 font-cinzel font-bold text-xs shadow-md relative">
                        IA
                        <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#0b0e14] rounded-full"></span>
                    </div>
                    <!-- Assistant Memo Card -->
                    <div class="flex flex-col items-start w-full">
                        <div class="group relative w-full bg-white dark:bg-[#131d31] ${isError ? 'border-red-400 dark:border-red-500/40 bg-red-50/50 dark:bg-red-950/20' : 'border-[#e2dcd2] dark:border-slate-800'} border text-slate-800 dark:text-slate-100 px-5 py-4 rounded-2xl rounded-tl-xs shadow-sm dark:shadow-xl text-sm leading-relaxed">
                            <div class="flex items-center justify-between border-b border-[#eee8dc] dark:border-slate-800/80 pb-2 mb-2.5">
                                <span class="font-cinzel text-xs font-semibold text-amber-800 dark:text-amber-400 tracking-wider flex items-center gap-1.5">
                                    <span class="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400"></span> Ishan's AI
                                </span>
                                <button onclick="copyText(this, '${rawEscaped}')" class="opacity-75 hover:opacity-100 text-slate-500 dark:text-slate-400 hover:text-amber-800 dark:hover:text-amber-300 text-xs flex items-center gap-1 transition-colors px-2 py-0.5 rounded bg-[#f5f1e8] dark:bg-slate-800/70 hover:bg-[#ede6d8] dark:hover:bg-slate-800 border border-[#e2dcd2] dark:border-slate-700/60">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                    </svg>
                                    <span class="copy-label font-mono">Copy</span>
                                </button>
                            </div>
                            <div class="prose-content text-slate-800 dark:text-slate-200 font-serif leading-relaxed break-words space-y-2 text-[14.5px]">
                                ${formattedContent}
                            </div>
                        </div>
                        <span class="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-mono tracking-wider ml-1">${timestamp}</span>
                    </div>
                </div>
            `;
        }

        chatContainer.appendChild(messageEl);
        scrollToBottom();
    }

    /**
     * Show animated typing indicator with "Ishan's AI is thinking..."
     */
    function showTypingIndicator() {
        if (!chatContainer) return;
        const typingEl = document.createElement('div');
        typingEl.id = 'typing-indicator-node';
        typingEl.className = 'message-animate flex items-start gap-3.5 my-5 justify-start';
        typingEl.innerHTML = `
            <div class="w-9 h-9 rounded-full bg-[#f4f0e6] dark:bg-[#111722] border border-[#d6cec0] dark:border-amber-500/30 flex items-center justify-center text-amber-800 dark:text-amber-400 font-cinzel font-bold text-xs shadow-md">
                IA
            </div>
            <div class="bg-white dark:bg-[#131d31] border border-[#e2dcd2] dark:border-slate-800 px-4 py-3.5 rounded-2xl rounded-tl-xs shadow-sm flex items-center gap-2">
                <span class="text-xs text-slate-600 dark:text-slate-300 font-serif italic mr-1">Ishan's AI is thinking</span>
                <div class="flex items-center space-x-1.5">
                    <span class="typing-dot w-2 h-2 rounded-full bg-amber-700 dark:bg-amber-400"></span>
                    <span class="typing-dot w-2 h-2 rounded-full bg-amber-700 dark:bg-amber-400"></span>
                    <span class="typing-dot w-2 h-2 rounded-full bg-amber-700 dark:bg-amber-400"></span>
                </div>
            </div>
        `;
        chatContainer.appendChild(typingEl);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const typingEl = document.getElementById('typing-indicator-node');
        if (typingEl) {
            typingEl.remove();
        }
    }

    function scrollToBottom() {
        if (chatContainer) {
            chatContainer.scrollTo({
                top: chatContainer.scrollHeight,
                behavior: 'smooth'
            });
        }
    }

    function resetChat() {
        if (!chatContainer) return;
        chatContainer.innerHTML = `
            <!-- Classic Welcome Dispatch -->
            <div class="message-animate bg-white dark:bg-[#111928] border border-[#ded7ca] dark:border-amber-500/20 rounded-2xl p-7 mb-6 shadow-sm dark:shadow-2xl relative overflow-hidden">
                <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-xl bg-[#f5efe3] dark:bg-amber-500/10 border border-[#d8cebe] dark:border-amber-500/30 flex items-center justify-center text-amber-800 dark:text-amber-400 flex-shrink-0 shadow-sm font-cinzel font-bold text-lg">
                        IA
                    </div>
                    <div class="space-y-1.5">
                        <div class="flex items-center gap-2.5">
                            <h2 class="font-cinzel text-lg sm:text-xl font-bold text-slate-900 dark:text-amber-200 tracking-wide">Ishan's AI Console</h2>
                            <span class="text-[10px] uppercase font-mono px-2 py-0.5 bg-[#f0ebd9] dark:bg-emerald-500/10 text-amber-900 dark:text-emerald-400 border border-[#ded5be] dark:border-emerald-500/30 rounded-full font-semibold">Active</span>
                        </div>
                        <p class="text-sm text-slate-600 dark:text-slate-300 font-serif leading-relaxed">
                            Welcome to Ishan's AI Console. I am your personal intelligent assistant equipped to manage orders, check forecasts, search accommodations, and answer your inquiries via the backend <code class="font-mono text-xs text-amber-800 dark:text-amber-300 bg-[#f4eee2] dark:bg-slate-800 px-1.5 py-0.5 rounded border border-[#e2d9c8] dark:border-slate-700">/chat</code> service.
                        </p>
                    </div>
                </div>
            </div>
        `;
        scrollToBottom();
    }

    /**
     * Copy text helper
     */
    window.copyText = function (btn, encodedText) {
        const text = decodeURIComponent(encodedText);
        navigator.clipboard.writeText(text).then(() => {
            const label = btn.querySelector('.copy-label');
            if (label) {
                const originalText = label.innerText;
                label.innerText = 'Copied!';
                btn.classList.add('text-emerald-600', 'dark:text-emerald-400');
                setTimeout(() => {
                    label.innerText = originalText;
                    btn.classList.remove('text-emerald-600', 'dark:text-emerald-400');
                }, 1800);
            }
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    };

    /**
     * Helper to safely escape HTML
     */
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Simple Markdown-like formatter for agent replies
     */
    function renderFormattedMarkdown(text) {
        if (!text) return '';
        let escaped = escapeHtml(text);

        // Code blocks: ```code```
        escaped = escaped.replace(/```([\s\S]*?)```/g, (match, p1) => {
            return `<pre class="bg-[#242b38] dark:bg-[#070b12] p-3.5 rounded-lg border border-[#3b465a] dark:border-slate-800 text-amber-200 font-mono text-xs overflow-x-auto my-2.5"><code>${p1.trim()}</code></pre>`;
        });

        // Inline code: `code`
        escaped = escaped.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-[#f0ebd9] dark:bg-slate-900 border border-[#dfd6c0] dark:border-slate-700/60 rounded text-amber-900 dark:text-amber-300 font-mono text-xs">$1</code>');

        // Bold: **text**
        escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900 dark:text-white">$1</strong>');

        // Bullet points: lines starting with * or -
        const lines = escaped.split('\n');
        let inList = false;
        let outputLines = [];

        for (let line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                if (!inList) {
                    outputLines.push('<ul class="list-disc list-inside space-y-1.5 my-1.5 text-slate-700 dark:text-slate-200">');
                    inList = true;
                }
                outputLines.push(`<li>${trimmed.substring(2)}</li>`);
            } else {
                if (inList) {
                    outputLines.push('</ul>');
                    inList = false;
                }
                if (trimmed.length > 0) {
                    outputLines.push(`<p class="my-1 leading-relaxed">${line}</p>`);
                } else {
                    outputLines.push('<div class="h-2"></div>');
                }
            }
        }
        if (inList) {
            outputLines.push('</ul>');
        }

        return outputLines.join('');
    }
});
