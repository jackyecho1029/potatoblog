
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());

const VIDEO_URL = process.argv[2] || 'https://www.youtube.com/watch?v=IsqYueUPojk';

(async () => {
    // Determine profile path (reusing X profile for auth/cookies if helpful, or just standard)
    // Actually, for public videos, no auth should be needed, just stealth.
    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-blink-features=AutomationControlled' // Extra stealth
        ]
    });

    try {
        const page = await browser.newPage();

        // Anti-detection: User Agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log(`Navigating to ${VIDEO_URL}...`);
        await page.goto(VIDEO_URL, { waitUntil: 'networkidle2', timeout: 60000 });

        // 1. Get Title
        await page.waitForSelector('h1.style-scope.ytd-watch-metadata', { timeout: 10000 });
        const title = await page.$eval('h1.style-scope.ytd-watch-metadata', el => el.textContent.trim());
        console.log('Title:', title);

        // 2. Expand Description
        try {
            const expandBtn = await page.$('#expand');
            if (expandBtn) {
                await expandBtn.click();
                await new Promise(r => setTimeout(r, 1000)); // Wait for expansion
            }
        } catch (e) {
            console.log('Could not click expand (maybe already expanded or different layout)');
        }

        // 3. Get Description
        const description = await page.$eval('#description-inline-expander', el => el.innerText.trim())
            .catch(() => "Description not found.");

        const channel = await page.$eval('#text.style-scope.ytd-channel-name', el => el.textContent.trim())
            .catch(() => "Unknown Channel");

        // 4. Output Result
        const result = {
            title,
            channel,
            description,
            url: VIDEO_URL
        };

        fs.writeFileSync('youtube_meta.json', JSON.stringify(result, null, 2));
        console.log('Successfully saved metadata to youtube_meta.json');

    } catch (e) {
        console.error('Error during scraping:', e);
    } finally {
        await browser.close();
    }
})();
