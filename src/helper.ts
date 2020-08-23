import * as BABYLON from 'babylonjs';
import { epiData, meshObjs } from './Game';

export default class Helper {
	public static clearAll(): void {
		console.log('clear all');
		if (meshObjs.tube !== null) {
			meshObjs.tube.forEach((tube) => {
				tube.dispose();
			});
			meshObjs.tube = [];
		} else if (meshObjs.particle !== null) {
			meshObjs.particle.dispose();
			meshObjs.particle = null;
		}
		if (meshObjs.minimap !== null) {
			meshObjs.minimap.dispose();
			meshObjs.minimap = null;
		}
		if (meshObjs.indicator !== null) {
			meshObjs.indicator.dispose();
			meshObjs.indicator = null;
		}
		if (meshObjs.sphericalIndicator !== null) {
			meshObjs.sphericalIndicator.dispose();
			meshObjs.sphericalIndicator = null;
		}
		if (meshObjs.basePairMarkers !== null) {
			meshObjs.basePairMarkers.forEach((marker) => {
				marker.dispose();
			});
			meshObjs.basePairMarkers = null;
		}
		if (meshObjs.basePairSelectedSegments !== null) {
			meshObjs.basePairSelectedSegments.forEach((segment) => {
				segment.dispose();
			});
			meshObjs.basePairSelectedSegments = null;
		}
		if (epiData.flags !== null) {
			epiData.flags.forEach((flag) => {
				flag.dispose();
			});
			epiData.flags = null;
		}
		if (epiData.arcs !== null) {
			epiData.arcs.forEach((arc) => {
				arc.dispose();
			});
			epiData.arcs = null;
		}
	}

	public static clearMeshObjs(): void {
		console.log('clear meshObjs');
		if (meshObjs.tube !== null) {
			meshObjs.tube.forEach((tube) => {
				tube.dispose();
			});
			meshObjs.tube = null;
		} else if (meshObjs.particle !== null) {
			meshObjs.particle.dispose();
			meshObjs.particle = null;
		}
		if (meshObjs.basePairMarkers !== null) {
			meshObjs.basePairMarkers.forEach((marker) => {
				marker.dispose();
			});
			meshObjs.basePairMarkers = [];
		}
		if (meshObjs.basePairSelectedSegments !== null) {
			meshObjs.basePairSelectedSegments.forEach((segment) => {
				segment.dispose();
			});
			meshObjs.basePairSelectedSegments = [];
		}
	}

	public static clearMinimap(): void {
		console.log('clear minimap');
		if (meshObjs.minimap !== null) {
			meshObjs.minimap.dispose();
			meshObjs.minimap = null;
		}
		if (meshObjs.indicator !== null) {
			meshObjs.indicator.dispose();
			meshObjs.indicator = null;
		}
		if (meshObjs.sphericalIndicator !== null) {
			meshObjs.sphericalIndicator.dispose();
			meshObjs.sphericalIndicator = null;
		}
	}

	public static clearEpiData(): void {
		console.log('clear epidata');
		if (epiData.flags !== null) {
			epiData.flags.forEach((flag) => {
				flag.dispose();
			});
			epiData.flags = null;
		}
		if (epiData.arcs !== null) {
			epiData.arcs.forEach((arc) => {
				arc.dispose();
			});
			epiData.arcs = null;
		}
	}

	public static filterPoints(pointsArray: Array<BABYLON.Vector3>, maxBound: BABYLON.Vector3, minBound: BABYLON.Vector3): Array<any> {
		var points = [...pointsArray];
		var sorted = [];

		points.forEach((point) => {
			if (point.x < maxBound.x && point.x > minBound.x && point.y < maxBound.y && point.y > minBound.y && point.z < maxBound.z && point.z > minBound.z) {
				sorted.push(point);
			}
		});
		return sorted;
	}

	public static createTagArray(pointsArray: Array<any>): Array<any> {
		var points = [...pointsArray];
		var tags = [];
		points.forEach((point) => {
			tags.push(point.tag);
		});
		return tags;
	}

	public static splitVectors(pointsArray: Array<BABYLON.Vector3>): any {
		var points = [...pointsArray];
		var main = { x: [], y: [], z: [] };
		points.forEach((point) => {
			main.x.push(point.x);
			main.y.push(point.y);
			main.z.push(point.z);
		});
		return main;
	}

	public static findMaxVector(pointsArray: Array<BABYLON.Vector3>): BABYLON.Vector3 {
		var points = [...pointsArray];
		var result = this.splitVectors(points);
		return new BABYLON.Vector3(Math.max(...result.x), Math.max(...result.y), Math.max(...result.z));
	}

	public static findMinVector(pointsArray: Array<BABYLON.Vector3>): BABYLON.Vector3 {
		var points = [...pointsArray];
		var result = this.splitVectors(points);
		return new BABYLON.Vector3(Math.min(...result.x), Math.min(...result.y), Math.min(...result.z));
	}

	public static denoodle(noodled: Array<any>): Array<any> {
		var helperArray = [];
		var target = [];
		for (var i = 0; i < noodled.length - 1; i += 1) {
			helperArray.push(noodled[i]);
			if (Number(noodled[i].tag + 1) !== Number(noodled[i + 1].tag)) {
				target.push(helperArray);
				helperArray = [];
			}
		}
		return target;
	}
}
