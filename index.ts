import express from 'express';
import puppeteer from 'puppeteer';

async function capture() {
	const now = Date.now();
	const browser = await puppeteer.launch({
		headless: false,
		ignoreDefaultArgs: true,
		args: ['--use-gl=desktop']
	});
	const page = await browser.newPage();

	await page.goto('http://localhost:3000/index.html');
	// await page.evaluate('window.setView(4)');
	// await page.evaluate("window.setMode('HEX_BIN')");

	await sleep(2500);

	await page.screenshot({ path: './images/example.png' });
	console.log('finished in', Date.now() - now, 'ms');
}

async function sleep(time: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, time);
	});
}

(async () => {
	const app = express();

	app.use(express.static('./public'));

	app.listen(3000, async () => {
		capture();
	});
})();
