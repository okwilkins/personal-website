const TEXT = [
  "OKWILKINS", "NEOVIM", "CUDA", "GPU", "K8S", "LINUX", "NIX",
  "PYTHON", "LLMS", "AI", "INFERENCE", "SCALE", "RICING",
].join(" / ") + " / ";
const GLYPHS = " ·:+ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#%&*=<>?$@";
const WORD = Array.from(TEXT, (letter) => GLYPHS.indexOf(letter));
const DITHER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
export const AMBIENT_INTERVAL = 1 / 30;
const BASE_INTERVAL = 1 / 12;
const STEP = 1 / 60;
const SPLASH_LIMIT = 16;
const SPLASH_LIFETIME = 1.2;

const vertex = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2. - 1., 0., 1.);
}`;

// All fluid passes run on a tiny grid, independent of display resolution.
const flowShader = `#version 300 es
precision highp float;
uniform sampler2D uState, uPressure;
uniform vec2 uGrid, uPanel;
uniform float uScroll, uDt;
uniform int uPass, uCount, uFirst;
uniform vec4 uStroke[8];
out vec4 color;
const ivec2 X = ivec2(1,0), Y = ivec2(0,1);
vec4 state(ivec2 p) { return texelFetch(uState, clamp(p, ivec2(0), ivec2(uGrid)-1), 0); }
float pressure(ivec2 p) { return uFirst == 1 ? 0. : texelFetch(uPressure, p, 0).x; }
float curl(ivec2 p) { return .5 * (state(p+X).y-state(p-X).y-state(p+Y).x+state(p-Y).x); }
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  if (p.x<1 || p.y<1 || p.x>int(uGrid.x)-2 || p.y>int(uGrid.y)-2) { color=vec4(0); return; }
  vec4 s = state(p);
  if (uPass == 0) {
    float radius=max(2.,min(uGrid.x,uGrid.y)*.045);
    for (int k=0; k<8; k++) {
      if (k>=uCount) break;
      vec2 a=uStroke[k].xy, d=uStroke[k].zw;
      float length_=max(length(d),.001);
      vec2 direction=d/length_;
      vec2 delta=vec2(p)-a-d*clamp(dot(vec2(p)-a,d)/max(dot(d,d),.000001),0.,1.);
      float side=dot(delta,vec2(-direction.y,direction.x))/radius;
      float weight=exp(-dot(delta,delta)/(radius*radius)*1.7);
      s.xy += direction*(1.-side*side*.5)*weight*min(55.,length_*10.);
      s.z = min(1.,s.z+weight*.4*min(1.,length_/radius));
    }
    // Full scroll force beneath the panel, falling off smoothly beyond its sides.
    if (abs(uScroll)>.001) {
      float x=(float(p.x)+.5)/uGrid.x;
      float distance_=max(0.,max(uPanel.x-x,x-uPanel.y));
      float reach=max(.05,(uPanel.y-uPanel.x)*.5);
      float proximity=1.-smoothstep(0.,reach,distance_);
      float ends=smoothstep(0.,.12,float(p.y)/uGrid.y)*smoothstep(0.,.12,1.-float(p.y)/uGrid.y);
      s.y+=2.4*proximity*ends*uScroll;
    }
    s.xy=clamp(s.xy,vec2(-80),vec2(80));
  } else if (uPass == 1) {
    vec2 from=clamp(vec2(p)-s.xy*uDt,vec2(.5),uGrid-1.5);
    ivec2 a=ivec2(from); vec2 f=fract(from);
    s=mix(mix(state(a),state(a+X),f.x),mix(state(a+Y),state(a+X+Y),f.x),f.y);
    // Carry the material's vertical position with the velocity, even as it settles.
    s.w+=s.y*uDt;
    s.xy*=exp(-1.8*uDt); s.z*=exp(-2.4*uDt);
  } else if (uPass == 2) {
    vec2 gradient=vec2(abs(curl(p+X))-abs(curl(p-X)),abs(curl(p+Y))-abs(curl(p-Y)));
    float speed=length(s.xy);
    s.xy+=vec2(gradient.y,-gradient.x)/(length(gradient)+.0001)*curl(p)*uDt*9.;
    s.xy*=min(1.,speed/(length(s.xy)+.0001));
  } else if (uPass == 3) {
    float divergence=-.5*(state(p+X).x-state(p-X).x+state(p+Y).y-state(p-Y).y);
    s=vec4(.25*(divergence+pressure(p-X)+pressure(p+X)+pressure(p-Y)+pressure(p+Y)),0,0,0);
  } else {
    s.xy-=.5*vec2(pressure(p+X)-pressure(p-X),pressure(p+Y)-pressure(p-Y));
  }
  color=s;
}`;

// Compute noise and character choices per cell, never per screen pixel.
const cellsShader = `#version 300 es
precision highp float;
uniform sampler2D uState, uBase;
uniform vec2 uSize, uCell, uGrid, uPanel;
uniform vec3 uSplash[${SPLASH_LIMIT}];
uniform float uTime, uAhead, uBaseAhead;
uniform int uBuildBase, uActive;
out vec4 color;
const int WORD[${WORD.length}] = int[${WORD.length}](${WORD.join(",")});
const float BAYER[16] = float[16](${DITHER.map((v) => `${v}.`).join(",")});
float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p) {
  vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1)),f.x),f.y);
}
float cloud(vec2 p) { return noise(p)*.57+noise(p*2.03+vec2(7,3))*.28+noise(p*4.01)*.15; }
float field(vec2 p, float t) {
  vec2 warp=vec2(cloud(p+vec2(0,t)),cloud(p+vec2(5.2,1.3-t)));
  return smoothstep(.3,.7,cloud(p+warp*2.+vec2(t*.3,-t*.2)));
}
vec4 sampleFlow(vec2 p) {
  p=clamp(p,vec2(.5),uGrid-1.5);
  ivec2 i=ivec2(p); vec2 f=fract(p);
  return mix(mix(texelFetch(uState,i,0),texelFetch(uState,i+ivec2(1,0),0),f.x),
    mix(texelFetch(uState,i+ivec2(0,1),0),texelFetch(uState,i+ivec2(1),0),f.x),f.y);
}
vec3 sampleBase(vec2 p) {
  p=clamp(p,vec2(0),vec2(textureSize(uBase,0))-1.001);
  ivec2 i=ivec2(p); vec2 f=fract(p);
  return mix(mix(texelFetch(uBase,i,0).rgb,texelFetch(uBase,i+ivec2(1,0),0).rgb,f.x),
    mix(texelFetch(uBase,i+ivec2(0,1),0).rgb,texelFetch(uBase,i+ivec2(1),0).rgb,f.x),f.y);
}
void main() {
  ivec2 cell=ivec2(gl_FragCoord.xy);
  vec2 uv=(vec2(cell)+.5)*uCell/uSize;
  if (uBuildBase == 1) {
    vec2 material=uv;
    material.y-=sampleFlow(uv*uGrid).w/uGrid.y;
    vec2 p=material*vec2(uSize.x/uSize.y,1.)*2.5+vec2(12,8);
    float t=uTime*.05;
    float base=field(p,t);
    // Light moving edges as the field advances or recedes.
    float movement=abs(field(p,t+.04)-base);
    float front=(1.-smoothstep(.02,.14,abs(base-.5)))*smoothstep(.001,.012,movement);
    // Click swells share the passive field's cache and broad, uneven contours.
    float splash=0.;
    for (int k=0; k<${SPLASH_LIMIT}; k++) {
      float age=uTime-uSplash[k].z;
      if (age<0. || age>${SPLASH_LIFETIME}) continue;
      vec2 delta=(uv-uSplash[k].xy)*uSize/uCell.y;
      float distance_=max(0.,length(delta)+(base-.5)*4.);
      float radius=1.4+age*9.;
      float swell=exp(-pow(distance_/radius,2.)*1.5);
      float crest=exp(-pow((distance_-radius)/(1.2+age*3.),2.));
      splash=max(splash,max(swell*.5,crest)*(1.-smoothstep(.1,${SPLASH_LIFETIME},age)));
    }
    color=vec4(base,front,splash,1); return;
  }
  vec4 s=vec4(0);
  if (uActive==1) s=sampleFlow(uv*uGrid);
  // Advect between cached noise updates without recalculating the noise every frame.
  vec2 drift=vec2(0,s.y*uBaseAhead*uSize.y/(uGrid.y*uCell.y));
  vec3 ambient=sampleBase(vec2(cell)-drift);
  float base=ambient.r, motion=0., trail=0., splash=ambient.b;
  if (uActive == 1) {
    vec2 position=uv*uGrid;
    // Predict between fixed simulation steps for smooth high-refresh rendering.
    s=sampleFlow(position-s.xy*uAhead);
    motion=smoothstep(0.,.85,1.-exp(-length(s.xy)*.055));
    trail=smoothstep(0.,.65,s.z);
  }
  trail=max(trail,splash);
  // Scroll motion lights existing waves; only pointer dye and clicks add new ones.
  float wake=max(trail,motion*smoothstep(.4,.65,base));
  float edge=smoothstep(0.,.1,uv.y)*smoothstep(0.,.1,1.-uv.y);
  float tone=(base+(1.-base)*trail)*edge;
  float dither=motion*(1.-smoothstep(.3,.5,tone));
  float level=tone*7.+dither*.6;
  float tier=level>=3.5?4.:clamp(floor(level+(BAYER[(cell.x%4)+(cell.y%4)*4]+.5)/16.),0.,3.);
  int offset=int(floor(hash(vec2(float(cell.y),7.13))*float(${WORD.length})));
  int letter=tier<4.?int(tier):WORD[(cell.x+offset)%${WORD.length}];
  if (tier>=4. && hash(vec2(cell)+vec2(3.1,8.7))<wake*.9-.2) {
    letter=4+int(floor(hash(vec2(cell)+floor(uTime*10.)*vec2(.71,.37))*float(${GLYPHS.length - 4})));
  }
  // Keep the moving field beneath the glass, without its bright highlights.
  float highlight=1.-step(uPanel.x,uv.x)*step(uv.x,uPanel.y);
  float opacity=tier<4.?.1+tier*.035+dither*.035:.2+tone*.13+wake*.3*highlight;
  opacity+=(ambient.g*.32*edge+splash*.75)*highlight;
  color=vec4(opacity,float(letter)/255.,max(wake,ambient.g*.9)*highlight,1);
}`;

const glyphShader = `#version 300 es
precision highp float;
uniform sampler2D uAtlas, uCells;
uniform vec2 uSize, uCell;
out vec4 color;
void main() {
  vec2 pixel=vec2(gl_FragCoord.x,uSize.y-gl_FragCoord.y);
  ivec2 cell=ivec2(pixel/uCell);
  vec4 entry=texelFetch(uCells,cell,0);
  int letter=int(floor(entry.g*255.+.5));
  if (letter==0) { color=vec4(0); return; }
  ivec2 position=ivec2(pixel-vec2(cell)*uCell)+ivec2(letter*int(uCell.x),0);
  float alpha=texelFetch(uAtlas,position,0).a*entry.r;
  color=vec4(vec3(mix(.76,1.,entry.b))*alpha,alpha);
}`;

type Target = { texture: WebGLTexture; buffer: WebGLFramebuffer };

export function createCharacterField(canvas: HTMLCanvasElement, seed: number) {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) return staticField(canvas, seed);

  const debug = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = String(
    gl.getParameter(debug?.UNMASKED_RENDERER_WEBGL ?? gl.RENDERER),
  );
  const floating = !!gl.getExtension("EXT_color_buffer_float");
  const accelerated =
    floating && !/swiftshader|llvmpipe|softpipe|software/i.test(renderer);
  const programs: WebGLProgram[] = [];
  const textures: WebGLTexture[] = [];
  let targets: Target[] = [];

  function program(fragment: string) {
    const shader = (type: number, source: string) => {
      const shader = gl!.createShader(type)!;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS))
        throw new Error(
          gl!.getShaderInfoLog(shader) ?? "Character shader failed",
        );
      return shader;
    };
    const result = gl!.createProgram()!;
    const vs = shader(gl!.VERTEX_SHADER, vertex),
      fs = shader(gl!.FRAGMENT_SHADER, fragment);
    gl!.attachShader(result, vs);
    gl!.attachShader(result, fs);
    gl!.linkProgram(result);
    gl!.deleteShader(vs);
    gl!.deleteShader(fs);
    if (!gl!.getProgramParameter(result, gl!.LINK_STATUS))
      throw new Error(
        gl!.getProgramInfoLog(result) ?? "Character program failed",
      );
    programs.push(result);
    const locations = new Map<string, WebGLUniformLocation | null>();
    return {
      program: result,
      uniform(name: string) {
        if (!locations.has(name))
          locations.set(name, gl!.getUniformLocation(result, name));
        return locations.get(name)!;
      },
    };
  }

  function texture() {
    const texture = gl!.createTexture()!;
    gl!.bindTexture(gl!.TEXTURE_2D, texture);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.NEAREST);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.NEAREST);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
    return texture;
  }

  function target(width: number, height: number, float = false): Target {
    const result = { texture: texture(), buffer: gl!.createFramebuffer()! };
    gl!.texImage2D(
      gl!.TEXTURE_2D,
      0,
      float && floating ? gl!.RGBA16F : gl!.RGBA8,
      width,
      height,
      0,
      gl!.RGBA,
      float && floating ? gl!.HALF_FLOAT : gl!.UNSIGNED_BYTE,
      null,
    );
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, result.buffer);
    gl!.framebufferTexture2D(
      gl!.FRAMEBUFFER,
      gl!.COLOR_ATTACHMENT0,
      gl!.TEXTURE_2D,
      result.texture,
      0,
    );
    targets.push(result);
    return result;
  }

  function bind(unit: number, texture: WebGLTexture) {
    gl!.activeTexture(gl!.TEXTURE0 + unit);
    gl!.bindTexture(gl!.TEXTURE_2D, texture);
  }
  function releaseTargets() {
    for (const target of targets) {
      gl!.deleteFramebuffer(target.buffer);
      gl!.deleteTexture(target.texture);
    }
    targets = [];
  }

  const flow = program(flowShader),
    cells = program(cellsShader),
    glyphs = program(glyphShader);
  for (const [item, samplers] of [
    [flow, { uState: 0, uPressure: 1 }],
    [cells, { uState: 0, uBase: 4 }],
    [glyphs, { uAtlas: 2, uCells: 3 }],
  ] as const) {
    gl.useProgram(item.program);
    for (const [name, unit] of Object.entries(samplers))
      gl.uniform1i(item.uniform(name), unit);
  }
  const atlas = texture();
  textures.push(atlas);
  let state: [Target, Target],
    pressure: [Target, Target],
    base: Target,
    letters: Target;
  let gridWidth = 0,
    gridHeight = 0,
    columns = 0,
    rows = 0,
    cellWidth = 0,
    cellHeight = 0;
  let cssWidth = 0,
    cssHeight = 0,
    accumulator = 0,
    clock = seed,
    count = 0;
  let lastBase = -Infinity,
    fluidUntil = 0,
    scrollImpulse = 0;
  const strokes = new Float32Array(32);
  const splashes = new Float32Array(SPLASH_LIMIT * 3);
  let nextSplash = 0;
  let previous: { x: number; y: number } | null = null;

  function pass(mode: number, destination: Target) {
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, destination.buffer);
    gl!.viewport(0, 0, gridWidth, gridHeight);
    gl!.useProgram(flow.program);
    bind(0, state[0].texture);
    bind(1, pressure[0].texture);
    gl!.uniform1i(flow.uniform("uPass"), mode);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
  }

  function reset() {
    previous = null;
    count = 0;
    accumulator = 0;
    fluidUntil = 0;
    scrollImpulse = 0;
    lastBase = -Infinity;
    splashes.fill(-100);
    nextSplash = 0;
    gl!.clearColor(0, 0, 0, 0);
    for (const target of [...state, ...pressure]) {
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, target.buffer);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
    }
  }

  function drawCells(buildBase: boolean, active: boolean) {
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, (buildBase ? base : letters).buffer);
    gl!.viewport(0, 0, columns, rows);
    gl!.useProgram(cells.program);
    bind(0, state[0].texture);
    bind(4, buildBase ? atlas : base.texture);
    gl!.uniform1i(cells.uniform("uBuildBase"), +buildBase);
    gl!.uniform1i(cells.uniform("uActive"), +active);
    gl!.uniform1f(cells.uniform("uTime"), clock);
    gl!.uniform1f(cells.uniform("uAhead"), accumulator);
    gl!.uniform1f(cells.uniform("uBaseAhead"), Math.min(BASE_INTERVAL, clock - lastBase));
    gl!.uniform3fv(cells.uniform("uSplash[0]"), splashes);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
  }

  return {
    accelerated,
    resize(
      width: number,
      height: number,
      touch = false,
      panel?: { left: number; right: number },
    ) {
      cssWidth = width;
      cssHeight = height;
      const ratio = Math.min(
        devicePixelRatio || 1,
        touch ? 1.25 : 1.5,
        Math.sqrt(4_194_304 / (width * height)),
      );
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      cellWidth = Math.max(1, Math.round(7 * ratio));
      cellHeight = Math.max(1, Math.round(12 * ratio));
      columns = Math.ceil(canvas.width / cellWidth);
      rows = Math.ceil(canvas.height / cellHeight);
      const scale = (touch ? 96 : 128) / Math.max(width, height);
      gridWidth = Math.max(3, Math.round(width * scale));
      gridHeight = Math.max(3, Math.round(height * scale));
      releaseTargets();
      state = [
        target(gridWidth, gridHeight, true),
        target(gridWidth, gridHeight, true),
      ];
      pressure = [
        target(gridWidth, gridHeight, true),
        target(gridWidth, gridHeight, true),
      ];
      base = target(columns, rows);
      letters = target(columns, rows);
      const image = document.createElement("canvas");
      image.width = cellWidth * GLYPHS.length;
      image.height = cellHeight;
      const ctx = image.getContext("2d")!;
      ctx.fillStyle = "#fff";
      ctx.font = `500 ${9 * ratio}px "Geist Mono Variable", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let i = 0; i < GLYPHS.length; i++)
        ctx.fillText(GLYPHS[i], (i + 0.5) * cellWidth, cellHeight / 2);
      bind(2, atlas);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image,
      );
      gl.useProgram(flow.program);
      gl.uniform2f(flow.uniform("uGrid"), gridWidth, gridHeight);
      gl.uniform2f(
        flow.uniform("uPanel"),
        (panel?.left ?? 0) / width,
        (panel?.right ?? width) / width,
      );
      gl.uniform1f(flow.uniform("uDt"), STEP);
      gl.useProgram(cells.program);
      gl.uniform2f(cells.uniform("uGrid"), gridWidth, gridHeight);
      gl.uniform2f(
        cells.uniform("uPanel"),
        (panel?.left ?? 0) / width,
        (panel?.right ?? width) / width,
      );
      gl.uniform2f(cells.uniform("uSize"), canvas.width, canvas.height);
      gl.uniform2f(cells.uniform("uCell"), cellWidth, cellHeight);
      gl.useProgram(glyphs.program);
      gl.uniform2f(glyphs.uniform("uSize"), canvas.width, canvas.height);
      gl.uniform2f(glyphs.uniform("uCell"), cellWidth, cellHeight);
      reset();
      drawCells(true, false);
      lastBase = clock;
    },
    pointer(x: number, y: number) {
      const point = {
        x: (x / cssWidth) * (gridWidth - 1),
        y: (y / cssHeight) * (gridHeight - 1),
      };
      if (
        previous &&
        Math.hypot(point.x - previous.x, point.y - previous.y) > 0.001
      ) {
        if (count < 8) {
          strokes.set(
            [
              previous.x,
              previous.y,
              point.x - previous.x,
              point.y - previous.y,
            ],
            count * 4,
          );
          count++;
        } else {
          strokes[30] = point.x - strokes[28];
          strokes[31] = point.y - strokes[29];
        }
      }
      previous = point;
    },
    splash(x: number, y: number) {
      // A full pool drops excess clicks instead of cutting an active splash short.
      if (clock - splashes[nextSplash * 3 + 2] < SPLASH_LIFETIME) return;
      splashes.set([x / cssWidth, y / cssHeight, clock], nextSplash * 3);
      nextSplash = (nextSplash + 1) % SPLASH_LIMIT;
      lastBase = -Infinity;
    },
    scroll(delta: number) {
      // Push the field in the scroll direction. Accumulate distance, not events.
      scrollImpulse += (delta / cssHeight) * gridHeight * 0.45;
    },
    releasePointer() {
      previous = null;
    },
    reset,
    draw(dt: number, animated: boolean) {
      if (animated) clock += dt;
      const stirring = Math.abs(scrollImpulse) > 0.001;
      const active = animated && (count > 0 || stirring || clock < fluidUntil);
      if (active) {
        accumulator += dt;
        gl.useProgram(flow.program);
        if (count || stirring) {
          fluidUntil = clock + 4;
          gl.uniform1i(flow.uniform("uCount"), count);
          gl.uniform4fv(flow.uniform("uStroke[0]"), strokes);
          gl.uniform1f(
            flow.uniform("uScroll"),
            Math.max(-12, Math.min(12, scrollImpulse)),
          );
          pass(0, state[1]);
          state.reverse();
          count = 0;
          scrollImpulse = 0;
        }
        // The solver stays at 60 Hz; rendering follows requestAnimationFrame.
        while (accumulator >= STEP) {
          pass(1, state[1]);
          state.reverse();
          pass(2, state[1]);
          state.reverse();
          for (let i = 0; i < 4; i++) {
            gl.uniform1i(flow.uniform("uFirst"), +(i === 0));
            pass(3, pressure[1]);
            pressure.reverse();
          }
          gl.uniform1i(flow.uniform("uFirst"), 0);
          pass(4, state[1]);
          state.reverse();
          accumulator -= STEP;
        }
      }
      if (clock - lastBase >= BASE_INTERVAL) {
        drawCells(true, false);
        lastBase = clock;
      }
      drawCells(false, active);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(glyphs.program);
      bind(2, atlas);
      bind(3, letters.texture);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      releaseTargets();
      for (const texture of textures) gl.deleteTexture(texture);
      for (const program of programs) gl.deleteProgram(program);
    },
  };
}

