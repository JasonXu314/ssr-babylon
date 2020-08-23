import * as BABYLON from 'babylonjs';
import * as NE from 'nanoevents';
import EventHandling from './eventHandling';
import Helper from './helper';
import EpiData from './renderEpiData';
import Structure from './renderStructure';

export const emitter = NE.createNanoEvents();
export let splinePath = {
	init: [],
	current: [],
	manual: [],
	rectSort: {
		max: new BABYLON.Vector3(0, 0, 0),
		min: new BABYLON.Vector3(0, 0, 0),
		points: [],
		tags: [],
		X: null,
		Y: null,
		Z: null,
		active: false
	},
	radSort: {
		radius: null,
		centers: [],
		points: [],
		tags: [],
		active: false
	}
};
export let meshObjs = { tube: [], particle: null, minimap: null, indicator: null, sphericalIndicator: null, basePairMarkers: [], basePairSelectedSegments: [] };
export let epiData = {
	flags: [],
	arcs: [],
	hiCPaths: [],
	renderedFlagData: [],
	renderedArcData: [],
	totalFlagData: [],
	totalArcData: [],
	radSortFlagData: [],
	radSortArcData: [],
	flagSizeLimit: { upper: 50, lower: 10 }
};
export let viewRegion = {
	genomeStart: null,
	totalLoadedStart: null,
	totalLoadedStop: null,
	length: null,
	start: null,
	stop: null,
	chrLength: null,
	chrNumber: null
};
export let flagsVisible: Boolean = true;
export let arcsVisible: Boolean = true;
export let scene1: BABYLON.Scene;
export let scene2: BABYLON.Scene;

export default class Game {
	private engine: BABYLON.Engine;
	private scene2Cam: BABYLON.UniversalCamera;
	private light: BABYLON.HemisphericLight;
	private light2: BABYLON.HemisphericLight;

	private canvas: HTMLCanvasElement;
	private scene1: BABYLON.Scene;
	private scene2: BABYLON.Scene;
	private unicam: BABYLON.UniversalCamera;
	private arccam: BABYLON.ArcRotateCamera;

	private emitter: NE.Emitter;
	private startMaterial: BABYLON.StandardMaterial;
	private stopMaterial: BABYLON.StandardMaterial;
	private highlightLayer: BABYLON.HighlightLayer;

	private EventHandling: EventHandling;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.engine = new BABYLON.Engine(this.canvas, true);
		this.scene1 = new BABYLON.Scene(this.engine);
		this.scene2 = new BABYLON.Scene(this.engine);

		scene1 = this.scene1;
		scene2 = this.scene2;

		this.emitter = emitter;

