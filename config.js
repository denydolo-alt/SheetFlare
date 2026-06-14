// ==========================================
// PENGATURAN DATABASE & SISTEM UTAMA
// ==========================================

// Biarkan SCRIPT_URL menunjuk ke domain Bos sendiri
// Cloudflare _worker.js yang akan menangani sisanya
const SCRIPT_URL = window.location.origin + "/";
window.SCRIPT_URL = SCRIPT_URL; 

const SHEET_ID = "1wmksvipdpkEZFLrCzciR-r3AMD-ypTvdcMACRyywueI/edit?usp=drivesdk";
window.SHEET_ID = SHEET_ID;

// ==========================================
// 🎯 RADAR AFFILIATE GLOBAL
// ==========================================
(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
        localStorage.setItem('melimpah_affiliate', refCode.trim());
    }
})();
