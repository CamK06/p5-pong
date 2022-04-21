// Not Quite Pong | Cam K 2022
// Note: This code is kinda terrible in some areas

/*
 Values used for math, so changing resolution is easy and requires minimal code changes
 I guess p5 has this built in but I prefer this naming (uppercase) and being able to set it at the top of the file
 rather than inside of the createCanvas() function call
*/
const WIDTH = 800;
const HEIGHT = 600;

let frameCounter = 0;
let ticks = 0; // One tick == one half-second
let winner = 0; // 0 is A, 1 is B
let screen = 0; // 0 is start, 1 is game, 2 is hold/intermission, 3 is gameover
let cheatingPlayerB = false;
let justStarted = true;

// Start screen/Main menu paddle movement
let aVel = 5;
let bVel = 5;

/*
 Class definitions
 Ideally this would be in a different file but I'm lazy
 and not sure if that would work for submitting the assignment
*/
class Player {
  constructor(isPlayerB) {
    this.score = 0;
    this.xSize = 20;
    this.ySize = 75;
    this.isPlayerB = isPlayerB;
    this.moveDir = 0;
    if (!isPlayerB)
      this.posX = 20;
    else
      this.posX = WIDTH - 20 - this.xSize;
    this.posY = HEIGHT / 2 - this.ySize / 2;
  }

  update() {
    // If "AI" is on, follow the ball
    // TODO: Improve this "AI" logic
    if(cheatingPlayerB && this.isPlayerB) {
      let moveSpeed = 5.5+random(0, 2);
      if(ball.xVelocity < 0)
        moveSpeed = 5;

      if(ball.posY > this.posY+this.ySize/2 && this.posY+this.ySize < HEIGHT) {
        this.posY += moveSpeed;
        this.moveDir = moveSpeed;
      }
      if(ball.posY < this.posY+this.ySize/2 && this.posY > 0) {
        this.posY -= moveSpeed;
        this.moveDir = moveSpeed*-1;
      }

      return;
    }

    // Handle input/movement
    if (keyIsDown((this.isPlayerB ? DOWN_ARROW : 83)) && this.posY + this.ySize <= HEIGHT) {
      this.posY += 6.5;
      this.moveDir = 6.5;
    }
    if (keyIsDown((this.isPlayerB ? UP_ARROW : 87)) && this.posY >= 0) {
      this.posY -= 6.5;
      this.moveDir = -6.5;
    }

    // Reset moveDir if not moving
    if (!keyIsDown((this.isPlayerB ? DOWN_ARROW : 83)) && !keyIsDown((this.isPlayerB ? UP_ARROW : 87)))
      this.moveDir = 0;
  }

  draw() {
    fill(255, 255, 255);
    rect(this.posX, this.posY, this.xSize, this.ySize);
  }
}

/*
 Initialize players- this is here so they're accessible in ball,
 just an issue of not having multiple files of code and including them.
 Would be nice if header files existed
*/
let playerA = new Player();
let playerB = new Player(true);

class Ball {
  constructor(velocity) {
    this.diameter = 25;
    this.xVelocity = velocity;
    this.yVelocity = velocity;
    this.posX = WIDTH / 2;
    this.posY = HEIGHT / 2;
  }

