'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface DiceProps {
  value: number | null;
  isRolling: boolean;
  onClick?: () => void;
  disabled?: boolean;
  dotColor?: string;
}

// Generate high-resolution 512x512 canvas texture for dice face
function createDiceFaceTexture(num: number, pipHex: string = '#6558E8'): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // 1. Crisp white/cream background with soft radial light
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, size, size);

  const bgGrad = ctx.createRadialGradient(
    size * 0.45,
    size * 0.4,
    size * 0.1,
    size / 2,
    size / 2,
    size * 0.72
  );
  bgGrad.addColorStop(0, '#FFFFFF');
  bgGrad.addColorStop(0.7, '#FBF9F5');
  bgGrad.addColorStop(1, '#EDE6D8');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  // 2. Subtle soft rounded bevel border
  ctx.strokeStyle = '#E2DAD0';
  ctx.lineWidth = 16;
  ctx.strokeRect(8, 8, size - 16, size - 16);

  // 3. Pips drawing helper
  const drawPip = (x: number, y: number, isBigRed: boolean = false) => {
    const radius = isBigRed ? 64 : 44;

    // Pip soft depth shadow
    ctx.beginPath();
    ctx.arc(x, y + 4, radius + 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fill();

    // Pip main sphere color
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);

    if (isBigRed) {
      // Coral / Ruby Red for 1
      const redGrad = ctx.createRadialGradient(
        x - radius * 0.3,
        y - radius * 0.3,
        radius * 0.1,
        x,
        y,
        radius
      );
      redGrad.addColorStop(0, '#FF7A7A');
      redGrad.addColorStop(0.65, '#EF4444');
      redGrad.addColorStop(1, '#B91C1C');
      ctx.fillStyle = redGrad;
    } else {
      // Dynamic user-customized dot color for 2 to 6
      const dotGrad = ctx.createRadialGradient(
        x - radius * 0.3,
        y - radius * 0.3,
        radius * 0.1,
        x,
        y,
        radius
      );
      dotGrad.addColorStop(0, '#FFFFFF');
      dotGrad.addColorStop(0.2, pipHex);
      dotGrad.addColorStop(1, '#1A1828');
      ctx.fillStyle = dotGrad;
    }
    ctx.fill();

    // Specular glossy reflection
    ctx.beginPath();
    ctx.arc(
      x - radius * 0.35,
      y - radius * 0.35,
      radius * 0.28,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fill();
  };

  const center = size / 2;
  const left = size * 0.27;
  const right = size * 0.73;
  const top = size * 0.27;
  const bottom = size * 0.73;

  switch (num) {
    case 1:
      drawPip(center, center, true);
      break;
    case 2:
      drawPip(left, top);
      drawPip(right, bottom);
      break;
    case 3:
      drawPip(left, top);
      drawPip(center, center);
      drawPip(right, bottom);
      break;
    case 4:
      drawPip(left, top);
      drawPip(right, top);
      drawPip(left, bottom);
      drawPip(right, bottom);
      break;
    case 5:
      drawPip(left, top);
      drawPip(right, top);
      drawPip(center, center);
      drawPip(left, bottom);
      drawPip(right, bottom);
      break;
    case 6:
      drawPip(left, top);
      drawPip(right, top);
      drawPip(left, center);
      drawPip(right, center);
      drawPip(left, bottom);
      drawPip(right, bottom);
      break;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

export const Dice: React.FC<DiceProps> = ({
  value,
  isRolling,
  onClick,
  disabled,
  dotColor = '#6558E8',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const diceMeshRef = useRef<THREE.Mesh | null>(null);
  const shadowMeshRef = useRef<THREE.Mesh | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const angularVelocity = useRef({ x: 0, y: 0, z: 0 });
  const targetRotation = useRef<{ x: number; y: number; z: number } | null>(null);
  const currentHeight = useRef(0);
  const heightVelocity = useRef(0);

  // Target rotations for each face to squarely face the camera
  // BoxGeometry face materials order:
  // 0: +X (3), 1: -X (4), 2: +Y (5), 3: -Y (2), 4: +Z (1), 5: -Z (6)
  const faceTargetRotations: Record<number, { x: number; y: number; z: number }> = {
    1: { x: 0, y: 0, z: 0 },
    6: { x: 0, y: Math.PI, z: 0 },
    3: { x: 0, y: -Math.PI / 2, z: 0 },
    4: { x: 0, y: Math.PI / 2, z: 0 },
    5: { x: Math.PI / 2, y: 0, z: 0 },
    2: { x: -Math.PI / 2, y: 0, z: 0 },
  };

  // Update materials when dotColor changes
  useEffect(() => {
    if (!diceMeshRef.current) return;
    const materials = [
      new THREE.MeshStandardMaterial({ map: createDiceFaceTexture(3, dotColor), roughness: 0.15, metalness: 0.05 }),
      new THREE.MeshStandardMaterial({ map: createDiceFaceTexture(4, dotColor), roughness: 0.15, metalness: 0.05 }),
      new THREE.MeshStandardMaterial({ map: createDiceFaceTexture(5, dotColor), roughness: 0.15, metalness: 0.05 }),
      new THREE.MeshStandardMaterial({ map: createDiceFaceTexture(2, dotColor), roughness: 0.15, metalness: 0.05 }),
      new THREE.MeshStandardMaterial({ map: createDiceFaceTexture(1, dotColor), roughness: 0.15, metalness: 0.05 }),
      new THREE.MeshStandardMaterial({ map: createDiceFaceTexture(6, dotColor), roughness: 0.15, metalness: 0.05 }),
    ];
    diceMeshRef.current.material = materials;
  }, [dotColor]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = 104;
    const height = 104;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.0);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Crisp warm studio lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.3);
    dirLight1.position.set(4, 6, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xfff8f0, 0.6);
    dirLight2.position.set(-4, -4, -2);
    scene.add(dirLight2);

    const geometry = new THREE.BoxGeometry(1.65, 1.65, 1.65);
    const materials = [
      new THREE.MeshStandardMaterial({ map: createDiceFaceTexture(3, dotColor), roughness: 0.15, metalness: 0.05 }),
      new THREE.MeshStandardMaterial({ map: createDiceFaceTexture(4, dotColor), roughness: 0.15, metalness: 0.05 }),
      new THREE.MeshStandardMaterial({ map: createDiceFaceTexture(5, dotColor), roughness: 0.15, metalness: 0.05 }),
      new THREE.MeshStandardMaterial({ map: createDiceFaceTexture(2, dotColor), roughness: 0.15, metalness: 0.05 }),
      new THREE.MeshStandardMaterial({ map: createDiceFaceTexture(1, dotColor), roughness: 0.15, metalness: 0.05 }),
      new THREE.MeshStandardMaterial({ map: createDiceFaceTexture(6, dotColor), roughness: 0.15, metalness: 0.05 }),
    ];

    const diceMesh = new THREE.Mesh(geometry, materials);
    diceMesh.rotation.set(-0.25, 0.35, 0);
    scene.add(diceMesh);
    diceMeshRef.current = diceMesh;

    // Floor shadow
    const shadowGeo = new THREE.PlaneGeometry(2.5, 2.5);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d')!;
    const sGrad = sCtx.createRadialGradient(64, 64, 8, 64, 64, 60);
    sGrad.addColorStop(0, 'rgba(37, 35, 58, 0.3)');
    sGrad.addColorStop(0.5, 'rgba(37, 35, 58, 0.12)');
    sGrad.addColorStop(1, 'rgba(37, 35, 58, 0)');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.set(0, -1.22, 0);
    shadowMesh.rotation.x = -Math.PI / 2;
    scene.add(shadowMesh);
    shadowMeshRef.current = shadowMesh;

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (diceMesh) {
        if (Math.abs(angularVelocity.current.x) > 0.01 || Math.abs(angularVelocity.current.y) > 0.01) {
          diceMesh.rotation.x += angularVelocity.current.x;
          diceMesh.rotation.y += angularVelocity.current.y;
          diceMesh.rotation.z += angularVelocity.current.z;

          angularVelocity.current.x *= 0.945;
          angularVelocity.current.y *= 0.945;
          angularVelocity.current.z *= 0.945;
        } else if (targetRotation.current) {
          const target = targetRotation.current;
          diceMesh.rotation.x += (target.x - diceMesh.rotation.x) * 0.15;
          diceMesh.rotation.y += (target.y - diceMesh.rotation.y) * 0.15;
          diceMesh.rotation.z += (target.z - diceMesh.rotation.z) * 0.15;
        }

        // Bouncing height physics
        if (currentHeight.current > 0 || heightVelocity.current !== 0) {
          currentHeight.current += heightVelocity.current;
          heightVelocity.current -= 0.035;

          if (currentHeight.current <= 0) {
            currentHeight.current = 0;
            if (Math.abs(heightVelocity.current) > 0.05) {
              heightVelocity.current = -heightVelocity.current * 0.45;
            } else {
              heightVelocity.current = 0;
            }
          }
          diceMesh.position.y = currentHeight.current;
        }

        if (shadowMesh) {
          const scale = 1 - Math.min(0.35, currentHeight.current * 0.3);
          shadowMesh.scale.set(scale, scale, 1);
          shadowMat.opacity = Math.max(0.2, 1 - currentHeight.current * 0.5);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      materials.forEach((m) => m.dispose());
      shadowGeo.dispose();
      shadowMat.dispose();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (isRolling) {
      targetRotation.current = null;
      angularVelocity.current = {
        x: 0.38 + Math.random() * 0.25,
        y: 0.45 + Math.random() * 0.3,
        z: 0.25 + Math.random() * 0.2,
      };
      currentHeight.current = 0.1;
      heightVelocity.current = 0.28;
    } else if (value && faceTargetRotations[value] && diceMeshRef.current) {
      const target = faceTargetRotations[value];
      const mesh = diceMeshRef.current;

      const wrap = (current: number, targetAngle: number) => {
        const twoPi = Math.PI * 2;
        const diff = (targetAngle - (current % twoPi) + Math.PI * 3) % twoPi - Math.PI;
        return current + diff;
      };

      targetRotation.current = {
        x: wrap(mesh.rotation.x, target.x),
        y: wrap(mesh.rotation.y, target.y),
        z: wrap(mesh.rotation.z, target.z),
      };
    }
  }, [isRolling, value]);

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div
        ref={containerRef}
        onClick={() => {
          if (!disabled && onClick) {
            onClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={value ? `3D Dice showing ${value}` : 'Roll 3D Dice'}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !disabled && onClick) {
            e.preventDefault();
            onClick();
          }
        }}
        className={`w-[104px] h-[104px] flex items-center justify-center cursor-pointer transition-transform duration-150 hover:scale-105 active:scale-95 ${
          disabled ? 'opacity-80 cursor-not-allowed' : ''
        }`}
      />
      <span className="text-[10px] font-bold text-[#77758A] -mt-1 tracking-tight">
        {isRolling ? 'Rolling...' : 'Tap 3D Dice to roll'}
      </span>
    </div>
  );
};
