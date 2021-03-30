import * as THREE from "./three/build/three.module.js";
import { OrbitControls } from "./three/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "./three/examples/jsm/loaders/OBJLoader.js";
import { GUI } from "./three/examples/jsm/libs/dat.gui.module.js";
var scene, camera, renderer;
var controls;

var time = new THREE.Clock();

var raycaster = new THREE.Raycaster(); // This is used so THREE.js can detect where the mouse is hovering
const mouse = new THREE.Vector2();

var pickPosition;
var pickHelper;
var hoveredObject;

const red = 0xff0000;
const skyColor = 0xffffff; // light blue
const grass = "./.resources/textures/Grass_001_COLOR.jpg";
const marble = "./.resources/textures/Red_Marble_002_COLOR.jpg";
const table = "./.resources/blender/table.obj";

const pieceSize = 175;
var playerSwitch = true;
var gamePieceArray = [];
var clickBoxArray = [];

const manager = new THREE.LoadingManager();
manager.onLoad = init;

const progressbarElem = document.querySelector("#progressbar");
manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    progressbarElem.style.width = `${((itemsLoaded / itemsTotal) * 100) | 0}%`;
};

/*******************************************************************************************
 * Adds in artificial ground
 ******************************************************************************************/
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

/*******************************************************************************************
 * Imports the table
 ******************************************************************************************/
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

/*******************************************************************************************
 * Unofficial Parent of the X & O pieces, as well as clickbox
 ******************************************************************************************/
class GamePiece {
    constructor(col, row) {
        this.location = {
            col,
            row,
        };

        this.placed = false;
    }

    place(piece, col, row) {
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
    }
}

/*******************************************************************************************
 * Implements the ClickBoxes
 ******************************************************************************************/
class ClickBox extends GamePiece {
    constructor(col, row, color = "red") {
        super(col, row);

        const geo = new THREE.PlaneGeometry(410, 410);
        const pieceMat = new THREE.MeshLambertMaterial({ color: color, opacity: 0.0, transparent: true, side: THREE.DoubleSide });

        var piece = new THREE.Mesh(geo, pieceMat);

        piece.position.y = 951;
        piece.rotation.x = Math.PI * -0.5;

        this.place(piece, col, row);

        piece.name = "clickbox";

        scene.add(piece);
        return piece;
    }

    getID() {
        return piece.id;
    }
}

/*******************************************************************************************
 * Class for the X Pieces
 ******************************************************************************************/
class XPiece extends GamePiece {
    constructor(col, row, size = 175, color = red) {
        super(col, row);

        const geo = new THREE.BoxGeometry(0.3, 1, 0.1, 1, 1, 1, 1);
        const pieceMat = new THREE.MeshLambertMaterial({ color: color, side: THREE.DoubleSide });

        var leftX = new THREE.Mesh(geo, pieceMat);
        leftX.rotation.z = Math.PI / 2;

        var rightX = new THREE.Mesh(geo, pieceMat);
        leftX.rotation.z = -Math.PI / 2;

        var piece = new THREE.Group();
        piece.position.y = 960;
        piece.add(leftX, rightX);
        piece.scale.set(size * 2, size * 2, size * 2);
        piece.rotation.z += Math.PI / 4;
        piece.rotation.x = Math.PI * -0.5;

        this.place(piece, col, row);

        piece.name = "xpiece";
        this.placed = true;

        scene.add(piece);
        return piece;
    }

    getID() {
        return piece.id;
    }
}

/*******************************************************************************************
 * Class for the O Pieces
 ******************************************************************************************/
class OPiece extends GamePiece {
    constructor(col, row, size = 175, color = red) {
        super(col, row);

        const innerG = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 100, 1, true, 0, 6.283185);
        const topG = new THREE.RingGeometry(0.5, 1, 100, 1, 0, 6.283185);
        const bottomG = new THREE.RingGeometry(0.5, 1, 100, 1, 0, 6.283185);
        const outerG = new THREE.CylinderGeometry(1, 1, 0.1, 100, 1, true, 0, 6.283185);
        const pieceMat = new THREE.MeshLambertMaterial({ color: color, side: THREE.DoubleSide });

        var top = new THREE.Mesh(topG, pieceMat);
        top.rotation.x = Math.PI * -0.5;
        top.position.y += 0.05;

        var bottom = new THREE.Mesh(bottomG, pieceMat);
        bottom.rotation.x = Math.PI * -0.5;
        bottom.position.y -= 0.05;

        var out = new THREE.Mesh(outerG, pieceMat);
        var inn = new THREE.Mesh(innerG, pieceMat);

        var piece = new THREE.Group();
        piece.position.y = 960;
        piece.add(top, bottom, out, inn);
        piece.scale.set(size, size, size);

        this.place(piece, col, row);

        piece.name = "opiece";
        this.placed = true;

        scene.add(piece);
        return piece;
    }

    getID() {
        return piece.id;
    }
}

/*******************************************************************************************
 * Handles the lighting for the game
 ******************************************************************************************/
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

/*******************************************************************************************
 * Handles the raycasting
 ******************************************************************************************/
