const componentTagName = "exported-content";

const componentCSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Roboto:wght@400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

.material-symbols-outlined {
  font-family: "Material Symbols Outlined", system-ui;
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  display: inline-block;
  letter-spacing: normal;
  text-transform: none;
  white-space: nowrap;
  overflow-wrap: normal;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
  font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
}
*, *::before, *::after {
  box-sizing: border-box;
}
#exported-content {
  position: relative;
  min-width: 0;
  aspect-ratio: 0.5819892473;
  width: 100%;
  height: auto;
}
.item {
  position: absolute;
  margin: 0;
  padding: 0;
  pointer-events: none;
  contain: layout style;
}
button.item {
  border: none;
  background: transparent;
  font: inherit;
  cursor: pointer;
  color: inherit;
}
.shape {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
}
.text {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  line-height: 1.4;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: break-word;
  overflow: visible;
  text-align: center;
}
.shape--gradient-stroke {
  position: relative;
  border-color: transparent !important;
  background-clip: padding-box;
}
.shape--gradient-stroke::after {
  content: "";
  position: absolute;
  top: calc(var(--stroke-width, 0px) * -1);
  left: calc(var(--stroke-width, 0px) * -1);
  right: calc(var(--stroke-width, 0px) * -1);
  bottom: calc(var(--stroke-width, 0px) * -1);
  border-radius: inherit;
  padding: var(--stroke-width, 0px);
  background: var(--stroke-gradient);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  z-index: 0;
}

/* Legacy Interactions & Animations */
#a, #b, #start, #select,
#up, #down, #left, #right, #mid {
  pointer-events: auto !important;
  cursor: pointer;
  transition: opacity 0.2s ease, filter 0.2s ease, fill 0.2s ease;
}

#a:active .btn-moving-part,
#b:active .btn-moving-part,
#a:active #txt-a,
#b:active #txt-b,
#a.btn-pressed .btn-moving-part,
#b.btn-pressed .btn-moving-part,
#a.btn-pressed #txt-a,
#b.btn-pressed #txt-b {
  transform: scale(0.96);
  transform-box: fill-box;
  transform-origin: center;
  transition: transform 0.05s ease;
}

.active-fill {
  opacity: 0;
  transition: opacity 0.2s ease-out;
  pointer-events: none;
}

#a:active .active-fill,
#b:active .active-fill,
#start:active .active-fill,
#select:active .active-fill,
#a.btn-pressed .active-fill,
#b.btn-pressed .active-fill,
#start.btn-pressed .active-fill,
#select.btn-pressed .active-fill {
  opacity: 1;
  transition: opacity 0.05s ease-out;
}

#start:active .btn-moving-part, #select:active .btn-moving-part,
#start.btn-pressed .btn-moving-part, #select.btn-pressed .btn-moving-part {
  transform: scale(0.95);
  transform-origin: center;
  transition: transform 0.05s ease;
}

#up::before, #down::before, #left::before, #right::before {
  content: '';
  position: absolute;
  top: -25%;
  left: -25%;
  right: -25%;
  bottom: -25%;
  pointer-events: auto;
}
#power-light {
  pointer-events: none !important;
}
#scr-glare {
  display: none !important;
}
@keyframes led-flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.9; }
  80% { opacity: 0.95; }
}
.led-on {
  filter: drop-shadow(0 0 4px rgba(255, 0, 0, 0.8)) contrast(140%) saturate(110%) !important;
  animation: led-flicker 0.1s infinite;
}
.led-on-menu {
  filter: drop-shadow(0 0 4px rgba(255, 180, 0, 0.8)) contrast(140%) saturate(110%) !important;
  animation: led-flicker 0.12s infinite;
}
@media (pointer: coarse) {
  .led-on,
  .led-on-menu {
    animation: none;
  }
  #a, #b, #start, #select,
  #up, #down, #left, #right, #mid,
  .active-fill,
  #a:active .btn-moving-part,
  #b:active .btn-moving-part,
  #a.btn-pressed .btn-moving-part,
  #b.btn-pressed .btn-moving-part,
  #start:active .btn-moving-part,
  #select:active .btn-moving-part,
  #start.btn-pressed .btn-moving-part,
  #select.btn-pressed .btn-moving-part {
    transition: none !important;
  }
  #a:active .btn-moving-part,
  #b:active .btn-moving-part,
  #a.btn-pressed .btn-moving-part,
  #b.btn-pressed .btn-moving-part,
  #a:active #txt-a,
  #b:active #txt-b,
  #a.btn-pressed #txt-a,
  #b.btn-pressed #txt-b {
    transform: none !important;
  }
}

