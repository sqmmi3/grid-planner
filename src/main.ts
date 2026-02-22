import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10,10,10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.mouseButtons = {
  LEFT: null as any,
  MIDDLE: THREE.MOUSE.PAN,
  RIGHT: THREE.MOUSE.ROTATE,
};

const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0xcccccc);
scene.add(gridHelper);

const planeGeometry = new THREE.PlaneGeometry(20,20);
const planeMaterial = new THREE.MeshStandardMaterial({ color:0xffffff , visible: false });
const floor = new THREE.Mesh(planeGeometry, planeMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(5, 10, 5);
scene.add(sun);

let isDragging = false;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const objects: THREE.Mesh[] = [];

const ghostGeometry = new THREE.BoxGeometry(0.96, 0.51, 0.96);
const ghostMaterial = new THREE.MeshStandardMaterial({
  color: 0x3498db,
  transparent: true,
  opacity: 0.4,
  depthWrite: false
});
const ghostBox = new THREE.Mesh(ghostGeometry, ghostMaterial);
scene.add(ghostBox);

type ModuleType = 'base' | 'tall' | 'flat';
let currentSelection: ModuleType = 'base';

const moduleData = {
  base: {
    geometry: new THREE.BoxGeometry(0.95, 1.0, 0.95),
    material: new THREE.MeshStandardMaterial({ color: 0x3498db }), // Blue
    height: 1
  },
  tall: {
    geometry: new THREE.BoxGeometry(0.95, 2.0, 0.95),
    material: new THREE.MeshStandardMaterial({ color: 0x95a5a6 }), // Gray
    height: 2
  },
  flat: {
    geometry: new THREE.BoxGeometry(0.95, 0.1, 0.95),
    material: new THREE.MeshStandardMaterial({ color: 0x2ecc71 }), // Green
    height: 0.1
  }
};

globalThis.addEventListener('pointermove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(floor);

  if (intersects.length > 0) {
    ghostBox.visible = true;
    const point = intersects[0].point;

    const snapX = Math.round(point.x) + 0.5;
    const snapZ = Math.round(point.z) + 0.5;
    
    const h = moduleData[currentSelection].height;
    ghostBox.position.set(snapX, h / 2, snapZ);

    const isOccupied = objects.some(object => object.position.x === snapX && object.position.z === snapZ);
    ghostMaterial.color.setHex(isOccupied ? 0xff4444 : 0x3498db);
    ghostMaterial.opacity = isOccupied ? 1 : 0.4;

    if (isDragging && !isOccupied) {
      spawnBox(snapX, snapZ);
    }
  } else {
    ghostBox.visible = false;
  }
});

// window.addEventListener('click', (event) => {
//   mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//   mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

//   raycaster.setFromCamera(mouse, camera);
//   const intersects = raycaster.intersectObject(floor);

//   if (intersects.length > 0) {
//     const point = intersects[0].point;
//     const snapX = Math.round(point.x) + 0.5;
//     const snapZ = Math.round(point.z) + 0.5;
//     spawnBox(snapX, snapZ);
//   }
// });

globalThis.addEventListener('pointerdown', (event) => {
  if (event.button != 0) return;

  if (event.shiftKey) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(objects);
    if (intersects.length > 0) {
      const objectToDelete = intersects[0].object as THREE.Mesh;
      scene.remove(objectToDelete);

      const index = objects.indexOf(objectToDelete);
      if (index > -1) objects.splice(index, 1);

      objectToDelete.geometry.dispose();
      if (!Array.isArray(objectToDelete.material)) objectToDelete.material.dispose();

      ghostMaterial.color.setHex(0x3498db);
    }
    return;
  }
  isDragging = true;
  if (ghostBox.visible) {
    spawnBox(ghostBox.position.x, ghostBox.position.z);
  }
});

globalThis.addEventListener('pointerup', (event) => {
  if (event.button === 0) {
    isDragging = false;
  }
});

// window.addEventListener('contextmenu', (event) => {
//   event.preventDefault();

//   mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//   mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

//   raycaster.setFromCamera(mouse, camera);

//   const intersects = raycaster.intersectObjects(objects);

//   if (intersects.length > 0) {
//     const objectToDelete = intersects[0].object as THREE.Mesh;
//     scene.remove(objectToDelete);
//     const index = objects.indexOf(objectToDelete);
//     if (index > -1) {
//       objects.splice(index, 1);
//     }

//     objectToDelete.geometry.dispose();
//     if (!Array.isArray(objectToDelete.material)) {
//       objectToDelete.material.dispose();
//     }

//     ghostMaterial.color.setHex(0x3498db);
//   }
// });

globalThis.addEventListener('contextmenu', (event) => event.preventDefault());

function spawnBox(x: number, z: number) {
  const isOccupied = objects.some(object => object.position.x === x && object.position.z === z);
  if (isOccupied) return;

  const config = moduleData[currentSelection];

  const mesh = new THREE.Mesh(config.geometry, config.material);

  mesh.position.set(x, config.height / 2, z);
  
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  scene.add(mesh);
  objects.push(mesh);

  // const geometry = new THREE.BoxGeometry(0.95, 0.5, 0.95);
  // const material = new THREE.MeshStandardMaterial({ color: 0x3498db });
  // const box = new THREE.Mesh(geometry, material);

  // box.position.set(x, 0.25, z);
  // scene.add(box);
  // objects.push(box);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

document.getElementById('btn-clear')?.addEventListener('click', () => {
  objects.forEach(obj => scene.remove(obj));
  objects.length = 0;
});

document.getElementById('btn-base')?.addEventListener('click', () => setSelection('base'));
document.getElementById('btn-tall')?.addEventListener('click', () => setSelection('tall'));
document.getElementById('btn-flat')?.addEventListener('click', () => setSelection('flat'));

function setSelection(type: ModuleType) {
  currentSelection = type;
  ghostBox.geometry = moduleData[type].geometry;
}