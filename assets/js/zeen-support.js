(function() {
  'use strict';

  // ========== Language Detection ==========
  var isZhHk = window.location.pathname.indexOf('/zh-hk/') !== -1;

  // ========== Text Dictionary ==========
  var T = {
    title: isZhHk ? 'Zeen Support' : 'Zeen Support',
    openingMsg: isZhHk ? '有咩問題？我哋好樂意幫手。' : 'Do you have any questions? We\'re happy to help.',
    dropdownLabel: isZhHk ? '你想做啲咩？' : 'What would you like to do?',
    selectOne: isZhHk ? '請選擇' : 'Select one',
    productInquiry: isZhHk ? '產品查詢' : 'Product Inquiry',
    orderSupport: isZhHk ? '訂單支援' : 'Order Support',
    technicalHelp: isZhHk ? '技術幫助' : 'Technical Help',
    other: isZhHk ? '其他' : 'Other',
    done: isZhHk ? '確定' : 'Done',
    placeholder: isZhHk ? '輸入訊息...' : 'Type your message...',
    thinking: isZhHk ? '思考中...' : 'Thinking...',
    errorMsg: isZhHk ? '抱歉，發生錯誤，請稍後再試。' : 'Sorry, an error occurred. Please try again later.'
  };

  // ========== Agnes API Config ==========
  var API_URL = 'https://apihub.agnes-ai.cn/v1/chat/completions';
  var API_TOKEN = 'sk-KpMaxHCBJwOED51FgHIulUTIDJS15bjNr3K8wvEUdCboYRcL';
  var SYSTEM_PROMPT = [
    '=== ROLE ===',
    'You are Zeen Support, the official customer service agent for Zeen (Zeen Go).',
    'You are friendly, knowledgeable, and empathetic. Keep answers concise but thorough.',
    'Always reply in the SAME LANGUAGE the customer uses (English or Traditional Chinese 繁體中文).',
    'If a customer asks in mixed language, default to their primary language.',
    '=== CRITICAL: CONTACT INFO ===',
    'Our ONLY phone number is (00852) 3050-1862. Our ONLY email is support@gozeen.hk. Our ONLY website is gozeen.hk.',
    'DO NOT under any circumstances mention 833-FOR-ZEEN, 833-367-9336, support@localhost, or any other phone/email.',
    'If you even think about writing 833 or FOR-ZEEN, STOP immediately and use (00852) 3050-1862 instead.',
    'NEVER invent information not covered below. If you don\'t know, say: "Let me connect you with our team for that. Please call us at (00852) 3050-1862 or email support@gozeen.hk."',
    '',
    '=== PRODUCT OVERVIEW (EN / 中文) ===',
    'Zeen is a motor-free, sit-to-stand mobility device — a revolutionary alternative to wheelchairs and walkers.',
    'Zeen 是一款無電機的坐站兩用移動設備，是輪椅和助行架的革新替代品。',
    '',
    'KEY FEATURES:',
    '- Customized to your height and weight for a perfect fit (now and as needs change)',
    '- Full bodyweight lift assist — transition from sitting to standing anytime with confidence',
    '- Full centered weight support — walk or coast without fear of falling',
    '- Motor-free: no batteries, no charging, no electronics to fail',
    '- Hands-free mobility — your hands are free for daily activities',
    '- Lightweight and folding: fits in any car, ready for travel and new adventures',
    '- Compact design for indoor and outdoor use',
    '',
    '主要特點：',
    '- 按身高和體重量身訂製，完美貼合',
    '- 全身重量輔助升起，隨時從坐姿轉為站立',
    '- 全面重心承托，行走或滑行無懼跌倒',
    '- 無電機設計：無需電池、充電或電子零件',
    '- 解放雙手的行動自由',
    '- 輕巧可摺疊，適合任何車輛，便於旅行',
    '- 室內外皆適用的精巧設計',
    '',
    '=== TARGET AUDIENCE ===',
    'People with balance issues, neurological conditions, aging-related mobility challenges,',
    'or anyone who needs support transitioning from sitting to standing and walking safely.',
    'Not a medical device — a mobility aid for daily independence.',
    '',
    '=== PRICING ===',
    'Pricing is in CNY (人民币), displayed as deposit (押金) + monthly rental (月租) over 36 months.',
    'Direct customers to the 租赁下单 page (/checkout.html) for current deposit pricing.',
    '融资以租代购 available: 36期租满即送；提前退租按未租期退还剩余押金。',
    '',
    '=== TRIAL & RETURNS ===',
    '21-DAY HOME TRIAL: Try Zeen at home for 21 days with purchase.',
    'If you don\'t love it, you can return it (limited-time offer).',
    '21天在家試用：購買後可在家試用 Zeen 21 天，如不喜歡可退回（限時優惠）。',
    '',
    '=== SHIPPING ===',
    'We deliver within mainland China. For shipping timelines, tracking, or international inquiries,',
    'recommend contacting our team directly. Shipping costs and delivery times vary by location.',
    '',
    '=== WARRANTY ===',
    'Zeen comes with a manufacturer warranty. For specific warranty terms, duration, and coverage,',
    'direct customers to call (00852) 3050-1862 or visit the Help page (/pages/help.html).',
    'General guidance: warranty covers manufacturing defects under normal use.',
    '',
    '=== TRAINING & SUPPORT ===',
    'Every Zeen purchase includes training by our caring staff — you\'ll become an expert quickly.',
    'We offer demos and events (see /pages/events.html). Ongoing support is available by phone.',
    '每次購買均包含我們團隊的貼心訓練，你很快就能熟練使用。',
    '我們提供產品演示和活動（參見 /pages/events.html）。',
    '',
    '=== FAQ — COMMON QUESTIONS ===',
    '',
    'Q: How is Zeen different from a walker?',
    'A: Unlike a walker, Zeen provides full bodyweight lift assist from sitting to standing and',
    'centered weight support while walking. It\'s hands-free, so you can use your hands for daily',
    'tasks. Walkers require you to hunch over and use your arms for support; Zeen lets you walk upright.',
    '',
    'Q: 跟助行架/輪椅有什麼分別？',
    'A: Zeen 提供全身重量輔助升起和全面重心承托，讓你直立行走，雙手自由。助行架需要彎腰並用手支撐，',
    '輪椅則限制活動範圍。Zeen 是兩者的進化版。',
    '',
    'Q: Does Zeen require electricity or batteries?',
    'A: No. Zeen is completely motor-free — no batteries, no charging, no electronics. It uses',
    'a patented mechanical lift-assist system.',
    '',
    'Q: Is Zeen covered by insurance/Medicare?',
    'A: Coverage varies by plan. We recommend checking our Funding page (/pages/funding.html)',
    'or calling us at (00852) 3050-1862 for guidance on insurance and financing options.',
    '',
    'Q: Can Zeen be used outdoors?',
    'A: Yes. Zeen is designed for both indoor and outdoor use. Its sturdy wheels handle various',
    'terrains, and it folds compactly for transport.',
    '',
    'Q: How much does Zeen weigh? Is it portable?',
    'A: Zeen is lightweight and folds easily to fit in most car trunks. Exact weight varies by',
    'custom configuration. Contact us for specifications based on your build.',
    '',
    'Q: How do I order / try Zeen?',
    'A: Visit /pages/zeen.html to order, or call (00852) 3050-1862. You can also schedule a demo',
    'at /pages/events.html to try Zeen in person.',
    '',
    'Q: 可以寄到香港/台灣/其他國家嗎？',
    'A: 目前主要運送範圍為美國本土。國際運送請致電 (00852) 3050-1862 查詢最新安排。',
    '',
    '=== CUSTOMER REVIEWS ===',
    'Zeen has a 5.0 out of 5 star rating based on 11+ verified customer reviews.',
    'Customers frequently praise the life-changing mobility freedom, build quality, and support team.',
    '',
    '=== CONTACT INFO ===',
    'Phone: (00852) 3050-1862',
    'Website: gozeen.hk',
    'Email: support@gozeen.hk',
    'Contact page: /pages/contact-us.html',
    'Help center: /pages/help.html',
    '',
    '=== IMPORTANT PAGES ===',
    '/pages/zeen.html — Order Your Zeen',
    '/collections/accessories.html — Accessories',
    '/pages/events.html — Demos & Events',
    '/pages/help.html — Help Center',
    '/pages/contact-us.html — Contact Us',
    '/pages/faqs.html — Frequently Asked Questions',
    '/pages/funding.html — Funding & Insurance',
    '/pages/our-story.html — Our Story',
    '/pages/distributors.html — Distributors',
    '',
    '=== TONE GUIDELINES ===',
    '- Be warm, patient, and encouraging — many customers have mobility challenges',
    '- For English: use clear, simple language at approximately 8th-grade reading level',
    '- For Traditional Chinese: use standard Hong Kong / Taiwan Traditional Chinese (繁體中文)',
    '- If the customer seems frustrated, acknowledge their feeling first, then help',
    '- Never make medical claims — Zeen is a mobility aid, not a medical device',

    '=== TRANSFER TO HUMAN ===',
    'If the customer explicitly asks to speak with a human agent (e.g., \'转人工\', \'人工客服\', \'speak to human\'),',
    'apologize briefly, then output the following (DO NOT rephrase, output EXACTLY as shown):',
    '---',
    '已为您转接人工客服，请通过以下方式联系我们：',
    '',
    '企业微信：https://work.weixin.qq.com/ca/cawcdeeec29b926187',
    '',
    '您也可以扫描下方二维码添加客服：',
    '',
    '![](/assets/images/wecom-contact-qr.png)',
    '',
    '电话：(00852) 3050-1862',
    '电邮：support@gozeen.hk',
    '工作时间：周一至周五 9:00-18:00（香港时间）',
    '---',
    'Only provide this transfer information when the customer explicitly requests a human.',
    'For general questions, continue answering normally using the knowledge above.',
  ].join('\n');

  // ========== Session Persistence ==========
  var SESSION_KEY = 'zeen_support_state';

  function saveSession() {
    try {
      var nonSystem = [];
      for (var i = 0; i < messages.length; i++) {
        if (messages[i].role !== 'system') nonSystem.push(messages[i]);
      }
      if (nonSystem.length > 0) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(nonSystem));
      }
    } catch(e) { /* quota exceeded, silently skip */ }
  }

  function loadSession() {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch(e) { return null; }
  }

  function clearSession() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch(e) {}
  }

  // ========== Conversation History ==========
  var saved = loadSession();
  var messages = [{ role: 'system', content: SYSTEM_PROMPT }];
  if (saved) {
    for (var s = 0; s < saved.length; s++) {
      messages.push(saved[s]);
    }
  }

  // ========== Inject Styles ==========
  var style = document.createElement('style');
  style.textContent = [
    '/* Zeen Support Chat Widget */',
    '#zeen-chat-trigger {',
    '  position: fixed; bottom: 24px; right: 24px; z-index: 2147483647;',
    '  width: 56px; height: 56px; border-radius: 50%;',
    '  background: #DC2626; border: none; cursor: pointer;',
    '  box-shadow: 0 4px 12px rgba(0,0,0,0.25);',
    '  display: flex; align-items: center; justify-content: center;',
    '  transition: transform 0.2s, box-shadow 0.2s;',
    '}',
    '#zeen-chat-trigger:hover {',
    '  transform: scale(1.08); box-shadow: 0 6px 16px rgba(0,0,0,0.3);',
    '}',
    '#zeen-chat-trigger svg { width: 28px; height: 28px; fill: #fff; }',

    '#zeen-chat-panel {',
    '  position: fixed; bottom: 88px; right: 24px; z-index: 2147483646;',
    '  width: 360px; height: 500px;',
    '  background: #fff; border-radius: 12px;',
    '  box-shadow: 0 8px 32px rgba(0,0,0,0.2);',
    '  display: none; flex-direction: column;',
    '  overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
    '}',

    '#zeen-chat-header {',
    '  background: #DC2626; color: #fff; padding: 14px 16px;',
    '  display: flex; align-items: center; justify-content: space-between;',
    '  flex-shrink: 0;',
    '}',
    '#zeen-chat-header-left { display: flex; align-items: center; gap: 10px; }',
    '#zeen-chat-logo {',
    '  width: 32px; height: 32px; border-radius: 50%;',
    '  background: #DC2626; border: 2px solid #fff;',
    '  display: flex; align-items: center; justify-content: center;',
    '  font-weight: 700; font-size: 16px; color: #fff;',
    '  position: relative;',
    '}',
    '#zeen-chat-logo-dot {',
    '  position: absolute; top: -2px; right: -2px;',
    '  width: 8px; height: 8px; border-radius: 50%;',
    '  background: #22d3ee; border: 1.5px solid #DC2626;',
    '}',
    '#zeen-chat-title { font-size: 17px; font-weight: 600; }',
    '#zeen-chat-close {',
    '  background: none; border: none; color: #fff; font-size: 22px;',
    '  cursor: pointer; padding: 0; line-height: 1;',
    '  width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;',
    '  border-radius: 50%; transition: background 0.15s;',
    '}',
    '#zeen-chat-close:hover { background: rgba(255,255,255,0.2); }',

    '#zeen-chat-body {',
    '  flex: 1; overflow-y: auto; padding: 16px;',
    '  display: flex; flex-direction: column; gap: 12px;',
    '  background: #f9fafb;',
    '}',

    '.zeen-msg { max-width: 85%; padding: 10px 14px; border-radius: 14px; font-size: 14px; line-height: 1.5; word-wrap: break-word; }',
    '.zeen-msg-bot { background: #e5e7eb; color: #1f2937; align-self: flex-start; border-bottom-left-radius: 4px; }',
    '.zeen-msg-user { background: #DC2626; color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; }',

    '.zeen-opening-row {',
    '  display: flex; align-items: flex-start; gap: 10px;',
    '}',
    '.zeen-bot-avatar {',
    '  width: 28px; height: 28px; border-radius: 50%;',
    '  background: #DC2626; border: 2px solid #fff;',
    '  box-shadow: 0 1px 4px rgba(0,0,0,0.15);',
    '  display: flex; align-items: center; justify-content: center;',
    '  font-weight: 700; font-size: 12px; color: #fff;',
    '  flex-shrink: 0; position: relative;',
    '  margin-top: 2px;',
    '}',
    '.zeen-bot-avatar-dot {',
    '  position: absolute; top: -2px; right: -2px;',
    '  width: 6px; height: 6px; border-radius: 50%;',
    '  background: #22d3ee; border: 1px solid #DC2626;',
    '}',

    '.zeen-select-card {',
    '  border: 1.5px solid #d1d5db; border-radius: 10px;',
    '  padding: 14px; background: #fff;',
    '  display: flex; flex-direction: column; gap: 10px;',
    '}',
    '.zeen-select-card label {',
    '  font-size: 13px; font-weight: 500; color: #374151;',
    '}',
    '.zeen-select-card select {',
    '  width: 100%; padding: 10px 12px; border: 1.5px solid #d1d5db;',
    '  border-radius: 8px; font-size: 14px; color: #374151;',
    '  background: #fff; appearance: auto; cursor: pointer;',
    '  outline: none;',
    '}',
    '.zeen-select-card select:focus { border-color: #DC2626; }',
    '.zeen-btn-done {',
    '  align-self: flex-end; background: none; border: none;',
    '  color: #3b82f6; font-size: 14px; font-weight: 500;',
    '  cursor: pointer; padding: 6px 14px; border-radius: 6px;',
    '  transition: background 0.15s;',
    '}',
    '.zeen-btn-done:hover { background: #eff6ff; }',

    '#zeen-chat-input-area {',
    '  display: flex; align-items: center; gap: 8px;',
    '  padding: 10px 14px; border-top: 1px solid #e5e7eb;',
    '  background: #fff; flex-shrink: 0;',
    '}',
    '#zeen-chat-input {',
    '  flex: 1; border: none; outline: none; font-size: 14px;',
    '  padding: 8px 0; color: #1f2937;',
    '}',
    '#zeen-chat-input::placeholder { color: #9ca3af; }',
    '.zeen-icon-btn {',
    '  background: none; border: none; cursor: pointer;',
    '  padding: 6px; display: flex; align-items: center; justify-content: center;',
    '  color: #6b7280; border-radius: 50%; transition: background 0.15s;',
    '}',
    '.zeen-icon-btn:hover { background: #f3f4f6; }',
    '.zeen-icon-btn svg { width: 20px; height: 20px; }',

    '.zeen-typing {',
    '  align-self: flex-start; padding: 10px 14px;',
    '  background: #e5e7eb; border-radius: 14px; border-bottom-left-radius: 4px;',
    '  color: #6b7280; font-size: 13px;',
    '}',

    '@media (max-width: 420px) {',
    '  #zeen-chat-panel { width: calc(100vw - 32px); right: 16px; bottom: 80px; height: 460px; }',
    '  #zeen-chat-trigger { right: 16px; bottom: 20px; }',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  // ========== Build DOM ==========
  // Trigger button
  var trigger = document.createElement('button');
  trigger.id = 'zeen-chat-trigger';
  trigger.title = 'Zeen Support';
  trigger.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h10v2H7zm0-3h6v2H7z"/></svg>';

  // Chat panel
  var panel = document.createElement('div');
  panel.id = 'zeen-chat-panel';
  panel.innerHTML =
    '<div id="zeen-chat-header">' +
      '<div id="zeen-chat-header-left">' +
        '<div id="zeen-chat-logo">Z<div id="zeen-chat-logo-dot"></div></div>' +
        '<span id="zeen-chat-title">' + T.title + '</span>' +
      '</div>' +
      '<button id="zeen-chat-close">&times;</button>' +
    '</div>' +
    '<div id="zeen-chat-body"></div>' +
    '<div id="zeen-chat-input-area">' +
      '<input type="text" id="zeen-chat-input" placeholder="' + T.placeholder + '" />' +
      '<button class="zeen-icon-btn" id="zeen-attach-btn" title="Attach">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>' +
      '</button>' +
      '<button class="zeen-icon-btn" id="zeen-send-btn" title="Send">' +
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>' +
      '</button>' +
    '</div>';

  document.body.appendChild(trigger);
  document.body.appendChild(panel);

  // ========== Element References ==========
  var chatBody = document.getElementById('zeen-chat-body');
  var chatInput = document.getElementById('zeen-chat-input');
  var sendBtn = document.getElementById('zeen-send-btn');
  var closeBtn = document.getElementById('zeen-chat-close');
  var attachBtn = document.getElementById('zeen-attach-btn');

  // ========== Helpers ==========
  function scrollToBottom() {
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function addMessage(role, text) {
    var div = document.createElement('div');
    div.className = 'zeen-msg ' + (role === 'user' ? 'zeen-msg-user' : 'zeen-msg-bot');
    div.innerHTML = formatMessageText(text);
    chatBody.appendChild(div);
    scrollToBottom();
  }

  function formatMessageText(text) {
    var esc = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Markdown images: ![alt](url) -> <img>
    esc = esc.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
      '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;margin:8px 0;" />');

    // Absolute URLs
    esc = esc.replace(/(https?:\/\/[^\s<>"']+)/g,
      '<a href="$1" target="_blank" rel="noopener" style="color:#DC2626;text-decoration:underline;">$1</a>');

    // Site paths with .html extension
    esc = esc.replace(/(^|[\s，。：！？、；（）「」【】'])(\/[a-zA-Z0-9\/._-]+\.html)/g,
      '$1<a href="$2" style="color:#DC2626;text-decoration:underline;">$2</a>');

    // Site paths without extension (at least 3 chars, starts with letter)
    esc = esc.replace(/(^|[\s，。：！？、；（）「」【】'])(\/[a-zA-Z][a-zA-Z0-9\/_-]{2,})(?=[\s，。：！？、；（）「」【】']|$|[.,;:?!)\]])/g,
      '$1<a href="$2" style="color:#DC2626;text-decoration:underline;">$2</a>');

    // Double newlines → paragraphs
    esc = esc.replace(/\n\n/g, '</p><p>');
    // Single newlines → line breaks
    esc = esc.replace(/\n/g, '<br>');

    if (esc.indexOf('<br>') !== -1 || esc.indexOf('</p><p>') !== -1) {
      esc = '<p>' + esc + '</p>';
    }
    return esc;
  }

  function showTyping() {
    var div = document.createElement('div');
    div.className = 'zeen-typing';
    div.id = 'zeen-typing-indicator';
    div.textContent = T.thinking;
    chatBody.appendChild(div);
    scrollToBottom();
  }

  function hideTyping() {
    var el = document.getElementById('zeen-typing-indicator');
    if (el) el.remove();
  }

  function disableInput() {
    chatInput.disabled = true;
    sendBtn.disabled = true;
    sendBtn.style.opacity = '0.5';
  }

  function enableInput() {
    chatInput.disabled = false;
    sendBtn.disabled = false;
    sendBtn.style.opacity = '1';
    chatInput.focus();
  }

  // ========== API Call ==========
  function sendToAgnes(userMsg) {
    messages.push({ role: 'user', content: userMsg });

    showTyping();
    disableInput();

    fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + API_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'agnes-2.0-flash',
        messages: messages,
        max_tokens: 500
      })
    })
    .then(function(res) {
      if (!res.ok) throw new Error('API error ' + res.status);
      return res.json();
    })
    .then(function(data) {
      hideTyping();
      var reply = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content)
        ? data.choices[0].message.content
        : T.errorMsg;
      messages.push({ role: 'assistant', content: reply });
      saveSession();
      addMessage('bot', reply);
      enableInput();
    })
    .catch(function() {
      hideTyping();
      addMessage('bot', T.errorMsg);
      enableInput();
    });
  }

  // ========== Handle User Message ==========
  function handleUserMessage(text) {
    if (!text.trim()) return;
    addMessage('user', text.trim());
    sendToAgnes(text.trim());
  }

  // ========== Build Opening Screen ==========
  function buildOpeningScreen() {
    chatBody.innerHTML = '';

    // Bot avatar + opening message
    var row = document.createElement('div');
    row.className = 'zeen-opening-row';
    var avatar = document.createElement('div');
    avatar.className = 'zeen-bot-avatar';
    avatar.innerHTML = 'Z<div class="zeen-bot-avatar-dot"></div>';
    var msg = document.createElement('div');
    msg.className = 'zeen-msg zeen-msg-bot';
    msg.textContent = T.openingMsg;
    row.appendChild(avatar);
    row.appendChild(msg);
    chatBody.appendChild(row);

    // Select card
    var card = document.createElement('div');
    card.className = 'zeen-select-card';
    card.innerHTML =
      '<label>' + T.dropdownLabel + '</label>' +
      '<select id="zeen-topic-select">' +
        '<option value="">' + T.selectOne + '</option>' +
        '<option value="' + T.productInquiry + '">' + T.productInquiry + '</option>' +
        '<option value="' + T.orderSupport + '">' + T.orderSupport + '</option>' +
        '<option value="' + T.technicalHelp + '">' + T.technicalHelp + '</option>' +
        '<option value="' + T.other + '">' + T.other + '</option>' +
      '</select>' +
      '<button class="zeen-btn-done" id="zeen-done-btn">' + T.done + '</button>';
    chatBody.appendChild(card);

    // Done button handler
    document.getElementById('zeen-done-btn').addEventListener('click', function() {
      var select = document.getElementById('zeen-topic-select');
      var val = select.value;
      if (!val) return;
      addMessage('user', val);
      sendToAgnes(val);
    });

    // Clear input
    chatInput.value = '';
    scrollToBottom();
  }

  // ========== Event Listeners ==========
  // ========== Restore Session Messages to UI ==========
  function restoreSessionUI() {
    var savedMessages = loadSession();
    if (!savedMessages) return false;
    chatBody.innerHTML = '';
    for (var m = 0; m < savedMessages.length; m++) {
      var msg = savedMessages[m];
      if (msg.role === 'user') {
        addMessage('user', msg.content);
      } else if (msg.role === 'assistant') {
        addMessage('bot', msg.content);
      }
    }
    return true;
  }

  trigger.addEventListener('click', function() {
    panel.style.display = 'flex';
    trigger.style.display = 'none';
    if (!chatBody.children.length || chatBody.querySelector('.zeen-select-card')) {
      // Try to restore session before showing opening screen
      if (!chatBody.children.length && restoreSessionUI()) {
        // restored from session
      } else {
        buildOpeningScreen();
      }
    } else {
      scrollToBottom();
    }
    chatInput.focus();
  });

  closeBtn.addEventListener('click', function() {
    panel.style.display = 'none';
    trigger.style.display = 'flex';
  });

  sendBtn.addEventListener('click', function() {
    handleUserMessage(chatInput.value);
    chatInput.value = '';
  });

  chatInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUserMessage(chatInput.value);
      chatInput.value = '';
    }
  });

  attachBtn.addEventListener('click', function() {
    // Simple file picker
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf,.doc,.docx,.txt';
    input.style.display = 'none';
    input.addEventListener('change', function() {
      if (input.files && input.files[0]) {
        addMessage('user', '[Attached: ' + input.files[0].name + ']');
        sendToAgnes('[User attached a file: ' + input.files[0].name + ']');
      }
    });
    document.body.appendChild(input);
    input.click();
    setTimeout(function() { document.body.removeChild(input); }, 5000);
  });

})();
