import Fuse from "https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.esm.js";

const fetchJSONFile = (path) => {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", path, false);

  xhr.onreadystatechange = () => {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      const status = xhr.status;

      if (status === 0 || (status >= 200 && status < 400)) {
        console.log(`Retrieved ${path}!`);
      } else {
        console.log(`Could not retrieve ${path}!`);
      }
    }
  };

  xhr.send();
  return JSON.parse(xhr.responseText);
};

const loadSearch = (data) => {
  let options = {
    // fuse.js options; check fuse.js website for details
    shouldSort: true,
    location: 0,
    distance: 100,
    threshold: 0.4,
    minMatchCharLength: 2,
    keys: ["contents", "title"],
  };

  // Build the index from the json file
  return new Fuse(data, options);
};

const executeSearch = (fuse, term) => {
  let results = fuse.search(term);
  let searchItems = "";

  if (results.length > 0) {
    // Only show first 5 results
    for (let i in results.slice(0, 5)) {
      searchItems += `
        <li>  
          <a href="${results[i]["item"].permalink}" tabindex="0">
            <span class="title">
              ${results[i]["item"].title}
            </span>
            <br />
            <em>
              ${results[i]["item"].contents}
            </em>
          </a>
        </li>
      `;
    }
  }  else {
    searchItems = "";
  }

  document.getElementById("searchResults").innerHTML = searchItems;
};

const data = fetchJSONFile("/index.json");
const fuse = loadSearch(data);

document.getElementById("searchInput").addEventListener("keyup", (event) => {
  if (event.isComposing || event.keyCode === 229) {
    return;
  }

  executeSearch(fuse, document.getElementById("searchInput").value);
});
