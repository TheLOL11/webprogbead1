let gameMatrix = [[]];
let mode = "";

let gameboard = document.querySelector("#gameboard");
let startdiv = document.querySelector("#startscreen");
let gamediv = document.querySelector("#gamediv");
let enddiv = document.querySelector("#enddiv");
let timer = document.querySelector("#timer");
let name = document.querySelector("#name");
let nameDisplay = document.querySelector("#namep");
let highScoresDiv = document.querySelector("#highscores");
let highScoresList = document.querySelector("#scoreslist");
let highScoresListDiv = document.querySelector("#highlistdiv");
let loaddiv = document.querySelector("#loaddiv");

let seconds;
let elapsedTimeIntervalRef;
let userName;
let highScores = [[]];
if (JSON.parse(window.localStorage.getItem("savedScores")) != null){
    highScores = JSON.parse(window.localStorage.getItem("savedScores"));
}
let finished = 0;
let savedScores = false;
let saved = false;
let paused = false;
let savedGames = [[[]]];
if (JSON.parse(window.localStorage.getItem("savedGames")) != null){
    savedGames = JSON.parse(window.localStorage.getItem("savedGames"));
}
console.log(savedGames);
let savedModes = [];
if (JSON.parse(window.localStorage.getItem("savedModes")) != null){
    savedModes = JSON.parse(window.localStorage.getItem("savedModes"));
}
console.log(savedModes);
let savedNames = [];
if (JSON.parse(window.localStorage.getItem("savedNames")) != null){
    savedNames = JSON.parse(window.localStorage.getItem("savedNames"));
}
console.log(savedNames);
let savedTimes = [];
if (JSON.parse(window.localStorage.getItem("savedTimes")) != null){
    savedTimes = JSON.parse(window.localStorage.getItem("savedTimes"));
}
console.log(savedTimes);
updateSaveList();
let savedMatrix = [[]];
let savedMode = "";

let editordiv = document.querySelector("#editor");
let sizeInput = document.querySelector("#sizeinput");
let editboard = document.querySelector("#editortable");
let editboardDiv = document.querySelector("#editboarddiv");
let numInput = document.querySelector("#blacknums");
let editOptions = document.querySelector("#editoptions");
let editNameInput = document.querySelector("#editname");
let customMapsDiv = document.querySelector("#customsdiv");

let editingIndex = -1;
let editingExisting = false;
let editingName = "";
let editorMatrix = [[]];
let editMode = "";
let customMaps = [[[]]];
window.localStorage.removeItem("customMaps");
if (JSON.parse(window.localStorage.getItem("customMaps")) != null){
    customMaps = JSON.parse(window.localStorage.getItem("customMaps"));
}
let mapNames = [];
window.localStorage.removeItem("mapNames");
if (JSON.parse(window.localStorage.getItem("mapNames")) != null){
    mapNames = JSON.parse(window.localStorage.getItem("mapNames"));
}
updateCustomsList();


let white = {r:255, g:255, b:255};
let khaki   = {r:240, g:230, b:140};

function start(){
    seconds = 0;
    timer.innerHTML = "0 másodperc.";
}

function startFromSave(time){
    clearInterval(elapsedTimeIntervalRef);
    elapsedTimeIntervalRef = setInterval(() => { timer.innerHTML = curr(); }, 1000);
    seconds = time;
    let converted = secsToMin(seconds);
    if (converted[0] > 0){
        return `${converted[0]} perc, ${converted[1]} másodperc.`;
    }else{
        return `${converted[1]} másodperc.`;
    }
}

function curr(){
    if (!paused){
        seconds++;
        let converted = secsToMin(seconds);
        if (converted[0] > 0){
            return `${converted[0]} perc, ${converted[1]} másodperc.`;
        }else{
            return `${converted[1]} másodperc.`;
        }
    }
    return `${seconds} másodperc.`;
}