.key-internal-label {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.95);
    color: white;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 1000;
    pointer-events: none;
    z-index: 100;
    white-space: nowrap;
    border: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity 0.2s ease;
    font-family: 'Barlow Condensed', sans-serif;
    text-transform: uppercase;
    line-height: 1;
    cursor: pointer;
}
`;

const componentHTML = `
<svg id="doodle-defs" aria-hidden="true" width="0" height="0" style="height: 1px; left: -100px; opacity: 0; overflow-x: hidden; overflow-y: hidden; pointer-events: none; position: fixed; top: -100px; width: 1px">
  <defs>
    <linearGradient id="shared-fill-1" x1="56.96%" y1="0.49%" x2="43.04%" y2="99.51%">
      <stop offset="0%" stop-color="#151515"></stop>
      <stop offset="100%" stop-color="#2f2f2f"></stop>
    </linearGradient>
    <linearGradient id="shared-fill-3" x1="93.73%" y1="74.24%" x2="6.27%" y2="25.76%">
      <stop offset="0%" stop-color="#181818"></stop>
      <stop offset="100%" stop-color="#0f0f0f"></stop>
    </linearGradient>
    <linearGradient id="shared-fill-4" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#010101"></stop>
      <stop offset="96%" stop-color="#2c2c2c"></stop>
    </linearGradient>
    <linearGradient id="shared-fill-5" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#404040"></stop>
      <stop offset="100%" stop-color="#1a1a1a"></stop>
    </linearGradient>
    <linearGradient id="shared-fill-7" x1="82.14%" y1="11.7%" x2="17.86%" y2="88.3%">
      <stop offset="0%" stop-color="#2f2f2f"></stop>
      <stop offset="100%" stop-color="#151515"></stop>
    </linearGradient>
    <linearGradient id="shared-stroke-8" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#1b0034"></stop>
      <stop offset="100%" stop-color="#8e14e5"></stop>
    </linearGradient>
    <linearGradient id="shared-stroke-9" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#4f4f4f"></stop>
      <stop offset="100%" stop-color="#1c1c1c"></stop>
    </linearGradient>
    <linearGradient id="shared-fill-10" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#800000"></stop>
      <stop offset="100%" stop-color="#ff0000"></stop>
    </linearGradient>
    <linearGradient id="shared-fill-11" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#717171"></stop>
      <stop offset="100%" stop-color="#000000"></stop>
    </linearGradient>
    <linearGradient id="stroke-grad-4" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#525252"></stop>
      <stop offset="100%" stop-color="#292929"></stop>
    </linearGradient>
    <!-- LED gradients -->
    <linearGradient id="grad-41" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#ff1919"></stop>
      <stop offset="100%" stop-color="#ff0000"></stop>
    </linearGradient>
    <linearGradient id="stroke-grad-41" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#4a0000"></stop>
      <stop offset="100%" stop-color="#8a0000"></stop>
    </linearGradient>
    <linearGradient id="grad-yellow" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#ffdd00"></stop>
      <stop offset="100%" stop-color="#ffcc00"></stop>
    </linearGradient>
    <linearGradient id="stroke-grad-yellow" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#735700"></stop>
      <stop offset="100%" stop-color="#997500"></stop>
    </linearGradient>
    <filter id="shared-inner-2" primitiveunits="objectBoundingBox" x="-50%" y="-50%" width="200%" height="200%">
      <feFlood flood-color="black" flood-opacity="1.00" result="df"></feFlood>
      <feComposite operator="out" in2="SourceAlpha" in="df" result="di"></feComposite>
      <feOffset dx="-0.0008" dy="-0.0116" in="di" result="do"></feOffset>
      <feGaussianBlur stdDeviation="0.0192 0.0193" in="do" result="db"></feGaussianBlur>
      <feComposite operator="in" in2="SourceAlpha" in="db" result="sh"></feComposite>
      <feFlood flood-color="white" flood-opacity="0.29" result="lf"></feFlood>
      <feComposite operator="out" in2="SourceAlpha" in="lf" result="li"></feComposite>
      <feOffset dx="0.0008" dy="0.0116" in="li" result="lo"></feOffset>
      <feGaussianBlur stdDeviation="0.0192 0.0193" in="lo" result="lb"></feGaussianBlur>
      <feComposite operator="in" in2="SourceAlpha" in="lb" result="gl"></feComposite>
      <feMerge>
        <feMergeNode in="SourceGraphic"></feMergeNode>
        <feMergeNode in="gl"></feMergeNode>
        <feMergeNode in="sh"></feMergeNode>
      </feMerge>
    </filter>
    <filter id="shared-inner-6" primitiveunits="objectBoundingBox" x="-50%" y="-50%" width="200%" height="200%">
      <feFlood flood-color="black" flood-opacity="1.00" result="df"></feFlood>
      <feComposite operator="out" in2="SourceAlpha" in="df" result="di"></feComposite>
      <feOffset dx="0.0019" dy="-0.0121" in="di" result="do"></feOffset>
      <feGaussianBlur stdDeviation="0.0201 0.0205" in="do" result="db"></feGaussianBlur>
      <feComposite operator="in" in2="SourceAlpha" in="db" result="sh"></feComposite>
      <feFlood flood-color="white" flood-opacity="0.33" result="lf"></feFlood>
      <feComposite operator="out" in2="SourceAlpha" in="lf" result="li"></feComposite>
      <feOffset dx="-0.0019" dy="0.0121" in="li" result="lo"></feOffset>
      <feGaussianBlur stdDeviation="0.0201 0.0205" in="lo" result="lb"></feGaussianBlur>
      <feComposite operator="in" in2="SourceAlpha" in="lb" result="gl"></feComposite>
      <feMerge>
        <feMergeNode in="SourceGraphic"></feMergeNode>
        <feMergeNode in="gl"></feMergeNode>
        <feMergeNode in="sh"></feMergeNode>
      </feMerge>
    </filter>
    <filter id="shadow-only-pill" filterunits="userSpaceOnUse" x="-30" y="-30" width="93.38" height="74.2">
      <feMorphology operator="dilate" radius="2.00" in="SourceAlpha" result="s_spread"></feMorphology>
      <feGaussianBlur in="s_spread" stdDeviation="1.50" result="s_blur"></feGaussianBlur>
      <feOffset in="s_blur" dx="0.00" dy="0.00" result="s_offset"></feOffset>
      <feFlood flood-color="black" flood-opacity="1.00" result="s_color"></feFlood>
      <feComposite in="s_color" in2="s_offset" operator="in" result="shadow_out"></feComposite>
    </filter>
  </defs>
