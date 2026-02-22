import * as math from 'mathjs'

function neural_network(x1, x2, w1, w2) {
    let w1_matrix = math.matrix(w1);
    let w2_matrix = math.matrix(w2);

    w1_matrix = w1_matrix.reshape([6, 3]);
    w2_matrix = w2_matrix.reshape([1, 6]);
    let x_matrix = math.matrix([[1], [x1], [x2]]);

    let a1 = math.multiply(w1_matrix, x_matrix);
    let h1 = sigmoid(a1);

    let a2 = math.multiply(w2_matrix, h1);
    let out = sigmoid(a2);

    return out;
}

function sigm(X1){
	return 1.0/(1.0 + Math.exp(-X1));
}

function sigmoid(X){
	X = math.matrix(X);
	return X.map(sigm);
}

export default neural_network;

