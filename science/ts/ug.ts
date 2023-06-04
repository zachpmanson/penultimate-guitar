const jsdom = require("jsdom");
const { JSDOM } = jsdom;
global.DOMParser = new JSDOM().window.DOMParser;

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function getChords(URL: string): Promise<string> {
  let chords: string = "";
  await fetch(URL)
    .then((response) => {
      // The API call was successful!
      return response.text();
    })
    .then((html) => {
      // Convert the HTML string into a document object
      const dom = new jsdom.JSDOM(html);
      // Get the image file
      var jsStore = dom.window.document.querySelector(".js-store");
      console.log(jsStore);
      let dataContent = JSON.parse(jsStore.getAttribute("data-content"));
      chords =
        dataContent["store"]["page"]["data"]["tab_view"]["wiki_tab"]["content"];
      console.log(dataContent?.store?.page?.data?.tab);
    })
    .catch((err) => {
      // There was an error
      console.warn("Something went wrong.", err);
    });
  // console.log(chords);
  return chords;
}

// getChords(
//   "https://tabs.ultimate-guitar.com/tab/peach-pit/alrighty-aphrodite-chords-2083783"
// );

async function getSearch(URL: string): Promise<string> {
  let results: string = "";
  await fetch(URL)
    .then((response) => {
      // The API call was successful!
      return response.text();
    })
    .then((html) => {
      // Convert the HTML string into a document object
      const dom = new jsdom.JSDOM(html);
      // Get the image file
      let jsStore = dom.window.document.querySelector(".js-store");
      console.log(jsStore);
      let dataContent = JSON.parse(
        jsStore.getAttribute("data-content").replace(/&quot;/g, '"')
      );
      results = dataContent["store"]["page"]["data"]["results"];
    })
    .catch((err) => {
      // There was an error
      console.warn("Something went wrong.", err);
    });
  console.log(results);
  return results;
}

// getSearch(
//   "https://www.ultimate-guitar.com/search.php?search_type=title&value=hotel"
// );

readline.question("URL: ", (URL) => {
  getChords(URL);
  readline.close();
});
