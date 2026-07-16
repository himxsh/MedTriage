const fontFallbacks = {};
const fontNeeded = [
  { family: "Bebas Neue", style: "Regular" },
  { family: "IBM Plex Mono", style: "Regular" },
  { family: "IBM Plex Mono", style: "Bold" },
  { family: "Space Grotesk", style: "Regular" },
  { family: "Space Grotesk", style: "Bold" },
];
for (const f of fontNeeded) {
  try {
    await figma.loadFontAsync(f);
  } catch (e) {
    fontFallbacks[`${f.family} ${f.style}`] = f.family;
  }
}

// ponytail: fonts set explicitly per node in section scripts; text styles exist as reference
function txtStyle(name, family, style, size, opts = {}) {
  const s = figma.createTextStyle();
  s.name = name;
  if (!fontFallbacks[`${family} ${style}`]) {
    s.fontName = { family, style };
    s.fontSize = size;
    if (opts.lineHeight) s.lineHeight = opts.lineHeight;
    if (opts.letterSpacing) s.letterSpacing = opts.letterSpacing;
  }
  return s.id;
}

const colorCol = figma.variables.createVariableCollection("MedTriage / Color");
const cm = colorCol.modes[0].modeId;
function cv(name, r, g, b, a, scopes) {
  const v = figma.variables.createVariable(name, colorCol.id, "COLOR");
  v.setValueForMode(cm, { r, g, b, a });
  v.scopes = scopes;
  return v.id;
}
const cPrimary = cv("primary", 74 / 255, 144 / 255, 217 / 255, 1, ["FRAME_FILL", "SHAPE_FILL", "STROKE_COLOR"]);
const cPrimaryInk = cv("primary-ink", 30 / 255, 90 / 255, 139 / 255, 1, ["TEXT_FILL", "FRAME_FILL", "SHAPE_FILL"]);
const cLinen = cv("linen", 240 / 255, 245 / 255, 250 / 255, 1, ["FRAME_FILL", "SHAPE_FILL"]);
const cBlack = cv("black", 0, 0, 0, 1, ["TEXT_FILL", "FRAME_FILL", "STROKE_COLOR"]);
const cWhite = cv("white", 1, 1, 1, 1, ["FRAME_FILL", "TEXT_FILL"]);
const cBlack60 = cv("black/60", 0.4, 0.4, 0.4, 1, ["TEXT_FILL"]);
const cBlack10 = cv("black/10", 0.898, 0.898, 0.898, 1, ["STROKE_COLOR"]);
const cBlack5 = cv("black/5", 0.949, 0.949, 0.949, 1, ["FRAME_FILL"]);

const spaceCol = figma.variables.createVariableCollection("MedTriage / Space");
const sm = spaceCol.modes[0].modeId;
const spaceIds = {};
[4, 6, 8, 10, 12, 16, 20].forEach((n) => {
  const v = figma.variables.createVariable(`space/${n}`, spaceCol.id, "FLOAT");
  v.setValueForMode(sm, n * 4);
  v.scopes = ["GAP", "WIDTH_HEIGHT", "PADDING"];
  spaceIds[`space/${n}`] = v.id;
});

const tsHero = txtStyle("Display/Hero", "Bebas Neue", "Regular", 200, { lineHeight: { value: 80, unit: "PERCENT" }, letterSpacing: { value: -5, unit: "PIXELS" } });
const tsFeature = txtStyle("Display/Feature", "Bebas Neue", "Regular", 48, { letterSpacing: { value: 8, unit: "PIXELS" } });
const tsNav = txtStyle("Mono/Nav", "IBM Plex Mono", "Bold", 14, { letterSpacing: { value: 1, unit: "PIXELS" } });
const tsBrand = txtStyle("Mono/Brand", "IBM Plex Mono", "Bold", 24, { letterSpacing: { value: 1, unit: "PIXELS" } });
const tsSubhead = txtStyle("Mono/Subhead", "IBM Plex Mono", "Regular", 28, { letterSpacing: { value: 5.6, unit: "PIXELS" } });
const tsCTA = txtStyle("Mono/CTA", "IBM Plex Mono", "Bold", 20, { letterSpacing: { value: 1, unit: "PIXELS" } });
const tsBody = txtStyle("Mono/Body", "IBM Plex Mono", "Regular", 14);
const tsFooter = txtStyle("Mono/Footer", "IBM Plex Mono", "Regular", 10);

