function neural_network(x1,x2,w1,w2){
	this.w1 = math.matrix(w1);
	this.w2 = math.matrix(w2);
	
	this.w1 = this.w1.reshape([6,3]);
	this.w2 = this.w2.reshape([1,6]);
	this.x = math.matrix([[1],[x1],[x2]]);
	
	this.a1 = math.multiply(this.w1,this.x);
	this.h1 = sigmoid(this.a1);
	
	this.a2 = math.multiply(this.w2,this.a1);
	this.out = sigmoid(this.a2);
	
	return this.out;
	
}

function sigm(X1){
	return 1.0/(1.0 + Math.exp(-X1));
}

function sigmoid(X){
	X = math.matrix(X);
	return X.map(sigm);
}

