async function test() {
  // Test Easter Sunday
  const r = await fetch("https://www.catholicgallery.org/mass-reading/050426/", {
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  const html = await r.text();
  const lectIdx = html.indexOf("Lectionary:");
  const detail = html.substring(lectIdx);

  const markers = ["First Reading:", "Responsorial Psalm:", "Second Reading:", "Gospel Acclamation:", "Gospel:", "The readings on this page", "Tags:"];
  for (const m of markers) {
    const idx = detail.indexOf(m);
    console.log(m.padEnd(30), "at", idx);
  }
  
  // Also test first reading area to see CSS
  const frIdx = detail.indexOf("First Reading:");
  const rpIdx = detail.indexOf("Responsorial Psalm:");
  const frChunk = detail.substring(frIdx, rpIdx);
  const stripped = frChunk.replace(/<[^>]+>/g, "").trim();
  const lines = stripped.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  console.log("\nFirst Reading lines:");
  lines.forEach((l, i) => console.log(i, ":", l.substring(0, 120)));
}
test();
