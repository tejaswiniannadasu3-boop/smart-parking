import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ParkingSlot, ParkingZone, SlotStatus } from '../types';
import {
  Compass,
  Eye,
  Maximize2,
  Minimize2,
  Moon,
  Navigation,
  RotateCcw,
  Sun,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

interface Parking3DViewProps {
  slots: ParkingSlot[];
  zones: ParkingZone[];
  selectedSlotId: string | null;
  activeGate: string; // 'Gate 1' | 'Gate 2' | 'Gate 3' | 'Gate 4'
  onSelectSlot: (slot: ParkingSlot) => void;
  showNavigationPath?: boolean;
  navTargetSlotId?: string | null;
}

export const Parking3DView: React.FC<Parking3DViewProps> = ({
  slots,
  zones,
  selectedSlotId,
  activeGate,
  onSelectSlot,
  showNavigationPath = true,
  navTargetSlotId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameId = useRef<number | null>(null);

  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [hoveredSlot, setHoveredSlot] = useState<ParkingSlot | null>(null);
  const [cameraPreset, setCameraPreset] = useState<string>('iso');

  // References for interactive objects
  const slotMeshesRef = useRef<Map<string, { mesh: THREE.Mesh; outline: THREE.LineSegments }>>(new Map());
  const carMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const pinMarkerRef = useRef<THREE.Group | null>(null);
  const navPathMeshRef = useRef<THREE.Line | null>(null);

  // Orbit navigation state
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const cameraSphericalRef = useRef<{ radius: number; theta: number; phi: number }>({
    radius: 75,
    theta: Math.PI / 4,
    phi: Math.PI / 3,
  });

  // Color mapping
  const STATUS_COLORS: Record<SlotStatus, number> = {
    AVAILABLE: 0x10b981, // Emerald Green
    OCCUPIED: 0xef4444, // Crimson Red
    RESERVED: 0xf59e0b, // Amber
    SELECTED: 0x06b6d4, // Cyan
  };

  // Helper to create low-poly stylized 3D car
  const create3DCar = (type: string, colorHex?: number): THREE.Group => {
    const carGroup = new THREE.Group();

    const carColors = [0x2563eb, 0xdc2626, 0x1e293b, 0xffffff, 0x475569, 0x059669];
    const baseColor = colorHex || carColors[Math.floor(Math.random() * carColors.length)];

    // Body dimensions based on type
    const isSUV = type === 'SUV';
    const isEV = type === 'EV';
    const bodyLength = isSUV ? 4.2 : 3.8;
    const bodyWidth = isSUV ? 2.1 : 1.9;
    const bodyHeight = isSUV ? 1.0 : 0.8;

    // Lower Chassis
    const chassisGeo = new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyLength);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: 0.3,
      metalness: 0.6,
    });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.y = 0.55;
    chassis.castShadow = true;
    chassis.receiveShadow = true;
    carGroup.add(chassis);

    // Cabin / Roof
    const cabinLength = isSUV ? 2.4 : 2.0;
    const cabinWidth = bodyWidth * 0.88;
    const cabinHeight = isSUV ? 0.9 : 0.7;
    const cabinGeo = new THREE.BoxGeometry(cabinWidth, cabinHeight, cabinLength);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.9,
    });
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 0.55 + bodyHeight / 2 + cabinHeight / 2, -0.2);
    cabin.castShadow = true;
    carGroup.add(cabin);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
    wheelGeo.rotateZ(Math.PI / 2);

    const wheelOffsets = [
      { x: bodyWidth / 2 + 0.05, z: bodyLength / 2 - 0.7 },
      { x: -(bodyWidth / 2 + 0.05), z: bodyLength / 2 - 0.7 },
      { x: bodyWidth / 2 + 0.05, z: -(bodyLength / 2 - 0.7) },
      { x: -(bodyWidth / 2 + 0.05), z: -(bodyLength / 2 - 0.7) },
    ];

    wheelOffsets.forEach((pos) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(pos.x, 0.35, pos.z);
      wheel.castShadow = true;
      carGroup.add(wheel);
    });

    // Headlights (Front is +Z)
    const lightGeo = new THREE.BoxGeometry(0.3, 0.15, 0.1);
    const headLightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.8,
    });
    const hlLeft = new THREE.Mesh(lightGeo, headLightMat);
    hlLeft.position.set(bodyWidth / 2 - 0.3, 0.6, bodyLength / 2 + 0.02);
    const hlRight = new THREE.Mesh(lightGeo, headLightMat);
    hlRight.position.set(-(bodyWidth / 2 - 0.3), 0.6, bodyLength / 2 + 0.02);
    carGroup.add(hlLeft, hlRight);

    // Tail lights (Back is -Z)
    const tailLightMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 0.7,
    });
    const tlLeft = new THREE.Mesh(lightGeo, tailLightMat);
    tlLeft.position.set(bodyWidth / 2 - 0.3, 0.6, -(bodyLength / 2 + 0.02));
    const tlRight = new THREE.Mesh(lightGeo, tailLightMat);
    tlRight.position.set(-(bodyWidth / 2 - 0.3), 0.6, -(bodyLength / 2 + 0.02));
    carGroup.add(tlLeft, tlRight);

    // If EV, add glowing green emblem on hood
    if (isEV) {
      const evEmblem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.05, 12),
        new THREE.MeshStandardMaterial({
          color: 0x10b981,
          emissive: 0x10b981,
          emissiveIntensity: 1.2,
        })
      );
      evEmblem.position.set(0, 0.55 + bodyHeight / 2 + 0.02, bodyLength / 2 - 0.5);
      carGroup.add(evEmblem);
    }

    return carGroup;
  };

  // Setup Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(isNightMode ? 0x090d16 : 0x0f172a);
    scene.fog = new THREE.FogExp2(isNightMode ? 0x090d16 : 0x0f172a, 0.008);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    cameraRef.current = camera;
    updateCameraPosition();

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(isNightMode ? 0x334155 : 0x94a3b8, isNightMode ? 0.9 : 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, isNightMode ? 0.6 : 1.8);
    dirLight.position.set(35, 60, 40);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 150;
    dirLight.shadow.camera.left = -50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = -50;
    scene.add(dirLight);

    // Garage floor
    const floorGeo = new THREE.PlaneGeometry(90, 90);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Asphalt Drive Lanes
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.85,
    });

    // Central crossroad (X-axis and Z-axis main driving corridors)
    const mainAvenue = new THREE.Mesh(new THREE.PlaneGeometry(16, 84), roadMat);
    mainAvenue.rotation.x = -Math.PI / 2;
    mainAvenue.position.set(-7, 0.01, 0);
    mainAvenue.receiveShadow = true;
    scene.add(mainAvenue);

    const crossAvenue = new THREE.Mesh(new THREE.PlaneGeometry(84, 14), roadMat);
    crossAvenue.rotation.x = -Math.PI / 2;
    crossAvenue.position.set(0, 0.01, -9);
    crossAvenue.receiveShadow = true;
    scene.add(crossAvenue);

    // Lane markings (dashed yellow center lines)
    const dashLineMat = new THREE.MeshBasicMaterial({ color: 0xeab308 });
    for (let z = -36; z <= 36; z += 4) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 2), dashLineMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(-7, 0.03, z);
      scene.add(dash);
    }

    // Pedestrian crosswalk stripes
    const zebraMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let x = -13; x <= -1; x += 1.8) {
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 4), zebraMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(x, 0.03, 0);
      scene.add(stripe);
    }

    // Outer boundary walls / curbs
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
    const wall1 = new THREE.Mesh(new THREE.BoxGeometry(86, 1.2, 1), curbMat);
    wall1.position.set(0, 0.6, -42);
    const wall2 = new THREE.Mesh(new THREE.BoxGeometry(86, 1.2, 1), curbMat);
    wall2.position.set(0, 0.6, 42);
    const wall3 = new THREE.Mesh(new THREE.BoxGeometry(1, 1.2, 86), curbMat);
    wall3.position.set(-42, 0.6, 0);
    const wall4 = new THREE.Mesh(new THREE.BoxGeometry(1, 1.2, 86), curbMat);
    wall4.position.set(42, 0.6, 0);
    scene.add(wall1, wall2, wall3, wall4);

    // 4 Gates with Barrier Arms & Signboards
    const gateConfigs = [
      { name: 'Gate 1 (North Entrance)', pos: new THREE.Vector3(0, 0, -40), rot: 0, color: 0x10b981 },
      { name: 'Gate 2 (South Entrance)', pos: new THREE.Vector3(0, 0, 40), rot: Math.PI, color: 0x3b82f6 },
      { name: 'Gate 3 (West Entrance)', pos: new THREE.Vector3(-40, 0, 0), rot: Math.PI / 2, color: 0xf59e0b },
      { name: 'Gate 4 (East Entrance)', pos: new THREE.Vector3(40, 0, 0), rot: -Math.PI / 2, color: 0x8b5cf6 },
    ];

    gateConfigs.forEach((gc) => {
      const gateGroup = new THREE.Group();
      gateGroup.position.copy(gc.pos);
      gateGroup.rotation.y = gc.rot;

      // Gate pillars
      const pillarGeo = new THREE.BoxGeometry(0.8, 3.5, 0.8);
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5 });
      const pLeft = new THREE.Mesh(pillarGeo, pillarMat);
      pLeft.position.set(-3.5, 1.75, 0);
      const pRight = new THREE.Mesh(pillarGeo, pillarMat);
      pRight.position.set(3.5, 1.75, 0);

      // Barrier Arm (striped red/white)
      const armGeo = new THREE.BoxGeometry(6, 0.25, 0.2);
      const armMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
      const arm = new THREE.Mesh(armGeo, armMat);
      arm.position.set(0, 1.2, 0);

      // Gate Header sign
      const signGeo = new THREE.BoxGeometry(8, 1, 0.3);
      const signMat = new THREE.MeshStandardMaterial({ color: gc.color, roughness: 0.3 });
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set(0, 3.8, 0);

      gateGroup.add(pLeft, pRight, arm, sign);
      scene.add(gateGroup);
    });

    // Zone Landmark Architectural Pillars with Banners
    const zonePillars = [
      { code: 'A', name: 'Zone A - Retail', pos: new THREE.Vector3(-22, 0, -32), color: 0x10b981 },
      { code: 'B', name: 'Zone B - Cinema', pos: new THREE.Vector3(14, 0, -32), color: 0x3b82f6 },
      { code: 'C', name: 'Zone C - Hypermarket', pos: new THREE.Vector3(-22, 0, 32), color: 0xf59e0b },
      { code: 'D', name: 'Zone D - VIP/EV', pos: new THREE.Vector3(14, 0, 32), color: 0x8b5cf6 },
    ];

    zonePillars.forEach((zp) => {
      const colGroup = new THREE.Group();
      colGroup.position.copy(zp.pos);

      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 0.8, 6, 16),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 })
      );
      pillar.position.y = 3;
      pillar.castShadow = true;

      const banner = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 1.5, 0.3),
        new THREE.MeshStandardMaterial({
          color: zp.color,
          emissive: zp.color,
          emissiveIntensity: 0.4,
        })
      );
      banner.position.set(0, 5, 0);

      colGroup.add(pillar, banner);
      scene.add(colGroup);
    });

    // 3D Pin pointer for Selected Slot
    const pinGroup = new THREE.Group();
    const pinCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.8, 1.8, 16),
      new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x06b6d4,
        emissiveIntensity: 0.8,
        metalness: 0.8,
      })
    );
    pinCone.rotation.x = Math.PI; // point downwards
    pinCone.position.y = 2.5;

    const pinRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.2, 0.08, 8, 24),
      new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x06b6d4,
        emissiveIntensity: 1.0,
      })
    );
    pinRing.rotation.x = -Math.PI / 2;
    pinRing.position.y = 0.15;

    pinGroup.add(pinCone, pinRing);
    pinGroup.visible = false;
    scene.add(pinGroup);
    pinMarkerRef.current = pinGroup;

    // Animation Loop
    let time = 0;
    const animate = () => {
      time += 0.03;
      animFrameId.current = requestAnimationFrame(animate);

      // Animate 3D Pin bouncing
      if (pinMarkerRef.current && pinMarkerRef.current.visible) {
        pinCone.position.y = 2.4 + Math.sin(time * 3) * 0.4;
        pinRing.scale.set(1 + Math.sin(time * 3) * 0.15, 1 + Math.sin(time * 3) * 0.15, 1);
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = w / h;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [isNightMode]);

  // Update Slot Bays and 3D Cars whenever slots or selectedSlotId change
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove existing slot meshes
    slotMeshesRef.current.forEach(({ mesh, outline }) => {
      scene.remove(mesh);
      scene.remove(outline);
    });
    slotMeshesRef.current.clear();

    // Remove existing cars
    carMeshesRef.current.forEach((car) => {
      scene.remove(car);
    });
    carMeshesRef.current.clear();

    const bayGeo = new THREE.PlaneGeometry(2.8, 5.0);
    const outlineEdges = new THREE.EdgesGeometry(bayGeo);

    slots.forEach((slot) => {
      const isSelected = slot.id === selectedSlotId;
      const statusColor = isSelected ? STATUS_COLORS.SELECTED : STATUS_COLORS[slot.status];

      // Bay Floor Mesh
      const bayMat = new THREE.MeshStandardMaterial({
        color: statusColor,
        transparent: true,
        opacity: isSelected ? 0.45 : slot.status === 'AVAILABLE' ? 0.25 : 0.2,
        roughness: 0.6,
      });

      const bayMesh = new THREE.Mesh(bayGeo, bayMat);
      bayMesh.rotation.x = -Math.PI / 2;
      bayMesh.position.set(slot.x, 0.02, slot.z);
      bayMesh.receiveShadow = true;
      (bayMesh as any).slotData = slot;

      // Outline Lines (Painted bay boundaries)
      const outlineMat = new THREE.LineBasicMaterial({
        color: statusColor,
        linewidth: isSelected ? 3 : 1.5,
      });
      const outline = new THREE.LineSegments(outlineEdges, outlineMat);
      outline.rotation.x = -Math.PI / 2;
      outline.position.set(slot.x, 0.03, slot.z);

      scene.add(bayMesh);
      scene.add(outline);
      slotMeshesRef.current.set(slot.id, { mesh: bayMesh, outline });

      // If OCCUPIED, add 3D Car inside
      if (slot.status === 'OCCUPIED') {
        const car = create3DCar(slot.type);
        car.position.set(slot.x, 0, slot.z);
        // Face car according to row alignment
        car.rotation.y = slot.rotation;
        scene.add(car);
        carMeshesRef.current.set(slot.id, car);
      }
    });

    // Update 3D Pin Marker position for selected slot
    if (pinMarkerRef.current) {
      const selected = slots.find((s) => s.id === selectedSlotId);
      if (selected) {
        pinMarkerRef.current.position.set(selected.x, 0, selected.z);
        pinMarkerRef.current.visible = true;
      } else {
        pinMarkerRef.current.visible = false;
      }
    }

    // Update Navigation Path if requested
    updateNavigationPath();
  }, [slots, selectedSlotId, navTargetSlotId, showNavigationPath, activeGate]);

  // Helper to draw 3D turn-by-turn navigation line from Gate to Slot
  const updateNavigationPath = () => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (navPathMeshRef.current) {
      scene.remove(navPathMeshRef.current);
      navPathMeshRef.current = null;
    }

    const targetSlot = slots.find((s) => s.id === (navTargetSlotId || selectedSlotId));
    if (!targetSlot || !showNavigationPath) return;

    // Gate starting points
    const gatePoints: Record<string, THREE.Vector3> = {
      'Gate 1': new THREE.Vector3(0, 0.1, -38),
      'Gate 2': new THREE.Vector3(0, 0.1, 38),
      'Gate 3': new THREE.Vector3(-38, 0.1, 0),
      'Gate 4': new THREE.Vector3(38, 0.1, 0),
    };

    const start = gatePoints[activeGate] || gatePoints['Gate 1'];
    // Create waypoint route along central corridor to target slot
    const waypoints: THREE.Vector3[] = [
      start.clone(),
      new THREE.Vector3(-7, 0.1, start.z > 0 ? 20 : -20),
      new THREE.Vector3(-7, 0.1, targetSlot.z),
      new THREE.Vector3(targetSlot.x, 0.1, targetSlot.z),
    ];

    const curve = new THREE.CatmullRomCurve3(waypoints, false, 'chordal', 0.2);
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineDashedMaterial({
      color: 0x06b6d4, // Cyan navigation line
      dashSize: 1.5,
      gapSize: 0.8,
      linewidth: 3,
    });

    const pathLine = new THREE.Line(geometry, material);
    pathLine.computeLineDistances();
    scene.add(pathLine);
    navPathMeshRef.current = pathLine;
  };

  // Camera preset handlers
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = cameraSphericalRef.current;
    const target = cameraTargetRef.current;

    cameraRef.current.position.x = target.x + radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = target.y + radius * Math.cos(phi);
    cameraRef.current.position.z = target.z + radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(target);
  };

  const applyCameraPreset = (preset: string) => {
    setCameraPreset(preset);
    soundEffects.playSlotSelect();

    if (preset === 'top') {
      cameraSphericalRef.current = { radius: 75, theta: 0, phi: 0.05 };
      cameraTargetRef.current.set(0, 0, 0);
    } else if (preset === 'iso') {
      cameraSphericalRef.current = { radius: 70, theta: Math.PI / 4, phi: Math.PI / 3.2 };
      cameraTargetRef.current.set(0, 0, 0);
    } else if (preset === 'gate1') {
      cameraSphericalRef.current = { radius: 55, theta: 0, phi: Math.PI / 2.6 };
      cameraTargetRef.current.set(0, 0, -10);
    } else if (preset === 'zoneA') {
      cameraSphericalRef.current = { radius: 38, theta: Math.PI / 5, phi: Math.PI / 3.5 };
      cameraTargetRef.current.set(-18, 0, -16);
    } else if (preset === 'zoneB') {
      cameraSphericalRef.current = { radius: 38, theta: -Math.PI / 5, phi: Math.PI / 3.5 };
      cameraTargetRef.current.set(12, 0, -16);
    } else if (preset === 'zoneC') {
      cameraSphericalRef.current = { radius: 38, theta: Math.PI / 1.3, phi: Math.PI / 3.5 };
      cameraTargetRef.current.set(-18, 0, 16);
    } else if (preset === 'zoneD') {
      cameraSphericalRef.current = { radius: 38, theta: -Math.PI / 1.3, phi: Math.PI / 3.5 };
      cameraTargetRef.current.set(12, 0, 16);
    }
    updateCameraPosition();
  };

  // Mouse & Touch Orbit Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;

    if (isDraggingRef.current) {
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      cameraSphericalRef.current.theta -= deltaX * 0.008;
      cameraSphericalRef.current.phi = Math.max(
        0.1,
        Math.min(Math.PI / 2 - 0.05, cameraSphericalRef.current.phi - deltaY * 0.008)
      );

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
      updateCameraPosition();
      return;
    }

    // Raycasting for Slot hover
    const rect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const interactiveMeshes = Array.from(slotMeshesRef.current.values()).map((v) => v.mesh);
    const intersects = raycaster.intersectObjects(interactiveMeshes);

    if (intersects.length > 0) {
      const hitSlot = (intersects[0].object as any).slotData as ParkingSlot;
      setHoveredSlot(hitSlot);
      containerRef.current.style.cursor = 'pointer';
    } else {
      setHoveredSlot(null);
      containerRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!containerRef.current || !cameraRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const interactiveMeshes = Array.from(slotMeshesRef.current.values()).map((v) => v.mesh);
    const intersects = raycaster.intersectObjects(interactiveMeshes);

    if (intersects.length > 0) {
      const clickedSlot = (intersects[0].object as any).slotData as ParkingSlot;
      soundEffects.playSlotSelect();
      onSelectSlot(clickedSlot);

      // Smooth focus towards slot
      cameraTargetRef.current.lerp(new THREE.Vector3(clickedSlot.x, 0, clickedSlot.z), 0.5);
      updateCameraPosition();
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    cameraSphericalRef.current.radius = Math.max(
      20,
      Math.min(130, cameraSphericalRef.current.radius + e.deltaY * 0.05)
    );
    updateCameraPosition();
  };

  return (
    <div className="relative w-full h-full min-h-[480px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* 3D WebGL Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full flex-1 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
      />

      {/* Top Floating Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        {/* Slot Status Color Legend */}
        <div className="pointer-events-auto bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl px-4 py-2 flex items-center gap-4 text-xs font-medium text-slate-200 shadow-lg">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span>Available ({slots.filter((s) => s.status === 'AVAILABLE').length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            <span>Occupied ({slots.filter((s) => s.status === 'OCCUPIED').length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            <span>Reserved ({slots.filter((s) => s.status === 'RESERVED').length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <span>Selected</span>
          </div>
        </div>

        {/* View Camera Presets & Lighting Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 flex items-center gap-1 shadow-lg text-xs">
            <button
              onClick={() => applyCameraPreset('iso')}
              className={`px-2.5 py-1.5 rounded-lg transition ${
                cameraPreset === 'iso' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              3D View
            </button>
            <button
              onClick={() => applyCameraPreset('top')}
              className={`px-2.5 py-1.5 rounded-lg transition ${
                cameraPreset === 'top' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              2D Map
            </button>
            <button
              onClick={() => applyCameraPreset('gate1')}
              className={`px-2.5 py-1.5 rounded-lg transition ${
                cameraPreset === 'gate1' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Gate 1
            </button>
          </div>

          <button
            onClick={() => {
              setIsNightMode(!isNightMode);
              soundEffects.playSlotSelect();
            }}
            className="pointer-events-auto p-2 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/80 text-slate-300 hover:text-white transition shadow-lg"
            title={isNightMode ? 'Switch to Daylight' : 'Switch to Night Lights'}
          >
            {isNightMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Hovered Slot Quick Card */}
      {hoveredSlot && (
        <div className="absolute bottom-4 left-4 pointer-events-none bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 text-slate-200 text-xs shadow-xl min-w-[200px] animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-sm text-cyan-400">Bay {hoveredSlot.slotNumber}</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                hoveredSlot.status === 'AVAILABLE'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : hoveredSlot.status === 'OCCUPIED'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {hoveredSlot.status}
            </span>
          </div>
          <div className="space-y-1 text-slate-400">
            <div>
              Zone: <span className="text-slate-200 font-medium">Zone {hoveredSlot.zoneCode}</span> ({hoveredSlot.type} Bay)
            </div>
            <div>
              Rate: <span className="text-emerald-400 font-medium">${hoveredSlot.hourlyRate}/hour</span>
            </div>
            {hoveredSlot.currentVehiclePlate && (
              <div className="text-red-300">
                Parked: <span className="font-mono">{hoveredSlot.currentVehiclePlate}</span> ({hoveredSlot.currentVehicleModel})
              </div>
            )}
            <div className="text-[11px] text-cyan-300/80 italic pt-1">Click bay to inspect or book</div>
          </div>
        </div>
      )}

      {/* Bottom Floating Navigation Indicator */}
      {selectedSlotId && (
        <div className="absolute bottom-4 right-4 pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 rounded-xl px-3.5 py-2 text-xs flex items-center gap-3 text-slate-200 shadow-xl">
          <Navigation size={15} className="text-cyan-400 animate-pulse" />
          <span>
            Route plotted from <strong className="text-cyan-300">{activeGate}</strong> to bay{' '}
            <strong className="text-cyan-300">
              {slots.find((s) => s.id === selectedSlotId)?.slotNumber}
            </strong>
          </span>
        </div>
      )}
    </div>
  );
};
