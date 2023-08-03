import playwright from 'playwright';
import fs from 'fs';

// hurriyet: yaklasik 823 sayfa haber
const SEARCH_KEYWORD = "emeklilik";
const MAX_PAGES = 823;
const BASE_URL = "https://www.hurriyet.com.tr/arama/#/";
const EXTRA_PARAMS = "where=/&how=Article,Column,NewsPhotoGallery,NewsVideo,Recipe&isDetail=false"



export default async function scrapeHurriyet() {

  const output = [];

  // loop through all available pages (823)
  for (let i = 0; i < MAX_PAGES; i++) {
    // navigate to archive page
    const browser = await playwright.firefox.launch({headless: false});
    const context = await browser.newContext();
    const page = await context.newPage();
    const pageNumber = i + 1;
    const targetURL = `${BASE_URL}?page=${pageNumber}&key=${SEARCH_KEYWORD}&${EXTRA_PARAMS}`;
    await page.goto(targetURL, { waitUntil: "domcontentloaded" });

    // remove cookies popup

    await page.click('button[aria-label="İzin ver"]');
    //collect data from articles
    const articleData = await page.$$eval('div.hs-new-article', collectArticleData);


    // output.push(...articleData);

    // save data from articles
    const outputURL = './output/hurriyet.json';
    const savedArticles = JSON.parse(fs.readFileSync(outputURL, {encoding: 'utf-8'}));
    fs.writeFileSync(outputURL, JSON.stringify([...savedArticles, ...articleData]));
    
    await browser.close();
  }
}

function collectArticleData(articles) {

  return articles.map(article => {
    const articleTitle = article.querySelector(".hs-cnnc-title").innerText;
    const articleDate = article.querySelector(".hs-cnncc-date").innerText;
    const articleURL = article.querySelector("a").href;
    return { title: articleTitle, date: articleDate, url: articleURL };
  });
}