class PickHelper {
    constructor() {
        this.raycaster = new THREE.Raycaster();
        this.pickedObject = null;
        this.pickedOpacity = 0.0;
        this.pickedObjectSavedOpacity = 0.0;
    }
    pick(normalizedPosition, scene, camera) {
        // restore the color if there is a picked object
        if (this.pickedObject && this.pickedObject.material.name == "clickbox") {
            this.pickedObject.material.opacity = this.pickedObjectSavedOpacity;
            this.pickedObject = undefined;
        }

        // cast a ray through the frustum
        this.raycaster.setFromCamera(normalizedPosition, camera);
        // get the list of objects the ray intersected
        const intersectedObjects = this.raycaster.intersectObjects(scene.children);
        if (intersectedObjects.length) {
            this.pickedObject = intersectedObjects[0].object;
            if (this.pickedObject.material.name == "clickbox") {
                this.pickedObjectSavedOpacity = this.pickedObject.material.opacity;
                this.pickedObject.material.opacity = 0.5;
            }
        }
    }
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

    // const scene = new THREE.Scene();
    // const skyboxTextures = new THREE.CubeTextureLoader()
    //     .setPath(".resources/textures/field-skyboxes/Meadow/")
    //     .load(["posx.jpg", "negx.jpg", "posy.jpg", "negy.jpg", "posz.jpg", "negz.jpg"]);

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
    skyboxGeo.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 2000, 0));

    return new THREE.Mesh(skyboxGeo, skyboxMeshes);
}

/*******************************************************************************************
 * Creates all of the Clickable Boxes and returns them in an array
 ******************************************************************************************/
function createClickables() {
    return [
        new ClickBox("A", 1),
        new ClickBox("B", 1),
        new ClickBox("C", 1),
        new ClickBox("A", 2),
        new ClickBox("B", 2),
        new ClickBox("C", 2),
        new ClickBox("A", 3),
        new ClickBox("B", 3),
        new ClickBox("C", 3),
    ];
}

/*******************************************************************************************
 * Checks to see if a piece has already been placed in a certain spot
 ******************************************************************************************/
function checkPiece(potentialPiece) {
    const valid = gamePieceArray.find(
        (placedPiece) => placedPiece.location.row === potentialPiece.location.row && placedPiece.location.col === potentialPiece.location.col
    );

    if (valid) {
        console.log("Potential Piece is valid");
        return true;
    } else return false;
}
/*******************************************************************************************
 * Handles what happens when you click on a valid location for a piece
 ******************************************************************************************/
function onClick(event) {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects[0].object.name === "clickbox") {
        let r;
        let c;
        let position = intersects[0].object.position;
        if (position.x < 0) {
            c = "A";
        }
        if (position.x == 0) {
            c = "B";
        }
        if (position.x > 0) {
            c = "C";
        }
        if (position.z < 0) {
            r = 1;
        }
        if (position.z == 0) {
            r = 2;
        }
        if (position.z > 0) {
            r = 3;
        }

        if (playerSwitch) {
            gamePieceArray.push(new XPiece(c, r));
            playerSwitch = false;
        } else {
            gamePieceArray.push(new OPiece(c, r));
            playerSwitch = true;
        }
    }
}

/*******************************************************************************************
 * Handles what happens when you hover over a valid location for a piece
 ******************************************************************************************/
function hover(event) {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects(scene.children, true);

    if (hoveredObject != null && hoveredObject.name == "clickbox") {
        hoveredObject.material.opacity = 0.0;
        hoveredObject = null;
    }
    // if (intersects[0].object.name == "clickbox" && gamePieceArray.find((piece) => piece.getID() === intersects[0].object.id)) {
    if (intersects[0].object.name == "clickbox") {
        hoveredObject = intersects[0].object;
        intersects[0].object.material.opacity = 0.5;
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
    // hide the loading bar
    const loadingElem = document.querySelector("#loading");
    loadingElem.style.display = "none";

    // Create the main scene for the 3D drawing
    const canvas = document.querySelector("#c");
    scene = new THREE.Scene();

    // Every scene needs a camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 15000);

    // the renderer renders the scene using the objects, lights and camera
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Attach the threeJS renderer to the HTML page
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 960, 0);

    window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    camera.position.set(0, 2250, 750);
    camera.lookAt(new THREE.Vector3(0, 960, 0));

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

    pickPosition = { x: 0, y: 0 };
    pickHelper = new PickHelper();

    // Initializes the gamepieces, places them in their default positions, and returns an array of all of the game Pieces
    clickBoxArray = createClickables();

    // Used for Three.js Inspector
    window.scene = scene;
    window.THREE = THREE;
}
// End script

/*******************************************************************************************
 * This is the game/animation loop
 * It is called ~60 times a second
 ******************************************************************************************/
function animate() {
    // This updates orbit controls every frame
    controls.update();

    pickHelper.pick(pickPosition, scene, camera);

    window.addEventListener("mousemove", hover, false);
    window.addEventListener("click", onClick, false);
    render();
}

function render() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
