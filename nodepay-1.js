const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    const userDataDir = "/home/runner/Nodepay/nodepay_1"; // Use the persistent profile

    const browser = await chromium.launchPersistentContext(userDataDir, {
        headless: false, // Extensions do NOT work in headless mode
        args: [
            "--disable-blink-features=AutomationControlled",
            "--no-sandbox",
            "--disable-gpu",  // Fix GPU issues
            "--disable-software-rasterizer", // Use CPU rendering
            "--disable-dev-shm-usage",  // Prevent shared memory issues
            "--start-maximized"
        ]
    });

    const page = await browser.newPage();
    await page.goto("https://app.nodepay.ai/dashboard", { waitUntil: "load" });

    console.log("Browser started with nodepay_1 profile. Waiting 10 seconds for login verification...");
    await page.waitForTimeout(10000); // Wait 10 seconds

    if (page.url() === "https://app.nodepay.ai/dashboard") {
        console.log("Login successful: URL verified.");

        // Look for the "Claim 100" button and click if found
        try {
            const claimButton = await page.locator('div:has-text("Claim 100")').first();
            if (await claimButton.isVisible()) {
                console.log("Claim 100 button found. Clicking...");
                await claimButton.click();
                console.log("Claim 100 button clicked successfully.");
            } else {
                console.log("Claim 100 button not found.");
            }
        } catch (error) {
            console.error("Error finding or clicking Claim 100 button:", error);
        }

        // Set a timeout to stop the script after 5 hours 30 minutes (19,800,000 ms)
        const runtimeLimit = 5 * 60 * 60 * 1000 + 30 * 60 * 1000; // 5h 30m in ms
        const stopTime = Date.now() + runtimeLimit;

        console.log("Script will stop after 5 hours 30 minutes...");

        // Refresh every 15 minutes (900,000 ms) using setInterval
        const refreshInterval = setInterval(async () => {
            if (Date.now() >= stopTime) {
                console.log("Runtime limit reached. Exiting...");
                clearInterval(refreshInterval); // Stop refreshing
                await browser.close();
                process.exit(0); // Exit successfully
            }

            await page.reload({ waitUntil: "load" });
            console.log("Page refreshed at: " + new Date().toISOString());
        }, 900000); // 15 minutes = 900,000 ms

    } else {
        console.log("Login failed: Unexpected URL - " + page.url());
        await browser.close();
    }

})();