function end(){
    highScores[finished][2] = curr();
    seconds = 0;
    clearInterval(elapsedTimeIntervalRef);
}

function secsToMin(seconds){
    if (seconds >= 60){
        let mins = Math.round(seconds / 60);
        seconds = seconds % 60;
        return [mins,seconds];
    }
    return [0,seconds];
}

startdiv.addEventListener("click", function(e){
    if (e.target.parentElement.parentElement.parentElement != null){
        manyParentID = e.target.parentElement.parentElement.parentElement.id;
    }else{
        manyParentID = "not";
    }
    if (e.target.tagName == "BUTTON" && manyParentID != "loaddiv" && manyParentID != "not" && e.target.id != "editorbutton" && e.target.dataset.mode != "EditExist"){
        startTime = new Date();
        savedScores = false;
        if (name.value == ""){
            userName = "Unknown";
        }else{
            userName = name.value;
        }
        gameMatrix = [[]];
        mode = e.target.dataset.mode;
        if (mode == "Easy" || mode == "Hard"){
            for (let i = 0; i < 7; i++){
                gameMatrix[i] = new Array();
                for (let l = 0; l < 7; l++){
                    gameMatrix[i].push([false,false,-1,false]); // 0: has lamp? 1: is black? 2: number (-1 if no number) 3: lit?
                }
            }
        }if (mode == "Extreme"){
            for (let i = 0; i < 10; i++){
                gameMatrix[i] = new Array();
                for (let l = 0; l < 10; l++){
                    gameMatrix[i].push([false,false,-1,false]); // 0: has lamp? 1: is black? 2: number (-1 if no number) 3: lit?
                }
            }
        }if (mode == "Custom"){
            mode = mapNames[parseInt(e.target.dataset.num)-1]
            gameMatrix = copy(customMaps[parseInt(e.target.dataset.num)]);
        }
        startdiv.hidden = true;
        blacks();
        blackNums();
        renderTable();
        start();
        clearInterval(elapsedTimeIntervalRef);
        elapsedTimeIntervalRef = setInterval(() => { timer.innerHTML = curr(); }, 1000);
        gamediv.hidden = false;
        highScoresListDiv.hidden = true;
        highScoresDiv.hidden = true;
        paused = false;
        loaddiv.hidden = false;
    }
    if (manyParentID == "loaddiv" && e.target.tagName == "BUTTON"){
        loadindex = parseInt(e.target.dataset.load);
        loadGame(loadindex);
        gamediv.hidden = false;
        startdiv.hidden = true;
        highScoresDiv.hidden = true;
        paused = false;
        renderTable();
        if (isOver()){
            enddiv.hidden = false;
        }
    }
    if (e.target.tagName == "BUTTON" && e.target.dataset.mode == "EditExist"){
        startdiv.hidden = true;
        highScoresDiv.hidden = true;
        highScoresListDiv.hidden = true;
        editordiv.hidden = false;
        playerMode = false;
        mode = "Editor";
        editboardDiv.hidden = false;
        editOptions.hidden = false;
        otherbutton = e.target.parentElement.querySelector("button");
        editingExisting = true;
        editingIndex = e.target.dataset.num;
        editNameInput.value = otherbutton.innerHTML;
        editorMatrix = copy(customMaps[editingIndex]);
        renderTable();
    }
    if (e.target.id == "editorbutton"){
        startdiv.hidden = true;
        highScoresDiv.hidden = true;
        highScoresListDiv.hidden = true;
        editordiv.hidden = false;
        playerMode = false;
        editboardDiv.hidden = true;
        mode = "Editor";
    }
})

function copy(matrix){
    map = matrix;
    returnMatrix = [[]];
    for (let i = 0; i < map.length; i++){
        returnMatrix[i] = new Array();
        for (let l = 0; l < map.length; l++){
            returnMatrix[i].push([map[i][l][0],map[i][l][1],map[i][l][2],map[i][l][3]]);
        }
    }
    return returnMatrix;
}

