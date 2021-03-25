import * as THREE from "./three/build/three.module.js";
import { OrbitControls } from "./three/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "./three/examples/jsm/loaders/OBJLoader.js";

var scene, camera, renderer;
var controls;

const raycaster = new THREE.Raycaster(); // This is used so THREE.js can detect where the mouse is hovering
const mouse = new THREE.Vector2();

var matrix = new THREE.Matrix4(); // Used in render() to move the gamepieces
// matrix.identity();                       // Sets it to an identity matrix by default

const red = 0xff0000;
const skyColor = 0xffffff; // light blue
const style = "three/examples/fonts/helvetiker_regular.typeface.json";
const grass = "./.resources/textures/Grass_001_COLOR.jpg";
const marble = "./.resources/textures/Red_Marble_002_COLOR.jpg";
const table = "./.resources/blender/table.obj";

class Ground {
    constructor(size, textureFile) {
        const texture = new THREE.TextureLoader().load(textureFile);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
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

class OPiece {
    constructor(size, color) {
        const innerG = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 100, 1, true, 0, 6.283185);
        const topG = new THREE.RingGeometry(0.5, 1, 100, 1, 0, 6.283185);
        const bottomG = new THREE.RingGeometry(0.5, 1, 100, 1, 0, 6.283185);
        const outerG = new THREE.CylinderGeometry(1, 1, 0.1, 100, 1, true, 0, 6.283185);
        const pieceMat = new THREE.MeshLambertMaterial({ color: color, specular: 0xffffff, side: THREE.DoubleSide });
        const top = new THREE.Mesh(topG, pieceMat);
        top.rotation.x = Math.PI * -0.5;
        top.position.y += 0.05;
        const bottom = new THREE.Mesh(bottomG, pieceMat);
        bottom.rotation.x = Math.PI * -0.5;
        bottom.position.y -= 0.05;
        const out = new THREE.Mesh(outerG, pieceMat);
        const inn = new THREE.Mesh(innerG, pieceMat);
        const OPiece = new THREE.Group();
        OPiece.add(top, bottom, out, inn);
        OPiece.scale.set(size, size, size);
        scene.add(OPiece);
        return OPiece;
    }
}

class XPiece {
    constructor(size, color) {
        const geo = new THREE.BoxGeometry(0.3, 1, 0.1, 1, 1, 1, 1);
        const pieceMat = new THREE.MeshLambertMaterial({ color: color, specular: 0xffffff, side: THREE.DoubleSide });
        const leftX = new THREE.Mesh(geo, pieceMat);
        leftX.rotation.z = Math.PI / 2;
        const rightX = new THREE.Mesh(geo, pieceMat);
        leftX.rotation.z = -Math.PI / 2;
        const XPiece = new THREE.Group();
        XPiece.add(leftX, rightX);
        XPiece.scale.set(size * 2, size * 2, size * 2);
        XPiece.rotation.z += Math.PI / 4;
        XPiece.rotation.x = Math.PI * -0.5;
        scene.add(XPiece);
        return XPiece;
    }
}

class GamePiece {
    constructor(shape, size, col, row) {
        let piece;
        if (shape == "O") {
            piece = new OPiece(size, red);
            piece.position.y = 960;
        }
        if (shape == "X") {
            piece = new XPiece(size, red);
            piece.position.y = 960;
        }
        if (col == "A") {
            piece.position.x = -483;
        }
        if (col == "B") {
            piece.position.x = 0;
        }
        if (col == "C") {
            piece.position.x = 483;
        }
        if (row == 1) {
            piece.position.z = -483;
        }
        if (row == 2) {
            piece.position.z = 0;
        }
        if (row == 3) {
            piece.position.z = 483;
        }
        piece.name = "gamepiece";
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

class PickHelper {
    constructor() {
        this.pickedObject = null;
        this.pickedObjectSavedColor = 0;
    }

    pick(normalizedPosition, scene, camEnumerator, time) {
        raycaster.setFromCamera(normalizedPosition, camera);

        const intersectedObjects = raycaster.intersectObjects(scene.children);
        if (intersectedObjects.length) {
            this.pickedObject = intersectedObjects[0].object;
        }
    }
}

init();
animate();

// ctrl + shift + i in the browser brings up developer tools & shows error messages

// Start Script
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

    // controls = new OrbitControls(camera, renderer.domElement);

    window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    camera.position.set(0, 2250, 750);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    /*******************************************************************************************
     * This section changes the lighting and background
     ******************************************************************************************/
    // Change these to change the ground and sky color

    let light = new Lighting();

    //Add Background scene
    const skybox = createSkybox();
    scene.add(skybox);

    // let ground = new Ground(8000, grass);
    let board = new Table(350, table, marble);

    // Initializes the gamepieces, places them in their default positions, and returns an array of all of the game Pieces
    // var gamePieces = createPieces();

    /*******************************************************************************************
     * This section deals with moving pieces around
     ******************************************************************************************/
    document.addEventListener("mousemove", onDocumentMouseMove, false);
    document.addEventListener("mousedown", onDocumentMouseDown, false);
}
// End script

/*******************************************************************************************
 * This is the game/animation loop
 * It is called ~60 times a second
 ******************************************************************************************/
function animate() {
    requestAnimationFrame(animate);

    // This updates orbit controls every frame
    // controls.update();

    render();
}

/*******************************************************************************************
 * Renders everything onto the screen
 ******************************************************************************************/
function render() {
    // Starts the ray from where the mouse is
    raycaster.setFromCamera(mouse, camera);

    // returns an array of all objects inside the scene that intersects with the mouse.
    const intersects = raycaster.intersectObjects(scene.children);

    // Checks the first thing that the mouse intersected (the closest one),
    //and highlights it if it can
    if (intersects.length > 0) {
        if (intersects[0].object.type == "Group") intersects[0].object.translateY(500);
    }
    matrix.identity();

    renderer.render(scene, camera);
}

/*******************************************************************************************
 * Handles clicking down on gamepieces
 ******************************************************************************************/
function onDocumentMouseDown(event) {
    event.preventDefault();

    // mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    // mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // matrix.makeTranslation(mouse.x * 10, mouse.y * 10, 0);
}

/*******************************************************************************************
 * Updates where the mouse is
 ******************************************************************************************/
function onDocumentMouseMove(event) {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // matrix.makeTranslation(mouse.x * 10, mouse.y * 10, 0);
}

/*******************************************************************************************
 * Creates and returns the skybox
 ******************************************************************************************/
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

/*******************************************************************************************
 * Creates all of the game pieces and returns them in an array
 ******************************************************************************************/
function createPieces() {
    let size = 175;

    let X1 = new GamePiece("X", size, "A", 1);
    let X2 = new GamePiece("O", size, "A", 2);
    let X3 = new GamePiece("O", size, "A", 3);
    let X4 = new GamePiece("O", size, "B", 1);
    let X5 = new GamePiece("X", size, "B", 2);
    let X6 = new GamePiece("O", size, "B", 3);
    let X7 = new GamePiece("O", size, "C", 1);
    let X8 = new GamePiece("O", size, "C", 2);
    let X9 = new GamePiece("O", size, "C", 3);

    return [X1, X2, X3, X4, X5, X6, X7, X8, X9];
}
