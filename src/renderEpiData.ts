import { epiData, scene1, splinePath } from './Game';
import Helper from './helper';

export default class EpiData {
	public static renderEpiData(): void {
		Helper.clearEpiData();

		this.renderArcs(epiData.renderedArcData);
		this.renderFlags(epiData.renderedFlagData);
	}

	public static renderFlags(dataArray): void {
		// establishes handler arrays
		var signalFinal = [];

		// clear epiData.flags array
		epiData.flags = [];

		// handles the changing of epiData.flagSizeLimit.upper, allows for "inifinity"
		if (Math.round(epiData.flagSizeLimit.upper) === 50) {
			epiData.flagSizeLimit.upper = 100000000;
		}
		var upperLim = epiData.flagSizeLimit.upper;
		var lowerLim = epiData.flagSizeLimit.lower;

		// logic to determine whether to use whole filtered set of flag data (first level handler) or filter further based on slider input (second level handler)
		if (splinePath.rectSort.active === true) {
			dataArray.forEach((flag) => {
				if (
					(flag.startPos.x && flag.endPos.x) > splinePath.rectSort.min.x &&
					(flag.startPos.y && flag.endPos.y) > splinePath.rectSort.min.y &&
					(flag.startPos.z && flag.endPos.z) > splinePath.rectSort.min.z &&
					(flag.startPos.x && flag.endPos.x) < splinePath.rectSort.max.x &&
					(flag.startPos.y && flag.endPos.y) < splinePath.rectSort.max.y &&
					(flag.startPos.z && flag.endPos.z) < splinePath.rectSort.max.z &&
					flag.value > epiData.flagSizeLimit.lower &&
					flag.value < epiData.flagSizeLimit.upper
				) {
					signalFinal.push(flag);
				}
			});
		} else {
			dataArray.forEach((flag) => {
				if (flag.value > lowerLim && flag.value < upperLim) {
					signalFinal.push(flag);
				}
			});
		}

		// creates flags, by looping through signal2 array and creating a mesh object for each signal
		for (var i = 0; i < signalFinal.length; i += 1) {
			var path = [];

			// if individual flag path not long enough, will create short cylindar for that flag
			if (signalFinal[i].locus.end - signalFinal[i].locus.start <= 1) {
				var startPoint = splinePath.current[signalFinal[i].locus.start];
				var stopPoint = splinePath.current[signalFinal[i].locus.start + 1];
				path = [new BABYLON.Vector3(startPoint.x, startPoint.y, startPoint.z), new BABYLON.Vector3(stopPoint.x, stopPoint.y, stopPoint.z)];
			} else {
				for (var k = 0; k < signalFinal[i].locus.end + 1 - signalFinal[i].locus.start; k += 1) {
					try {
						var point = splinePath[signalFinal[i].locus.start + k];
						path.push(new BABYLON.Vector3(point.x, point.y, point.z));
					} catch (error) {
						console.log(error);
					}
				}
			}

			signalFinal[i].mesh = BABYLON.MeshBuilder.CreateTube(
				'flag',
				{
					path: path,
					radius: signalFinal[i].value,
					cap: BABYLON.Mesh.CAP_ALL,
					updatable: true
				},
				(scene1 as unknown) as BABYLON.Scene
			);

			// setting flag material, and color
			var flagMaterial = new BABYLON.StandardMaterial('flagmaterial', (scene1 as unknown) as BABYLON.Scene);
			flagMaterial.diffuseColor = new BABYLON.Color3(10 / signalFinal[i].value, 0.5, signalFinal[i].value / 10);
			signalFinal[i].mesh.material = flagMaterial;
			signalFinal[i].mesh.visibility = 1;
			epiData.flags.push(signalFinal[i].mesh);
		}

		console.log('flags created', epiData.flags);
	}

	public static renderArcs(dataArray): void {
		// establishes handler arrays
		let interactionFinal = [];

		// clearing epiData.arcs array
		epiData.arcs = [];

		// logic to determine whether to use whole filtered set of arc data (first level handler) or filter further based on slider input (second level handler)
		if (splinePath.rectSort.active === true) {
			dataArray.map((arc) => {
				if (
					(arc.startPos.x || arc.stopPos.x) > splinePath.rectSort.min.x &&
					(arc.startPos.y || arc.stopPos.y) > splinePath.rectSort.min.y &&
					(arc.startPos.z || arc.stopPos.z) > splinePath.rectSort.min.z &&
					(arc.startPos.x || arc.stopPos.x) < splinePath.rectSort.max.x &&
					(arc.startPos.y || arc.stopPos.y) < splinePath.rectSort.max.y &&
					(arc.startPos.z || arc.stopPos.z) < splinePath.rectSort.max.z
				) {
					interactionFinal.push(arc);
				}
			});
		} else {
			interactionFinal = dataArray;
		}

		// creates arcs, by looping through interactionFinal array and creating a line object for each interaction
		interactionFinal.forEach((value) => {
			// creating path of arcs, with middle controlPoint
			const controlPoint = new BABYLON.Vector3(
				(value.startPos.x + value.stopPos.x) / 2,
				(value.startPos.y + value.stopPos.y) / 2,
				(value.startPos.z + value.stopPos.z) / 2
			);
			const arcBezier = BABYLON.Curve3.CreateQuadraticBezier(value.startPos, controlPoint, value.stopPos, 200);

			const arc = BABYLON.MeshBuilder.CreateLines('arc', { points: arcBezier.getPoints() }, (scene1 as unknown) as BABYLON.Scene);
			arc.color = new BABYLON.Color3(1, 0.75, 0);

			epiData.arcs.push(arc);

			epiData.hiCPaths.push(arcBezier);
		});

		console.log('arcs created');
	}
}