function saveGame(){
    saved = true;
    savedModes.push(mode);
    window.localStorage.setItem("savedModes", JSON.stringify(savedModes));
    savedNames.push(userName);
    window.localStorage.setItem("savedNames", JSON.stringify(savedNames));
    savedGames.push(copy(gameMatrix));
    window.localStorage.setItem("savedGames", JSON.stringify(savedGames));
    savedTimes.push(seconds);
    window.localStorage.setItem("savedTimes", JSON.stringify(savedTimes));
    seconds = 0;
    mode = "";
    userName = "";
    updateSaveList();
}

function updateSaveList(){
    s = "";
    s += "<ul>";
    for (let i = 1; i < savedGames.length; i++){
        s += `<li>${savedNames[i-1]} ${savedModes[i-1]} <button data-load=${i} data-mode="${savedModes[i-1]}">LOAD</button></li>`
    }
    s += "</ul>";
    loaddiv.innerHTML = s;
}

function loadGame(index){
    gameMatrix = copy(savedGames.splice(index,1)[0]);
    window.localStorage.setItem("savedGames", JSON.stringify(savedGames));
    userName = savedNames.splice(index-1,1)[0];
    window.localStorage.setItem("savedNames", JSON.stringify(savedNames));
    startFromSave(savedTimes.splice(index-1,1)[0]);
    window.localStorage.setItem("savedTimes", JSON.stringify(savedTimes));
    mode = savedModes.splice(index-1,1)[0];
    window.localStorage.setItem("savedModes", JSON.stringify(savedModes));
    savedMatrix = [[]];
    savedMode = "";
}

function blacks(){
    if (mode == "Easy"){
        gameMatrix[0][3][1] = true;
        gameMatrix[1][1][1] = true;
        gameMatrix[1][5][1] = true;
        gameMatrix[3][0][1] = true;
        gameMatrix[3][3][1] = true;
        gameMatrix[3][6][1] = true;
        gameMatrix[5][1][1] = true;
        gameMatrix[5][5][1] = true;
        gameMatrix[6][3][1] = true;
    }else if (mode == "Hard"){
        gameMatrix[0][2][1] = true;
        gameMatrix[0][4][1] = true;
        gameMatrix[2][0][1] = true;
        gameMatrix[2][2][1] = true;
        gameMatrix[2][4][1] = true;
        gameMatrix[2][6][1] = true;
        gameMatrix[3][3][1] = true;
        gameMatrix[4][0][1] = true;
        gameMatrix[4][2][1] = true;
        gameMatrix[4][4][1] = true;
        gameMatrix[4][6][1] = true;
        gameMatrix[6][2][1] = true;
        gameMatrix[6][4][1] = true;
    }else if (mode == "Extreme"){
        gameMatrix[0][1][1] = true;
        gameMatrix[1][5][1] = true;
        gameMatrix[1][7][1] = true;
        gameMatrix[1][9][1] = true;
        gameMatrix[2][1][1] = true;
        gameMatrix[2][2][1] = true;
        gameMatrix[2][7][1] = true;
        gameMatrix[3][4][1] = true;
        gameMatrix[4][1][1] = true;
        gameMatrix[4][4][1] = true;
        gameMatrix[4][5][1] = true;
        gameMatrix[4][6][1] = true;
        gameMatrix[5][3][1] = true;
        gameMatrix[5][4][1] = true;
        gameMatrix[5][5][1] = true;
        gameMatrix[5][8][1] = true;
        gameMatrix[6][5][1] = true;
        gameMatrix[7][2][1] = true;
        gameMatrix[7][7][1] = true;
        gameMatrix[7][8][1] = true;
        gameMatrix[8][0][1] = true;
        gameMatrix[8][2][1] = true;
        gameMatrix[8][4][1] = true;
        gameMatrix[9][8][1] = true;
    }
}

