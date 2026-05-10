/* v2 */
const BASE_URL = 'https://minifruit-backend-production-f318.up.railway.app/api';
function getToken() {
    return localStorage.getItem('token');
}

function getIndexPath() {
    return '/index.html';
}

async function request(method, path, body = null) {
    const token = getToken();
    const opts = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    if (body) opts.body = JSON.stringify(body);
    try {
        const res = await fetch(BASE_URL + path, opts);
        if (res.status === 401 || res.status === 403) {
            localStorage.clear();
            window.location.href = getIndexPath();
            return;
        }
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            console.error(`API ${method} ${path} →`, res.status, err);
            return null;
        }
        if (res.status === 204) return true;
        return res.json();
    } catch (e) {
        console.error('API Error:', e);
    }
}

const api = {
    get:    (path)        => request('GET',    path),
    post:   (path, body)  => request('POST',   path, body),
    put:    (path, body)  => request('PUT',    path, body),
    patch:  (path, body)  => request('PATCH',  path, body),
    delete: (path)        => request('DELETE', path),
};