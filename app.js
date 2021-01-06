/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
let canvas;
let ctx;
let gameBoardArrayHeight = 20; //number of cells in array height
let gameBoardArrayWidth = 12; //number of cells in array width
let startX = 4; //starting x position for tetromino;
let startY = 0; //starting y position for tetromino;
let score = 0; //tracks the score;
let level = 1; //track current level
let winOrLose = "Playing"; 

let tetrisLogo;
//used as a look up table where each value in the array
//contains the x&y position we can use to draw the
//box on the canvas
let coordinateArray = [...Array(gameBoardArrayHeight)].map(e=> Array(gameBoardArrayWidth)
                                                      .fill(0));
let curTetromino = [[1,0], [0,1] , [1,1] , [2,1]];
//will hold all the tetrominos
let tetrominos = [];
//the tetromino array with the colors matched to the tetrominos array
let tetrominoColor = ['purple', 'cyan', 'blue', 'yellow', 'orange', 'green', 'red'];
//hold current tetromino color
let curTetrominoColor;

//create gameboard array so know where other squares are
let gameBoardArray = [...Array(20)].map(e => Array(12)
                                                     .fill(0));

//array for storing stopped shapes
//it will hold colors when a shape stops and is added                                                     
let stoppedShapeArray = [...Array(20)].map(e => Array(12)
                                                     .fill(0));                                                    
//create to track the direction moving the tetromino
//so that i can stop trying to move through walls
let Direction = {
    IDLE : 0,
    DOWN : 1,
    LEFT : 2,
    RIGHT : 3
};
  let direction ;

class Coordinates{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
}

//execute setupcanvas when page loads
document.addEventListener('DOMContentLoaded', SetupCanvas);

//create the array with square coordinates [lookup table]
//[0,0] pixels X: 11 Y: 9, [1,0] pixels X: 34 Y: 9, ...
function createCoordArray(){
    let i = 0 , j = 0 ;
    for(let y = 9; y <= 446; y += 23){
        //12 *23 = 276 - 12 = 264 max x value
        for(let x = 11; x<= 264; x += 23){
            coordinateArray[i][j] = new Coordinates(x,y);
           // console.log(`${i} : ${j} = ${coordinateArray[i][j].x}:${coordinateArray[i][j].y}`);
            i++;
        }
        j++;
        i = 0;
    }
}

function SetupCanvas(){
    canvas= document.getElementById('my-canvas');
    ctx = canvas.getContext('2d');
    canvas.width = 936;
    canvas.height = 956;

    //double the size of elements to fit the screen
    ctx.scale(2,2);

    //draw canvas background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //draw gameboard rectangle
    ctx.strokeStyle = 'black';
    ctx.strokeRect(8, 8, 280, 462);

    tetrisLogo = new Image(161,54);
    tetrisLogo.onload = DrawTetrisLogo;
    tetrisLogo.src = "tetrislogo.jpg";

    //set font for score label text and draw
    ctx.fillStyle = 'black';
    ctx.font = '21px Arial';
    ctx.fillText("SCORE", 300, 98);
    
    //draw score rectangle and score
    ctx.strokeRect(300, 107, 161, 24);
    ctx.fillText(score.toString(), 310, 127);
    
    //draw level label text, rectangle, level
    ctx.fillText("LEVEL", 300, 157);
    ctx.strokeRect(300, 171, 161, 24);
    ctx.fillText(level.toString(), 310, 190);

    //draw playing condition, rectangle
    ctx.fillText("WIN / LOSE", 300, 221);
    ctx.fillText(winOrLose, 310, 261);
    ctx.strokeRect(300, 232, 161, 95);
    //draw controls
    ctx.fillText("CONTROLS", 300, 354);
    ctx.strokeRect(300, 366, 161, 104);
    ctx.font = '16px Arial';
    ctx.fillText("A: MOVE LEFT", 310, 388);
    ctx.fillText("D: MOVE RIGHT", 310, 413);
    ctx.fillText("S: MOVE DOWN", 310, 438);
    ctx.fillText("E: ROTATE RIGHT", 310, 463);

    //handle keyboard presses
    document.addEventListener('keydown', HandleKeyPress);
    //create the array of tetromino arrays
    CreateTetrominos();
    //generate random tetromino
    CreateTetromino();

    //create the rectangle lookup table
    createCoordArray();

    DrawTetromino();
}

