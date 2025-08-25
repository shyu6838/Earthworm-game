var food;
var foodDiameter = 24;
var ghost;
var s;
var tailLength = 50;
var size = 32;
var gameset = true;
var highScore = 50;

if (localStorage.getItem("_highScore") === null) {
  localStorage._highScore = highScore;
}

function setup() {
  var iHeight = window.innerHeight <= 542 ? window.innerHeight - 20 : 522;
  var iWidth = window.innerWidth <= 957 ? window.innerWidth - 20 : 937;
  createCanvas(iWidth, iHeight);
  
  s = new Slither(width / 4, height / 2);
  ghost = new Ghost();
  pickLocation();
  
  var button = document.getElementById('py');
  var startScreen = document.getElementById('st');
  button.addEventListener('click', function() {
    startScreen.style.display = 'none';
    gameset = false;
  });
}

function draw() {
  background(245, 248, 250);
  noStroke();
  fill(54);
  textSize(16);
  text("꼬리 길이: " + tailLength, width / 8, 30);
  text("최고 점수 : " + localStorage.getItem("_highScore"), width / 8, 60);
  
  if (!gameset) {
    ghost.update();
    ghost.show();

    var ghostVect = createVector(ghost.x, ghost.y);

    if (s.eat(food)) {
      if (tailLength > localStorage.getItem("_highScore")) {
        localStorage._highScore = tailLength;
      }
      pickLocation();
    }

    s.seek(ghostVect);
    s.update();
    s.death();
  }
  s.display();
  
  fill(255, 0, 100);
  ellipse(food.x, food.y, foodDiameter, foodDiameter);
  
}

function pickLocation() {
  var offset = 40;
  food = createVector(random(offset, width - offset), random(offset, height - offset));
}

function keyPressed() {
  var ghostX = ghost.xspeed;
  var ghostY = ghost.yspeed;
  if (keyCode === UP_ARROW) {
    if (ghostY < 1) {
      ghost.dir(0, -1);
    }
  } else if (keyCode === DOWN_ARROW) {
    if (ghostY > -1) {
      ghost.dir(0, 1);
    }
  } else if (keyCode === RIGHT_ARROW) {
    if (ghostX > -1) {
      ghost.dir(1, 0);
    }
  } else if (keyCode === LEFT_ARROW) {
    if (ghostX < 1) {
      ghost.dir(-1, 0);
    }
  }
}

function Slither(x, y) {
  this.acceleration = createVector(0, 0);
  this.velocity = createVector(0, 0);
  this.position = createVector(x, y);
  this.r = size;
  this.maxspeed = 3;
  this.maxforce = 0.2;
  this.history = [];
  this.eatingVal = 0;

  this.update = function() {
    var v = createVector(this.position.x, this.position.y);
    this.history.push(v);
    
    if (this.history.length > tailLength) {
      this.history.splice(0, 1);   
    }
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
    
    if (this.eatingVal > 0) {
      this.eatingVal -= 0.5;
    }
  };

  this.applyForce = function(force) {
    this.acceleration.add(force);
  };

  this.seek = function(target) {
    var desired = p5.Vector.sub(target, this.position);
    desired.setMag(this.maxspeed);
    var steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce);
    this.applyForce(steer);
  };
  
  this.reset = function() {
    gameset = true;
    var that = this;
    this.history.forEach(function(seg) {
      seg.add(random(-10, 10), random(-10, 10));
    });
    setTimeout(function() {
      tailLength = 50;
      that.history = [];
      that.position = createVector(width / 2, height / 2);
      gameset = false;
    }, 3000);
  };
  
  this.death = function() {
    var offset = this.r / 2;
    var outOfBoundsX = this.position.x < offset || this.position.x > width - offset;
    var outOfBoundsY = this.position.y < offset || this.position.y > height - offset;
    if (outOfBoundsX || outOfBoundsY) {
      this.reset();
    } else {
      for (var i = 0; i < this.history.length - 10; i++) {
        var pos = this.history[i];
        var d = dist(this.position.x, this.position.y, pos.x, pos.y);
        if (d < 2) {
          this.reset();
        }
      }
    }
  };
  
  this.eat = function(pos) {
    var d = dist(this.position.x, this.position.y, pos.x, pos.y);
    if (d < foodDiameter) {
      tailLength += 20;
      this.eatingVal = 20;
      return true;
    } else {
      return false;
    }
  };

  this.display = function() {
    var theta = this.velocity.heading() + PI / 2;
    fill(0, 150, 150);
    noStroke();
    for (var i = 0; i < this.history.length; i++) {
      var pos = this.history[i];
      var size = map(i, 0, this.history.length, 5, this.r);
      ellipse(pos.x, pos.y, size, size);
    }
    fill(0, 150, 150);
    ellipse(this.x, this.y, this.r, this.r);
    push();
    translate(this.position.x, this.position.y);
    rotate(theta);
    fill(0, 210, 150);
    ellipse(0, -this.eatingVal, this.r, this.r);
    fill(255, 0, 0);
    rect(-2, -2 * this.eatingVal, 4, 15);
    stroke(0);
    fill(255);
    triangle(-10, -20, -10, 0, 0, 0);
    triangle(10, -20, 10, 0, 0, 0);
    fill(0, 150, 150);
    noStroke();
    ellipse(0, 0, this.r, this.r);
    if (!gameset) {
      fill(255);
      ellipse(-this.r / 5, 0, 12, 12);
      ellipse(this.r / 5, 0, 12, 12);
      fill(98);
      ellipse(-this.r / 5, 0, 6, 6);
      ellipse(this.r / 5, 0, 6, 6);
    } else {
      fill(255);
      textSize(12);
      text("X", -this.r / 4 - 1, 0);
      text("X", 1, 0);
    }
    pop();
  };
}

function Ghost() {
  this.x = 0;
  this.y = width / 2;
  this.xspeed = 5;
  this.yspeed = 0;

  this.dir = function(x, y) {
    this.xspeed = x * 5;
    this.yspeed = y * 5;
  };

  this.update = function() {
    this.x += this.xspeed;
    this.y += this.yspeed;
    this.x = constrain(this.x, 0, width - 20);
    this.y = constrain(this.y, 0, height - 20);
  };

  this.show = function() {
    fill(255, 0);
    noStroke();
    rect(this.x, this.y, 20, 20);
  };
}
