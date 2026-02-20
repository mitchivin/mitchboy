const componentTagName = "exported-content";

const componentCSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Roboto:wght@400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

/* Material Symbols Utility Class - Matches _typography.css */
.material-symbols-outlined {
  font-family: "Material Symbols Outlined", system-ui;
  font-weight: normal;
  font-style: normal;
  font-size: 24px; /* Fallback */
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
  aspect-ratio: 0.591391;
  width: 100%;
  height: auto;
}
.item {
  position: absolute;
  margin: 0;
  padding: 0;
  pointer-events: none;
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

.shape-style-1 {
    overflow: visible;
}
.shape-style-2 {
    pointer-events: none;
}

/* Legacy Interactions & Animations */
#a, #b, #start, #select,
#up, #down, #left, #right, #mid {
  pointer-events: auto !important;
  cursor: pointer;
  transition: opacity 0.2s ease, filter 0.2s ease, fill 0.2s ease;
}

/* Move the internal parts (Body + Text) instead */
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

#a:active g, #b:active g,
#a.btn-pressed g, #b.btn-pressed g {
  /* No filter change needed */
}

/* Light Rotation Effect - Smooth Crossfade */
.active-fill {
  opacity: 0;
  transition: opacity 0.2s ease-out; /* Smooth return */
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
  transition: opacity 0.05s ease-out; /* Faster switch for "snap" feel */
}

/* Start / Select Press Animation */
#start:active .btn-moving-part, #select:active .btn-moving-part,
#start.btn-pressed .btn-moving-part, #select.btn-pressed .btn-moving-part {
  transform: scale(0.95);
  transform-origin: center;
  transition: transform 0.05s ease;
}

/* Extend clickable area for d-pad arrows */
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
#text-phones:hover {
  opacity: 0.5 !important;
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

.grill-dot {
  opacity: 0.78;
}

.grill-dot--purple {
  fill: #450C77;
}

