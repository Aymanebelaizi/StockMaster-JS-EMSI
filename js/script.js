"use strict";

/**
 * LOGIQUE DE L'APPLICATION STOCKMASTER PRO
 * Conforme au Cahier des Charges EMSI
 */

// --- 1. BASE DE DONNÉES SIMULÉE ---
let db = JSON.parse(localStorage.getItem("sm_v4_final")) || {
    produits: [{ id: 1, sku: "LP-DELL", name: "Dell XPS 13", price: 15000, qty: 12, category: "PC" }],
    fournisseurs: [{ id: 1, name: "Dell MA", contact: "0600000", rating: 90 }],
    entrepots: [{ id: 1, name: "Casa Hub", location: "Casablanca", capacity: 5000 }],
    commandes: [{ id: 1, date: "2024-05-10", supplier: "Dell MA", total: 15000, status: "Livré" }],
    categories: [{ id: 1, name: "PC" }, { id: 2, name: "Accessoires" }]
};

const save = () => localStorage.setItem("sm_v4_final", JSON.stringify(db));

// --- 2. INTERNATIONALISATION (i18n) ---
const i18n = {
    fr: { 
        dashboard: "📊 Dashboard", produits: "📦 Produits", fournisseurs: "🤝 Fournisseurs", entrepots: "🏠 Entrepôts", commandes: "🛒 Commandes", categories: "🏷️ Catégories", 
        logout: "Déconnexion", search: "Rechercher...", valStock: "Valeur Stock", alerts: "Alerte Rupture", partners: "Partenaires",
        sku: "Référence", name: "Nom", price: "Prix", qty: "Quantité", category: "Catégorie", contact: "Contact", rating: "Note", 
        location: "Ville", capacity: "Capacité", date: "Date", supplier: "Fournisseur", total: "Total", status: "Statut",
        add: "Ajouter", edit: "Modifier", delete: "Supprimer", cancel: "Annuler", save: "Enregistrer"
    },
    en: { 
        dashboard: "📊 Dashboard", produits: "📦 Products", fournisseurs: "🤝 Suppliers", entrepots: "🏠 Warehouses", commandes: "🛒 Orders", categories: "🏷️ Categories", 
        logout: "Logout", search: "Search...", valStock: "Stock Value", alerts: "Low Stock", partners: "Partners",
        sku: "SKU", name: "Name", price: "Price", qty: "Qty", category: "Category", contact: "Contact", rating: "Rating", 
        location: "Location", capacity: "Capacity", date: "Date", supplier: "Supplier", total: "Total", status: "Status",
        add: "Add", edit: "Edit", delete: "Delete", cancel: "Cancel", save: "Save"
    },
    ar: { 
        dashboard: "📊 لوحة القيادة", produits: "📦 المنتجات", fournisseurs: "🤝 الموردون", entrepots: "🏠 المستودعات", commandes: "🛒 الطلبيات", categories: "🏷️ الفئات", 
        logout: "تسجيل الخروج", search: "بحث...", valStock: "قيمة المخزون", alerts: "تنبيه المخزون", partners: "شركاء",
        sku: "الرمز", name: "الاسم", price: "السعر", qty: "الكمية", category: "الفئة", contact: "الاتصال", rating: "التقييم", 
        location: "الموقع", capacity: "السعة", date: "التاريخ", supplier: "المورد", total: "المجموع", status: "الحالة",
        add: "إضافة", edit: "تعديل", delete: "حذف", cancel: "إلغاء", save: "حفظ"
    }
};

let currentPage = 1;
const itemsPerPage = 5;
let currentSort = { key: null, asc: true };
let charts = {};

// --- 3. FONCTIONS CŒUR ---
function applyLang(l) {
    const t = i18n[l];
    document.getElementById('appBody').dir = l === 'ar' ? 'rtl' : 'ltr';
    document.getElementById('nav-dashboard').innerText = t.dashboard;
    document.getElementById('nav-produits').innerText = t.produits;
    document.getElementById('nav-fournisseurs').innerText = t.fournisseurs;
    document.getElementById('nav-entrepots').innerText = t.entrepots;
    document.getElementById('nav-commandes').innerText = t.commandes;
    document.getElementById('nav-categories').innerText = t.categories;
    document.getElementById('nav-logout').innerText = t.logout;
    document.getElementById('globalSearch').placeholder = t.search;
    router(document.querySelector('.nav-active').dataset.nav);
}

