const available = await figma.listAvailableFontsAsync();
const required = ["Bebas Neue", "IBM Plex Mono", "Space Grotesk"];
const results = {};
const details = {};
for (const family of required) {
  const found = available.filter((f) => f.fontName.family === family);
  results[family] = found.length > 0;
  details[family] = found.map((f) => f.fontName.style);
}
const allAvailable = required.every((f) => results[f]);
return {
  success: true,
  allAvailable,
  fontAvailability: results,
  fontDetails: details,
  availableFamilies: [...new Set(available.map((f) => f.fontName.family))].sort(),
};
