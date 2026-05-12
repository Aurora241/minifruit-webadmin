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
            const text = await res.text().catch(() => '');
            let err = {};
            try { err = JSON.parse(text); } catch { err = { message: text }; }
            console.error(`API ${method} ${path} →`, res.status, err.message ?? text);
            return null;
        }
        if (res.status === 204) return true;
        const text = await res.text();
        if (!text) return true;
        try { return JSON.parse(text); } catch { return null; }
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
    upload: async (path, formData) => {
        const token = getToken();
        try {
            const res = await fetch(BASE_URL + path, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });
            if (res.status === 401 || res.status === 403) {
                localStorage.clear(); window.location.href = '/index.html'; return;
            }
            if (!res.ok) {
                const text = await res.text().catch(() => '');
                console.error(`UPLOAD ${path} →`, res.status, text);
                return null;
            }
            const text = await res.text();
            if (!text) return true;
            try { return JSON.parse(text); } catch { return null; }
        } catch (e) { console.error('Upload error:', e); }
    },
};