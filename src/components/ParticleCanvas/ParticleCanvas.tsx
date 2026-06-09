import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ParticleEngine } from '@/utils/particleEngine';
import type { ParticleEmitter } from '@/types/particle';

interface ParticleCanvasProps {
  emitters: ParticleEmitter[];
  currentTime: number;
  isPlaying: boolean;
  isLooping: boolean;
  playbackRate: number;
  duration: number;
  onTimeUpdate?: (time: number) => void;
  className?: string;
}

export function ParticleCanvas({
  emitters,
  currentTime,
  isPlaying,
  isLooping,
  playbackRate,
  duration,
  onTimeUpdate,
  className = '',
}: ParticleCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const engineRef = useRef<ParticleEngine | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const internalTimeRef = useRef<number>(currentTime);
  const isPlayingRef = useRef(isPlaying);
  const emittersRef = useRef(emitters);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    emittersRef.current = emitters;
    if (engineRef.current) {
      engineRef.current.setEmitters(emitters);
    }
  }, [emitters]);

  useEffect(() => {
    if (!isPlaying) {
      internalTimeRef.current = currentTime;
      if (engineRef.current) {
        engineRef.current.setTime(currentTime);
      }
    }
  }, [currentTime, isPlaying]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0508);
    scene.fog = new THREE.FogExp2(0x0a0508, 0.03);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 12);
    camera.lookAt(0, 2, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0508, 1);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0x403040, 0.5);
    scene.add(ambientLight);

    const particleEngine = new ParticleEngine();
    particleEngine.setEmitters(emittersRef.current);
    particleEngine.setTime(internalTimeRef.current);
    scene.add(particleEngine.points);
    engineRef.current = particleEngine;

    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshBasicMaterial({
      color: 0x1a0a15,
      transparent: true,
      opacity: 0.8,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -4;
    scene.add(ground);

    const clock = new THREE.Clock();
    lastTimeRef.current = performance.now();

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      const now = performance.now();
      const rawDelta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      const delta = Math.min(rawDelta, 0.1);

      if (isPlayingRef.current) {
        internalTimeRef.current += delta * playbackRate;

        if (internalTimeRef.current >= duration) {
          if (isLooping) {
            internalTimeRef.current = 0;
            if (engineRef.current) {
              engineRef.current.clear();
              engineRef.current.setTime(0);
            }
          } else {
            internalTimeRef.current = duration;
            isPlayingRef.current = false;
          }
        }

        onTimeUpdate?.(internalTimeRef.current);
      }

      if (engineRef.current) {
        engineRef.current.update(isPlayingRef.current ? delta * playbackRate : 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (particleEngine) {
        particleEngine.dispose();
      }
      if (renderer) {
        renderer.dispose();
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className}`}
      style={{ touchAction: 'none' }}
    />
  );
}
