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

let data = fetchJSONFile("/graph-data.json");

// cross-link node objects
data.links.forEach((link) => {
  const a = data.nodes.filter(function (node) {
    return node.id == link.source;
  })[0];

  const b = data.nodes.filter(function (node) {
    return node.id == link.target;
  })[0];

  !a.neighbors && (a.neighbors = []);
  !b.neighbors && (b.neighbors = []);
  a.neighbors.push(b);
  b.neighbors.push(a);

  !a.links && (a.links = []);
  !b.links && (b.links = []);
  a.links.push(link);
  b.links.push(link);
});

const elem = document.getElementById("graph");
const NODE_R = 8;
const highlightNodes = new Set();
const highlightLinks = new Set();
let hoverNode = null;
const width = document.getElementsByClassName("content")[0].clientWidth;
const post_title = document.getElementsByClassName("post-title")[0];

const Graph = ForceGraph()(elem)
  .graphData(data)
  .width(width)
  .height(300)
  .nodeLabel("id")
  .nodeAutoColorBy("group")
  .nodeVal("node_size")
  .onNodeClick((node) => {
    // Center/zoom on node
    Graph.centerAt(node.x, node.y, 1000);
    Graph.zoom(3, 2000);
  })
  .nodeRelSize(NODE_R)
  .onNodeHover(node => {
    highlightNodes.clear();
    highlightLinks.clear();
    if (node) {
      highlightNodes.add(node);
      node.neighbors.forEach(neighbor => highlightNodes.add(neighbor));
      node.links.forEach(link => highlightLinks.add(link));
    }

    hoverNode = node || null;
  })
  .onLinkHover(link => {
    highlightNodes.clear();
    highlightLinks.clear();

    if (link) {
      highlightLinks.add(link);
      highlightNodes.add(link.source);
      highlightNodes.add(link.target);
    }
  })
  .autoPauseRedraw(false) // keep redrawing after engine has stopped
  .linkWidth((link) => (highlightLinks.has(link) ? 5 : 1))
  .linkDirectionalParticles(2)
  .linkDirectionalParticleWidth((link) => (highlightLinks.has(link) ? 4 : 2))
  .linkColor(() => "rgba(255,255,255,0.2)")
  .nodeCanvasObjectMode((node) =>
    highlightNodes.has(node) ? "before" : undefined
  )
  .nodeCanvasObject((node, ctx) => {
    // add ring just for highlighted nodes
    const min_node_size = 0.1;
    const max_node_size = 1;

    const min_graph_size = NODE_R * 0.5;
    const max_graph_size = NODE_R * 1.4;

    // Scale value from one the node sizes from Python to the
    // range dictated by forcegraph
    let node_size =
      ((node.node_size - min_node_size) / (max_node_size - min_node_size)) *
        (max_graph_size - min_graph_size) +
      min_graph_size;

    ctx.beginPath();
    ctx.arc(node.x, node.y, node_size, 0, 2 * Math.PI, false);
    ctx.fillStyle = node === hoverNode ? "red" : "orange";
    ctx.fill();
  });

  if (post_title) {
    const title_node = data.nodes.filter(function (node) {
      return node.id == post_title.textContent.trim();
    })[0]

    if (title_node) {
      highlightNodes.clear();
      highlightLinks.clear();
      highlightNodes.add(title_node);
      title_node.neighbors.forEach(neighbor => highlightNodes.add(neighbor));
      title_node.links.forEach(link => highlightLinks.add(link));
  
      hoverNode = title_node || null;
    }
  }
