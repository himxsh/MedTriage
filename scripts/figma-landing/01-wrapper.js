const existing = figma.currentPage.children;
let ox = 0, oy = 0;
if (existing.length > 0) {
  const maxX = Math.max(...existing.map((c) => c.x + c.width));
  const maxY = Math.max(...existing.map((c) => c.y + c.height));
  ox = Math.max(ox, maxX + 200);
  oy = Math.max(oy, maxY + 200);
}

const wrapper = figma.createFrame();
wrapper.name = "Landing / Desktop";
wrapper.layoutMode = "VERTICAL";
wrapper.primaryAxisAlignItems = "TOP";
wrapper.counterAxisAlignItems = "STRETCH";
wrapper.resize(1440, 0);
wrapper.layoutSizingHorizontal = "FIXED";
wrapper.layoutSizingVertical = "HUG";
wrapper.fills = [{ type: "SOLID", color: { r: 240 / 255, g: 245 / 255, b: 250 / 255, a: 1 } }];
wrapper.x = ox;
wrapper.y = oy;

figma.currentPage.appendChild(wrapper);

return { success: true, wrapperId: wrapper.id };