function blackNums(){
    if (mode == "Easy"){
        gameMatrix[0][3][2] = 1;
        gameMatrix[1][1][2] = 0;
        gameMatrix[1][5][2] = 2;
        gameMatrix[5][5][2] = 2;
        gameMatrix[6][3][2] = 3;
    }else if (mode == "Hard"){
        gameMatrix[0][2][2] = 0;
        gameMatrix[2][4][2] = 3;
        gameMatrix[3][3][2] = 1;
        gameMatrix[4][0][2] = 2;
        gameMatrix[6][4][2] = 2;
    }else if (mode == "Extreme"){
        gameMatrix[1][5][2] = 3;
        gameMatrix[1][7][2] = 2;
        gameMatrix[2][1][2] = 0;
        gameMatrix[4][1][2] = 1;
        gameMatrix[4][5][2] = 1;
        gameMatrix[5][8][2] = 3;
        gameMatrix[7][2][2] = 1;
        gameMatrix[7][7][2] = 0;
        gameMatrix[8][0][2] = 3;
        gameMatrix[8][4][2] = 0;
        gameMatrix[9][8][2] = 0;
    }
}

function bulbOn(i,j){
    if( gameMatrix[i][j][0] ){
        return "💡";
    }
    return "";
}

function whatStyle(i,j){
    if (gameMatrix[i][j][1]){
        return 1;
    }else if (gameMatrix[i][j][3]){
        return 2;
    }
    return 0;
}

function isBlackGood(i,j){
    if (gameMatrix[i][j][1] && gameMatrix[i][j][2] > -1 && howManyLampsShort(i,j) == gameMatrix[i][j][2]){
        return "good";
    }else if (gameMatrix[i][j][0] && howManyLampsLong(i,j) > 0){
        return "bad";
    }
    return "";
}

function numIfBlack(i,j){
    if (gameMatrix[i][j][1] && gameMatrix[i][j][2] != -1){
        return `${gameMatrix[i][j][2]}`;
    }
    return "";
}

function renderTable(){
    if (mode == "Editor"){
        let s = "";
        for (let i = 0; i < editorMatrix.length; i++){
            s += `<tr>`;
            for (let j = 0; j < editorMatrix.length; j++){
                s += `<td class="gamecell${whatStyleEditor(i,j)}" data-xy="[${i},${j}]">${numIfBlackEditor(i,j)}</td>`;
            }
            s += `</tr>`
        }
        editboard.innerHTML = s;
    }else{
        nameDisplay.innerHTML = `${userName}`;
        let s = "";
        for (let i = 0; i < gameMatrix.length; i++){
            s += `<tr>`;
            for (let j = 0; j < gameMatrix.length; j++){
                s += `<td class="gamecell${whatStyle(i,j)}${isBlackGood(i,j)}" data-xy="[${i},${j}]">${bulbOn(i,j)}${numIfBlack(i,j)}</td>`;
            }
            s += `</tr>`
        }
        gameboard.innerHTML = s;
    }
}

editordiv.addEventListener("click", function(e){
    if (e.target.id == "genbutton" && sizeInput.value >= 3){
        editorMatrix = [[]];
        for (let i = 0; i < sizeInput.value; i++){
            editorMatrix[i] = new Array();
            for (let l = 0; l < sizeInput.value; l++){
                editorMatrix[i].push([false,false,-1,false]); // 0: has lamp? 1: is black? 2: number (-1 if no number) 3: lit?
            }
        }
        editboardDiv.hidden = false;
        editOptions.hidden = false;
        renderTable();
    }
})

editboard.addEventListener("click",function(e){
    if (e.target.tagName == "TD"){
        xy = removeBrackets(e.target.dataset.xy).split(",").map(function(num){ return parseInt(num)});
        if (editMode == "Black"){
            toggleBlack(xy[0],xy[1]);
        }else if (editMode == "Num"){
            changeNum(xy[0],xy[1]);
        }
        renderTable();
    }
})