/* Internal Key Labels - High Precision Centering */
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
    pointer-events: auto !important; /* Force auto so clicks reach the rebind listener */
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
        <linearGradient id="shared-fill-1" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#717171"></stop>
          <stop offset="100%" stop-color="#000000"></stop>
        </linearGradient>
        <!-- Direction inverted back (Top-Left to Bottom-Right) -->
        <linearGradient id="shared-fill-1-active" x1="30%" y1="10%" x2="70%" y2="90%">
          <stop offset="0%" stop-color="#656565"></stop>
          <stop offset="100%" stop-color="#000000"></stop>
        </linearGradient>
        <linearGradient id="shared-fill-4" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#7f0fcf"></stop>
          <stop offset="100%" stop-color="#530789"></stop>
        </linearGradient>
        <linearGradient id="shared-stroke-5" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#6000aa"></stop>
          <stop offset="100%" stop-color="#40006e"></stop>
        </linearGradient>
        <linearGradient id="shared-fill-7" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#7303c3"></stop>
          <stop offset="100%" stop-color="#5d099a"></stop>
        </linearGradient>
        <linearGradient id="shared-fill-9" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#48007b"></stop>
          <stop offset="100%" stop-color="#340357"></stop>
        </linearGradient>
        <linearGradient id="shared-stroke-10" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#35025a"></stop>
          <stop offset="100%" stop-color="#40005a"></stop>
        </linearGradient>
        <linearGradient id="shared-fill-12" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#171717"></stop>
          <stop offset="100%" stop-color="#171717"></stop>
        </linearGradient>
        <linearGradient id="shared-stroke-13" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#151515"></stop>
          <stop offset="100%" stop-color="#1f1f1f"></stop>
        </linearGradient>
        <linearGradient id="shared-fill-15" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#29003b"></stop>
          <stop offset="100%" stop-color="#7700c6"></stop>
        </linearGradient>
        <linearGradient id="shared-fill-17" x1="56.96%" y1="0.49%" x2="43.04%" y2="99.51%">
          <stop offset="0%" stop-color="#151515"></stop>
          <stop offset="100%" stop-color="#2f2f2f"></stop>
        </linearGradient>
        <linearGradient id="shared-fill-20" x1="93.73%" y1="74.24%" x2="6.27%" y2="25.76%">
          <stop offset="0%" stop-color="#070707"></stop>
          <stop offset="100%" stop-color="#161616"></stop>
        </linearGradient>
        <linearGradient id="shared-fill-21" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#010101"></stop>
          <stop offset="96%" stop-color="#2c2c2c"></stop>
        </linearGradient>
        <linearGradient id="shared-fill-23" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#404040"></stop>
          <stop offset="100%" stop-color="#1a1a1a"></stop>
        </linearGradient>
        <linearGradient id="shared-fill-23-active" x1="20%" y1="10%" x2="80%" y2="90%">
          <stop offset="0%" stop-color="#404040"></stop>
          <stop offset="100%" stop-color="#1a1a1a"></stop>
        </linearGradient>
        <linearGradient id="shared-fill-26" x1="82.14%" y1="11.7%" x2="17.86%" y2="88.3%">
          <stop offset="0%" stop-color="#2f2f2f"></stop>
          <stop offset="100%" stop-color="#151515"></stop>
        </linearGradient>
        <linearGradient id="shared-stroke-27" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#1b0034"></stop>
          <stop offset="100%" stop-color="#8e14e5"></stop>
        </linearGradient>
        <linearGradient id="shared-stroke-28" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#4f4f4f"></stop>
          <stop offset="100%" stop-color="#1c1c1c"></stop>
        </linearGradient>
        <linearGradient id="shared-fill-30" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#800000"></stop>
          <stop offset="100%" stop-color="#ff0000"></stop>
        </linearGradient>
        <filter
          id="shared-inner-2"
          primitiveunits="objectBoundingBox"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feFlood flood-color="black" flood-opacity="1.00" result="df"></feFlood>
          <feComposite operator="out" in2="SourceAlpha" in="df" result="di"></feComposite>
          <feOffset dx="0.0050" dy="-0.0406" in="di" result="do"></feOffset>
          <feGaussianBlur stdDeviation="0.0704" in="do" result="db"></feGaussianBlur>
          <feComposite operator="in" in2="SourceAlpha" in="db" result="sh"></feComposite>
          <feFlood flood-color="white" flood-opacity="0.14" result="lf"></feFlood>
          <feComposite operator="out" in2="SourceAlpha" in="lf" result="li"></feComposite>
          <feOffset dx="-0.005" dy="0.0406" in="li" result="lo"></feOffset>
          <feGaussianBlur stdDeviation="0.0704" in="lo" result="lb"></feGaussianBlur>
          <feComposite operator="in" in2="SourceAlpha" in="lb" result="gl"></feComposite>
          <feMerge>
            <feMergeNode in="SourceGraphic"></feMergeNode>
            <feMergeNode in="gl"></feMergeNode>
            <feMergeNode in="sh"></feMergeNode>
          </feMerge>
        </filter>
        <filter
          id="shared-outer-3"
          filterunits="userSpaceOnUse"
          x="-30"
          y="-30"
          width="93.38373680044901"
          height="74.19999999999993"
        >
          <feMorphology operator="dilate" radius="2.00" in="SourceAlpha" result="s_spread"></feMorphology>
          <feGaussianBlur in="s_spread" stdDeviation="1.50" result="s_blur"></feGaussianBlur>
          <feOffset in="s_blur" dx="0.00" dy="0.00" result="s_offset"></feOffset>
          <feFlood flood-color="black" flood-opacity="1.00" result="s_color"></feFlood>
          <feComposite in="s_color" in2="s_offset" operator="in" result="shadow_out"></feComposite>
          <feMerge>
            <feMergeNode in="shadow_out"></feMergeNode>
            <feMergeNode in="SourceGraphic"></feMergeNode>
          </feMerge>
        </filter>
        <filter
          id="shadow-only-pill"
          filterunits="userSpaceOnUse"
          x="-30"
          y="-30"
          width="93.38373680044901"
          height="74.19999999999993"
        >
          <feMorphology operator="dilate" radius="2.00" in="SourceAlpha" result="s_spread"></feMorphology>
          <feGaussianBlur in="s_spread" stdDeviation="1.50" result="s_blur"></feGaussianBlur>
          <feOffset in="s_blur" dx="0.00" dy="0.00" result="s_offset"></feOffset>
          <feFlood flood-color="black" flood-opacity="1.00" result="s_color"></feFlood>
          <feComposite in="s_color" in2="s_offset" operator="in" result="shadow_out"></feComposite>
          <!-- No SourceGraphic merge -->
        </filter>
        <filter
          id="shared-inner-6"
          primitiveunits="objectBoundingBox"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feFlood flood-color="black" flood-opacity="0.70" result="flood"></feFlood>
          <feComposite operator="out" in="flood" in2="SourceAlpha" result="inv"></feComposite>
          <feGaussianBlur stdDeviation="0.0234" in="inv"></feGaussianBlur>
          <feComposite operator="in" in2="SourceAlpha" result="sh"></feComposite>
          <feMerge>
            <feMergeNode in="SourceGraphic"></feMergeNode>
            <feMergeNode in="sh"></feMergeNode>
          </feMerge>
        </filter>
        <filter
          id="shared-inner-8"
          primitiveunits="objectBoundingBox"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur stdDeviation="0.0296"></feGaussianBlur>
        </filter>
        <filter
          id="shared-inner-11"
          primitiveunits="objectBoundingBox"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feFlood flood-color="black" flood-opacity="0.89" result="flood"></feFlood>
          <feComposite operator="out" in="flood" in2="SourceAlpha" result="inv"></feComposite>
          <feGaussianBlur stdDeviation="0.0207" in="inv"></feGaussianBlur>
          <feComposite operator="in" in2="SourceAlpha" result="sh"></feComposite>
          <feMerge>
            <feMergeNode in="SourceGraphic"></feMergeNode>
            <feMergeNode in="sh"></feMergeNode>
          </feMerge>
        </filter>
        <filter
          id="shared-inner-14"
          primitiveunits="objectBoundingBox"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feFlood flood-color="black" flood-opacity="1.00" result="flood"></feFlood>
          <feComposite operator="out" in="flood" in2="SourceAlpha" result="inv"></feComposite>
          <feGaussianBlur stdDeviation="0.0523" in="inv"></feGaussianBlur>
          <feComposite operator="in" in2="SourceAlpha" result="sh"></feComposite>
          <feMerge>
            <feMergeNode in="SourceGraphic"></feMergeNode>
            <feMergeNode in="sh"></feMergeNode>
          </feMerge>
        </filter>
        <filter
          id="shared-inner-16"
          primitiveunits="objectBoundingBox"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feFlood flood-color="black" flood-opacity="0.68" result="flood"></feFlood>
          <feComposite operator="out" in="flood" in2="SourceAlpha" result="inv"></feComposite>
          <feGaussianBlur stdDeviation="0.0697" in="inv"></feGaussianBlur>
          <feComposite operator="in" in2="SourceAlpha" result="sh"></feComposite>
          <feMerge>
            <feMergeNode in="SourceGraphic"></feMergeNode>
            <feMergeNode in="sh"></feMergeNode>
          </feMerge>
        </filter>
        <filter
          id="shared-inner-18"
          primitiveunits="objectBoundingBox"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feFlood flood-color="black" flood-opacity="1.00" result="df"></feFlood>
          <feComposite operator="out" in2="SourceAlpha" in="df" result="di"></feComposite>
          <feOffset dx="-0.0008" dy="-0.0116" in="di" result="do"></feOffset>
          <feGaussianBlur stdDeviation="0.0193" in="do" result="db"></feGaussianBlur>
          <feComposite operator="in" in2="SourceAlpha" in="db" result="sh"></feComposite>
          <feFlood flood-color="white" flood-opacity="0.29" result="lf"></feFlood>
          <feComposite operator="out" in2="SourceAlpha" in="lf" result="li"></feComposite>
          <feOffset dx="0.0008" dy="0.0116" in="li" result="lo"></feOffset>
          <feGaussianBlur stdDeviation="0.0193" in="lo" result="lb"></feGaussianBlur>
          <feComposite operator="in" in2="SourceAlpha" in="lb" result="gl"></feComposite>
          <feMerge>
            <feMergeNode in="SourceGraphic"></feMergeNode>
            <feMergeNode in="gl"></feMergeNode>
            <feMergeNode in="sh"></feMergeNode>
          </feMerge>
        </filter>
        <filter
          id="shared-outer-19"
          filterunits="userSpaceOnUse"
          x="-30"
          y="-30"
          width="164.4296465888886"
          height="163.54464958389804"
        >
          <feMorphology operator="dilate" radius="2.00" in="SourceAlpha" result="s_spread"></feMorphology>
          <feGaussianBlur in="s_spread" stdDeviation="1.50" result="s_blur"></feGaussianBlur>
          <feOffset in="s_blur" dx="0.00" dy="0.00" result="s_offset"></feOffset>
          <feFlood flood-color="black" flood-opacity="1.00" result="s_color"></feFlood>
          <feComposite in="s_color" in2="s_offset" operator="in" result="shadow_out"></feComposite>
          <feMerge>
            <feMergeNode in="shadow_out"></feMergeNode>
            <feMergeNode in="SourceGraphic"></feMergeNode>
          </feMerge>
        </filter>
        <filter
          id="shared-inner-24"
          primitiveunits="objectBoundingBox"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feFlood flood-color="black" flood-opacity="1.00" result="df"></feFlood>
          <feComposite operator="out" in2="SourceAlpha" in="df" result="di"></feComposite>
          <feOffset dx="0.0019" dy="-0.0121" in="di" result="do"></feOffset>
          <feGaussianBlur stdDeviation="0.0205" in="do" result="db"></feGaussianBlur>
          <feComposite operator="in" in2="SourceAlpha" in="db" result="sh"></feComposite>
          <feFlood flood-color="white" flood-opacity="0.33" result="lf"></feFlood>
          <feComposite operator="out" in2="SourceAlpha" in="lf" result="li"></feComposite>
          <feOffset dx="-0.0019" dy="0.0121" in="li" result="lo"></feOffset>
          <feGaussianBlur stdDeviation="0.0205" in="lo" result="lb"></feGaussianBlur>
          <feComposite operator="in" in2="SourceAlpha" in="lb" result="gl"></feComposite>
          <feMerge>
            <feMergeNode in="SourceGraphic"></feMergeNode>
            <feMergeNode in="gl"></feMergeNode>
            <feMergeNode in="sh"></feMergeNode>
          </feMerge>
        </filter>
        <filter
          id="shared-outer-25"
          filterunits="userSpaceOnUse"
          x="-30"
          y="-30"
          width="109.64688116520935"
          height="108.79090045546437"
        >
          <feMorphology operator="dilate" radius="1.50" in="SourceAlpha" result="s_spread"></feMorphology>
          <feGaussianBlur in="s_spread" stdDeviation="1.50" result="s_blur"></feGaussianBlur>
          <feOffset in="s_blur" dx="0.00" dy="0.00" result="s_offset"></feOffset>
          <feFlood flood-color="black" flood-opacity="1.00" result="s_color"></feFlood>
          <feComposite in="s_color" in2="s_offset" operator="in" result="shadow_out"></feComposite>
          <feMerge>
            <feMergeNode in="shadow_out"></feMergeNode>
            <feMergeNode in="SourceGraphic"></feMergeNode>
          </feMerge>
        </filter>
        <filter
          id="shared-outer-25-active"
          filterunits="userSpaceOnUse"
          x="-30"
          y="-30"
          width="109.64688116520935"
          height="108.79090045546437"
        >
          <feMorphology operator="dilate" radius="2.50" in="SourceAlpha" result="s_spread"></feMorphology>
          <feGaussianBlur in="s_spread" stdDeviation="2.50" result="s_blur"></feGaussianBlur>
          <feOffset in="s_blur" dx="0.00" dy="0.00" result="s_offset"></feOffset>
          <feFlood flood-color="black" flood-opacity="1.00" result="s_color"></feFlood>
          <feComposite in="s_color" in2="s_offset" operator="in" result="shadow_out"></feComposite>
          <feMerge>
            <feMergeNode in="shadow_out"></feMergeNode>
            <feMergeNode in="SourceGraphic"></feMergeNode>
          </feMerge>
        </filter>
        <filter
          id="shadow-only-base"
          filterunits="userSpaceOnUse"
          x="-30"
          y="-30"
          width="109.64688116520935"
          height="108.79090045546437"
        >
          <feMorphology operator="dilate" radius="2" in="SourceAlpha" result="s_spread"></feMorphology>
          <feGaussianBlur in="s_spread" stdDeviation="2" result="s_blur"></feGaussianBlur>
          <feOffset in="s_blur" dx="0.00" dy="0.00" result="s_offset"></feOffset>
          <feFlood flood-color="black" flood-opacity="1.00" result="s_color"></feFlood>
          <feComposite in="s_color" in2="s_offset" operator="in" result="shadow_out"></feComposite>
          <!-- No SourceGraphic merge -->
        </filter>
        <filter
          id="shadow-only-active"
          filterunits="userSpaceOnUse"
          x="-30"
          y="-30"
          width="109.64688116520935"
          height="108.79090045546437"
        >
          <feMorphology operator="dilate" radius="2.50" in="SourceAlpha" result="s_spread"></feMorphology>
          <feGaussianBlur in="s_spread" stdDeviation="2.50" result="s_blur"></feGaussianBlur>
          <feOffset in="s_blur" dx="0.00" dy="0.00" result="s_offset"></feOffset>
          <feFlood flood-color="black" flood-opacity="1.00" result="s_color"></feFlood>
          <feComposite in="s_color" in2="s_offset" operator="in" result="shadow_out"></feComposite>
          <!-- No SourceGraphic merge -->
        </filter>
        <filter
          id="shared-inner-29"
          primitiveunits="objectBoundingBox"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feFlood flood-color="black" flood-opacity="1.00" result="flood"></feFlood>
          <feComposite operator="out" in="flood" in2="SourceAlpha" result="inv"></feComposite>
          <feGaussianBlur stdDeviation="0.0543" in="inv"></feGaussianBlur>
          <feComposite operator="in" in2="SourceAlpha" result="sh"></feComposite>
          <feMerge>
            <feMergeNode in="SourceGraphic"></feMergeNode>
            <feMergeNode in="sh"></feMergeNode>
          </feMerge>
        </filter>
        <filter
          id="shared-inner-31"
          primitiveunits="objectBoundingBox"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur stdDeviation="0.0444"></feGaussianBlur>
        </filter>
        <filter
          id="shared-inner-32"
          primitiveunits="objectBoundingBox"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feFlood flood-color="black" flood-opacity="1.00" result="df"></feFlood>
          <feComposite operator="out" in2="SourceAlpha" in="df" result="di"></feComposite>
          <feOffset dx="0.0049" dy="-0.0406" in="di" result="do"></feOffset>
          <feGaussianBlur stdDeviation="0.0704" in="do" result="db"></feGaussianBlur>
          <feComposite operator="in" in2="SourceAlpha" in="db" result="sh"></feComposite>
          <feFlood flood-color="white" flood-opacity="0.14" result="lf"></feFlood>
          <feComposite operator="out" in2="SourceAlpha" in="lf" result="li"></feComposite>
          <feOffset dx="-0.0049" dy="0.0406" in="li" result="lo"></feOffset>
          <feGaussianBlur stdDeviation="0.0704" in="lo" result="lb"></feGaussianBlur>
          <feComposite operator="in" in2="SourceAlpha" in="lb" result="gl"></feComposite>
          <feMerge>
            <feMergeNode in="SourceGraphic"></feMergeNode>
            <feMergeNode in="gl"></feMergeNode>
            <feMergeNode in="sh"></feMergeNode>
          </feMerge>
        </filter>
        <filter
          id="shared-outer-33"
          filterunits="userSpaceOnUse"
          x="-30"
          y="-30"
          width="93.58373680044917"
          height="74.20000000000005"
        >
          <feMorphology operator="dilate" radius="3.00" in="SourceAlpha" result="s_spread"></feMorphology>
          <feGaussianBlur in="s_spread" stdDeviation="2.00" result="s_blur"></feGaussianBlur>
          <feOffset in="s_blur" dx="0.00" dy="0.00" result="s_offset"></feOffset>
          <feFlood flood-color="black" flood-opacity="1.00" result="s_color"></feFlood>
          <feComposite in="s_color" in2="s_offset" operator="in" result="shadow_out"></feComposite>
          <feMerge>
            <feMergeNode in="shadow_out"></feMergeNode>
            <feMergeNode in="SourceGraphic"></feMergeNode>
          </feMerge>
        </filter>
        <!-- Legacy Gradients for LED -->
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
      </defs>
    </svg>
    <div id="exported-content">
        <button class="item" id="select" style="height: 1.90277%; left: 40.29%; opacity: 1; top: 83.1651%; width: 7.56411%; z-index: 4">
            <div class="key-internal-label" data-button="select">ALT</div>
            <svg class="shape shape-style-1" viewBox="0 0 33.383737 14.200000" preserveAspectRatio="none" width="33.383737" height="14.200000">
             <defs>
               <path id="path-select" d="M 11.175 0.459 Q 16.854 -0.199 22.208 0.459 C 25.483 0.861 33.241 2.669 33.241 7.089 C 33.241 11.509 25.455 13.158 22.208 13.718 Q 18.138 14.422 11.175 13.718 Q 0.143 12.061 0.143 7.089 Q 0.143 2.116 11.175 0.459 Z"></path>
             </defs>
             <g>
               <!-- Layer 1: Base Shadow (Static) -->
               <use href="#path-select" filter="url(#shadow-only-pill)"></use>

               <!-- Group Moving Parts -->
               <g class="btn-moving-part">
                 <use class="fill-path" href="#path-select" fill="url(#shared-fill-1)" vector-effect="non-scaling-stroke" filter="url(#shared-inner-2)"></use>
                 
                 <!-- Active Fill (Diagonal Light) - Fades in -->
                 <use class="active-fill" href="#path-select" fill="url(#shared-fill-1-active)" vector-effect="non-scaling-stroke" filter="url(#shared-inner-2)"></use>
               </g>
             </g>
           </svg>
        </button>
        <button class="item" id="start" style="height: 1.90277%; left: 53.1725%; opacity: 1; top: 83.1651%; width: 7.56411%; z-index: 4">
            <div class="key-internal-label" data-button="start">CTRL</div>
        <svg class="shape shape-style-1" viewBox="0 0 33.383737 14.200000" preserveAspectRatio="none" width="33.383737" height="14.200000">
          <defs>
            <path id="path-start" d="M 11.175 0.459 Q 16.854 -0.199 22.208 0.459 C 25.483 0.861 33.241 2.669 33.241 7.089 C 33.241 11.509 25.455 13.158 22.208 13.718 Q 18.138 14.422 11.175 13.718 Q 0.143 12.061 0.143 7.089 Q 0.143 2.116 11.175 0.459 Z"></path>
          </defs>
          <g>
            <!-- Layer 1: Base Shadow (Static) -->
            <use href="#path-start" filter="url(#shadow-only-pill)"></use>

            <!-- Group Moving Parts -->
            <g class="btn-moving-part">
              <use class="fill-path" href="#path-start" fill="url(#shared-fill-1)" vector-effect="non-scaling-stroke" filter="url(#shared-inner-2)"></use>
              
              <!-- Active Fill (Diagonal Light) - Fades in -->
              <use class="active-fill" href="#path-start" fill="url(#shared-fill-1-active)" vector-effect="non-scaling-stroke" filter="url(#shared-inner-2)"></use>
            </g>
          </g>
        </svg>
      </button>
      <section class="item" id="gbc" style="height: 100.001%; isolation: isolate; left: 8e-06%; top: 0%; width: 100.001%; z-index: 2">
        <div class="item" id="notches" style="height: 9.88024%; left: 0%; top: 9.81976%; width: 100%; z-index: 2">
          <svg class="shape" viewBox="0 0 441.346855 73.735450" preserveAspectRatio="none" width="441.346855" height="73.735450">
            <g>
              <path class="fill-path" d="M 420.821 2 L 435.466 2 C 437.607 2 439.342 3.732 439.342 5.868 C 439.342 8.004 437.607 9.735 435.466 9.735 L 420.821 9.735 C 418.68 9.735 416.945 8.004 416.945 5.868 C 416.945 3.732 418.68 2 420.821 2 Z M 420.821 23 L 435.466 23 C 437.607 23 439.342 24.732 439.342 26.868 C 439.342 29.004 437.607 30.735 435.466 30.735 L 420.821 30.735 C 418.68 30.735 416.945 29.004 416.945 26.868 C 416.945 24.732 418.68 23 420.821 23 Z M 420.821 43 L 435.466 43 C 437.607 43 439.342 44.732 439.342 46.868 C 439.342 49.004 437.607 50.735 435.466 50.735 L 420.821 50.735 C 418.68 50.735 416.945 49.004 416.945 46.868 C 416.945 44.732 418.68 43 420.821 43 Z M 420.821 64 L 435.466 64 C 437.607 64 439.342 65.732 439.342 67.868 C 439.342 70.004 437.607 71.735 435.466 71.735 L 420.821 71.735 C 418.68 71.735 416.945 70.004 416.945 67.868 C 416.945 65.732 418.68 64 420.821 64 Z M 5.881 2 L 20.526 2 C 22.667 2 24.402 3.732 24.402 5.868 C 24.402 8.004 22.667 9.735 20.526 9.735 L 5.881 9.735 C 3.74 9.735 2.005 8.004 2.005 5.868 C 2.005 3.732 3.74 2 5.881 2 Z M 5.881 23 L 20.526 23 C 22.667 23 24.402 24.732 24.402 26.868 C 24.402 29.004 22.667 30.735 20.526 30.735 L 5.881 30.735 C 3.74 30.735 2.005 29.004 2.005 26.868 C 2.005 24.732 3.74 23 5.881 23 Z M 5.881 43 L 20.526 43 C 22.667 43 24.402 44.732 24.402 46.868 C 24.402 49.004 22.667 50.735 20.526 50.735 L 5.881 50.735 C 3.74 50.735 2.005 49.004 2.005 46.868 C 2.005 44.732 3.74 43 5.881 43 Z M 5.881 64 L 20.526 64 C 22.667 64 24.402 65.732 24.402 67.868 C 24.402 70.004 22.667 71.735 20.526 71.735 L 5.881 71.735 C 3.74 71.735 2.005 70.004 2.005 67.868 C 2.005 65.732 3.74 64 5.881 64 Z" fill="#570099" vector-effect="non-scaling-stroke"></path>
            </g>
          </svg>
        </div>
        <div class="item" id="base" style="height: 100%; left: 1.52248%; opacity: 1; top: 0%; width: 96.9378%; z-index: 3">
          <svg class="shape" viewBox="0 0 427.831746 746.291745" preserveAspectRatio="none" width="427.831746" height="746.291745">
            <defs>
              <path d="M 19.229 2 C 152.471 2 273.424 2 408.603 2 C 416.786 2.319 425.629 9.643 425.832 17.83 C 425.832 255.16 425.724 455.13 425.724 692.977 C 425.345 705.427 416.081 717.136 404.405 721.471 C 368.877 734.661 335.445 736.038 297.808 740.467 C 267.425 744.043 241.076 744.292 210.484 744.292 C 182.254 744.292 157.939 743.884 129.917 740.467 C 92.299 735.881 58.847 734.661 23.319 721.471 C 11.643 717.136 2.377 705.427 2 692.977 C 2 456.132 2 255.16 2 17.83 C 2.204 9.644 11.046 2.319 19.229 2 Z" id="path-4"></path>
            </defs>
            <g>
              <use class="fill-path" href="#path-4" fill="url(#shared-fill-4)" filter="url(#shared-inner-6)"></use>
              <use class="stroke-path" href="#path-4" fill="none" stroke="url(#shared-stroke-5)" stroke-width="6"></use>
            </g>
          </svg>
        </div>
        <!-- BODY_CONTENT_4 -->
        <div class="item" id="nintendo-logo" style="height: 5.16252%; left: 36.7451%; opacity: 0.25; top: 52.9716%; width: 26.6493%; z-index: 20; overflow: visible !important; pointer-events: auto !important; cursor: default !important;">
          <svg id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 405.94 100" style="width: 100%; height: 100%; fill: #000000;">
            <g id="Layer_2-2" data-name="Layer 2">
              <g id="svg2">
                <g>
                  <polygon points="75.23 26.37 89.78 26.37 89.78 73.46 75.24 73.46 54.85 40.62 54.85 73.46 40.26 73.46 40.26 26.37 54.94 26.37 75.24 59.2 75.23 26.37"/>
                  <rect x="97.84" y="26.36" width="14.2" height="9.63"/>
                  <rect x="97.88" y="42.15" width="14.16" height="31.31"/>
                  <path d="M161.13,56.41v17.04h-14.06v-20.56c0-2.73-2.61-5.76-6.47-5.76s-6.72,3.03-6.72,5.76c0,1.33,0,20.56,0,20.56h-14.05v-31.3l14.05-.02s0,2.52,0,3.3c2.71-2.59,6.62-4.6,11.29-4.73,5.3-.15,16.03,3.31,15.95,15.71h0Z"/>
                  <polygon points="183.07 42.21 183.09 73.46 168.9 73.46 168.91 42.21 161.21 42.21 161.21 37.57 168.91 37.55 168.9 31.22 183.07 31.22 183.07 37.55 190.74 37.55 190.74 42.21 183.07 42.21"/>
                  <path d="M215.69,64.4c0,5.72-3.76,7-5.85,7s-5.93-1.28-5.93-7c0-1.72.02-6.46.02-6.46,0,0,26.67.02,26.67,0,0-9.71-9.38-17.75-20.89-17.75s-20.84,7.86-20.84,17.58,9.33,17.57,20.84,17.57c9.55,0,17.63-5.45,20.09-12.85l-14.11.02v1.9ZM204.86,46.92c1.1-1.93,3.13-2.85,4.98-2.86,1.84,0,3.87.93,4.97,2.86.9,1.56.95,3.39.93,6.13h-11.81c-.03-2.74.03-4.57.93-6.13h0Z"/>
                  <path d="M276.19,56.41c-.02,2.21,0,17.04,0,17.04h-14.08v-20.56c0-2.73-2.6-5.76-6.47-5.76s-6.71,3.03-6.71,5.76v20.56h-14.05v-31.3l14.05-.02v3.3c2.71-2.59,6.61-4.6,11.29-4.73,5.29-.15,16.03,3.31,15.96,15.71h.01Z"/>
                  <path d="M306.7,26.37v17.34c-2.27-1.28-4.65-2.51-8.01-2.8-10.21-.91-18,8.12-18,16.38,0,10.9,8.4,14.93,9.68,15.54,4.77,2.2,10.88,2.2,16.3-1.18,0,.28.01,1.8.01,1.8h13.99V26.37h-13.97,0ZM306.8,63.19c0,4.85-3.35,6.1-5.55,6.1s-5.55-1.25-5.55-6.1v-11.15c0-4.84,3.3-6.07,5.55-6.07s5.55,1.23,5.55,6.07c0,0,0,11.15,0,11.15Z"/>
                  <path d="M345.97,40.02c-11.42,0-20.69,7.86-20.69,17.57s9.27,17.57,20.69,17.57,20.69-7.87,20.69-17.57-9.25-17.57-20.69-17.57ZM351.65,64.18c0,4.99-2.94,7.04-5.79,7.04s-5.81-2.05-5.81-7.04c0-1.91.01-6.76.01-6.76v-6.52c0-4.97,2.98-7.01,5.79-7.01s5.79,2.04,5.79,7.01c0,1.89-.01,5.37.01,6.64,0,0-.01,4.73-.01,6.64h0Z"/>
                  <path d="M371.1,32.85c1.58-.2,2.78-1.03,2.78-2.95,0-2.12-1.25-3.05-3.79-3.05h-4.07v10.72h1.62v-4.65h1.86l2.83,4.65h1.82l-3.05-4.72h0ZM367.64,31.54v-3.31h2.21c1.13,0,2.34.24,2.34,1.57,0,1.65-1.24,1.74-2.61,1.74h-1.94Z"/>
                  <path d="M369.6,22.93c-5.11,0-9.43,3.92-9.43,9.26s4.32,9.32,9.43,9.32,9.39-3.94,9.39-9.32-4.32-9.26-9.39-9.26ZM369.6,39.96c-4.25,0-7.57-3.29-7.57-7.77s3.32-7.71,7.57-7.71,7.52,3.3,7.52,7.71-3.31,7.77-7.52,7.77Z"/>
                  <path d="M352.9,0H53.05C21.32-.09,0,22.74,0,50.08s21.27,49.91,53.1,49.92h299.75c31.82-.01,53.09-22.56,53.09-49.92S384.62-.09,352.9,0ZM352.74,87.74H53.19c-25.28.08-40.66-16.89-40.66-37.72S27.99,12.34,53.19,12.29h299.55c25.21.05,40.67,16.9,40.67,37.73s-15.36,37.8-40.67,37.72Z"/>
                </g>
              </g>
            </g>
          </svg>
        </div>
        <!-- BODY_CONTENT_5 -->
        <section class="item" id="dpad" style="height: 13.8747%; isolation: isolate; left: 10.8759%; top: 59.763%; width: 23.6617%; z-index: 5">
          <div class="item" id="directional" style="height: 100%; left: 0%; top: 0%; width: 100%; z-index: 2">
            <svg class="shape shape-style-1" viewBox="0 0 104.429647 103.544650" preserveAspectRatio="none" width="104.429647" height="103.544650">
              <defs>
                <linearGradient id="stroke-grad-4" x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stop-color="#525252"></stop>
                  <stop offset="100%" stop-color="#292929"></stop>
                </linearGradient>
              </defs>
              <g filter="url(#shared-outer-19)">
                <path class="fill-path" d="M 42.545 0 L 61.884 0 C 66.156 0 69.62 3.434 69.62 7.67 L 69.62 34.515 L 96.694 34.515 C 100.966 34.515 104.43 37.949 104.43 42.185 L 104.43 61.36 C 104.43 65.596 100.966 69.03 96.694 69.03 L 69.62 69.03 L 69.62 95.875 C 69.62 100.111 66.156 103.545 61.884 103.545 L 42.545 103.545 C 38.273 103.545 34.81 100.111 34.81 95.875 L 34.81 69.03 L 7.736 69.03 C 3.463 69.03 0 65.596 0 61.36 L 0 42.185 C 0 37.949 3.463 34.515 7.736 34.515 L 34.81 34.515 L 34.81 7.67 C 34.81 3.434 38.273 0 42.545 0 Z" fill="url(#shared-fill-17)" vector-effect="non-scaling-stroke" filter="url(#shared-inner-18)"></path>
                <path class="stroke-path" d="M 42.545 0 L 61.884 0 C 66.156 0 69.62 3.434 69.62 7.67 L 69.62 34.515 L 96.694 34.515 C 100.966 34.515 104.43 37.949 104.43 42.185 L 104.43 61.36 C 104.43 65.596 100.966 69.03 96.694 69.03 L 69.62 69.03 L 69.62 95.875 C 69.62 100.111 66.156 103.545 61.884 103.545 L 42.545 103.545 C 38.273 103.545 34.81 100.111 34.81 95.875 L 34.81 69.03 L 7.736 69.03 C 3.463 69.03 0 65.596 0 61.36 L 0 42.185 C 0 37.949 3.463 34.515 7.736 34.515 L 34.81 34.515 L 34.81 7.67 C 34.81 3.434 38.273 0 42.545 0 Z" fill="none" stroke="url(#stroke-grad-4)" stroke-width="2" vector-effect="non-scaling-stroke"></path>
              </g>
            </svg>
          </div>
          <button class="item" id="right" style="transform: rotate(90deg); height: 20.2733%; left: 74.3787%; opacity: 1; top: 40.8316%; width: 21.1185%; z-index: 3">
            <div class="key-internal-label" data-button="right" style="transform: translate(-50%, -50%) rotate(-90deg);">→</div>
            <svg class="shape" viewBox="0 0 22.053939 20.991942" preserveAspectRatio="none" width="22.053939" height="20.991942">
              <defs>
                <path d="M 2 18.992 L 20.054 18.992 L 11.027 2 L 2 18.992 Z" id="path-16"></path>
              </defs>
              <g>
                <use class="fill-path" href="#path-16" fill="url(#shared-fill-20)"></use>
                <use class="stroke-path" href="#path-16" fill="none" stroke="#1E1E1E" stroke-width="1"></use>
              </g>
            </svg>
          </button>
          <button class="item" id="down" style="transform: rotate(180deg); height: 18.3418%; left: 39.9221%; opacity: 1; top: 76.4365%; width: 20.1609%; z-index: 4">
            <div class="key-internal-label" data-button="down" style="transform: translate(-50%, -50%) rotate(-180deg);">↓</div>
            <svg class="shape" viewBox="0 0 21.053939 18.991942" preserveAspectRatio="none" width="21.053939" height="18.991942">
              <defs>
                <path d="M 1.909 17.182 L 19.145 17.182 L 10.527 1.809 L 1.909 17.182 Z" id="path-17"></path>
              </defs>
              <g>
                <use class="fill-path" href="#path-17" fill="url(#shared-fill-20)"></use>
                <use class="stroke-path" href="#path-17" fill="none" stroke="#1E1E1E" stroke-width="1"></use>
              </g>
            </svg>
          </button>
          <button class="item" id="up" style="height: 20.2733%; left: 39.4433%; opacity: 1; top: 6.90125%; width: 21.1185%; z-index: 5">
            <div class="key-internal-label" data-button="up">↑</div>
            <svg class="shape" viewBox="0 0 22.053939 20.991942" preserveAspectRatio="none" width="22.053939" height="20.991942">
              <defs>
                <path d="M 2 18.992 L 20.054 18.992 L 11.027 2 L 2 18.992 Z" id="path-18"></path>
              </defs>
              <g>
                <use class="fill-path" href="#path-18" fill="url(#shared-fill-20)"></use>
                <use class="stroke-path" href="#path-18" fill="none" stroke="#1E1E1E" stroke-width="1"></use>
              </g>
            </svg>
          </button>
          <button class="item" id="left" style="transform: rotate(270deg); height: 20.2733%; left: 5.43277%; opacity: 1; top: 40.8316%; width: 21.1185%; z-index: 6">
            <div class="key-internal-label" data-button="left" style="transform: translate(-50%, -50%) rotate(-270deg);">←</div>
            <svg class="shape" viewBox="0 0 22.053939 20.991942" preserveAspectRatio="none" width="22.053939" height="20.991942">
              <defs>
                <path d="M 2 18.992 L 20.054 18.992 L 11.027 2 L 2 18.992 Z" id="path-19"></path>
              </defs>
              <g>
                <use class="fill-path" href="#path-19" fill="url(#shared-fill-20)"></use>
                <use class="stroke-path" href="#path-19" fill="none" stroke="#1E1E1E" stroke-width="1"></use>
              </g>
            </svg>
          </button>
          <div class="item" id="mid" style="height: 22.7437%; left: 38.3033%; opacity: 1; top: 39.5964%; width: 23.3984%; z-index: 7">
            <svg class="shape" viewBox="0 0 24.434907 23.549910" width="24.434907" height="23.549910" preserveAspectRatio="none">
              <defs>
                <path d="M 11.774955 0 L 12.659952 0 A 11.774955 11.774955 0 0 1 24.434907 11.774955 L 24.434907 11.774955 A 11.774955 11.774955 0 0 1 12.659952 23.54991 L 11.774955 23.54991 A 11.774955 11.774955 0 0 1 0 11.774955 L 0 11.774955 A 11.774955 11.774955 0 0 1 11.774955 0 Z" id="path-20"></path>
              </defs>
              <g>
                <use class="fill-path" href="#path-20" fill="url(#shared-fill-21)"></use>
              </g>
            </svg>
          </div>
        </section>
        <!-- BODY_CONTENT_6 -->
        <button class="item" id="b" style="height: 6.83389%; isolation: isolate; left: 60.25%; top: 65.2754%; width: 12.6485%; z-index: 6">
          <div class="key-internal-label" data-button="b">Q</div>
          <div class="item" id="shape-b" style="height: 95.6684%; left: 5.53%; opacity: 1; top: 0%; width: 88.9359%; z-index: 2">
            <svg class="shape shape-style-1" viewBox="0 0 49.646881 48.790900" width="49.646881" height="48.790900" preserveAspectRatio="none">
              <defs>
                <path d="M 24.39545 0 L 25.251431 0 A 24.39545 24.39545 0 0 1 49.646881 24.39545 L 49.646881 24.39545 A 24.39545 24.39545 0 0 1 25.251431 48.7909 L 24.39545 48.7909 A 24.39545 24.39545 0 0 1 0 24.39545 L 0 24.39545 A 24.39545 24.39545 0 0 1 24.39545 0 Z" id="path-22"></path>
              </defs>
              <g>
                <!-- Layer 1: Base Shadow (Static) -->
                <use href="#path-22" filter="url(#shadow-only-base)"></use>
                
                <!-- Group Moving Parts -->
                <g class="btn-moving-part">
                    <!-- Base Fill (Vertical Light) -->
                    <use class="fill-path" href="#path-22" fill="url(#shared-fill-23)" filter="url(#shared-inner-24)"></use>
                    
                    <!-- Active Fill (Diagonal Light) - Fades in -->
                    <use class="active-fill" href="#path-22" fill="url(#shared-fill-23-active)" filter="url(#shared-inner-24)"></use>
                    
                    <!-- Stroke -->
                    <use class="stroke-path" href="#path-22" fill="none" stroke="#2D2D2D" stroke-width="1"></use>
                </g>
              </g>
            </svg>
          </div>
          <p class="item" id="txt-b" style="height: 90.1961%; left: -3.23%; top: 9.80392%; width: 96.734%; z-index: 3">
            <svg viewBox="0 0 54.000000 46.000000" class="shape shape-textbox" preserveAspectRatio="none" data-shape-type="textbox" width="54.000000" height="46.000000">
              <text x="27" text-anchor="middle" font-family="&quot;Roboto&quot;, sans-serif" font-size="30" font-weight="700" fill="#191919">
                <tspan x="27" y="32">B</tspan>
              </text>
            </svg>
          </p>
        </button>
        <button class="item" id="a" style="height: 6.69989%; isolation: isolate; left: 76.7716%; top: 61.5235%; width: 12.6158%; z-index: 7">
          <div class="key-internal-label" data-button="a">W</div>
          <div class="item" id="shape-a" style="height: 97.5818%; left: 10.834%; opacity: 1; top: 0%; width: 89.166%; z-index: 2">
            <svg class="shape shape-style-1" viewBox="0 0 49.646881 48.790900" width="49.646881" height="48.790900" preserveAspectRatio="none">
              <defs>
                <path d="M 24.39545 0 L 25.251431 0 A 24.39545 24.39545 0 0 1 49.646881 24.39545 L 49.646881 24.39545 A 24.39545 24.39545 0 0 1 25.251431 48.7909 L 24.39545 48.7909 A 24.39545 24.39545 0 0 1 0 24.39545 L 0 24.39545 A 24.39545 24.39545 0 0 1 24.39545 0 Z" id="path-25"></path>
              </defs>
              <g>
                <!-- Layer 1: Base Shadow (Static) -->
                <use href="#path-25" filter="url(#shadow-only-base)"></use>
                
                <!-- Group Moving Parts -->
                <g class="btn-moving-part">
                    <!-- Base Fill (Vertical Light) -->
                    <use class="fill-path" href="#path-25" fill="url(#shared-fill-23)" filter="url(#shared-inner-24)"></use>
                    
                    <!-- Active Fill (Diagonal Light) - Fades in -->
                    <use class="active-fill" href="#path-25" fill="url(#shared-fill-23-active)" filter="url(#shared-inner-24)"></use>
                    
                    <!-- Stroke -->
                    <use class="stroke-path" href="#path-25" fill="none" stroke="#2D2D2D" stroke-width="1"></use>
                </g>
              </g>
            </svg>
          </div>
          <p class="item" id="txt-a" style="height: 92%; left: 0%; top: 8%; width: 96.9842%; z-index: 3">
            <svg viewBox="0 0 54.000000 46.000000" class="shape shape-textbox" preserveAspectRatio="none" data-shape-type="textbox" width="54.000000" height="46.000000">
              <text x="27" text-anchor="middle" font-family="&quot;Roboto&quot;, sans-serif" font-size="30" font-weight="700" fill="#191919">
                <tspan x="27" y="32">A</tspan>
              </text>
            </svg>
          </p>
        </button>
