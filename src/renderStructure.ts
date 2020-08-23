import * as BABYLON from 'babylonjs';
import { meshObjs, scene1, splinePath } from './Game';
import Helper from './helper';

export default class Structure {
	public static renderStructure(): void {
		Helper.clearMeshObjs();
		if (splinePath.rectSort.active === true) {
			meshObjs.tube = [];
			this.createTube(splinePath.rectSort.points);
		} else if (splinePath.rectSort.active === false) {
			this.createParticle(splinePath.current);
		}
	}

	public static createTube(initArray): void {
		if (Array.isArray(initArray[0]) === false) {
			// if tube should be created as whole piece
			var tube = BABYLON.MeshBuilder.CreateLines('tube', { points: initArray, updatable: true }, scene1);
			meshObjs.tube.push(tube);
		} else if (Array.isArray(initArray[0]) === true) {
			// if tube should be created in separate sections (de-noodled)
			initArray.forEach((group) => {
				if (group.length > 1) {
					// if tube section has more than one point within selected positions
					var tube = BABYLON.MeshBuilder.CreateLines('tube', { points: group, updatable: true }, scene1);
					meshObjs.tube.push(tube);
				} else if (group.length === 1) {
					// if tube section has only one point within selected positions
					var isoCoord = BABYLON.MeshBuilder.CreateSphere(
						'isocoord',
						{
							diameter: 100,
							updatable: true
						},
						scene1
					);
					var sphereMaterial = new BABYLON.StandardMaterial('spherematerial', scene1);
					sphereMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0);
					isoCoord.material = sphereMaterial;
					isoCoord.position.set(group[0].x, group[0].y, group[0].z);
					meshObjs.tube.push(isoCoord);
				}
			});
		}

		console.log('chromosome structure created as tubes');
	}

	public static createParticle(initArray): void {
		meshObjs.particle = [];

		// takes every fifth point to reduce rendering load
		var pointArray = [];
		var j = 0;
		initArray.forEach((point) => {
			if (j === 0) {
				pointArray.push(point);
			}
			j += 1;
			if (j === 5) {
				j = 0;
			}
		});

		/**
		 * Using SPS
		 * is entirely rebuilt whenever an adjustment to structure is made
		 */
		var nb = pointArray.length; // nb of triangles
		var blueSwitch = 0;
		var greenSwitch = 1;

		// custom position function for SPS creation
		var myPositionFunction = function (particle, i, s) {
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

		var model = BABYLON.MeshBuilder.CreatePlane(
			't',
			{
				width: 20,
				height: 200,
				sideOrientation: BABYLON.Mesh.DOUBLESIDE
			},
			scene1
		);

		// SPS creation : Immutable {updatable:100lse}
		const SPS = new BABYLON.SolidParticleSystem('SPS', scene1, {
			isPickable: true,
			updatable: true,
			expandable: true
		});
		let spsNb = SPS.addShape(model, nb, {
			positionFunction: myPositionFunction
		});

		meshObjs.particle = SPS.buildMesh();

		model.dispose();
		console.log('chromosome structure created as particle system');
	}
}
