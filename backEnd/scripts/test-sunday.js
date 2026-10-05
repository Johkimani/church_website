async function test() {
  // Test Sunday page (should have Gospel Acclamation)
  const r = await fetch("https://www.catholicgallery.org/mass-reading/040126/", {
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  const html = await r.text();
  const lectIdx = html.indexOf("Lectionary:");
  const detail = html.substring(lectIdx);

  // Show all marker positions
  const markers = ["First Reading:", "Responsorial Psalm:", "Second Reading:", "Gospel Acclamation:", "Gospel:", "The readings on this page", "Tags:"];
  for (const m of markers) {
    const idx = detail.indexOf(m);
    console.log(m.padEnd(30), "at", idx);
  }
}
test();
