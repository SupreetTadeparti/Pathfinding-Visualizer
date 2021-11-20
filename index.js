const visualizer = document.querySelector(".visualizer");
const nodeTypes = document.querySelectorAll(".node");
const startBtn = document.querySelector(".start-btn");
const clearBtn = document.querySelector(".clear-btn");
const clearWallsBtn = document.querySelector(".clear-walls-btn");
const resetBtn = document.querySelector(".reset-btn");
const algorithms = document.querySelectorAll(".algorithm");
const algorithmSpan = document
  .querySelector(".algorithms__heading")
  .querySelector("span");
const distances = document.querySelectorAll(".distance");
const distanceSpan = document
  .querySelector(".distances__heading")
  .querySelector("span");
const visualizerRows = 21;
const visualizerColumns = 50;
const messagesDiv = document.querySelector(".messages");
const navbarToggle = document.querySelector(".navbar-toggle__icon");
let selectedAlgorithm = "A*";
let selectedDistance = "Manhattan";
let activeNodeType = "Start";
let startNode = null;
let endNode = null;
let routeNodes = [];
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
      row.appendChild(col);
    }
    visualizer.appendChild(row);
  }
}

function getNodesAround(row, col) {
  return [
    document.querySelector(
      `[row="${parseInt(row) - 1}"][col="${parseInt(col)}"]`
    ),
    document.querySelector(
      `[row="${parseInt(row)}"][col="${parseInt(col) - 1}"]`
    ),
    document.querySelector(
      `[row="${parseInt(row)}"][col="${parseInt(col) + 1}"]`
    ),
    document.querySelector(
      `[row="${parseInt(row) + 1}"][col="${parseInt(col)}"]`
    ),
  ];
}

function distanceBetween(a, b) {
  return (
    Math.abs(a.getAttribute("col") - b.getAttribute("col")) +
    Math.abs(a.getAttribute("row") - b.getAttribute("row"))
  );
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

async function drawShortestPath(current) {
  currentKey = getKey(current);
  while (successorObject.hasOwnProperty(currentKey)) {
    current = successorObject[currentKey];
    currentKey = getKey(current);
    if (current === startNode) break;
    current.style.backgroundColor = "purple";
    await sleep(10);
  }
}

async function aStar() {
  let open = [];
  let closed = [];
  
  startNode.setAttribute('gX', 0);
  startNode.setAttribute('fX', manhattanDistance(startNode, endNode));

  open.push(startNode);

  while (open.length > 0) {
    
    let leastFX = Infinity;
    let currentNode = null;

    // get node with lowest fx in open list
    for (const node of open) {
      let hX = manhattanDistance(node, endNode);
      let fX = parseInt(node.getAttribute('gX') + hX);
      if (fX < leastFX) {
        leastFX = fX;
        currentNode = node;
      }
    }

    if (currentNode === endNode) {
      break;
    }

    currentNode.style.backgroundColor = 'orange';

    let nodesAround = getNodesAround(currentNode.getAttribute('row'), currentNode.getAttribute('col'));

    for (const node of nodesAround) {

      if (node === null) continue;

      let gX = parseInt(currentNode.getAttribute('gX')) + 1;

      if (open.includes(node)) {
        if (parseInt(node.getAttribute('gX')) <= gX) continue;
      } else if (closed.includes(node)) {
        if (parseInt(node.getAttribute('gX')) <= gX) continue;
        open = open.filter(el => el != node);
        closed.push(node);
      } else {
        open.push(node);
        node.setAttribute('hX', manhattanDistance(node, endNode));
      }
      node.setAttribute('gX', gX);
      successorObject[node.getAttribute('row') + ' ' + node.getAttribute('col')] = currentNode;
    }
    closed.push(currentNode);

    await sleep();
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
  clearBtn.click();
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
    }
  }
});

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

clearWallsBtn.addEventListener("click", function () {
  for (const el of visualizer.querySelectorAll(".col")) {
    if (el.style.backgroundColor === "gray") {
      el.style.backgroundColor = "white";
    }
  }
});

resetBtn.addEventListener("click", function () {
  for (const el of visualizer.querySelectorAll(".col")) {
    el.style.backgroundColor = "white";
  }
  startNode = null;
  endNode = null;
  successorObject = {};
});

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
