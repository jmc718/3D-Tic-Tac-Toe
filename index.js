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


    //Add Background scene

    const skyBoxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
    const skybox = new THREE.Mesh(skyBoxGeo);

    scene.add(skybox);
    // Works but we can do better
    // const backgroundTexture = new THREE.TextureLoader().load('.resources/textures/Background Test.jpg');

    // scene.background = backgroundTexture;

    // backgroundTexture.wrapS = THREE.MirroredRepeatWrapping;
    // backgroundTexture.wrapT = THREE.MirroredRepeatWrapping;



    

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


        // X Locations

        var X1 = new THREE.Mesh(XGeometry, textMaterial);
        X1.position.x -= 33;
        X1.position.z = -19;
        X1.position.y = 55;
        X1.rotation.x = Math.PI / -2;

        var X2 = new THREE.Mesh(XGeometry, textMaterial);
        X2.position.x -= 6;
        X2.position.z = -19;
        X2.position.y = 55;
        X2.rotation.x = Math.PI / -2;

        var X3 = new THREE.Mesh(XGeometry, textMaterial);
        X3.position.x = 21;
        X3.position.z = -19;
        X3.position.y = 55;
        X3.rotation.x = Math.PI / -2;

        var X4 = new THREE.Mesh(XGeometry, textMaterial);
        X4.position.x -= 33;
        X4.position.z = 8;
        X4.position.y = 55;
        X4.rotation.x = Math.PI / -2;

        var X5 = new THREE.Mesh(XGeometry, textMaterial);
        X5.position.x -= 6;
        X5.position.z = 8;
        X5.position.y = 55;
        X5.rotation.x = Math.PI / -2;

        var X6 = new THREE.Mesh(XGeometry, textMaterial);
        X6.position.x = 21;
        X6.position.z = 8;
        X6.position.y = 55;
        X6.rotation.x = Math.PI / -2;

        var X7 = new THREE.Mesh(XGeometry, textMaterial);
        X7.position.x -= 33;
        X7.position.z = 6 + 29;
        X7.position.y = 55;
        X7.rotation.x = Math.PI / -2;

        var X8 = new THREE.Mesh(XGeometry, textMaterial);
        X8.position.x -= 6;
        X8.position.z = 6 + 29;
        X8.position.y = 55;
        X8.rotation.x = Math.PI / -2;

        var X9 = new THREE.Mesh(XGeometry, textMaterial);
        X9.position.x = 21;
        X9.position.z = 6 + 29;
        X9.position.y = 55;
        X9.rotation.x = Math.PI / -2;


        // O Locations (The only difference between the Xs and Os is that the x position is off by 1)

        var O1 = new THREE.Mesh(OGeometry, textMaterial);
        O1.position.x -= 34;
        O1.position.z = -19;
        O1.position.y = 55;
        O1.rotation.x = Math.PI / -2;

        var O2 = new THREE.Mesh(OGeometry, textMaterial);
        O2.position.x -= 7;
        O2.position.z = -19;
        O2.position.y = 55;
        O2.rotation.x = Math.PI / -2;

        var O3 = new THREE.Mesh(OGeometry, textMaterial);
        O3.position.x = 20;
        O3.position.z = -19;
        O3.position.y = 55;
        O3.rotation.x = Math.PI / -2;

        var O4 = new THREE.Mesh(OGeometry, textMaterial);
        O4.position.x -= 34;
        O4.position.z = 8;
        O4.position.y = 55;
        O4.rotation.x = Math.PI / -2;

        var O5 = new THREE.Mesh(OGeometry, textMaterial);
        O5.position.x -= 7;
        O5.position.z = 8;
        O5.position.y = 55;
        O5.rotation.x = Math.PI / -2;

        var O6 = new THREE.Mesh(OGeometry, textMaterial);
        O6.position.x = 20;
        O6.position.z = 8;
        O6.position.y = 55;
        O6.rotation.x = Math.PI / -2;

        var O7 = new THREE.Mesh(OGeometry, textMaterial);
        O7.position.x -= 34;
        O7.position.z = 6 + 29;
        O7.position.y = 55;
        O7.rotation.x = Math.PI / -2;

        var O8 = new THREE.Mesh(OGeometry, textMaterial);
        O8.position.x -= 7;
        O8.position.z = 6 + 29;
        O8.position.y = 55;
        O8.rotation.x = Math.PI / -2;

        var O9 = new THREE.Mesh(OGeometry, textMaterial);
        O9.position.x = 20;
        O9.position.z = 6 + 29;
        O9.position.y = 55;
        O9.rotation.x = Math.PI / -2;


        scene.add(X1);
        scene.add(X2);
        scene.add(O3);
        scene.add(O4);
        scene.add(O5);
        scene.add(X6);
        scene.add(X7);
        scene.add(O8);
        scene.add(X9);
    });  
    
}

// This is the game/animation loop
// This is called ~60 times a second
function animate() {
    requestAnimationFrame(animate);

    let time = new Date().getTime() * 0.001;

    // This updates orbit controls every frame
    controls.update();

    renderer.render(scene, camera);
    // renderer.render(backgroundScene, backgroundCamera);

}
