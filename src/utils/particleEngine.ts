import * as THREE from 'three';
import type { ParticleEmitter, EmitterConfig, EmitterType } from '@/types/particle';

const MAX_PARTICLES = 5000;

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
  active: boolean;
  emitterId: string;
}

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

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positionAttribute, 3));
    this.geometry.setAttribute('aColor', new THREE.BufferAttribute(this.colorAttribute, 3));
    this.geometry.setAttribute('aSize', new THREE.BufferAttribute(this.sizeAttribute, 1));
    this.geometry.setAttribute('aLife', new THREE.BufferAttribute(this.lifeAttribute, 1));
    this.geometry.setAttribute('aMaxLife', new THREE.BufferAttribute(this.maxLifeAttribute, 1));
    this.geometry.setAttribute('aRotation', new THREE.BufferAttribute(this.rotationAttribute, 1));
    this.geometry.setAttribute('aGlow', new THREE.BufferAttribute(this.glowAttribute, 1));
    this.geometry.setAttribute('aType', new THREE.BufferAttribute(this.typeAttribute, 1));

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        attribute float aSize;
        attribute float aLife;
        attribute float aMaxLife;
        attribute vec3 aColor;
        attribute float aRotation;
        attribute float aGlow;
        attribute float aType;

        varying vec3 vColor;
        varying float vLife;
        varying float vGlow;
        varying float vType;
        varying float vRotation;

        uniform float uTime;
        uniform float uPixelRatio;

        void main() {
          vColor = aColor;
          vLife = aLife / aMaxLife;
          vGlow = aGlow;
          vType = aType;
          vRotation = aRotation;

          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          
          float sizeMultiplier = 1.0;
          
          if (vType < 0.5) {
            sizeMultiplier = sin(vLife * 3.14159) * 0.5 + 0.5;
          } else if (vType < 1.5) {
            sizeMultiplier = 0.6 + 0.4 * sin(uTime * 3.0 + position.x * 10.0);
          } else if (vType < 2.5) {
            sizeMultiplier = 0.8 + 0.2 * sin(uTime * 2.0 + position.y * 5.0);
          } else if (vType < 3.5) {
            sizeMultiplier = 0.3 + 0.7 * (0.5 + 0.5 * sin(uTime * 4.0 + position.x * 8.0 + position.z * 6.0));
          } else {
            sizeMultiplier = 0.7 + 0.3 * sin(uTime * 5.0 + position.z * 12.0);
          }
          
          float lifeFade = sin(vLife * 3.14159);
          
          gl_PointSize = aSize * sizeMultiplier * lifeFade * uPixelRatio * 100.0 / -mvPosition.z;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vLife;
        varying float vGlow;
        varying float vType;
        varying float vRotation;

        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          
          float alpha = 0.0;
          vec3 color = vColor;
          
          float lifeFade = sin(vLife * 3.14159);
          
          if (vType < 0.5) {
            float cosR = cos(vRotation);
            float sinR = sin(vRotation);
            vec2 rotated = vec2(
              center.x * cosR - center.y * sinR,
              center.x * sinR + center.y * cosR
            );
            
            float petalShape = 1.0 - (abs(rotated.x) * 0.8 + abs(rotated.y) * 1.2);
            petalShape = smoothstep(0.0, 0.3, petalShape);
            
            alpha = petalShape * 0.8 * lifeFade;
            
            vec3 petalColor = vColor * (0.8 + 0.4 * (0.5 + 0.5 * sin(rotated.x * 5.0 + vRotation)));
            color = petalColor;
          } 
          else if (vType < 1.5) {
            alpha = smoothstep(0.5, 0.0, dist);
            alpha = pow(alpha, 0.8) * lifeFade;
            
            float sparkle = 0.5 + 0.5 * sin(dist * 20.0 - vLife * 50.0);
            color = vColor * (1.0 + sparkle * 0.5);
          }
          else if (vType < 2.5) {
            vec2 uv = gl_PointCoord * 2.0 - 1.0;
            float x = uv.x * 1.2;
            float y = -uv.y * 1.2 + 0.15;
            
            float heart = pow(x * x + y * y - 0.25, 3.0) - x * x * y * y * y;
            float heartMask = heart < 0.0 ? 1.0 : 0.0;
            
            float glow = smoothstep(0.6, 0.0, dist);
            
            alpha = (heartMask * 0.9 + glow * 0.3) * lifeFade;
            
            float innerGlow = smoothstep(0.3, 0.0, dist) * vGlow;
            color = vColor * (1.0 + innerGlow);
          }
          else if (vType < 3.5) {
            float core = smoothstep(0.3, 0.0, dist);
            float glow = smoothstep(0.5, 0.0, dist) * 0.5;
            
            alpha = (core + glow * vGlow) * lifeFade;
            
            float flicker = 0.7 + 0.3 * sin(vLife * 20.0);
            color = vColor * flicker;
          }
          else {
            float star = smoothstep(0.15, 0.0, dist);
            float rays = 0.0;
            
            float angle = atan(center.y, center.x);
            rays = 0.3 * smoothstep(0.5, 0.0, abs(fract(angle * 4.0 / 6.28318 * 4.0 - 0.5) * 2.0 - 1.0))
                   * smoothstep(0.5, 0.0, dist);
            
            float glow = smoothstep(0.5, 0.0, dist) * 0.4 * vGlow;
            
            alpha = (star + rays + glow) * lifeFade;
            
            color = vColor * (1.0 + vGlow * 0.5);
          }
          
          if (vGlow > 0.5) {
            float glowAlpha = smoothstep(0.5, 0.0, dist) * 0.3 * vGlow * lifeFade;
            alpha = max(alpha, glowAlpha);
          }
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
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
      const oldestIdx = this.particles.findIndex((p) => p.active);
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
    particle.maxLife = 2 + Math.random() * 3;

    particle.position.set(
      (Math.random() - 0.5) * spread,
      8 + Math.random() * 2,
      (Math.random() - 0.5) * spread
    );

    if (emitter.type === 'heart-glow') {
      particle.position.y = -2 + Math.random() * 2;
      particle.velocity.set(
        (Math.random() - 0.5) * 0.5,
        speed * (0.8 + Math.random() * 0.4),
        (Math.random() - 0.5) * 0.5
      );
    } else if (emitter.type === 'firefly') {
      particle.position.set(
        (Math.random() - 0.5) * spread,
        Math.random() * 4,
        (Math.random() - 0.5) * spread
      );
      particle.velocity.set(
        (Math.random() - 0.5) * speed * 0.5,
        (Math.random() - 0.5) * speed * 0.3,
        (Math.random() - 0.5) * speed * 0.5
      );
    } else if (emitter.type === 'star-rain') {
      particle.position.set(
        (Math.random() - 0.5) * spread,
        10 + Math.random() * 3,
        (Math.random() - 0.5) * spread * 0.5
      );
      particle.velocity.set(
        config.windSpeed * 0.5,
        -speed * (0.8 + Math.random() * 0.4),
        (Math.random() - 0.5) * speed * 0.3
      );
    } else {
      particle.velocity.set(
        Math.sin(windRad) * config.windSpeed * 0.5 + (Math.random() - 0.5) * 0.3,
        -speed * (0.7 + Math.random() * 0.6),
        Math.cos(windRad) * config.windSpeed * 0.5 + (Math.random() - 0.5) * 0.3
      );
    }

    particle.color.set(config.color);
    particle.size = config.size * (0.7 + Math.random() * 0.6);
    particle.rotation = Math.random() * Math.PI * 2;
    particle.rotationSpeed = (Math.random() - 0.5) * config.rotationSpeed * 2;
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
          p.velocity.x += (Math.random() - 0.5) * deltaTime * 2;
          p.velocity.y += (Math.random() - 0.5) * deltaTime * 1.5;
          p.velocity.z += (Math.random() - 0.5) * deltaTime * 2;
          
          p.velocity.x *= 0.98;
          p.velocity.y *= 0.98;
          p.velocity.z *= 0.98;
        } else {
          p.velocity.x += Math.sin(windRad) * config.windSpeed * deltaTime * 0.5;
          p.velocity.z += Math.cos(windRad) * config.windSpeed * deltaTime * 0.5;
        }
      }

      p.position.addScaledVector(p.velocity, deltaTime);
      p.rotation += p.rotationSpeed * deltaTime;

      if (p.position.y < -5) {
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
      this.glowAttribute[activeCount] = 1;
      this.typeAttribute[activeCount] = p.type;

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
