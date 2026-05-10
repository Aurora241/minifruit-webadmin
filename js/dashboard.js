/* dashboard.js v6 */
const paymentLabel = { CASH: 'Tiền mặt', CARD: 'Thẻ', TRANSFER: 'CK' };

async function loadDashboard() {
    const [products, branches, users] = await Promise.all([
        api.get('/products'),
        api.get('/branches'),
        api.get('/users'),
    ]);

    document.getElementById('stat-products').textContent = products?.length ?? 0;
    document.getElementById('stat-branches').textContent = branches?.length ?? 0;
    document.getElementById('stat-users').textContent    = users?.length ?? 0;

    // Tính low-stock từ tồn kho thực tế (tất cả chi nhánh)
    if (branches?.length > 0) {
        const allStocks = await Promise.all(
            branches.map(b => api.get(`/inventory/stocks/${b.branchId}`))
        );
        const lowStockIds = new Set();
        allStocks.forEach(stocks => {
            (stocks || []).forEach(s => {
                if (s.currentStock <= s.minStock) {
                    lowStockIds.add(s.product?.productId ?? s.productId);
                }
            });
        });
        const lowCount = lowStockIds.size;
        const lowEl = document.getElementById('stat-lowstock');
        lowEl.textContent = lowCount;
        if (lowCount > 0) lowEl.style.color = 'var(--danger)';
    } else {
        document.getElementById('stat-lowstock').textContent = 0;
    }

    // Hóa đơn gần đây (tất cả chi nhánh)
    const orders = await api.get('/orders') || [];
    const tbody = document.getElementById('orders-table');
    if (!orders.length) {
        tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><span class="icon">📭</span><div class="empty-title">Chưa có hóa đơn</div><p>Hóa đơn sẽ xuất hiện ở đây sau khi có giao dịch.</p></div></td></tr>`;
        return;
    }
    tbody.innerHTML = orders.slice(0, 8).map(o => `
        <tr>
            <td><span class="code-chip">#${o.orderId}</span></td>
            <td>${o.branch?.branchName ?? '—'}</td>
            <td>${o.user?.fullName ?? o.user?.username ?? '—'}</td>
            <td><strong style="color:var(--primary)">${Number(o.totalAmount).toLocaleString('vi-VN')}đ</strong></td>
            <td><span class="badge badge-info badge-flat">${paymentLabel[o.paymentMethod] ?? o.paymentMethod ?? 'CASH'}</span></td>
            <td style="color:var(--text-muted);font-size:12.5px">${new Date(o.createdAt).toLocaleString('vi-VN')}</td>
        </tr>
    `).join('');
}

loadDashboard();
