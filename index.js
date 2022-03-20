const visualizer = document.querySelector(".visualizer");
const nodeTypes = document.querySelectorAll(".node");
const startBtn = document.querySelector(".start-btn");
const clearBtns = document.querySelectorAll(".clear-btn");
const clearWallsBtns = document.querySelectorAll(".clear-walls-btn");
const resetBtns = document.querySelectorAll(".reset-btn");
const algorithms = document.querySelectorAll(".algorithm");
const algorithmSpan = document
  .querySelector(".algorithms__heading")
  .querySelector("span");
const distances = document.querySelectorAll(".distance");
const distanceSpan = document
  .querySelector(".distances__heading")
  .querySelector("span");
const visualizerRows = 20;
const visualizerColumns = document.body.offsetWidth / 25;
const messagesDiv = document.querySelector(".messages");
const navbarToggle = document.querySelector(".navbar-toggle__icon");
const cols = [];
let selectedAlgorithm = "A*";
let selectedDistance = "Manhattan";
let activeNodeType = "Start";
let startNode = null;
let endNode = null;
let running = false;
let successorObject = {};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function loadGrid() {
  visualizer.innerHTML = "";

  for (let i = 0; i < visualizerRows; i++) {
    let row = document.createElement("tr");
    row.classList.add("row");
    for (let j = 0; j < visualizerColumns; j++) {
      let col = document.createElement("td");
      col.classList.add("col");
      col.style.backgroundColor = "white";
      col.setAttribute("row", i);
      col.setAttribute("col", j);
      col.addEventListener("mouseover", function () {
        if (activeNodeType === "Wall") {
          if (mouseDown) {
            if (this.style.backgroundColor === "white") {
              this.style.backgroundColor = "gray";
            } else if (this.style.backgroundColor === "gray") {
              this.style.backgroundColor = "white";
            }
          }
        }
      });
      col.addEventListener("click", function () {
        if (activeNodeType === "Wall") {
          if (this.style.backgroundColor === "white") {
            this.style.backgroundColor = "gray";
          } else if (this.style.backgroundColor === "gray") {
            this.style.backgroundColor = "white";
          }
        } else if (activeNodeType === "Start") {
          if (startNode != null) {
            startNode.style.backgroundColor = "white";
          }
          startNode = this;
          this.style.backgroundColor = "green";
        } else if (activeNodeType === "End") {
          if (endNode != null) {
            endNode.style.backgroundColor = "white";
          }
          endNode = this;
          this.style.backgroundColor = "red";
        }
      });
      cols.push(col);
      row.appendChild(col);
    }
    visualizer.appendChild(row);
  }
}

function getAdjacentNodes(node) {
  return [
    visualizer.querySelector(
      `[row="${parseInt(node.getAttribute("row")) - 1}"][col="${parseInt(
        node.getAttribute("col")
      )}"]`
    ),
    visualizer.querySelector(
      `[row="${parseInt(node.getAttribute("row"))}"][col="${
        parseInt(node.getAttribute("col")) - 1
      }"]`
    ),
    visualizer.querySelector(
      `[row="${parseInt(node.getAttribute("row"))}"][col="${
        parseInt(node.getAttribute("col")) + 1
      }"]`
    ),
    visualizer.querySelector(
      `[row="${parseInt(node.getAttribute("row")) + 1}"][col="${parseInt(
        node.getAttribute("col")
      )}"]`
    ),
  ];
}

function euclideanDistance(a, b) {
  return Math.sqrt(
    Math.pow(a.getAttribute("row") - b.getAttribute("row"), 2) +
      Math.pow(a.getAttribute("col") - b.getAttribute("col"), 2)
  );
}

function manhattanDistance(a, b) {
  return (
    Math.abs(a.getAttribute("col") - b.getAttribute("col")) +
    Math.abs(a.getAttribute("row") - b.getAttribute("row"))
  );
}

function getKey(node) {
  return node.getAttribute("row") + " " + node.getAttribute("col");
}