function DrawTetrisLogo(){
    ctx.drawImage(tetrisLogo, 300, 8, 161, 54);
}

//how to translate shape into game board draw& delete
function DrawTetromino(){
    //cycle through the x&y array for the tetromino looking
    //for all the places a square would be drawn
    for(let i = 0 ; i < curTetromino.length ; i++){
        //move the tetromino x&y values to the tetromino
        //shows in the middle of the gameboards
        let x = curTetromino[i][0] + startX;
        let y = curTetromino[i][1] + startY;
        //put tetromino shape in the gameboard array
        gameBoardArray[x][y] = 1;
        //console.log("put 1 at ["+x+"," + y +"]")
        //look for the x&y values in the lookup table
        let coorX = coordinateArray[x][y].x;
        let coorY = coordinateArray[x][y].y;

        //console.log("X: " + x + "Y :" + y);

        //draw a square at the x&y coordinates that the lookup
        //table provides
        ctx.fillStyle = curTetrominoColor;
        ctx.fillRect(coorX,coorY, 21, 21);
    }
}

//----------move&delete old tetrimino-------------
//each time a key is pressed we change the either the starting
//x or y value for where we want to draw the new tetromino
//we also delete the previously drawn shape and draw the new one
function HandleKeyPress(key){
    if(winOrLose != "Game Over"){
        //a keycode (left)
    if(key.keyCode === 65){
        //check if i'll hit the wall
        direction = Direction.LEFT;
        if(!HittingTheWall() && !checkForHorizontalCollision()){
            DeleteTetromino();
            startX--;
            DrawTetromino();
        }
        //d keycode (right)
    }else if(key.keyCode === 68){
        //check if i'll hit the wall
        direction = Direction.RIGHT;
        if(!HittingTheWall() && !checkForHorizontalCollision()){
        DeleteTetromino();
        startX++;
        DrawTetromino();
        }
        //s keycode (down)
    }else if(key.keyCode === 83){
       MoveTetrominoDown();
       //e keycode calls for rotation of tetromino
    }else if(key.keyCode === 69){
        RotateTetromino();
    }
}
}

function MoveTetrominoDown(){
    //track that i want to move down
    direction = Direction.DOWN;
    //check for a vertical collision
    if(!CheckForVerticalCollision()){
    DeleteTetromino();
    startY++;
    DrawTetromino();
    }
}
//automatically calls for a tetromino to fall
window.setInterval(function(){
    if(winOrLose != "Game over"){
        MoveTetrominoDown();
    }
}, 500);

//clears the previously drawn tetromino
//do the same stuff when we drew originally
//but make the square white this time
function DeleteTetromino(){
    for(let i =0; i < curTetromino.length; i++){
        let x = curTetromino[i][0] + startX;
        let y = curTetromino[i][1] + startY;
        //delete tetromino square from the gameboard array
        gameBoardArray[x][y] = 0 ;
        //draw white where colored squares used to be
        let coorX = coordinateArray[x][y].x;
        let coorY = coordinateArray[x][y].y;
        ctx.fillStyle = 'white';
        ctx.fillRect(coorX, coorY, 21, 21);
    }
}
//generate random tetrominos with colors
//i defined every index where there is a colored block
function CreateTetrominos(){
    //push T
    tetrominos.push([[1,0],[0,1],[1,1],[2,1]]);
    //push I
    tetrominos.push([[0,0], [1,0], [2,0], [3,0]]);
    //push J
    tetrominos.push([[0,0],[0,1],[1,1],[2,1]]);
    //push square
    tetrominos.push([[0,0],[1,0],[0,1],[1,1]]);
    //push L
    tetrominos.push([[2,0],[0,1],[1,1],[2,1]])
    //push S
    tetrominos.push([[1,0],[2,0],[0,1],[1,1]]);
    //push Z
    tetrominos.push([[0,0],[1,0],[1,1],[2,1]]);
}

