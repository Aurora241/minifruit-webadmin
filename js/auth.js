function saveAuth(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    localStorage.setItem('role', data.role);
    localStorage.setItem('branchId', data.branchId);
}

function getUser() {
    return {
        username: localStorage.getItem('username'),
        role: localStorage.getItem('role'),
        branchId: localStorage.getItem('branchId'),
    };
}

function getIndexPath() {
    const depth = window.location.pathname.split('/').length - 2;
    return depth > 1 ? '../'.repeat(depth - 1) + 'index.html' : './index.html';
}

function logout() {
    const loginUrl = localStorage.getItem('loginUrl') || './index.html';
    localStorage.clear();
    window.location.href = loginUrl;
}

function requireAuth() {
    if (!localStorage.getItem('token')) {
        const loginUrl = localStorage.getItem('loginUrl') || './index.html';
        window.location.href = loginUrl;
    }
}

function buildSidebar() {
    const role = localStorage.getItem('role');
    const isPages = window.location.pathname.includes('/pages/');
    const base = isPages ? '../' : './';

    const allMenus = [
        { icon: '📊', label: 'Dashboard',    href: base + 'dashboard.html',       roles: ['ADMIN','MANAGER'] },
        { icon: '🛒', label: 'Sản phẩm',     href: base + 'pages/products.html',  roles: ['ADMIN'] },
        { icon: '📦', label: 'Kho hàng',     href: base + 'pages/inventory.html', roles: ['ADMIN','MANAGER','WAREHOUSE'] },
        { icon: '🧾', label: 'Hóa đơn',      href: base + 'pages/orders.html',    roles: ['ADMIN','MANAGER','STAFF'] },
        { icon: '👥', label: 'Người dùng',   href: base + 'pages/users.html',     roles: ['ADMIN'] },
        { icon: '🏪', label: 'Chi nhánh',    href: base + 'pages/branches.html',  roles: ['ADMIN'] },
    ];

    const items = allMenus.filter(m => m.roles.includes(role));
    const currentPath = window.location.pathname;

    const nav = document.getElementById('sidebar-nav');
    if (!nav) return;

    nav.innerHTML = items.map(item => {
        const active = currentPath.endsWith(
            item.href.replace(/^\.\.\//, '/').replace(/^\.\//, '/')
        );
        return `<a class="nav-item ${active ? 'active' : ''}" href="${item.href}">
            <span class="icon">${item.icon}</span> ${item.label}
        </a>`;
    }).join('');
}

function initUser() {
    const user = getUser();
    const el = (id) => document.getElementById(id);
    if (el('display-name')) el('display-name').textContent = user.username;
    if (el('display-role')) el('display-role').textContent = user.role;
    if (el('avatar')) el('avatar').textContent = (user.username || 'U')[0].toUpperCase();
}