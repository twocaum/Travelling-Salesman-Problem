
const utils = new p5();
// creates characteristics for genes
class Encoder {
    constructor(gene_size, range_x, range_y) {
        if(gene_size > 26 || gene_size < 0) return null;
        
        var genes = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        var dict = {};
        this.gene_size = gene_size;

        let chain = genes.slice(0, gene_size);

        for(let i = 0; i < gene_size; i++) {
            let v = utils.createVector(
                utils.random(range_x[0], range_x[1]), 
                utils.random(range_y[0], range_y[1])); // 
             
            dict[genes[i]] = v;
        }
        this.chain = chain;
        this.dict = dict;
    }

    decode(gene) {
        return this.dict[gene];
    }

    random_chromossome() {
        return utils.shuffle(this.chain.split("")).join("");        
    }


    static crossover(chromossome1, chromossome2, mutation_rate) {
        let cross = Array.apply(null, Array(chromossome1.length)).map(function () {});
        let i = 0;
        let start = chromossome1[0];
        let char2 = chromossome2[0];

        cross[0] = start;

        while(char2 != start) {
            i = chromossome1.indexOf(char2);
            cross[i] = char2;
            char2 = chromossome2[i];
        }
        
        for(let i = 0; i < cross.length; i++) {
            if(!cross[i]) cross[i] = chromossome2[i];
        }

        if(Math.random() < mutation_rate) {
            return Encoder.mutate(cross.join(""));
        }

        return cross.join("");
    }

    static mutate(chromossome) {
        let genes = chromossome.split("");
        let n = utils.random(2, chromossome.length);
        let start = utils.random(chromossome.length - n + 1)
        
        let mutation = genes.slice(start, start + n).reverse();
        for(let i =0; i < n; i++) genes[start +i] = mutation[i];

        return genes.join("");
    }
}


class Individual {
    constructor(chromossome, translator) {
        this.chromossome = chromossome;
        var genotype = []
        
        for(const gene of chromossome) {
            genotype.push(translator.decode(gene));
        }
        
        this.translator = translator;
        this.genotype = genotype;
        this.fitness = Infinity;
    }

    evaluate() {
        var fitness = 0;
        var gene1 = this.genotype[this.genotype.length - 1];
        
        for(let gene2 of this.genotype) {
            fitness += utils.dist(gene1.x, gene1.y, gene2.x, gene2.y);
            gene1 = gene2;
        }
        this.fitness = fitness;
    }


    procriate(parent2, mutation_rate) {
        return Encoder.crossover(this.chromossome, parent2.chromossome, mutation_rate);
    }

}

class Population {
    constructor(individuals, translator) {
        this.individuals = individuals;
        this.translator = translator;
        this.fittest = [];
    }

    *list() {
        for(let individual of this.individuals) {
            yield individual;
        }
        return null;
    }

    evaluate() {
        for(let individual of this.individuals) {
            individual.evaluate();
        }
    }


    top_fit(sample_size) {
        this.fittest = ([...this.individuals].sort(function (individual1, individual2){
            if (individual1.fitness > individual2.fitness) 
                return -1;
	        
            return 1;
        })).slice(0, sample_size);
    }

    next_generation(mutation_rate) {
        let n = Math.floor(this.individuals.length / 2);
        this.top_fit(n);
        let parents = this.fittest;
        let children = [];

        for(let i = 0; i < n; i++) {
            let child1 = parents[i].procriate(parents[(i + 1) % n], mutation_rate);
            let child2 = parents[i].procriate(parents[(i + 2) % n], mutation_rate);

            children.push(child1);
            children.push(child2);
        }
        return children;
    }

    evolve(mutation_rate) {
        let children = this.next_generation(mutation_rate);
        let new_generation = []
        for(let child of children) {
            new_generation.push(new Individual(child, this.translator));
        }
        this.individuals = new_generation;
    }
}

export {Population, Encoder, Individual};