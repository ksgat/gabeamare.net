"use client";

import { useEffect, useRef } from "react";

import styles from "./activity-graphs.module.css";

type ActivityShaderProps = {
  values: number[];
  label: string;
};

const REVEAL_DURATION_MS = 620;
const QUAD_VERTICES = new Float32Array([
  -1, -1, 1, -1, -1, 1,
  -1, 1, 1, -1, 1, 1,
]);

const VERTEX_SHADER = `#version 300 es
in vec2 aPosition;
out vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform sampler2D uData;
uniform float uDataLength;
uniform float uGridSize;
uniform float uProgress;

in vec2 vUv;
out vec4 outColor;

const vec3 BLUE = vec3(0.1137, 0.0471, 1.0);
const vec3 WHITE = vec3(1.0);

void main() {
  vec2 gridPosition = vec2(vUv.x, 1.0 - vUv.y) * uGridSize;
  vec2 cell = floor(gridPosition);
  vec2 local = fract(gridPosition);
  float index = cell.y * uGridSize + cell.x;
  float valid = 1.0 - step(uDataLength, index);
  int textureIndex = int(clamp(index, 0.0, max(uDataLength - 1.0, 0.0)));
  float activity = step(0.5, texelFetch(uData, ivec2(textureIndex, 0), 0).r);

  // Keep the palette binary while softening only the sub-pixel square edges.
  vec2 edgeDistance = min(local, 1.0 - local);
  vec2 antialias = fwidth(gridPosition);
  float inset = 0.105;
  float square = smoothstep(inset - antialias.x, inset + antialias.x, edgeDistance.x)
    * smoothstep(inset - antialias.y, inset + antialias.y, edgeDistance.y);
  float revealed = step((index + 1.0) / max(uDataLength, 1.0), uProgress);
  float mark = valid * activity * square * revealed;

  outColor = vec4(mix(BLUE, WHITE, mark), 1.0);
}
`;

export function ActivityShader({ values, label }: ActivityShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activityMask = values.map((value) => (value > 0 ? "1" : "0")).join("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    return renderActivityGrid(canvas, activityMask);
  }, [activityMask]);

  return (
    <canvas
      className={styles.shader}
      ref={canvasRef}
      role="img"
      aria-label={label}
    />
  );
}

function renderActivityGrid(canvas: HTMLCanvasElement, activityMask: string) {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: true,
    depth: false,
    stencil: false,
  });
  if (!gl) return;

  const program = createProgram(gl);
  if (!program) return;

  const buffer = gl.createBuffer();
  const texture = gl.createTexture();
  if (!buffer || !texture) {
    gl.deleteBuffer(buffer);
    gl.deleteTexture(texture);
    gl.deleteProgram(program);
    return;
  }

  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, QUAD_VERTICES, gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const binaryValues = Uint8Array.from(
    activityMask || "0",
    (value) => (value === "1" ? 255 : 0),
  );
  uploadActivityTexture(gl, texture, binaryValues);

  const dataLength = Math.max(activityMask.length, 1);
  const gridSize = Math.ceil(Math.sqrt(dataLength));
  const progressLocation = gl.getUniformLocation(program, "uProgress");
  gl.uniform1f(gl.getUniformLocation(program, "uDataLength"), dataLength);
  gl.uniform1f(gl.getUniformLocation(program, "uGridSize"), gridSize);
  gl.uniform1i(gl.getUniformLocation(program, "uData"), 0);

  let animationFrame = 0;
  let startTime = 0;

  const draw = (time: number) => {
    if (startTime === 0) startTime = time;
    const elapsed = Math.min((time - startTime) / REVEAL_DURATION_MS, 1);
    const progress = 1 - Math.pow(1 - elapsed, 3);

    gl.uniform1f(progressLocation, progress);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    if (elapsed < 1) animationFrame = window.requestAnimationFrame(draw);
  };

  const resize = () => {
    const size = Math.max(1, Math.round(canvas.getBoundingClientRect().width));
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const drawingSize = Math.round(size * pixelRatio);

    if (canvas.width !== drawingSize || canvas.height !== drawingSize) {
      canvas.width = drawingSize;
      canvas.height = drawingSize;
      gl.viewport(0, 0, drawingSize, drawingSize);
    }

    window.cancelAnimationFrame(animationFrame);
    startTime = 0;
    animationFrame = window.requestAnimationFrame(draw);
  };

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  return () => {
    observer.disconnect();
    window.cancelAnimationFrame(animationFrame);
    gl.deleteTexture(texture);
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
  };
}

function createProgram(gl: WebGL2RenderingContext) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vertexShader || !fragmentShader) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function uploadActivityTexture(
  gl: WebGL2RenderingContext,
  texture: WebGLTexture,
  values: Uint8Array,
) {
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.R8,
    values.length,
    1,
    0,
    gl.RED,
    gl.UNSIGNED_BYTE,
    values,
  );
}