editOptions.addEventListener("click",function(e){
    if (e.target.tagName == "BUTTON" && e.target.value != "Save"){
        editMode = e.target.value;
    }else if (e.target.value == "Save"){
        if (editingExisting){
            trash = mapNames.splice(editingIndex-1,1);
            trash = customMaps.splice(editingIndex,1);
        }
        editingIndex = -1;
        editingExisting = false;
        editordiv.hidden = true;
        numInput.value = "";
        sizeInput.value = "";
        editMode = "";
        customMaps.push(editorMatrix);
        window.localStorage.setItem("customMaps", JSON.stringify(customMaps));
        editorMatrix = [[]];
        mode = "";
        editboardDiv.hidden = true;
        if (editNameInput.value != ""){
            mapNames.push(editNameInput.value);
        }else{
            mapNames.push("Unnamed");
        }
        window.localStorage.setItem("mapNames", JSON.stringify(mapNames));
        editNameInput.value = "";
        updateCustomsList();
        editOptions.hidden = true;
        highScoresDiv.hidden = false;
        highScoresListDiv.hidden = true;
        customMapsDiv.hidden = false;
        startdiv.hidden = false;
    }
})

function updateCustomsList(){
    s = "";
    s += "<ul>";
    for (let i = 1; i < customMaps.length; i++){
        s += `<li><button data-num="${i}" data-mode="Custom">${mapNames[i-1]}</button><button data-num="${i}" data-mode="EditExist">EDIT</button></li>`;
    }
    s += "</ul>";
    customMapsDiv.innerHTML = s;
    console.log(customMaps);
    console.log(mapNames);
}

function toggleBlack(i,j){
    if (editorMatrix[i][j][1]){
        editorMatrix[i][j][1] = false;
    }else{
        editorMatrix[i][j][1] = true;
    }
}

function changeNum(i,j){
    if (editorMatrix[i][j][1] && numInput.value >= -1 && numInput.value <= 4 && numInput.value <= howManyNeigboursExist(i,j)){
        editorMatrix[i][j][2] = numInput.value;
    }
}

function howManyNeigboursExist(i,j){
    if (i == 0 && j == 0){
        return 2;
    } else if (i == editorMatrix.length-1 && j == editorMatrix.length-1){
        return 2;
    } else if (i == editorMatrix.length-1 && j == 0){
        return 2;
    } else if (i == 0 && j == editorMatrix.length-1){
        return 2;
    } else if (i == editorMatrix.length-1 && j != editorMatrix.length-1 && j != 0){
        return 3;
    } else if (i == 0 && j != editorMatrix.length-1 && j != 0){
        return 3;
    } else if (j == editorMatrix.length-1 && i != editorMatrix.length-1 && i != 0){
        return 3;
    } else if (j == 0 && i != editorMatrix.length-1 && i != 0){
        return 3;
    } else{
        return 4;
    }
}

function whatStyleEditor(i,j){
    if (editorMatrix[i][j][1]){
        return 1;
    }else if (editorMatrix[i][j][3]){
        return 2;
    }
    return 0;
}

function numIfBlackEditor(i,j){
    if (editorMatrix[i][j][1] && editorMatrix[i][j][2] != -1){
        return `${editorMatrix[i][j][2]}`;
    }
    return "";
}

function swapBulb(i,j){
    if (!gameMatrix[i][j][0] && !gameMatrix[i][j][1]){
        gameMatrix[i][j][0] = true;
    }else if (gameMatrix[i][j][1] != 1){
        gameMatrix[i][j][0] = false;
    }
}

function setLights(){
    for (let i = 0; i < gameMatrix.length; i++){
        for (let j = 0; j < gameMatrix.length; j++){
            if ((!gameMatrix[i][j][1] && howManyLampsLong(i,j) > 0) || gameMatrix[i][j][0]){
                gameMatrix[i][j][3] = true;
            }else{
                gameMatrix[i][j][3] = false;
            }
        }
    }
}

