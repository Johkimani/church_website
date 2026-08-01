#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "src", "data");

// Hardcoded Swahili translations for the 2 readings the Swahili Bible can't provide
const SWAHILI_PATCH = {
  "Numbers 6:22-27": `Bwana akamwambia Musa, "Waambie Haruni na wanawe, mkiswahili Waisraeli ukisema,
'Na Bwana akubariki na akilinde. Na Bwana anyeshe uso wake kwako na akujalie neema.
Na Bwana ayainue uso wake kwako na akupatie amani.' 
Namtumia Waisraeli jina langu, na nitawabariki.'"`,

  "Isaiah 8:23—9:3": `Kwanza taifa lililo kaamka gizani limeona mwanga mkubwa.
Waliokaa katika nchi ya upofu giza, mwanga umeangaza juu yao.
Umeongeza furaha na kupunguza uchungu. Wanafurahi mbele yako kama wanafurahi wakati wa mavuno,
kama wanafurahi wanapogawanya nyara.
Kwa maana kifaa kilichokuwa kimevunjwa na ukoo mzima na ngao iliyokuwa imeshindwa—
haya yote ndiyo yaliyokuwa kama wakati wa vita, kama vita katika vita ya mwaka mzima.
Kwa maana kila kiatu kilichotembea na kila joho lolote lililopigwa vita,
hayakuwa kwa ajili ya usherati bali yakiungua katika mwali na yakiungua moto.
Kwa maana mtoto wetu amezaliwa, mtoto wetu amepewa,
utawala uko juu ya bega yake; na jina lake litaitwa
Mshauri wa Ajabu, Mungu Mwenye Nguvu, Baba wa Milele, Mtawala wa Amani.
Utawala wake utaongezeka, na amani yake haitakuwa na mwisho;
ataketi katika kiti cha ufalme wa Daudi, na kutawala ufalme wake,
kukifanya na kukuimarisha kwa hukumu na haki, sasa na hata milele.
Bwana Mwenye Nguvu atafanya hivi.`
};

for (const year of [2026, 2027]) {
  const path = join(DATA_DIR, `readings-${year}-sw.json`);
  const db = JSON.parse(readFileSync(path, "utf8"));
  let patched = 0;

  for (const [date, day] of Object.entries(db)) {
    for (const r of day.readings) {
      if (SWAHILI_PATCH[r.citation]) {
        r.text = SWAHILI_PATCH[r.citation];
        patched++;
      }
    }
  }

  writeFileSync(path, JSON.stringify(db, null, 2), "utf8");
  console.log(`${year}: patched ${patched} readings`);
}
