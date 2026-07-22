(function () {
  function createLightPillar(container, options) {
    options = options || {};
    var topColor = options.topColor || '#5227FF';
    var bottomColor = options.bottomColor || '#FF9FFC';
    var intensity = options.intensity != null ? options.intensity : 1.0;
    var rotationSpeed = options.rotationSpeed != null ? options.rotationSpeed : 0.3;
    var interactive = !!options.interactive;
    var glowAmount = options.glowAmount != null ? options.glowAmount : 0.005;
    var pillarWidth = options.pillarWidth != null ? options.pillarWidth : 3.0;
    var pillarHeight = options.pillarHeight != null ? options.pillarHeight : 0.4;
    var noiseIntensity = options.noiseIntensity != null ? options.noiseIntensity : 0.5;
    var pillarRotation = options.pillarRotation || 0;
    var quality = options.quality || 'high';

    if (typeof THREE === 'undefined') return function () {};

    var canvasTest = document.createElement('canvas');
    var gl = canvasTest.getContext('webgl') || canvasTest.getContext('experimental-webgl');
    if (!gl) return function () {};

    var width = container.clientWidth;
    var height = container.clientHeight;
    if (!width || !height) return function () {};

    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    var isLowEndDevice = isMobile || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

    var effectiveQuality = quality;
    if (isLowEndDevice && quality === 'high') effectiveQuality = 'medium';
    if (isMobile && quality !== 'low') effectiveQuality = 'low';

    var qualitySettings = {
      low: { iterations: 24, waveIterations: 1, pixelRatio: 0.5, precision: 'mediump', stepMultiplier: 1.5 },
      medium: { iterations: 40, waveIterations: 2, pixelRatio: 0.65, precision: 'mediump', stepMultiplier: 1.2 },
      high: {
        iterations: 80,
        waveIterations: 4,
        pixelRatio: Math.min(window.devicePixelRatio, 2),
        precision: 'highp',
        stepMultiplier: 1.0
      }
    };
    var settings = qualitySettings[effectiveQuality] || qualitySettings.medium;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: effectiveQuality === 'high' ? 'high-performance' : 'low-power',
        precision: settings.precision,
        stencil: false,
        depth: false
      });
    } catch (e) {
      return function () {};
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(settings.pixelRatio);
    container.appendChild(renderer.domElement);

    function parseColor(hex) {
      var c = new THREE.Color(hex);
      return new THREE.Vector3(c.r, c.g, c.b);
    }

    var vertexShader = [
      'varying vec2 vUv;',
      'void main() {',
      '  vUv = uv;',
      '  gl_Position = vec4(position, 1.0);',
      '}'
    ].join('\n');

    var fragmentShader = [
      'precision ' + settings.precision + ' float;',
      '',
      'uniform float uTime;',
      'uniform vec2 uResolution;',
      'uniform vec2 uMouse;',
      'uniform vec3 uTopColor;',
      'uniform vec3 uBottomColor;',
      'uniform float uIntensity;',
      'uniform bool uInteractive;',
      'uniform float uGlowAmount;',
      'uniform float uPillarWidth;',
      'uniform float uPillarHeight;',
      'uniform float uNoiseIntensity;',
      'uniform float uRotCos;',
      'uniform float uRotSin;',
      'uniform float uPillarRotCos;',
      'uniform float uPillarRotSin;',
      'uniform float uWaveSin;',
      'uniform float uWaveCos;',
      'varying vec2 vUv;',
      '',
      'const float STEP_MULT = ' + settings.stepMultiplier.toFixed(1) + ';',
      'const int MAX_ITER = ' + settings.iterations + ';',
      'const int WAVE_ITER = ' + settings.waveIterations + ';',
      '',
      'void main() {',
      '  vec2 uv = (vUv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);',
      '  uv = vec2(uPillarRotCos * uv.x - uPillarRotSin * uv.y, uPillarRotSin * uv.x + uPillarRotCos * uv.y);',
      '',
      '  vec3 ro = vec3(0.0, 0.0, -10.0);',
      '  vec3 rd = normalize(vec3(uv, 1.0));',
      '',
      '  float rotC = uRotCos;',
      '  float rotS = uRotSin;',
      '  if (uInteractive && (uMouse.x != 0.0 || uMouse.y != 0.0)) {',
      '    float a = uMouse.x * 6.283185;',
      '    rotC = cos(a);',
      '    rotS = sin(a);',
      '  }',
      '',
      '  vec3 col = vec3(0.0);',
      '  float t = 0.1;',
      '',
      '  for (int i = 0; i < MAX_ITER; i++) {',
      '    vec3 p = ro + rd * t;',
      '    p.xz = vec2(rotC * p.x - rotS * p.z, rotS * p.x + rotC * p.z);',
      '',
      '    vec3 q = p;',
      '    q.y = p.y * uPillarHeight + uTime;',
      '',
      '    float freq = 1.0;',
      '    float amp = 1.0;',
      '    for (int j = 0; j < WAVE_ITER; j++) {',
      '      q.xz = vec2(uWaveCos * q.x - uWaveSin * q.z, uWaveSin * q.x + uWaveCos * q.z);',
      '      q += cos(q.zxy * freq - uTime * float(j) * 2.0) * amp;',
      '      freq *= 2.0;',
      '      amp *= 0.5;',
      '    }',
      '',
      '    float d = length(cos(q.xz)) - 0.2;',
      '    float bound = length(p.xz) - uPillarWidth;',
      '    float k = 4.0;',
      '    float h = max(k - abs(d - bound), 0.0);',
      '    d = max(d, bound) + h * h * 0.0625 / k;',
      '    d = abs(d) * 0.15 + 0.01;',
      '',
      '    float grad = clamp((15.0 - p.y) / 30.0, 0.0, 1.0);',
      '    col += mix(uBottomColor, uTopColor, grad) / d;',
      '',
      '    t += d * STEP_MULT;',
      '    if (t > 50.0) break;',
      '  }',
      '',
      '  float widthNorm = uPillarWidth / 3.0;',
      '  col = tanh(col * uGlowAmount / widthNorm);',
      '',
      '  col -= fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) / 15.0 * uNoiseIntensity;',
      '',
      '  vec3 outCol = col * uIntensity;',
      '  float alpha = clamp(max(max(outCol.r, outCol.g), outCol.b), 0.0, 1.0);',
      '  gl_FragColor = vec4(outCol, alpha);',
      '}'
    ].join('\n');

    var pillarRotRad = (pillarRotation * Math.PI) / 180;
    var waveSin = Math.sin(0.4);
    var waveCos = Math.cos(0.4);
    var mouse = new THREE.Vector2(0, 0);

    var material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(width, height) },
        uMouse: { value: mouse },
        uTopColor: { value: parseColor(topColor) },
        uBottomColor: { value: parseColor(bottomColor) },
        uIntensity: { value: intensity },
        uInteractive: { value: interactive },
        uGlowAmount: { value: glowAmount },
        uPillarWidth: { value: pillarWidth },
        uPillarHeight: { value: pillarHeight },
        uNoiseIntensity: { value: noiseIntensity },
        uRotCos: { value: 1.0 },
        uRotSin: { value: 0.0 },
        uPillarRotCos: { value: Math.cos(pillarRotRad) },
        uPillarRotSin: { value: Math.sin(pillarRotRad) },
        uWaveSin: { value: waveSin },
        uWaveCos: { value: waveCos }
      },
      transparent: true,
      depthWrite: false,
      depthTest: false
    });

    var geometry = new THREE.PlaneGeometry(2, 2);
    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    function handleMouseMove(event) {
      if (!interactive) return;
      var rect = container.getBoundingClientRect();
      var x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      var y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      mouse.set(x, y);
    }
    if (interactive) container.addEventListener('mousemove', handleMouseMove, { passive: true });

    var timeVal = 0;
    var rafId = null;
    var lastTime = performance.now();
    var targetFPS = effectiveQuality === 'low' ? 30 : 60;
    var frameTime = 1000 / targetFPS;
    var running = true;

    function animate(currentTime) {
      if (!running) return;
      var deltaTime = currentTime - lastTime;
      if (deltaTime >= frameTime) {
        timeVal += 0.016 * rotationSpeed;
        material.uniforms.uTime.value = timeVal;
        material.uniforms.uRotCos.value = Math.cos(timeVal * 0.3);
        material.uniforms.uRotSin.value = Math.sin(timeVal * 0.3);
        renderer.render(scene, camera);
        lastTime = currentTime - (deltaTime % frameTime);
      }
      rafId = requestAnimationFrame(animate);
    }
    rafId = requestAnimationFrame(animate);

    var resizeTimeout = null;
    function handleResize() {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function () {
        var w = container.clientWidth;
        var h = container.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h);
        material.uniforms.uResolution.value.set(w, h);
      }, 150);
    }
    window.addEventListener('resize', handleResize, { passive: true });

    return function destroy() {
      running = false;
      window.removeEventListener('resize', handleResize);
      if (interactive) container.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
      renderer.dispose();
      if (renderer.forceContextLoss) renderer.forceContextLoss();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      material.dispose();
      geometry.dispose();
    };
  }

  window.LightPillar = { create: createLightPillar };
})();