function howManyLampsShort(i,j){
    sum = 0;
    if (i == 0 && j == 0){
        if (gameMatrix[i][j+1][0]){
            sum++;
        }
        if (gameMatrix[i+1][j][0]){
            sum++;
        }
    } else if (i == gameMatrix.length-1 && j == gameMatrix.length-1){
        if (gameMatrix[i][j-1][0]){
            sum++;
        }
        if (gameMatrix[i-1][j][0]){
            sum++;
        }
    } else if (i == gameMatrix.length-1 && j == 0){
        if (gameMatrix[i][j-1][0]){
            sum++;
        }
        if (gameMatrix[i-1][j][0]){
            sum++;
        }
    } else if (i == 0 && j == gameMatrix.length-1){
        if (gameMatrix[i][j-1][0]){
            sum++;
        }
        if (gameMatrix[i-1][j][0]){
            sum++;
        }
    } else if (i == gameMatrix.length-1 && j != gameMatrix.length-1 && j != 0){
        if (gameMatrix[i][j-1][0]){
            sum++;
        }
        if (gameMatrix[i-1][j][0]){
            sum++;
        }
        if (gameMatrix[i][j+1][0]){
            sum++;
        }
    } else if (i == 0 && j != gameMatrix.length-1 && j != 0){
        if (gameMatrix[i][j-1][0]){
            sum++;
        }
        if (gameMatrix[i+1][j][0]){
            sum++;
        }
        if (gameMatrix[i][j+1][0]){
            sum++;
        }
    } else if (j == gameMatrix.length-1 && i != gameMatrix.length-1 && i != 0){
        if (gameMatrix[i-1][j][0]){
            sum++;
        }
        if (gameMatrix[i][j-1][0]){
            sum++;
        }
        if (gameMatrix[i+1][j][0]){
            sum++;
        }
    } else if (j == 0 && i != gameMatrix.length-1 && i != 0){
        if (gameMatrix[i-1][j][0]){
            sum++;
        }
        if (gameMatrix[i][j+1][0]){
            sum++;
        }
        if (gameMatrix[i+1][j][0]){
            sum++;
        }
    } else{
        if (gameMatrix[i][j-1][0]){
            sum++;
        }
        if (gameMatrix[i-1][j][0]){
            sum++;
        }
        if (gameMatrix[i][j+1][0]){
            sum++;
        }
        if (gameMatrix[i+1][j][0]){
            sum++;
        }
    }
    return sum;
}

function howManyLampsLong(i,j){
    first = checkLeft(i,j);
    second = checkUp(i,j);
    third = checkRight(i,j);
    fourth = checkDown(i,j);
    return first + second + third + fourth;
}

function checkLeft(i,j){
    sum = 0;
    og = j;
    while (j >= 0){
        if (gameMatrix[i][j][1] && j != og){
            break;
        }
        if (gameMatrix[i][j][0] && j != og){
            sum++;
        }
        j--;
    }
    return sum;
}
function checkUp(i,j){
    sum = 0;
    og = i;
    while (i >= 0){
        if (gameMatrix[i][j][1] && i != og){
            break;
        }
        if (gameMatrix[i][j][0] && i != og){
            sum++;
        }
        i--;
    }
    return sum;
}
function checkRight(i,j){
    sum = 0;
    og = j;
    while (j <= gameMatrix.length-1){
        if (gameMatrix[i][j][1] && j != og){
            break;
        }
        if (gameMatrix[i][j][0] && j != og){
            sum++;
        }
        j++;
    }
    return sum;
}
function checkDown(i,j){
    sum = 0;
    og = i;
    while (i <= gameMatrix.length-1){
        if (gameMatrix[i][j][1] && i != og){
            break;
        }
        if (gameMatrix[i][j][0] && i != og){
            sum++;
        }
        i++
    }
    return sum;
}

