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
    // location: 0,
    // distance: 100,
    ignoreLocation: true,
    threshold: 0.1,
    minMatchCharLength: 2,
    keys: [
      {
        name: "contents",
        weight: 1,
      },
      {
        name: "title",
        weight: 2,
      },
      {
        name: "section",
        weight: 1,
      },
      {
        name: "zettelcastenIndex",
        weight: 2
      }
    ],
  };

  // Build the index from the json file
  return new Fuse(data, options);
};

const executeSearch = (fuse, term) => {
  let results = fuse.search(term);
  let searchItems = "";
  let existingLinks = [];

  if (results.length > 0) {
    // Only show first 10 results
    for (let i in results) {
      // Only include a search item if the link isn't already included
      if (existingLinks.includes(results[i]["item"].permalink)) {
        continue;
      }

      searchItems += `
        <a href="${results[i]["item"].permalink}">
          <li>
            <span class="title">${results[i]["item"].title}</span>
            <span class="section"><em>${results[i]["item"].section}</em></span>
            <span class="content">${results[i]["item"].contents}</span>
          </li>
        </a>
        `;
        existingLinks.push(results[i]["item"].permalink);
    }
  } else {
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

document.getElementById("searchInput").addEventListener("keydown", (event) => {
  if (event.isComposing || event.keyCode === 229) {
    return;
  }

  if (event.keyCode == 27) {
    document.getElementById("searchInput").value = "";
  }
});

document.addEventListener("click", (event) => {
  if (
    !(event.target == document.getElementById("searchInput")) &
    !(event.target == document.getElementById("searchResults"))
  ) {
    document.getElementById("searchResults").style.visibility = "hidden";
  } else {
    document.getElementById("searchResults").style.visibility = "visible";
  }
});
