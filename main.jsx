import * as THREE from 'three'
import './style.css'
import { TransformControls } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

// Scene
const scene = new THREE.Scene();

// Light
const light1 = new THREE.PointLight(0xffffff, 100, 100);
light1.position.set(0, 20, -10);
scene.add(light1);

const light2 = new THREE.PointLight(0xffffff, 100, 100);
light2.position.set(0, 20, 0);
scene.add(light2);

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

// Renderer
const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(2);

// Camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 20;
camera.position.y = 20;
camera.position.x = 0;
camera.rotateX(-Math.PI / 4);
scene.add(camera);

// Create spheres
const geometry = new THREE.SphereGeometry(1, 64, 64);
const material = [
    new THREE.MeshStandardMaterial({ color: 0xfFF00FF, transparent: true }),
    new THREE.MeshStandardMaterial({ color: 0xF64A8A, transparent: true }),
    new THREE.MeshStandardMaterial({ color: 0xFF69B4, transparent: true })
];

const cubes = [
    new THREE.Mesh(geometry, material[0]),
    new THREE.Mesh(geometry, material[1]),
    new THREE.Mesh(geometry, material[2])
];

cubes[0].position.x = -2;
cubes[1].position.x = 0;
cubes[2].position.x = 2;

cubes.forEach((c) => {
    scene.add(c);
});

// Transform controls
const transformControlsArray = cubes.map(cube => {
    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.attach(cube);
    transformControls.setMode('translate');
    transformControls.showY = false; // Disable Y-axis transformation
    transformControls.visible = false; // Initially hide TransformControls
    scene.add(transformControls);
    return transformControls;
});

// Add event listener for each cube to control TransformControls visibility
cubes.forEach((cube, index) => {
    cube.addEventListener('mouseover', () => {
        // Hide all transform controls first
        transformControlsArray.forEach(transformControls => {
            transformControls.visible = true;
        });
        // Show only the transform controls associated with the hovered cube
        transformControlsArray[index].visible = false;
    });
    cube.addEventListener('mouseleave', () => {
        // Hide all transform controls when mouse leaves any cube
        transformControlsArray.forEach(transformControls => {
            transformControls.visible = false;
        });
    });
});

// Resize
window.addEventListener("resize", () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
});

// Grid
const gridHelper = new THREE.GridHelper(100, 50 ,0x444444, 0x000000 );
gridHelper.position.y = -1;
gridHelper.rotateY(Math.PI / 4);
scene.add(gridHelper);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
    event.preventDefault();

    // Calculate normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with the mouse position
    raycaster.setFromCamera(mouse, camera);

    // Check for intersections between the raycaster and the cubes
    const intersects = raycaster.intersectObjects(cubes);

    if (intersects.length > 0) {
        // If there are intersections, show transform controls for the intersected cube
        const intersectedCube = intersects[0].object;
        const index = cubes.indexOf(intersectedCube);
        transformControlsArray.forEach((transformControls, i) => {
            transformControls.visible = i === index;
        });
    } else {
        // If no intersections, hide all transform controls
        transformControlsArray.forEach(transformControls => {
            transformControls.visible = false;
        });
    }
}


window.addEventListener('mousemove', onMouseMove, false);

// Stats
const stats = new Stats();
document.body.appendChild(stats.dom);

// Loop
const loop = () => {
    renderer.render(scene, camera);
    window.requestAnimationFrame(loop);
};

loop();

// Animation
function animate() {
    requestAnimationFrame(animate);

    cubes.forEach(cube => {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.011;
    });

    stats.update();
    render();
}

// Render function
const render = () => {
    renderer.render(scene, camera);
    renderer.setClearColor(0x000000); // Set black as initial clear color
    
    // Create a gradient texture
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#00008B'); // Start color
    gradient.addColorStop(0.5, '#FF69B4'); // Middle color
    gradient.addColorStop(1, '#ffffff'); // End color
    
    // Fill with gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Use the gradient texture as the background
    const gradientTexture = new THREE.CanvasTexture(canvas);
    scene.background = gradientTexture;
};



render();

animate();
