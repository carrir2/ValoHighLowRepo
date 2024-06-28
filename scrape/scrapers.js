const puppeteer = require('puppeteer');

async function scrapeProduct(url){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    // const title = await page.evaluate (() => document.title);
    // console.log(title);

    // const [el] = await page.$x('/html/body/div[5]/div[1]/div/div[1]/div[1]/div[2]/div/h1');
    // const src = await el.getProperty('src');
    // const srcTxt = await src.jsonValue();
    // console.log({srcTxt});

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

    let output = {"name": additionalData.textSection, "logo": additionalData.logo};
    output.stats=formattedData;
    console.log(JSON.stringify(output));
    


    await browser.close();
}

scrapeProduct('https://www.vlr.gg/event/stats/1999/champions-tour-2024-masters-shanghai');