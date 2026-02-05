import { YoutubeTranscript } from 'youtube-transcript';

async function getTranscript() {
    console.log('Starting fetch for iuFm5sxAhWI...');
    try {
        const transcript = await YoutubeTranscript.fetchTranscript('iuFm5sxAhWI');
        if (!transcript || transcript.length === 0) {
            console.log('No transcript found.');
            return;
        }
        const text = transcript.map(t => t.text).join(' ');
        console.log('TRANSCRIPT_START');
        console.log(text);
        console.log('TRANSCRIPT_END');
    } catch (error) {
        console.error('FETCH_ERROR:', error);
    }
}

getTranscript();
