window.addEventListener('load', function() {
    requestIdleCallback(function() {
        import("https://cdn.jsdelivr.net/npm/flowise-embed/dist/web.js").then(function(m) {
            m.default.init({
                chatflowid: "c1eb657a-899d-46bb-8667-dcda36bbffdf",
                apiHost: "https://coinpool-support.bacoor.io",
                theme: {
                    button: {
                        backgroundColor: "#00FFAD",
                        right: 25, bottom: 40, size: 65,
                        iconColor: "#1B1E25",
                        customIconSrc: "https://support.coinpool.app/wp-content/uploads/2026/04/Support-Headphone-Icon.svg",
                    },
                    chatWindow: {
                        welcomeMessage: " ",
                        starterPrompts: ["🇺🇸 English", "🇯🇵 日本語"],
                        starterPromptFontSize: 16,
                        backgroundColor: "#31343a",
                        textColor: "#ffffff",
                        showTitle: true,
                        title: "CoinPool Support",
                        titleColor: "#1B1E25",
                        titleBackgroundColor: "#00FFAD",
                        botMessage: {
                            backgroundColor: "#484a50", textColor: "#ffffff",
                            showAvatar: true,
                            avatarSrc: "https://support.coinpool.app/wp-content/uploads/2026/04/Naomi-CoinPool-Support-Team.webp",
                        },
                        userMessage: { backgroundColor: "#76787c", textColor: "#ffffff", showAvatar: false },
                        textInput: {
                            placeholder: "Type your question...",
                            backgroundColor: "#484a50", textColor: "#ffffff",
                            sendButtonColor: "#00FFAD", borderColor: "transparent",
                            fileUpload: { enable: true, acceptFile: ".jpeg,.jpg,.png,.webp,.gif", maxFileSize: 5 }
                        },
                        dateTimeToggle: { date: true, time: true },
                        footer: { textColor: "#9095a0", text: "Powered by CoinPool AI", company: "", companyLink: "" }
                    }
                }
            });

            var userLanguage = 'en';
            var isHumanActive = false;
            var currentTicketId = null;
            var sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
            var supportData = {};
            var supportStep = null;
            var rateLimitUntil = 0;
            var msgTimestamps = [];
            var RATE_LIMIT_MAX = 3;
            var RATE_LIMIT_WINDOW = 10000;
            var RATE_LIMIT_COOLDOWN = 30000;

            var NAOMI_AVATAR = "https://support.coinpool.app/wp-content/uploads/2026/04/Naomi-CoinPool-Support-Team.webp";
            var KEN_AVATAR = "https://support.coinpool.app/wp-content/uploads/2026/04/Ken-CoinPool-Support.webp";
            var ROUTER_URL = "https://coinpool-support.bacoor.io";

            var CHAINS = [
                {id:"eth",label:"Ethereum"},{id:"base",label:"Base"},{id:"arbitrum",label:"Arbitrum"},
                {id:"optimism",label:"Optimism"},{id:"bsc",label:"BSC"},{id:"solana",label:"Solana"},{id:"unichain",label:"Unichain"}
            ];

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
                @keyframes cp-fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
                .w-full.flex.flex-row.flex-wrap.px-5{flex-direction:column!important;align-items:center!important;justify-content:center!important;position:absolute!important;top:50%!important;left:50%!important;transform:translate(-50%,-50%)!important;gap:16px!important;padding:20px!important;width:100%!important}
                .w-full.flex.flex-row.flex-wrap.px-5 .host-container{width:75%!important;justify-content:center!important}
                .w-full.flex.flex-row.flex-wrap.px-5 .chatbot-host-bubble{background-color:transparent!important;border:1.5px solid #00FFAD!important;color:#00FFAD!important;border-radius:8px!important;padding:14px 0!important;font-size:16px!important;font-weight:600!important;width:100%!important;cursor:pointer!important;transition:all 0.2s ease!important;text-align:center!important;display:block!important;margin:0!important}
                .w-full.flex.flex-row.flex-wrap.px-5 .chatbot-host-bubble:hover{background-color:#00FFAD!important;color:#1B1E25!important}
                .bubble-typing{background-color:#31343a!important;border:none!important;box-shadow:none!important}
                .bubble1,.bubble2,.bubble3{background-color:#5f6166!important;opacity:1!important}
                .chatbot-input{box-shadow:none!important;border:none!important}
                img[src*="Naomi"],img[src*="Ken"],.w-8.h-8.rounded-full{width:52px!important;height:52px!important;min-width:52px!important;min-height:52px!important}
                .host-container figure{margin-right:10px!important}
                .cp-name{font-size:16px!important;font-weight:600;color:#00FFAD;margin:0 0 3px 8px;display:block}
                .cp-name.human{color:#ff9f43!important}
                .cp-time{font-size:10px;color:#9095a0;margin:4px 0 0 8px;display:block}
                .cp-user-time{font-size:10px;color:#9095a0;margin-top:4px;text-align:right;display:block;width:100%}
                .guest-container{flex-direction:column!important;align-items:flex-end!important}
                .cp-rate-banner{background:#2a2d33;color:#ff6b6b;font-size:12px;text-align:center;padding:6px 12px;border-radius:6px;margin:4px 12px;animation:cp-fade 0.3s ease}
                .cp-card{background:#1e2128;border-radius:12px;overflow:hidden;width:100%;max-width:320px;font-size:13px;animation:cp-fade 0.4s ease;border:1px solid #3a3d44}
                .cp-card-header{padding:12px 14px 10px;background:#252830;display:flex;align-items:center;gap:10px}
                .cp-coin-img{width:32px;height:32px;border-radius:50%}
                .cp-coin-name{font-weight:700;font-size:15px;color:#fff}
                .cp-coin-symbol{font-size:11px;color:#9095a0}
                .cp-rank{font-size:11px;color:#9095a0;margin-left:auto}
                .cp-price-row{padding:10px 14px;display:flex;align-items:baseline;gap:10px}
                .cp-price{font-size:20px;font-weight:700;color:#fff}
                .cp-change{font-size:13px;font-weight:600}
                .cp-change.up{color:#00FFAD}
                .cp-change.down{color:#ff6b6b}
                .cp-stats{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:#3a3d44}
                .cp-stat{background:#252830;padding:8px 14px}
                .cp-stat-label{font-size:10px;color:#9095a0;margin-bottom:2px}
                .cp-stat-value{font-size:13px;font-weight:600;color:#fff}
                .cp-section{padding:10px 14px;border-top:1px solid #3a3d44}
                .cp-section-title{font-size:10px;color:#9095a0;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px}
                .cp-contract-row{display:flex;align-items:center;gap:6px;margin-bottom:6px;font-size:12px}
                .cp-chain-badge{background:#3a3d44;color:#ccc;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:600;white-space:nowrap}
                .cp-addr{color:#9095a0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:monospace;font-size:11px}
                .cp-icon-btn{background:#3a3d44;border:none;color:#ccc;padding:4px 7px;border-radius:4px;cursor:pointer;font-size:11px;white-space:nowrap;transition:background 0.15s;flex-shrink:0}
                .cp-icon-btn:hover{background:#00FFAD;color:#1B1E25}
                .cp-pool-row{display:flex;align-items:center;gap:6px;margin-bottom:7px;font-size:12px}
                .cp-pool-name{font-weight:600;color:#fff;flex:1}
                .cp-pool-dex{color:#9095a0;font-size:11px}
                .cp-pool-vol{color:#00FFAD;font-size:11px;white-space:nowrap}
                .cp-footer-attr{padding:8px 14px;background:#1a1d22;border-top:1px solid #3a3d44;font-size:10px;color:#5f6166;text-align:right}
                .cp-footer-attr a{color:#9095a0;text-decoration:none}
                .cp-footer-attr a:hover{color:#00FFAD}
                .cp-trend-row{display:flex;align-items:center;gap:6px;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #3a3d44;font-size:12px}
                .cp-trend-row:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
                .cp-trend-num{font-size:13px;font-weight:700;color:#00FFAD;width:18px}
                .cp-trend-info{flex:1;min-width:0}
                .cp-trend-name{font-weight:600;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
                .cp-trend-meta{color:#9095a0;font-size:10px}
                .cp-trend-vol{color:#00FFAD;font-size:11px;white-space:nowrap;text-align:right}
                .cp-disamb{background:#1e2128;border-radius:10px;overflow:hidden;width:100%;max-width:320px;border:1px solid #3a3d44;animation:cp-fade 0.4s ease}
                .cp-disamb-title{padding:10px 14px;background:#252830;font-size:12px;color:#9095a0}
                .cp-disamb-btn{display:flex;align-items:center;gap:8px;width:100%;padding:10px 14px;background:transparent;border:none;border-bottom:1px solid #3a3d44;cursor:pointer;text-align:left;transition:background 0.15s}
                .cp-disamb-btn:last-of-type{border-bottom:none}
                .cp-disamb-btn:hover{background:#252830}
                .cp-disamb-name{font-weight:600;color:#fff;font-size:13px;flex:1}
                .cp-disamb-symbol{color:#00FFAD;font-size:11px;font-family:monospace}
                .cp-disamb-note{padding:8px 14px;font-size:11px;color:#5f6166;background:#1a1d22;border-top:1px solid #3a3d44}
                .cp-flow-btns{display:flex;flex-direction:column;gap:8px;margin-top:8px;width:100%}
                .cp-flow-btn{background:transparent;border:1.5px solid #00FFAD;color:#00FFAD;border-radius:8px;padding:10px 14px;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s ease;text-align:left;width:100%}
                .cp-flow-btn:hover{background:#00FFAD;color:#1B1E25}
                .cp-chain-grid{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
                .cp-chain-btn{background:#3a3d44;border:1px solid #5f6166;color:#fff;border-radius:6px;padding:7px 12px;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s ease}
                .cp-chain-btn:hover,.cp-chain-btn.active{background:#00FFAD;color:#1B1E25;border-color:#00FFAD}
                `;
                host.shadowRoot.appendChild(s);
            }

            function startPolling(host) {
                setTimeout(function() { hideEmptyBubbles(host); }, 500);
                setTimeout(function() { hideEmptyBubbles(host); }, 1500);
                setInterval(function() { hideEmptyBubbles(host); addLabels(host); renderCards(host); }, 900);
                setInterval(function() { detectLanguage(host); }, 1000);
                setTimeout(function() { interceptInput(host); }, 2000);
                setTimeout(function() { interceptResetButton(host); }, 2000);
                setTimeout(function() { injectNewChatButton(host); }, 2500);
            }

            // ── Intercept the 🔄 reset button to do a full flow reset ──
            function interceptResetButton(host) {
                var sr = host.shadowRoot;
                var resetBtn = sr.querySelector('button.chatbot-button.my-2.ml-2');
                if (!resetBtn) return;
                if (host._resetIntercepted) return;
                host._resetIntercepted = true;
                resetBtn.addEventListener('click', function() {
                    setTimeout(function() { doFullReset(host); }, 300);
                });
            }

            // ── Inject "Start New Chat" button at bottom ──
            function injectNewChatButton(host) {
                var sr = host.shadowRoot;
                var inputArea = sr.querySelector('.chatbot-input')
                                || sr.querySelector('.w-full.flex.items-end');
                if (!inputArea || sr.querySelector('.cp-new-chat-btn')) return;
                var btn = document.createElement('button');
                btn.className = 'cp-new-chat-btn';
                btn.textContent = userLanguage === 'ja' ? '🔄 新しいチャットを開始' : '🔄 Start New Chat';
                btn.style.cssText = 'width:100%;background:transparent;border:none;border-top:1px solid #3a3d44;'+
                    'color:#9095a0;font-size:11px;padding:6px;cursor:pointer;transition:color 0.2s;';
                btn.onmouseover = function() { btn.style.color = '#00FFAD'; };
                btn.onmouseout = function() { btn.style.color = '#9095a0'; };
                btn.onclick = function() { doFullReset(host); };
                inputArea.parentNode.insertBefore(btn, inputArea.nextSibling);
            }

            // ── Full reset — clears chat and goes back to language selector ──
            function doFullReset(host) {
                var sr = host.shadowRoot;
                // Clear chat view
                var chatView = sr.querySelector('.chatbot-chat-view') || sr.querySelector('.scrollable-container');
                if (chatView) {
                    // Remove all injected messages
                    chatView.querySelectorAll('.cp-injected').forEach(function(el) { el.remove(); });
                    // Hide all Flowise messages
                    chatView.querySelectorAll('.host-container, .guest-container').forEach(function(el) {
                        el.style.display = 'none';
                    });
                }
                // Reset state
                host._greetingShown = false;
                host._inputIntercepted = false;
                host._resetIntercepted = false;
                supportStep = null;
                supportData = {};
                userLanguage = 'en';
                isHumanActive = false;
                currentTicketId = null;
                sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
                msgTimestamps = [];
                rateLimitUntil = 0;

                // Show starter prompts again
                var starterContainer = sr.querySelector('.w-full.flex.flex-row.flex-wrap.px-5');
                if (starterContainer) {
                    starterContainer.style.display = '';
                    starterContainer.querySelectorAll('.host-container').forEach(function(el) {
                        el.style.display = '';
                    });
                }

                // Re-intercept input and reset button
                setTimeout(function() { interceptInput(host); }, 500);
                setTimeout(function() { interceptResetButton(host); }, 500);

                // Update new chat button language
                var newChatBtn = sr.querySelector('.cp-new-chat-btn');
                if (newChatBtn) newChatBtn.textContent = '🔄 Start New Chat';
            }

            // ── Intercept Flowise input after language selected ──
            function interceptInput(host) {
                var sr = host.shadowRoot;
                var sendBtn = sr.querySelector('button.chatbot-button.m-0');
                var inputEl = sr.querySelector('textarea, input[type="text"]');
                if (!sendBtn || !inputEl) {
                    setTimeout(function() { interceptInput(host); }, 1000);
                    return;
                }
                if (host._inputIntercepted) return;
                host._inputIntercepted = true;

                function handleSend(e) {
                    if (!host._greetingShown) return;
                    var text = inputEl.value.trim();
                    if (!text) return;

                    // Rate limit check
                    var now = Date.now();
                    if (now < rateLimitUntil) {
                        e.preventDefault(); e.stopPropagation();
                        showRateLimitBanner(host); return;
                    }
                    msgTimestamps = msgTimestamps.filter(function(t) { return now - t < RATE_LIMIT_WINDOW; });
                    if (msgTimestamps.length >= RATE_LIMIT_MAX) {
                        rateLimitUntil = now + RATE_LIMIT_COOLDOWN;
                        e.preventDefault(); e.stopPropagation();
                        showRateLimitBanner(host); return;
                    }
                    msgTimestamps.push(now);

                    // Support flow — handle entirely ourselves, block Flowise
                    if (supportStep) {
                        e.preventDefault(); e.stopPropagation();
                        e.stopImmediatePropagation();
                        inputEl.value = '';
                        inputEl.dispatchEvent(new Event('input', {bubbles: true}));
                        injectUserMessage(host, text);
                        handleSupportStep(text, host);
                        return;
                    }

                    // Regular message — let Flowise handle it normally
                    // renderCards() will process the response
                }

                sendBtn.addEventListener('click', handleSend, true);
                inputEl.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' && !e.shiftKey) handleSend(e);
                }, true);
            }

            function hideEmptyBubbles(host) {
                host.shadowRoot.querySelectorAll('.chatbot-host-bubble').forEach(function(b) {
                    if (!b.textContent.replace(/\u00a0/g,'').trim()) {
                        var c = b.closest('.host-container');
                        if (c) c.style.display = 'none';
                    }
                });
            }

            function detectLanguage(host) {
                host.shadowRoot.querySelectorAll('.chatbot-guest-bubble').forEach(function(m) {
                    if (m.textContent.includes('日本語')) userLanguage = 'ja';
                    else if (m.textContent.includes('English')) userLanguage = 'en';
                });
                // Update new chat button text
                var btn = host.shadowRoot.querySelector('.cp-new-chat-btn');
                if (btn) btn.textContent = userLanguage === 'ja' ? '🔄 新しいチャットを開始' : '🔄 Start New Chat';
            }

            function addLabels(host) {
                var sr = host.shadowRoot;
                var t = new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
                var botName = isHumanActive ? (userLanguage==='ja'?'ケンくん':'Ken-kun') : (userLanguage==='ja'?'ナオミちゃん':'Naomi-chan');
                sr.querySelectorAll('.chatbot-host-bubble').forEach(function(b) {
                    if (b.querySelector('.bubble-typing')||b.closest('.bubble-typing')) return;
                    if (!b.textContent.replace(/\u00a0/g,'').trim()) return;
                    if (b.closest('.flex-wrap')) return;
                    if (b.parentNode.querySelector('.cp-name')) return;
                    var row = b.closest('.flex.flex-row');
                    if (row && row.querySelectorAll('.chatbot-host-bubble').length > 1) return;
                    var p = b.parentNode;
                    var n = document.createElement('span');
                    n.className = 'cp-name'+(isHumanActive?' human':'');
                    n.textContent = botName;
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

            function getTime() { return new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}); }

            function injectBotMessage(host, html, isCard) {
                var sr = host.shadowRoot;
                var chatView = sr.querySelector('.chatbot-chat-view')||sr.querySelector('.scrollable-container');
                if (!chatView) return;
                var wrapper = document.createElement('div');
                wrapper.className = 'flex flex-row justify-start mb-2 items-start host-container cp-injected';
                var fig = document.createElement('figure');
                fig.style.cssText = 'margin-right:10px;flex-shrink:0;';
                var img = document.createElement('img');
                img.src = isHumanActive ? KEN_AVATAR : NAOMI_AVATAR;
                img.style.cssText = 'width:52px;height:52px;border-radius:50%;object-fit:cover;';
                fig.appendChild(img);
                var msgWrap = document.createElement('div');
                msgWrap.className = 'flex flex-col justify-start';
                var botName = isHumanActive ? (userLanguage==='ja'?'ケンくん':'Ken-kun') : (userLanguage==='ja'?'ナオミちゃん':'Naomi-chan');
                var nameEl = document.createElement('span');
                nameEl.className = 'cp-name'+(isHumanActive?' human':'');
                nameEl.textContent = botName;
                var bubble = document.createElement('div');
                if (isCard) {
                    bubble.style.cssText = 'max-width:320px;width:100%;';
                    bubble.innerHTML = html;
                } else {
                    bubble.className = 'chatbot-host-bubble';
                    bubble.style.cssText = 'background:#484a50;color:#fff;border-radius:8px;padding:10px 14px;max-width:280px;word-break:break-word;line-height:1.5;';
                    bubble.innerHTML = html;
                }
                var ts = document.createElement('span');
                ts.className = 'cp-time'; ts.textContent = getTime();
                msgWrap.appendChild(nameEl);
                msgWrap.appendChild(bubble);
                msgWrap.appendChild(ts);
                wrapper.appendChild(fig);
                wrapper.appendChild(msgWrap);
                chatView.appendChild(wrapper);
                chatView.scrollTop = chatView.scrollHeight;
            }

            function buildMarketCardHTML(card) {
                var coin = card.coin;
                var cc = coin.change_positive ? 'up' : 'down';
                var ca = coin.change_positive ? '▲' : '▼';
                var imgH = coin.image ? '<img class="cp-coin-img" src="'+coin.image+'" alt="">' : '';
                var cH = '';
                (card.contracts||[]).forEach(function(c) {
                    var short = c.address.slice(0,6)+'...'+c.address.slice(-4);
                    var gt = 'https://www.geckoterminal.com/'+c.network+'/tokens/'+c.address;
                    cH += '<div class="cp-contract-row"><span class="cp-chain-badge">'+c.chain+'</span><span class="cp-addr">'+short+'</span>'+
                        '<button class="cp-icon-btn" onclick="cpCopy(\''+c.address+'\',this)">📋</button>'+
                        '<a href="'+gt+'" target="_blank"><button class="cp-icon-btn">📈</button></a></div>';
                });
                var pH = '';
                (card.pools||[]).forEach(function(p) {
                    var gt = 'https://www.geckoterminal.com/'+p.network+'/pools/'+p.address;
                    pH += '<div class="cp-pool-row"><div><div class="cp-pool-name">'+p.name+'</div><div class="cp-pool-dex">'+p.dex+'</div></div>'+
                        '<span class="cp-pool-vol">'+p.volume_24h+'</span>'+
                        '<a href="'+gt+'" target="_blank"><button class="cp-icon-btn">📈</button></a></div>';
                });
                if (!pH) pH = '<div style="color:#9095a0;font-size:12px;">Sorry, no data</div>';
                return '<div class="cp-card">'+
                    '<div class="cp-card-header">'+imgH+'<div><div class="cp-coin-name">'+coin.name+'</div><div class="cp-coin-symbol">'+coin.symbol+'</div></div>'+(coin.rank?'<div class="cp-rank">#'+coin.rank+'</div>':'')+' </div>'+
                    '<div class="cp-price-row"><span class="cp-price">'+coin.price+'</span><span class="cp-change '+cc+'">'+ca+' '+coin.change_24h+'</span></div>'+
                    '<div class="cp-stats"><div class="cp-stat"><div class="cp-stat-label">Market Cap</div><div class="cp-stat-value">'+coin.market_cap+'</div></div>'+
                    '<div class="cp-stat"><div class="cp-stat-label">Volume 24h</div><div class="cp-stat-value">'+coin.volume_24h+'</div></div></div>'+
                    (cH?'<div class="cp-section"><div class="cp-section-title">Contract Addresses</div>'+cH+'</div>':'')+
                    '<div class="cp-section"><div class="cp-section-title">Top Pools</div>'+pH+'</div>'+
                    '<div class="cp-footer-attr">🦎 Data by <a href="https://www.coingecko.com" target="_blank">CoinGecko</a> &amp; <a href="https://www.geckoterminal.com" target="_blank">GeckoTerminal</a></div></div>';
            }

            function buildTrendingCardHTML(card) {
                var pH = '';
                if (!card.pools||!card.pools.length) {
                    pH = '<div style="color:#9095a0;font-size:12px;padding:10px 0;">Sorry, no data</div>';
                } else {
                    card.pools.forEach(function(p,i) {
                        var gt = 'https://www.geckoterminal.com/'+p.network+'/pools/'+p.address;
                        var short = p.address.slice(0,6)+'...'+p.address.slice(-4);
                        pH += '<div class="cp-trend-row"><span class="cp-trend-num">#'+(i+1)+'</span>'+
                            '<div class="cp-trend-info"><div class="cp-trend-name">'+p.name+'</div>'+
                            '<div class="cp-trend-meta">'+p.dex+' · '+short+' · '+p.created+'</div></div>'+
                            '<div style="text-align:right;flex-shrink:0;"><div class="cp-trend-vol">'+p.volume_24h+'</div>'+
                            '<a href="'+gt+'" target="_blank"><button class="cp-icon-btn" style="margin-top:4px;">📈</button></a>'+
                            '<button class="cp-icon-btn" style="margin-top:4px;" onclick="cpCopy(\''+p.address+'\',this)">📋</button></div></div>';
                    });
                }
                return '<div class="cp-card">'+
                    '<div class="cp-card-header"><span style="font-size:18px;margin-right:4px;">🔥</span>'+
                    '<div><div class="cp-coin-name">Trending on '+card.chain+'</div><div class="cp-coin-symbol">Top 5 by Volume 24h</div></div></div>'+
                    '<div class="cp-section">'+pH+'</div>'+
                    '<div class="cp-footer-attr">🦎 Data by <a href="https://www.geckoterminal.com" target="_blank">GeckoTerminal</a></div></div>';
            }

            function buildDisambiguationHTML(data) {
                var bH = '';
                data.coins.forEach(function(c) {
                    bH += '<button class="cp-disamb-btn" onclick="cpSelectCoin(\''+c.id+'\')">'+
                        '<span class="cp-disamb-name">'+c.name+'</span><span class="cp-disamb-symbol">'+c.symbol+'</span></button>';
                });
                return '<div class="cp-disamb">'+
                    '<div class="cp-disamb-title">Multiple results for "'+data.query+'" — pick one:</div>'+
                    bH+
                    '<div class="cp-disamb-note">Can\'t find yours? Give me more details below 👇</div></div>';
            }

            function renderCards(host) {
                var sr = host.shadowRoot;
                var isJa = userLanguage === 'ja';

                // Hide only Flowise user bubbles visually (not remove from DOM)
                // We inject our own styled ones, but keep Flowise's for message sending
                if (host._greetingShown) {
                    sr.querySelectorAll('.guest-container:not(.cp-injected)').forEach(function(c) {
                        c.style.visibility = 'hidden';
                        c.style.height = '0';
                        c.style.margin = '0';
                        c.style.padding = '0';
                        c.style.overflow = 'hidden';
                    });
                }

                sr.querySelectorAll('.chatbot-host-bubble:not(.cp-rendered)').forEach(function(b) {
                    var text = b.textContent.replace(/\u00a0/g,'').trim();

                    // Hide empty welcome bubble only
                    if (!text) {
                        b.classList.add('cp-rendered');
                        var c = b.closest('.host-container');
                        if (c) c.style.display = 'none';
                        return;
                    }
                    // Hide internal control messages
                    if (text === 'SILENT' || text === 'NO_REPLIES') {
                        b.classList.add('cp-rendered');
                        var c = b.closest('.host-container');
                        if (c) c.style.display = 'none';
                        return;
                    }
                    // Rate limit
                    if (text === 'RATE_LIMITED') {
                        b.classList.add('cp-rendered');
                        var c = b.closest('.host-container');
                        if (c) c.style.display = 'none';
                        showRateLimitBanner(host); return;
                    }
                    // Trending selector
                    if (text === 'SHOW_TRENDING_SELECTOR') {
                        b.classList.add('cp-rendered');
                        var c = b.closest('.host-container');
                        if (c) c.style.display = 'none';
                        showTrendingSelector(host); return;
                    }
                    // Human reply
                    if (text.startsWith('HUMAN_REPLY:')) {
                        b.classList.add('cp-rendered');
                        var c = b.closest('.host-container');
                        if (c) c.style.display = 'none';
                        try {
                            var replies = JSON.parse(text.replace('HUMAN_REPLY:',''));
                            replies.forEach(function(r) {
                                isHumanActive = true;
                                injectBotMessage(host, r.text, false);
                                updateAvatarToKen(host);
                            });
                        } catch(e) {}
                        return;
                    }
                    // Cards — replace content in-place (keeps Flowise bubble, correct order)
                    if (text.startsWith('CARD:')) {
                        b.classList.add('cp-rendered');
                        try {
                            var cd = JSON.parse(text.replace('CARD:',''));
                            if (cd.type==='MARKET_CARD') {
                                b.innerHTML = buildMarketCardHTML(cd);
                                b.style.cssText = 'background:transparent!important;padding:0!important;max-width:320px;width:100%;';
                            } else if (cd.type==='TRENDING_CARD') {
                                b.innerHTML = buildTrendingCardHTML(cd);
                                b.style.cssText = 'background:transparent!important;padding:0!important;max-width:320px;width:100%;';
                            } else if (cd.type==='DISAMBIGUATION') {
                                b.innerHTML = buildDisambiguationHTML(cd);
                                b.style.cssText = 'background:transparent!important;padding:0!important;max-width:320px;width:100%;';
                            }
                        } catch(e) {}
                        return;
                    }
                    // Escalation — add human button to existing bubble
                    if (text === 'NEEDS_ESCALATION') {
                        b.classList.add('cp-rendered');
                        var msg = isJa ? 'この件はサポートチームが直接対応いたします😊' : 'This one needs our support team\'s attention! 😊';
                        var btn = '<div class="cp-flow-btns" style="margin-top:10px;"><button class="cp-flow-btn" style="border-color:#ff9f43;color:#ff9f43;" onclick="cpFlow(\'human\')">👋 '+(isJa?'担当者に繋ぐ':'Talk to a Human')+'</button></div>';
                        b.innerHTML = msg+btn; return;
                    }
                    // Human button hint
                    if (text.includes('||SHOW_HUMAN_BTN')) {
                        b.classList.add('cp-rendered');
                        var clean = text.replace('||SHOW_HUMAN_BTN','');
                        var hint = '<div style="margin-top:10px;font-size:11px;color:#9095a0;">'+(isJa?'解決しましたか？解決しない場合は ':'Still need help? ')+'<span style="color:#ff9f43;cursor:pointer;" onclick="cpFlow(\'human\')">'+(isJa?'担当者に繋ぐ👋':'Talk to a Human 👋')+'</span></div>';
                        b.innerHTML = clean+hint; return;
                    }
                });

                // One-time greeting after language selection
                if (!host._greetingShown) {
                    var guestBubbles = sr.querySelectorAll('.chatbot-guest-bubble');
                    if (guestBubbles.length > 0) {
                        var lastGuest = guestBubbles[guestBubbles.length-1].textContent.trim();
                        if (lastGuest.includes('English')||lastGuest.includes('日本語')) {
                            host._greetingShown = true;
                            var isJa2 = lastGuest.includes('日本語');
                            userLanguage = isJa2 ? 'ja' : 'en';
                            setTimeout(function() { showGreeting(host, isJa2); }, 600);
                        }
                    }
                }
            }

            function showGreeting(host, isJa) {
                var greet = isJa
                    ? 'こんにちは！ナオミちゃんです😊 本日はどのようなご用件でしょうか？'
                    : 'Hi there! I\'m Naomi-chan 😊 How can I help you today?';
                var btns = '<div class="cp-flow-btns">'+
                    '<button class="cp-flow-btn" onclick="cpFlow(\'support\')">🛠️ '+(isJa?'テクニカルサポート':'Technical Support')+'</button>'+
                    '<button class="cp-flow-btn" onclick="cpFlow(\'market\')">📊 '+(isJa?'マーケットリサーチ':'Market Research')+'</button>'+
                    '<button class="cp-flow-btn" onclick="cpFlow(\'trending\')">🔥 '+(isJa?'トレンド':'What\'s Trending')+'</button>'+
                    '</div>';
                injectBotMessage(host, greet+btns, false);
            }

            function showTrendingSelector(host) {
                var isJa = userLanguage==='ja';
                var title = isJa ? 'どのチェーンのトレンドプールを見ますか？🔥' : 'Which chain would you like to see trending pools for? 🔥';
                var btns = '<div class="cp-chain-grid" id="cp-chain-grid">';
                CHAINS.forEach(function(c) { btns += '<button class="cp-chain-btn" onclick="cpTrending(\''+c.id+'\',this)">'+c.label+'</button>'; });
                btns += '</div>';
                injectBotMessage(host, title+btns, false);
            }

            function updateAvatarToKen(host) {
                host.shadowRoot.querySelectorAll('img[src*="Naomi"]').forEach(function(i) { i.src = KEN_AVATAR; });
                host.shadowRoot.querySelectorAll('.cp-name').forEach(function(n) {
                    n.textContent = userLanguage==='ja' ? 'ケンくん' : 'Ken-kun';
                    n.classList.add('human');
                });
            }

            function showRateLimitBanner(host) {
                var chatView = host.shadowRoot.querySelector('.chatbot-chat-view')||host.shadowRoot.querySelector('.scrollable-container');
                if (!chatView) return;
                var banner = document.createElement('div');
                banner.className = 'cp-rate-banner';
                var secs = 30;
                banner.textContent = (userLanguage==='ja' ? 'ちょっと待って！😅 ' : 'Slow down a little! 😅 ')+secs+'s...';
                chatView.appendChild(banner);
                chatView.scrollTop = chatView.scrollHeight;
                var iv = setInterval(function() {
                    secs--;
                    if (secs <= 0) { clearInterval(iv); banner.remove(); }
                    else banner.textContent = (userLanguage==='ja'?'ちょっと待って！😅 ':'Slow down a little! 😅 ')+secs+'s...';
                }, 1000);
            }

            function injectUserMessage(host, text) {
                var sr = host.shadowRoot;
                var chatView = sr.querySelector('.chatbot-chat-view')||sr.querySelector('.scrollable-container');
                if (!chatView) return;
                var wrapper = document.createElement('div');
                wrapper.className = 'flex flex-row justify-end mb-2 items-end guest-container cp-injected';
                var bubble = document.createElement('div');
                bubble.className = 'chatbot-guest-bubble cp-injected-user';
                bubble.style.cssText = 'background:#76787c;color:#fff;border-radius:8px;padding:10px 14px;max-width:280px;word-break:break-word;line-height:1.5;';
                bubble.textContent = text;
                var ts = document.createElement('span');
                ts.className = 'cp-user-time'; ts.textContent = getTime();
                wrapper.appendChild(bubble);
                wrapper.appendChild(ts);
                chatView.appendChild(wrapper);
                chatView.scrollTop = chatView.scrollHeight;
            }

            function handleSupportStep(text, host) {
                if (!supportStep) return;
                var isJa = userLanguage==='ja';
                injectUserMessage(host, text);
                if (supportStep==='issue_check') {
                    supportData.issue = text;
                    supportStep = null;
                    sendToRouter('SUPPORT_FLOW_END', host);
                    sendToRouterWithCallback('SUPPORT_ISSUE_CHECK:'+text, host, function(answer) {
                        var isJa2 = userLanguage==='ja';
                        if (answer === 'NEEDS_ESCALATION') {
                            // Account-level problem — show escalation message + prominent human button
                            var msg = isJa2
                                ? 'この件はサポートチームが直接対応いたします😊'
                                : 'This one needs our support team\'s attention! 😊';
                            var btn = '<div class="cp-flow-btns" style="margin-top:10px;">'+
                                '<button class="cp-flow-btn" style="border-color:#ff9f43;color:#ff9f43;" onclick="cpFlow(\'human\')">👋 '+(isJa2?'担当者に繋ぐ':'Talk to a Human')+'</button>'+
                                '</div>';
                            injectBotMessage(host, msg+btn, false);
                        } else if (answer.includes('||SHOW_HUMAN_BTN')) {
                            // Naomi answered but offer subtle escape hatch
                            var cleanAnswer = answer.replace('||SHOW_HUMAN_BTN', '');
                            var hint = '<div style="margin-top:10px;font-size:11px;color:#9095a0;">'+
                                (isJa2 ? '解決しましたか？解決しない場合は ' : 'Still need help? ')+
                                '<span style="color:#ff9f43;cursor:pointer;" onclick="cpFlow(\'human\')">'+
                                (isJa2 ? '担当者に繋ぐ👋' : 'Talk to a Human 👋')+
                                '</span></div>';
                            injectBotMessage(host, cleanAnswer+hint, false);
                        } else {
                            injectBotMessage(host, answer, false);
                        }
                    });
                } else if (supportStep==='name') {
                    supportData.name = text; supportStep = 'email';
                    injectBotMessage(host, isJa?'ありがとうございます！メールアドレスを教えてください📧':'Thanks! What\'s your email address? 📧', false);
                } else if (supportStep==='email') {
                    supportData.email = text; supportStep = 'wallet';
                    injectBotMessage(host, isJa?'ウォレットアドレスを教えてください🔑':'What\'s your wallet address? 🔑', false);
                } else if (supportStep==='wallet') {
                    supportData.wallet = text; supportStep = 'subaccount';
                    injectBotMessage(host, isJa?'サブアカウントアドレスはありますか？（なければ「なし」）':'Sub-account address? (Type "none" if not applicable)', false);
                } else if (supportStep==='subaccount') {
                    supportData.subaccount = text; supportStep = null;
                    sendToRouter('SUPPORT_FLOW_END', host);
                    sendToRouter('SUPPORT_TICKET:'+JSON.stringify(supportData), host);
                }
            }

            function pollReplies(host) {
                if (!currentTicketId || !host) return;
                fetch(ROUTER_URL+'/replies/'+sessionId)
                    .then(function(r){return r.json();})
                    .then(function(data) {
                        if (data.replies && data.replies.length) {
                            isHumanActive = true;
                            data.replies.forEach(function(r) {
                                injectBotMessage(host, r.text, false);
                                updateAvatarToKen(host);
                            });
                        }
                    }).catch(function(){});
            }

            function sendToRouterWithCallback(content, host, callback) {
                fetch(ROUTER_URL+'/v1/chat/completions', {
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({session_id: sessionId, messages:[{role:'user',content:content}]})
                })
                .then(function(r){return r.json();})
                .then(function(data) {
                    var answer = data.choices&&data.choices[0]&&data.choices[0].message&&data.choices[0].message.content;
                    if (answer && callback) callback(answer);
                })
                .catch(function(e){console.error('[Widget] Router error',e);});
            }

            function sendToRouter(content, host) {
                fetch(ROUTER_URL+'/v1/chat/completions', {
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({session_id: sessionId, messages:[{role:'user',content:content}]})
                })
                .then(function(r){return r.json();})
                .then(function(data) {
                    var answer = data.choices&&data.choices[0]&&data.choices[0].message&&data.choices[0].message.content;
                    if (!answer) return;
                    if (answer.startsWith('CARD:')) {
                        try {
                            var cd = JSON.parse(answer.replace('CARD:',''));
                            if (cd.type==='MARKET_CARD') injectBotMessage(host, buildMarketCardHTML(cd), true);
                            else if (cd.type==='TRENDING_CARD') injectBotMessage(host, buildTrendingCardHTML(cd), true);
                            else if (cd.type==='DISAMBIGUATION') injectBotMessage(host, buildDisambiguationHTML(cd), true);
                        } catch(e){}
                    } else if (answer==='SHOW_TRENDING_SELECTOR') {
                        showTrendingSelector(host);
                    } else if (answer!=='NO_REPLIES') {
                        injectBotMessage(host, answer, false);
                    }
                    if (content.startsWith('SUPPORT_TICKET:')) {
                        var m = answer.match(/#(\d+)/);
                        if (m) {
                            currentTicketId = m[1];
                            setInterval(function() { pollReplies(host); }, 5000);
                        }
                    }
                })
                .catch(function(e){console.error('[Widget] Router error',e);});
            }

            // ── Global handlers ──
            window.cpCopy = function(text, btn) {
                navigator.clipboard.writeText(text).then(function() {
                    var o = btn.textContent; btn.textContent = '✅';
                    setTimeout(function(){btn.textContent=o;}, 1500);
                });
            };
            window.cpSelectCoin = function(coinId) {
                var host = document.querySelector('flowise-chatbot');
                if (host) sendToRouter('MARKET_REQUEST:'+coinId, host);
            };
            window.cpTrending = function(network, btn) {
                var host = document.querySelector('flowise-chatbot');
                if (!host) return;
                var grid = host.shadowRoot.querySelector('#cp-chain-grid');
                if (grid) grid.querySelectorAll('.cp-chain-btn').forEach(function(b){b.classList.remove('active');});
                if (btn) btn.classList.add('active');
                sendToRouter('TRENDING_REQUEST:'+network, host);
            };
            window.cpFlow = function(flow) {
                var host = document.querySelector('flowise-chatbot');
                if (!host) return;
                var isJa = userLanguage==='ja';
                if (flow==='support') {
                    supportStep = 'issue_check'; supportData = {};
                    sendToRouter('SUPPORT_FLOW_START', host);
                    injectBotMessage(host, isJa?'どのような問題が発生していますか？詳しく教えてください💬':'What issue are you facing? Please describe it and I\'ll try to help! 💬', false);
                } else if (flow==='human') {
                    supportStep = 'name'; supportData = supportData || {};
                    sendToRouter('SUPPORT_FLOW_START', host);
                    injectBotMessage(host, isJa?'担当者に繋ぎます！まずお名前を教えてください😊':'Connecting you with our team! First, what\'s your name? 😊', false);
                } else if (flow==='market') {
                    injectBotMessage(host, isJa?'プロジェクト名、チェーン、またはコントラクトアドレスを教えてください🔍':'Tell me a project name, chain, or contract address! 🔍', false);
                } else if (flow==='trending') {
                    showTrendingSelector(host);
                }
            };

        });
    }, {timeout: 3000});
});