  update() {
    // Apply velocity to the ball's position
    this.posX += this.xVelocity;
    this.posY += this.yVelocity;

    // Handle wall collisions+score
    if (this.posX - this.diameter / 2 <= 0 + playerA.xSize) {
      this.xVelocity *= 1;
      playerB.score++;
      winner = 0;
      ball.xVelocity = random(5, 7);
      this.xVelocity *= 1;
      ball.yVelocity = random(5, 7);
      this.reset();
    }
    else if (this.posX + this.diameter / 2 >= WIDTH - playerB.xSize) {
      this.xVelocity *= -1;
      playerA.score++;
      winner = 1;
      ball.xVelocity = random(5, 7);
      this.xVelocity *= -1;
      ball.yVelocity = random(5, 7);
      this.reset();
    }

    // Handle top/bottom collisions
    // we set the yPos to prevent the ball from getting in a loop of bouncing *in* the top or bottom of the screen
    if (this.posY - this.diameter / 2 <= 0) {
      this.yVelocity *= -1;
      this.posY = 0+this.diameter/2;
    }
    else if(this.posY + this.diameter / 2 >= HEIGHT) {
      this.yVelocity *= -1;
      this.posY = HEIGHT-this.diameter/2;
    }

    // Handle paddle collisions
    // Player 1
    if (this.posX - this.diameter / 2 <= playerA.posX + playerA.xSize &&  // If ball is hitting the paddle on X
      this.posY - this.diameter / 2 <= playerA.posY + playerA.ySize &&    // This line and the next are checking...
      this.posY - this.diameter / 2 >= playerA.posY) {                    // ...if ball Y is within paddle's Y
      this.xVelocity *= -1;
      this.posX = playerA.posX+playerA.xSize+this.diameter/2;
      // Change Y direction if player is moving
      if (playerA.moveDir != 0)
        this.yVelocity = playerA.moveDir;
      this.xVelocity *= random(1, 1.15);
      this.yVelocity *= random(1, 1.15);
    }
    else if (this.posX - this.diameter / 2 <= playerA.posX + playerA.xSize &&
      this.posY + this.diameter / 2 <= playerA.posY + playerA.ySize &&
      this.posY + this.diameter / 2 >= playerA.posY) {
      this.xVelocity *= -1;
      this.posX = playerA.posX+playerA.xSize+this.diameter/2;
      if (playerA.moveDir != 0)
        this.yVelocity = playerA.moveDir;
      this.xVelocity *= random(1, 1.15);
      this.yVelocity *= random(1, 1.15);
    }
    // Player 2
    if (this.posX + this.diameter / 2 >= playerB.posX &&
      this.posY - this.diameter / 2 <= playerB.posY + playerB.ySize &&
      this.posY - this.diameter / 2 >= playerB.posY) {
      this.xVelocity *= -1;
      this.posX = playerB.posX-this.diameter/2;
      if (playerB.moveDir != 0)
        this.yVelocity = playerB.moveDir;
      this.xVelocity *= random(1, 1.15);
      this.yVelocity *= random(1, 1.15);
    }
    else if (this.posX + this.diameter / 2 >= playerB.posX &&
      this.posY + this.diameter / 2 <= playerB.posY + playerB.ySize &&
      this.posY + this.diameter / 2 >= playerB.posY) {
      this.xVelocity *= -1;
      this.posX = playerB.posX-this.diameter/2;
      if (playerB.moveDir != 0)
        this.yVelocity = playerB.moveDir;
      this.xVelocity *= random(1, 1.15);
      this.yVelocity *= random(1, 1.15);
    }
  }

  draw() {
    fill(255, 255, 255);
    circle(this.posX, this.posY, this.diameter);
  }

  reset() {
    // Reset position and randomize y velocity
    this.posX = WIDTH / 2;
    this.posY = HEIGHT / 2;
    // t e r r i b l e code
    if(random(0, 100) > 50)
      ball.yVelocity *= -1;
    screen = 2;
    frameCounter = 0;
    ticks = 0;

    if(playerA.score >= 10 || playerB.score >= 10)
      screen = 3;
  }
}

// Initialize ball
let ball = new Ball(-7);

function setup() {
  createCanvas(WIDTH, HEIGHT);
  // Randomize ball X and Y velocity, this has to be done...
  // ...here since random() isn't defined in the constructor
  if (random(0, 100) > 50)
    ball.xVelocity = 7;
  if (random(0, 100) > 50)
    ball.yVelocity = 5;

  textSize(64);
  textAlign(CENTER, CENTER);
  frameRate(60);
}

function draw() {
  background(0);

  // Update+draw the game screen
  if(screen == 1 || screen == 2)
    gameTick();
  else if(screen == 0)
    startScreen();
  else if(screen == 3)
    gameOverScreen();

  // Frame counter
  frameCounter++;
  if(frameCounter % 30 == 0) {
    frameCounter = 0;
    ticks++;
  }
}

function gameTick() {
  // Update everything
  playerA.update();
  playerB.update();
  if(screen == 1 && !justStarted)
    ball.update();

  // Render score text
  if(screen == 1) {
    text(playerA.score, WIDTH / 4, 50);
    text(playerB.score, (WIDTH/4)*3, 50);
  }
  else if(screen == 2 && frameCounter <= 15) { // Score text flashing
    text(playerA.score, WIDTH / 4, 50);
    text(playerB.score, (WIDTH/4)*3, 50);
  }
  // This is a stupid way of doing this, but oh well. As always.
  if(winner == 0)
    text(playerA.score, WIDTH / 4, 50);
  else if(winner == 1)
    text(playerB.score, (WIDTH/4)*3, 50);

  // Render all the things and stuff
  // TODO: Make this line adjust with screen size changes
  for(let i = 0; i < 15; i++)
    rect(WIDTH/2-5, i*40+10, 10, 20);
  playerA.draw();
  playerB.draw();
  ball.draw();

  // Flash score only 3 times when game is resetting
  if(screen == 2 && ticks == 3)
    screen = 1;

  // Unfreeze the ball after 3 ticks
  if(justStarted && ticks == 3)
    justStarted = false;
}

