import * as THREE from 'three';
import type { ParticleEmitter, EmitterConfig, EmitterType } from '@/types/particle';

const MAX_PARTICLES = 8000;

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  size: number;
  life: number;
  maxLife: number;
  rotation: number;
  rotationSpeed: number;
  type: number;
  glow: number;
  opacity: number;
  active: boolean;
  emitterId: string;
}

const vertexShader = `
  attribute float aSize;
  attribute float aLife;
  attribute float aMaxLife;
  attribute vec3 aColor;
  attribute float aRotation;
  attribute float aGlow;
  attribute float aType;
  attribute float aOpacity;

  varying vec3 vColor;
  varying float vLife;
  varying float vGlow;
  varying float vType;
  varying float vRotation;
  varying float vOpacity;

  uniform float uTime;
  uniform float uPixelRatio;

  void main() {
    vColor = aColor;
    vLife = aLife / aMaxLife;
    vGlow = aGlow;
    vType = aType;
    vRotation = aRotation;
    vOpacity = aOpacity;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    
    float sizeMultiplier = 1.0;
    
    if (vType < 0.5) {
      sizeMultiplier = sin(vLife * 3.14159) * 0.6 + 0.4;
    } else if (vType < 1.5) {
      sizeMultiplier = 0.7 + 0.3 * sin(uTime * 4.0 + position.x * 15.0 + position.z * 10.0);
    } else if (vType < 2.5) {
      sizeMultiplier = 0.85 + 0.15 * sin(uTime * 2.5 + position.y * 5.0);
    } else if (vType < 3.5) {
      sizeMultiplier = 0.4 + 0.6 * (0.5 + 0.5 * sin(uTime * 5.0 + position.x * 8.0 + position.z * 6.0));
    } else {
      sizeMultiplier = 0.8 + 0.2 * sin(uTime * 6.0 + position.z * 15.0);
    }
    
    float lifeFade = smoothstep(0.0, 0.15, vLife) * (1.0 - smoothstep(0.85, 1.0, vLife));
    
    gl_PointSize = aSize * sizeMultiplier * lifeFade * uPixelRatio * 320.0 / -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vLife;
  varying float vGlow;
  varying float vType;
  varying float vRotation;
  varying float vOpacity;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    
    float alpha = 0.0;
    vec3 color = vColor;
    
    float lifeFade = smoothstep(0.0, 0.15, vLife) * (1.0 - smoothstep(0.85, 1.0, vLife));
    
    if (vType < 0.5) {
      float cosR = cos(vRotation);
      float sinR = sin(vRotation);
      vec2 rotated = vec2(
        center.x * cosR - center.y * sinR,
        center.x * sinR + center.y * cosR
      );
      
      float petal = 1.0 - (abs(rotated.x) * 0.7 + abs(rotated.y) * 1.3);
      petal = smoothstep(0.0, 0.25, petal);
      
      float outerGlow = smoothstep(0.5, 0.0, dist) * 0.3 * vGlow;
      
      alpha = (petal * 0.9 + outerGlow) * lifeFade;
      
      vec3 petalColor = vColor * (0.85 + 0.3 * sin(rotated.x * 6.0 + vRotation));
      color = petalColor;
    } 
    else if (vType < 1.5) {
      float core = smoothstep(0.3, 0.0, dist);
      float outer = smoothstep(0.5, 0.1, dist) * 0.6;
      
      float sparkle = 0.6 + 0.4 * sin(dist * 25.0 - vLife * 60.0 + vRotation * 3.0);
      
      alpha = (core + outer * vGlow) * lifeFade * sparkle;
      color = vColor * (1.0 + vGlow * 0.5);
    }
    else if (vType < 2.5) {
      vec2 uv = gl_PointCoord * 2.0 - 1.0;
      float x = uv.x * 1.3;
      float y = -uv.y * 1.3 + 0.2;
      
      float heartEquation = pow(x * x + y * y - 0.22, 3.0) - x * x * y * y * y;
      float heartMask = heartEquation < 0.0 ? 1.0 : 0.0;
      
      float edgeGlow = smoothstep(0.5, 0.15, dist) * 0.4;
      
      alpha = (heartMask * 0.95 + edgeGlow * vGlow) * lifeFade;
      
      float innerBright = smoothstep(0.25, 0.0, dist) * vGlow;
      color = vColor * (1.0 + innerBright * 0.8);
    }
    else if (vType < 3.5) {
      float core = smoothstep(0.25, 0.0, dist);
      float glow = smoothstep(0.5, 0.0, dist) * 0.7 * vGlow;
      
      float flicker = 0.6 + 0.4 * sin(vLife * 25.0 + vRotation);
      
      alpha = (core + glow) * lifeFade * flicker;
      color = vColor * (1.0 + vGlow * 0.6);
    }
    else {
      float core = smoothstep(0.12, 0.0, dist);
      
      float angle = atan(center.y, center.x);
      float rayAngle = abs(sin(angle * 4.0 + vRotation));
      float rays = smoothstep(0.4, 0.0, dist) * rayAngle * 0.4;
      
      float glow = smoothstep(0.5, 0.0, dist) * 0.35 * vGlow;
      
      float twinkle = 0.7 + 0.3 * sin(vLife * 30.0 + vRotation * 5.0);
      
      alpha = (core + rays + glow) * lifeFade * twinkle;
      color = vColor * (1.0 + vGlow * 0.5);
    }
    
    if (vGlow > 0.5) {
      float bloomGlow = smoothstep(0.5, 0.0, dist) * 0.25 * vGlow * lifeFade;
      alpha = max(alpha, bloomGlow);
    }
    
    gl_FragColor = vec4(color, alpha * vOpacity);
  }
`;

