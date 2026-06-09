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
