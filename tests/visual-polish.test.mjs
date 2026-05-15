import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'dist', 'tesla-style-energy-flow.js'), 'utf8');
const gzipSource = zlib.gunzipSync(
  fs.readFileSync(path.join(root, 'dist', 'tesla-style-energy-flow.js.gz'))
).toString('utf8');

assert.match(
  source,
  /const sceneScale = clamp\(safeNum\(cfg\.scene_scale, 1\), 0\.6, 1\.4\);/,
  'scene_scale should default to 1.0 to avoid clipping the SVG in Safari'
);

assert.doesNotMatch(
  source,
  /<svg viewBox="0 0 600 460" style="transform: scale/,
  'the SVG should not be scaled with CSS transform because ha-card clips the result'
);

assert.match(
  source,
  /'battery-label': Object\.freeze\(\{ x: -30, y: 82 \}\)/,
  'day clear idle battery label should sit high enough to stay inside the card'
);

assert.match(
  source,
  /'solar-label': Object\.freeze\(\{ x: -20, y: -94 \}\),\s*'solar-power': Object\.freeze\(\{ x: -20, y: -72 \}\),\s*'solar-guide': Object\.freeze\(\{ x1: -20, y1: -56, x2: -20, y2: 16 \}\)/,
  'day clear idle solar label, power and guide should sit closer to the PV modules'
);

assert.match(
  source,
  /'grid-label': Object\.freeze\(\{ x: 4, y: -14 \}\),\s*'grid-power': Object\.freeze\(\{ x: 4, y: 8 \}\),\s*'grid-guide': Object\.freeze\(\{ x1: 4, y1: 26, x2: 4, y2: 64 \}\)/,
  'day clear idle grid label and power should sit above the grid guide line'
);

assert.match(
  source,
  /'load-label': Object\.freeze\(\{ x: -32, y: -64 \}\),\s*'load-power': Object\.freeze\(\{ x: -32, y: -42 \}\),\s*'load-guide': Object\.freeze\(\{ x1: -32, y1: -6, x2: -32, y2: 68 \}\)/,
  'day clear idle house label and power should move up while the guide line reaches farther upward'
);

assert.match(
  source,
  /<text class="flow-arrow" id="flow-battery-arrow" x="0" y="97" text-anchor="middle"><\/text>/,
  'battery charge direction should use a separate green arrow between power and percent'
);

assert.match(
  source,
  /<text class="flow-pct" id="flow-battery-pct" x="8" y="97" text-anchor="start">--%<\/text>/,
  'battery percent should start close to the compact static value row'
);

assert.match(
  source,
  /const BATTERY_VALUE_ROW = Object\.freeze\(\{\s*arrowOffsetX: 8,\s*percentOffsetX: 16\s*\}\);/,
  'battery value row spacing should keep power, arrow and percent visually grouped'
);

