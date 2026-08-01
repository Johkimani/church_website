async function test() {
  const r = await fetch("https://www.catholicgallery.org/mass-reading/010126/", {
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  const html = await r.text();
  const lectIdx = html.indexOf("Lectionary:");
  const detail = html.substring(lectIdx);
  
  const gospelIdx = detail.indexOf("Gospel:");
  const after = detail.substring(gospelIdx);
  const ends = ["Pradeep", "Related Articles", "Tags:", "Share:", "Leave a Reply", "c 2013", "article", "Stay Connected"];
  for (const e of ends) {
    const idx = after.indexOf(e, 100);
    console.log(e.padEnd(30), "at offset", idx);
  }
  
  // Show what comes after the last verse
  const lastVerseIdx = after.lastIndexOf("</p>");
  console.log("\nAfter last verse:", after.substring(lastVerseIdx, lastVerseIdx + 300).replace(/<[^>]+>/g, "|"));
}
test();
