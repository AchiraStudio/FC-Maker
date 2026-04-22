import { TransfermarktScraper } from './src/utils/tm26/scraper.js';

const scraper = new TransfermarktScraper();
console.log(scraper._buildSquadUrl('https://www.transfermarkt.com/indonesia/startseite/nationalmannschaft/13958/saison_id/2023'));
console.log(scraper._buildSquadUrl('https://www.transfermarkt.com/indonesia/kader/verein/13958/saison_id/2024/plus/1'));
console.log(scraper._buildSquadUrl('https://www.transfermarkt.com/indonesia/kader/nationalmannschaft/13958/saison_id/2024/plus/1'));
