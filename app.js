// 1. Registrasi Service Worker untuk Akses Offline 100%
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('SW Terdaftar Berhasil!', reg.scope))
            .catch(err => console.log('SW Gagal:', err));
    });
}

// 2. Navigasi Perpindahan Menu Tab Aplikasi
function pindahTab(pilihan) {
    const pLapangan = document.getElementById('panel-lapangan');
    const pSpasial = document.getElementById('panel-spasial');
    const btnLapangan = document.getElementById('tab-lapangan-btn');
    const btnSpasial = document.getElementById('tab-spasial-btn');

    if (pilihan === 'lapangan') {
        pLapangan.classList.remove('hidden');
        pSpasial.classList.add('hidden');
        btnLapangan.className = "w-full py-3 text-center border-b-2 border-emerald-700 text-emerald-800 cursor-pointer";
        btnSpasial.className = "w-full py-3 text-center border-b-2 border-transparent hover:text-emerald-700 cursor-pointer";
    } else {
        pLapangan.classList.add('hidden');
        pSpasial.classList.remove('hidden');
        btnLapangan.className = "w-full py-3 text-center border-b-2 border-transparent hover:text-emerald-700 cursor-pointer";
        btnSpasial.className = "w-full py-3 text-center border-b-2 border-blue-800 text-blue-900 cursor-pointer";
    }
}

// 3. Deteksi Sinyal Internet Komunitas
function perbaruiStatusKoneksi() {
    const statusEl = document.getElementById('status-koneksi');
    if (navigator.onLine) {
        statusEl.textContent = "🟢 Sinyal Terhubung (Sinkronisasi Portal)";
        statusEl.className = "inline-block mt-2 px-3 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-200 text-emerald-800";
    } else {
        statusEl.textContent = "🚀 Mode Offline Hutan Adat Aktif";
        statusEl.className = "inline-block mt-2 px-3 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500 text-white animate-pulse";
    }
}
window.addEventListener('online', perbaruiStatusKoneksi);
window.addEventListener('offline', perbaruiStatusKoneksi);
perbaruiStatusKoneksi();

// 4. Membaca & Menyimpan Data Cache Lokal
function dapatkanData() {
    return JSON.parse(localStorage.getItem('karbon_kemantan_db')) || [];
}

function simpanData(data) {
    localStorage.setItem('karbon_kemantan_db', JSON.stringify(data));
    tampilkanData();
}

// 5. Rumus Hitung Sensus Pohon (Strata 1 & 2)
function hitungDanSimpanPohon() {
    const plot = document.getElementById('p_plot').value;
    const spesies = document.getElementById('p_spesies').value;
    const keliling = parseFloat(document.getElementById('p_keliling').value);
    const bj = parseFloat(document.getElementById('p_bj').value);

    if (!plot || !spesies || !keliling || !bj) return alert("Form pohon belum lengkap!");

    const dbh = keliling / 3.14159;
    const agb = 0.11 * bj * Math.pow(dbh, 2.62); // Persamaan Alometrik Chave et al. (2014)
    const totalBiomassa = agb * 1.20; // Faktor Akar BGB IPCC (2006)
    const tCO2e = (totalBiomassa * 0.47 * 3.67) / 1000;

    const entriBaru = {
        tipe: "Lapangan (Pohon)",
        id: plot,
        detail: `${spesies} (Keliling: ${keliling}cm, BJ: ${bj})`,
        hasil: tCO2e.toFixed(5)
    };

    const db = dapatkanData();
    db.push(entriBaru);
    simpanData(db);
    document.getElementById('form-pohon').reset();
    document.getElementById('p_bj').value = "0.57";
}

// 6. Rumus Hitung Ubinan Ilalang (Strata 3)
function hitungDanSimpanVegetasi() {
    const plot = document.getElementById('v_plot').value;
    const tipe = document.getElementById('v_tipe').value;
    const bbTotal = parseFloat(document.getElementById('v_bb_total').value);
    const bkSub = parseFloat(document.getElementById('v_bk_sub').value);

    if (!plot || !tipe || !bbTotal || !bkSub) return alert("Form ubinan belum lengkap!");

    const bkTotalPerM2 = (bbTotal / 100) * bkSub;
    const tonCHa = ((bkTotalPerM2 * 10) / 1000) * 0.47; // C-Factor 47%
    const tCO2ePerHa = tonCHa * 3.67;

    const entriBaru = {
        tipe: "Lapangan (Ubinan)",
        id: plot,
        detail: `${tipe} (Berat Kering M2: ${bkTotalPerM2.toFixed(1)}g)`,
        hasil: tCO2ePerHa.toFixed(5) + " /Ha"
    };

    const db = dapatkanData();
    db.push(entriBaru);
    simpanData(db);
    document.getElementById('form-vegetasi').reset();
}

// 7. [MODUL BARU] Logika Simpan Log Kontrol Spasial & MRV
function simpanLogSpasial() {
    const tahun = document.getElementById('s_tahun').value;
    const sumber = document.getElementById('s_sumber').value;
    const cBatas = document.getElementById('c_batas').checked ? "LULUS" : "BELUM";
    const cDefor = document.getElementById('c_defor').checked ? "LULUS" : "BELUM";
    const cBocor = document.getElementById('c_kebocoran').checked ? "LULUS" : "BELUM";

    if (!sumber) return alert("Mohon isi sumber data satelit!");

    const entriBaru = {
        tipe: "Spasial (MRV Log)",
        id: `MRV-${tahun}`,
        detail: `Sensor: ${sumber} | Cek Batas: ${cBatas}, Deforestasi: ${cDefor}, Kebocoran TNKS: ${cBocor}`,
        hasil: "Verified Checklist"
    };

    const db = dapatkanData();
    db.push(entriBaru);
    simpanData(db);
    document.getElementById('form-spasial').reset();
}

// 8. Tampilkan Seluruh Data Gabungan ke Tabel Web
function tampilkanData() {
    const db = dapatkanData();
    const tbody = document.getElementById('tabel-database');
    tbody.innerHTML = "";

    if (db.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="p-3 text-center text-gray-400 italic">Belum ada rekaman data tersimpan di HP.</td></tr>`;
        return;
    }

    db.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-gray-50 border-b text-gray-700";
        tr.innerHTML = `
            <td class="p-2 font-bold text-emerald-900">${item.id} <span class="text-[9px] font-normal text-gray-400 block">${item.tipe}</span></td>
            <td class="p-2 text-gray-500">${item.detail}</td>
            <td class="p-2 text-center font-mono font-bold bg-gray-50">${item.hasil}</td>
        `;
        tbody.appendChild(tr);
    });
}

// 9. Ekspor CSV Gabungan Lapangan + Spasial Siap Pakai di Excel
function eksporKeCSV() {
    const db = dapatkanData();
    if (db.length === 0) return alert("Data kosong!");

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID Pengukuran,Kategori Modul,Detail Pengukuran/Verifikasi,Metrik Hasil Akhir\n";

    db.forEach(item => {
        csvContent += `"${item.id}","${item.tipe}","${item.detail}","${item.hasil}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Logbook_Karbon_Lengkap_Kemantan.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 10. Reset Database Cache
function hapusSemuaData() {
    if (confirm("Hapus semua data di HP? Pastikan file CSV sudah Anda amankan.")) {
        localStorage.removeItem('karbon_kemantan_db');
        tampilkanData();
    }
}

tampilkanData();
