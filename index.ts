import express from 'express';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { v4 as uuid } from 'uuid';

interface GLTFData {
	gltf: any;
	bin: number[];
}

async function capture(url: string): Promise<GLTFData> {
	const now = Date.now();
	const browser = await puppeteer.launch({
		headless: false,
		ignoreDefaultArgs: true,
		args: ['--use-gl=desktop', '--shm-size=8gb']
	});
	const page = await browser.newPage();

	await page.goto('http://localhost:3000/index.html');

	const res = (await page.evaluate((url) => (window as any).createGame(url), url)) as GLTFData;
	console.log('finished in', Date.now() - now, 'ms');
	await page.close();
	await browser.close();
	return res;
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

	app.post('/load', async (req, res) => {
		console.log('Recieved Request');
		const url = req.query.url as string | undefined;

		if (!url) {
			res.status(400).send('Must include url as query string');
			return;
		} else {
			const data = await capture(url);

			const id = uuid();
			fs.writeFileSync(path.resolve(__dirname, 'files', id + '.gltf'), data.gltf.replace('scene.bin', `${id}.bin`));
			fs.writeFileSync(path.resolve(__dirname, 'files', id + '.bin'), Uint8Array.from(data.bin));
			res.status(200).send(id);
			return;
		}
	});

	app.get('/files/:id', async (req, res) => {
		const fileName = req.params.id;

		res.sendFile(path.resolve(__dirname, 'files', fileName));
	});

	app.listen(3000, async () => {
		console.log('Server Listening');
	});
})();
