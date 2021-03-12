var scene, camera, renderer;
var geometry, material, mesh;

init();
animate();

function init() {
    // Create the main scene for the 3D drawing
    scene = new THREE.Scene();
    // scene.background = new THREE.Color("white");

    // Every scene needs a camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);

    // the renderer renders the scene using the objects, lights and camera
    renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Attach the threeJS renderer to the HTML page
    document.body.appendChild(renderer.domElement);

    window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        // index.js:28 Uncaught TypeError: camera.updateProjectMatrix is not a function
        // camera.updateProjectMatrix();
    });

    camera.position.x = 40;
    camera.position.y = 40;
    camera.position.z = 100;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    const skyColor = 0xffffff; // light blue
    const groundColor = 0xc2805f; // brownish orange
    const intensity = 1;
    const light = new THREE.DirectionalLight(skyColor, intensity);
    light.castShadow = true;
    light.position.set(0, 15, 0);
    light.target.position.set(-4, 0, -4);
    scene.add(light);
    scene.add(light.target);

    const planeSize = 10000;

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({ color: 0xc2805f, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.receiveShadow = true;
    plane.rotation.x = Math.PI * -0.5;

    scene.add(plane);

    boxSize = 20;
    boxGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    boxMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.set(0, 12, 0);
    box.castShadow = true;
    box.receiveShadow = true;
    scene.add(box);

    sphereGeometry = new THREE.SphereGeometry(12, 32, 32);
    sphereMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(50, 12, 0);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add(sphere);

    var loader = new THREE.FontLoader();
    // loader.load( 'fonts/fontname.js', function ( font ) {

    // var textGeometry = new THREE.TextGeometry( "text", {

    //     font: font,

    //     size: 50,
    //     height: 10,
    //     curveSegments: 12,

    //     bevelThickness: 1,
    //     bevelSize: 1,
    //     bevelEnabled: true

    // });

    // var textMaterial = new THREE.MeshPhongMaterial( 
    //     { color: 0xff0000, specular: 0xffffff }
    // );

    // var mesh = new THREE.Mesh( textGeometry, textMaterial );

    // scene.add( mesh );

    // });   

}

// This is the game/animation loop
// This is called ~60 times a second
function animate() {
    requestAnimationFrame(animate);

    let time = new Date().getTime() * 0.001;

    sphere.position.x = Math.sin(time) * 50;
    sphere.position.z = Math.cos(time) * 50;

    renderer.render(scene, camera);
}