assert.match(
  source,
  /_alignBatteryValueRow\(\) \{/,
  'battery value row should be realigned after scene profiles so old pct coordinates cannot break the layout'
);

assert.match(
  source,
  /_setSvgAttrs\('#flow-battery-arrow', \{ x: powerX \+ BATTERY_VALUE_ROW\.arrowOffsetX, y: powerY \}\);[\s\S]*_setSvgAttrs\('#flow-battery-pct', \{ x: powerX \+ BATTERY_VALUE_ROW\.percentOffsetX, y: powerY \}\);/,
  'battery arrow and percent should stay locked to the battery power baseline'
);

assert.match(
  source,
  /_alignLabelPowerColumns\(\) \{/,
  'labels should be realigned after scene profiles so headings stay centered over their power values'
);

assert.match(
  source,
  /const GUIDE_ALIGNED_TEXT_PAIRS = Object\.freeze\(\[[\s\S]*\['#flow-solar-label', '#flow-solar-power', '#flow-solar-guide'\],[\s\S]*\['#flow-grid-label', '#flow-grid-power', '#flow-grid-guide'\],[\s\S]*\['#flow-load-label', '#flow-load-power', '#flow-load-guide'\],[\s\S]*\['#flow-ev-label', '#flow-ev-power', '#flow-ev-guide'\],[\s\S]*\['#flow-ev2-label', '#flow-ev2-power', '#flow-ev2-guide'\][\s\S]*\]\);/,
  'middle-anchored headings and values should share the same x coordinate as their guide lines'
);

assert.match(
  source,
  /const GUIDE_TEXT_CLEARANCE = Object\.freeze\(\{\s*base: 8,\s*scaleExtra: 6\s*\}\);/,
  'guide line spacing should grow when font_scale grows'
);

assert.match(
  source,
  /const VIEWBOX_TEXT_FIT = Object\.freeze\(\{\s*margin: 18,\s*labelPowerGap: 22\s*\}\);/,
  'scene_scale should have a viewbox text safety margin'
);

assert.match(
  source,
  /'scene_night_clear_idle\.png': Object\.freeze\(\{[\s\S]*'grid-label': Object\.freeze\(\{ x: 18, y: -14 \}\),\s*'grid-power': Object\.freeze\(\{ x: 18, y: 8 \}\),\s*'grid-guide': Object\.freeze\(\{ x1: 18, y1: 30, x2: 18, y2: 60 \}\)/,
  'night clear idle grid label and power should sit above the grid guide line'
);

assert.match(
  source,
  /_sceneViewBox\(\) \{[\s\S]*const sceneScale = clamp\(safeNum\(this\._config\.scene_scale, 1\), 0\.6, 1\.4\);[\s\S]*minY: 230 - \(230 \/ sceneScale\),[\s\S]*maxY: 230 \+ \(230 \/ sceneScale\)/,
  'scene_scale should expose the visible SVG viewbox for text fitting'
);

assert.match(
  source,
  /_fitTextBlocksToViewBox\(\) \{[\s\S]*const viewBox = this\._sceneViewBox\(\);[\s\S]*this\._fitGuideTextPairToViewBox\(label, power, guide, viewBox\)[\s\S]*this\._fitBatteryBlockToViewBox\(viewBox\)/,
  'labels and battery values should be fitted back into the scaled scene viewbox'
);

assert.match(
  source,
  /_fitBatteryBlockToViewBox\(viewBox\) \{[\s\S]*'#flow-battery-label'[\s\S]*'#flow-battery-power'[\s\S]*'#flow-battery-guide'[\s\S]*this\._shiftGuideY\(guide, delta\)/,
  'battery guide line should move with battery label and kW when scene_scale reduces the visible viewbox'
);

assert.match(
  source,
  /_alignGuideTextClearance\(\) \{[\s\S]*const gap = this\._guideTextGap\(\);[\s\S]*const textTop = Math\.min\(labelY, powerY\);[\s\S]*const textBottom = Math\.max\(labelY, powerY\);[\s\S]*this\._moveGuideEndpoint\(guide, nearAttr, nextNear\)/,
  'guide line endpoints should keep a font-scale-aware clearance from nearby labels and values'
);

assert.match(
  source,
  /const GUIDE_CLEARANCE_TEXT_PAIRS = Object\.freeze\(\[[\s\S]*\['#flow-battery-label', '#flow-battery-power', '#flow-battery-guide'\][\s\S]*\]\);/,
  'battery guide line should use the same text clearance guard as solar, grid and house labels'
);

assert.match(
  source,
  /const EDITOR_UPDATE_DEBOUNCE_MS = 500;/,
  'visual editor text and number controls should debounce Home Assistant config updates'
);

assert.match(
  source,
  /_queueEditorUpdate\(path, value\) \{[\s\S]*this\._applyEditorValue\(path, value\);[\s\S]*setTimeout\(\(\) => \{[\s\S]*this\._emitConfig\(\);[\s\S]*EDITOR_UPDATE_DEBOUNCE_MS[\s\S]*\}/,
  'visual editor should update local input state immediately but emit config changes after a short pause'
);

assert.match(
  source,
  /set hass\(hass\) \{[\s\S]*this\._hass = hass;[\s\S]*if \(this\._isEditorBusy\(\)\) return;[\s\S]*this\._render\(\);[\s\S]*\}/,
  'visual editor should not rerender focused inputs on every Home Assistant state refresh'
);

assert.match(
  source,
  /const POSITION_EDITOR_SCENES = Object\.freeze\(/,
  'visual editor should expose known scene profiles in a position editor'
);

assert.match(
  source,
  /const POSITION_EDITOR_GROUPS = Object\.freeze\(\[[\s\S]*title: 'Solar'[\s\S]*title: 'Netz'[\s\S]*title: 'Haus'[\s\S]*title: 'Batterie'[\s\S]*\]\);/,
  'visual editor should provide per-component controls for label, value and guide positions'
);

assert.match(
  source,
  /data-position-scene/,
  'visual editor should render a scene selector for position tuning'
);

assert.match(
  source,
  /_updateSceneComponentPosition\(sceneKey, componentKey, attr, value, emit = true\) \{[\s\S]*const nextMap = \{ \.\.\.\(this\._config\.scene_component_map \|\| \{\}\) \};[\s\S]*nextMap\[sceneKey\] = scene;[\s\S]*this\._applyEditorValue\('scene_component_map', nextMap\);/,
  'scene position updates should preserve scene filenames with dots instead of using dotted config paths'
);

assert.doesNotMatch(
  source,
  /\.flow-node\.inactive \.flow-node-guide\s*\{\s*opacity: 0;\s*\}/,
  'node guide lines should remain visible even when a value is below the flow threshold'
);

assert.match(
  source,
  /morning_clear_idle: '',[\s\S]*afternoon_clear_idle: '',[\s\S]*evening_clear_idle: '',[\s\S]*night_clear_idle: '',/,
  'background_map should expose time-of-day keys for cleaner morning, afternoon, evening and night assets'
);

assert.match(
  source,
  /_sceneTimeSlot\(period\) \{/,
  'the card should derive a time-of-day slot for background lookup and tone overlays'
);

assert.match(
  source,
  /data-scene-tone="afternoon"/,
  'the static render should default to a readable afternoon tone until live state is available'
);

assert.match(
  source,
  /<rect class="flow-sky-dim" x="0" y="0" width="600" height="260"><\/rect>/,
  'the SVG should include a sky dimming layer so text remains readable on bright backgrounds'
);

assert.equal(
  gzipSource,
  source,
  'the gzip artifact should contain the same updated JavaScript that Home Assistant may serve'
);
