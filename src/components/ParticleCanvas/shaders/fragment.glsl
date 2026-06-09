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
    
    float heart = 1.0;
    float x = rotated.x * 1.5;
    float y = -rotated.y * 1.5 + 0.15;
    float heartEq = pow(x * x + y * y - 0.2, 3.0) - x * x * y * y * y;
    heart = heartEq < 0.0 ? 1.0 : 0.0;
    
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
