/**
 * Short backyard bird notes for the Recent Moments lightbox.
 * Keys are lowercase common names; lookup is fuzzy so model labels still match.
 */

export interface BirdNote {
  blurb: string;
  scientificName?: string;
}

const NOTES: Record<string, BirdNote> = {
  "chestnut-backed chickadee": {
    scientificName: "Poecile rufescens",
    blurb:
      "A tiny Pacific Northwest favorite with a warm chestnut cape. They flit through firs and feeders in lively family flocks, hanging upside down to pick at seeds.",
  },
  "black-capped chickadee": {
    scientificName: "Poecile atricapillus",
    blurb:
      "Curious and brave for its size. Chickadees remember thousands of seed hiding spots and announce danger with a sharp, familiar call.",
  },
  "mountain chickadee": {
    scientificName: "Poecile gambeli",
    blurb:
      "A highland cousin with a bright white eyebrow. They stash seeds in bark crevices and return through winter with uncanny memory.",
  },
  "house finch": {
    scientificName: "Haemorhous mexicanus",
    blurb:
      "Males wear a soft raspberry wash on the head and chest. They love sunflower seeds and fill quiet mornings with a cheerful, warbling song.",
  },
  "purple finch": {
    scientificName: "Haemorhous purpureus",
    blurb:
      "A richer raspberry than the House Finch, as if dipped in berry juice. They prefer trees and soft songs over busy feeder crowds.",
  },
  "house sparrow": {
    scientificName: "Passer domesticus",
    blurb:
      "A city-smart companion of porches and eaves. They chatter in little flocks and nest in the nooks people leave behind.",
  },
  "song sparrow": {
    scientificName: "Melospiza melodia",
    blurb:
      "Often the first singer of the yard. Their song is a sweet jumble of notes, and each bird keeps a small territory near cover and water.",
  },
  "white-crowned sparrow": {
    scientificName: "Zonotrichia leucophrys",
    blurb:
      "Crisp black-and-white head stripes make them easy to spot. Young birds learn their local dialect of song by listening to neighbors.",
  },
  "golden-crowned sparrow": {
    scientificName: "Zonotrichia atricapilla",
    blurb:
      "A winter visitor with a golden forehead stripe. Their plaintive three-note whistle sounds like a gentle question in the rain.",
  },
  "american goldfinch": {
    scientificName: "Spinus tristis",
    blurb:
      "Summer males glow lemon-bright. They ride thistle and nyjer feeders in bouncing flight, often nesting later than most backyard birds.",
  },
  "lesser goldfinch": {
    scientificName: "Spinus psaltria",
    blurb:
      "A smaller western goldfinch with a dark back. They chatter in trees and love tiny seeds from sunflowers and garden weeds.",
  },
  "dark-eyed junco": {
    scientificName: "Junco hyemalis",
    blurb:
      "Often called snowbirds for winter visits. Flash their white outer tail feathers as they hop under feeders for fallen seed.",
  },
  "spotted towhee": {
    scientificName: "Pipilo maculatus",
    blurb:
      "A bold ground forager that scratches leaf litter with both feet at once. Listen for their sharp mew and rich, buzzing song.",
  },
  "american robin": {
    scientificName: "Turdus migratorius",
    blurb:
      "The classic lawn hunter, head tilted for worms. Robins also feast on berries and often raise more than one brood each year.",
  },
  "northern cardinal": {
    scientificName: "Cardinalis cardinalis",
    blurb:
      "A scarlet beacon at the feeder. Both males and females sing, and pairs often stay close through the colder months.",
  },
  "blue jay": {
    scientificName: "Cyanocitta cristata",
    blurb:
      "Bright, loud, and clever. Jays cache acorns for winter and can mimic hawk calls to clear a crowded feeder.",
  },
  "steller's jay": {
    scientificName: "Cyanocitta stelleri",
    blurb:
      "A crested western jay of deep blue and charcoal. Bold near picnic tables, quieter when nesting high in conifers.",
  },
  "california scrub-jay": {
    scientificName: "Aphelocoma californica",
    blurb:
      "A sharp-eyed oak country bird. They bury thousands of acorns each fall and remember many of those hidden pantries.",
  },
  "california scrub jay": {
    scientificName: "Aphelocoma californica",
    blurb:
      "A sharp-eyed oak country bird. They bury thousands of acorns each fall and remember many of those hidden pantries.",
  },
  "anna's hummingbird": {
    scientificName: "Calypte anna",
    blurb:
      "A year-round western jewel. Males flash a rose-pink gorget in the sun and defend nectar spots with darting courage.",
  },
  "rufous hummingbird": {
    scientificName: "Selasphorus rufus",
    blurb:
      "A fiery migrant that travels astonishing distances for its size. They chase rivals from flowers with fierce determination.",
  },
  "mourning dove": {
    scientificName: "Zenaida macroura",
    blurb:
      "Soft coos and whistling wings mark their visits. They gulp seeds and raise young on “pigeon milk” from the parents’ crops.",
  },
  "eurasian collared-dove": {
    scientificName: "Streptopelia decaocto",
    blurb:
      "A pale dove with a neat black neck ring. Their three-note coo carries farther than the Mourning Dove’s softer song.",
  },
  "eurasian collared dove": {
    scientificName: "Streptopelia decaocto",
    blurb:
      "A pale dove with a neat black neck ring. Their three-note coo carries farther than the Mourning Dove’s softer song.",
  },
  "bushtit": {
    scientificName: "Psaltriparus minimus",
    blurb:
      "Tiny gray birds that travel in chattering clouds. In nesting season they weave a hanging sock of moss, lichen, and spider silk.",
  },
  "bewick's wren": {
    scientificName: "Thryomanes bewickii",
    blurb:
      "A lively singer with a long cocked tail. They slip through brush piles and nest boxes, scolding gently when you pass too near.",
  },
  "house wren": {
    scientificName: "Troglodytes aedon",
    blurb:
      "A tiny brown whirlwind of song. House Wrens stuff nest cavities with sticks and fill the yard with bubbling chatter.",
  },
  "red-breasted nuthatch": {
    scientificName: "Sitta canadensis",
    blurb:
      "A compact climber that walks headfirst down trunks. Their tin-horn yank call carries through pines as they probe for insects and seeds.",
  },
  "white-breasted nuthatch": {
    scientificName: "Sitta carolinensis",
    blurb:
      "Larger than its red-breasted cousin, with a clean white face. They wedge seeds into bark and hammer them open with sturdy bills.",
  },
  "brown creeper": {
    scientificName: "Certhia americana",
    blurb:
      "A bark-colored mouse of a bird. Creepers spiral up trunks seeking insects, then flutter to the base of the next tree to begin again.",
  },
  "downy woodpecker": {
    scientificName: "Dryobates pubescens",
    blurb:
      "The smallest woodpecker at many feeders. Soft drumming and a short pik call announce visits to suet and quiet branches.",
  },
  "hairy woodpecker": {
    scientificName: "Dryobates villosus",
    blurb:
      "Like a larger Downy, with a longer bill. They excavate deeper into wood and often prefer bigger trees than their tiny lookalike.",
  },
  "northern flicker": {
    scientificName: "Colaptes auratus",
    blurb:
      "A woodpecker that often feeds on the ground for ants. Watch for a white rump flash and warm underwing color in flight.",
  },
  "european starling": {
    scientificName: "Sturnus vulgaris",
    blurb:
      "Glossy in breeding season, speckled in winter. Starlings are skilled mimics and often travel in swirling, synchronized flocks.",
  },
  "american crow": {
    scientificName: "Corvus brachyrhynchos",
    blurb:
      "Highly social and remarkably smart. Crows recognize faces, use tools, and gather in family groups that share what they learn.",
  },
  "common raven": {
    scientificName: "Corvus corax",
    blurb:
      "Larger and deeper-voiced than a crow, with a wedge-shaped tail. Ravens soar on mountain air and play in the wind.",
  },
  "western bluebird": {
    scientificName: "Sialia mexicana",
    blurb:
      "Soft blue with a warm rusty chest. They hunt insects from low perches and gladly raise families in quiet nest boxes.",
  },
  "eastern bluebird": {
    scientificName: "Sialia sialis",
    blurb:
      "A gentle flash of sky blue over open lawns. Bluebirds thrived again when people began offering nest boxes along fence lines.",
  },
  "tree swallow": {
    scientificName: "Tachycineta bicolor",
    blurb:
      "Iridescent blue-green above and bright white below. They skim insects from the air and line nests with soft feathers.",
  },
  "violet-green swallow": {
    scientificName: "Tachycineta thalassina",
    blurb:
      "A western aerial dancer with white flank patches that flash in flight. They nest in cavities and feast on flying insects at dusk.",
  },
  "black-headed grosbeak": {
    scientificName: "Pheucticus melanocephalus",
    blurb:
      "A rich orange-and-black singer of western woods. Their warm, robin-like song pours from the canopy in late spring.",
  },
  "evening grosbeak": {
    scientificName: "Coccothraustes vespertinus",
    blurb:
      "Stocky finches with powerful seed-cracking bills. Winter flocks can empty a sunflower feeder in a joyful afternoon.",
  },
  "cedar waxwing": {
    scientificName: "Bombycilla cedrorum",
    blurb:
      "Sleek and masked, with waxy red wing tips. They pass berries down a perch line and wander wherever fruit ripens.",
  },
  "american yellow warbler": {
    scientificName: "Setophaga petechia",
    blurb:
      "A bright splash of spring yellow. They weave cup nests in shrubs and fill warm days with a sweet sweet sweet song.",
  },
  "yellow warbler": {
    scientificName: "Setophaga petechia",
    blurb:
      "A bright splash of spring yellow. They weave cup nests in shrubs and fill warm days with a sweet sweet sweet song.",
  },
  "orange-crowned warbler": {
    scientificName: "Leiothlypis celata",
    blurb:
      "A soft olive warbler whose crown patch is often hidden. They slip through willow and garden leaves hunting tiny insects.",
  },
  "ruby-crowned kinglet": {
    scientificName: "Corthylio calendula",
    blurb:
      "A restless olive speck that flicks its wings constantly. Excited males flash a hidden ruby crest like a secret signal.",
  },
  "golden-crowned kinglet": {
    scientificName: "Regulus satrapa",
    blurb:
      "Tiny even among tiny birds, with a golden crown stripe. They glean insects from conifer tips through the coldest months.",
  },
  "northern mockingbird": {
    scientificName: "Mimus polyglottos",
    blurb:
      "A virtuoso mimic that can string dozens of borrowed phrases into one long song, often singing under the moon.",
  },
  "california towhee": {
    scientificName: "Melozone crissalis",
    blurb:
      "A plain brown neighbor of western gardens. They hop under shrubs, scratching quietly, and call with a sharp metallic chip.",
  },
  "oak titmouse": {
    scientificName: "Baeolophus inornatus",
    blurb:
      "A little gray bird with a tidy crest. Titmice nest in cavities and scold gently when a hawk’s shadow passes over.",
  },
  "unknown bird": {
    blurb:
      "Still learning this visitor’s name. Watch the shape, colors, and habits — every quiet look teaches the yard’s story.",
  },
  bird: {
    blurb:
      "A welcome guest at the birdhouse. Soft light, safe cover, and a little patience reveal more on the next visit.",
  },
  // Mock / poetic recent-moment titles
  "morning flight": {
    blurb:
      "Wings catch the first gold of day. Early flights are often about breakfast — insects rising with the sun, seeds waiting below.",
  },
  "three eggs": {
    blurb:
      "A full clutch is a quiet promise. Many songbirds warm eggs for about two weeks before tiny beaks begin to chip through.",
  },
  "a quiet visit": {
    blurb:
      "Not every guest arrives with song. Some slip in, look around, and leave a soft story only the camera notices.",
  },
  "garden blooms": {
    blurb:
      "Flowers feed more than beauty — nectar, insects, and cover draw birds through the seasons of a living garden.",
  },
};

