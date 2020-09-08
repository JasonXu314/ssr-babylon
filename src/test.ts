import { Color3, Engine, HemisphericLight, Light, Mesh, MeshBuilder, Scene, SolidParticleSystem, StandardMaterial, UniversalCamera, Vector3 } from 'babylonjs';
import { GLTF2Export } from 'babylonjs-serializers';

interface InterestPoint {
	x: number;
	y: number;
	z: number;
	tag: number;
}

interface FlagData {
	locus: {
		start: number;
		end: number;
		chr: string;
	};
	strand: string;
	name: string;
	value: number;
}

interface SplinePath {
	init: InterestPoint[];
	current: InterestPoint[];
}

export const splinePath: SplinePath = {
	init: [],
	current: []
};

export default class Game {
	private canvas: HTMLCanvasElement;
	private engine: Engine;
	private scene: Scene;

	private light: Light;
	private unicam: UniversalCamera;

	constructor(canvas: HTMLCanvasElement, sd: InterestPoint[]) {
		this.canvas = canvas;
		this.engine = new Engine(this.canvas, true);
		this.scene = new Scene(this.engine);

		this.light = new HemisphericLight('light', new Vector3(0, 1, 0), this.scene);
		this.unicam = new UniversalCamera('unicam', new Vector3(0, 0, -10000), this.scene);

		createParticle(sd, this.scene);
	}

	public draw(): void {
		this.scene.render();
	}

	public async export(): Promise<any> {
		console.log('have res');
		const res = await GLTF2Export.GLTFAsync(this.scene, 'scene');

		const bin = await (res.glTFFiles['scene.bin'] as Blob).arrayBuffer();
		console.log(new Uint8Array(bin));

		return {
			gltf: res.glTFFiles['scene.gltf'],
			bin: new Uint8Array(bin)
		};
	}
}

class Helper {
	constructor(private tubes: Mesh[], private flags: Mesh[], private arcs: Mesh[]) {}

	public clearAll(): void {
		console.log('clear all');

		this.tubes.forEach((tube) => {
			tube.dispose();
		});
		this.tubes = [];

		this.flags.forEach((flag) => {
			flag.dispose();
		});
		this.flags = [];

		this.arcs.forEach((arc) => {
			arc.dispose();
		});
		this.arcs = [];
	}

	public clearMeshObjs(): void {
		console.log('clear meshObjs');

		this.tubes.forEach((tube) => {
			tube.dispose();
		});
		this.tubes = [];
	}

	public clearEpiData(): void {
		console.log('clear epidata');

		this.flags.forEach((flag) => {
			flag.dispose();
		});
		this.flags = [];

		this.arcs.forEach((arc) => {
			arc.dispose();
		});
		this.arcs = [];
	}
}

class Structure {
	constructor(private helper: Helper) {}

	public renderStructure(): void {
		this.helper.clearMeshObjs();
	}
}

function filterPoints(pointsArray: Array<Vector3>, maxBound: Vector3, minBound: Vector3): Array<Vector3> {
	const points = [...pointsArray];
	const sorted: Vector3[] = [];

	points.forEach((point) => {
		if (point.x < maxBound.x && point.x > minBound.x && point.y < maxBound.y && point.y > minBound.y && point.z < maxBound.z && point.z > minBound.z) {
			sorted.push(point);
		}
	});
	return sorted;
}

function createTagArray(points: Array<InterestPoint>): Array<number> {
	const tags = [];
	points.forEach((point) => {
		tags.push(point.tag);
	});
	return tags;
}

function splitVectors(points: Array<Vector3>): { x: number[]; y: number[]; z: number[] } {
	const main = { x: [], y: [], z: [] };

	points.forEach((point) => {
		main.x.push(point.x);
		main.y.push(point.y);
		main.z.push(point.z);
	});

	return main;
}

function findMaxVector(points: Array<Vector3>): Vector3 {
	const result = splitVectors(points);

	return new Vector3(Math.max(...result.x), Math.max(...result.y), Math.max(...result.z));
}

