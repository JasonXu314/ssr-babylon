import { Engine, HemisphericLight, Light, Mesh, MeshBuilder, Scene, SolidParticleSystem, UniversalCamera, Vector3 } from 'babylonjs';
import { GLTF2Export } from 'babylonjs-serializers';

interface InterestPoint {
	x: number;
	y: number;
	z: number;
	tag: number;
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
	private mesh: Mesh;

	private light: Light;
	private unicam: UniversalCamera;

	constructor(canvas: HTMLCanvasElement, sd: InterestPoint[]) {
		this.canvas = canvas;
		this.engine = new Engine(this.canvas, true);
		this.scene = new Scene(this.engine);

		this.light = new HemisphericLight('light', new Vector3(0, 1, 0), this.scene);
		this.unicam = new UniversalCamera('unicam', new Vector3(0, 0, -10000), this.scene);

		this.mesh = createParticle(sd, this.scene);
	}

	public draw(): void {
		this.scene.render();
	}

	public async export(): Promise<any> {
		// const kinds = Object.keys(VertexBuffer).filter((key) => key.toLowerCase().endsWith('kind'));

		// kinds.forEach((kind) => {
		// 	console.log(kind, this.mesh.getVerticesData(VertexBuffer[kind])?.some((val: number) => isNaN(val)) || 'No Vertices');
		// });

		const res = await GLTF2Export.GLTFAsync(this.scene, 'scene');

		const bin = await (res.glTFFiles['scene.bin'] as Blob).arrayBuffer();
		const binArray = new Uint8Array(bin);
		const serializedBin: number[] = [];

		binArray.forEach((num) => serializedBin.push(num));

		return {
			gltf: res.glTFFiles['scene.gltf'],
			bin: serializedBin
		};
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
	const positionFunction = (particle: any, i: number) => {
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
		// particle.color = new BABYLON.Color3(
		// 	Math.cos(0.75 * Math.PI * (i / pointArray.length)),
		// 	Math.sin(0.5 * Math.PI * (i / pointArray.length)) * greenSwitch,
		// 	Math.sin(1.5 * Math.PI * (i / pointArray.length - 0.5)) * blueSwitch
		// );
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
		positionFunction
	});

	const mesh = SPS.buildMesh();

	model.dispose();
	console.log('chromosome structure created as particle system');
	return mesh;
}
