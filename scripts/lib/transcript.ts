// Shared transcript fetcher via YouTube Innertube API
// Used by fetch-learning.ts, deep-analyze-gems.ts, deep-analyze-long-gems.ts

// Optional proxy (local dev behind a VPN; CI runs direct). Must be set before any fetch.
const PROXY_URL = process.env.https_proxy || process.env.HTTPS_PROXY || process.env.http_proxy || process.env.HTTP_PROXY;
if (PROXY_URL) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const undici = require('undici');
        undici.setGlobalDispatcher(new undici.ProxyAgent(PROXY_URL));
    } catch { /* undici unavailable — fall back to direct */ }
}

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

// Try multiple clients — ANDROID alone sometimes returns no captions; WEB/MWEB as fallback.
const CLIENTS = [
    { clientName: 'ANDROID', clientVersion: '20.10.38' },
    { clientName: 'WEB', clientVersion: '2.20240101.00.00' },
    { clientName: 'MWEB', clientVersion: '2.20240101.08.00' },
];

export async function fetchTranscript(videoId: string, lang = 'en'): Promise<Array<{ text: string; duration: number; offset: number }>> {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}&hl=en&gl=US`;

    // Step 1: Get INNERTUBE_API_KEY from the video page (browser UA avoids consent/bot page)
    const htmlRes = await fetch(videoUrl, {
        headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' },
    });
    const html = await htmlRes.text();
    const apiKeyMatch = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/);
    if (!apiKeyMatch) throw new Error('INNERTUBE_API_KEY not found (page may be consent/bot-blocked)');

    // Step 2: Try each client until one returns caption tracks
    let tracks: any[] | undefined;
    let lastErr: any = null;
    for (const client of CLIENTS) {
        try {
            const playerRes = await fetch(`https://www.youtube.com/youtubei/v1/player?key=${apiKeyMatch[1]}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'User-Agent': UA },
                body: JSON.stringify({ context: { client }, videoId }),
            });
            const raw = await playerRes.text();
            // Strip control chars that break JSON.parse (manual-add-video.py parity)
            const clean = raw.replace(/[\x00-\x1f\x7f]/g, ' ');
            const playerData = JSON.parse(clean);
            const t = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
            if (t && t.length > 0) { tracks = t; break; }
            lastErr = new Error(`No captions for client ${client.clientName}`);
        } catch (e: any) {
            lastErr = e;
        }
    }
    if (!tracks || tracks.length === 0) {
        throw new Error('No captions found: ' + (lastErr?.message || 'unknown'));
    }

    let track = tracks.find((t: any) => t.languageCode === lang);
    if (!track) track = tracks.find((t: any) => t.languageCode === 'en');
    if (!track) track = tracks[0];

    const baseUrl = track.baseUrl;

    // Step 3: Fetch and parse caption XML
    const xmlRes = await fetch(baseUrl, { headers: { 'User-Agent': UA } });
    const xml = await xmlRes.text();

    const entries: Array<{ text: string; duration: number; offset: number }> = [];

    // Try <p><s> format first (YouTube's default srv3 format)
    const pRegex = /<p\s[^>]*?t="(\d+)"[^>]*?d="(\d+)"[^>]*>(.*?)<\/p>/g;
    let pMatch;
    while ((pMatch = pRegex.exec(xml)) !== null) {
        const offset = parseInt(pMatch[1]);
        const duration = parseInt(pMatch[2]);
        const inner = pMatch[3];
        const words = inner.match(/<s[^>]*>([^<]*)<\/s>/g);
        const text = words
            ? words.map(w => w.replace(/<s[^>]*>/, '').replace(/<\/s>/, '')).join(' ').trim()
            : inner.replace(/<[^>]+>/g, '').trim();
        if (text) entries.push({ text, duration, offset });
    }

    // Fallback: try <text> format
    if (entries.length === 0) {
        const textRegex = /<text[^>]*\bstart="([^"]*)"[^>]*\bdur="([^"]*)"[^>]*>([\s\S]*?)<\/text>/g;
        let tMatch;
        while ((tMatch = textRegex.exec(xml)) !== null) {
            const offset = Math.round(parseFloat(tMatch[1]) * 1000);
            const duration = Math.round(parseFloat(tMatch[2]) * 1000);
            const text = tMatch[3]
                .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
                .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\n/g, ' ').trim();
            if (text) entries.push({ text, duration, offset });
        }
    }

    if (entries.length === 0) throw new Error('Transcript XML parsing returned empty');
    return entries;
}

// Convenience: fetch transcript as plain text
export async function fetchTranscriptText(videoId: string, lang = 'en', maxChars = 25000): Promise<string> {
    const items = await fetchTranscript(videoId, lang);
    return items.map(item => item.text).join(' ').substring(0, maxChars);
}