const DEFAULT_NOTE: BirdNote = {
  blurb:
    "Every visitor has a story of song, food, and shelter. Pause with this moment — the more you watch, the more the yard teaches back.",
};

function normalizeKey(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/** Hyphen and spaced forms both resolve (scrub-jay ↔ scrub jay). */
function variants(key: string): string[] {
  const spaced = key.replace(/-/g, " ");
  const hyphenated = key.replace(/\s+/g, "-");
  return [...new Set([key, spaced, hyphenated])];
}

export function getBirdNote(title: string): BirdNote {
  const key = normalizeKey(title);
  if (!key) return DEFAULT_NOTE;

  for (const candidate of variants(key)) {
    const direct = NOTES[candidate];
    if (direct) return direct;
  }

  // Partial match for truncated UI titles (“Chestnut Back…”) or longer labels.
  let best: BirdNote | undefined;
  let bestLen = 0;
  for (const [known, note] of Object.entries(NOTES)) {
    const knownNorm = normalizeKey(known);
    if (
      (key.includes(knownNorm) || knownNorm.includes(key)) &&
      knownNorm.length > bestLen &&
      knownNorm.length >= 6
    ) {
      best = note;
      bestLen = knownNorm.length;
    }
  }

  return best ?? DEFAULT_NOTE;
}
