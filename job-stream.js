import pup from "puppeteer";
// import { text } from 'node:stream/consumers';
import { Readable, Stream, Writable } from "node:stream";
import { WritableStream } from "node:stream/web";

const sleep = (s) => new Promise((r) => setTimeout(() => r(true), s * 1000));

function sendToDbStream(data) {
    return new WritableStream({
        write(chunk) {
            console.log(chunk);
        },
    });
}
const job = async () => {
    const options = {
        headless: false,
        devtools: true,
        defaultViewport: { width: 1360, height: 760 },
        args: ["--window-size=1920,1080"],
    };

    const browser = await pup.launch(options);

    const pages = await browser.pages();

    const page = pages || pages.lenght ? pages[0] : await browser.newPage();

    console.log("calling...");
    await page.goto("https://baiak-ilusion.com/?subtopic=tradeoff");

    // let rows = await page.$$('.TableContentContainer tr');

    let txt = await page.evaluate(() => {
        let rows = document.querySelectorAll(".TableContentContainer tr");
        let txt = [];

        rows.forEach((el) => {
            txt.push(el.innerText);
            // let row = el.querySelectorAll('td');
            // row.forEach((el) =>{ console.log(el)});
        });
        return txt;
    });

    // console.log({ txt });

    const readable = Readable.from(txt);
    const writable = new Stream.Writable();

    writable._write = (data, enc, next) => {
        console.log({ data });
        next();
    };

    readable.on("data", (chunk) => console.log({ chunk }));

    readable.on("end", () => console.log("enddddddd"));
    readable.pipe(sendToDbStream);

    // writable.end();
    // readable.unpipe(sendToDbStream);

    // readable.on("data", (chunk) => console.log({ chunk }));
    // const string = await text(readable);

    // console.log({ string });

    await sleep(9 * 15 * 99);

    await browser.close();
};

job();
