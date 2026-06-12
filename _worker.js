/**
 * SHEETFLARE TURBO WORKER v15.2 (PERMANENT CACHE EDITION)
 * Kecepatan 100% Stabil. Cache tidak akan pernah expired!
 */

const GAS_URL="https://script.google.com/macros/s/AKfycbwtixGFSoTkxZLUUjzKTpgFr4Y75CdB5Ov4eKSRb1SbkZHQ1jG_63Dekx3dJG3cCm6qfQ/exec";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'POST') {
      try {
        const bodyText = await request.text();
        let bodyJson = null;
        try { bodyJson = JSON.parse(bodyText); } catch(e){}

        const headersToForward = { 'Content-Type': 'text/plain' };
        if (request.headers.get('x-callback-signature')) headersToForward['x-callback-signature'] = request.headers.get('x-callback-signature'); 
        if (request.headers.get('x-callback-token')) headersToForward['x-callback-token'] = request.headers.get('x-callback-token'); 
        if (request.headers.get('x-duitku-signature')) {
            headersToForward['x-duitku-signature'] = request.headers.get('x-duitku-signature');
            headersToForward['x-duitku-timestamp'] = request.headers.get('x-duitku-timestamp');
            headersToForward['x-duitku-merchantcode'] = request.headers.get('x-duitku-merchantcode');
        }

        // 🛡️ JALUR WEBHOOK / TRANSAKSI (TIDAK BOLEH CACHE)
        if (!bodyJson || bodyJson.action === 'create_order' || bodyJson.action === 'validate_coupon' || request.headers.get('x-callback-signature') || request.headers.get('x-callback-token') || request.headers.get('x-duitku-signature')) {
            return await fetch(GAS_URL, { method: 'POST', headers: headersToForward, body: bodyText });
        }

        // ⚡ JALUR TURBO KV (AMBIL DATA PRODUK / SETTINGS)
        if (bodyJson.action === 'get_product' || bodyJson.action === 'get_global_settings' || bodyJson.action === 'get_products') {
          let cacheKey = bodyJson.action;
          if (bodyJson.id) cacheKey += `_${bodyJson.id}`;
          if (bodyJson.aff_id) cacheKey += `_aff_${bodyJson.aff_id}`;

          // CEK MEMORI KV
          if(env.SHEETFLARE_KV && !bodyJson.refresh) {
            const cached = await env.SHEETFLARE_KV.get(cacheKey);
            if (cached) return new Response(cached, { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
          }

          // JIKA KOSONG / REFRESH, AMBIL KE GAS
          const gasRes = await fetch(GAS_URL, { method: 'POST', headers: headersToForward, body: bodyText });
          const gasData = await gasRes.text();

          // 🔥 PERBAIKAN: SIMPAN KE KV SECARA ABADI (HILANGKAN WAKTU EXPIRED) 🔥
          if(env.SHEETFLARE_KV) ctx.waitUntil(env.SHEETFLARE_KV.put(cacheKey, gasData));

          return new Response(gasData, { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }

        return await fetch(GAS_URL, { method: 'POST', headers: headersToForward, body: bodyText });

      } catch (err) {
        return new Response(JSON.stringify({status: "error", message: err.message}), { status: 500 });
      }
    }

    // GET REQUESTS (ASSETS DLL)
    let response = await env.ASSETS.fetch(request);
    if (url.pathname === '/' || url.pathname === '') return response;
    if (response.status !== 404) return response;

    if (!url.pathname.includes('.')) {
       let htmlUrl = new URL(url.pathname + '.html', url.origin);
       let htmlResponse = await env.ASSETS.fetch(new Request(htmlUrl, request));
       if (htmlResponse.status !== 404) return htmlResponse;
    }
    
    return response;
  }
};
