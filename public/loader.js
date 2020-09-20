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

	scene.createDefaultCameraOrLight();

	engine.runRenderLoop(() => {
		scene.render();
	});
});