function CreateTetromino(){
    //get a random tetromino index
    let randomTetromino = Math.floor(Math.random()*tetrominos.length);
    //set the one to draw
    curTetromino = tetrominos[randomTetromino];
    //get the color for it
    curTetrominoColor = tetrominoColor[randomTetromino];
}
//check if the tetromino hits the wall
//cycle through the squares adding the upper left hand corner
//position to see if the value is <= to 0 or >= 11
//if they are also moving in a direction that would be off
//the board stop movement
function HittingTheWall(){
    for(let i = 0 ; i < curTetromino.length ; i++){
        let newX = curTetromino[i][0] +startX;
        if(newX <= 0 && direction === Direction.LEFT){
            return true;
        }else if(newX >= 11 && direction === Direction.RIGHT){
            return true;
        }
    }
    return false;
}
//check for vertical collision
function CheckForVerticalCollision(){
    //make a copy of the tetromino so that i can move a fake
    //tetromino and check for collisions before i move the real
    //tetromino
    let tetrominoCopy = curTetromino;
    //will change values based on collision
    let collision = false;

    //cycle through all tetromino squares
    for(let i = 0 ; i < tetrominoCopy.length; i++){
        //get each square of the tetromino and adjust the square
        //position so i can check for collisions
        let square = tetrominoCopy[i];
        //move into position based on the changing upper left
        //hand corner of the entire tetromino shape
        let x = square[0] + startX;
        let y = square[1] + startY;
        //if i'm moving down increment y to check for a collision
        if(direction === Direction.DOWN){
            y++;
        }
        //check if i'm going to hit a previously set piece
        //if(gameBoardArray[x][y+1] === 1){
            if(typeof stoppedShapeArray[x][y+1] === 'string'){
                //if so delete tetromino
                DeleteTetromino();
                //increment to put into place and draw
                startY++;
                DrawTetromino();
                collision = true;
                break;
            }
            if(y >= 20){
                collision = true;
                break;
            }
        }

        if(collision){
            //check for game over and if so set game over text
            if(startY <= 2){
                winOrLose = "Game Over";
                ctx.fillStyle = 'white';
                ctx.fillRect(310, 242, 140, 30);
                ctx.fillStyle = 'black';
                ctx.fillText(winOrLose, 310, 261);
            }else{
                //add stopped tetromino to stopped shape array
                //so i can check for future collisions
                for(let i = 0 ; i < tetrominoCopy.length; i++){
                    let square = tetrominoCopy[i];
                    let x = square[0] + startX;
                    let y = square[1] + startY;
                    stoppedShapeArray[x][y] = curTetrominoColor;
                }
                //check for completed rows
                checkForCompletedRows();
                CreateTetromino();
                //create the next tetromino and draw it and reset direction
                direction = Direction.IDLE;
                startX = 4;
                startY = 0;
                DrawTetromino();
            }
        }
    }

//check for horizontal shape collision
function checkForHorizontalCollision(){
    //copy the tetromino so i can manipulate its x value
    //and check if its new value would collide with
    //a stopped tetromino
    let tetrominoCopy = curTetromino;
    let collision = false;

    //cycle through all tetromino squares
    for(var i = 0 ; i < tetrominoCopy.length; i++){
        //get the square and move it into position using
        //the upper left hand coordinates
        var square = tetrominoCopy[i];
        var x = square[0] + startX;
        var y = square[1] + startY;
        //move tetromino clone square into position based
        //on direction moving
        if(direction === Direction.LEFT){
            x--;
        }else if(direction === Direction.RIGHT){
            x++;
        }

        //get the potential stopped square that may exist
        var stoppedShapeVal = stoppedShapeArray[x][y];
        //if it is a string we know a stopped square is there
        if(typeof stoppedShapeVal === 'string'){
            collision = true;
            break;
        }
    }
    return collision;
}