		this.startMaterial = new BABYLON.StandardMaterial('startmaterial', this.scene1);
		this.startMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0);
		this.stopMaterial = new BABYLON.StandardMaterial('stopmaterial', this.scene1);
		this.stopMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);

		this.highlightLayer = new BABYLON.HighlightLayer('highlighter', this.scene1);

		this.emitter.on('mainReset', this.reset.bind(this));
	}

	setup(): void {
		this.light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), this.scene1);

		this.unicam = new BABYLON.UniversalCamera('unicam', new BABYLON.Vector3(0, 0, -10000), this.scene1);
		this.unicam.maxZ = 100000;
		this.unicam.keysUp[0] = 87;
		this.unicam.keysDown[0] = 83;
		this.unicam.keysLeft[0] = 65;
		this.unicam.keysRight[0] = 68;
		// (this.unicam as any).keysUpward[0] = 32;
		// (this.unicam as any).keysDownward[0] = 16;
		this.unicam.speed = 500;
		this.unicam.angularSensibility = 200;
		this.unicam.attachControl(this.canvas, false);

		this.arccam = new BABYLON.ArcRotateCamera('arccam', 0, 0, 10, new BABYLON.Vector3(0, 0, 0), this.scene1);
		this.arccam.setPosition(new BABYLON.Vector3(0, 0, -10000));
		this.arccam.wheelPrecision = 0.1;
		this.arccam.lowerBetaLimit = 0.1;
		this.arccam.upperBetaLimit = (Math.PI / 2) * 0.99;
		this.arccam.maxZ = 100000;

		this.scene1.activeCamera = this.unicam;

		this.scene2.autoClear = false;
		this.light2 = new BABYLON.HemisphericLight('light2', new BABYLON.Vector3(0, 5, 0), this.scene2);

		this.scene2Cam = new BABYLON.UniversalCamera(
			'camera',
			new BABYLON.Vector3(this.canvas.width / 3, -this.canvas.height / 4, -this.canvas.width / 2),
			this.scene2
		);
		this.scene2Cam.maxZ = 1000000;

		// this.scene1.enablePhysics(new BABYLON.Vector3(0, 0, 0), new BABYLON.AmmoJSPlugin());

		this.EventHandling = new EventHandling(this.canvas, this.arccam, this.unicam);

		window.addEventListener('resize', () => {
			console.log('resize');
			this.engine.resize();
		});
	}

	initStructure(structureData): void {
		splinePath.init = [...structureData];
		splinePath.current = [...structureData];

		splinePath.rectSort.points = [];
		splinePath.rectSort.tags = [];
		splinePath.radSort.points = [];
		splinePath.radSort.tags = [];

		Helper.clearMeshObjs();
		Helper.clearEpiData();

		if (splinePath.rectSort.active === true) {
			var rectSort = Helper.filterPoints(splinePath.current, splinePath.rectSort.max, splinePath.rectSort.min);

			splinePath.rectSort.tags = Helper.createTagArray(rectSort);

			splinePath.rectSort.points = Helper.denoodle(rectSort);

			meshObjs.tube = [];
			Structure.createTube(splinePath.rectSort.points);
		}

		if (splinePath.radSort.active === true) {
			var coords = [];
			splinePath.radSort.centers.forEach((center) => {
				if (splinePath.rectSort.active === false) {
					splinePath.current.forEach((point) => {
						var distance = Math.sqrt(
							(point.x - center.x) * (point.x - center.x) +
								(point.y - center.y) * (point.y - center.y) +
								(point.z - center.z) * (point.z - center.z)
						);
						if (distance < splinePath.radSort.radius) {
							coords.push(point);
						}
					});
				} else if (splinePath.rectSort.active === true) {
					splinePath.radSort.points.forEach((group) => {
						group.forEach((point) => {
							var distance = Math.sqrt(
								(point.x - center.x) * (point.x - center.x) +
									(point.y - center.y) * (point.y - center.y) +
									(point.z - center.z) * (point.z - center.z)
							);
							if (distance < splinePath.radSort.radius) {
								coords.push(point);
							}
						});
					});
				}
			});

			splinePath.radSort.points = Helper.denoodle(coords);

			if (epiData.renderedFlagData.length !== 0) {
				epiData.renderedFlagData.forEach((flag) => {
					coords.forEach((coord) => {
						if (flag.startTag === coord.tag || flag.stopTag === coord.tag) {
							epiData.radSortFlagData.push(flag);
						}
					});
				});
			}

			if (epiData.renderedArcData.length !== 0) {
				epiData.renderedArcData.forEach((arc) => {
					coords.forEach((coord) => {
						if (arc.startTag === coord.tag || arc.stopTag === coord.tag) {
							epiData.radSortArcData.push(arc);
						}
					});
				});
			}

			EpiData.renderArcs(epiData.radSortArcData);
			EpiData.renderFlags(epiData.radSortFlagData);
		}

		if (splinePath.radSort.active === false && splinePath.rectSort.active === false) {
			Structure.renderStructure();
		}

		console.log('init structure data', structureData);
	}

	initEpiData(): void {
		Helper.clearEpiData();

		// Processing arc data to find coordinates/strength
		epiData.renderedArcData.forEach((value) => {
			value.start = Math.round(((value.locus1.start - viewRegion.start) / viewRegion.length) * splinePath.current.length);
			value.stop = Math.round(((value.locus2.end - viewRegion.start) / viewRegion.length) * splinePath.current.length);
			value.score = value.score;

			value.startPos = new BABYLON.Vector3(splinePath.current[value.start].x, splinePath.current[value.start].y, splinePath.current[value.start].z);
			value.stopPos = new BABYLON.Vector3(splinePath.current[value.stop].x, splinePath.current[value.stop].y, splinePath.current[value.stop].z);

			value.startTag = splinePath.current[value.start].tag;
			value.stopTag = splinePath.current[value.stop].tag;
		});

		// Processing flag data to find coordinates/size
		epiData.renderedFlagData.forEach((data) => {
			data.locus.start = Math.ceil(((data.locus.start - viewRegion.start) / viewRegion.length) * splinePath.current.length);
			data.locus.end = Math.floor(((data.locus.end - viewRegion.start) / viewRegion.length) * splinePath.current.length);

			data.startPos = new BABYLON.Vector3(
				splinePath.current[data.locus.start].x,
				splinePath.current[data.locus.start].y,
				splinePath.current[data.locus.start].z
			);
			data.endPos = new BABYLON.Vector3(splinePath.current[data.locus.end].x, splinePath.current[data.locus.end].y, splinePath.current[data.locus.end].z);

			data.startTag = splinePath.current[data.locus.start].tag;
			data.stopTag = splinePath.current[data.locus.end].tag;
		});

		EpiData.renderArcs(epiData.renderedArcData);
		EpiData.renderFlags(epiData.renderedFlagData);

		console.log('init epidata', epiData);
	}

	onDataChange(structureData, browserData): void {
		this.initStructure(structureData);

		epiData.renderedArcData = browserData.renderedArcData;
		epiData.renderedFlagData = browserData.renderedFlagData;
		viewRegion = browserData.viewRegion;
		this.initEpiData();

		console.log('on data change from game', structureData, browserData);
	}

	reset(): void {
		console.log('main view reset');
		Helper.clearAll();

		splinePath.rectSort.active = false;

		Structure.renderStructure();

		EpiData.renderEpiData();

		this.scene1.activeCamera.position = new BABYLON.Vector3(0, 0, -10000);

		if (this.scene1.activeCamera.name === 'unicam') {
			this.unicam.setTarget(new BABYLON.Vector3(0, 0, 0));
		} else if (this.scene1.activeCamera.name === 'arccam') {
			this.arccam.lowerRadiusLimit = 0;
		}
	}

	animate(): void {
		this.engine.runRenderLoop(() => {
			this.scene1.render();
			this.scene2.render();
			this.emitter.emit('tick');
		});
	}
}
