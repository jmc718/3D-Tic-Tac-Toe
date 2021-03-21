import * as THREE from "./three/build/three.module.js";
import { OrbitControls } from "./three/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "./three/examples/jsm/loaders/OBJLoader.js";
// import { DragControls } from "./three/examples/jsm/controls/DragControls.js";

// THREE.DragControls = require("three-drag-controls")(THREE);

var scene, camera, renderer;
var controls;
const red = 0xff0000;
const skyColor = 0xffffff; // light blue
const style = "three/examples/fonts/helvetiker_regular.typeface.json";
const grass = ".resources/textures/field-skyboxes/Meadow/negy.jpg";
const marble = "./.resources/textures/Red_Marble_002_COLOR.jpg";
const table = "./.resources/blender/table.obj";

class Ground {
    constructor(size, textureFile) {
        const texture = new THREE.TextureLoader().load(textureFile);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(10, 10);
        const geometry = new THREE.PlaneGeometry(size, size);
        const material = new THREE.MeshLambertMaterial({
            map: texture,
            side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.rotation.x = Math.PI * -0.5;
        scene.add(mesh);
    }
}

class Table {
    constructor(size, objectFile, textureFile) {
        const texture = new THREE.TextureLoader().load(textureFile);
        const material = new THREE.MeshPhongMaterial({ map: texture });

        const objLoader = new OBJLoader();
        objLoader.load(objectFile, (mesh) => {
            mesh.scale.set(size, size, size);
            mesh.traverse(function (node) {
                if (node.isMesh) {
                    node.material = material;
                }
            });
            scene.add(mesh);
        });
    }
}

class GamePiece {
    constructor(shape, size, col, row) {
        const fontLoader = new THREE.FontLoader();
        fontLoader.load(style, function (font) {
            const geometry = new THREE.TextGeometry(shape, {
                font: font,
                size: size,
                height: size / 15,
                bevelEnabled: true,
                bevelThickness: size / 15,
                bevelSize: size / 15,
            });
            const material = new THREE.MeshLambertMaterial({
                color: red,
                specular: 0xffffff,
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.rotation.x = Math.PI / -2;
            mesh.position.y = 975;
            if (col == "A") {
                mesh.position.x = (-33 * size) / 12;
            }
            if (col == "B") {
                mesh.position.x = -5 * (size / 12);
            }
            if (col == "C") {
                mesh.position.x = 22 * (size / 12);
            }
            if (row == 1) {
                mesh.position.z = -21 * (size / 12);
            }
            if (row == 2) {
                mesh.position.z = 7 * (size / 12);
            }
            if (row == 3) {
                mesh.position.z = 34 * (size / 12);
            }
            scene.add(mesh);
        });
    }
}

class Lighting {
    constructor() {
        // Add Directional Light
        const intensity = 1;
        const light = new THREE.DirectionalLight(skyColor, intensity);
        light.castShadow = true;
        light.position.set(100, 100, -100);
        light.target.position.set(-4, 0, -4);
        scene.add(light);
        scene.add(light.target);

        // Add Ambient Light
        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);
    }
}

init();
animate();

// ctrl + shift + i in the browser brings up developer tools & shows error messages

function init() {
    /*******************************************************************************************
     * Adds all of the main parts of THREE.js, like the scene, camera, etc
     ******************************************************************************************/
    // Create the main scene for the 3D drawing
    scene = new THREE.Scene();

    // Every scene needs a camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);

    // the renderer renders the scene using the objects, lights and camera
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Attach the threeJS renderer to the HTML page
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);

    window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    camera.position.set(0, 2200, 500);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    /*******************************************************************************************
     * This section changes the lighting and background
     ******************************************************************************************/
    // Change these to change the ground and sky color

    let light = new Lighting();

    //Add Background scene
    const skybox = createSkybox();
    scene.add(skybox);

    let ground = new Ground(8000, grass);
    let board = new Table(350, table, marble);

    let size = 205;
    let X1 = new GamePiece("O", size, "A", 1);
    let X2 = new GamePiece("O", size, "A", 2);
    let X3 = new GamePiece("O", size, "A", 3);
    let X4 = new GamePiece("O", size, "B", 1);
    let X5 = new GamePiece("O", size, "B", 2);
    let X6 = new GamePiece("O", size, "B", 3);
    let X7 = new GamePiece("O", size, "C", 1);
    let X8 = new GamePiece("O", size, "C", 2);
    let X9 = new GamePiece("O", size, "C", 3);

    // THREE.DragControls = require("three-drag-controls")(THREE);
    // var controls = new THREE.DragControls( objects, camera, renderer.domElement );
    // const dragControls = new DragControls(objects, camera, domElement);
}

// This is the game/animation loop
// This is called ~60 times a second
function animate() {
    requestAnimationFrame(animate);

    // This updates orbit controls every frame
    controls.update();

    renderer.render(scene, camera);
    // renderer.render(backgroundScene, backgroundCamera);
}

// This loads in all the textures into the skybox
function createSkybox() {
    const positiveX = new THREE.TextureLoader().load(".resources/textures/field-skyboxes/Meadow/posx.jpg");
    const positiveY = new THREE.TextureLoader().load(".resources/textures/field-skyboxes/Meadow/posy.jpg");
    const positiveZ = new THREE.TextureLoader().load(".resources/textures/field-skyboxes/Meadow/posz.jpg");
    const negativeX = new THREE.TextureLoader().load(".resources/textures/field-skyboxes/Meadow/negx.jpg");
    const negativeY = new THREE.TextureLoader().load(".resources/textures/field-skyboxes/Meadow/negy.jpg");
    const negativeZ = new THREE.TextureLoader().load(".resources/textures/field-skyboxes/Meadow/negz.jpg");

    // Puts all of the loaded textures into an array
    const skyboxTextures = [positiveX, negativeX, positiveY, negativeY, positiveZ, negativeZ];

    // Takes all of the textures from the array above and converts it into
    // an array of meshes that only show up on the inside
    const skyboxMeshes = skyboxTextures.map((texture) => {
        return new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide,
        });
    });

    const skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
    skyboxGeo.applyMatrix(new THREE.Matrix4().makeTranslation(0, 2000, 0));

    return new THREE.Mesh(skyboxGeo, skyboxMeshes);
}
