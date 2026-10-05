async function test() {
  const r = await fetch("https://www.catholicgallery.org/mass-reading/010126/", {
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  const html = await r.text();
  const lectIdx = html.indexOf("Lectionary:");
  const detail = html.substring(lectIdx);

  const gospelIdx = detail.indexOf("Gospel:");
  const after = detail.substring(gospelIdx);
  
  // Find the last </p> that's a verse (id starting with a book name)
  const lastVerseMatches = [...after.matchAll(/<p[^>]*id="[a-z]+\d+v\d+"[^>]*>.*?<\/p>/g)];
  if (lastVerseMatches.length > 0) {
    const last = lastVerseMatches[lastVerseMatches.length - 1];
    console.log("Last verse at offset:", last.index);
    console.log("Last verse:", last[0].substring(0, 200));
    
    // What comes right after?
    const afterLast = after.substring(last.index + last[0].length, last.index + last[0].length + 300);
    console.log("\nAfter last verse:", afterLast.replace(/<[^>]+>/g, "|").substring(0, 300));
  }
}
test();