function findMinVector(points: Array<Vector3>): Vector3 {
	const result = splitVectors(points);

	return new Vector3(Math.min(...result.x), Math.min(...result.y), Math.min(...result.z));
}

function denoodle(noodled: Array<any>): Array<any> {
	let helperArray = [];
	const target = [];

	for (let i = 0; i < noodled.length - 1; i += 1) {
		helperArray.push(noodled[i]);

		if (Number(noodled[i].tag + 1) !== Number(noodled[i + 1].tag)) {
			target.push(helperArray);
			helperArray = [];
		}
	}

	return target;
}

function createTube(initArray: any[], scene: Scene): Mesh[] {
	if (Array.isArray(initArray[0]) === false) {
		// if tube should be created as whole piece
		const tube = MeshBuilder.CreateLines('tube', { points: initArray, updatable: true }, scene);
		return [tube];
	} else {
		// if tube should be created in separate sections (de-noodled)
		const tubes = initArray.map((group) => {
			if (group.length > 1) {
				// if tube section has more than one point within selected positions
				const tube = MeshBuilder.CreateLines('tube', { points: group, updatable: true }, scene);
				return tube;
			} else if (group.length === 1) {
				// if tube section has only one point within selected positions
				const isoCoord = MeshBuilder.CreateSphere(
					'isocoord',
					{
						diameter: 100,
						updatable: true
					},
					scene
				);
				const sphereMaterial = new StandardMaterial('spherematerial', scene);
				sphereMaterial.diffuseColor = new Color3(1, 1, 0);
				isoCoord.material = sphereMaterial;
				isoCoord.position.set(group[0].x, group[0].y, group[0].z);
				return isoCoord;
			}
		});

		return tubes;
	}
}

function createParticle(initArray: any[], scene: Scene): Mesh {
	// takes every fifth point to reduce rendering load
	const pointArray = initArray.filter((_, i) => i % 5 === 0);

	/**
	 * Using SPS
	 * is entirely rebuilt whenever an adjustment to structure is made
	 */
	const nb = pointArray.length; // nb of triangles
	let blueSwitch = 0;
	let greenSwitch = 1;

	// custom position function for SPS creation
	const myPositionFunction = (particle, i, s) => {
		particle.position.x = pointArray[i].x;
		particle.position.y = pointArray[i].y;
		particle.position.z = pointArray[i].z;
		if (i + 1 >= pointArray.length) {
			particle.rotation.x = 0;
			particle.rotation.y = 0;
			particle.rotation.z = 0;
		} else {
			particle.rotation.x = Math.atan((pointArray[i].y - pointArray[i + 1].y) / (pointArray[i].z - pointArray[i + 1].z));
			particle.rotation.y = Math.atan((pointArray[i].x - pointArray[i + 1].x) / (pointArray[i].z - pointArray[i + 1].z));
			particle.rotation.z = Math.atan((pointArray[i].x - pointArray[i + 1].x) / (pointArray[i].y - pointArray[i + 1].y));
		}

		if (i / pointArray.length > 0.5) {
			blueSwitch = 1;
		}
		if (i / pointArray.length > 0.8) {
			greenSwitch = 0;
		}
		particle.color = new BABYLON.Color3(
			Math.cos(0.75 * Math.PI * (i / pointArray.length)),
			Math.sin(0.5 * Math.PI * (i / pointArray.length)) * greenSwitch,
			Math.sin(1.5 * Math.PI * (i / pointArray.length - 0.5)) * blueSwitch
		);
	};

	var model = MeshBuilder.CreatePlane(
		't',
		{
			width: 20,
			height: 200,
			sideOrientation: Mesh.DOUBLESIDE
		},
		scene
	);

	// SPS creation : Immutable {updatable:100lse}
	const SPS = new SolidParticleSystem('SPS', scene, {
		isPickable: true,
		updatable: true,
		expandable: true
	});
	SPS.addShape(model, nb, {
		positionFunction: myPositionFunction
	});

	const mesh = SPS.buildMesh();

	model.dispose();
	console.log('chromosome structure created as particle system');
	return mesh;
}