//check for completed rows
//-----------------slide-----------------------
function checkForCompletedRows(){
    //track how many rows to delete and where to start deleting
    let rowsToDelete = 0;
    let startOfDelete = 0;

    //check every row to see if it has been completed
    for(let y = 0 ; y < gameBoardArrayHeight; y++){
        let completed = true;
        //cycle through x values
        for(let x = 0 ; x < gameBoardArrayWidth; x++){
            //get values stored in the stopped block array
            let square = stoppedShapeArray[x][y];
            //check if nothing is there
            if(square === 0 || (typeof square === 'undefined')){
                //if there is nothing there once then jump out
                //because the row isn't completed
                completed = false;
                break;
            }
        }
        //if a row has been completed
        if(completed){
        //used to shift down the rows   
            if(startOfDelete === 0) startOfDelete = y;
            rowsToDelete++;
         //delete the line everywhere   
            for(let i = 0 ; i < gameBoardArrayWidth; i++){
                //update the arrays by deleting previous squares
                stoppedShapeArray[i][y] = 0;
                gameBoardArray[i][y]= 0;
                //look for the x&y values in the lookup table
                let coorX = coordinateArray[i][y].x;
                let coorY = coordinateArray[i][y].y;
                //draw the square as white
                ctx.fillStyle = 'white';
                ctx.fillRect(coorX,coorY, 21, 21);
            }
        }
    }
    if(rowsToDelete > 0){
        score += 10;
        ctx.fillStyle = 'white';
        ctx.fillRect(310, 109, 140, 19);
        ctx.fillStyle = 'black';
        ctx.fillText(score.toString(), 310, 127);
        moveAllRowsDown(rowsToDelete, startOfDelete);
    }
}
//move rows down after a row has been deleted
function moveAllRowsDown(rowsToDelete, startOfDelete){
    for ( var i = startOfDelete -1 ; i>= 0 ; i--){
        for (var x = 0 ; x < gameBoardArrayWidth ; x++){
            var y2 = i + rowsToDelete;
            var square = stoppedShapeArray[x][i];
            var nextSquare = stoppedShapeArray[x][y2];
            if(typeof square === 'string'){
                nextSquare = square;
                gameBoardArray[x][y2] = 1; //put block into GBA
                stoppedShapeArray[x][y2] = square; //draw color into stopped
               
               //look for the x&y values in the lookup table
                let coorX = coordinateArray[x][y2].x;
                let coorY = coordinateArray[x][y2].y;
                ctx.fillStyle = nextSquare;
                ctx.fillRect(coorX,coorY,21,21);

                square = 0;
                gameBoardArray[x][i] = 0; //clear the spot in GBA
                stoppedShapeArray[x][i] = 0; //clear the spot in SSA
                coorX = coordinateArray[x][i].x;
                coorY = coordinateArray[x][i].y;
                ctx.fillStyle = 'white';
                ctx.fillRect(coorX,coorY,21,21);
            }
        }
    }
}
//rotate the tetromino
//-------------------------slide----------------------------------
function RotateTetromino(){
    let newRotation = new Array();
    let tetrominoCopy = curTetromino;
    let curTetrominoBU;
    for(let i = 0 ; i < tetrominoCopy.length; i++){
        //here to handle a error with a backup tetromino
        //we are cloning the array otherwise it would
        //create a reference to the array that caused the error
        curTetrominoBU = [...curTetromino];

        //find the new rotation by getting the x value of the
        //last square of the tetromino and then we orientate
        //the other squars based on it [slid]
        let x = tetrominoCopy[i][0];
        let y = tetrominoCopy[i][1];
        let newX = (GetLastSquareX() - y);
        let newY = x;
        newRotation.push([newX,newY]);
    }
    DeleteTetromino();
    try{
        //try to draw the new tetromino rotation
        curTetromino = newRotation;
        DrawTetromino();
    }
    //if there is an error get the backup tetromino and
    //draw it instead
    catch(e){
        if(e instanceof TypeError){
            curTetromino = curTetrominoBU;
            DeleteTetromino();
            DrawTetromino();
        }
    }
}

//get the x value for the last square in the tetromino
//so we can orientate all other squares using that as
//a boundary. this simulates rotating the tetromino
function GetLastSquareX(){
    let lastX = 0;
    for(let i = 0 ; i < curTetromino.length; i++){
        let square = curTetromino[i];
        if(square[0] > lastX)
        lastX = square[0];
    }
    return lastX;
}