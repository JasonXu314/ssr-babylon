const canvas = document.getElementById('canvas');

const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

const button = document.getElementById('load');
const input = document.getElementById('id');

let id = '';

input.addEventListener('change', (evt) => {
	id = evt.target.value;
});

button.addEventListener('click', () => {
	BABYLON.SceneLoader.Append('/files/', id + '.gltf', scene);

	const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
	const camera = new BABYLON.UniversalCamera('unicam', new BABYLON.Vector3(0, 0, -10000), scene);

	scene.attachControl();

	engine.runRenderLoop(() => {
		scene.render();
	});
});