<!-- BODY_CONTENT_7 -->
        <section class="item" id="screen" style="height: 46.4158%; isolation: isolate; left: 6.38356%; top: 4.0632%; width: 86.6418%; z-index: 8">
          <div class="item" id="scr-base" style="height: 100%; left: 0.809588%; opacity: 1; top: 0%; width: 99.1904%; z-index: 2">
            <svg class="shape" viewBox="0 0 379.292317 346.392364" preserveAspectRatio="none" width="379.292317" height="346.392364">
              <defs>
                <path d="M 17.256 2 C 139.083 2 241.063 2 362.037 2 C 367.956 2.12 377.011 3.392 377.292 9.306 C 377.292 115.957 377.197 211.754 377.197 320.899 C 376.728 328.938 366.225 332.52 358.319 334.05 C 325.745 340.353 297.048 340.809 263.93 342.817 C 237.309 344.431 214.417 344.392 187.748 344.392 C 162.374 344.392 140.593 344.386 115.267 342.817 C 82.152 340.764 53.452 340.353 20.878 334.05 C 12.972 332.52 2.467 328.938 2 320.899 C 2 211.857 2 117.891 2 9.306 C 2.283 3.392 11.337 2.12 17.256 2 Z" id="path-28"></path>
              </defs>
              <g>
                <use class="fill-path" href="#path-28" fill="url(#shared-fill-26)"></use>
                <use class="stroke-path" href="#path-28" fill="none" stroke="url(#shared-stroke-27)" stroke-width="2"></use>
              </g>
            </svg>
          </div>
          <div class="item" id="screen-main" style="height: 63.7552%; left: 18.793%; opacity: 1; top: 12.933%; width: 63.7976%; z-index: 3">
            <svg class="shape" viewBox="0 0 243.954502 220.843023" width="243.954502" height="220.843023" preserveAspectRatio="none">
              <defs>
                <path d="M0 0h243.95450227732178v220.84302311420709H0z" id="path-29"></path>
              </defs>
              <g>
                <use class="fill-path" href="#path-29" fill="#888888" filter="url(#shared-inner-29)"></use>
                <use class="stroke-path" href="#path-29" fill="none" stroke="url(#shared-stroke-28)" stroke-width="2"></use>
              </g>
            </svg>
          </div>
          <div class="item" id="pwr3" style="height: 3.41801%; left: 12.2912%; opacity: 1; top: 31.1821%; width: 1.53303%; z-index: 5">
            <svg class="shape" viewBox="0 0 5.862112 11.839711" preserveAspectRatio="none" width="5.862112" height="11.839711">
              <g>
                <path class="fill-path" d="M 0.167 0.134 Q 3.349 1.92 3.349 6.02 Q 3.349 9.128 0.837 11.706 Q 5.777 11.238 5.693 5.753 Q 5.612 0.433 0.167 0.134 Z" fill="#6F7880" vector-effect="non-scaling-stroke"></path>
              </g>
            </svg>
          </div>
          <div class="item" id="pwr2" style="height: 3.41801%; left: 10.1991%; opacity: 1; top: 31.1785%; width: 1.53303%; z-index: 6">
            <svg class="shape" viewBox="0 0 5.862112 11.839711" preserveAspectRatio="none" width="5.862112" height="11.839711">
              <g>
                <path class="fill-path" d="M 0.167 0.134 Q 3.349 1.92 3.349 6.02 Q 3.349 9.128 0.837 11.706 Q 5.777 11.238 5.693 5.753 Q 5.612 0.433 0.167 0.134 Z" fill="#6F7880" vector-effect="non-scaling-stroke"></path>
              </g>
            </svg>
          </div>
          <div class="item" id="pwr1" style="height: 3.41801%; left: 8.10695%; opacity: 1; top: 31.1785%; width: 1.53303%; z-index: 7">
            <svg class="shape" viewBox="0 0 5.862112 11.839711" preserveAspectRatio="none" width="5.862112" height="11.839711">
              <g>
                <path class="fill-path" d="M 0.167 0.134 Q 3.349 1.92 3.349 6.02 Q 3.349 9.128 0.837 11.706 Q 5.777 11.238 5.693 5.753 Q 5.612 0.433 0.167 0.134 Z" fill="#6F7880" vector-effect="non-scaling-stroke"></path>
              </g>
            </svg>
          </div>
          <div class="item" id="power-light" style="height: 2.96536%; left: 4.70726%; opacity: 1; top: 31.4672%; width: 2.46236%; z-index: 8">
            <svg class="shape" viewBox="0 0 9.415788 10.271769" width="9.415788" height="10.271769" preserveAspectRatio="none">
              <g>
                <path class="fill-path" d="M 4.707894 0 L 4.707894 0 A 4.707894 4.707894 0 0 1 9.415788 4.707894 L 9.415788 5.563875 A 4.707894 4.707894 0 0 1 4.707894 10.271769 L 4.707894 10.271769 A 4.707894 4.707894 0 0 1 0 5.563875 L 0 4.707894 A 4.707894 4.707894 0 0 1 4.707894 0 Z" fill="url(#shared-fill-30)" vector-effect="non-scaling-stroke"></path>
              </g>
            </svg>
          </div>
          <div class="item" id="scr-glare" style="height: 67.7067%; left: 1.04606%; opacity: 0.05; top: 0.292242%; width: 58.8481%; z-index: 10">
            <svg class="shape" viewBox="0 0 225.028105 234.530944" preserveAspectRatio="none" width="225.028105" height="234.530944" filter="url(#shared-inner-31)">
              <defs>
                <path d="M 222.915 2.197 L 4.738 232.334 Q 2.113 78.644 2.113 27.519 C 2.113 2.527 3.279 2.527 30.107 2.527 Q 78.225 2.527 222.915 2.197 Z" id="path-34"></path>
              </defs>
              <g>
                <use class="fill-path" href="#path-34" fill="#FFFFFF"></use>
                <use class="stroke-path" href="#path-34" fill="none" stroke="#AAAAAA" stroke-width="1"></use>
              </g>
            </svg>
          </div>
          <p class="item" id="text-on-off" style="height: 8.08332%; left: 0%; top: 34.6428%; width: 19.3521%; z-index: 9; pointer-events: none; cursor: default;">
            <svg viewBox="0 0 74.000000 28.000000" class="shape shape-textbox" preserveAspectRatio="none" data-shape-type="textbox" width="74.000000" height="28.000000">
              <text x="37" text-anchor="middle" font-family="&quot;Inter&quot;, sans-serif" font-size="12" font-weight="700" fill="#5C5C5C" letter-spacing="-0.6">
                <tspan x="37" y="17.6">POWER</tspan>
              </text>
            </svg>
          </p>
          <section class="item" id="logo" style="height: 8.74889%; isolation: isolate; left: 21.4895%; top: 83.2359%; width: 56.2827%; z-index: 4;">
            <svg id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 799.24 91.41" style="width: 100%; height: 100%;" preserveAspectRatio="xMinYMid meet">
              <defs>
                <style>
                  .cls-c { fill: #B60030; }
                  .cls-o1 { fill: #483295; }
                  .cls-l { fill: #6DA619; }
                  .cls-o2 { fill: #D9AE00; }
                  .cls-r { fill: #007C6A; }
                  .cls-g { fill: #4D4D4D; }
                </style>
              </defs>
              <g id="Layer_1-2" data-name="Layer 1">
                <path class="cls-o1" d="M617.79,31.92c-11.9-20.23-39.96-21.09-56.24-6.3-10.59,8.95-15.59,23.87-14.1,37.42.63,5.94,3.66,11.38,7.66,15.87,5.75,5.79,18.38,8.35,26.64,8.13,15.41-.32,32.53-8.07,37.69-23.44,2.64-7.72,1.86-16.1.58-24.14-.41-2.54-1.01-5.05-2.13-7.38l-.09-.18ZM584.93,70.02c-24.31-.29-20.06-36.68,3.73-36.07,14.4.42,17.67,20.17,9.83,29.76-2.87,3.88-8.22,6.35-13.34,6.32h-.22Z"/>
                <path class="cls-c" d="M555.59,81.42c.48,7.4-10.22,9.09-16.04,9.7-8.47.65-16.2.28-24.38-1.57-42.17-9.53-29.29-63.07.84-82.54,11.68-8.13,31.24-11.46,39.71,2.74,6.03,9.76-4.38,23.89-14.4,15.93-3.66-3.46-6.01-7.03-11.28-5.04-13.98,5.88-27.31,31.03-20.97,43.18,6.81,10.66,21.67,7.46,33.09,7.28,6.42-.88,12.04,3.96,13.4,10.16l.02.16Z"/>
                <path class="cls-l" d="M617.76,31.55c-.41-3.37-.97-6.87-2.13-10.07-.91-2.61-2.17-5.15-2.24-7.97.18-12.57,13.1-14.47,20.03-5.21,8.89,11.84,3.92,35.37,5.42,50.61.22,1.88.42,4.18,2.18,4.97,1.09.48,2.42.4,3.65.29,3.38-.4,8.78-1.52,12.44-2.04,3.51-.45,5.16-.21,6.45,2.23.66,1.26,1.18,2.75,1.74,4.12,1.4,3.73,4.05,7.47,3.82,10.09-.63,5.75-12.85,4.31-17.24,6.27-7.05,2.07-15.4,6.75-22.14,4.97-8.6-2.04-8.07-12.26-8.36-19.32-.47-6.44-1.38-11.7-1.2-17.81.12-7.04-1.52-14.01-2.4-20.92l-.03-.19Z"/>
                <path class="cls-o2" d="M730.66,31.09c-1.08-1.93-2.64-3.63-4.37-5.05-10.12-8.36-22.04-11.56-34.4-8.03-19.62,4.9-33.16,21.81-30.61,41.76.54,5.01,2.58,10.39,5.21,14.97,2.67,4.74,7.84,7.76,13.04,9.92,12.27,5.02,25.92,2.19,36.93-4.82,7.51-5.06,15.03-11.61,18.22-20.17,1.43-4.6.19-9.86-.61-15-.91-4.5-1.1-9.31-3.32-13.41l-.09-.17ZM715.5,55.97c-5.31,10.55-22.09,15.39-30.84,6.62-6.8-7.4-4.76-18.97,4.16-23.63,12.77-7.54,35.06-.59,26.77,16.82l-.09.19Z"/>
                <path class="cls-r" d="M798,76.13c-5.16-8.26-16.64-14.56-24.44-21.1-1.67-1.37-.12-2.93,1.27-3.9,11.34-8.29,18.98-18.74,17.61-27.98-.89-8.79-11.95-14.93-20.53-17.38-9.7-3.05-18.17-3.5-27.74.79-8.8,3.92-14.75,7.79-13.35,18.45.62,11.35,4.14,22.68,4.53,33.98.19,6.39-2.13,12.4-2.11,18.78,0,2.53.44,5.24,1.92,7.23,4.56,5.88,13.63,5.54,17.36-1.09,1.07-1.55.93-2.4.94-4.94,0-3.31,0-7.02,0-10.26,0-1.88.09-1.68,1.07-.95,4.39,3.27,20.6,15.38,28.61,21.35,1.43,1.12,2.5,1.97,4.45,2.06,7.4.88,14.49-8.11,10.49-14.88l-.09-.16ZM753.78,37.83c-.47-.29-.33-1.32-.35-3.05v-6.41c.01-1.54-.03-2.85.04-3.56.1-.95.72-.86,1.52-.84,5.43.49,21.09.05,16.73,6.9-3.29,4.05-12.86,7.44-17.87,7.01l-.07-.04Z"/>
                <path class="cls-g" d="M213.14,5.29h-21.5l-15.51,40c-2.67.71-2.19-1.91-2.66-3.8-2.77-11.16-3.28-23.92-5.77-35.26-.9-1.33-18.09-1.49-19.6-.48-2.84,1.89-17.86,57.26-21.97,64.53L117.5,5.43c-4.19.38-22.97-1.42-24.86.86l-24.51,62.99c-1.72.19-1.1-3.45-1.03-4.53.38-5.64,1.62-11.77,2.04-17.46h-31.5c-2.03,0-1.77,13.37-2.5,16h14c-1.54,12.05-19.78,8-26.02.52-15.03-17.98,8.41-39.67,26.53-41.51,7.84-.79,15.72.72,23.49.99l1.98-15.96C48.39.42,10.72,9.36,2.2,38.85c-11.59,40.07,24.84,57.55,58.43,45.42,1.17.17-.25,2.72,1.05,3.09,1.48.41,16.48.04,17.47-.56,3.15-1.9,7.45-22.51,9.97-24.03,2.81-1.69,12.65.28,16.44-.54l3.58,25.07c7.45-1.43,24.13,1.95,30.36-.15,2.2-.73,11.17-34.59,13.4-39.6.47-1.05.92-2.56,2.23-1.26,1.48,1.46,5.49,35.93,7.06,40.95l15.28.09,19.66-46.04,3.01,46h17l-4-82ZM105.21,46.58c-2,.79-6.94.54-9.07.7l5.49-15.98c1.44,1.48,4.54,14.9,3.58,15.28Z"/>
                <polygon class="cls-g" points="278.51 3.92 275.51 22.92 246.51 22.92 245.51 35.92 270.51 35.92 267.51 54.92 241.51 54.92 240.51 68.92 268.51 68.92 266.51 86.92 219.51 86.92 232.01 3.92 278.51 3.92"/>
                <path class="cls-g" d="M423.71,17.22c-1.55-4.49-4.39-8.55-5.2-13.3h18.5c2.6,0,10.35,22.98,12,22.98,2.98-2.12,13.49-21.98,15-21.98h19.5c.36,1.54-.62,2.18-1.21,3.29-7.13,13.69-18.81,26.96-26.28,40.72l-5.51,37.99h-19l5.05-40.5-12.85-29.2"/>
                <path class="cls-g" d="M423.1,19.97c-4.27-16.41-28.96-18.22-42.29-12.24-15.65,7.02-20.51,23.54-22.31,39.19-.3,4.67-.8,7.5,0,14,6.36,38.61,54.91,30.79,66.28-1.22,3.9-10.99,4.21-25.92-.28-36.78l-1.4-2.95ZM394.8,68.71c-24.98,9.16-23.77-37.78-5.69-45.69,1.75-.77,5.37-1.8,7.18-1.85,18.96-.5,17.49,40.57-1.49,47.54Z"/>
                <path class="cls-g" d="M349.57,42.55c.09-.5,4.39-4.67,5.43-7.64,2.74-7.82,2.31-17.91-4-23.98-10.93-10.52-33.02-4.32-46.91-6.07-5.21,25.92-7.32,52.49-11.63,78.61-.2,1.17.47,3.11,1.55,3.45h32c3.88,0,13.52-2.9,17.18-4.82,12.25-6.41,15.78-22.22,9.87-34.23-.82-1.67-3.69-4.16-3.49-5.32ZM329.01,68.92h-17.5l2-14.01c5.4.82,16.76-1.74,20.98,1.52,5.57,4.3-.4,12.49-5.48,12.49ZM335.53,33.45c-3.81,5.06-12.44,3.13-18.02,3.47l2.1-13.9c4.22,0,13.62-1.12,16.63,2.16,2.04,2.22.88,6.15-.71,8.27Z"/>
              </g>
            </svg>
          </section>
        </section>
        <div class="item" id="base-raised" style="height: 53.3446%; left: 19.471%; opacity: 0.7; top: 37.0573%; width: 61.2366%; z-index: 4">
          <svg class="shape" viewBox="0 0 270.265909 398.105974" width="270.265909" height="398.105974" preserveAspectRatio="none" filter="url(#shared-inner-8)">
            <defs>
              <path d="M 24 0 L 246.265909 0 A 24 24 0 0 1 270.265909 24 L 270.265909 374.105974 A 24 24 0 0 1 246.265909 398.105974 L 24 398.105974 A 24 24 0 0 1 0 374.105974 L 0 24 A 24 24 0 0 1 24 0 Z" id="path-5"></path>
            </defs>
            <g>
              <use class="fill-path" href="#path-5" fill="url(#shared-fill-7)"></use>
              <use class="stroke-path" href="#path-5" fill="none" stroke="#25003A" stroke-width="2"></use>
            </g>
          </svg>
        </div>
        <div class="item" id="speaker-grill" style="height: 14.3758%; left: 70.6927%; top: 81.2395%; width: 21.8526%; z-index: 7">
          <svg class="shape" viewBox="0 0 95.51 109.93" preserveAspectRatio="none">
            <g>
              <circle class="grill-dot grill-dot--purple" cx="29.78" cy="14.37" r="4"/>
              <circle class="grill-dot" cx="29.78" cy="27.11" r="4"/>
              <circle class="grill-dot grill-dot--purple" cx="29.78" cy="39.85" r="4"/>
              <circle class="grill-dot" cx="29.78" cy="52.59" r="4"/>
              <circle class="grill-dot grill-dot--purple" cx="29.78" cy="65.33" r="4"/>
              <circle class="grill-dot" cx="29.78" cy="78.07" r="4"/>
              <circle class="grill-dot grill-dot--purple" cx="29.78" cy="90.81" r="4"/>
              <circle class="grill-dot" cx="29.78" cy="103.56" r="4"/>
              <circle class="grill-dot" cx="41.66" cy="12.01" r="4.01"/>
              <circle class="grill-dot grill-dot--purple" cx="41.75" cy="24.92" r="4"/>
              <circle class="grill-dot" cx="41.75" cy="37.66" r="4"/>
              <circle class="grill-dot grill-dot--purple" cx="41.75" cy="50.4" r="4"/>
              <circle class="grill-dot" cx="41.75" cy="63.14" r="4"/>
              <circle class="grill-dot grill-dot--purple" cx="41.75" cy="75.88" r="4"/>
              <circle class="grill-dot" cx="41.75" cy="88.62" r="4"/>
              <circle class="grill-dot grill-dot--purple" cx="41.75" cy="101.36" r="4"/>
              <circle class="grill-dot grill-dot--purple" cx="79.38" cy="4" r="4"/>
              <circle class="grill-dot" cx="79.43" cy="16.6" r="4.01"/>
              <circle class="grill-dot grill-dot--purple" cx="79.38" cy="29.48" r="4"/>
              <circle class="grill-dot" cx="79.43" cy="42.17" r="4.01"/>
              <circle class="grill-dot grill-dot--purple" cx="79.38" cy="54.96" r="4"/>
              <circle class="grill-dot" cx="79.38" cy="67.7" r="4"/>
              <circle class="grill-dot grill-dot--purple" cx="79.38" cy="80.44" r="4"/>
              <circle class="grill-dot" cx="79.38" cy="93.19" r="4"/>
              <circle class="grill-dot" cx="17.81" cy="16.74" r="4"/>
              <circle class="grill-dot grill-dot--purple" cx="17.81" cy="29.48" r="4"/>
              <circle class="grill-dot" cx="17.81" cy="42.22" r="4"/>
              <circle class="grill-dot grill-dot--purple" cx="17.81" cy="54.96" r="4"/>
              <circle class="grill-dot" cx="17.81" cy="67.7" r="4"/>
              <circle class="grill-dot grill-dot--purple" cx="17.81" cy="80.44" r="4"/>
              <circle class="grill-dot" cx="17.81" cy="93.19" r="4"/>
              <circle class="grill-dot grill-dot--purple" cx="17.81" cy="105.93" r="4"/>
              <circle class="grill-dot" cx="4" cy="31.11" r="4"/>
              <circle class="grill-dot grill-dot--purple" cx="4" cy="43.85" r="4"/>
              <circle class="grill-dot" cx="4" cy="56.59" r="4"/>
              <circle class="grill-dot grill-dot--purple" cx="4" cy="69.33" r="4"/>
              <circle class="grill-dot" cx="4" cy="82.07" r="4"/>
              <circle class="grill-dot grill-dot--purple" cx="4" cy="94.81" r="4"/>
              <circle class="grill-dot grill-dot--purple" cx="91.41" cy="14.55" r="4"/>
              <circle class="grill-dot" cx="91.5" cy="27.18" r="4.01"/>
              <circle class="grill-dot grill-dot--purple" cx="91.41" cy="40.03" r="4"/>
              <circle class="grill-dot" cx="91.5" cy="52.75" r="4.01"/>
              <circle class="grill-dot grill-dot--purple" cx="91.41" cy="65.51" r="4"/>
              <circle class="grill-dot" cx="91.41" cy="78.25" r="4"/>
              <circle class="grill-dot grill-dot--purple" cx="53.96" cy="10.73" r="4"/>
              <circle class="grill-dot" cx="53.92" cy="23.35" r="4.01"/>
              <circle class="grill-dot grill-dot--purple" cx="53.96" cy="36.21" r="4"/>
              <circle class="grill-dot" cx="53.96" cy="48.96" r="4"/>
              <circle class="grill-dot grill-dot--purple" cx="53.96" cy="61.7" r="4"/>
              <circle class="grill-dot" cx="53.96" cy="74.44" r="4"/>
              <circle class="grill-dot grill-dot--purple" cx="53.96" cy="87.18" r="4"/>
              <circle class="grill-dot" cx="53.96" cy="99.92" r="4"/>
              <circle class="grill-dot" cx="66" cy="8" r="4"/>
              <circle class="grill-dot grill-dot--purple" cx="66" cy="20.74" r="4"/>
              <circle class="grill-dot" cx="66" cy="33.4" r="4.01"/>
              <circle class="grill-dot grill-dot--purple" cx="66" cy="46.22" r="4"/>
              <circle class="grill-dot" cx="66" cy="58.96" r="4"/>
              <circle class="grill-dot grill-dot--purple" cx="66" cy="71.7" r="4"/>
              <circle class="grill-dot" cx="66" cy="84.44" r="4"/>
              <circle class="grill-dot grill-dot--purple" cx="66" cy="97.19" r="4"/>
            </g>
          </svg>
        </div>
        <!-- BODY_CONTENT_3 -->
        <div class="item" id="comm-arrow" style="height: 1.51422%; left: 20.1%; opacity: 1; top: 1.38996%; width: 3.14314%; z-index: 9">
          <svg class="shape" viewBox="0 0 13.872149 11.300532" preserveAspectRatio="none" width="13.872149" height="11.300532">
            <g>
              <path class="fill-path" d="M -2.774 14.691 L 13.872 14.691 L 5.549 1.13 L -2.774 14.691 Z" fill="#8F13E8" vector-effect="non-scaling-stroke"></path>
            </g>
          </svg>
        </div>
        <p class="item" id="text-phones" style="height: 4.15387%; left: 20.453%; top: 0.53983%; width: 17.8998%; z-index: 10">
          <svg viewBox="0 0 79.000000 31.000000" class="shape shape-textbox" preserveAspectRatio="none" data-shape-type="textbox" width="79.000000" height="31.000000">
            <text x="39.5" text-anchor="middle" font-family="&quot;Inter&quot;, sans-serif" font-size="15" font-weight="400" fill="#9611F5" letter-spacing="-1">
              <tspan x="39.5" y="20">COMM</tspan>
            </text>
          </svg>
        </p>
        <p class="item" id="txt-select" style="height: 4.15387%; left: 34.2135%; top: 85.6234%; width: 19.7124%; z-index: 11">
          <svg viewBox="0 0 87.000000 31.000000" class="shape shape-textbox" preserveAspectRatio="none" data-shape-type="textbox" width="87.000000" height="31.000000">
            <defs></defs>
            <text x="43.5" text-anchor="middle" font-family="&quot;Inter&quot;, sans-serif" font-size="15" font-weight="400" fill="#7100C1" letter-spacing="-0.5">
              <tspan x="43.5" y="20">SELECT</tspan>
            </text>
          </svg>
        </p>
        <p class="item" id="txt-start" style="height: 4.15387%; left: 48.0348%; top: 85.6234%; width: 17.6732%; z-index: 12">
          <svg viewBox="0 0 78.000000 31.000000" class="shape shape-textbox" preserveAspectRatio="none" data-shape-type="textbox" width="78.000000" height="31.000000">
            <defs></defs>
            <text x="39" text-anchor="middle" font-family="&quot;Inter&quot;, sans-serif" font-size="15" font-weight="400" fill="#7100C1" letter-spacing="-0.5">
              <tspan x="39" y="20">START</tspan>
            </text>
          </svg>
        </p>
        <div class="key-internal-label" style="top: 91%; left: 50%; width: auto; height: 28px; padding: 0 8px; pointer-events: none; cursor: default; transform: translate(-50%, -50%); white-space: nowrap; font-size: 11px;">TAB · MENU / GAME</div>
        <div class="item" id="start-select-inset" style="height: 3.84287%; left: 38.2179%; top: 82.159%; width: 24.6005%; z-index: 6">
          <svg class="shape" viewBox="0 0 108.573605 28.679010" preserveAspectRatio="none" width="108.573605" height="28.679010">
            <g>
              <path class="fill-path" d="M 74.225 2.384 Q 82.54 1.2 90.381 2.384 C 95.176 3.108 106.536 6.363 106.536 14.321 C 106.536 22.28 95.134 25.249 90.381 26.259 Q 84.42 27.525 74.225 26.259 Q 58.07 23.274 58.07 14.321 Q 58.07 5.368 74.225 2.384 Z M 18.193 2.384 Q 26.508 1.2 34.348 2.384 C 39.144 3.108 50.504 6.363 50.504 14.321 C 50.504 22.28 39.102 25.249 34.348 26.259 Q 28.388 27.525 18.193 26.259 Q 2.038 23.274 2.038 14.321 Q 2.038 5.368 18.193 2.384 Z" fill="url(#shared-fill-15)" vector-effect="non-scaling-stroke" filter="url(#shared-inner-16)"></path>
            </g>
          </svg>
        </div>
    </div>

`;

export class ExportedContent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    const template = document.createElement('template');
    template.innerHTML = `<style>${componentCSS}</style>${componentHTML}`;
    shadow.appendChild(template.content.cloneNode(true));
  }
}

if (!customElements.get(componentTagName)) {
  customElements.define(componentTagName, ExportedContent);
}
