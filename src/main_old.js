var canvas = document.getElementById("myCanvas");
var c=canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


function Pillars(xpos, ypos,length,speed,gap){
    this.ypos = ypos;
    this.xpos = xpos;
    this.length = length;
    this.speed = speed;
    this.width = 150;
    this.gap = gap;
    this.draw = function(){
        c.save();
        c.fillStyle = '#3DE80E';
        c.fillRect(this.xpos,this.ypos,this.width,this.length);
        c.fillStyle = '#6FFFD8';
        c.fillRect(this.xpos+5,this.ypos+5,this.width - 10,this.length-10);
        c.restore();
    }
    this.update = function(){
        
        this.xpos-=this.speed;
        this.draw();   
    }
}

function Cloud(x,y,width,speed){
	this.cloud_img = document.getElementById("cloud");
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = 0.6 * this.width;
	this.speed = speed;
	this.draw = function(){
		c.drawImage(this.cloud_img,this.x,this.y,this.width,this.height);
	}
	this.update = function(){
		this.x -=speed/2;
		this.draw();
		
	}
	
}

function flap(bird){
    bird.velocity = -12;
}

window.addEventListener('keydown',function(event){
    if(event.keyCode==32){
        birds.forEach(function(bird){
            flap(bird);
        });
    }
        
});

function rgba_val(){
	var r = Math.round(Math.random()*255);
	var g = Math.round(Math.random()*255);
	var b = Math.round(Math.random()*255);
	var str = 'rgba('+r+','+g+','+b+')';
	return str;
}

function Bird(){
    this.y = canvas.height/2;
    this.x = canvas.width/6;
    this.radius = 25;
    this.gravity = 1;
    this.velocity = 0;
    this.fps = 2;
    this.frame = 0;
    this.score = 0;
    this.tick = 0;
    this.x1 = 0;
    this.x2 = 0;
	this.w1 = [];
	this.w2 = [];
	this.color = rgba_val();
	for(var i = 0;i<18;i++)
		this.w1.push(Math.random()*2-1);
	
	for(var i = 0;i<6;i++)
		this.w2.push(Math.random()*2-1);
	
	
	
    this.draw = function(){
        c.beginPath();
        c.arc(this.x, this.y,this.radius,0, Math.PI*2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    this.update = function(pipes){
        this.draw();
        if((this.y+this.velocity+this.radius)>=canvas.height){
            this.velocity=0;
        }
        if(this.frame%this.fps == 0){
            this.y+=this.velocity;
            this.velocity+=this.gravity;
        }
        
        for(var i = 0; i< pipes.length;i++){
            let pipe = pipes[i];
            if(this.x < pipe.xpos + pipe.width){
                this.x1 = pipe.xpos + pipe.width - this.x;
                if(pipe.ypos<=0){
                    this.x2 = this.y - (pipe.ypos + pipe.length + pipe.gap/2);
                }else{
                    this.x2 =  pipe.ypos + pipe.gap/2 - this.y;                        
                }
                break;
            }
        }
		
        this.frame+=(1)%this.fps*1000;
        this.tick+=1;
        if(this.tick%20==0)
            this.score +=1;
    }
}


 

let pipes;
let bird_count;
let birds;

let clouds;

function generatePillars(){
    let top_length = Math.round(Math.random()*canvas.height/2 + 100);
    let gap = Math.round(Math.random()*40 + 180 );
    let bottom_length = canvas.height-gap-top_length;
    let returnVal = {};
    returnVal.top = new Pillars(canvas.width ,-5,top_length,10,gap);
    returnVal.bottom = new Pillars(canvas.width,canvas.height+5-bottom_length,bottom_length,10,gap);
    return returnVal;
}



function init(){
    birds = [];
    pipes = [];
	clouds = [];
    var bird_count = 30;
    for(var i =0;i<bird_count;i++){
        birds.push(new Bird());
    }

}


setInterval(function(){
    let pipeSet = generatePillars();
    pipes.push(pipeSet.top,pipeSet.bottom);
},1000);

setInterval(function(){
	let y = Math.random()*400 + 50;
	let width = Math.random()*300 +100;
    let cloudSet = new Cloud(canvas.width,y,width,8);
    clouds.push(cloudSet);
},1500);

function animate(){
    let collision = false;
    
    requestAnimationFrame(animate);
    c.save();
	c.fillStyle = "#1FD8FF";
    c.fillRect(0,0,canvas.width,canvas.height);
    c.restore();

	clouds.forEach(function(cloud){
		cloud.update();
	})

    pipes = pipes.filter(function(value, index, arr){

        return value.xpos + value.width > 0;

    });
    let out_birds = [];
    pipes.forEach(function(pipe){
        pipe.update();
        
        let this_pillar = pipe;
        let top_pillar = true;
        top_pillar = (this_pillar.ypos <=0);
        
        birds = birds.filter(function(value, index, arr){
            
            if(top_pillar){
                a = value.x + value.radius;
                b= value.y - value.radius;

                if((a > this_pillar.xpos )&& (a< (this_pillar.xpos + this_pillar.width)) && b <= (this_pillar.ypos + this_pillar.length)){
                    collision = true;
                    out_birds.push(value);
                    return false;
                }
                    
            }
            else if(!top_pillar){
                a = value.x + value.radius;
                b =  value.y + value.radius;
                
                if((a > this_pillar.xpos ) && (a< (this_pillar.xpos + this_pillar.width)) && b >=this_pillar.ypos){
                    collision = true;
                    out_birds.push(value);
                    return false;
                }      
            }
            return true;

        });
    });

    birds.forEach(function(bird){
		
		let pred = neural_network(bird.x1,bird.x2,bird.w1,bird.w2);
		if(pred._data[0]>0.5){
			flap(bird);
		}
        bird.update(pipes);
    });
   // if(collision){
   //     alert("Your score is: " + out_birds[0].score);
   //     init();
   // }
}


init();
animate();