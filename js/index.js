var scene, camera, renderer;
var geometry, material, mesh;

init();
animate();

function init() {
    // Create the main scene for the 3D drawing
    scene = new THREE.Scene();

    // Every scene needs a camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);

    // the renderer renders the scene using the objects, lights and camera
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Attach the threeJS renderer to the HTML page
    document.body.appendChild(renderer.domElement);

    window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;

        camera.updateProjectMatrix();
    });

    camera.position.z = 100;
    camera.lookAt(new THREE.Vector3(0, 0, 0));
}

// This is the game/animation loop
// This is called ~60 times a second
function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
}
