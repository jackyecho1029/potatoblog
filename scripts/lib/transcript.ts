// Shared transcript fetcher via YouTube Innertube API
// Used by fetch-learning.ts, deep-analyze-gems.ts, deep-analyze-long-gems.ts

export async function fetchTranscript(videoId: string, lang = 'en'): Promise<Array<{ text: string; duration: number; offset: number }>> {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // Step 1: Get INNERTUBE_API_KEY from video page
    const htmlRes = await fetch(videoUrl);
    const html = await htmlRes.text();
    const apiKeyMatch = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/);
    if (!apiKeyMatch) throw new Error('INNERTUBE_API_KEY not found');

    // Step 2: Call player API as Android client
    const playerRes = await fetch(`https://www.youtube.com/youtubei/v1/player?key=${apiKeyMatch[1]}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            context: {
                client: { clientName: 'ANDROID', clientVersion: '20.10.38' }
            },
            videoId
        })
    });
    const playerData = await playerRes.json();

    // Step 3: Find caption track
    const tracks = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!tracks || tracks.length === 0) throw new Error('No captions found');

    let track = tracks.find((t: any) => t.languageCode === lang);
    if (!track) track = tracks.find((t: any) => t.languageCode === 'en');
    if (!track) track = tracks[0];

    const baseUrl = track.baseUrl;

    // Step 4: Fetch and parse caption XML
    const xmlRes = await fetch(baseUrl);
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
