import * as THREE from "./three/build/three.module.js";
import { OrbitControls } from "./three/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "./three/examples/jsm/loaders/OBJLoader.js";

var scene, camera, renderer;
var controls;

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
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Attach the threeJS renderer to the HTML page
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);

    window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    camera.position.set(0, 110, 20);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    /*******************************************************************************************
     * This section changes the lighting and background
     ******************************************************************************************/
    // Change these to change the ground and sky color
    const skyColor = 0xffffff; // light blue
    const groundColor = 0x07e31d; // lawn green

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

    const texture = new THREE.TextureLoader().load("./.resources/textures/Grass_001_COLOR.jpg");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);

    const planeSize = 500;

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshLambertMaterial({
        map: texture,
        side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.receiveShadow = true;
    plane.rotation.x = Math.PI * -0.5;
    scene.add(plane);

    /*******************************************************************************************
     * This section adds in objects into the scene
     ******************************************************************************************/
    // Load in the Table
    var marble = new THREE.TextureLoader().load("./.resources/textures/Red_Marble_002_COLOR.jpg");
    var tableMat = new THREE.MeshPhongMaterial({ map: marble });

    const objLoader = new OBJLoader();
    objLoader.load("./.resources/blender/table.obj", (root) => {
        root.position.set(0, 0, 0);
        let s = 20;
        root.scale.set(s, s, s);
        root.traverse(function (node) {
            if (node.isMesh) {
                node.material = tableMat;
            }
        });

        scene.add(root);
    });

    // Add in X's and O's
    const fontLoader = new THREE.FontLoader();
    fontLoader.load("three/examples/fonts/helvetiker_regular.typeface.json", function (font) {
        var XGeometry = new THREE.TextGeometry("X", {
            font: font,

            size: 15,
            height: 2,
            curveSegments: 12,

            bevelThickness: 1,
            bevelSize: 1,
            bevelEnabled: true,
        });
        var OGeometry = new THREE.TextGeometry("O", {
            font: font,

            size: 15,
            height: 2,
            curveSegments: 12,

            bevelThickness: 1,
            bevelSize: 1,
            bevelEnabled: true,
        });

        var textMaterial = new THREE.MeshLambertMaterial({
            color: 0xff0000,
            specular: 0xffffff,
        });

        var X = new THREE.Mesh(XGeometry, textMaterial);
        X.position.x -= 5;
        X.position.z = 6 + 27;
        X.position.y = 55;
        X.rotation.x = Math.PI / -2;

        var O = new THREE.Mesh(OGeometry, textMaterial);
        O.position.x -= 6;
        O.position.z = 6;
        O.position.y = 55;
        O.rotation.x = Math.PI / -2;

        scene.add(O);
        scene.add(X);
    });

    controls.update();
}

// This is the game/animation loop
// This is called ~60 times a second
function animate() {
    requestAnimationFrame(animate);

    let time = new Date().getTime() * 0.001;

    // This updates orbit controls every frame
    controls.update();

    renderer.render(scene, camera);
}
