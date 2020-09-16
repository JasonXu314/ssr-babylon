import axios from 'axios';
import { Vector3 } from 'babylonjs';
import { parse } from 'papaparse';
import Game from './test';

interface Point {
	X: number;
	Y: number;
	Z: number;
}

const canvas = document.getElementById('canvas') as HTMLCanvasElement;

(window as any).createGame = async (url: string) => {
	const { data } = await axios.get<string>(url);

	const dataArr = [data.split('\n')[1]];
	data.split('\n')
		.slice(2)
		.forEach((split) => dataArr.push(split));

	const rawData = parse(dataArr.join('\r\n'), { dynamicTyping: true, header: true });
	const chromosomeData = rawData.data.map((value: Point) => new Vector3(value.X, value.Y, value.Z)).map((pt, tag) => ({ ...pt, tag }));

	const game = new Game(canvas, chromosomeData);

	game.draw();
	return game.export();
};
