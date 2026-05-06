const canvas = document.getElementById('hero-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
const group = new THREE.Group();
const bubbleGroup = new THREE.Group();

const resizeRenderer = () => {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== width || canvas.height !== height) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
};

const createOrb = () => {
  const geometry = new THREE.IcosahedronGeometry(1.3, 3);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x7c5cff,
    metalness: 0.18,
    roughness: 0.15,
    transmission: 0.4,
    clearcoat: 0.9,
    clearcoatRoughness: 0.1,
    transparent: true,
    opacity: 0.98,
  });
  const orb = new THREE.Mesh(geometry, material);
  group.add(orb);

  const wireframe = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    new THREE.LineBasicMaterial({ color: 0xc7d4ff, opacity: 0.55, transparent: true })
  );
  group.add(wireframe);
};

const createParticles = () => {
  const particleCount = 120;
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i += 1) {
    const radius = 2.6 + Math.random() * 1.4;
    const angle = Math.random() * Math.PI * 2;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 0.8;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
  }
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xa8c5ff,
    size: 0.05,
    opacity: 0.9,
    transparent: true,
  });
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  group.add(particles);
};

const setupLights = () => {
  const ambient = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambient);
  const spotlight = new THREE.PointLight(0x7c5cff, 1.3, 10);
  spotlight.position.set(2.5, 2.2, 2.8);
  scene.add(spotlight);
};

const createBubble = (position, scale) => {
  const geometry = new THREE.SphereGeometry(0.18 * scale, 32, 32);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x8fb8ff,
    metalness: 0,
    roughness: 0.05,
    transmission: 0.92,
    thickness: 0.8,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    opacity: 0.24,
    transparent: true,
  });
  const bubble = new THREE.Mesh(geometry, material);
  bubble.position.copy(position);
  bubble.scale.setScalar(scale);
  bubble.userData = {
    baseY: position.y,
    phase: Math.random() * Math.PI * 2,
    speed: 0.6 + Math.random() * 0.4,
  };
  bubbleGroup.add(bubble);
};

const createBubbles = () => {
  const bubblePositions = [
    new THREE.Vector3(-1.9, 0.8, -0.8),
    new THREE.Vector3(1.7, 0.5, -1.2),
    new THREE.Vector3(-1.4, -0.85, 0.7),
    new THREE.Vector3(1.3, -0.55, 0.9),
    new THREE.Vector3(0.25, 1.4, 0.35),
  ];
  bubblePositions.forEach((position, index) => createBubble(position, 0.72 + index * 0.08));
};

const initScene = () => {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  camera.position.set(0, 0, 5.1);
  scene.add(group);
  scene.add(bubbleGroup);
  createOrb();
  createParticles();
  createBubbles();
  setupLights();
};

const clock = new THREE.Clock();
const animate = () => {
  resizeRenderer();
  const elapsed = clock.getElapsedTime();
  group.rotation.y = elapsed * 0.23;
  group.rotation.x = Math.sin(elapsed * 0.17) * 0.12;
  group.rotation.z = Math.sin(elapsed * 0.08) * 0.08;

  bubbleGroup.children.forEach((bubble) => {
    bubble.position.y = bubble.userData.baseY + Math.sin(elapsed * bubble.userData.speed + bubble.userData.phase) * 0.16;
    bubble.position.x += Math.cos(elapsed * bubble.userData.speed * 0.4 + bubble.userData.phase) * 0.0012;
    bubble.rotation.y += 0.004;
  });

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

window.addEventListener('resize', resizeRenderer);

initScene();
animate();
