/* Zeen 客户管理后台 - 共享 JS */
var ADMIN = {
  token: null,
  user: null,

  init: function () {
    this.token = localStorage.getItem('zeen_admin_token');
    var u = localStorage.getItem('zeen_admin_user');
    if (u) { try { this.user = JSON.parse(u); } catch (e) { this.user = null; } }
  },

  login: function (token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem('zeen_admin_token', token);
    localStorage.setItem('zeen_admin_user', JSON.stringify(user));
  },

  logout: function () {
    this.token = null;
    this.user = null;
    localStorage.removeItem('zeen_admin_token');
    localStorage.removeItem('zeen_admin_user');
    window.location.href = '/admin/login.html';
  },

  // 统一请求，自动带 token，401 时跳登录
  request: function (path, options) {
    var opts = options || {};
    var headers = opts.headers || {};
    headers['Content-Type'] = 'application/json';
    if (this.token) headers['Authorization'] = 'Bearer ' + this.token;
    return fetch(path, Object.assign({}, opts, { headers: headers }))
      .then(function (res) {
        if (res.status === 401) {
          ADMIN.logout();
          throw new Error('登录已失效');
        }
        return res.json();
      });
  },

  get: function (path) { return this.request(path, { method: 'GET' }); },
  post: function (path, body) { return this.request(path, { method: 'POST', body: JSON.stringify(body || {}) }); },
  put: function (path, body) { return this.request(path, { method: 'PUT', body: JSON.stringify(body || {}) }); },
  del: function (path) { return this.request(path, { method: 'DELETE' }); },

  // 需要登录的页面入口调用
  requireLogin: function () {
    this.init();
    if (!this.token) { window.location.href = '/admin/login.html'; return false; }
    return true;
  },

  renderTopbar: function (active) {
    var role = this.user ? this.user.role : '';
    var nav = [
      { key: 'dashboard', label: '订单列表', href: '/admin/dashboard.html' },
      { key: 'new', label: '录入订单', href: '/admin/order-new.html' },
    ];
    // 仅 admin 显示财务统计与账号管理
    if (role === 'admin') {
      nav.push({ key: 'finance', label: '财务统计', href: '/admin/finance.html' });
      nav.push({ key: 'accounts', label: '账号管理', href: '/admin/accounts.html' });
    }
    var html = '<div class="admin-topbar">';
    html += '<div class="brand">Zeen <span>客户管理后台</span></div>';
    html += '<div class="nav">';
    nav.forEach(function (n) {
      html += '<a href="' + n.href + '"' + (n.key === active ? ' class="active"' : '') + '>' + n.label + '</a>';
    });
    html += '</div>';
    html += '<div class="user">' + (this.user ? this.user.name || this.user.username : '') +
      '（' + (this.user ? this.user.role : '') + '）<button onclick="ADMIN.logout()">退出</button></div>';
    html += '</div>';
    return html;
  },

  roleLabel: function (r) {
    return { admin: '管理员', dealer: '经销商', support: '客服' }[r] || r;
  },

  sourceLabel: function (s) {
    return { online: '官网在线', dealer: '经销商', manual: '客服转账' }[s] || s;
  },

  statusLabel: function (s) {
    return { new: '新订单', processing: '处理中', shipped: '已发货', completed: '已完成', cancelled: '已取消' }[s] || s;
  },

  statusBadge: function (s) {
    var map = { new: 'badge-blue', processing: 'badge-orange', shipped: 'badge-green', completed: 'badge-green', cancelled: 'badge-gray' };
    return '<span class="badge ' + (map[s] || 'badge-gray') + '">' + this.statusLabel(s) + '</span>';
  },

  payBadge: function (p) {
    if (!p || !p.status) return '<span class="badge badge-gray">-</span>';
    if (p.status === 'paid') return '<span class="badge badge-green">已支付</span>';
    if (p.status === 'pending') return '<span class="badge badge-orange">待支付</span>';
    if (p.status === 'refunded') return '<span class="badge badge-red">已退款</span>';
    return '<span class="badge badge-gray">' + p.status + '</span>';
  },

  money: function (v, c) {
    var n = Number(v) || 0;
    return (c || 'USD') === 'HKD' ? 'HK$' + n.toFixed(2) : '$' + n.toFixed(2);
  },

  esc: function (s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },
};

ADMIN.init();
