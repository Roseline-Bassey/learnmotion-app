'use client';

import { FilmGrain, Shader, SineWave, SolidColor, WaveDistortion } from 'shaders/react';

export default function ShaderBackground() {
  return (
    <Shader style={{ position: 'absolute', inset: 0, zIndex: -1, pointerEvents: 'none' }}>
      <SolidColor color="#FF4B14" />
      <SineWave
        amplitude={0.55}
        blendMode="normal-oklch"
        color="#0582E880"
        frequency={0.2}
        position={{ x: 0.65, y: 0.67 }}
        softness={0.75}
        speed={0.85}
        thickness={0.5}
      />
      <SineWave
        amplitude={0.55}
        blendMode="normal-oklch"
        color="#F00E94"
        frequency={0.2}
        position={{ x: 0.6, y: 0.51 }}
        softness={0.75}
        speed={0.85}
        thickness={0.5}
      />
      <WaveDistortion angle={324} frequency={0.3} speed={0.1} strength={0.9} />
      <FilmGrain strength={0.1} />
    </Shader>
  );
}