function removeBrackets(string){
    temp = "";
    for (let i = 0; i < string.length; i++){
        if (string[i] != "[" && string[i] != "]"){
            temp += string[i];
        }
    }
    return temp;
}

function isOver(){
    for (let i = 0; i < gameMatrix.length; i++){
        for (let j = 0; j < gameMatrix.length; j++){
            if (gameMatrix[i][j][1] && gameMatrix[i][j][2] != -1 && howManyLampsShort(i,j) != gameMatrix[i][j][2]){
                return false;
            }else if (!gameMatrix[i][j][1] && !gameMatrix[i][j][3]){
                return false;
            }else if (gameMatrix[i][j][0] && howManyLampsLong(i,j) > 0){
                return false;
            }
        }
    }
    return true;
}

gameboard.addEventListener("click", function(e){
    if (e.target.tagName == "TD" && !isOver()){
        xy = removeBrackets(e.target.dataset.xy).split(",").map(function(num){ return parseInt(num)});
        swapBulb(xy[0],xy[1]);
        setLights();
        renderTable();
    }
    if (isOver()){
        if (!savedScores){
            highScores.push(new Array());
            highScores[finished][0] = userName;
            highScores[finished][1] = mode;
            end();
            window.localStorage.setItem("savedScores",JSON.stringify(highScores));
            finished++;
            savedScores = true;
        }
        enddiv.hidden = false;
    }
})

gamediv.addEventListener("click", function(e){
    if (e.target.tagName == "BUTTON"){
        saveGame();
        paused = true;
        gamediv.hidden = true;
        loaddiv.hidden = false;
        startdiv.hidden = false;
        highScoresDiv.hidden = false;
        if (isOver()){
            enddiv.hidden = true;
        }
    }
})

lerp = function(a,b,u) {
    return (1-u) * a + u * b;
};

fade = function(element, property, start, end, duration) {
    var interval = 200;
    var steps = duration/interval;
    var step_u = 1.0/steps;
    var u = 0.0;
    var theInterval = setInterval(function(){
    if (u >= 1.0){ clearInterval(theInterval) }
    var r = parseInt(lerp(start.r, end.r, u));
    var g = parseInt(lerp(start.g, end.g, u));
    var b = parseInt(lerp(start.b, end.b, u));
    var colorname = 'rgb('+r+','+g+','+b+')';
    element.style.setProperty(property, colorname);
    u += step_u;
    }, interval);
};

/* property = 'background-color';       // fading property
startColor = {r:255, g:  255, b:  255};  // red
endColor   = {r:  240, g:230, b:140};  // dark turquoise
fade(startdiv,'background-color',startColor,endColor,1000); */

highScoresDiv.addEventListener("click",function(e){
    if  (e.target.tagName == "BUTTON" && e.target.value == "show"){
        if (highScoresListDiv.hidden == true){
            highScoresListDiv.hidden = false;
            s = ``;
            if (highScores[0].length != 0){
                for (let i = 0; i < highScores.length-1; i++){
                    s += `<tr><td>${highScores[i][0]}</td><td>${highScores[i][1]}</td><td>${highScores[i][2]}</td></tr>`
                }
            }
            highScoresList.innerHTML = `<tr><th>Név</th><th>Pálya</th><th>Idő</th></tr>${s}`
        }else{
            highScoresListDiv.hidden = true;
        }
    }else if (e.target.tagName == "BUTTON"){
        window.localStorage.removeItem("savedScores");
        highScores = [[]];
        highScoresList.innerHTML = `<tr><th>Név</th><th>Pálya</th><th>Idő</th></tr>`
    }
})

enddiv.addEventListener("click", function(e){
    if (e.target.tagName == "BUTTON"){
        enddiv.hidden = true;
        gamediv.hidden = true;
        startdiv.hidden = false;
        highScoresDiv.hidden = false;
        mode = "";
        updateSaveList();
        if (savedNames.length == 0){
            saved = false;
            loaddiv.hidden = true;
        }
    }
})