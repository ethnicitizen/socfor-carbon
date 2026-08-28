// 1. Fungsi Registrasi Service Worker untuk Akses Offline Aplikasi
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker terdaftar sukses!', reg.scope))
            .catch(err => console.log('Service Worker gagal terdaftar:', err));
    });
}

// 2. Deteksi Otomatis Status Sinyal/Koneksi Internet
function perbaruiStatusKoneksi() {
    const statusEl = document.getElementById('status-koneksi');
    if (navigator.onLine) {
        statusEl.textContent = "🟢 Sinyal Aktif (Mode Sinkronisasi)";
        statusEl.className = "inline-block mt-2 px-3 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-200 text-emerald-800";
    } else {
        statusEl.textContent = "🚀 Mode Offline (Di Dalam Hutan Adat)";
        statusEl.className = "inline-block mt-2 px-3 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500 text-white animate-pulse";
    }
}
window.addEventListener('online', perbaruiStatusKoneksi);
window.addEventListener('offline', perbaruiStatusKoneksi);
perbaruiStatusKoneksi();

// 3. Manajemen Penyimpanan Lokal (Local Storage)
function dapatkanData() {
    return JSON.parse(localStorage.getItem('karbon_kemantan_db')) || [];
}

function simpanData(data) {
    localStorage.setItem('karbon_kemantan_db', JSON.stringify(data));
    tampilkanData();
}

// 4. Kalkulator Karbon Pohon (Alometrik Chave Multi-Spesies)
function hitungDanSimpanPohon() {
    const plot = document.getElementById('p_plot').value;
    const spesies = document.getElementById('p_spesies').value;
    const keliling = parseFloat(document.getElementById('p_keliling').value);
    const bj = parseFloat(document.getElementById('p_bj').value);

    if (!plot || !spesies || !keliling || !bj) return alert("Harap isi seluruh formulir pohon!");

    const dbh = keliling / 3.14159; // Mengubah Keliling batang jadi Diameter (DBH)
    const agb = 0.11 * bj * Math.pow(dbh, 2.62); // Rumus Alometrik Utama Chave 2014
    const totalBiomassa = agb * 1.20; // Tambah 20% estimasi berat akar bawah tanah (IPCC 2006)
    const tCO2e = (totalBiomassa * 0.47 * 3.67) / 1000; // Konversi akhir dari kg ke Ton CO2e

    const entriBaru = {
        tipe: "Pohon",
        id: plot,
        detail: `${spesies} (D:${dbh.toFixed(1)}cm, BJ:${bj})`,
        hasil: tCO2e.toFixed(5)
    };

    const db = dapatkanData();
    db.push(entriBaru);
    simpanData(db);
    document.getElementById('form-pohon').reset();
    document.getElementById('p_bj').value = "0.57";
}

// 5. Kalkulator Karbon Tumbuhan Bawah (Ubinan Ilalang & Resam)
function hitungDanSimpanVegetasi() {
    const plot = document.getElementById('v_plot').value;
    const tipe = document.getElementById('v_tipe').value;
    const bbTotal = parseFloat(document.getElementById('v_bb_total').value);
    const bkSub = parseFloat(document.getElementById('v_bk_sub').value);

    if (!plot || !tipe || !bbTotal || !bkSub) return alert("Harap isi seluruh formulir ubinan!");

    const bkTotalPerM2 = (bbTotal / 100) * bkSub; // Rasio berat kering mutlak ubinan 1x1m
    const tonCHa = ((bkTotalPerM2 * 10) / 1000) * 0.47; // Konversi ke Ton Karbon per Hektar (C-Factor 47%)
    const tCO2ePerHa = tonCHa * 3.67; // Konversi akhir ke gas karbon udara (CO2e)

    const entriBaru = {
        tipe: "Tumbuhan Bawah",
        id: plot,
        detail: `${tipe} (BK M2: ${bkTotalPerM2.toFixed(1)}g)`,
        hasil: tCO2ePerHa.toFixed(5) + " /Ha"
    };

    const db = dapatkanData();
    db.push(entriBaru);
    simpanData(db);
    document.getElementById('form-vegetasi').reset();
}

// 6. Menampilkan Data ke Tabel Aplikasi
function tampilkanData() {
    const db = dapatkanData();
    const tbody = document.getElementById('tabel-database');
    tbody.innerHTML = "";

    if (db.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="p-3 text-center text-gray-400 italic">Belum ada data patroli. Aplikasi siap digunakan offline di dalam hutan Kemantan.</td></tr>`;
        return;
    }

    db.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-gray-50";
        tr.innerHTML = `
            <td class="p-2 border-b font-bold text-emerald-800">${item.id} <span class="text-[9px] font-normal text-gray-400 block">${item.tipe}</span></td>
            <td class="p-2 border-b text-gray-500">${item.detail}</td>
            <td class="p-2 border-b text-center font-mono font-bold bg-gray-50 text-gray-900">${item.hasil}</td>
        `;
        tbody.appendChild(tr);
            });
}

// 7. Ekspor Cache Menjadi File .CSV (Untuk Excel Pengelola)
function eksporKeCSV() {
    const db = dapatkanData();
    if (db.length === 0) return alert("Data kosong, tidak dapat mengekspor!");

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID Plot,Kategori,Detail Pengukuran Lapangan,Hasil Karbon (tCO2e)\n";

    db.forEach(item => {
        csvContent += `"${item.id}","${item.tipe}","${item.detail}","${item.hasil}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Logbook_Karbon_Tigo_Luhah_Kemantan.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 8. Reset Database
function hapusSemuaData() {
    if (confirm("Hapus semua data tersimpan? Pastikan data penting sudah diunduh ke Excel.")) {
        localStorage.removeItem('karbon_kemantan_db');
        tampilkanData();
    }
}

tampilkanData();
