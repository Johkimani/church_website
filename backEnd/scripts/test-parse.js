async function test() {
  const { parsePage, stripHtml } = await import('./build-dr-readings.js').catch(async () => {
    // Can't import ESM from CJS, so inline the functions
    const mod = await import('file:///C:/Users/USER/Downloads/church_website-main/backEnd/scripts/build-dr-readings.js');
    return mod;
  });
  const r = await fetch("https://www.catholicgallery.org/mass-reading/010126/", {
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  const html = await r.text();
  const result = parsePage(html);
  for (const rd of result.readings) {
    console.log("===", rd.type, "===");
    console.log("citation:", rd.citation);
    console.log("response:", rd.response || "NONE");
    console.log("text:", rd.text.substring(0, 150));
    console.log();
  }
}
test();
