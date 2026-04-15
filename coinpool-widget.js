window.addEventListener('load', function() {
    requestIdleCallback(function() {
        import("https://cdn.jsdelivr.net/npm/flowise-embed/dist/web.js").then(function(m) {
            m.default.init({
                chatflowid: "c1eb657a-899d-46bb-8667-dcda36bbffdf",
                apiHost: "https://coinpool-support.bacoor.io",
                theme: {
                    button: { backgroundColor: "#00FFAD", right: 25, bottom: 40, size: 65, iconColor: "#1B1E25", customIconSrc: "https://support.coinpool.app/wp-content/uploads/2026/04/Support-Headphone-Icon.svg" },
                    chatWindow: {
                        welcomeMessage: "Hi! I'm Naomi-chan, your CoinPool support assistant. How can I help?",
                        starterPrompts: ["\uD83C\uDDFA\uD83C\uDDF8 English", "\uD83C\uDDEF\uD83C\uDDF5 \u65E5\u672C\u8A9E"],
                        starterPromptFontSize: 16,
                        backgroundColor: "#31343a", textColor: "#ffffff",
                        showTitle: true, title: "CoinPool Support",
                        titleColor: "#1B1E25", titleBackgroundColor: "#00FFAD",
                        botMessage: { backgroundColor: "#484a50", textColor: "#ffffff", showAvatar: true, avatarSrc: "https://support.coinpool.app/wp-content/uploads/2026/04/Naomi-CoinPool-Support-Team.webp" },
                        userMessage: { backgroundColor: "#76787c", textColor: "#ffffff", showAvatar: false },
                        textInput: { placeholder: "Type your question...", backgroundColor: "#484a50", textColor: "#ffffff", sendButtonColor: "#00FFAD", borderColor: "transparent" },
                        dateTimeToggle: { date: true, time: true },
                        footer: { textColor: "#9095a0", text: "Powered by CoinPool AI", company: "", companyLink: "" }
                    }
                }
            });

            var attempts = 0;
            var init = setInterval(function() {
                var host = document.querySelector('flowise-chatbot');
                if (!host || !host.shadowRoot) { if (++attempts > 30) clearInterval(init); return; }
                var btn = host.shadowRoot.querySelector('button.fixed.shadow-md.rounded-full');
                if (!btn) { if (++attempts > 30) clearInterval(init); return; }
                clearInterval(init);
                btn.style.animation = 'wave-pulse 2s infinite';
                injectStyles(host);
                startPolling(host);
            }, 500);

            function injectStyles(host) {
                var s = document.createElement('style');
                s.textContent = `
                @keyframes wave-pulse{0%{box-shadow:0 0 0 0 rgba(0,255,173,0.6)}50%{box-shadow:0 0 0 14px rgba(0,255,173,0)}100%{box-shadow:0 0 0 0 rgba(0,255,173,0)}}
                .bubble-typing{background-color:#31343a!important;border:none!important;box-shadow:none!important}
                .bubble1,.bubble2,.bubble3{background-color:#5f6166!important;opacity:1!important}
                .chatbot-input{box-shadow:none!important;border:none!important}
                img[src*="Naomi"],.w-8.h-8.rounded-full{width:52px!important;height:52px!important;min-width:52px!important;min-height:52px!important}
                .host-container figure{margin-right:10px!important}
                .cp-name{font-size:16px!important;font-weight:600;color:#00FFAD;margin:0 0 3px 8px;display:block}
                .cp-time{font-size:10px;color:#9095a0;margin:4px 0 0 8px;display:block}
                .cp-user-time{font-size:10px;color:#9095a0;margin-top:4px;text-align:right;display:block;width:100%}
                .guest-container{flex-direction:column!important;align-items:flex-end!important}
                .w-full.flex.flex-row.flex-wrap.px-5{flex-direction:column!important;align-items:center!important;justify-content:center!important;position:absolute!important;top:50%!important;left:50%!important;transform:translate(-50%,-50%)!important;gap:16px!important;padding:20px!important;width:100%!important}
                .w-full.flex.flex-row.flex-wrap.px-5 .host-container{width:75%!important;justify-content:center!important}
                .w-full.flex.flex-row.flex-wrap.px-5 .chatbot-host-bubble{background-color:transparent!important;border:1.5px solid #00FFAD!important;color:#00FFAD!important;border-radius:8px!important;padding:14px 0!important;font-size:16px!important;font-weight:600!important;width:100%!important;cursor:pointer!important;text-align:center!important;display:block!important;margin:0!important}
                .w-full.flex.flex-row.flex-wrap.px-5 .chatbot-host-bubble:hover{background-color:#00FFAD!important;color:#1B1E25!important}
                `;
                host.shadowRoot.appendChild(s);
            }

            function startPolling(host) {
                setInterval(function() { addLabels(host); }, 900);
            }

            function addLabels(host) {
                var sr = host.shadowRoot;
                var t = new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
                sr.querySelectorAll('.chatbot-host-bubble').forEach(function(b) {
                    if (b.querySelector('.bubble-typing')||b.closest('.bubble-typing')) return;
                    if (!b.textContent.replace(/\u00a0/g,'').trim()) return;
                    if (b.closest('.flex-wrap')) return;
                    if (b.parentNode.querySelector('.cp-name')) return;
                    var p = b.parentNode;
                    var n = document.createElement('span');
                    n.className = 'cp-name';
                    n.textContent = 'Naomi-chan';
                    p.insertBefore(n, b);
                    var ts = document.createElement('span');
                    ts.className = 'cp-time'; ts.textContent = t;
                    p.appendChild(ts);
                });
                sr.querySelectorAll('.chatbot-guest-bubble').forEach(function(b) {
                    var c = b.closest('.guest-container');
                    if (!c||c.querySelector('.cp-user-time')) return;
                    if (c.closest('.w-full.px-5')||c.closest('.bottom-0')) return;
                    var ts = document.createElement('span');
                    ts.className = 'cp-user-time'; ts.textContent = t;
                    c.appendChild(ts);
                });
            }

        });
    }, {timeout: 3000});
});
