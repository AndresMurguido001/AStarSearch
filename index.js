// heuristics - educated guess allowing algorithm to skip possible solutions
// f(n) = g(n) + h(n)
let cols = 80;
let rows = 80;
let grid = new Array(cols);
let openSet = [];
let closedSet = []
let start, end;
let w, h;
var path;
let allowDiagonals = true;

function visualDist(a, b) {
	return dist(a.i, a.j, b.i, b.j);
}
 
function heuristic(a, b) {
	let d;
	if ( allowDiagonals ) {
		d = dist(a.i, a.j, b.i, b.j);
	} else {
	d = abs(a.i - b.i) + abs(a.j - b.j);
	}
	return d;
}


function Spot(i, j){
	// i and j are technically x and y coordinates. used to locate neighbors and place spot;
	this.i = i;
	this.j = j;
	this.f = 0;
	this.g = 0;
	this.h = 0;
	this.vh = 0; // visual heuristic
	this.neighbors = [];
	this.previous = undefined;
	this.wall = false;

	if(random(1) < 0.3) {
		this.wall = true;
	}

	this.show = function(colr){
		if (this.wall) {
			fill(0);
			noStroke();
			ellipse(this.i * w + w / 2, this.j * h + h/2, w-1, h-1);

			stroke(0);
			strokeWeight(w/2);
			// Lines between neighbors;
			this.neighbors.forEach(neighbor => {
				if (neighbor.wall && (
				(neighbor.i > this.i && neighbor.j == this.j) ||
					(neighbor.i == this.i && neighbor.j > this.j)
				)) {
					line(this.i * w + w/2, this.j * h + h/2, neighbor.i * w + w/2, neighbor.j * h + h / 2);
				}
			})
		} 
		
	}

	this.addNeighbors = function(grid) {
		if (this.i < cols - 1){  
			this.neighbors.push(grid[this.i + 1][this.j]);
		}
		if (this.i > 0){  
			this.neighbors.push(grid[this.i - 1][this.j]);
		}
		if (this.j < rows - 1){  
			this.neighbors.push(grid[this.i][this.j + 1]);
		}
		if (this.j > 0){  
			this.neighbors.push(grid[this.i][this.j - 1]);
		}
		if (allowDiagonals) {

			if(this.i > 0 && this.j > 0){
				this.neighbors.push(grid[this.i - 1][this.j - 1]);
			}

			if(this.i < cols - 1 && this.j > 0){
				this.neighbors.push(grid[this.i + 1][this.j - 1]);
			}
			if(this.i > 0 && this.j < rows - 1){
				this.neighbors.push(grid[this.i - 1][this.j + 1]);
			}
			if(this.i < cols - 1 && this.j < rows - 1){
				this.neighbors.push(grid[this.i + 1][this.j + 1]);
			}
		}
	}
}



 function setup() {
  	createCanvas(600, 600);
 	console.log("A*")
 	background(255);
 // used to make size of spots proportionate to canvas;
 	w = width / cols;
 	h = height / rows;
 	// Make 2D array;
 	for (let i = 0; i < cols; i++) {
 		grid[i] = new Array(rows);
 	}
 	// initialize Spot with point on 2D array;
 	for (let i = 0; i < cols; i++) {
 		for (let j = 0; j < rows; j++){
 			grid[i][j] = new Spot(i, j)
 		}
 	}
 
 	// Tell spot to keep track of its neighbors;
 	for (let i = 0; i < cols; i++) {
 		for (let j = 0; j < rows; j++){
 			grid[i][j].addNeighbors(grid);
 		}
 	}
 
 	start = grid[0][0]
 	end = grid[cols - 1][rows - 1];
 	start.wall = false;
 	end.wall = false;
 	openSet.push(start);
 }



function draw(){
// if open set is out of points, we have reached the end. TODO: account for posibility of no solution;
	if(openSet.length > 0) {
		// keep going
		// search for lowest f in openSet array. This will be the best next point;
		// the lowst F between the possible points(openSet) will be the best possible option. Calculated by adding Spot.g + Spot.h -> (heuristic);
		var lowest = 0;
		for (var i = 0; i < openSet.length; i++) {
			if(openSet[i].f < openSet[lowest].f){
				lowest = i
			}
			if (openSet[i].f == openSet[lowest].f) {
				if (allowDiagonals) {
					if (openSet[i].g > openSet[lowest].g) {
						lowest = i;
					}
				}
			}
		}
		var current = openSet[lowest];
	
		if (current === end) {
			// Draw out path;
			// Draw path of shortest distance;
			current.show(color(0, 0, 255));
			noLoop();
			let overlay = document.createElement('div');
			overlay.setAttribute("style","position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5);");
			let doneBox = document.createElement('div')
			doneBox.appendChild(document.createTextNode("Search complete!"))
			doneBox.setAttribute("style", "font-size: 30px; position: absolute; top: 25%; left: 20%; background-color: #fff; padding: 20px; border-radius: 15px; z-index: 10;");
			overlay.appendChild(doneBox);
			document.body.appendChild(overlay);
			return;
		}
		// if this doesnt work, create removeArray function to loop through and check if current === openSet[i];
		openSet.splice(lowest, 1)
		closedSet.push(current);
		
		var neighbors = current.neighbors;
		neighbors.forEach(neighbor => {
			if (!closedSet.includes(neighbor) && !neighbor.wall){
				// Need to check to make sure we havent come across this neighbor with better g score;
				let temp = current.g + heuristic(neighbor, current);
				let newPath = false;
				// If we have come across this neighbor before...
				if (openSet.includes(neighbor)){
					// Check if the g score is better than the new g score(better === lower);
					if (temp < neighbor.g) {
						neighbor.g = temp;
						newPath = true;
					}
				} else {
					// If we have never come across it, add 1 to current g, denoting distance and add to open set;
					neighbor.g = temp;
					newPath = true;
					openSet.push(neighbor);
				}
				if (newPath) {  
					neighbor.h = heuristic(neighbor, end);
					neighbor.vh = visualDist(neighbor, end)
					neighbor.f = neighbor.g + neighbor.h;
					neighbor.previous = current;
				}
			}

	})
			
	
		
	} else {
		// stop - nothing left in open set
		console.log("NO SOLUTION");
		noLoop();
		return;
	}

	

	for (var i = 0; i < cols; i++) {
		for (var j = 0; j < rows; j++) {
			grid[i][j].show(color(255));
		}
	}
 // make closed set points red. Closed set points have already been evaluated by algorithm.
// 	 for (var i = 0; i < closedSet.length; i++) {
// 		closedSet[i].show(color(255, 0, 0))
// 	 }
// 	  // make open set points green. Open set points have yet to be evaluated as best possible solution.
// 	 for (var i = 0; i < openSet.length; i++) {
// 		openSet[i].show(color(0, 255, 0));
// 	 }



	  // Find the path
	  path = [];
	  var temp = current;
	if (temp === end) {
		console.log("TEMP: ", temp);
	}
	  path.push(temp);
	  while (temp.previous) {
	    path.push(temp.previous);
	    temp = temp.previous;
	  }
	noFill();
	stroke(255, 0, 255);
	strokeWeight(w / 2);
	beginShape();
 	for (var i = 0; i < path.length; i++) {
		let curPoint = path[i];
 		vertex(curPoint.i * w + w/2, curPoint.j * h + h/2);
 	}
	endShape()
		
}
