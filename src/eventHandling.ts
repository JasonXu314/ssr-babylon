import * as BABYLON from 'babylonjs';
import { emitter, epiData, scene1 } from './Game';
import EpiData from './renderEpiData';

export default class EventHandling {
	private canvas: HTMLCanvasElement;
	private arccam: BABYLON.ArcRotateCamera;
	private unicam: BABYLON.UniversalCamera;

	constructor(canvas: HTMLCanvasElement, arccam: BABYLON.ArcRotateCamera, unicam: BABYLON.UniversalCamera) {
		this.canvas = canvas;
		this.arccam = arccam;
		this.unicam = unicam;

		this.viewEvents();
		this.SSEvents();
	}

	viewEvents(): void {
		emitter.on('viewFlagsVisibleChange', (visible) => {
			if (epiData.flags !== null) {
				if (visible === true) {
					epiData.flags.forEach((flag) => {
						flag.visibility = 1;
					});
				} else if (visible === false) {
					epiData.flags.forEach((flag) => {
						flag.visibility = 0;
					});
				}
			} else {
				alert('No Flags Rendered');
			}
		});
		emitter.on('viewArcsVisibleChange', (visible) => {
			if (epiData.arcs !== null) {
				if (visible === true) {
					epiData.arcs.forEach((arc) => {
						arc.visibility = 1;
					});
				} else if (visible === false) {
					epiData.arcs.forEach((arc) => {
						arc.visibility = 0;
					});
				}
			} else {
				alert('No Arcs Rendered');
			}
		});
		emitter.on('viewFlagSizeLowerChange', (e) => {
			epiData.flagSizeLimit.lower = e;
			if (epiData.flags.length > 0) {
				epiData.flags.forEach((flag) => {
					flag.dispose();
				});
				epiData.flags = [];
			}
			EpiData.renderFlags(epiData.renderedFlagData);
		});
		emitter.on('viewFlagSizeUpper', (e) => {
			epiData.flagSizeLimit.upper = e;
			if (epiData.flags.length > 0) {
				epiData.flags.forEach((flag) => {
					flag.dispose();
				});
				epiData.flags = [];
			}
			EpiData.renderEpiData();
		});

		emitter.on('viewCameraRangeChange', (e) => {
			scene1.activeCamera.maxZ = e;
		});
		emitter.on('viewCameraSpeedChange', (e) => {
			if (scene1.activeCamera.name === 'unicam') {
				this.unicam.speed = e;
			} else if (scene1.activeCamera.name === 'arccam') {
				this.arccam.wheelPrecision = e / 1000;
			}
		});
		emitter.on('viewReset', () => {
			if (scene1.activeCamera.name === 'unicam') {
				this.unicam.setTarget(new BABYLON.Vector3(0, 0, 0));
			} else if (scene1.activeCamera.name === 'arccam') {
				this.arccam.setPosition(new BABYLON.Vector3(0, 0, -10000));
			}
		});
		emitter.on('viewSetUnicam', () => {
			this.unicam.attachControl(this.canvas, false);
			scene1.activeCamera = this.unicam;
		});
		emitter.on('viewSetArccam', () => {
			this.arccam.attachControl(this.canvas, false);
			scene1.activeCamera = this.arccam;
		});
	}

	SSEvents(): void {}
}
