import * as THREE from "./three/build/three.module.js";
import { OrbitControls } from "./three/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "./three/examples/jsm/loaders/OBJLoader.js";
import { Audio } from "./three/src/audio/Audio.js";
// import { GUI } from "./three/examples/jsm/libs/dat.gui.module.js";

// ctrl + shift + i in the browser brings up developer tools & shows error messages

function main() {
    /*******************************************************************************************
     * Adds all of the main parts of THREE.js, like the scene, camera, etc
     ******************************************************************************************/
    const canvas = document.querySelector("#c");

    // The renderer renders the scene using the objects, lights and camera
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Every scene needs a camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 15000);
    camera.position.set(0, 2250, 750);
    camera.lookAt(new THREE.Vector3(0, 960, 0));

    // Mouse controls to move camera
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 960, 0);
    controls.update();

    // Create the main scene for the 3D drawing
    const scene = new THREE.Scene();
    scene.name = "scene";

    var raycaster = new THREE.Raycaster(); // This is used so THREE.js can detect where the mouse is hovering
    const mouse = new THREE.Vector2();

    const red = 0xff0000;
    const skyColor = 0xffffff;
    const table = "./.resources/blender/table.obj";

    window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    const manager = new THREE.LoadingManager();
    const progressbarElem = document.querySelector("#progressbar");
    manager.onProgress = (url, itemsLoaded, itemsTotal) => {
        progressbarElem.style.width = `${((itemsLoaded / itemsTotal) * 100) | 0}%`;
    };
    manager.onLoad = init;

    /* Loaders */
    const textureLoader = new THREE.TextureLoader(manager);
    const objectLoader = new OBJLoader(manager);
    const audioLoader = new THREE.AudioLoader(manager);

    var hoveredObject;

    const marble = textureLoader.load("./.resources/textures/Red_Marble_002_COLOR.jpg");

    scene.background = new THREE.CubeTextureLoader()
        .setPath(".resources/textures/field-skyboxes/Meadow/")
        .load(["posx.jpg", "negx.jpg", "posy.jpg", "negy.jpg", "posz.jpg", "negz.jpg"]);

    const pieceSize = 175;
    var playerSwitch = true;

    // Access by using newTableArray[row][column][0 for boolean, 1 for object]
    var newTableArray = [
        [[false], [false], [false]],
        [[false], [false], [false]],
        [[false], [false], [false]]
    ];
    var piecesPlaced = 0;

    var clickBoxArray = [];

    /*******************************************************************************************
     * Imports the table object, applies the texture, and adds it to the scene.
     ******************************************************************************************/
    class Table {
        constructor(size, objectFile) {
            const material = new THREE.MeshPhongMaterial({ map: marble });

            objectLoader.load(objectFile, (mesh) => {
                mesh.scale.set(size, size, size);
                mesh.traverse(function (node) {
                    if (node.isMesh) {
                        node.material = material;
                    }
                });
                scene.add(mesh);
                return mesh;
            });
        }
    }

    /*******************************************************************************************
     * Parent class of the X & O pieces, as well as clickbox
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
            /*
                0   1   2
              -------------
            0 |   |   |   |
              -------------
            1 |   |   |   |
              -------------
            2 |   |   |   |
              -------------
            */
            // Column A
            if (col == 0 && row == 0) {
                piece.position.x = -483;
                piece.position.z = -483;
                newTableArray[0][0][0] = true;
            }
            if (col == 0 && row == 1) {
                piece.position.x = -483;
                piece.position.z = 0;
                newTableArray[1][0][0] = true;
            }
            if (col == 0 && row == 2) {
                piece.position.x = -483;
                piece.position.z = 483;
                newTableArray[2][0][0] = true;
            }

            // Column B
            if (col == 1 && row == 0) {
                piece.position.x = 0;
                piece.position.z = -483;
                newTableArray[0][1][0] = true;
            }
            if (col == 1 && row == 1) {
                piece.position.x = 0;
                piece.position.z = 0;
                newTableArray[1][1][0] = true;
            }
            if (col == 1 && row == 2) {
                piece.position.x = 0;
                piece.position.z = 483;
                newTableArray[2][1][0] = true;
            }

            // Column C
            if (col == 2 && row == 0) {
                piece.position.x = 483;
                piece.position.z = -483;
                newTableArray[0][2][0] = true;
            }
            if (col == 2 && row == 1) {
                piece.position.x = 483;
                piece.position.z = 0;
                newTableArray[1][2][0] = true;
            }
            if (col == 2 && row == 2) {
                piece.position.x = 483;
                piece.position.z = 483;
                newTableArray[2][2][0] = true;
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
            piece.position.y = 2560;
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

            let h = 0.2;
            let r = 1;
            let s = 100;
            let hs = 1;
            const innerG = new THREE.CylinderGeometry(r / 2, r / 2, h, s, hs, true);
            const topG = new THREE.RingGeometry(r / 2, r, s, hs);
            const bottomG = new THREE.RingGeometry(r / 2, r, s, hs);
            const outerG = new THREE.CylinderGeometry(r, r, h, s, hs, true);
            const pieceMat = new THREE.MeshLambertMaterial({ color: color, side: THREE.DoubleSide });

            var top = new THREE.Mesh(topG, pieceMat);
            top.rotation.x = Math.PI * -0.5;
            top.position.y += 0.1;

            var bottom = new THREE.Mesh(bottomG, pieceMat);
            bottom.rotation.x = Math.PI * -0.5;
            bottom.position.y -= 0.1;

            var out = new THREE.Mesh(outerG, pieceMat);
            var inn = new THREE.Mesh(innerG, pieceMat);

            var piece = new THREE.Group();
            piece.position.y = 2560;
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
            //scene.add(light);
            //scene.add(light.target);

            // Add Ambient Light
            const ambientLight = new THREE.AmbientLight(0x404040);
            //scene.add(ambientLight);
            const lighting = new THREE.Group();
            lighting.add(light, light.target, ambientLight);
            return lighting;
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
     * Adjust the renderer size
     ******************************************************************************************/
    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    /*******************************************************************************************
     * Creates and returns the skybox
     ******************************************************************************************/
    function createSkybox() {
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
            new ClickBox(0, 0),
            new ClickBox(1, 0),
            new ClickBox(2, 0),
            new ClickBox(0, 1),
            new ClickBox(1, 1),
            new ClickBox(2, 1),
            new ClickBox(0, 2),
            new ClickBox(1, 2),
            new ClickBox(2, 2),
        ];
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
                c = 0;
            }
            if (position.x == 0) {
                c = 1;
            }
            if (position.x > 0) {
                c = 2;
            }
            if (position.z < 0) {
                r = 0;
            }
            if (position.z == 0) {
                r = 1;
            }
            if (position.z > 0) {
                r = 2;
            }

            if (playerSwitch) {
                newTableArray[r][c].push(new XPiece(c, r));
                piecesPlaced++;
                playerSwitch = false;
            } else {

                newTableArray[r][c].push(new OPiece(c, r));
                piecesPlaced++;
                playerSwitch = true;
            }
            // load a sound and set it as the Audio object's buffer
            audioLoader.load("./.resources/sound/piece_drop.wav", function (buffer) {
                sound.setBuffer(buffer);
                sound.setLoop(false);
                sound.isPlaying = false;
                sound.setVolume(0.5);
                sound.play();
            });

            // This stops the clickbox from being used again
            intersects[0].object.name = "clickedbox";
            intersects[0].object.material.opacity = 0;

            //checkGameCompleted();
            checkGameCompleted();
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
        if (intersects.length != 0 && intersects[0].object.name == "clickbox") {
            hoveredObject = intersects[0].object;
            intersects[0].object.material.opacity = 0.5;
        }
    }

    /*******************************************************************************************
     * Resets the table array to be full of false
     ******************************************************************************************/
    function resetTableArray() {

        //Delete each game piece object
        for (var i; i < 3; i++)
            for (var j; j < 3; j++)
                if (newTableArray[i][j][1])
                    delete newTableArray[i][j][1];

        newTableArray = [
            [[false], [false], [false]],
            [[false], [false], [false]],
            [[false], [false], [false]]
        ];
    }

    /*******************************************************************************************
     * I couldn't follow the other one, so I'm going to start over
     ******************************************************************************************/
    function checkGameCompleted(){
        // Access by using newTableArray[row][column][0 for boolean, 1 for object]
        /*
            0   1   2
          -------------
        0 |   |   |   |
          -------------
        1 |   |   |   |
          -------------
        2 |   |   |   |
          -------------
        */
        // If there are at least enough pieces to be able to win
        if (piecesPlaced >=3 && piecesPlaced < 9){
            // Row 0
            if (newTableArray[0][0][1] && newTableArray[0][1][1] && newTableArray[0][2][1]){
                checkPieceTypes([0, 0], [0, 1], [0, 2]);
            }
            // Row 1
            if (newTableArray[1][0][1] && newTableArray[1][1][1] && newTableArray[1][2][1]){
                checkPieceTypes([1, 0], [1, 1], [1, 2]);
            }
            // Row 2
            if (newTableArray[2][0][1] && newTableArray[2][1][1] && newTableArray[2][2][1]){
                checkPieceTypes([2, 0], [2, 1], [2, 2]);
            }

            // Column 0
            if (newTableArray[0][0][1] && newTableArray[1][0][1] && newTableArray[2][0][1]){
                checkPieceTypes([0, 0], [1, 0], [2, 0]);
            }
            // Column 1
            if (newTableArray[0][1][1] && newTableArray[1][1][1] && newTableArray[2][1][1]){
                checkPieceTypes([0, 1], [1, 1], [2, 1]);
            }
            // Column 2
            if (newTableArray[0][2][1] && newTableArray[1][2][1] && newTableArray[2][2][1]){
                checkPieceTypes([0, 2], [1, 2], [2, 2]);
            }

            // Top Left to Bottom Right
            if (newTableArray[0][0][1] && newTableArray[1][1][1] && newTableArray[2][2][1]){
                checkPieceTypes([0, 0], [1, 1], [2, 2]);
            }
            // Top Right to Bottom Left
            if (newTableArray[0][2][1] && newTableArray[1][1][1] && newTableArray[2][0][1]){
                checkPieceTypes([0, 2], [1, 1], [2, 0]);
            }
        }
        // Game Over
        else if (piecesPlaced == 9){

        }

        // default case
        return false;
    }

    /*******************************************************************************************
     * Returns true if 3 pieces are the same type
     ******************************************************************************************/
    function checkPieceTypes(piece1, piece2, piece3){
        // It's very ugly, but It just checks 
        //     - the first piece's name with the second piece's name &
        //     - the first piece's name with the third piece's name
        // and returns true if both conditions are satisfied
        if ((newTableArray[piece1[0]][piece1[1]][1].name == newTableArray[piece2[0]][piece2[1]][1].name) &&
            (newTableArray[piece1[0]][piece1[1]][1].name == newTableArray[piece3[0]][piece3[1]][1].name)){
                // Send over the name of the piece that won
                win(newTableArray[piece1[0]][piece1[1]][1].name);
                return true;
            }
        return false;
    }

    /*******************************************************************************************
     * What happens when the game is won
     ******************************************************************************************/
    function win(winningPiece){
        console.log(winningPiece + " w i n");
    }
    /*******************************************************************************************
     * Return true if the game has been completed
     ******************************************************************************************/
    function oldCheckGameCompleted() {
        // I commented it out at the bottom of onClick to test another version of this
        /*
            A   B   C
          -------------
        1 |   |   |   |
          -------------
        2 |   |   |   |
          -------------
        3 |   |   |   |
          -------------
        */
        // Game can be won
        let A1 = tableArray[0][0];
        let B1 = tableArray[0][1];
        let C1 = tableArray[0][2];
        let A2 = tableArray[1][0];
        let B2 = tableArray[1][1];
        let C2 = tableArray[1][2];
        let A3 = tableArray[2][0];
        let B3 = tableArray[2][1];
        let C3 = tableArray[2][2];

        var a1 = "none";
        var b1 = "none";
        var c1 = "none";
        var a2 = "none";
        var b2 = "none";
        var c2 = "none";
        var a3 = "none";
        var b3 = "none";
        var c3 = "none";

        console.log("checking game...");

        if (gamePieceArray.length != 0) {
            for (let i = 0; i < gamePieceArray.length; i++) {
                if (gamePieceArray[i].name == "XPiece") {
                    if (gamePieceArray[i].position.x == -483) {
                        if (gamePieceArray[i].position.z == -483) {
                            a1 = gamePieceArray[i].name;
                            console.log(a1.name);
                        } else if (gamePieceArray[i].position.z == 0) {
                            a2 = gamePieceArray[i].name;
                        } else if (gamePieceArray[i].position.z == 483) {
                            a3 = gamePieceArray[i].name;
                        }
                    } else if (gamePieceArray[i].position.x == 0) {
                        if (gamePieceArray[i].position.z == -483) {
                            b1 = gamePieceArray[i].name;
                        } else if (gamePieceArray[i].position.z == 0) {
                            b2 = gamePieceArray[i].name;
                        } else if (gamePieceArray[i].position.z == 483) {
                            b3 = gamePieceArray[i].name;
                        }
                    } else if (gamePieceArray[i].position.x == 483) {
                        if (gamePieceArray[i].position.z == -483) {
                            c1 = gamePieceArray[i].name;
                        } else if (gamePieceArray[i].position.z == 0) {
                            c2 = gamePieceArray[i].name;
                        } else if (gamePieceArray[i].position.z == 483) {
                            c3 = gamePieceArray[i].name;
                        }
                    }
                } else if (gamePieceArray[i].name == "OPiece") {
                    if (gamePieceArray[i].position.x == -483) {
                        if (gamePieceArray[i].position.z == -483) {
                            a1 = gamePieceArray[i].name;
                        } else if (gamePieceArray[i].position.z == 0) {
                            a2 = gamePieceArray[i].name;
                        } else if (gamePieceArray[i].position.z == 483) {
                            a3 = gamePieceArray[i].name;
                        }
                    } else if (gamePieceArray[i].position.x == 0) {
                        if (gamePieceArray[i].position.z == -483) {
                            b1 = gamePieceArray[i].name;
                        } else if (gamePieceArray[i].position.z == 0) {
                            b2 = gamePieceArray[i].name;
                        } else if (gamePieceArray[i].position.z == 483) {
                            b3 = gamePieceArray[i].name;
                        }
                    } else if (gamePieceArray[i].position.x == 483) {
                        if (gamePieceArray[i].position.z == -483) {
                            c1 = gamePieceArray[i].name;
                        } else if (gamePieceArray[i].position.z == 0) {
                            c2 = gamePieceArray[i].name;
                        } else if (gamePieceArray[i].position.z == 483) {
                            c3 = gamePieceArray[i].name;
                        }
                    }
                }
            }
        }

        if (gamePieceArray.length >= 3 && gamePieceArray.length < 9) {
            /* Row 1 */
            if (A1 && B1 && C1) {
                if ((a1 == b1) == c1) {
                    if (a1 == "XPiece") {
                        console.log("X wins");
                        return true;
                    } else if (a1 == "OPiece") {
                        console.log("O wins");
                        return true;
                    }
                }
            }
            /* Row 2 */
            if (A2 && B2 && B2) {
                if ((a2 == b2) == c2) {
                    if (a2 == "XPiece") {
                        console.log("X wins");
                        return true;
                    } else if (a2 == "OPiece") {
                        console.log("O wins");
                        return true;
                    }
                }
            }
            /* Row 3 */
            if (A3 && B3 && C3) {
                if ((a3 == b3) == c3) {
                    if (a2 == "XPiece") {
                        console.log("X wins");
                        return true;
                    } else if (a2 == "OPiece") {
                        console.log("O wins");
                        return true;
                    }
                }
            }
            /* Column A */
            if (A1 && A2 && A3) {
                if ((a1 == a2) == a3) {
                    if (a1 == "XPiece") {
                        console.log("X wins");
                        return true;
                    } else if (a1 == "OPiece") {
                        console.log("O wins");
                        return true;
                    }
                }
            }
            /* Column B */
            if (B1 && B2 && B3) {
                if ((b1 == b2) == b3) {
                    if (b1 == "XPiece") {
                        console.log("X wins");
                        return true;
                    } else if (b1 == "OPiece") {
                        console.log("O wins");
                        return true;
                    }
                }
            }
            /* Column C */
            if (C1 && C2 && C3) {
                if ((c1 == c2) == c3) {
                    if (c1 == "XPiece") {
                        console.log("X wins");
                        return true;
                    } else if (c1 == "OPiece") {
                        console.log("O wins");
                        return true;
                    }
                }
            }
            /* Top Left - Bottom Right */
            if (A1 && B2 && C3) {
                if ((a1 == b2) == c3) {
                    if (a1 == "XPiece") {
                        console.log("X wins");
                        return true;
                    } else if (a1 == "OPiece") {
                        console.log("O wins");
                        return true;
                    }
                }
            }
            /* Top Right - Bottom Left */
            if (C1 && B2 && A3) {
                if ((c1 == b2) == a3) {
                    if (c1 == "XPiece") {
                        console.log("X wins");
                        return true;
                    } else if (c1 == "OPiece") {
                        console.log("O wins");
                        return true;
                    }
                }
            }
        }
        // Game Over
        else if (gamePieceArray.length == 9) {
            console.log("Cats game");
            return true;
        }

        // Default Case
        console.log("no winners");
        return false;
    }

    const light = new Lighting();
    scene.add(light);

    const board = new Table(350, table);

    // Initializes the gamepieces, places them in their default positions, and returns an array of all of the game Pieces
    clickBoxArray = createClickables();

    // Resets the table array because creating all of the clickboxes sets the every element to true
    resetTableArray();

    // create an AudioListener and add it to the camera
    const listener = new THREE.AudioListener();
    camera.add(listener);

    // create a global audio source
    const sound = new THREE.Audio(listener);

    const pickPosition = { x: 0, y: 0 };
    const pickHelper = new PickHelper();

    window.addEventListener("mousemove", hover, false);
    window.addEventListener("click", onClick, false);

    // Used for Three.js Inspector
    window.scene = scene;
    window.THREE = THREE;

    renderer.render(scene, camera);

    init();
    animate();

    // Start Script
    function init() {
        /*******************************************************************************************
         * This section changes the lighting and background
         ******************************************************************************************/
        // hide the loading bar
        const loadingElem = document.querySelector("#loading");
        loadingElem.style.display = "none";
    }
    // End script

    /*******************************************************************************************
     * This is the game/animation loop
     * It is called ~60 times a second
     ******************************************************************************************/
    function animate() {
        // This updates orbit controls every frame
        controls.update();

        // This allows the pieces to drop down. The X and O pieces start out higher than their original
        // position of 960 now.
        // If you change the speed, be sure it is a clean divisor of the starting y position minus 960
        // For example, right now it's 2560 - 960 which equals 1600. The speed of 400 divides cleanly into
        // 1600, meaning it will end nicely on 960 instead of some other weird position
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++){
                if (newTableArray[i][j][1]) {
                    if (newTableArray[i][j][1].position.y > 960)
                        newTableArray[i][j][1].position.y -= 400;
                }
            }
        }
        pickHelper.pick(pickPosition, scene, camera);
        render();
    }
    function render() {
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}
main();