const featFont = fontFallbacks["Bebas Neue Regular"] ? { family: "Arial", style: "Regular" } : { family: "Bebas Neue", style: "Regular" };
const bodyFont = fontFallbacks["IBM Plex Mono Regular"] ? { family: "Arial", style: "Regular" } : { family: "IBM Plex Mono", style: "Regular" };
const ctaFont = fontFallbacks["IBM Plex Mono Bold"] ? { family: "Arial", style: "Bold" } : { family: "IBM Plex Mono", style: "Bold" };

const card = figma.createComponent();
card.name = "Feature Card";
card.layoutMode = "VERTICAL";
card.primaryAxisAlignItems = "MIN";
card.counterAxisAlignItems = "MIN";
card.paddingTop = 80; card.paddingBottom = 80; card.paddingLeft = 80; card.paddingRight = 80;
card.itemSpacing = 40;
card.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
card.x = -10000; card.y = -10000;

const iconSlot = figma.createRectangle();
iconSlot.name = "Icon Placeholder";
iconSlot.resize(64, 64);
iconSlot.fills = [{ type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.9, a: 1 } }];
iconSlot.cornerRadius = 4;
card.appendChild(iconSlot);
iconSlot.layoutSizingHorizontal = "FIXED";
iconSlot.layoutSizingVertical = "FIXED";

const cardTitle = figma.createText();
cardTitle.name = "Title";
cardTitle.fontName = featFont;
cardTitle.characters = "TITLE";
cardTitle.fontSize = 48;
cardTitle.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
cardTitle.letterSpacing = { value: 8, unit: "PIXELS" };
card.appendChild(cardTitle);
cardTitle.layoutSizingHorizontal = "HUG";
cardTitle.layoutSizingVertical = "HUG";

const cardBody = figma.createText();
cardBody.name = "Body";
cardBody.fontName = bodyFont;
cardBody.characters = "Body text";
cardBody.fontSize = 14;
cardBody.fills = [{ type: "SOLID", color: { r: 0.4, g: 0.4, b: 0.4, a: 1 } }];
card.appendChild(cardBody);
cardBody.layoutSizingHorizontal = "FILL";
cardBody.layoutSizingVertical = "HUG";

const cta = figma.createComponent();
cta.name = "CTA Button";
cta.layoutMode = "HORIZONTAL";
cta.primaryAxisAlignItems = "CENTER";
cta.counterAxisAlignItems = "CENTER";
cta.paddingTop = 24; cta.paddingBottom = 24; cta.paddingLeft = 64; cta.paddingRight = 64;
cta.fills = [{ type: "SOLID", color: { r: 74 / 255, g: 144 / 255, b: 217 / 255 } }];
cta.strokes = [{ type: "SOLID", color: { r: 0, g: 0, b: 0, a: 0.2 } }];
cta.strokeWeight = 2;
cta.cornerRadius = 0;
cta.x = -10000; cta.y = -10000;

const ctaLabel = figma.createText();
ctaLabel.name = "Label";
ctaLabel.fontName = ctaFont;
ctaLabel.characters = "Get Started";
ctaLabel.fontSize = 20;
ctaLabel.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
cta.appendChild(ctaLabel);
ctaLabel.layoutSizingHorizontal = "HUG";
ctaLabel.layoutSizingVertical = "HUG";

return {
  success: true,
  colorCollectionId: colorCol.id,
  spaceCollectionId: spaceCol.id,
  spaceVariableIds: spaceIds,
  colorVariableIds: { primary: cPrimary, primaryInk: cPrimaryInk, linen: cLinen, black: cBlack, white: cWhite, black60: cBlack60, black10: cBlack10, black5: cBlack5 },
  textStyleIds: { hero: tsHero, feature: tsFeature, nav: tsNav, brand: tsBrand, subhead: tsSubhead, cta: tsCTA, body: tsBody, footer: tsFooter },
  featureCardId: card.id,
  ctaButtonId: cta.id,
  fontFallbacks,
};