function router(page) {
    currentPage = 1;
    const v = document.getElementById('viewArea');
    document.querySelectorAll('.nav-link').forEach(b => b.classList.toggle('nav-active', b.dataset.nav === page));
    const l = document.getElementById('langSelect').value;
    document.getElementById('pageTitle').innerText = i18n[l][page] || page.toUpperCase();
    v.innerHTML = "";
    if (page === 'dashboard') renderDashboard(v);
    else renderTablePage(page, v);
}

// --- 4. DASHBOARD DYNAMIQUE ---
function renderDashboard(c) {
    const l = document.getElementById('langSelect').value;
    const t = i18n[l];
    const stats = {
        val: db.produits.reduce((a,b)=>a+(b.price*b.qty),0),
        alerts: db.produits.filter(p=>p.qty<5).length,
        f: db.fournisseurs.length
    };
    c.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 animate-fade">
            <div class="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-100">
                <p class="text-[10px] font-bold opacity-70 uppercase tracking-widest">${t.valStock}</p>
                <h4 class="text-3xl font-black mt-1">${stats.val.toLocaleString()} DH</h4>
            </div>
            <div class="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-100">
                <p class="text-[10px] font-bold opacity-70 uppercase tracking-widest">${t.alerts}</p>
                <h4 class="text-3xl font-black mt-1">${stats.alerts} Unités</h4>
            </div>
            <div class="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-100">
                <p class="text-[10px] font-bold opacity-70 uppercase tracking-widest">${t.partners}</p>
                <h4 class="text-3xl font-black mt-1">${stats.f} Partenaires</h4>
            </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
            <div class="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm h-[400px]"><canvas id="ch1"></canvas></div>
            <div class="bg-white p-8 rounded-[2.5rem] shadow-sm h-[400px]"><canvas id="ch2"></canvas></div>
            <div class="bg-white p-8 rounded-[2.5rem] shadow-sm h-[400px]"><canvas id="ch3"></canvas></div>
            <div class="bg-white p-8 rounded-[2.5rem] shadow-sm h-[400px]"><canvas id="ch4"></canvas></div>
            <div class="bg-white p-8 rounded-[2.5rem] shadow-sm h-[400px]"><canvas id="ch5"></canvas></div>
        </div>`;

    setTimeout(() => {
        const opt = (title) => ({ responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: title, font: {size: 14, weight: 'bold'} } } });
        Object.values(charts).forEach(ch => ch.destroy());
        charts.c1 = new Chart(document.getElementById('ch1'), { type: 'bar', data: { labels: db.produits.map(p=>p.sku), datasets: [{ label: t.qty, data: db.produits.map(p=>p.qty), backgroundColor: '#6366f1' }] }, options: opt(t.produits) });
        charts.c2 = new Chart(document.getElementById('ch2'), { type: 'line', data: { labels: ['Jan','Fév','Mar'], datasets: [{ label: 'Ventes', data: [12, 25, 18], borderColor: '#6366f1' }] }, options: opt('Tendances') });
        charts.c3 = new Chart(document.getElementById('ch3'), { type: 'doughnut', data: { labels: ['Ok','Low'], datasets: [{ data: [db.produits.length-stats.alerts, stats.alerts], backgroundColor: ['#10b981','#f43f5e'] }] }, options: opt(t.alerts) });
        charts.c4 = new Chart(document.getElementById('ch4'), { type: 'pie', data: { labels: db.categories.map(c=>c.name), datasets: [{ data: [10, 5], backgroundColor: ['#818cf8','#fbbf24'] }] }, options: opt(t.categories) });
        charts.c5 = new Chart(document.getElementById('ch5'), { type: 'radar', data: { labels: [t.price, t.rating, t.capacity], datasets: [{ label: 'Score', data: [80, 90, 70], backgroundColor: 'rgba(99, 102, 241, 0.2)' }] }, options: opt('Audit') });
    }, 100);
}

// --- 5. GESTION DES TABLES (PAGINATION + TRI) ---
function renderTablePage(entity, c) {
    const l = document.getElementById('langSelect').value;
    const t = i18n[l];
    let data = [...db[entity]];

    if (currentSort.key) {
        data.sort((a, b) => {
            let valA = a[currentSort.key], valB = b[currentSort.key];
            return currentSort.asc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
        });
    }

    const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));
    const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const headers = Object.keys(db[entity][0] || {}).filter(k => k !== 'id');

    c.innerHTML = `
        <div class="bg-white p-10 rounded-[2.5rem] shadow-sm animate-fade">
            <div class="flex justify-between items-center mb-10">
                <h3 class="font-black text-xl italic uppercase underline decoration-indigo-200 decoration-4">${t[entity]}</h3>
                <div class="flex gap-4">
                    <button onclick="exportCSV('${entity}')" class="bg-slate-100 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest">CSV</button>
                    <button onclick="openForm('${entity}')" class="bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest">+ ${t.add}</button>
                </div>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead class="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b">
                        <tr>
                            ${headers.map(h => `<th class="p-4 cursor-pointer hover:text-indigo-600" onclick="handleSort('${entity}','${h}')">${t[h] || h} ${currentSort.key === h ? (currentSort.asc ? '▲' : '▼') : '↕'}</th>`).join('')}
                            <th class="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${paginatedData.map(item => `
                            <tr class="border-b text-sm hover:bg-slate-50 transition">
                                ${headers.map(h => `<td class="p-4 font-bold">${item[h]}</td>`).join('')}
                                <td class="p-4 text-right space-x-3">
                                    <button onclick="showDetails('${entity}', ${item.id})" class="text-indigo-600 text-[10px] font-black uppercase hover:underline">Details</button>
                                    <button onclick="openForm('${entity}', ${item.id})" class="text-amber-500 text-[10px] font-black uppercase hover:underline">${t.edit}</button>
                                    <button onclick="confirmDelete('${entity}', ${item.id})" class="text-red-400 text-[10px] font-black uppercase hover:underline">${t.delete}</button>
                                </td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>
            <div class="flex justify-between items-center mt-10">
                <p class="text-xs font-bold text-slate-400">Page ${currentPage} / ${totalPages}</p>
                <div class="flex gap-2">
                    <button onclick="changePage('${entity}', -1)" ${currentPage === 1 ? 'disabled' : ''} class="px-4 py-2 border-2 rounded-xl text-xs font-black disabled:opacity-30 tracking-widest uppercase">Précédent</button>
                    <button onclick="changePage('${entity}', 1)" ${currentPage === totalPages ? 'disabled' : ''} class="px-4 py-2 border-2 rounded-xl text-xs font-black disabled:opacity-30 tracking-widest uppercase">Suivant</button>
                </div>
            </div>
        </div>`;
}

// --- 6. ACTIONS CRUD ---
function handleSort(e, k) { currentSort = { key: k, asc: currentSort.key === k ? !currentSort.asc : true }; renderTablePage(e, document.getElementById('viewArea')); }
function changePage(e, d) { currentPage += d; renderTablePage(e, document.getElementById('viewArea')); }
function closeModal() { document.getElementById('modalContainer').classList.add('hidden'); }
function notify(m) {
    const t = document.getElementById('toast');
    document.getElementById('toastContent').innerText = m;
    t.classList.remove('translate-x-[150%]');
    setTimeout(() => t.classList.add('translate-x-[150%]'), 3000);
}

function confirmDelete(entity, id) {
    const l = document.getElementById('langSelect').value;
    const t = i18n[l];
    const modal = document.getElementById('modalContainer');
    document.getElementById('modalBox').innerHTML = `
        <div class="text-center">
            <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">⚠️</div>
            <h3 class="text-2xl font-black mb-4 italic tracking-tighter uppercase">${t.delete} ?</h3>
            <p class="text-slate-400 mb-10 text-sm font-bold">Cette action est irréversible.</p>
            <div class="flex justify-center gap-4">
                <button onclick="closeModal()" class="px-8 py-3 font-bold text-slate-400 uppercase">${t.cancel}</button>
                <button onclick="executeDelete('${entity}', ${id})" class="px-10 py-3 bg-red-600 text-white font-black rounded-2xl shadow-xl uppercase">${t.delete}</button>
            </div>
        </div>`;
    modal.classList.remove('hidden');
}

function executeDelete(e, id) {
    db[e] = db[e].filter(x => x.id !== id);
    save(); closeModal(); router(e); notify("Supprimé avec succès");
}

function openForm(entity, id = null) {
    const l = document.getElementById('langSelect').value;
    const t = i18n[l];
    const modal = document.getElementById('modalContainer');
    const box = document.getElementById('modalBox');
    const existing = id ? db[entity].find(x => x.id === id) : null;
    const fields = {
        produits: [{n:'sku', t:'text'}, {n:'name', t:'text'}, {n:'price', t:'number'}, {n:'qty', t:'number'}, {n:'category', t:'text'}],
        fournisseurs: [{n:'name', t:'text'}, {n:'contact', t:'text'}, {n:'rating', t:'number'}],
        entrepots: [{n:'name', t:'text'}, {n:'location', t:'text'}, {n:'capacity', t:'number'}],
        commandes: [{n:'date', t:'date'}, {n:'supplier', t:'text'}, {n:'total', t:'number'}, {n:'status', t:'text'}],
        categories: [{n:'name', t:'text'}]
    };

    box.innerHTML = `
        <h3 class="text-2xl font-black mb-8 italic uppercase underline decoration-indigo-200">${id ? t.edit : t.add} ${t[entity]}</h3>
        <form id="activeForm" class="space-y-4">
            ${fields[entity].map(f => `
                <div>
                    <label class="text-[9px] font-black uppercase text-slate-400 ml-1">${t[f.n] || f.n}</label>
                    <input type="${f.t}" id="f_${f.n}" value="${existing ? existing[f.n] : ''}" required 
                        class="w-full border-2 p-4 rounded-2xl outline-none focus:border-indigo-500 bg-slate-50 font-bold transition-all">
                </div>
            `).join('')}
            <div class="flex justify-end gap-4 mt-10">
                <button type="button" onclick="closeModal()" class="font-bold text-slate-400 uppercase">${t.cancel}</button>
                <button type="submit" class="px-10 py-3 bg-indigo-600 text-white font-black rounded-2xl shadow-xl uppercase">${t.save}</button>
            </div>
        </form>`;
    
    modal.classList.remove('hidden');
    document.getElementById('activeForm').onsubmit = (e) => {
        e.preventDefault();
        const newItem = { id: id || Date.now() };
        fields[entity].forEach(f => {
            const v = document.getElementById(`f_${f.n}`).value;
            newItem[f.n] = (f.t === 'number') ? parseFloat(v) : v;
        });
        if (id) {
            const idx = db[entity].findIndex(x => x.id === id);
            db[entity][idx] = newItem;
        } else db[entity].push(newItem);
        save(); closeModal(); router(entity); notify(t.save + " !");
    };
}

// --- 7. EXPORTS & UTILITAIRES ---
function exportCSV(e) {
    if(db[e].length === 0) return notify("Tableau vide !");
    const csv = [Object.keys(db[e][0]).join(","), ...db[e].map(r => Object.values(r).join(","))].join("\n");
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv'})); a.download = `StockMaster_${e}.csv`; a.click();
}

function showDetails(e, id) {
    const l = document.getElementById('langSelect').value;
    const t = i18n[l];
    const item = db[e].find(x => x.id === id);
    const v = document.getElementById('viewArea');
    v.innerHTML = `
        <div class="bg-white p-12 rounded-[2.5rem] shadow-sm max-w-2xl mx-auto animate-fade">
            <button onclick="router('${e}')" class="mb-8 text-indigo-600 font-bold uppercase tracking-widest hover:translate-x-[-5px] transition-transform inline-block">← ${t.cancel}</button>
            <div class="flex justify-between items-center mb-10">
                <h2 class="text-3xl font-black italic underline decoration-indigo-200 decoration-8">${item.name || item.sku || 'Fiche'}</h2>
                <button onclick="exportPDF('${e}', ${id})" class="bg-red-500 text-white px-8 py-3 rounded-2xl text-[10px] font-black shadow-xl uppercase tracking-widest">Export PDF</button>
            </div>
            <div class="space-y-4 border-t pt-8">
                ${Object.entries(item).filter(([k])=>k!=='id').map(([k,v]) => `<div class="flex justify-between border-b pb-2 items-center"><span class="text-slate-400 text-[10px] font-bold uppercase">${t[k] || k}</span><span class="font-black">${v}</span></div>`).join('')}
            </div>
        </div>`;
}

function exportPDF(e, id) {
    const item = db[e].find(x => x.id === id);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(20); doc.text(`FICHE : ${e.toUpperCase()}`, 20, 20);
    doc.setFontSize(10);
    Object.entries(item).filter(([k])=>k!=='id').forEach(([k,v], i) => doc.text(`${k.toUpperCase()} : ${v}`, 20, 40 + (i*10)));
    doc.save(`StockMaster_${e}_${id}.pdf`);
}

document.getElementById('loginForm').onsubmit = (e) => {
    e.preventDefault();
    if (document.getElementById('userInput').value === "admin") {
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('sidebar').classList.remove('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        router('dashboard');
    }
};

function logout() { location.reload(); }
function searchTable() {
    const term = document.getElementById('globalSearch').value.toLowerCase();
    document.querySelectorAll("tbody tr").forEach(tr => tr.style.display = tr.innerText.toLowerCase().includes(term) ? "" : "none");
}