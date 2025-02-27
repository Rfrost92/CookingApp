const inappropriateWordsStrict = [
    "fuck",
    "shit",
    "bitch",
    "penis",
    "cunt",
    "nigger",
    "nigga",
    "faggot",
    "cock",
    "dick",
    "pussy",
    "slut",
    "whore",
    "bastard",
    "twat",
    "chink",
    "spic",
    "gook",
    "kike",
    "retard",
    "tranny",
    "coon",
    "dyke",
    "jizz",
    "cum",
    "tit",
    "titty",
    "wank",
    "rapist",
    "molest",
    "pedophile",
    "bestiality",
    "zoophile",
    "fick",
    "scheiße",
    "fotze",
    "hurensohn",
    "schlampe",
    "wichser",
    "arschficker",
    "missgeburt",
    "homo",
    "schwuchtel",
    "kacke",
    "nazi",
    "vergewaltiger",
    "vergewaltigung",
    "kinderschänder",
    "pädophil",
    "zoophil",
    "tierficker",
    "nazischwein",
    "judensau",
    "kanake",
    "zigeuner",
    "mongo",
    "behindi",
    "neger",
    "hitler",
    "gasen",
    "holocaust",
    "islamist",
    "kopfabschneider",
    "muselmann",
    "untermensch",
    "хуй",
    "пизда",
    "ебать",
    "єбати",
    "хуєсос",
    "мудак",
    "блядь",
    "підорас",
    "підарас",
    "гандон",
    "довбойоб",
    "йобаний",
    "залупа",
    "хуйнЯ",
    "відстій",
    "ублюдок",
    "виродок",
    "еблан",
    "кончений",
    "гнида",
    "тварь",
    "курва",
    "сука",
    "педераст",
    "лох",
    "ебанько",
    "засранець",
    "гівно",
    "лайно",
    "негр",
    "жид",
    "гомик",
    "уебок",
    "кацап",
    "москаль",
    "рашист",
    "хуйлО",
    "пєтух",
    "виродок",
    "паскуда",
    "повія",
    "педик",
    "анус",

];

const inappropriateWordsExact = [
    "ass",         // (e.g., "seabass" is fine)
    "damn",        // (e.g., "goddamn" vs. "damn good")
    "hell",        // (e.g., "what the hell" vs. "hella fun")
    "hoe",         // (e.g., "garden hoe" vs. "you hoe")
    "balls",       // (e.g., "soccer balls" vs. "suck my balls")
    "nuts",        // (e.g., "cashew nuts" vs. "grab my nuts")
    "crap",        // (e.g., "full of crap" vs. "holy crap")
    "prick",       // (e.g., "prickly" vs. "you're a prick")
    "boner",       // (e.g., "boner" vs. "boner fish")
    "tit",         // (e.g., "great tit" (bird) vs. "big tits")
    "cock",        // (e.g., "cocktail" vs. "suck my cock")
    "snatch",      // (e.g., "snatch something" vs. "her snatch")
    "dike",        // (e.g., "dam dike" vs. "you dike")
    "screw",       // (e.g., "screwdriver" vs. "screw you")
    "knob",        // (e.g., "door knob" vs. "he's a knob")
    "hump",        // (e.g., "camel hump" vs. "hump someone")
    "jack",        // (e.g., "car jack" vs. "jack off")
    "arsch",          // (e.g., "Arschloch" is bad, but "Arschbombe" is fine)
    "dreck",         // (e.g., "Drecksack" is bad, but "dreckig" is neutral)
    "hure",          // (e.g., "Hurenkind" (insult) vs. "Hurensohn" (definitely offensive))
    "lutscher",      // (e.g., "Du Lutscher!" vs. "Lolli-Lutscher")
    "nackt",         // (e.g., "nackt" (naked) is neutral but could be sensitive)
    "sau",           // (e.g., "Judensau" is extremely offensive, but "Sauwetter" is fine)
    "wichs",         // (e.g., "wichsen" (masturbate) vs. "Wichse" (shoe polish))
    "hackfresse",    // (e.g., "Hackfresse" (insult) vs. "Hackfleisch" (ground meat))
    "trottel",       // (e.g., "Du Trottel" (insult) vs. "Er ist ein bisschen trottelig.")
    "kack",          // (e.g., "Kacke" (shit) is bad, but "Kackhaufen" might be used playfully)
    "spasti",        // (e.g., "Spasti" (slur for disabled people) vs. "Spastik" (medical condition))
    "schwul",        // (e.g., "schwul" (gay) is neutral but often used as an insult)
    "bimbo",         // (e.g., "Bimbo" (racial slur) vs. "Bimbo-Kuchen" (old term for cake))
    "dumpfbacke",    // (e.g., "Dumpfbacke" (insult) vs. just being silly)
    "жопа",        // (e.g., "Жопа" (insult) vs. "сидіти на жопі рівно" (idiom))
    "гей",         // (e.g., "Гей" (gay, neutral) vs. "Гей ти!" (calling attention))
    "лох",         // (e.g., "Лох" (insult) vs. "Лохина" (blueberry))
    "дурень",      // (e.g., "дурень" (insult) vs. "дурень думкою багатіє" (proverb))
    "свиня",       // (e.g., "Свиня" (insult) vs. referring to an actual pig)
    "шльондра",    // (e.g., "Шльондра" (insult) vs. rarely used for "flirtatious woman")
    "козел",       // (e.g., "Козел" (insult) vs. an actual goat)
    "баран",       // (e.g., "Баран" (insult) vs. referring to a sheep)
    "коза",        // (e.g., "Коза" (insult) vs. an actual goat)
    "стара",       // (e.g., "Стара" (offensive term for a woman) vs. just meaning "old")
    "пень",        // (e.g., "Пень" (insult for dumb person) vs. an actual tree stump)
    "гнида",       // (e.g., "Гнида" (insult) vs. referring to lice)
    "дупа",        // (e.g., "Дупа" (butt, insult) vs. "падати на дупу" (expression))
    "тупий",       // (e.g., "Тупий" (insult) vs. just meaning "dull")
    "чмо",         // (e.g., "Чмо" (insult) but can sometimes be used jokingly)
    "засранець",   // (e.g., "Засранець" (insult) vs. "мало засранців" (rare usage))

];

