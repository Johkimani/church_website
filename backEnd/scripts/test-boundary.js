async function test() {
  const r = await fetch("https://www.catholicgallery.org/mass-reading/010126/", {
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  const html = await r.text();
  const lectIdx = html.indexOf("Lectionary:");
  const detail = html.substring(lectIdx);

  const markers = [
    { type: "first-reading", start: "First Reading:", end: "Responsorial Psalm:" },
    { type: "responsorial-psalm", start: "Responsorial Psalm:", end: "Second Reading:" },
    { type: "second-reading", start: "Second Reading:", end: "Gospel Acclamation:|Gospel:" },
    { type: "gospel", start: "Gospel Acclamation:|Gospel:", end: "Tags:" },
  ];

  for (const m of markers) {
    let startIdx = -1;
    let startLen = 0;
    for (const s of m.start.split("|")) {
      const i = detail.indexOf(s);
      if (i > 0 && (startIdx === -1 || i < startIdx)) { startIdx = i; startLen = s.length; }
    }
    let endIdx = detail.length;
    if (m.end) {
      for (const e of m.end.split("|")) {
        const ei = detail.indexOf(e, startIdx + startLen);
        if (ei > 0 && ei < endIdx) endIdx = ei;
      }
    }
    const chunk = detail.substring(startIdx, endIdx);
    const stripped = chunk.replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n").replace(/<\/div>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&[^;]+;/g, " ").trim();
    const lines = stripped.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    console.log("===", m.type, "===");
    console.log("citation:", lines[0]);
    console.log("line count:", lines.length);
    const last3 = lines.slice(-3).join(" | ");
    console.log("LAST:", last3.substring(0, 200));
    console.log();
  }
}
test();
