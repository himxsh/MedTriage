const fontFallbacks = {};
try { await figma.loadFontAsync({ family: "Bebas Neue", style: "Regular" }); } catch (e) { fontFallbacks["Bebas Neue"] = true; }
try { await figma.loadFontAsync({ family: "IBM Plex Mono", style: "Regular" }); } catch (e) { fontFallbacks["IBM Plex Mono"] = true; }
try { await figma.loadFontAsync({ family: "IBM Plex Mono", style: "Bold" }); } catch (e) { fontFallbacks["IBM Plex Mono Bold"] = true; }

const brandFont = fontFallbacks["Bebas Neue"] ? { family: "Arial", style: "Regular" } : { family: "Bebas Neue", style: "Regular" };
const monoFont = fontFallbacks["IBM Plex Mono"] ? { family: "Arial", style: "Regular" } : { family: "IBM Plex Mono", style: "Regular" };
const monoBold = fontFallbacks["IBM Plex Mono Bold"] ? { family: "Arial", style: "Bold" } : { family: "IBM Plex Mono", style: "Bold" };

const wrapper = await figma.getNodeByIdAsync("3:46");
if (!wrapper) throw new Error("wrapper not found");

const inkFill = [{ type: "SOLID", color: { r: 30 / 255, g: 90 / 255, b: 139 / 255, a: 1 } }];
const halfOpacity = [{ type: "SOLID", color: { r: 0, g: 0, b: 0, a: 0.5 } }];

function mkText(char, overrides) {
  const t = figma.createText();
  t.fontName = (overrides && overrides.fontName) || monoFont;
  t.fontSize = (overrides && overrides.fontSize) || 10;
  t.fills = (overrides && overrides.fills) || [{ type: "SOLID", color: { r: 0, g: 0, b: 0, a: 1 } }];
  t.letterSpacing = (overrides && overrides.letterSpacing) || { value: 1, unit: "PIXELS" };
  t.characters = char;
  return t;
}

const footer = figma.createFrame();
footer.name = "Footer";
footer.layoutMode = "VERTICAL";
footer.primaryAxisAlignItems = "MIN";
footer.counterAxisAlignItems = "MIN";
footer.paddingTop = 64; footer.paddingBottom = 64;
footer.paddingLeft = 64; footer.paddingRight = 64;
footer.itemSpacing = 32;
footer.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1, a: 1 } }];

const contentRow = figma.createFrame();
contentRow.name = "Footer Content";
contentRow.layoutMode = "HORIZONTAL";
contentRow.primaryAxisAlignItems = "SPACE_BETWEEN";
contentRow.counterAxisAlignItems = "START";
contentRow.fills = [];

const brandCol = figma.createFrame();
brandCol.name = "Footer Brand";
brandCol.layoutMode = "VERTICAL";
brandCol.primaryAxisAlignItems = "MIN";
brandCol.counterAxisAlignItems = "MIN";
brandCol.itemSpacing = 16;
brandCol.fills = [];
brandCol.resize(400, 100);

const brandTitle = figma.createText();
brandTitle.fontName = brandFont;
brandTitle.characters = "MEDTRIAGE INTELLIGENCE CORP";
brandTitle.fontSize = 24;
brandTitle.letterSpacing = { value: 2, unit: "PIXELS" };
brandTitle.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0, a: 1 } }];
brandCol.appendChild(brandTitle);
brandTitle.layoutSizingHorizontal = "HUG";
brandTitle.layoutSizingVertical = "HUG";

const brandBlurb = mkText("The leading edge in clinical triage automation. Providing rapid deployment nodes for acute care centers globally.", { fills: halfOpacity, fontSize: 10 });
brandCol.appendChild(brandBlurb);
brandBlurb.layoutSizingHorizontal = "FILL";
brandBlurb.layoutSizingVertical = "HUG";

contentRow.appendChild(brandCol);
brandCol.layoutSizingHorizontal = "FIXED";
brandCol.layoutSizingVertical = "HUG";

const linkCols = [
  { header: "RESOURCES", items: ["API DOCS", "WHITE PAPER", "SECURITY SHA"] },
  { header: "PLATFORM", items: ["AUDIT LOGS", "SYSTEM STATUS", "NETWORK NODES"] },
  { header: "LEGAL", items: ["PRIVACY MD", "COMPLIANCE JSON"] },
];

const linksRow = figma.createFrame();
linksRow.name = "Footer Links";
linksRow.layoutMode = "HORIZONTAL";
linksRow.primaryAxisAlignItems = "MIN";
linksRow.counterAxisAlignItems = "START";
linksRow.itemSpacing = 64;
linksRow.fills = [];

for (const col of linkCols) {
  const colFrame = figma.createFrame();
  colFrame.name = `Col ${col.header}`;
  colFrame.layoutMode = "VERTICAL";
  colFrame.primaryAxisAlignItems = "MIN";
  colFrame.counterAxisAlignItems = "MIN";
  colFrame.itemSpacing = 16;
  colFrame.fills = [];

  const h = mkText(col.header, { fontName: monoBold, fontSize: 14, fills: inkFill });
  colFrame.appendChild(h);
  h.layoutSizingHorizontal = "HUG";
  h.layoutSizingVertical = "HUG";

  for (const item of col.items) {
    const li = mkText(item, { fills: halfOpacity, fontSize: 10 });
    colFrame.appendChild(li);
    li.layoutSizingHorizontal = "HUG";
    li.layoutSizingVertical = "HUG";
  }

  linksRow.appendChild(colFrame);
  colFrame.layoutSizingHorizontal = "HUG";
  colFrame.layoutSizingVertical = "HUG";
}
contentRow.appendChild(linksRow);
linksRow.layoutSizingHorizontal = "HUG";
linksRow.layoutSizingVertical = "HUG";

footer.appendChild(contentRow);
contentRow.layoutSizingHorizontal = "FILL";
contentRow.layoutSizingVertical = "HUG";

const divider = figma.createRectangle();
divider.name = "Footer Divider";
divider.resize(100, 1);
divider.fills = [{ type: "SOLID", color: { r: 0.898, g: 0.898, b: 0.898, a: 1 } }];
footer.appendChild(divider);
divider.layoutSizingHorizontal = "FILL";
divider.layoutSizingVertical = "FIXED";

const bottomRow = figma.createFrame();
bottomRow.name = "Footer Bottom";
bottomRow.layoutMode = "HORIZONTAL";
bottomRow.primaryAxisAlignItems = "SPACE_BETWEEN";
bottomRow.counterAxisAlignItems = "CENTER";
bottomRow.fills = [];

const lowOp = [{ type: "SOLID", color: { r: 0, g: 0, b: 0, a: 0.3 } }];
const left = mkText("BUILT FOR PRECISION / 2024", { fontSize: 8, letterSpacing: { value: 3, unit: "PIXELS" }, fills: lowOp });
const right = mkText("SECURE SESSION ACTIVE", { fontSize: 8, letterSpacing: { value: 3, unit: "PIXELS" }, fills: lowOp });
bottomRow.appendChild(left);
left.layoutSizingHorizontal = "HUG";
left.layoutSizingVertical = "HUG";
bottomRow.appendChild(right);
right.layoutSizingHorizontal = "HUG";
right.layoutSizingVertical = "HUG";

footer.appendChild(bottomRow);
bottomRow.layoutSizingHorizontal = "FILL";
bottomRow.layoutSizingVertical = "HUG";

wrapper.appendChild(footer);
footer.layoutSizingHorizontal = "FILL";
footer.layoutSizingVertical = "HUG";

return { success: true, footerId: footer.id, fontFallbacks };
