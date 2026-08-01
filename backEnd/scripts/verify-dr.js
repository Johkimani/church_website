const data = require('../src/data/readings-2026-dr.json');
let junk = 0, empty = 0, total = 0, psalmResp = 0;
for (const [date, day] of Object.entries(data)) {
  for (const r of day.readings) {
    total++;
    if (!r.text || r.text.length < 10) empty++;
    if (r.text && (/\.adslot|adsbygoogle|\.cgAd|@media|window\.__CF/.test(r.text))) junk++;
    if (r.response) psalmResp++;
  }
}
console.log('Total readings:', total);
console.log('Empty/too short:', empty);
console.log('With junk:', junk);
console.log('With psalm response:', psalmResp);
