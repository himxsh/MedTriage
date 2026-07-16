const fontFallbacks = {};
try { await figma.loadFontAsync({ family: "IBM Plex Mono", style: "Bold" }); } catch (e) { fontFallbacks["IBM Plex Mono Bold"] = true; }

const navFont = fontFallbacks["IBM Plex Mono Bold"] ? { family: "Arial", style: "Bold" } : { family: "IBM Plex Mono", style: "Bold" };

const wrapper = await figma.getNodeByIdAsync("REPLACE_WRAPPER_ID");
if (!wrapper) throw new Error("wrapper not found");

const header = figma.createFrame();
header.name = "Header";
header.layoutMode = "HORIZONTAL";
header.primaryAxisAlignItems = "SPACE_BETWEEN";
header.counterAxisAlignItems = "CENTER";
header.paddingTop = 24; header.paddingBottom = 24;
header.paddingLeft = 40; header.paddingRight = 40;
header.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1, a: 1 } }];
header.strokes = [{ type: "SOLID", color: { r: 0.898, g: 0.898, b: 0.898, a: 1 } }];
header.strokeWeight = 0;
header.strokeBottomWeight = 1;

const leftGroup = figma.createFrame();
leftGroup.name = "Header Left";
leftGroup.layoutMode = "HORIZONTAL";
leftGroup.primaryAxisAlignItems = "MIN";
leftGroup.counterAxisAlignItems = "CENTER";
leftGroup.itemSpacing = 16;
leftGroup.fills = [];

const gridSvg = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="7" height="7" rx="1" stroke="#4A90D9" stroke-width="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="#4A90D9" stroke-width="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="#4A90D9" stroke-width="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="#4A90D9" stroke-width="2"/></svg>`;
const iconNode = figma.createNodeFromSvg(gridSvg);
iconNode.name = "Logo Icon";
leftGroup.appendChild(iconNode);
iconNode.layoutSizingHorizontal = "FIXED";
iconNode.layoutSizingVertical = "FIXED";

const brand = figma.createText();
brand.name = "Brand";
brand.fontName = navFont;
brand.characters = "MEDTRIAGE";
brand.fontSize = 24;
brand.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0, a: 1 } }];
brand.letterSpacing = { value: 1, unit: "PIXELS" };
leftGroup.appendChild(brand);
brand.layoutSizingHorizontal = "HUG";
brand.layoutSizingVertical = "HUG";

header.appendChild(leftGroup);
leftGroup.layoutSizingHorizontal = "HUG";
leftGroup.layoutSizingVertical = "HUG";

const rightGroup = figma.createFrame();
rightGroup.name = "Header Right";
rightGroup.layoutMode = "HORIZONTAL";
rightGroup.primaryAxisAlignItems = "MIN";
rightGroup.counterAxisAlignItems = "CENTER";
rightGroup.itemSpacing = 40;
rightGroup.fills = [];

["Docs", "LOGIN"].forEach((label) => {
  const t = figma.createText();
  t.name = label;
  t.fontName = navFont;
  t.characters = label;
  t.fontSize = 14;
  t.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0, a: 1 } }];
  t.letterSpacing = { value: 1, unit: "PIXELS" };
  rightGroup.appendChild(t);
  t.layoutSizingHorizontal = "HUG";
  t.layoutSizingVertical = "HUG";
});

header.appendChild(rightGroup);
rightGroup.layoutSizingHorizontal = "HUG";
rightGroup.layoutSizingVertical = "HUG";

wrapper.appendChild(header);
header.layoutSizingHorizontal = "FILL";
header.layoutSizingVertical = "HUG";

return { success: true, createdNodeIds: { headerId: header.id, iconNodeId: iconNode.id, brandTextId: brand.id } };