async function aStar() {
  let open = [];
  let closed = [];

  let startNodeGX = 0;
  let startNodeHX = manhattanDistance(startNode, endNode);
  let startNodeFX = startNodeGX + startNodeHX;

  startNode.setAttribute("gX", startNodeGX);
  startNode.setAttribute("hX", startNodeHX);
  startNode.setAttribute("fX", startNodeFX);

  open.push(startNode);

  let currentNode;

  while (open.length > 0) {
    let leastFX = Infinity;
    currentNode = null;

    // get node with lowest fx in open list
    for (const node of open) {
      let fX =
        parseInt(node.getAttribute("gX")) + parseInt(node.getAttribute("hX"));
      if (fX < leastFX) {
        leastFX = fX;
        currentNode = node;
      } else if (fX === leastFX) {
        if (
          parseInt(node.getAttribute("gX")) >
          parseInt(currentNode.getAttribute("gX"))
        ) {
          leastFX = fX;
          currentNode = node;
        }
      }
    }

    if (currentNode === endNode) {
      break;
    }

    let nodesAround = getAdjacentNodes(currentNode);

    for (const node of nodesAround) {
      if (node === null || node.style.backgroundColor === "gray") continue;

      let gX = parseInt(currentNode.getAttribute("gX")) + 1;

      if (open.includes(node)) {
        if (parseInt(node.getAttribute("gX")) <= gX) continue;
      } else if (closed.includes(node)) {
        if (parseInt(node.getAttribute("gX")) <= gX) continue;
        closed = closed.filter((el) => el != node);
        open.push(node);
      } else {
        open.push(node);
        if (selectedDistance === "Manhattan") {
          node.setAttribute("hX", manhattanDistance(node, endNode));
        } else if (selectedDistance === "Euclidean") {
          node.setAttribute("hX", euclideanDistance(node, endNode));
        }
      }

      if (node !== endNode && node.style.backgroundColor != "gray") {
        node.style.backgroundColor = "#4FFFB0";
      }

      node.setAttribute("gX", gX);
      successorObject[getKey(node)] = currentNode;
    }

    open = open.filter((el) => el !== currentNode);
    closed.push(currentNode);

    if (currentNode !== startNode) {
      currentNode.style.backgroundColor = "orange";
    }

    await sleep();
  }

  if (currentNode !== endNode) {
    return -1;
  }

  let routeNodes = [];

  while (true) {
    currentNode = successorObject[getKey(currentNode)];
    if (currentNode === startNode) break;
    routeNodes.push(currentNode);
  }

  for (const node of routeNodes.reverse()) {
    node.style.backgroundColor = "purple";
    await sleep(10);
  }
}

async function dijkstra() {
  for (const node of visualizer.querySelectorAll(".col")) {
    node.setAttribute("distance", Infinity);
    node.setAttribute("unexplored", true);
    successorObject[node.getAttribute("row") + " " + node.getAttribute("col")] =
      null;
  }

  startNode.setAttribute("distance", 0);

  let finalNode = endNode;

  mainloop: while (true) {
    let v = null;
    let vDist = Infinity;
    for (const node of visualizer.querySelectorAll(".col")) {
      if (node.getAttribute("unexplored") === "false") continue;
      if (parseInt(node.getAttribute("distance")) < vDist) {
        vDist = node.getAttribute("distance");
        v = node;
      }
    }

    if (v === null) {
      return -1;
    }

    if (v !== startNode) v.style.backgroundColor = "orange";
    v.setAttribute("unexplored", false);

    for (const node of getAdjacentNodes(v).filter(
      (el) => el !== null && el.style.backgroundColor !== "gray"
    )) {
      if (
        successorObject[
          node.getAttribute("row") + " " + node.getAttribute("col")
        ] === null ||
        parseInt(node.getAttribute("distance")) >
          parseInt(v.getAttribute("distance")) + 1
      ) {
        node.setAttribute("distance", parseInt(v.getAttribute("distance")) + 1);
        successorObject[
          node.getAttribute("row") + " " + node.getAttribute("col")
        ] = v;
      }

      if (node === endNode) break mainloop;

      if (node.style.backgroundColor !== "orange" && node !== startNode) {
        node.style.backgroundColor = "#4FFFB0";
      }
    }

    await sleep();
  }

  let shortestRoute = [];

  while (finalNode !== startNode) {
    if (finalNode !== endNode) shortestRoute.push(finalNode);
    finalNode =
      successorObject[
        finalNode.getAttribute("row") + " " + finalNode.getAttribute("col")
      ];
  }

  for (const node of shortestRoute.reverse()) {
    node.style.backgroundColor = "purple";
    await sleep(10);
  }
}

