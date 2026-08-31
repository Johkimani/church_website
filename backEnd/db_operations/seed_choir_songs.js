import { db } from "../src/Configs/dbConfig.js";
import logger from "../src/logger/winston.js";

const SAMPLE_SONGS = [
  {
    module_id: 'choir',
    title: 'Mzalendo wa Mbinguni (Bikira Maria)',
    category: 'marian',
    composer: 'Fr. Jude Njoroge',
    key_signature: 'G Major',
    time_signature: '4/4',
    tempo: 'Andante',
    solfa_notation: 'd : m | s : - | l : s | f : m | r : - ||',
    lyrics_text: `[Chorus]
Mzalendo wa mbinguni, Maria Mama Yetu
Tuombee kwa Mwanao, Yesu Mwokozi wetu.
Ee Maria Mwombezi, Nyota ya Bahari
Tuongoze safarini, tufike salama.

[Verse 1]
1. Uliyepokea shime, kutoka kwa Gabrieli
Ukajazwa na neema, uwe Mama wa Mwokozi.

[Verse 2]
2. Nasi leo twakulilia, wanao hapa bondeni
Utusikie maombi yetu, Maria kimbilio letu.

[Verse 3]
3. Ee Mama wa huruma, utuombee daima
Katika shida na furaha, uwe ngao yetu thabiti.`,
    image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=1200',
    language: 'Swahili',
    tags: ['marian', 'mama maria', 'hymn', 'satb'],
  },
  {
    module_id: 'choir',
    title: 'Twende Wote Nyumbani Mwa Bwana',
    category: 'mwanzo',
    composer: 'Traditional',
    key_signature: 'F Major',
    time_signature: '4/4',
    tempo: 'Allegro Moderato',
    solfa_notation: 's : s | m : d | r : r | d : - ||',
    lyrics_text: `[Chorus]
Twende wote nyumbani mwa Bwana,
Tukaingie kwa shangwe na vigelegele.
Kwa kuwa Bwana ametutendea makuu,
Jina lake lihimidiwe milele!

[Verse 1]
1. Niliyafurahia maneno yao waliponiambia,
Na twende nyumbani mwa Bwana sasa hivi.

[Verse 2]
2. Miguu yetu imesimama malangoni mwako,
Ee Yerusalemu mji ulioshikamana vyema.`,
    image_url: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&q=80&w=1200',
    language: 'Swahili',
    tags: ['mwanzo', 'entrance', 'shangwe'],
  },
  {
    module_id: 'choir',
    title: 'Tazameni Sadaka Yetu',
    category: 'sadaka',
    composer: 'B. Mukasa',
    key_signature: 'D Major',
    time_signature: '3/4',
    tempo: 'Moderate',
    solfa_notation: 'd : d : r | m : - : m | r : d : r | d : - : - ||',
    lyrics_text: `[Chorus]
Tazameni sadaka yetu tunayoleta leo,
Mkate na divai twakutolea Ee Baba.
Pokea Baba upokee, mikononi mwetu,
Iwe sadaka safi, ikupendeze Wewe.

[Verse 1]
1. Mazao ya mashamba yetu, na kazi ya mikono yetu,
Twakutolea kwa moyo wa shukrani.

[Verse 2]
2. Nasi wenyewe twajitoa kwako Ee Mungu wetu,
Maisha yetu yote yawe yako daima.`,
    image_url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&q=80&w=1200',
    language: 'Swahili',
    tags: ['sadaka', 'offertory', 'mkate na divai'],
  },
  {
    module_id: 'choir',
    title: 'Mwili Wangu Ni Chakula Kweli (Ekaristi)',
    category: 'komunyo',
    composer: 'Fr. G. Kayetta',
    key_signature: 'C Major',
    time_signature: '4/4',
    tempo: 'Adagio Cantabile',
    solfa_notation: 'm : m | s : f | m : r | d : - ||',
    lyrics_text: `[Chorus]
Mwili wangu ni chakula kweli,
Na damu yangu ni kinywaji kweli.
Aulaye mwili wangu na kuinywa damu yangu,
Hukaa ndani yangu, nami ndani yake.

[Verse 1]
1. Bwana Yesu alisema katika karamu ya mwisho:
Twaeni mle nyote, huu ndio mwili wangu.

[Verse 2]
2. Heri wote walioalikwa kwenye karamu ya Mwanakondoo,
Wapate uzima na nguvu safarini kuelekea mbinguni.`,
    image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200',
    language: 'Swahili',
    tags: ['komunyo', 'communion', 'ekaristi'],
  },
  {
    module_id: 'choir',
    title: 'Pange Lingua Gloriosi (Mt. Thomas Aquinas)',
    category: 'patron',
    composer: 'St. Thomas Aquinas',
    key_signature: 'A Minor',
    time_signature: '4/4',
    tempo: 'Chant',
    solfa_notation: 'l, : d | r : m | r : d | l, : - ||',
    lyrics_text: `[Verse 1]
1. Pange, lingua, gloriosi
Corporis mysterium,
Sanguinisque pretiosi,
Quem in mundi pretium
Fructus ventris generosi
Rex effudit gentium.

[Verse 2]
2. Nobis datus, nobis natus
Ex intacta Virgine,
Et in mundo conversatus,
Sparso verbi semine,
Sui moras incolatus
Miro clausit ordine.

[Verse 3 - Tantum Ergo]
3. Tantum ergo Sacramentum
Veneremur cernui:
Et antiquum documentum
Novo cedat ritui:
Praestet fides supplementum
Sensuum defectui.`,
    image_url: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?auto=format&fit=crop&q=80&w=1200',
    language: 'Latin',
    tags: ['patron', 'st thomas aquinas', 'latin', 'tantum ergo'],
  }
];

async function seedChoirSongs() {
  try {
    for (const song of SAMPLE_SONGS) {
      const existing = await db.query(
        `SELECT id FROM choir_songs WHERE title = $1 AND module_id = $2`,
        [song.title, song.module_id]
      );
      if (existing.rows.length === 0) {
        await db.query(
          `INSERT INTO choir_songs (
            module_id, title, category, composer, key_signature, time_signature, 
            tempo, solfa_notation, lyrics_text, image_url, language, tags, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'System Seed')`,
          [
            song.module_id,
            song.title,
            song.category,
            song.composer,
            song.key_signature,
            song.time_signature,
            song.tempo,
            song.solfa_notation,
            song.lyrics_text,
            song.image_url,
            song.language,
            song.tags,
          ]
        );
        logger.info(`Seeded choir song: "${song.title}"`);
      }
    }
    console.log("✅ Seeded sample choir songs successfully.");
  } catch (error) {
    console.error("❌ Failed to seed choir songs:", error);
  }
}

if (process.argv[1]?.endsWith("seed_choir_songs.js")) {
  seedChoirSongs().then(() => process.exit(0));
}