function startScreen() {
  fill(255, 255, 255);

  // Title text
  textSize(64);
  textFont("Helvetica");
  text("Not Quite Pong", WIDTH/2, 128);
  textSize(32);
  text("Created By: Cam K.", WIDTH/2, 192);
  text("Controls:\nPlayer 1 - W/S\n" + (cheatingPlayerB ? "" : "Player 2 - Up/Down"), WIDTH/2, 500);
  textSize(10);
  text("Copyright © Cam K. 2022 Absolutely NO rights reserved. Actually, forget it, there's no copyright. Copyright sucks", WIDTH/2, HEIGHT-8);
  textSize(32);

  // Play button
  if(mouseX >= WIDTH/2-100 && mouseX <= WIDTH/2+100 &&
     mouseY >= 225 && mouseY <= 275) {
    fill(128, 128, 128);
    // If the button is being pressed
    if(mouseIsPressed == true && mouseButton == LEFT) {
      screen = 1;
      justStarted = true;
      ticks = 0;
      frameCounter = 0;
      textSize(64);
    }
  }
  else
    fill(255, 255, 255);
  rect(WIDTH/2-100, 225, 200, 50, 20, 20, 20, 20);
  fill(0, 0, 0);
  text("Play", WIDTH/2, 250);

  // AI button
  if(mouseX >= WIDTH/2-100 && mouseX <= WIDTH/2+100 &&
     mouseY >= 290 && mouseY <= 340)
    fill(128, 128, 128);
  else
    fill(255, 255, 255);
  rect(WIDTH/2-100, 290, 200, 50, 20, 20, 20, 20);
  fill(0, 0, 0);
  text("\"AI\": " + (cheatingPlayerB ? "ON" : "OFF"), WIDTH/2, 315);

  // Reset colour
  fill(255, 255, 255);

  // "Player" A animation
  playerA.draw();
  playerA.posY += aVel;
  if(playerA.posY <= 0 || playerA.posY+playerA.ySize >= HEIGHT)
    aVel *= -1;

  // "Player" B animation
  playerB.draw();
  playerB.posY -= bVel;
  if(playerB.posY <= 0 || playerB.posY+playerB.ySize >= HEIGHT)
    bVel *= -1;
}

function gameOverScreen() {

  // Game over text
  fill('white');
  textSize(64);
  text("GAME OVER", WIDTH/2, 140);
  textSize(32);
  text("Player " + (winner == 0 ? "2" : "1") + " wins!", WIDTH/2, 190);

  // Restart button
  textSize(32);
  if(mouseX >= WIDTH/2-100 && mouseX <= WIDTH/2+100 &&
     mouseY >= 225 && mouseY <= 275) {
    fill(128, 128, 128);
    // If the button is being pressed
    if(mouseIsPressed == true && mouseButton == LEFT) {
      screen = 1;
      justStarted = true;
      ticks = 0;
      frameCounter = 0;
      playerA.score = 0;
      playerB.score = 0;
      textSize(64);
    }
  }
  else
    fill(255, 255, 255);
  rect(WIDTH/2-100, 225, 200, 50, 20, 20, 20, 20);
  fill(0, 0, 0);
  text("Restart", WIDTH/2, 250);

  // Main Menu button
  if(mouseX >= WIDTH/2-100 && mouseX <= WIDTH/2+100 &&
     mouseY >= 290 && mouseY <= 340) {
    fill(128, 128, 128);
    // If the button is being pressed
    if(mouseIsPressed == true && mouseButton == LEFT) {
      ball.reset();
      screen = 0;
      playerA.score = 0;
      playerB.score = 0;
    }
  }
  else
    fill(255, 255, 255);
  rect(WIDTH/2-100, 290, 200, 50, 20, 20, 20, 20);
  fill(0, 0, 0);
  text("Main Menu", WIDTH/2, 315);
}

function mousePressed() {
  /* 
    Mode/AI button press handling
    This is done here as a way to prevent cheatingPlayerB from flipping really fast
    when clicked (without timers or anything of that sort)
  */
  if(mouseButton == LEFT && screen == 0) {
    // Check mouse pos to ensure it's within the bounds of the AI button
    if(mouseX >= WIDTH/2-100 && mouseX <= WIDTH/2+100 &&
      mouseY >= 290 && mouseY <= 340) {
        cheatingPlayerB = !cheatingPlayerB;
    }
  }
}

function keyPressed() {
  // Exit to main menu with escape
  if(keyCode == ESCAPE) {
    ball.reset();
    screen = 0;
    playerA.score = 0;
    playerB.score = 0;
  }
}