// Software renderers get a one-off texture, with no animation loop.
function staticField(canvas: HTMLCanvasElement, seed: number) {
  return {
    accelerated: false,
    resize(width: number, height: number) {
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.font = '500 9px "Geist Mono Variable", monospace';
      ctx.textBaseline = "top";
      ctx.fillStyle = "#c2c2c2";
      for (let y = 0; y < height; y += 12)
        for (let x = 0; x < width; x += 7) {
          const tone =
            0.5 +
            Math.sin(x / 190 + Math.sin(y / 210) + seed) *
              Math.cos(y / 160 + Math.sin(x / 240) + seed * 0.7) *
              0.45;
          const level = tone * 7,
            row = Math.floor(y / 12),
            col = Math.floor(x / 7);
          const tier =
            level >= 3.5
              ? 4
              : Math.min(
                  3,
                  Math.floor(
                    level + (DITHER[(col & 3) + (row & 3) * 4] + 0.5) / 16,
                  ),
                );
          ctx.globalAlpha =
            (tier < 4 ? 0.1 + tier * 0.035 : 0.2 + tone * 0.13) *
            Math.min(1, y / 80, (height - y) / 80);
          ctx.fillText(
            tier < 4 ? GLYPHS[tier] : TEXT[(col + row * 3) % TEXT.length],
            x,
            y,
          );
        }
    },
    pointer() {},
    splash() {},
    scroll() {},
    releasePointer() {},
    reset() {},
    draw() {},
    dispose() {},
  };
}
