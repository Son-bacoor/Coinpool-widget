window.addEventListener('load', function() {
    requestIdleCallback(function() {
        import("https://cdn.jsdelivr.net/npm/flowise-embed/dist/web.js").then(function(m) {
            m.default.init({
                chatflowid: "c1eb657a-899d-46bb-8667-dcda36bbffdf",
                apiHost: "https://coinpool-support.bacoor.io",
                theme: {
                    button: { backgroundColor: "#00FFAD", right: 25, bottom: 40, size: 65, iconColor: "#1B1E25", customIconSrc: "https://support.coinpool.app/wp-content/uploads/2026/04/Support-Headphone-Icon.svg" },
                    chatWindow: {
                        welcomeMessage: " ",
                        starterPrompts: ["🇺🇸 English", "🇯🇵 日本語"],
                        starterPromptFontSize: 16,
                        backgroundColor: "#31343a", textColor: "#ffffff",
                        showTitle: true, title: "CoinPool Support", titleColor: "#1B1E25", titleBackgroundColor: "#00FFAD",
                        botMessage: { backgroundColor: "#484a50", textColor: "#ffffff", showAvatar: true, avatarSrc: "https://support.coinpool.app/wp-content/uploads/2026/04/Naomi-CoinPool-Support-Team.webp" },
                        userMessage: { backgroundColor: "#76787c", textColor: "#ffffff", showAvatar: false },
                        textInput: { placeholder: "Type your question...", backgroundColor: "#484a50", textColor: "#ffffff", sendButtonColor: "#00FFAD", borderColor: "transparent", fileUpload: { enable: true, acceptFile: ".jpeg,.jpg,.png,.webp,.gif", maxFileSize: 5 } },
                        dateTimeToggle: { date: true, time: true },
                        footer: { textColor: "#9095a0", text: "Powered by CoinPool AI", company: "", companyLink: "" }
                    }
                }
            });

            var userLanguage = 'en';
            var isHumanActive = false;
            var NAOMI_AVATAR = "https://support.coinpool.app/wp-content/uploads/2026/04/Naomi-CoinPool-Support-Team.webp";
            var KEN_AVATAR = "https://support.coinpool.app/wp-content/uploads/2026/04/Ken-CoinPool-Support.webp";
            var CHAINS = [{id:"eth",label:"Ethereum"},{id:"base",label:"Base"},{id:"arbitrum",label:"Arbitrum"},{id:"optimism",label:"Optimism"},{id:"bsc",label:"BSC"},{id:"solana",label:"Solana"},{id:"unichain",label:"Unichain"}];

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
                .cp-flow-btn.human{border-color:#ff9f43!important;color:#ff9f43!important}
                .cp-flow-btn.human:hover{background:#ff9f43!important;color:#1B1E25!important}
                .cp-chain-grid{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
                .cp-chain-btn{background:#3a3d44;border:1px solid #5f6166;color:#fff;border-radius:6px;padding:7px 12px;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s ease}
                .cp-chain-btn:hover,.cp-chain-btn.active{background:#00FFAD;color:#1B1E25;border-color:#00FFAD}
                .cp-new-chat-btn{width:100%;background:transparent;border:none;border-top:1px solid #3a3d44;color:#9095a0;font-size:11px;padding:6px;cursor:pointer}
                .cp-new-chat-btn:hover{color:#00FFAD}
                `;
                host.shadowRoot.appendChild(s);
            }

            function startPolling(host) {
                setTimeout(function() { hideEmptyBubbles(host); }, 500);
                setTimeout(function() { hideEmptyBubbles(host); }, 1500);
                setInterval(function() { hideEmptyBubbles(host); addLabels(host); renderCards(host); }, 900);
                setInterval(function() { detectLanguage(host); }, 1000);
                setTimeout(function() { interceptResetButton(host); }, 2000);
                setTimeout(function() { injectNewChatButton(host); }, 2500);
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

            function renderCards(host) {
                var sr = host.shadowRoot;
                sr.querySelectorAll('.chatbot-host-bubble:not(.cp-rendered)').forEach(function(b) {
                    var text = b.textContent.replace(/\u00a0/g,'').trim();
                    if (!text) return;
                    if (text === 'SILENT' || text === 'NO_REPLIES') {
                        b.classList.add('cp-rendered');
                        var c = b.closest('.host-container'); if (c) c.style.display = 'none';
                        return;
                    }
                    if (text.startsWith('HUMAN_REPLY:')) {
                        b.classList.add('cp-rendered');
                        var c = b.closest('.host-container'); if (c) c.style.display = 'none';
                        try {
                            JSON.parse(text.replace('HUMAN_REPLY:','')).forEach(function(r) {
                                isHumanActive = true; updateAvatarToKen(host);
                            });
                        } catch(e) {}
                        return;
                    }
                    if (text.startsWith('CARD:')) {
                        b.classList.add('cp-rendered');
                        try {
                            var cd = JSON.parse(text.replace('CARD:',''));
                            if (cd.type==='MARKET_CARD') { b.innerHTML=buildMarketCardHTML(cd); b.style.cssText='background:transparent!important;padding:0!important;max-width:320px;width:100%;'; }
                            else if (cd.type==='TRENDING_CARD') { b.innerHTML=buildTrendingCardHTML(cd); b.style.cssText='background:transparent!important;padding:0!important;max-width:320px;width:100%;'; }
                            else if (cd.type==='DISAMBIGUATION') { b.innerHTML=buildDisambiguationHTML(cd); b.style.cssText='background:transparent!important;padding:0!important;max-width:320px;width:100%;'; }
                            else if (cd.type==='TRENDING_SELECTOR') { b.innerHTML=buildTrendingSelectorHTML(); b.style.cssText='background:transparent!important;padding:4px!important;width:100%;'; }
                            else if (cd.type==='FLOW_BUTTONS') { b.innerHTML=buildFlowButtonsHTML(cd); b.style.cssText='background:transparent!important;padding:4px!important;width:100%;'; }
                        } catch(e) {}
                        return;
                    }
                });
            }

            function buildFlowButtonsHTML(data) {
                var btns = '<div class="cp-flow-btns">';
                (data.buttons||[]).forEach(function(btn) {
                    var cls = btn.style === 'human' ? ' human' : '';
                    btns += '<button class="cp-flow-btn'+cls+'" onclick="cpSend(\''+btn.value+'\')">'+(btn.emoji||'')+' '+btn.label+'</button>';
                });
                btns += '</div>';
                return (data.text ? '<div style="color:#fff;margin-bottom:8px;font-size:14px;">'+data.text+'</div>' : '') + btns;
            }

            function buildTrendingSelectorHTML() {
                var isJa = userLanguage==='ja';
                var title = isJa ? 'どのチェーンのトレンドプールを見ますか？🔥' : 'Which chain would you like to see trending pools for? 🔥';
                var btns = '<div class="cp-chain-grid">';
                CHAINS.forEach(function(c) { btns += '<button class="cp-chain-btn" onclick="cpSend(\'TRENDING_REQUEST:'+c.id+'\')">' + c.label + '</button>'; });
                return '<div style="color:#fff;margin-bottom:8px;font-size:14px;">'+title+'</div>'+btns+'</div>';
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
                    cH += '<div class="cp-contract-row"><span class="cp-chain-badge">'+c.chain+'</span><span class="cp-addr">'+short+'</span><button class="cp-icon-btn" onclick="cpCopy(\''+c.address+'\',this)">📋</button><a href="'+gt+'" target="_blank"><button class="cp-icon-btn">📈</button></a></div>';
                });
                var pH = '';
                (card.pools||[]).forEach(function(p) {
                    var gt = 'https://www.geckoterminal.com/'+p.network+'/pools/'+p.address;
                    pH += '<div class="cp-pool-row"><div><div class="cp-pool-name">'+p.name+'</div><div class="cp-pool-dex">'+p.dex+'</div></div><span class="cp-pool-vol">'+p.volume_24h+'</span><a href="'+gt+'" target="_blank"><button class="cp-icon-btn">📈</button></a></div>';
                });
                if (!pH) pH = '<div style="color:#9095a0;font-size:12px;">Sorry, no data</div>';
                return '<div class="cp-card"><div class="cp-card-header">'+imgH+'<div><div class="cp-coin-name">'+coin.name+'</div><div class="cp-coin-symbol">'+coin.symbol+'</div></div>'+(coin.rank?'<div class="cp-rank">#'+coin.rank+'</div>':'')+' </div><div class="cp-price-row"><span class="cp-price">'+coin.price+'</span><span class="cp-change '+cc+'">'+ca+' '+coin.change_24h+'</span></div><div class="cp-stats"><div class="cp-stat"><div class="cp-stat-label">Market Cap</div><div class="cp-stat-value">'+coin.market_cap+'</div></div><div class="cp-stat"><div class="cp-stat-label">Volume 24h</div><div class="cp-stat-value">'+coin.volume_24h+'</div></div></div>'+(cH?'<div class="cp-section"><div class="cp-section-title">Contract Addresses</div>'+cH+'</div>':'')+'<div class="cp-section"><div class="cp-section-title">Top Pools</div>'+pH+'</div><div class="cp-footer-attr">🦎 Data by <a href="https://www.coingecko.com" target="_blank">CoinGecko</a> &amp; <a href="https://www.geckoterminal.com" target="_blank">GeckoTerminal</a></div></div>';
            }

            function buildTrendingCardHTML(card) {
                var pH = '';
                if (!card.pools||!card.pools.length) { pH = '<div style="color:#9095a0;font-size:12px;padding:10px 0;">Sorry, no data</div>'; }
                else { card.pools.forEach(function(p,i) { var gt='https://www.geckoterminal.com/'+p.network+'/pools/'+p.address; var short=p.address.slice(0,6)+'...'+p.address.slice(-4); pH+='<div class="cp-trend-row"><span class="cp-trend-num">#'+(i+1)+'</span><div class="cp-trend-info"><div class="cp-trend-name">'+p.name+'</div><div class="cp-trend-meta">'+p.dex+' · '+short+' · '+p.created+'</div></div><div style="text-align:right;flex-shrink:0;"><div class="cp-trend-vol">'+p.volume_24h+'</div><a href="'+gt+'" target="_blank"><button class="cp-icon-btn" style="margin-top:4px;">📈</button></a><button class="cp-icon-btn" style="margin-top:4px;" onclick="cpCopy(\''+p.address+'\',this)">📋</button></div></div>'; }); }
                return '<div class="cp-card"><div class="cp-card-header"><span style="font-size:18px;margin-right:4px;">🔥</span><div><div class="cp-coin-name">Trending on '+card.chain+'</div><div class="cp-coin-symbol">Top 5 by Volume 24h</div></div></div><div class="cp-section">'+pH+'</div><div class="cp-footer-attr">🦎 Data by <a href="https://www.geckoterminal.com" target="_blank">GeckoTerminal</a></div></div>';
            }

            function buildDisambiguationHTML(data) {
                var bH = '';
                data.coins.forEach(function(c) { bH += '<button class="cp-disamb-btn" onclick="cpSend(\'MARKET_REQUEST:'+c.id+'\')"><span class="cp-disamb-name">'+c.name+'</span><span class="cp-disamb-symbol">'+c.symbol+'</span></button>'; });
                return '<div class="cp-disamb"><div class="cp-disamb-title">Multiple results for "'+data.query+'" — pick one:</div>'+bH+'<div class="cp-disamb-note">Can\'t find yours? Give me more details below 👇</div></div>';
            }

            function interceptResetButton(host) {
                var sr = host.shadowRoot;
                var resetBtn = sr.querySelector('button.chatbot-button.my-2.ml-2');
                if (!resetBtn || host._resetIntercepted) return;
                host._resetIntercepted = true;
                resetBtn.addEventListener('click', function() { setTimeout(function() { doFullReset(host); }, 300); });
            }

            function injectNewChatButton(host) {
                var sr = host.shadowRoot;
                var inputArea = sr.querySelector('.chatbot-input')||sr.querySelector('.w-full.flex.items-end');
                if (!inputArea || sr.querySelector('.cp-new-chat-btn')) return;
                var btn = document.createElement('button');
                btn.className = 'cp-new-chat-btn';
                btn.textContent = '🔄 Start New Chat';
                btn.onclick = function() { doFullReset(host); };
                inputArea.parentNode.insertBefore(btn, inputArea.nextSibling);
            }

            function doFullReset(host) {
                var sr = host.shadowRoot;
                var chatView = sr.querySelector('.chatbot-chat-view')||sr.querySelector('.scrollable-container');
                if (chatView) { chatView.querySelectorAll('.host-container, .guest-container').forEach(function(el){el.style.display='none';}); }
                isHumanActive = false; userLanguage = 'en'; host._resetIntercepted = false;
                var sc = sr.querySelector('.w-full.flex.flex-row.flex-wrap.px-5');
                if (sc) { sc.style.display=''; sc.querySelectorAll('.host-container').forEach(function(el){el.style.display='';}); }
                setTimeout(function() { interceptResetButton(host); }, 500);
                var nb = sr.querySelector('.cp-new-chat-btn');
                if (nb) nb.textContent = '🔄 Start New Chat';
            }

            function updateAvatarToKen(host) {
                host.shadowRoot.querySelectorAll('img[src*="Naomi"]').forEach(function(i){i.src=KEN_AVATAR;});
                host.shadowRoot.querySelectorAll('.cp-name').forEach(function(n){n.textContent=userLanguage==='ja'?'ケンくん':'Ken-kun';n.classList.add('human');});
            }

            window.cpSend = function(text) {
                var host = document.querySelector('flowise-chatbot');
                if (!host) return;
                var sr = host.shadowRoot;
                var input = sr.querySelector('textarea, input[type="text"]');
                var sendBtn = sr.querySelector('button.chatbot-button.m-0');
                if (input && sendBtn) { input.value=text; input.dispatchEvent(new Event('input',{bubbles:true})); setTimeout(function(){sendBtn.click();},50); }
            };

            window.cpCopy = function(text, btn) {
                navigator.clipboard.writeText(text).then(function(){var o=btn.textContent;btn.textContent='✅';setTimeout(function(){btn.textContent=o;},1500);});
            };

        });
    }, {timeout: 3000});
});
