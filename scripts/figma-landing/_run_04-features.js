const fontFallbacks = {};
try { await figma.loadFontAsync({ family: "Bebas Neue", style: "Regular" }); } catch (e) { fontFallbacks["Bebas Neue"] = true; }
try { await figma.loadFontAsync({ family: "IBM Plex Mono", style: "Regular" }); } catch (e) { fontFallbacks["IBM Plex Mono"] = true; }

const featFont = fontFallbacks["Bebas Neue"] ? { family: "Arial", style: "Regular" } : { family: "Bebas Neue", style: "Regular" };
const bodyFont = fontFallbacks["IBM Plex Mono"] ? { family: "Arial", style: "Regular" } : { family: "IBM Plex Mono", style: "Regular" };

const wrapper = await figma.getNodeByIdAsync("3:46");
const cardComp = await figma.getNodeByIdAsync("3:40");
if (!wrapper) throw new Error("wrapper not found");
if (!cardComp || cardComp.type !== "COMPONENT") throw new Error("feature card component not found");

const shieldSvg = `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" stroke="#4A90D9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="m9 12 2 2 4-4" stroke="#4A90D9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const stethSvg = `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 2v2" stroke="#000000" stroke-width="2" stroke-linecap="round"/><path d="M5 2v2" stroke="#000000" stroke-width="2" stroke-linecap="round"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 15a6 6 0 0 0 12 0v-3" stroke="#000000" stroke-width="2" stroke-linecap="round"/><circle cx="20" cy="10" r="2" stroke="#000000" stroke-width="2"/></svg>`;
const clipSvg = `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="#4A90D9" stroke-width="2"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="#4A90D9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 11h4" stroke="#4A90D9" stroke-width="2" stroke-linecap="round"/><path d="M12 16h4" stroke="#4A90D9" stroke-width="2" stroke-linecap="round"/><path d="M8 11h.01" stroke="#4A90D9" stroke-width="2" stroke-linecap="round"/><path d="M8 16h.01" stroke="#4A90D9" stroke-width="2" stroke-linecap="round"/></svg>`;

const cards = [
  { icon: shieldSvg, title: "DE-ID GENERATOR", body: "Automated PHI scrubbing with zero-latency overhead. Built for high-volume clinical streams.", white: true, stroke: true },
  { icon: stethSvg, title: "CLINICAL NER", body: "UMLS-mapped entity extraction. Identify diagnosis, medications, and symptoms in real-time.", white: false, stroke: true },
  { icon: clipSvg, title: "TRIAGE CORE", body: "Dynamic prioritization engine with human-in-the-loop validation flow.", white: true, stroke: false },
];

function mkInstance(svgStr, title, body, opts) {
  const inst = cardComp.createInstance();
  if (!opts.white) inst.fills = [];

  const children = [...inst.children];
  for (const child of children) {
    if (child.name === "Icon Placeholder") {
      const idx = inst.children.indexOf(child);
      const icon = figma.createNodeFromSvg(svgStr);
      icon.name = "Icon";
      child.remove();
      inst.insertChild(idx, icon);
      icon.layoutSizingHorizontal = "FIXED";
      icon.layoutSizingVertical = "FIXED";
    } else if (child.name === "Title" && child.type === "TEXT") {
      child.fontName = featFont;
      child.characters = title;
    } else if (child.name === "Body" && child.type === "TEXT") {
      child.fontName = bodyFont;
      child.characters = body;
    }
  }

  if (opts.stroke) {
    inst.strokes = [{ type: "SOLID", color: { r: 0.898, g: 0.898, b: 0.898, a: 1 } }];
    inst.strokeWeight = 0;
    inst.strokeRightWeight = 1;
  }
  return inst;
}

const section = figma.createFrame();
section.name = "Features";
section.layoutMode = "VERTICAL";
section.counterAxisAlignItems = "MIN";
section.fills = [{ type: "SOLID", color: { r: 0.949, g: 0.949, b: 0.949, a: 1 } }];
section.strokes = [{ type: "SOLID", color: { r: 0.898, g: 0.898, b: 0.898, a: 1 } }];
section.strokeWeight = 0;
section.strokeTopWeight = 1;

const row = figma.createFrame();
row.name = "Features Row";
row.layoutMode = "HORIZONTAL";
row.counterAxisAlignItems = "MIN";
row.fills = [];
section.appendChild(row);
row.layoutSizingHorizontal = "FILL";
row.layoutSizingVertical = "HUG";

const instanceIds = [];
for (const c of cards) {
  const inst = mkInstance(c.icon, c.title, c.body, { white: c.white, stroke: c.stroke });
  row.appendChild(inst);
  inst.layoutSizingHorizontal = "FILL";
  inst.layoutSizingVertical = "HUG";
  instanceIds.push(inst.id);
}

wrapper.appendChild(section);
section.layoutSizingHorizontal = "FILL";
section.layoutSizingVertical = "HUG";

return {
  success: true,
  createdNodeIds: { featuresSectionId: section.id, featuresRowId: row.id },
  instanceIds,
  fontFallbacks,
};
