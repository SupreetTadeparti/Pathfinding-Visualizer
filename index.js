const visualizer = document.querySelector(".visualizer");
const nodeTypes = document.querySelectorAll(".node");
const startBtn = document.querySelector(".start-btn");
const clearBtn = document.querySelector(".clear-btn");
const clearWallsBtn = document.querySelector(".clear-walls-btn");
const resetBtn = document.querySelector(".reset-btn");
const algorithms = document.querySelectorAll(".algorithm");
// const algorithmsDiv = document.querySelector(".algorithms");
const algorithmSpan = document
  .querySelector(".algorithms__heading")
  .querySelector("span");
// const algorithmDropdown = document.querySelector(".algorithms__dropdown");
// const algorithmDropdownArrow = document.querySelector(
//   ".algorithms__heading__arrow"
// );
const distances = document.querySelectorAll(".distance");
const distanceSpan = document
  .querySelector(".distances__heading")
  .querySelector("span");
const visualizerRows = 21;
const visualizerColumns = 50;
const messagesDiv = document.querySelector(".messages");
const navbarToggle = document.querySelector(".navbar-toggle__icon");
let selectedAlgorithm = "A* Search";
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

async function aStar(currNode, open, closed) {
  for (const node of getNodesAround(
    currNode.getAttribute("row"),
    currNode.getAttribute("col")
  )) {
    if (node != null) {
      if (!closed.includes(node)) {
        open.push(node);
      }
      let nodeKey = node.getAttribute("row") + " " + node.getAttribute("col");
      if (!(nodeKey in successorObject)) {
        successorObject[nodeKey] = currNode;
      }
    }
  }

  open = open.filter(
    (el) => !closed.includes(el) && el.style.backgroundColor != "gray"
  );

  let leastFX = 100000;
  let leastGX = 100000;
  optimalNode = null;

  for (const node of open) {
    if (node != startNode && node != endNode) {
      node.style.backgroundColor = "#4FFFB0";
    }
    let gX, hX;
    if (selectedDistance === "Manhattan") {
      gX = manhattanDistance(node, startNode);
      hX = manhattanDistance(node, endNode);
    } else if (selectedDistance === "Euclidean") {
      gX = euclideanDistance(node, startNode);
      hX = euclideanDistance(node, endNode);
    }
    let fX = gX + hX;
    if (fX < leastFX) {
      leastFX = fX;
      optimalNode = node;
    } else if (fX === leastFX) {
      if (gX < leastGX) {
        optimalNode = node;
        leastGX = gX;
      }
    }
  }

  await sleep(10);

  if (optimalNode === null) return -1;

  if (optimalNode !== startNode && optimalNode !== endNode)
    optimalNode.style.backgroundColor = "orange";

  closed.push(optimalNode);

  if (optimalNode === endNode) {
    drawShortestPath(endNode);
    return;
  }

  return aStar(optimalNode, open, closed);
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
    if (selectedAlgorithm === "A* Search") {
      if (startNode === null || endNode === null) {
        createMessage("Please place the start node and end node");
      } else {
        let open = [];
        let closed = [];

        if ((await aStar(startNode, open, closed)) === -1) {
          createMessage("Cannot find a route, please remove some walls");
        }
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
