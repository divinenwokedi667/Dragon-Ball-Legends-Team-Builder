const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
let count = 0;
const total = 700+2;


const characters = [];

const BASE_URL = 'https://dblegends.net/character/';

async function scrapeCharacter(id) {
    try {
        const response = await axios.get(`${BASE_URL}${id}`);
        const html = response.data;
        const $ = cheerio.load(html);

        const cardNum = $('#overlaybg div.cardNUM').text().trim();

        const name = $('#overlaybg > div.name, #overlaybg > #SPShallotBaseImage div.name, #overlaybg > #charamainimage div.name').text().trim();

        const image = 'https://dblegends.net/' + $('#overlaybg img.cutin').attr('src');

        const rarity = $('#overlaybg div.rarity').attr('class').split(' ')[1];

        const color = $('#overlaybg div.element').attr('class').split(' ')[1];

        const tags = new Set();
        $('div.trait-container a.trait-thumb .name').each((i, el) => {
            tags.add($(el).text().trim());
        });

        const zability = $('#ZenZAbl4').text();

        const zenkaiAbility = $('#ZenkaiAblfour').text();

        const characterData = {
            id,
            cardNum,
            name,
            image,
            rarity,
            color,
            tags: [...tags],
            zability,
            zenkaiAbility
        };

        characters.push(characterData);
        count++;
        process.stdout.write(`Characters saved: ${count}/${total}\r`);

    } catch(err) {
        if (err.response && err.response.status === 404) {
            console.log(`ID: ${id} not found.`);
        } else {
            console.error(`Error with ID ${id}:`, err.message);
        }
    }
}

(async () => {
    for (let id = total-2; id >= 0; id--) {
        await scrapeCharacter(id);
    }
    await scrapeCharacter(19800);
    await scrapeCharacter(19000);

    fs.writeFileSync('characters.json', JSON.stringify(characters, null, 2));
    console.log('✅ Character data saved successfully!');
})();