export class ParticleEngine {
  private particles: Particle[] = [];
  private particleCount = 0;
  private emitters: Map<string, ParticleEmitter> = new Map();
  private lastEmitTime: Map<string, number> = new Map();
  private time = 0;
  private globalTime = 0;

  public geometry: THREE.BufferGeometry;
  public material: THREE.ShaderMaterial;
  public points: THREE.Points;

  private positionAttribute: Float32Array;
  private colorAttribute: Float32Array;
  private sizeAttribute: Float32Array;
  private lifeAttribute: Float32Array;
  private maxLifeAttribute: Float32Array;
  private rotationAttribute: Float32Array;
  private glowAttribute: Float32Array;
  private typeAttribute: Float32Array;
  private opacityAttribute: Float32Array;

  constructor() {
    this.geometry = new THREE.BufferGeometry();
    this.positionAttribute = new Float32Array(MAX_PARTICLES * 3);
    this.colorAttribute = new Float32Array(MAX_PARTICLES * 3);
    this.sizeAttribute = new Float32Array(MAX_PARTICLES);
    this.lifeAttribute = new Float32Array(MAX_PARTICLES);
    this.maxLifeAttribute = new Float32Array(MAX_PARTICLES);
    this.rotationAttribute = new Float32Array(MAX_PARTICLES);
    this.glowAttribute = new Float32Array(MAX_PARTICLES);
    this.typeAttribute = new Float32Array(MAX_PARTICLES);
    this.opacityAttribute = new Float32Array(MAX_PARTICLES);

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positionAttribute, 3));
    this.geometry.setAttribute('aColor', new THREE.BufferAttribute(this.colorAttribute, 3));
    this.geometry.setAttribute('aSize', new THREE.BufferAttribute(this.sizeAttribute, 1));
    this.geometry.setAttribute('aLife', new THREE.BufferAttribute(this.lifeAttribute, 1));
    this.geometry.setAttribute('aMaxLife', new THREE.BufferAttribute(this.maxLifeAttribute, 1));
    this.geometry.setAttribute('aRotation', new THREE.BufferAttribute(this.rotationAttribute, 1));
    this.geometry.setAttribute('aGlow', new THREE.BufferAttribute(this.glowAttribute, 1));
    this.geometry.setAttribute('aType', new THREE.BufferAttribute(this.typeAttribute, 1));
    this.geometry.setAttribute('aOpacity', new THREE.BufferAttribute(this.opacityAttribute, 1));

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;

    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.particles.push({
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        color: new THREE.Color(),
        size: 0,
        life: 0,
        maxLife: 1,
        rotation: 0,
        rotationSpeed: 0,
        type: 0,
        glow: 1,
        opacity: 1,
        active: false,
        emitterId: '',
      });
    }
  }

  public setEmitters(emitters: ParticleEmitter[]): void {
    this.emitters.clear();
    this.lastEmitTime.clear();
    emitters.forEach((e) => {
      this.emitters.set(e.id, e);
      this.lastEmitTime.set(e.id, 0);
    });
  }

  public setTime(time: number): void {
    this.globalTime = time;
    this.time = time;
  }

  public update(deltaTime: number): void {
    this.time += deltaTime;
    this.globalTime += deltaTime;
    this.material.uniforms.uTime.value = this.globalTime;

    this.emitParticles();
    this.updateParticles(deltaTime);
    this.updateBuffers();
  }

  private emitParticles(): void {
    this.emitters.forEach((emitter) => {
      const config = emitter.config;
      const localTime = this.time;

      if (localTime < emitter.startTime || localTime > emitter.endTime) {
        return;
      }

      const emitRate = config.density / 60;
      const lastEmit = this.lastEmitTime.get(emitter.id) || 0;

      if (localTime - lastEmit >= 1 / emitRate) {
        this.emitParticle(emitter);
        this.lastEmitTime.set(emitter.id, localTime);
      }
    });
  }

  private getTypeIndex(type: EmitterType): number {
    switch (type) {
      case 'rose-petal': return 0;
      case 'gold-dust': return 1;
      case 'heart-glow': return 2;
      case 'firefly': return 3;
      case 'star-rain': return 4;
      default: return 0;
    }
  }

  private emitParticle(emitter: ParticleEmitter): void {
    const config = emitter.config;
    const typeIndex = this.getTypeIndex(emitter.type);

    let particle = this.particles.find((p) => !p.active);
    if (!particle) {
      let oldestTime = Infinity;
      let oldestIdx = -1;
      for (let i = 0; i < this.particles.length; i++) {
        if (this.particles[i].active && this.particles[i].life < oldestTime) {
          oldestTime = this.particles[i].life;
          oldestIdx = i;
        }
      }
      if (oldestIdx >= 0) {
        particle = this.particles[oldestIdx];
        particle.active = false;
      }
    }

    if (!particle || particle.active) return;

    const spread = config.spread;
    const speed = config.speed;
    const windRad = (config.windDirection * Math.PI) / 180;

    particle.emitterId = emitter.id;
    particle.type = typeIndex;
    particle.active = true;
    particle.life = 0;
    particle.glow = config.glow;
    particle.opacity = config.opacity;

    switch (typeIndex) {
      case 0:
        particle.maxLife = 3 + Math.random() * 3;
        particle.position.set(
          (Math.random() - 0.5) * spread,
          6 + Math.random() * 3,
          (Math.random() - 0.5) * spread * 0.6
        );
        particle.velocity.set(
          Math.sin(windRad) * config.windSpeed * 0.5 + (Math.random() - 0.5) * 0.5,
          -speed * (0.6 + Math.random() * 0.5),
          Math.cos(windRad) * config.windSpeed * 0.5 + (Math.random() - 0.5) * 0.3
        );
        break;
      case 1:
        particle.maxLife = 2 + Math.random() * 2;
        particle.position.set(
          (Math.random() - 0.5) * spread,
          5 + Math.random() * 4,
          (Math.random() - 0.5) * spread
        );
        particle.velocity.set(
          Math.sin(windRad) * config.windSpeed * 0.8 + (Math.random() - 0.5) * 0.2,
          -speed * (0.4 + Math.random() * 0.4),
          Math.cos(windRad) * config.windSpeed * 0.8 + (Math.random() - 0.5) * 0.2
        );
        break;
      case 2:
        particle.maxLife = 2.5 + Math.random() * 2;
        particle.position.set(
          (Math.random() - 0.5) * spread,
          -1 + Math.random() * 1,
          (Math.random() - 0.5) * spread * 0.5
        );
        particle.velocity.set(
          (Math.random() - 0.5) * 0.4,
          speed * (0.7 + Math.random() * 0.5),
          (Math.random() - 0.5) * 0.3
        );
        break;
      case 3:
        particle.maxLife = 3 + Math.random() * 3;
        particle.position.set(
          (Math.random() - 0.5) * spread,
          Math.random() * 5,
          (Math.random() - 0.5) * spread
        );
        particle.velocity.set(
          (Math.random() - 0.5) * speed * 0.4,
          (Math.random() - 0.5) * speed * 0.3,
          (Math.random() - 0.5) * speed * 0.4
        );
        break;
      case 4:
      default:
        particle.maxLife = 1.5 + Math.random() * 1.5;
        particle.position.set(
          (Math.random() - 0.5) * spread,
          8 + Math.random() * 2,
          (Math.random() - 0.5) * spread * 0.4
        );
        particle.velocity.set(
          config.windSpeed * 0.3,
          -speed * (0.8 + Math.random() * 0.5),
          (Math.random() - 0.5) * speed * 0.2
        );
        break;
    }

    particle.color.set(config.color);
    particle.size = config.size * (0.8 + Math.random() * 0.5);
    particle.rotation = Math.random() * Math.PI * 2;
    particle.rotationSpeed = (Math.random() - 0.5) * config.rotationSpeed * 2.5;
  }

  private updateParticles(deltaTime: number): void {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p.active) continue;

      p.life += deltaTime;

      if (p.life >= p.maxLife) {
        p.active = false;
        continue;
      }

      const emitter = this.emitters.get(p.emitterId);
      if (emitter) {
        const config = emitter.config;
        const windRad = (config.windDirection * Math.PI) / 180;

        if (p.type === 3) {
          p.velocity.x += (Math.random() - 0.5) * deltaTime * 2.5;
          p.velocity.y += (Math.random() - 0.5) * deltaTime * 1.8;
          p.velocity.z += (Math.random() - 0.5) * deltaTime * 2.5;
          
          p.velocity.x *= 0.975;
          p.velocity.y *= 0.975;
          p.velocity.z *= 0.975;
        } else {
          p.velocity.x += Math.sin(windRad) * config.windSpeed * deltaTime * 0.6;
          p.velocity.z += Math.cos(windRad) * config.windSpeed * deltaTime * 0.6;
        }
      }

      p.position.addScaledVector(p.velocity, deltaTime);
      p.rotation += p.rotationSpeed * deltaTime;

      if (p.position.y < -5 || p.position.y > 12) {
        p.active = false;
      }
    }
  }

  private updateBuffers(): void {
    let activeCount = 0;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p.active) continue;

      const idx = activeCount * 3;
      this.positionAttribute[idx] = p.position.x;
      this.positionAttribute[idx + 1] = p.position.y;
      this.positionAttribute[idx + 2] = p.position.z;

      this.colorAttribute[idx] = p.color.r;
      this.colorAttribute[idx + 1] = p.color.g;
      this.colorAttribute[idx + 2] = p.color.b;

      this.sizeAttribute[activeCount] = p.size;
      this.lifeAttribute[activeCount] = p.life;
      this.maxLifeAttribute[activeCount] = p.maxLife;
      this.rotationAttribute[activeCount] = p.rotation;
      this.glowAttribute[activeCount] = p.glow;
      this.typeAttribute[activeCount] = p.type;
      this.opacityAttribute[activeCount] = p.opacity;

      activeCount++;
    }

    this.particleCount = activeCount;
    this.geometry.setDrawRange(0, activeCount);

    (this.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (this.geometry.attributes.aColor as THREE.BufferAttribute).needsUpdate = true;
    (this.geometry.attributes.aSize as THREE.BufferAttribute).needsUpdate = true;
    (this.geometry.attributes.aLife as THREE.BufferAttribute).needsUpdate = true;
    (this.geometry.attributes.aMaxLife as THREE.BufferAttribute).needsUpdate = true;
    (this.geometry.attributes.aRotation as THREE.BufferAttribute).needsUpdate = true;
    (this.geometry.attributes.aGlow as THREE.BufferAttribute).needsUpdate = true;
    (this.geometry.attributes.aType as THREE.BufferAttribute).needsUpdate = true;
    (this.geometry.attributes.aOpacity as THREE.BufferAttribute).needsUpdate = true;
  }

  public clear(): void {
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].active = false;
    }
    this.updateBuffers();
  }

  public dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}
