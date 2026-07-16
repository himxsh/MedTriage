const fontFallbacks = {};
try { await figma.loadFontAsync({ family: "Bebas Neue", style: "Regular" }); } catch (e) { fontFallbacks["Bebas Neue"] = true; }
try { await figma.loadFontAsync({ family: "IBM Plex Mono", style: "Regular" }); } catch (e) { fontFallbacks["IBM Plex Mono"] = true; }
try { await figma.loadFontAsync({ family: "IBM Plex Mono", style: "Bold" }); } catch (e) { fontFallbacks["IBM Plex Mono Bold"] = true; }

const heroFont = fontFallbacks["Bebas Neue"] ? { family: "Arial", style: "Regular" } : { family: "Bebas Neue", style: "Regular" };
const subFont = fontFallbacks["IBM Plex Mono"] ? { family: "Arial", style: "Regular" } : { family: "IBM Plex Mono", style: "Regular" };

const wrapper = await figma.getNodeByIdAsync("REPLACE_WRAPPER_ID");
if (!wrapper) throw new Error("wrapper not found");

const hero = figma.createFrame();
hero.name = "Hero";
hero.layoutMode = "VERTICAL";
hero.primaryAxisAlignItems = "CENTER";
hero.counterAxisAlignItems = "CENTER";
hero.paddingTop = 160; hero.paddingBottom = 160;
hero.paddingLeft = 40; hero.paddingRight = 40;
hero.itemSpacing = 40;
hero.fills = [{ type: "SOLID", color: { r: 240 / 255, g: 245 / 255, b: 250 / 255, a: 1 } }];
hero.strokes = [{ type: "SOLID", color: { r: 0.898, g: 0.898, b: 0.898, a: 1 } }];
hero.strokeWeight = 0;
hero.strokeBottomWeight = 1;

const headingRow = figma.createFrame();
headingRow.name = "Hero Heading";
headingRow.layoutMode = "HORIZONTAL";
headingRow.primaryAxisAlignItems = "CENTER";
headingRow.counterAxisAlignItems = "CENTER";
headingRow.itemSpacing = 0;
headingRow.fills = [];

const triage = figma.createText();
triage.name = "Triage";
triage.fontName = heroFont;
triage.characters = "TRIAGE. ";
triage.fontSize = 200;
triage.lineHeight = { value: 80, unit: "PERCENT" };
triage.letterSpacing = { value: -5, unit: "PIXELS" };
triage.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0, a: 1 } }];
headingRow.appendChild(triage);
triage.layoutSizingHorizontal = "HUG";
triage.layoutSizingVertical = "HUG";

const faster = figma.createText();
faster.name = "Faster";
faster.fontName = heroFont;
faster.characters = "FASTER.";
faster.fontSize = 200;
faster.lineHeight = { value: 80, unit: "PERCENT" };
faster.letterSpacing = { value: -5, unit: "PIXELS" };
faster.fills = [{ type: "SOLID", color: { r: 30 / 255, g: 90 / 255, b: 139 / 255, a: 1 } }];
headingRow.appendChild(faster);
faster.layoutSizingHorizontal = "HUG";
faster.layoutSizingVertical = "HUG";

hero.appendChild(headingRow);
headingRow.layoutSizingHorizontal = "HUG";
headingRow.layoutSizingVertical = "HUG";

const subhead = figma.createText();
subhead.name = "Hero Subhead";
subhead.fontName = subFont;
subhead.characters = "Next-generation clinical intelligence for critical care environments.";
subhead.fontSize = 28;
subhead.letterSpacing = { value: 5.6, unit: "PIXELS" };
subhead.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0, a: 1 } }];
subhead.textAlignHorizontal = "CENTER";
hero.appendChild(subhead);
subhead.layoutSizingHorizontal = "HUG";
subhead.layoutSizingVertical = "HUG";

const ctaComp = await figma.getNodeByIdAsync("REPLACE_CTA_BUTTON_ID");
let ctaInstId = null;
if (ctaComp && ctaComp.type === "COMPONENT") {
  const ctaInst = ctaComp.createInstance();
  ctaInst.name = "CTA Get Started";
  hero.appendChild(ctaInst);
  ctaInst.layoutSizingHorizontal = "HUG";
  ctaInst.layoutSizingVertical = "HUG";
  ctaInstId = ctaInst.id;
}

wrapper.appendChild(hero);
hero.layoutSizingHorizontal = "FILL";
hero.layoutSizingVertical = "HUG";

return { success: true, createdNodeIds: { heroId: hero.id, triageTextId: triage.id, fasterTextId: faster.id, subheadId: subhead.id, ctaInstId }, fontFallbacks };