</svg>
<div id="exported-content">
  <!-- BASE: SVG body loaded from local file -->
  <div class="item" id="base" style="height: 100%; left: 0%; top: 0%; width: 100%; z-index: 2">
    <svg
      class="shape"
      viewBox="0 0 433 744"
      width="433"
      height="744"
      preserveAspectRatio="xMidYMid meet"
      style="overflow-x: visible; overflow-y: visible"
    >
      <image href="public/base.svg" xlink:href="public/base.svg" width="100%" height="100%" preserveAspectRatio="xMidYMid meet"></image>
    </svg>
  </div>

  <!-- D-PAD -->
  <section class="item" id="dpad" style="height: 13.9173%; isolation: isolate; left: 9.00693%; top: 58.6022%; width: 24.1177%; z-index: 5">
    <div class="item" id="directional" style="height: 100%; left: 0%; top: 0%; width: 100%; z-index: 3">
      <svg class="shape" viewBox="0 0 104.43 103.54" preserveAspectRatio="xMidYMid meet" width="104.43" height="103.54">
        <g>
          <path class="fill-path" d="M 42.545 0 L 61.884 0 C 66.156 0 69.62 3.434 69.62 7.67 L 69.62 34.515 L 96.694 34.515 C 100.966 34.515 104.43 37.949 104.43 42.185 L 104.43 61.36 C 104.43 65.596 100.966 69.03 96.694 69.03 L 69.62 69.03 L 69.62 95.875 C 69.62 100.111 66.156 103.545 61.884 103.545 L 42.545 103.545 C 38.273 103.545 34.81 100.111 34.81 95.875 L 34.81 69.03 L 7.736 69.03 C 3.463 69.03 0 65.596 0 61.36 L 0 42.185 C 0 37.949 3.463 34.515 7.736 34.515 L 34.81 34.515 L 34.81 7.67 C 34.81 3.434 38.273 0 42.545 0 Z" fill="url(#shared-fill-1)" vector-effect="non-scaling-stroke" filter="url(#shared-inner-2)"></path>
          <path class="stroke-path" d="M 42.545 0 L 61.884 0 C 66.156 0 69.62 3.434 69.62 7.67 L 69.62 34.515 L 96.694 34.515 C 100.966 34.515 104.43 37.949 104.43 42.185 L 104.43 61.36 C 104.43 65.596 100.966 69.03 96.694 69.03 L 69.62 69.03 L 69.62 95.875 C 69.62 100.111 66.156 103.545 61.884 103.545 L 42.545 103.545 C 38.273 103.545 34.81 100.111 34.81 95.875 L 34.81 69.03 L 7.736 69.03 C 3.463 69.03 0 65.596 0 61.36 L 0 42.185 C 0 37.949 3.463 34.515 7.736 34.515 L 34.81 34.515 L 34.81 7.67 C 34.81 3.434 38.273 0 42.545 0 Z" fill="none" stroke="url(#stroke-grad-4)" stroke-width="2" vector-effect="non-scaling-stroke"></path>
        </g>
      </svg>
    </div>
    <button class="item" id="right" style="transform: rotate(90deg); height: 20.2733%; left: 74.3787%; opacity: 1; top: 40.7031%; width: 21.1185%; z-index: 4">
      <div class="key-internal-label" data-button="right" style="transform: translate(-50%, -50%) rotate(-90deg);">→</div>
      <svg class="shape" viewBox="0 0 22.05 21" preserveAspectRatio="xMidYMid meet" width="22.05" height="21">
        <g>
          <path class="fill-path" d="M 2 18.992 L 20.054 18.992 L 11.027 2 L 2 18.992 Z" fill="url(#shared-fill-3)" vector-effect="non-scaling-stroke"></path>
        </g>
      </svg>
    </button>
    <button class="item" id="down" style="transform: rotate(180deg); height: 18.3418%; left: 40.2185%; opacity: 1; top: 76.2956%; width: 20.1609%; z-index: 5">
      <div class="key-internal-label" data-button="down" style="transform: translate(-50%, -50%) rotate(-180deg);">↓</div>
      <svg class="shape" viewBox="0 0 21.05 19" preserveAspectRatio="xMidYMid meet" width="21.05" height="19">
        <g>
          <path class="fill-path" d="M 1.909 17.182 L 19.145 17.182 L 10.527 1.809 L 1.909 17.182 Z" fill="url(#shared-fill-3)" vector-effect="non-scaling-stroke"></path>
        </g>
      </svg>
    </button>
    <button class="item" id="up" style="height: 20.2733%; left: 39.2609%; opacity: 1; top: 6.76037%; width: 21.1185%; z-index: 6">
      <div class="key-internal-label" data-button="up">↑</div>
      <svg class="shape" viewBox="0 0 22.05 21" preserveAspectRatio="xMidYMid meet" width="22.05" height="21">
        <g>
          <path class="fill-path" d="M 2 18.992 L 20.054 18.992 L 11.027 2 L 2 18.992 Z" fill="url(#shared-fill-3)" vector-effect="non-scaling-stroke"></path>
        </g>
      </svg>
    </button>
    <button class="item" id="left" style="transform: rotate(270deg); height: 20.2733%; left: 5.43277%; opacity: 1; top: 40.7031%; width: 21.1185%; z-index: 7">
      <div class="key-internal-label" data-button="left" style="transform: translate(-50%, -50%) rotate(-270deg);">←</div>
      <svg class="shape" viewBox="0 0 22.05 21" preserveAspectRatio="xMidYMid meet" width="22.05" height="21">
        <g>
          <path class="fill-path" d="M 2 18.992 L 20.054 18.992 L 11.027 2 L 2 18.992 Z" fill="url(#shared-fill-3)" vector-effect="non-scaling-stroke"></path>
        </g>
      </svg>
    </button>
    <div class="item" id="mid" style="height: 22.7437%; left: 38.3033%; opacity: 1; top: 39.5964%; width: 23.3984%; z-index: 8">
      <svg class="shape" viewBox="0 0 24.43 23.55" width="24.43" height="23.55" preserveAspectRatio="xMidYMid meet">
        <g>
          <path class="fill-path" d="M 11.774955 0 L 12.659952 0 A 11.774955 11.774955 0 0 1 24.434907 11.774955 L 24.434907 11.774955 A 11.774955 11.774955 0 0 1 12.659952 23.54991 L 11.774955 23.54991 A 11.774955 11.774955 0 0 1 0 11.774955 L 0 11.774955 A 11.774955 11.774955 0 0 1 11.774955 0 Z" fill="url(#shared-fill-4)" vector-effect="non-scaling-stroke"></path>
        </g>
      </svg>
    </div>
    <div class="item" id="dpad-stroke" style="height: 100%; left: 0%; top: 0%; width: 100%; z-index: 2">
      <svg class="shape" viewBox="0 0 104.43 103.54" preserveAspectRatio="xMidYMid meet" width="104.43" height="103.54">
        <defs>
          <path d="M 42.545 0 L 61.884 0 C 66.156 0 69.62 3.434 69.62 7.67 L 69.62 34.515 L 96.694 34.515 C 100.966 34.515 104.43 37.949 104.43 42.185 L 104.43 61.36 C 104.43 65.596 100.966 69.03 96.694 69.03 L 69.62 69.03 L 69.62 95.875 C 69.62 100.111 66.156 103.545 61.884 103.545 L 42.545 103.545 C 38.273 103.545 34.81 100.111 34.81 95.875 L 34.81 69.03 L 7.736 69.03 C 3.463 69.03 0 65.596 0 61.36 L 0 42.185 C 0 37.949 3.463 34.515 7.736 34.515 L 34.81 34.515 L 34.81 7.67 C 34.81 3.434 38.273 0 42.545 0 Z" id="path-9"></path>
        </defs>
        <g>
          <use class="fill-path" href="#path-9" fill="none"></use>
          <use class="stroke-path" href="#path-9" fill="none" stroke="#000000" stroke-width="6"></use>
        </g>
      </svg>
    </div>
  </section>

  <!-- B BUTTON -->
  <button class="item" id="b" style="height: 6.85484%; isolation: isolate; left: 60.0462%; top: 63.9785%; width: 12.8515%; z-index: 6">
    <div class="key-internal-label" data-button="b">Q</div>
    <p class="item" id="txt-b" style="height: 90.1961%; left: 0%; top: 9.80392%; width: 93.4464%; z-index: 4">
      <svg viewBox="0 0 52 46" class="shape shape-textbox" preserveAspectRatio="xMidYMid meet" data-shape-type="textbox" width="52" height="46">
        <text x="26" text-anchor="middle" font-family='"Roboto", sans-serif' font-size="30" font-weight="700" fill="#191919">
          <tspan x="26" y="32">B</tspan>
        </text>
      </svg>
    </p>
    <div class="item" id="shape-b" style="height: 95.6684%; left: 10.7823%; opacity: 1; top: 0%; width: 89.2177%; z-index: 3">
      <svg class="shape" viewBox="0 0 49.65 48.79" width="49.65" height="48.79" preserveAspectRatio="xMidYMid meet">
        <g>
          <path class="fill-path" d="M 24.39545 0 L 25.251431 0 A 24.39545 24.39545 0 0 1 49.646881 24.39545 L 49.646881 24.39545 A 24.39545 24.39545 0 0 1 25.251431 48.7909 L 24.39545 48.7909 A 24.39545 24.39545 0 0 1 0 24.39545 L 0 24.39545 A 24.39545 24.39545 0 0 1 24.39545 0 Z" fill="url(#shared-fill-5)" vector-effect="non-scaling-stroke" filter="url(#shared-inner-6)"></path>
        </g>
      </svg>
    </div>
    <div class="item" id="b-stroke" style="height: 95.6684%; left: 10.7823%; opacity: 1; top: 0%; width: 89.2177%; z-index: 2">
      <svg class="shape" viewBox="0 0 49.65 48.79" width="49.65" height="48.79" preserveAspectRatio="xMidYMid meet">
        <defs>
          <path d="M 24.39545 0 L 25.251431 0 A 24.39545 24.39545 0 0 1 49.646881 24.39545 L 49.646881 24.39545 A 24.39545 24.39545 0 0 1 25.251431 48.7909 L 24.39545 48.7909 A 24.39545 24.39545 0 0 1 0 24.39545 L 0 24.39545 A 24.39545 24.39545 0 0 1 24.39545 0 Z" id="path-13"></path>
        </defs>
        <g>
          <use class="fill-path" href="#path-13" fill="none"></use>
          <use class="stroke-path" href="#path-13" fill="none" stroke="#000000" stroke-width="6"></use>
        </g>
      </svg>
    </div>
  </button>

  <!-- A BUTTON -->
  <button class="item" id="a" style="height: 6.72043%; isolation: isolate; left: 77.8291%; top: 60.3495%; width: 12.8589%; z-index: 7">
    <div class="key-internal-label" data-button="a">W</div>
    <div class="item" id="shape-a" style="height: 97.5818%; left: 10.834%; opacity: 1; top: 0%; width: 89.166%; z-index: 3">
      <svg class="shape" viewBox="0 0 49.65 48.79" width="49.65" height="48.79" preserveAspectRatio="xMidYMid meet">
        <g>
          <path class="fill-path" d="M 24.39545 0 L 25.251431 0 A 24.39545 24.39545 0 0 1 49.646881 24.39545 L 49.646881 24.39545 A 24.39545 24.39545 0 0 1 25.251431 48.7909 L 24.39545 48.7909 A 24.39545 24.39545 0 0 1 0 24.39545 L 0 24.39545 A 24.39545 24.39545 0 0 1 24.39545 0 Z" fill="url(#shared-fill-5)" vector-effect="non-scaling-stroke" filter="url(#shared-inner-6)"></path>
        </g>
      </svg>
    </div>
    <p class="item" id="txt-a" style="height: 92%; left: 0%; top: 8%; width: 95.1882%; z-index: 4">
      <svg viewBox="0 0 53 46" class="shape shape-textbox" preserveAspectRatio="xMidYMid meet" data-shape-type="textbox" width="53" height="46">
        <text x="26.5" text-anchor="middle" font-family='"Roboto", sans-serif' font-size="30" font-weight="700" fill="#191919">
          <tspan x="26.5" y="32">A</tspan>
        </text>
      </svg>
    </p>
    <div class="item" id="a-stroke" style="height: 97.5818%; left: 10.834%; opacity: 1; top: 0%; width: 89.166%; z-index: 2">
      <svg class="shape" viewBox="0 0 49.65 48.79" width="49.65" height="48.79" preserveAspectRatio="xMidYMid meet">
        <defs>
          <path d="M 24.39545 0 L 25.251431 0 A 24.39545 24.39545 0 0 1 49.646881 24.39545 L 49.646881 24.39545 A 24.39545 24.39545 0 0 1 25.251431 48.7909 L 24.39545 48.7909 A 24.39545 24.39545 0 0 1 0 24.39545 L 0 24.39545 A 24.39545 24.39545 0 0 1 24.39545 0 Z" id="path-17"></path>
        </defs>
        <g>
          <use class="fill-path" href="#path-17" fill="none"></use>
          <use class="stroke-path" href="#path-17" fill="none" stroke="#000000" stroke-width="6"></use>
        </g>
      </svg>
    </div>
  </button>

  <!-- SCREEN -->
  <section class="item" id="screen" style="height: 46.5581%; isolation: isolate; left: 6.00462%; top: 3.76344%; width: 88.0083%; z-index: 3">
    <div class="item" id="scr-base" style="height: 100%; left: 0.468011%; opacity: 1; top: 0%; width: 99.532%; z-index: 2">
      <svg class="shape" viewBox="0 0 379.29 346.39" preserveAspectRatio="xMidYMid meet" width="379.29" height="346.39">
        <defs>
          <path d="M 17.422 2.999 C 149.314 2.999 229.29 3.114 361.183 3.114 C 368.72 3.114 375.014 3.616 376.144 13.944 C 376.521 134.433 376.059 211.574 376.059 320.045 C 375.592 328.034 365.158 331.594 357.303 333.114 C 324.94 339.379 296.429 339.832 263.525 341.827 C 237.077 343.432 214.333 343.393 187.837 343.393 C 162.627 343.393 140.987 343.387 115.825 341.827 C 82.925 339.788 54.41 339.379 22.047 333.114 C 14.193 331.594 3.756 328.034 3.292 320.045 C 3.292 211.676 2.758 135.099 3.135 14.61 C 4.265 4.283 9.885 2.999 17.422 2.999 Z" id="path-19"></path>
        </defs>
        <g>
          <use class="fill-path" href="#path-19" fill="url(#shared-fill-7)"></use>
          <use class="stroke-path" href="#path-19" fill="none" stroke="url(#shared-stroke-8)" stroke-width="2"></use>
        </g>
      </svg>
    </div>
    <div class="item" id="screen-main" style="height: 63.7552%; left: 18.8577%; opacity: 1; top: 13.261%; width: 64.0173%; z-index: 3">
      <svg class="shape" viewBox="0 0 243.95 220.84" width="243.95" height="220.84" preserveAspectRatio="xMidYMid meet">
        <defs>
          <path d="M0 0h243.95450227732178v220.84302311420709H0z" id="path-20"></path>
        </defs>
        <g>
          <use class="fill-path" href="#path-20" fill="#888888"></use>
          <use class="stroke-path" href="#path-20" fill="none" stroke="url(#shared-stroke-9)" stroke-width="2"></use>
        </g>
      </svg>
    </div>
    <div class="item" id="power-light" style="height: 2.96536%; left: 4.72347%; opacity: 1; top: 31.7951%; width: 2.47084%; z-index: 5">
      <svg class="shape" viewBox="0 0 9.42 10.27" width="9.42" height="10.27" preserveAspectRatio="xMidYMid meet">
        <g>
          <path class="fill-path" d="M 4.707894 0 L 4.707894 0 A 4.707894 4.707894 0 0 1 9.415788 4.707894 L 9.415788 5.563875 A 4.707894 4.707894 0 0 1 4.707894 10.271769 L 4.707894 10.271769 A 4.707894 4.707894 0 0 1 0 5.563875 L 0 4.707894 A 4.707894 4.707894 0 0 1 4.707894 0 Z" fill="url(#shared-fill-10)" vector-effect="non-scaling-stroke"></path>
        </g>
      </svg>
    </div>
    <p class="item" id="txt-power" style="height: 8.08332%; left: 0%; top: 34.9707%; width: 19.4187%; z-index: 7">
      <svg viewBox="0 0 74 28" class="shape shape-textbox" preserveAspectRatio="xMidYMid meet" data-shape-type="textbox" width="74" height="28">
        <text x="37" text-anchor="middle" font-family='"Inter", sans-serif' font-size="12" font-weight="700" fill="#5C5C5C" letter-spacing="-0.6">
          <tspan x="37" y="17.6">POWER</tspan>
        </text>
      </svg>
    </p>
    <div class="item" id="logo-gbc" style="height: 9.57416%; left: 20.6937%; opacity: 1; top: 82.791%; width: 58.6158%; z-index: 4">
      <svg class="shape" viewBox="0 0 223.37 33.16" width="223.37" height="33.16" preserveAspectRatio="xMidYMid meet">
        <g>
          <path class="fill-path" d="M0 0h223.37071161625818v33.16417402483626H0z" fill="none" vector-effect="non-scaling-stroke"></path>
        </g>
        <image
          class="shape-icon custom-icon"
          width="210"
          height="210"
          x="6.6853558081290885"
          y="-88.41791298758187"
          href="public/icon.svg"
          xlink:href="public/icon.svg"
          preserveAspectRatio="xMidYMid meet"
          style="pointer-events: none"
        ></image>
      </svg>
    </div>
    <div class="item" id="pwr-accent" style="height: 5.7738%; left: 7.65398%; top: 30.9677%; width: 6.69863%; z-index: 6">
      <svg class="shape" viewBox="0 0 25.53 20" preserveAspectRatio="xMidYMid meet" width="25.53" height="20">
        <g>
          <path class="fill-path" d="M 23.526 7.631 Q 23.61 13.116 18.67 13.584 Q 21.182 11.007 21.182 7.899 Q 21.182 3.799 18 2.012 Q 23.445 2.311 23.526 7.631 Z M 15.526 7.619 Q 15.61 13.104 10.67 13.572 Q 13.182 10.994 13.182 7.886 Q 13.182 3.787 10 2 Q 15.445 2.299 15.526 7.619 Z M 7.526 7.619 Q 7.61 13.104 2.67 13.572 Q 5.182 10.994 5.182 7.886 Q 5.182 3.787 2 2 Q 7.445 2.299 7.526 7.619 Z" fill="#696969" vector-effect="non-scaling-stroke"></path>
        </g>
      </svg>
    </div>
    <div class="item" id="scr-glare" style="height: 67.7067%; left: 1.04606%; opacity: 0.05; top: 0.292242%; width: 58.8481%; z-index: 10; display: none;">
      <svg class="shape" viewBox="0 0 225.03 234.53" preserveAspectRatio="xMidYMid meet" width="225.03" height="234.53">
        <g>
          <path class="fill-path" d="M 222.915 2.197 L 4.738 232.334 Q 2.113 78.644 2.113 27.519 C 2.113 2.527 3.279 2.527 30.107 2.527 Q 78.225 2.527 222.915 2.197 Z" fill="#FFFFFF"></path>
        </g>
      </svg>
    </div>
  </section>

  <!-- START/SELECT -->
  <section class="item" id="start-select" style="height: 3.25626%; isolation: isolate; left: 38.7991%; top: 80.6452%; width: 22.5704%; z-index: 4">
    <button class="item" id="inset-select" style="height: 100%; left: 0%; opacity: 1; top: 0%; width: 42.6991%; z-index: 2">
      <svg class="shape" viewBox="0 0 41.73 24.23" preserveAspectRatio="xMidYMid meet" width="41.73" height="24.23">
        <defs>
          <path d="M 15.243 4.383 Q 21.03 3.617 26.486 4.383 C 29.824 4.851 37.73 6.955 37.73 12.1 C 37.73 17.245 29.795 19.165 26.486 19.817 Q 22.339 20.636 15.243 19.817 Q 4 17.888 4 12.1 Q 4 6.312 15.243 4.383 Z" id="path-26"></path>
        </defs>
        <g>
          <use class="fill-path" href="#path-26" fill="none"></use>
          <use class="stroke-path" href="#path-26" fill="none" stroke="#000000" stroke-width="4"></use>
        </g>
      </svg>
    </button>
    <div class="item" id="inset-start" style="height: 100%; left: 57.3009%; top: 0%; width: 42.6991%; z-index: 3">
      <svg class="shape" viewBox="0 0 41.73 24.23" preserveAspectRatio="xMidYMid meet" width="41.73" height="24.23">
        <defs>
          <path d="M 15.243 4.383 Q 21.03 3.617 26.486 4.383 C 29.824 4.851 37.73 6.955 37.73 12.1 C 37.73 17.245 29.795 19.165 26.486 19.817 Q 22.339 20.636 15.243 19.817 Q 4 17.888 4 12.1 Q 4 6.312 15.243 4.383 Z" id="path-27"></path>
        </defs>
        <g>
          <use class="fill-path" href="#path-27" fill="no-fill"></use>
          <use class="stroke-path" href="#path-27" fill="none" stroke="#000000" stroke-width="4"></use>
        </g>
      </svg>
    </div>
    <button class="item" id="select" style="height: 82.7357%; left: 2.17141%; opacity: 1; top: 8.63217%; width: 38.3563%; z-index: 4">
      <div class="key-internal-label" data-button="select">ALT</div>
      <svg class="shape" viewBox="0 0 37.49 20.04" preserveAspectRatio="xMidYMid meet" width="37.49" height="20.04">
        <defs>
          <path id="path-select" d="M 13.121 2.291 Q 18.908 1.526 24.364 2.291 C 27.702 2.76 35.608 4.864 35.608 10.009 C 35.608 15.154 27.673 17.073 24.364 17.726 Q 20.216 18.545 13.121 17.726 Q 1.878 15.797 1.878 10.009 Q 1.878 4.221 13.121 2.291 Z"></path>
        </defs>
        <g>
          <use href="#path-select" filter="url(#shadow-only-pill)"></use>
          <g class="btn-moving-part">
            <use class="fill-path" href="#path-select" fill="url(#shared-fill-11)" vector-effect="non-scaling-stroke"></use>
            <use class="active-fill" href="#path-select" fill="url(#shared-fill-11)" vector-effect="non-scaling-stroke"></use>
          </g>
        </g>
      </svg>
    </button>
    <button class="item" id="start" style="height: 82.7357%; left: 59.4723%; opacity: 1; top: 8.63217%; width: 38.3563%; z-index: 5">
      <div class="key-internal-label" data-button="start">CTRL</div>
      <svg class="shape" viewBox="0 0 37.49 20.04" preserveAspectRatio="xMidYMid meet" width="37.49" height="20.04">
        <defs>
          <path id="path-start" d="M 13.121 2.291 Q 18.908 1.526 24.364 2.291 C 27.702 2.76 35.608 4.864 35.608 10.009 C 35.608 15.154 27.673 17.073 24.364 17.726 Q 20.216 18.545 13.121 17.726 Q 1.878 15.797 1.878 10.009 Q 1.878 4.221 13.121 2.291 Z"></path>
        </defs>
        <g>
          <use href="#path-start" filter="url(#shadow-only-pill)"></use>
          <g class="btn-moving-part">
            <use class="fill-path" href="#path-start" fill="url(#shared-fill-11)" vector-effect="non-scaling-stroke"></use>
            <use class="active-fill" href="#path-start" fill="url(#shared-fill-11)" vector-effect="non-scaling-stroke"></use>
          </g>
        </g>
      </svg>
    </button>
  </section>

  <div class="key-internal-label" style="top: 91%; left: 50%; width: auto; height: 28px; padding: 0 8px; pointer-events: none; cursor: default; transform: translate(-50%, -50%); white-space: nowrap; font-size: 11px;">TAB · MENU / GAME</div>
</div>
`;

const template = document.createElement('template');
template.innerHTML = `<style>${componentCSS}</style>${componentHTML}`;

export class ExportedContent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
  }
}

if (!customElements.get(componentTagName)) {
  customElements.define(componentTagName, ExportedContent);
}
