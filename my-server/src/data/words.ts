/**
 * SketchRace Word Bank
 * Dual-language word lists for drawing game.
 */

export const WORDS_HU: string[] = [
    // Állatok
    "kutya", "macska", "elefánt", "zsiráf", "oroszlán", "kígyó", "teknős",
    "pingvin", "delfin", "pillangó", "kakas", "béka", "pók", "cápa", "sas",
    "medve", "ló", "tehén", "nyúl", "egér",

    // Étel & Ital
    "pizza", "hamburger", "fagylalt", "torta", "kenyér", "sajt", "alma",
    "banán", "szőlő", "kávé", "tea", "sütemény", "palacsinta", "leves", "tojás",

    // Tárgyak
    "telefon", "számítógép", "gitár", "esernyő", "óra", "kulcs", "szemüveg",
    "könyv", "lámpa", "szék", "asztal", "tükör", "olló", "ceruza", "radír",

    // Járművek
    "autó", "repülő", "vonat", "hajó", "bicikli", "busz", "helikopter",
    "rakéta", "motorcsónak", "szánkó",

    // Természet
    "nap", "hold", "csillag", "felhő", "eső", "hó", "szivárvány",
    "vulkán", "hegy", "tenger", "fa", "virág", "sziget", "folyó", "barlang",

    // Épületek & Helyek
    "kastély", "templom", "híd", "torony", "stadion", "kórház",
    "iskola", "múzeum", "börtön", "piramis",

    // Sport & Hobbi
    "foci", "kosárlabda", "tenisz", "úszás", "szörf", "horgászat",
    "sí", "sakk", "darts", "biliárd",

    // Foglalkozások
    "orvos", "tűzoltó", "rendőr", "tanár", "szakács", "fodrász",
    "pilóta", "kalóz", "varázsló", "bohóc",

    // Egyéb
    "robot", "szellem", "dinoszaurusz", "szuperhős", "tündér",
    "korona", "kard", "pajzs", "kincs", "térkép",
];

export const WORDS_EN: string[] = [
    // Animals
    "dog", "cat", "elephant", "giraffe", "lion", "snake", "turtle",
    "penguin", "dolphin", "butterfly", "rooster", "frog", "spider", "shark", "eagle",
    "bear", "horse", "cow", "rabbit", "mouse",

    // Food & Drink
    "pizza", "hamburger", "ice cream", "cake", "bread", "cheese", "apple",
    "banana", "grapes", "coffee", "tea", "cookie", "pancake", "soup", "egg",

    // Objects
    "phone", "computer", "guitar", "umbrella", "clock", "key", "glasses",
    "book", "lamp", "chair", "table", "mirror", "scissors", "pencil", "eraser",

    // Vehicles
    "car", "airplane", "train", "ship", "bicycle", "bus", "helicopter",
    "rocket", "motorboat", "sleigh",

    // Nature
    "sun", "moon", "star", "cloud", "rain", "snow", "rainbow",
    "volcano", "mountain", "ocean", "tree", "flower", "island", "river", "cave",

    // Buildings & Places
    "castle", "church", "bridge", "tower", "stadium", "hospital",
    "school", "museum", "prison", "pyramid",

    // Sports & Hobbies
    "soccer", "basketball", "tennis", "swimming", "surfing", "fishing",
    "skiing", "chess", "darts", "billiards",

    // Professions
    "doctor", "firefighter", "police", "teacher", "chef", "hairdresser",
    "pilot", "pirate", "wizard", "clown",

    // Misc
    "robot", "ghost", "dinosaur", "superhero", "fairy",
    "crown", "sword", "shield", "treasure", "map",
];

/**
 * Get a random selection of words from the appropriate bank.
 * Merges custom words with the chosen language bank.
 */
export function getRandomWords(
    count: number,
    language: "hu" | "en",
    customWords: string[] = [],
): string[] {
    const bank = language === "hu" ? [...WORDS_HU] : [...WORDS_EN];
    const allWords = [...bank, ...customWords];

    // Fisher-Yates shuffle
    for (let i = allWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allWords[i], allWords[j]] = [allWords[j], allWords[i]];
    }

    return allWords.slice(0, count);
}

/**
 * Normalize text for comparison (remove accents, lowercase).
 * Handles Hungarian special characters.
 */
export function normalizeForComparison(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove diacritics
        .replace(/\u0151/g, "o")  // ő
        .replace(/\u0171/g, "u"); // ű
}

/**
 * Check if a guess matches the current word.
 */
export function isCorrectGuess(guess: string, word: string): boolean {
    return normalizeForComparison(guess) === normalizeForComparison(word);
}

/**
 * Generate word hint from a word (e.g. "kutya" -> "_ _ _ _ _")
 */
export function generateWordHint(word: string): string {
    return word
        .split("")
        .map((c) => (c === " " ? "  " : "_"))
        .join(" ");
}