function createMessage(msg) {
  let message = document.createElement("div");
  message.classList.add("message");
  message.textContent = msg;
  messagesDiv.appendChild(message);
  setTimeout(function () {
    messagesDiv.removeChild(message);
  }, 7500);
}

startBtn.addEventListener("click", async function () {
  clearBtns[0].click();
  if (selectedAlgorithm === null) {
    if (messagesDiv.children.length > 0) {
      messagesDiv.children[0].classList.add("message-wiggle");
      setTimeout(function () {
        messagesDiv.children[0].classList.remove("message-wiggle");
      }, 250);
    } else {
      createMessage("Please select an algorithm");
    }
  } else {
    if (startNode === null || endNode === null) {
      createMessage("Please place the start node and end node");
      return;
    }
    if (selectedAlgorithm === "A*") {
      if ((await aStar()) === -1) {
        createMessage("Cannot find a route, please remove some walls");
      }
    } else if (selectedAlgorithm === "Dijkstra") {
      if ((await dijkstra()) === -1) {
        createMessage("Cannot find a route, please remove some walls");
      }
    } else if (selectedAlgorithm === "Bellman Ford") {
      if ((await bellmanFord()) === -1) {
        createMessage("Cannot find a route, please remove some walls");
      }
    }
  }
});

for (const clearBtn of clearBtns) {
  clearBtn.addEventListener("click", function () {
    for (const el of visualizer.querySelectorAll(".col")) {
      if (
        el.style.backgroundColor === "orange" ||
        el.style.backgroundColor === "rgb(79, 255, 176)" ||
        el.style.backgroundColor === "purple"
      ) {
        el.style.backgroundColor = "white";
      }
    }
    successorObject = {};
  });
}

for (const clearWallsBtn of clearWallsBtns) {
  clearWallsBtn.addEventListener("click", function () {
    for (const el of visualizer.querySelectorAll(".col")) {
      if (el.style.backgroundColor === "gray") {
        el.style.backgroundColor = "white";
      }
    }
  });
}

for (const resetBtn of resetBtns) {
  resetBtn.addEventListener("click", function () {
    for (const el of visualizer.querySelectorAll(".col")) {
      el.style.backgroundColor = "white";
    }
    startNode = null;
    endNode = null;
    successorObject = {};
  });
}

for (const algorithm of algorithms) {
  algorithm.addEventListener("click", function () {
    selectedAlgorithm = this.textContent;
    for (const al of algorithms) {
      al.classList.remove("active");
    }
    this.classList.add("active");
    algorithmSpan.textContent = this.textContent;
  });
}

for (const distance of distances) {
  distance.addEventListener("click", function () {
    selectedDistance = this.textContent;
    for (const di of distances) {
      di.classList.remove("active");
    }
    this.classList.add("active");
    distanceSpan.textContent = this.textContent;
  });
}

for (const node of nodeTypes) {
  node.addEventListener("click", function () {
    for (const nd of nodeTypes) {
      nd.classList.remove("active");
      this.classList.add("active");

      if (this.classList.contains("wall-node")) {
        activeNodeType = "Wall";
      } else if (this.classList.contains("start-node")) {
        activeNodeType = "Start";
      } else if (this.classList.contains("end-node")) {
        activeNodeType = "End";
      }
    }
  });
}

function setLeftButtonState(e) {
  mouseDown = e.buttons === undefined ? e.which === 1 : e.buttons === 1;
}

let mouseDown = false;

document.body.onmousedown = setLeftButtonState;
document.body.onmousemove = setLeftButtonState;
document.body.onmouseup = setLeftButtonState;

loadGrid();
