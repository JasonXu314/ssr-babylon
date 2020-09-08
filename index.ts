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

	await sleep(2500);

	// const res = (await page.evaluate('window.exportScene()')) as string;
	// console.log(res);
	// await browser.close();
	const res = await page.evaluate("window.createGame('https://raw.githubusercontent.com/debugpoint136/chromosome-3d/master/IMR90_chr07-0-159Mb.csv')");
	console.log(res);
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
