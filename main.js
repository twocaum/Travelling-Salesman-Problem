import { Population, Individual, Encoder} from "./genome.js";

var cities = null;
var paths = null;
var path_list = null;
var generation_count = 0;
var individual_count = 1;
var best_path = null;
var best_score = Infinity;

const total_cities = 7;
const total_paths = 100;
const offset = 9;
const offset_top = 55;
const mutation_rate = 0.3;

var sketch = new p5(function(p5) {
    p5.setup = function() {
        p5.createCanvas(800, 500);
        p5.frameRate(10);
        let range_x = [offset, p5.width - offset];
        let range_y = [offset_top, p5.height - offset];
        cities = new Cities(total_cities, range_x, range_y, p5);
        paths = new Paths(total_paths, cities, p5);
        initialize_list();
    }
  
    p5.draw = function() {
        p5.background(0);
        draw_cities();
        next_batch();
        draw_next_path();
        draw_best_path();
        draw_info();
    }
  });
  



class Cities extends Encoder{
    constructor(n_cities, range_x, range_y, canvas) {
        super(n_cities, range_x, range_y);
        this.canvas = canvas;
    }
    
    draw() {
        for(const [label, city] of Object.entries(this.dict)) {
            this.canvas.square(city.x, city.y, offset);
            this.canvas.text(label, city.x - offset, city.y + offset);
          }
    }
}

class Path extends Individual {
    constructor(route, translator, canvas) {
        super(route, translator);
        this.canvas = canvas;
    }

    draw() {
        this.canvas.noFill();
        this.canvas.beginShape();

        for(const city of this.genotype) {
            this.canvas.vertex(city.x, city.y);
        }

        this.canvas.vertex(this.genotype[0].x, this.genotype[0].y);
        this.canvas.endShape();
    }
}

class Paths extends Population {
    constructor(n, translator, canvas) {
        let paths = [];

        for(let i = 0; i < n; i++) {
            let route = translator.random_chromossome();
            let new_path = new Path(route, translator, canvas);
            paths.push(new_path);
        }
        super(paths, translator);
        this.canvas = canvas;
    }

    evolve(mutation_rate) {
        let children = this.next_generation(mutation_rate);
        let new_generation = []
        for(let child of children) {
            new_generation.push(new Path(child, this.translator, this.canvas));
        }
        this.individuals = new_generation;
    }
}


function initialize_list() {
    paths.evaluate();
    path_list = paths.list();
}

function next_batch() {
    var curr_path = path_list.next().value;
    if(curr_path == null) {
        paths.evolve(mutation_rate);
        initialize_list();
        curr_path = path_list.next().value;
        generation_count += 1;
        individual_count = 0;
    }

    individual_count += 1;

    if(curr_path.fitness < best_score) {
        best_path = curr_path;
        best_score = curr_path.fitness;
    } 

    return curr_path;
}



function draw_cities() {
    sketch.fill('white');
    cities.draw();
}

function draw_next_path() {
    let path = next_batch();
    sketch.stroke(255);
    sketch.strokeWeight(1);
    path.draw();
}

function draw_best_path() {
    sketch.stroke('aqua');
    sketch.strokeWeight(2);
    best_path.draw();
}

function draw_info() {
    sketch.fill('white');
    sketch.stroke(1);
    sketch.text("Generation:" + generation_count, 0, 10);
    sketch.text("Indivíduo:" + individual_count, 0, 25);
    sketch.text("Melhor Caminho: " + best_path.chromossome, 0, 40);
    sketch.text("Melhor Score: " + best_score, 0, 55);
}