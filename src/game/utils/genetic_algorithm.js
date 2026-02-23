// Genetic Algorithm for Flappy Bird Neural Network

export function nextGeneration(savedBirds) {
    // Sort birds by score/tick (highest first)
    savedBirds.sort((a, b) => b.score - a.score || b.tick - a.tick);

    // Calculate fitness
    let sum = 0;
    for (let bird of savedBirds) {
        sum += bird.score;
    }
    for (let bird of savedBirds) {
        bird.fitness = sum === 0 ? 1 / savedBirds.length : bird.score / sum;
    }

    const nextGen = [];
    const populationSize = 30; // Assuming we keep 30 birds

    // Elitism: Keep best bird unchanged
    const bestBird = savedBirds[0];
    nextGen.push({
        w1: [...bestBird.w1],
        w2: [...bestBird.w2]
    });

    // Create rest of generation via crossover and mutation
    for (let i = 1; i < populationSize; i++) {
        let parentA = pickOne(savedBirds);
        let parentB = pickOne(savedBirds);

        let child = crossover(parentA, parentB);
        mutate(child, 0.1); // 10% mutation rate

        nextGen.push(child);
    }

    return nextGen;
}

function pickOne(savedBirds) {
    let index = 0;
    let r = Math.random();

    while (r > 0) {
        r = r - savedBirds[index].fitness;
        index++;
    }
    index--;
    return savedBirds[index];
}

function crossover(parentA, parentB) {
    let childW1 = [];
    let childW2 = [];

    for (let i = 0; i < parentA.w1.length; i++) {
        childW1.push(Math.random() < 0.5 ? parentA.w1[i] : parentB.w1[i]);
    }

    for (let i = 0; i < parentA.w2.length; i++) {
        childW2.push(Math.random() < 0.5 ? parentA.w2[i] : parentB.w2[i]);
    }

    return { w1: childW1, w2: childW2 };
}

function mutate(child, rate) {
    for (let i = 0; i < child.w1.length; i++) {
        if (Math.random() < rate) {
            child.w1[i] += Math.random() * 0.2 - 0.1; // Add small random value
        }
    }
    for (let i = 0; i < child.w2.length; i++) {
        if (Math.random() < rate) {
            child.w2[i] += Math.random() * 0.2 - 0.1;
        }
    }
}
