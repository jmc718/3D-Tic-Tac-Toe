import * as THREE from "./three/build/three.module.js";
import { OrbitControls } from "./three/examples/jsm/controls/OrbitControls.js";

var scene, camera, renderer;
var geometry, material, mesh;
var controls;

init();
animate();

// ctrl + shift + i in the browser brings up developer tools & shows error messages

function init() {
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

    camera.position.set(0, 100, 30);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    /*******************************************************************************************
     * This section changes the lighting and background
     ******************************************************************************************/
    // Change these to change the ground and sky color
    const skyColor = 0xffffff; // light blue
    // const groundColor = 0x07e31d; // lawn green
    const groundColor = 0x663a22;

    const intensity = 1;
    const light = new THREE.DirectionalLight(skyColor, intensity);
    light.castShadow = true;
    light.position.set(100, 100, -100);
    light.target.position.set(-4, 0, -4);
    scene.add(light);
    scene.add(light.target);

    const planeSize = 10000;

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshLambertMaterial({
        color: groundColor,
        side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.receiveShadow = true;
    plane.rotation.x = Math.PI * -0.5;
    scene.add(plane);

    // Load in the Table
    // const objectLoader = new THREE.ObjectLoader();
    // objectLoader.load("../../.resources/blender/table.obj", (root) => {
    //     root.position.set(0, 0, 0);
    //     scene.add(root);
    // });

    const fontLoader = new THREE.FontLoader();
    fontLoader.load("three/examples/fonts/helvetiker_regular.typeface.json", function (font) {
        var textGeometry = new THREE.TextGeometry("X", {
            font: font,

            size: 25,
            height: 10,
            curveSegments: 12,

            bevelThickness: 1,
            bevelSize: 1,
            bevelEnabled: true,
        });

        var textMaterial = new THREE.MeshPhongMaterial({
            color: 0xff0000,
            specular: 0xffffff,
        });

        var O = new THREE.Mesh(textGeometry, textMaterial);
        O.position.y = 11;
        O.rotation.x = Math.PI / 2;

        scene.add(O);
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
