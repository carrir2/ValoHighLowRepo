const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeProduct(url){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const tableData = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table tr'));
        return rows.map(row => {
            const columns = row.querySelectorAll('td');
            if (columns.length > 0) {
                const link = columns[0].querySelector('a')?.href;
                const rowData = Array.from(columns).map(column => column.innerText);
                return { rowData, link };
            }
            return null;
        }).filter(row => row !== null);
    });

    const additionalData = await page.evaluate(() => {
        // Replace with your specific selectors
        const textSection = document.querySelector('h1')?.innerText.trim();
        const mainImage = document.evaluate(
            '//*[@id="wrapper"]/div[1]/div/div[1]/div[1]/div[1]/div/img',
            document,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
        );
        const logo = mainImage.snapshotItem(0).getAttribute('src');
        return { textSection, logo };
    });

    // Function to scrape image from the link page
    const scrapeImageFromLink = async (link) => {
        const newPage = await browser.newPage();
        await newPage.goto(link);

        // Example XPath to find the image src, replace with your specific XPath
        const imageUrl = await newPage.evaluate(() => {
            const xpathResult = document.evaluate(
                '//*[@id="wrapper"]/div[1]/div/div[1]/div[1]/div[1]/div/img',
                document,
                null,
                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                null
            );
            if (xpathResult.snapshotLength > 0) {
                return xpathResult.snapshotItem(0).getAttribute('src');
            }
            return null;
        });

        await newPage.close();
        return imageUrl;
    };

    // Process each row and scrape the image from the link
    for (const row of tableData) {
        if (row.link) {
            let imageUrl = await scrapeImageFromLink(row.link);
            if (imageUrl === "/img/base/ph/sil.png"){
                imageUrl = "https://www.vlr.gg/img/base/ph/sil.png";
            }
            row.imageUrl = imageUrl;
        }
    }
    const formattedData = tableData.map(entry => {
        const {
            rowData,
            link,
            imageUrl
        } = entry;
        const [ username, ignore, rnd, rating, acs, kd, kast, adr, kpr, apr, fkpr, fdpr, hsp, clp, cl, kmax, kills, deaths, assists, fk, fd ] = rowData;
        const userSplit = username.trim().split("\n");
        
        return {
            username: userSplit[0], team: userSplit[1],// Remove any extra spaces or newlines
            image: imageUrl, rating: parseFloat(rating), acs: parseFloat(acs), kd: parseFloat(kd),
            adr: parseFloat(adr), kpr: parseFloat(kpr), 
            kmax: parseInt(kmax), kills: parseInt(kills), deaths: parseInt(deaths),
            assists: parseInt(assists)
        };
    });

    let output = {"name": additionalData.textSection, "logo": additionalData.logo, "stats": formattedData};

   
    await browser.close();
    return output;
}

(async () => {
    const urls = [
        'https://www.vlr.gg/event/stats/1999/champions-tour-2024-masters-shanghai',
        'https://www.vlr.gg/event/stats/2004/champions-tour-2024-americas-stage-1',
        'https://www.vlr.gg/event/stats/2006/champions-tour-2024-china-stage-1',
        'https://www.vlr.gg/event/stats/1998/champions-tour-2024-emea-stage-1',
        'https://www.vlr.gg/event/stats/2002/champions-tour-2024-pacific-stage-1',
        'https://www.vlr.gg/event/stats/1921/champions-tour-2024-masters-madrid',
        'https://www.vlr.gg/event/stats/1923/champions-tour-2024-americas-kickoff',
        'https://www.vlr.gg/event/stats/1926/champions-tour-2024-china-kickoff',
        'https://www.vlr.gg/event/stats/1925/champions-tour-2024-emea-kickoff',
        'https://www.vlr.gg/event/stats/1924/champions-tour-2024-pacific-kickoff',
        'https://www.vlr.gg/event/stats/1657/valorant-champions-2023',
        'https://www.vlr.gg/event/stats/1658/champions-tour-2023-americas-last-chance-qualifier',
        'https://www.vlr.gg/event/stats/1664/champions-tour-2023-champions-china-qualifier',
        'https://www.vlr.gg/event/stats/1659/champions-tour-2023-emea-last-chance-qualifier',
        'https://www.vlr.gg/event/stats/1660/champions-tour-2023-pacific-last-chance-qualifier',
        'https://www.vlr.gg/event/stats/1494/champions-tour-2023-masters-tokyo',
        'https://www.vlr.gg/event/stats/1189/champions-tour-2023-americas-league',
        'https://www.vlr.gg/event/stats/1190/champions-tour-2023-emea-league',
        'https://www.vlr.gg/event/stats/1191/champions-tour-2023-pacific-league',
        'https://www.vlr.gg/event/stats/1188/champions-tour-2023-lock-in-s-o-paulo'


    ];

    const dataAll = await Promise.all(urls.map(scrapeProduct));

    fs.writeFileSync('data.json', JSON.stringify(dataAll, null, 2));
    console.log('Data written to data.json');
})();