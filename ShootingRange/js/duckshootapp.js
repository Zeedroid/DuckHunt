window.addEventListener("load", eventWindowLoaded, false);

var Debugger = function () { };
Debugger.log = function (message) {
   try {
      console.log(message);
   } catch (exception) {
      return;
   }
}

function eventWindowLoaded () {
   duckShootApp();
   
   
   function duckShootApp() {
		if (!canvasSupport) {
			return;
		}
		
		var backCanvas       = document.getElementById("background-layer");
		var backContext      = backCanvas.getContext("2d");
		var backcloudCanvas  = document.getElementById("backcloud-layer");
		var backcloudContext = backcloudCanvas.getContext("2d");		
		var gameCanvas       = document.getElementById("game-layer");
		var gameContext      = gameCanvas.getContext("2d");
		var cloudCanvas      = document.getElementById("cloud-layer");
		var cloudContext     = cloudCanvas.getContext("2d");		
		var zoomCanvas       = document.getElementById("zoom-layer");
		var zoomContext      = zoomCanvas.getContext("2d");

		
		var health 		   = 100;
		var confidence     = 100;
		var totalDucks     = 0;
		var totalHeads     = 0;
		var totalBodys     = 0;
		var totalScore	   = 0;
		var gameLevel      = 0;
		var gameOver       = false;
		
		var newframeWidth  = 64;
		var newframeHeight = 64;
		var quackDelay     = 10;
		var rotation 	   = 90;
		var dayNightStep   = -1;
		var dayNightChange = 0;
		var dayNightSleep  = 0;
		
		
		// Indicates the depth into the picture that the duck is. Depth 0, indicates largest duck size in the foreground. Depth 3, indicates smallest duck in the background.
		var minimumDepth   = 0;
		var maximumDepth   = 3;
		
		// Indicates the area the duck is in from bottom to top. This is used with the depth variables to indicate the zone the duck is in.
		var minimumLevel   = 0;
		var maximumLevel   = 3;
		
		// Duck Sizes for each depth in pixels.
		var duckSizes	   = [96,64,42,32];
		
		// Current position of sprite images x,y coordinates of top left hand corner
		var position0Now	= [[ 50,100],[700,100],[200,100]];
		var position1Now	= [[100,300],[100,300],[100,300]];
		var position2Now	= [[200,500],[200,500],[200,500]];
		var position3Now	= [[310,310],[310,310],[310,310]];
		var positionsNow 	= [position0Now,position1Now,position2Now];
		
		var position0Next	= [[ 50,100],[700,100],[200,100]];
		var position1Next	= [[100,300],[100,300],[100,300]];
		var position2Next	= [[200,500],[200,500],[200,500]];
		var position3Next	= [[310,310],[310,310],[310,310]];
		var positionsNext 	= [position0Next,position1Next,position2Next];
		

		// Current position ([top left corner x,y], [bottom right corner x,y) of duck's head
		var head0Now	= [[1,1, 1,1],[1,1, 1,1],[1,1, 1,1]];
		var head1Now	= [[1,1, 1,1],[1,1, 1,1],[1,1, 1,1]];
		var head2Now	= [[1,1, 1,1],[1,1, 1,1],[1,1, 1,1]];
		var head3Now	= [[1,1, 1,1],[1,1, 1,1],[1,1, 1,1]];
		var headsNow   = [head0Now,head1Now,head2Now];
		
		var head0Next	= [[1,1, 1,1],[1,1, 1,1],[1,1, 1,1]];
		var head1Next	= [[1,1, 1,1],[1,1, 1,1],[1,1, 1,1]];
		var head2Next	= [[1,1, 1,1],[1,1, 1,1],[1,1, 1,1]]; 
		var head3Next	= [[1,1, 1,1],[1,1, 1,1],[1,1, 1,1]];
		var headsNext   = [head0Next,head1Next,head2Next];	

		
		// Current position ([top left corner x,y], [bottom right corner x,y]) of duck's body
		var body0Now	= [[200,700,42,42],[200, 700, 0,0],[200, 100, 0,0]];
		var body1Now	= [[100,300, 0, 0],[100, 300, 0,0],[100, 300, 0,0]];
		var body2Now	= [[200,500, 0, 0],[200, 500, 0,0],[200, 500, 0,0]];
		var body3Now	= [[310,310, 0, 0],[410, 310, 0,0],[510, 310, 0,0]];
		var bodiesNow   = [body0Now,body1Now,body2Now];

		var body0Next	= [[200,700,42,42],[200, 700, 0,0],[200, 100, 0,0]];
		var body1Next	= [[100,300, 0, 0],[100, 300, 0,0],[100, 300, 0,0]];
		var body2Next	= [[200,500, 0, 0],[200, 500, 0,0],[200, 500, 0,0]];
		var body3Next	= [[310,310, 0, 0],[410, 310, 0,0],[510, 310, 0,0]];
		var bodiesNext  = [body0Next,body1Next,body2Next];
		
			// State of duck. -1 = Dead,  0 = Dying,   1 = Alive
		var duckStateNow   = [[1,1,1],[1,1,1],[1,1,1]];
		
		var duckStateNext  = [[1,1,11],[1,1,1],[1,1,1]];

		
		// Current frame for each duck.[before first sprite, sprite number, number of sprites in group].
		// Three duck sprites flying right : Three duck sprites flying up and right
		// Three duck sprites flying left  : Three duck sprites flying up and left
		// One duck sprite being shot      : Four duck sprites for dying duck
		// Field 0: Sprite Number first sprite shown
		// Field 1: Sprite number of last sprite in set
		// Field 2: Total number of sprites in set.
		// Field 3: Duck Direction. RR(Right), RU(RightUp), RD(RightDown), RB(RightBack), RF(RightForward)
		// Field 4: Direction Loop count. Set of sprites will loop this number of times.
		// Field 5: x direction change per sprite.
		// Field 6: y direction change per sprite.
		// Field 7: Current depth of duck.
		// Field 8: Current level of duck.
		// Field 9: Current x(Width) of sprite
		// Field 10: Current y(Height) of sprite
		var duck0Now  = [[0,2,2,'RR',5,16,3,0,0,96,96],[0,2,2,'RR',2, 16,3,1,0,64,64],[0,2,2,'RR',2,16,3,1,4,64,64]];
		var duck1Now  = [[0,2,2,'RR',2,16,3,0,2,96,96],[0,2,2,'RR',2, 16,3,0,2,96,96],[0,2,2,'RR',2,16,3,0,2,96,96]]; 
		var duck2Now  = [[0,2,2,'RR',2,16,3,1,1,64,64],[0,2,2,'RR',2, 16,3,1,1,64,64],[0,2,2,'RR',2,16,3,1,1,64,64]];
		var duck3Now  = [[0,2,2,'RR',2,16,3,1,3,64,64],[0,2,2,'RR',2, 16,3,1,3,64,64],[0,2,2,'RR',2,16,3,1,3,64,64]];

		var ducksNow  = [duck0Now,duck1Now,duck2Now];
		
		
		var duck0Next  = [[0,2,2,'RR',5,16,3,0,0,96,96],[0,2,2,'RR',2, 16,3,1,0,64,64],[0,2,2,'RR',2,16,3,1,4,64,64]];
		var duck1Next  = [[0,2,2,'RR',2,16,3,0,2,96,96],[0,2,2,'RR',2, 16,3,0,2,96,96],[0,2,2,'RR',2,16,3,0,2,96,96]];
		var duck2Next  = [[0,2,2,'RR',2,16,3,1,1,64,64],[0,2,2,'RR',2, 16,3,1,1,64,64],[0,2,2,'RR',2,16,3,1,1,64,64]];
		var duck3Next  = [[0,2,2,'RR',2,16,3,1,3,64,64],[0,2,2,'RR',2, 16,3,1,3,64,64],[0,2,2,'RR',2,16,3,1,3,64,64]];

		var ducksNext  = [duck0Next,duck1Next,duck2Next];
		
				
		// Frame offset for start of Duck Body (width x and height y) One array for each depth into the canvas(Array 0 Duck is closest, Array 4 Duck is furthest into the distance)

		var duckHeadOffset0  = [[63, 33],[54, 27],[54, 21],[51, 24],[51, 18],[48, 21],[62, 33],[54, 27],[54, 21],[51, 24],[51, 18],[48, 21],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0]];
		var duckHeadOffset1  = [[42, 22],[36, 18],[36, 14],[34, 16],[34, 12],[32, 14],[42, 22],[36, 18],[36, 14],[34, 16],[34, 12],[32, 14],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0]];
		var duckHeadOffset2  = [[32, 17],[27, 14],[27, 11],[26, 12],[26,  9],[24, 11],[32, 17],[27, 14],[27, 11],[26, 12],[26,  9],[24, 11],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0]];
		var duckHeadOffset3  = [[21, 11],[18,  9],[18,  7],[17,  8],[17,  6],[16,  7],[21, 11],[18,  9],[18,  7],[17,  8],[17,  6],[16,  7],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0]];
		
		var duckHeadOffsets  = [duckHeadOffset0,duckHeadOffset1,duckHeadOffset2,duckHeadOffset3];
		
		
		// Frame offset for start of Duck Head (width x and height y) One array for each depth into the canvas
		var duckBodyOffset0  = [[12, 54],[3, 42],[6, 33],[24, 51],[18, 39],[12, 45],[12, 54],[3, 42],[6, 33],[24, 51],[18, 39],[12, 45],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0]];
		var duckBodyOffset1  = [[8,  36],[2, 28],[4, 22],[16, 34],[12, 26],[ 8, 30],[8,  36],[2, 28],[4, 22],[16, 34],[12, 26],[8,  30],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0]];
		var duckBodyOffset2  = [[6,  27],[1, 21],[3, 17],[12, 26],[9,  20],[6,  23],[6,  27],[1, 21],[3, 17],[12, 26],[9,  20],[6,  23],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0]];
		var duckBodyOffset3  = [[4,  18],[1, 14],[2, 11],[8,  17],[6,  13],[4,  15],[4,  18],[1, 14],[2, 11],[8,  17],[6,  13],[4,  15],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0]];

		
		var duckBodyOffsets  = [duckBodyOffset0,duckBodyOffset1,duckBodyOffset2,duckBodyOffset3];
		
		
		// Size of each ducks head (width and height) for each frame. One array for each depth into the canvas
		var duckHeadSize0	= [[24, 22],[27, 24],[27, 21],[27, 21],[24, 21],[24, 21],[24, 21],[27, 24],[27, 21],[27, 21],[24, 21],[24, 21],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0]];
		var duckHeadSize1	= [[16, 14],[18, 16],[18, 14],[18, 14],[16, 14],[16, 14],[16, 14],[18, 16],[18, 14],[18, 14],[16, 14],[16, 14],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0]];
		var duckHeadSize2	= [[12, 11],[14, 12],[14, 11],[14, 11],[12, 11],[12, 11],[12, 11],[14, 12],[14, 11],[14, 11],[12, 11],[12, 11],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0]];		
		var duckHeadSize3	= [[8,   7],[9,   8],[9,   7],[9,   7],[8,   7],[8,   7],[8,   7],[9,   8],[9,   7],[9,   7],[8,   7],[8,   7],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0]];
		
		var duckHeadSizes   = [duckHeadSize0,duckHeadSize1,duckHeadSize2,duckHeadSize3];
			
		// Size of each ducks body (width and height) for each frame. One array for each depth into the canvas.
		var duckBodySize0	= [[45, 24],[45, 24],[45, 24],[39, 36],[39, 24],[36, 27],[45, 24],[45, 24],[45, 24],[39, 36],[36, 24],[36, 27],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0]];
		var duckBodySize1	= [[30, 15],[30, 16],[30, 16],[26, 24],[24, 16],[24, 18],[30, 16],[30, 16],[30, 16],[26, 24],[24, 16],[24, 18],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0]];
		var duckBodySize2	= [[23, 12],[23, 12],[23, 12],[20, 18],[18, 12],[18, 14],[23, 12],[23, 12],[23, 12],[20, 18],[18, 12],[18, 14],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0]];		
		var duckBodySize3	= [[15,  8],[15,  8],[15,  8],[13, 12],[12,  8],[12,  9],[15,  8],[15,  8],[15,  8],[13, 12],[12,  8],[12,  9],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0]];
		
		var duckBodySizes   = [duckBodySize0,duckBodySize1,duckBodySize2,duckBodySize3];

		// Different Areas of screen Level 1 at bottom, Level 4 at top. Used for tracking ducks.
		var screenLevels    = [[676,899],[451,675],[226,450],[0,160]];
		
		var screenDepth     = [[0,899],[0,550],[0,300],[0,150]];		





		var message = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
	
		// Setup duck sounds

		var backgroundSound  = new Audio();                                 
		var backSrc  = document.createElement("source");
		backSrc.type = "audio/mpeg";
		backSrc.src  = "sounds/240-mallards-flying.mp3";
		backgroundSound.appendChild(backSrc);

		var quackDuck0_0  = new Audio();
		var src00  = document.createElement("source");
		src00.type = "audio/mpeg";
		src00.src  = "sounds/223-mallard-feed-call.mp3";
		quackDuck0_0.appendChild(src00);
		
		var quackDuck0_1  = new Audio();
		var src01  = document.createElement("source");
		src01.type = "audio/mpeg";
		src01.src  = "sounds/quack1.mp3";
		quackDuck0_1.appendChild(src01);
		
		var quackDuck0_2  = new Audio();
		var src02  = document.createElement("source");
		src02.type = "audio/mpeg";
		src02.src  = "sounds/223-mallard-duck-timber-call.mp3";
		quackDuck0_2.appendChild(src02);
		
		var quackDuck1_0  = new Audio();
		var src10  = document.createElement("source");
		src10.type = "audio/mpeg";
		src10.src  = "sounds/223-mallard-comeback-call-2.mp3";
		quackDuck1_0.appendChild(src10);
		
		var quackDuck1_1  = new Audio();
		var src11  = document.createElement("source");
		src11.type = "audio/mpeg";
		src11.src  = "sounds/quack2.mp3";
		quackDuck1_1.appendChild(src11);
		
		var quackDuck1_2  = new Audio();
		var src12  = document.createElement("source");
		src12.type = "audio/mpeg";
		src12.src  = "sounds/234-mallard-greeting-call.mp3";
		quackDuck1_2.appendChild(src12);
		
		var quackDuck2_0  = new Audio();
		var src20  = document.createElement("source");
		src20.type = "audio/mpeg";
		src20.src  = "sounds/238-mallard-hail-call.mp3";
		quackDuck2_0.appendChild(src20);
		
		var quackDuck2_1  = new Audio();
		var src21  = document.createElement("source");
		src21.type = "audio/mpeg";
		src21.src  = "sounds/quack3.mp3";
		quackDuck2_1.appendChild(src21);

		var quackDuck2_2  = new Audio();
		var src22  = document.createElement("source");
		src22.type = "audio/mpeg";
		src22.src  = "sounds/quack4.mp3";
		quackDuck2_2.appendChild(src22);		
		
		var duckSounds	= [[quackDuck0_0,quackDuck0_1,quackDuck0_2],[quackDuck1_0,quackDuck1_1,quackDuck1_2],[quackDuck2_0,quackDuck2_1,quackDuck2_2]];
		
		// Setup Rifle Sounds
		var gun1   = new Audio("sounds/Winchester12-RA_The_Sun_God-1722751268.mp3");
		var gun2   = new Audio("sounds/shotgun-mossberg590-RA_The_Sun_God-451502290.mp3");	


		// Load Raindrop Images and particle variables
		var raindrop1 = new Image();
		var raindrop2 = new Image();
		var raindrop3 = new Image();
		
		raindrop1.src = "images/raindrop1.png";
		raindrop2.src = "images/raindrop2.png";
		raindrop3.src = "images/raindrop3.png";

		var maximumRaindrops = 230;		
		var rain            = [];
		var rainInterval    = null;
		var animFrame;
		
		// Load Background Image
		var background = new Image();
			background.src = "images/pondBackground2.bmp";
			background.onload = function(){
				backContext.drawImage(background,0,0,1280,899,0,0,1280,899);
				if (navigator.userAgent.search("Firefox") < 0) {
					alert("Duck Hunt must be run within FireFox Browser!");
					return;
				}
			}
	
		// Load the sprite Images
		var spriteSheet = new Image();
			spriteSheet.src = "images/MySpritesX.png";
			spriteSheet.addEventListener("load", loadImage, false);
			
	
		// Starts the rain animation process
		function startRain(timems) {
			rain = [];
			rainInterval = setInterval(addRaindrop, timems);
			animFrame = window.requestAnimationFrame(animate);
		}

		// loops through the rain animation
		function animate() {
			moveRaindrops();
			showRaindrops();
			animFrame = window.requestAnimationFrame(animate);
		}

		// adds all raindrops into array
		function addRaindrop() {
			rain[rain.length] = new Raindrop();
			if (rain.length == maximumRaindrops)
				clearInterval(rainInterval);
		}

		// creates a single riandrop object
		function Raindrop() {
			this.x = Math.round(Math.random() * cloudContext.canvas.width);
			this.y = -10;
			this.moveX = 4;
			this.moveY = Math.round(Math.random() / 4) + 12;

			switch (getRandomNumber(1, 3)){
				case 1:
					this.rainDrop = getRaindrop(raindrop1);
					break;
				case 2:
					this.rainDrop = getRaindrop(raindrop2);
					break;
				case 3:
					this.rainDrop = getRaindrop(raindrop3);
					break;					
			}
		}
		
		function getRaindrop(raindrop){
			return raindrop;
		}	

		// changes the position of all the raindrops in array
		function moveRaindrops() {
			for (var i = 0; i < rain.length; i++) {
				if (rain[i].y < cloudContext.canvas.height) {
					rain[i].y += rain[i].moveY;
					if (rain[i].y > cloudContext.canvas.height)
						rain[i].y = -1;

					rain[i].x += rain[i].moveX;
					if (rain[i].x > cloudContext.canvas.width)
						rain[i].x = 0;
				}
			}
		}

		// displayes all the raindrops on the canvas
		function showRaindrops() {
			cloudContext.clearRect(0, 0, cloudContext.canvas.width, cloudContext.canvas.height);
			for (var i = 0; i < rain.length; i++) {
				cloudContext.drawImage(rain[i].rainDrop, rain[i].x, rain[i].y);
			}
		}		
	

	
	// Changes the sceen from Day to Night. Background image and all sprites are changes
		function dayToNight(){
			if (dayNightSleep === 1){
				var pixels = backContext.getImageData(0,0,backCanvas.width,backCanvas.height);

				for (var i=0; i < pixels.data.length; i+=4){
					pixels.data[i]   = pixels.data[i] + dayNightStep;
					pixels.data[i+1] = pixels.data[i+1] + dayNightStep;
					pixels.data[i+2] = pixels.data[i+2] + dayNightStep;
					pixels.data[i+3] = pixels.data[i+3];
				}
				backContext.putImageData(pixels,0,0);
				dayNightChange = dayNightChange + dayNightStep;
				dayNightSleep = 0;
			}else {
				dayNightSleep = 1;
			}
			
			var sprites = gameContext.getImageData(0,0,gameCanvas.width,gameCanvas.height);
			for (var j=0; j < sprites.data.length; j+=4){
				sprites.data[j]   = sprites.data[j] + dayNightChange;
				sprites.data[j+1] = sprites.data[j+1] + dayNightChange;
				sprites.data[j+2] = sprites.data[j+2] + dayNightChange;
				sprites.data[j+3] = sprites.data[j+3];
			}
			gameContext.putImageData(sprites,0,0);
			
			if (dayNightChange < -150 ){
				levelChange();
			}
		}
	
	// The Level will change at the end of each day, or when all ducks have been shot.
		function levelChange(){
			dayNightChange = 0;
			gameLevel++;
			gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
			document.getElementById("gameLevel").innerHTML = gameLevel;
			background = new Image();
			background.src = "images/pondBackground2.bmp";
			background.onload = function(){
				backContext.drawImage(background,0,0,1280,899,0,0,1280,899);
			}
			
			duckStateNext   = [[1,1,1],[1,1,1],[1,1,1]];
			
			position0Next	= [[-100,700],[-200,600],[1480,100]];
			position1Next	= [[-50 ,540],[-200,500],[1300,600]];
			position2Next	= [[-150,270],[-250,300],[1330,400]];
			position3Next	= [[-50, 180],[-100,100],[1290,150]];

			positionsNext = [position0Next,position1Next,position2Next];
		
			duck0Next  = [[0,2,2,'RR', 40,24,0,0,0,96,96],[0,2,2,'RU', 25,24,0,0,1,96,96],[6,8,2,'LD',35,-24,0,0,2,96,96]];
			duck1Next  = [[0,2,2,'RD', 60,16,0,1,1,64,64],[0,2,2,'RR',40,16,0,1,1,64,64],[6,8,2,'LU',45,-16,0,1,2,64,64]];
			duck2Next  = [[0,2,2,'RR', 70, 8,0,3,3,32,32],[0,2,2,'RR', 30, 12,0,2,2,42,42],[6,8,2,'LL',45, -12,0,2,3,42,42]];
			duck3Next  = [[0,2,2,'RR', 70, 8,0,3,3,32,32],[0,2,2,'RD',35, 8,0,3,3,32,32],[6,8,2,'LL',60, -8,0,3,3,32,32]];

			ducksNext  = [duck0Next,duck1Next,duck2Next];
			
			backgroundSound.pause();
			backgroundSound.currentTime = 0;
			backgroundSound.play();		// Background sound started at the beginning of every level.
		}
	
	// Changes to see if all ducks have been killed and are no longer showing on the screen
		function checkAllDucksDead(){
			for (var i=0; i < duckStateNext.length; i++){
				for (var j=0; j < duckStateNext[i].length; j++){
					if (duckStateNext[i][j] != -1) return;
				}
			}
			levelChange();
		}

	// MonseDown event fires the gun. If mouse position is within the head or body of the duck the status will change to Shot and the duck will die.	
		window.addEventListener("mousedown", function(evt) {
			var mousePos   = getMousePos(zoomCanvas, evt);
			gun1.play();

			for (var i=0; i < headsNow.length; i++){
				for (var j=0; j < headsNow[i].length; j++){
					if ( duckStateNow[i][j] === 1){
						if ( headsNow[i][j][0] <= mousePos.x & headsNow[i][j][1] <= mousePos.y &
							headsNow[i][j][2] >= mousePos.x & headsNow[i][j][3] >= mousePos.y){
								duckStateNext[i][j] = 0;
								addScoreToTotal('H',ducksNow[i][j][7]);
								ducksNext[i][j] = [12,12,0,'DH',1,0,0,ducksNow[i][j][7],ducksNow[i][j][8],ducksNow[i][j][9],ducksNow[i][j][10]];
								duckSounds[i][j].pause();
						}
						if ( bodiesNow[i][j][0] <= mousePos.x & bodiesNow[i][j][1] <= mousePos.y &
							 bodiesNow[i][j][2] >= mousePos.x & bodiesNow[i][j][3] >= mousePos.y){
								duckStateNext[i][j] = 0;
								addScoreToTotal('B',ducksNow[i][j][7]);
								ducksNext[i][j] = [12,12,0,'DH',1,0,0,ducksNow[i][j][7],ducksNow[i][j][8],ducksNow[i][j][9],ducksNow[i][j][10]];
								duckSounds[i][j].pause();								
						}
					}
				}
			}
		}, false);

		
		window.addEventListener('mousemove', function(evt) {
			var mousePos = getMousePos(zoomCanvas, evt);
			var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
		}, false);

	
	// returns the current mouse position.
		function getMousePos(zoomCanvas, evt) {
			var rect = zoomCanvas.getBoundingClientRect();
			return {
				x: evt.clientX - rect.left,
				y: evt.clientY - rect.top
			};
		}

	// Checks to see if HTML Canvas is supported in the canvas.	
		function canvasSupport () {
			return Modernizr.canvas;
		}


		

		
	

	// This function activated the ducks. 
		function loadImage(e){
			levelChange()
			showDucks();
			startRain(250);
		}
		

	// Overwrites the current position of the Ducks with the new position of the ducks	
		function copyNextToNow(duckType,duckNum){
			positionsNow[duckType][duckNum] = positionsNext[duckType][duckNum];
			headsNow[duckType][duckNum] = headsNext[duckType][duckNum];
			bodiesNow[duckType][duckNum] = bodiesNext[duckType][duckNum];
			ducksNow[duckType][duckNum] = ducksNext[duckType][duckNum];
			duckStateNow[duckType][duckNum] = duckStateNext[duckType][duckNum];
		}			
					
	
	// This is the main control function that runs in a continuous loop. 
	// It controls the movement and display of ducks, checks for collission detection, and changes the level from day to night.
	// Ducks are sorted by depest level first before display to ensure closest ducks are shown ontop of ducks behind.
	// Because of collission detection a duck may have been unable to complete its move between depths. A function is run to sort out any issues.
		function showDucks(){
			gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

			var depthCheck = [[0,0]];
			
			for (var i=0; i <= (ducksNext.length - 1); i++){    
				for (var j=0; j < ducksNext[i].length; j++){
					if ( duckStateNext[i][j] != -1 && ducksNext[i][j][7] === 3 ){						
						depthCheck.push([i,j]);
					}
				}
			}
			for (var i=0; i <= (ducksNext.length - 1); i++){    
				for (var j=0; j < ducksNext[i].length; j++){
					if ( duckStateNext[i][j] != -1 && ducksNext[i][j][7] === 2 ){
						depthCheck.push([i,j]);
						
					}
				}
			}
			for (var i=0; i <= (ducksNext.length - 1); i++){    
				for (var j=0; j < ducksNext[i].length; j++){
					if ( duckStateNext[i][j] != -1 && ducksNext[i][j][7] === 1 ){
						depthCheck.push([i,j]);
						
					}
				}
			}
			for (var i=0; i <= (ducksNext.length - 1); i++){    
				for (var j=0; j < ducksNext[i].length; j++){
					if ( duckStateNext[i][j] != -1 && ducksNext[i][j][7] === 0 ){
						depthCheck.push([i,j]);
						
					}
				}
			}
			depthCheck.splice(0, 1);

			for (var i=0; i <= (depthCheck.length - 1); i++){    
					collissionDetection(depthCheck[i][0],depthCheck[i][1]);
					showDuck((positionsNext[depthCheck[i][0]][depthCheck[i][1]][0]) + ducksNext[depthCheck[i][0]][depthCheck[i][1]][5],
							 (positionsNext[depthCheck[i][0]][depthCheck[i][1]][1]) + ducksNext[depthCheck[i][0]][depthCheck[i][1]][6], 32, 32, depthCheck[i][0], depthCheck[i][1], ducksNext[depthCheck[i][0]][depthCheck[i][1]][9], ducksNext[depthCheck[i][0]][depthCheck[i][1]][10]);
			}

			for (var i=0; i <= (ducksNext.length - 1); i++){    
				for (var j=0; j < ducksNext[i].length; j++){
					if ( ducksNext[i][j][3].substr(0,1) != 'B' && ducksNext[i][j][3].substr(0,1) != 'F'){
						correctDepthLevel(i,j);
					}
				}
			}

			dayToNight();
			checkAllDucksDead();
	
			setTimeout(function() {
					requestAnimationFrame(function() {showDucks();});
				},100);
		}	

		// If current position of duck is not within the area specified for the current depth, thenoutside of that expected by the 
		function correctDepthLevel(duckType,duckNum){
			var currentDepth      = ducksNext[duckType][duckNum][7];
			var currentYpos       = positionsNext[duckType][duckNum][1];
			var duckWidth         = ducksNext[duckType][duckNum][9];
			var expectedDepthPos  = screenDepth[currentDepth];
			var expectedDuckWidth = duckSizes[ducksNext[duckType][duckNum][7]];

			if (currentYpos > expectedDepthPos){
				 ducksNext[duckType][duckNum][7] = newDepth(currentYpos);
			}
			if ( duckWidth != expectedDuckWidth){
				ducksNext[duckType][duckNum][9] = duckSizes[ducksNext[duckType][duckNum][7]];
				ducksNext[duckType][duckNum][10] = duckSizes[ducksNext[duckType][duckNum][7]];
			}

		}
		
		/*    position incorrect   CurrentDepth = 2    CurrentWidth = 42   CurrentPosition = 359   */
		function newDepth(duckPos){
			var currentDepth   = 3; //ducksNext[duckType][duckNum][7];
			var maxScreenDepth = screenDepth[ducksNext[duckType][duckNum][7]][1];
			
			while (currentDepth != 0){
				if (duckPos > screenDepth[currentDepth][1]){
					currentDepth--;
				}else {
					break;
				}
			}
			return currentDepth;
		}

		
		
		
	// Checks for Collission detection	
		function collissionDetection(duckType,duckNum){
			
			var newDirection = '';
			
			var myStartX = positionsNext[duckType][duckNum][0];
			var myStartY = positionsNext[duckType][duckNum][1];
			var myEndX   = myStartX + ducksNext[duckType][duckNum][9];
			var myEndY	 = myStartY + ducksNext[duckType][duckNum][10];
			var myDepth  = ducksNext[duckType][duckNum][7];
			var myDirection = ducksNext[duckType][duckNum][3];

			
			var duckStartX = 0;
			var duckStartY = 0;
			var duckEndX   = 0;
			var duckEndY   = 0;
			var duckDepth  = 0;
			var duckDirection = '';
			var depthEnd   = 0;
			var depthEdge  = 0;
			
			switch (myDepth){
				case 0:
					depthEnd = gameCanvas.height;
					depthEdge = 30;
					break;
				case 1:
					depthEnd = 676;
					depthEdge = 25;
					break;
				case 2:
					depthEnd = 451;
					depthEdge = 17;
					break;
				case 3:
					depthEnd = 226;
					depthEdge = 8;
					break;
			}

			if (((myStartX - depthEdge) <= 0) || ((myStartY - depthEdge) <= 0) ||
				((myEndX + depthEdge) >= gameCanvas.width) ||((myEndY + depthEdge) >= depthEnd)){
				if (duckStateNext[duckType][duckNum] === 1){
					if ((myStartX - depthEdge) <= 0){
						if (myStartY <= 200) newDirection = 'RD';
						else if (myStartY >= 700) newDirection = 'RU';
						else newDirection = 'RR';
					}else if ((myEndX + depthEdge) >= gameCanvas.width) {
						if (myStartY <= 200) newDirection = 'LD';
						else if (myStartY >= 700) newDirection = 'LU';
						else newDirection = 'LL';
					}else if ((myStartY - depthEdge) <= 0){
						if (myStartX <= 640) newDirection = 'RD'
						else newDirection = 'LD';
					}else if ((myEndY + depthEdge) >= depthEnd){
						if (myStartX <= 600) newDirection = 'RU'
						else newDirection = 'LU';					
					} 
					if (newDirection != '' && myDirection != newDirection){
						changeDuckPath(duckType,duckNum,myStartX,myStartY,newDirection);
					}
				}else{
					switch (myDepth){
						case 0:
							if (myEndY >= 899) duckStateNext[duckType][duckNum] = -1;
						case 1:
							if (myEndY >= 675) duckStateNext[duckType][duckNum] = -1;
						case 2:
							if (myEndY >= 450) duckStateNext[duckType][duckNum] = -1;
						case 3:
							if (myEndY >= 226) duckStateNext[duckType][duckNum] = -1;
					}
				}
				return;
			}


			if (myDepth === minimumDepth){
				if (myStartX <=640){
					newDirection = 'RB';
				} else{
					newDirection = 'LB';
				}
				changeDuckPath(duckType,duckNum,myStartX,myStartY,newDirection);
				return;
			}else if (myDepth === maximumDepth){
				if (myStartX <=640){
					newDirection = 'RF';
				} else{
					newDirection = 'LF';
				}
				changeDuckPath(duckType,duckNum,myStartX,myStartY,newDirection);
				return;
			}

			
			for (var c=0; c < positionsNext.length; c++){
				for (var d=0; d < positionsNext[c].length; d++){

					if (c === duckType && d === duckNum) continue;		// Duck's can not collide with themselves.
					
					duckStartX = positionsNext[c][d][0] + ducksNext[c][d][5];
					duckStartY = positionsNext[c][d][1] + ducksNext[c][d][6];
					duckEndX   = duckStartX + ducksNext[c][d][9];
					duckEndY   = duckStartY + ducksNext[c][d][10];
					duckDepth  = ducksNext[c][d][7];
					duckDirection = ducksNext[c][d][3];

					if (myDepth != duckDepth) continue;					// You can not collide with ducks at other depth's.
					if (duckStateNext[c][d] === -1) continue;					// Ducks are dead and not visible.
					if (duckDirection.substring(1,1) === 'B' ||
					    duckDirection.substring(1,1) === 'F') continue; // When a duck is moving forwards and backwards they are between depths

					if ((myEndY > (duckStartY - 20)) && (myStartY < (duckEndY + 20)) &&
						(myEndX > (duckStartX - 20)) && (myStartX < (duckEndX + 20))){
					     changeDuckPath(duckType,duckNum,duckStartX,duckStartY,"D");
					}
				}
			}
		}
	
	// Changes a ducks flight path by selecting a new random movement based on a set on weighted allowed moves
		function changeDuckPath(duckType,duckNum,duckStartX,duckStartY,changeType){
			setRandomMovement(duckType,duckNum,duckStartX,duckStartY,changeType);
		}

	
	// Displays one duck. Makes sure the correct sequence of sprites are shown in the right order for the type of movement made.
		function showDuck(x, y, imgX, imgY, duckType, duckNum){

			var currX = x;
			var currY = y;
			var frameWidth = imgX;
			var frameHeight = imgY;
			
			var duckDirection = ducksNext[duckType][duckNum][3];   	// RR = Right, RU = RightUp, RD = RightDown etc
			var duckDirLoop   = ducksNext[duckType][duckNum][4];   	// Direction loop sequence of sprites.
			var duckXMove     = ducksNext[duckType][duckNum][5];   	// Each sprite moves X pixels
			var duckYMove     = ducksNext[duckType][duckNum][6];		// Each sprite moves Y pixels
			var duckXPixels	  = ducksNext[duckType][duckNum][9];		// Sprite pixels x(width)
			var duckYPixels	  = ducksNext[duckType][duckNum][10];		// Sprite pixels y(height)
			var duckDepth     = ducksNext[duckType][duckNum][7];		// Duck Depth in canvas. 0= Duck close to Front(Large), 3= Duck is in the distance(Small).
			
			var duckFrame = ducksNext[duckType][duckNum][0];

			// Calculate the number of pixels to shift in sprite list, before getting next sprite
			var shiftX = (duckFrame * frameWidth) + (duckFrame * 4);
			var shiftY = (duckType * frameHeight) + (duckType * 4);
			
			// Find the total number of sprites in the current sequence
			var totalFrames = ducksNext[duckType][duckNum][1];
			

				//draw each frame + place them in the middle
			gameContext.drawImage(spriteSheet, shiftX, shiftY, frameWidth, frameHeight,	currX, currY, duckXPixels, duckYPixels);
			
			copyNextToNow(duckType,duckNum);
			
			if (duckFrame === totalFrames) {
				if (ducksNext[duckType][duckNum][4] != 1){
					ducksNext[duckType][duckNum][0] = totalFrames - ducksNext[duckType][duckNum][2];
					ducksNext[duckType][duckNum][4] = ducksNext[duckType][duckNum][4] - 1;
//					playDuckSound(1,1);
					storeDuckPosition(duckType,duckNum,(ducksNext[duckType][duckNum][0] + 1),currX,currY,duckDepth);
				}else {
					storeDuckPosition(duckType,duckNum,(ducksNext[duckType][duckNum][0]),currX,currY,duckDepth);
					setRandomMovement(duckType,duckNum,currX,currY,'S');
//					if ( ducksNext[i][j][3].substr(1,1) != 'B' && ducksNext[i][j][3].substr(1,1) != 'F' ){
						playDuckSound(duckType,duckNum,ducksNext[duckType][duckNum][7]);
//					}
					
				}
			}else {
				duckFrame++;
				ducksNext[duckType][duckNum][0] = duckFrame;		
				storeDuckPosition(duckType,duckNum,duckFrame,currX,currY,duckDepth);
			}
		}
		

	// Returns a random number between a minimum and maximum number. Used to decide how many itterations of a certain move shown be done before the movement type is changed. 	
		function getRandomNumber(min, max) {
			return Math.floor(Math.random() * (max + 1 - min)) + min;
		}
	
	
	// Returns the current Level on the screen for a duck after it has moved.
	// The screen is split into 4 levels from level 0 at the bottom quarter of the screen to level 3 at the top.
		function getCurrentLevel(level, newY){
			for (var i = 0; i <= (screenLevels.length - 1); i++){
				if (newY >= screenLevels[i][0] && newY <= screenLevels[i][1]) return i;
			}
			return level;
		}
	
	// Randomely select the next valid movement a duck can take based on the previous move made
		function setRandomMovement(duckType,duckNum,imgX,imgY,action){
			var lastMove      = ducksNext[duckType][duckNum][3];
			var nextMove      = "";
			var depth		  = ducksNext[duckType][duckNum][7];

			if (action != 'S' && action != 'D') nextMove = action;
			else nextMove = getNewDirection(duckType,duckNum,lastMove,action);

			ducksNext[duckType][duckNum][3] = nextMove;						  		  // Next Move, Direction.

			switch (nextMove){
				case 'DH':   // Duck Shot
					ducksNext[duckType][duckNum][1]  = 12;								  // Last Frame
					ducksNext[duckType][duckNum][2]  = 0;								  // Number of Frames
					ducksNext[duckType][duckNum][0]  = 12;								  // First Frame
					ducksNext[duckType][duckNum][4]  = 1;								  // Frames Loop
					ducksNext[duckType][duckNum][9]  = ducksNext[duckType][duckNum][9]  - 20; // Width of sprite in pixels
					ducksNext[duckType][duckNum][10] = ducksNext[duckType][duckNum][10] - 20; // Height of sprite in pixels
					break;			
				case 'DD1':   // Duck Dying 1
					ducksNext[duckType][duckNum][0] = 13;
					ducksNext[duckType][duckNum][1] = 13;
					ducksNext[duckType][duckNum][2] = 0;
					ducksNext[duckType][duckNum][4] = 1;
					break;	
				case 'DD2':  // Duck Dying 2
					ducksNext[duckType][duckNum][0] = 14;
					ducksNext[duckType][duckNum][1] = 14;
					ducksNext[duckType][duckNum][2] = 0;
					ducksNext[duckType][duckNum][4] = 1;
					break;	
				case 'DD3':  // Duck Dying 3
					ducksNext[duckType][duckNum][0] = 15;
					ducksNext[duckType][duckNum][1] = 15;
					ducksNext[duckType][duckNum][2] = 0;
					ducksNext[duckType][duckNum][4] = 1;
					break;	
				case 'DD4':  // Duck Dying 4
					ducksNext[duckType][duckNum][0] = 16;
					ducksNext[duckType][duckNum][1] = 16;
					ducksNext[duckType][duckNum][2] = 0;
					ducksNext[duckType][duckNum][4] = 1;
					break;									
				case 'RR':  // Duck Right
					ducksNext[duckType][duckNum][0] = 0;
					ducksNext[duckType][duckNum][1] = 2;
					ducksNext[duckType][duckNum][2] = 2;
					ducksNext[duckType][duckNum][4] = getRandomNumber(4,10);
					break;
				case 'RU':	// Right and Up
					ducksNext[duckType][duckNum][0] = 3;
					ducksNext[duckType][duckNum][1] = 5;
					ducksNext[duckType][duckNum][2] = 2;
					ducksNext[duckType][duckNum][4] = getRandomNumber(4,10);					
					break;
				case 'RL1':	// Right to Left 1
					ducksNext[duckType][duckNum][0] = 3;
					ducksNext[duckType][duckNum][1] = 5;
					ducksNext[duckType][duckNum][2] = 2;
					ducksNext[duckType][duckNum][4] = getRandomNumber(4,8);					
					break;
				case 'RL2':	// Right to Left 2
					ducksNext[duckType][duckNum][0] = 9;
					ducksNext[duckType][duckNum][1] = 11;
					ducksNext[duckType][duckNum][2] = 2;
					ducksNext[duckType][duckNum][4] = getRandomNumber(4,8);					
					break;
				case 'RD':	// Right and Down
					ducksNext[duckType][duckNum][0] = 0;
					ducksNext[duckType][duckNum][1] = 2;
					ducksNext[duckType][duckNum][2] = 2;
					ducksNext[duckType][duckNum][4] = getRandomNumber(4,10);					
					break;			
				case 'RB':	// Right and Back
					ducksNext[duckType][duckNum][0] = 3;
					ducksNext[duckType][duckNum][1] = 5;
					ducksNext[duckType][duckNum][2] = 2;
					ducksNext[duckType][duckNum][4] = 1;
					ducksNext[duckType][duckNum][7] = ducksNext[duckType][duckNum][7] + 1;					
					ducksNext[duckType][duckNum][9]  = ducksNext[duckType][duckNum][9]  - 3; // Width of sprite in pixels
					ducksNext[duckType][duckNum][10] = ducksNext[duckType][duckNum][10] - 3; // Height of sprite in pixels	
					break;
				case 'RB1':	// Right and Back 1
					ducksNext[duckType][duckNum][0] = 3;
					ducksNext[duckType][duckNum][1] = 5;
					ducksNext[duckType][duckNum][2] = 2;
					ducksNext[duckType][duckNum][4] = 8;
					ducksNext[duckType][duckNum][9]  = ducksNext[duckType][duckNum][9]  - 3; // Width of sprite in pixels
					ducksNext[duckType][duckNum][10] = ducksNext[duckType][duckNum][10] - 3; // Height of sprite in pixels	
					break;
					
				case 'RF':	// Right and Forward
					ducksNext[duckType][duckNum][0] = 0;
					ducksNext[duckType][duckNum][1] = 2;
					ducksNext[duckType][duckNum][2] = 2;
					ducksNext[duckType][duckNum][4] = 1;
					ducksNext[duckType][duckNum][7] = ducksNext[duckType][duckNum][7] - 1;					
					ducksNext[duckType][duckNum][9]  = ducksNext[duckType][duckNum][9]  + 3; // Width of sprite in pixels
					ducksNext[duckType][duckNum][10] = ducksNext[duckType][duckNum][10] + 3; // Height of sprite in pixels	
					break;	
				case 'RF1':	// Right and Forward 1
					ducksNext[duckType][duckNum][0] = 0;
					ducksNext[duckType][duckNum][1] = 2;
					ducksNext[duckType][duckNum][2] = 2;
					ducksNext[duckType][duckNum][4] = 8;
					ducksNext[duckType][duckNum][9]  = ducksNext[duckType][duckNum][9]  + 3; // Width of sprite in pixels
					ducksNext[duckType][duckNum][10] = ducksNext[duckType][duckNum][10] + 3; // Height of sprite in pixels	
					break;
				case 'LL':	// Left
					ducksNext[duckType][duckNum][0] = 6;
					ducksNext[duckType][duckNum][1] = 8;
					ducksNext[duckType][duckNum][2] = 2;
					ducksNext[duckType][duckNum][4] = getRandomNumber(4,10);					
					break;
				case 'LU':	// Left and Up
					ducksNext[duckType][duckNum][0] = 9;
					ducksNext[duckType][duckNum][1] = 11;
					ducksNext[duckType][duckNum][2] = 2;
					ducksNext[duckType][duckNum][4] = getRandomNumber(4,10);					
					break;
				case 'LR1':	// Left to Right 1
					ducksNext[duckType][duckNum][0] = 9;
					ducksNext[duckType][duckNum][1] = 11;
					ducksNext[duckType][duckNum][2] = 2;
					ducksNext[duckType][duckNum][4] = getRandomNumber(4,8);					
					break;
				case 'LR2':	// Left to Right 2
					ducksNext[duckType][duckNum][0] = 3;
					ducksNext[duckType][duckNum][1] = 5;
					ducksNext[duckType][duckNum][2] = 2;
					ducksNext[duckType][duckNum][4] = getRandomNumber(4,8);					
					break;
				case 'LD':	// Left and Down
					ducksNext[duckType][duckNum][0] = 6;
					ducksNext[duckType][duckNum][1] = 8;
					ducksNext[duckType][duckNum][2] = 2;
					ducksNext[duckType][duckNum][4] = getRandomNumber(4,10);					
					break;
				case 'LB':	// Left and Back
					ducksNext[duckType][duckNum][0] = 6;
					ducksNext[duckType][duckNum][1] = 8;
					ducksNext[duckType][duckNum][2] = 2;
					ducksNext[duckType][duckNum][4] = 1;
					ducksNext[duckType][duckNum][7] = ducksNext[duckType][duckNum][7] + 1;					
					ducksNext[duckType][duckNum][9]  = ducksNext[duckType][duckNum][9]  - 3; // Width of sprite in pixels
					ducksNext[duckType][duckNum][10] = ducksNext[duckType][duckNum][10] - 3; // Height of sprite in pixels	
					break;
				case 'LB1':	// Left and Back 1
					ducksNext[duckType][duckNum][0] = 6;
					ducksNext[duckType][duckNum][1] = 8;
					ducksNext[duckType][duckNum][2] = 2;
					ducksNext[duckType][duckNum][4] = 8;
					ducksNext[duckType][duckNum][9]  = ducksNext[duckType][duckNum][9]  - 3; // Width of sprite in pixels
					ducksNext[duckType][duckNum][10] = ducksNext[duckType][duckNum][10] - 3; // Height of sprite in pixels	
					break;
				case 'LF':	// Left and Forward
					ducksNext[duckType][duckNum][0] = 6;
					ducksNext[duckType][duckNum][1] = 8;
					ducksNext[duckType][duckNum][2] = 2;
					ducksNext[duckType][duckNum][4] = 1;
					ducksNext[duckType][duckNum][7] = ducksNext[duckType][duckNum][7] - 1;					
					ducksNext[duckType][duckNum][9]  = ducksNext[duckType][duckNum][9]  + 3; // Width of sprite in pixels
					ducksNext[duckType][duckNum][10] = ducksNext[duckType][duckNum][10] + 3; // Height of sprite in pixels	
					break;
				case 'LF1':	// Left and Forward 1
					ducksNext[duckType][duckNum][0] = 6;
					ducksNext[duckType][duckNum][1] = 8;
					ducksNext[duckType][duckNum][2] = 2;
					ducksNext[duckType][duckNum][4] = 8;
					ducksNext[duckType][duckNum][9]  = ducksNext[duckType][duckNum][9]  + 3; // Width of sprite in pixels
					ducksNext[duckType][duckNum][10] = ducksNext[duckType][duckNum][10] + 3; // Height of sprite in pixels	
					break;
				default:	// Default. Should never be called.
					ducksNext[duckType][duckNum][0] = 9;
					ducksNext[duckType][duckNum][1] = 11;
					ducksNext[duckType][duckNum][2] = 2;
					ducksNext[duckType][duckNum][4] = 1;
					break;
			}
			
			var moveXY        = getXandYMovement(nextMove,depth);
			var moveX         = moveXY.x;
			var moveY         = moveXY.y;

			ducksNext[duckType][duckNum][5] = moveX;							  								// Next Move will be moveX pixels on x axis
			ducksNext[duckType][duckNum][6] = moveY;															// Next Move will be moveY pixels on y axis
			ducksNext[duckType][duckNum][8] = getCurrentLevel(ducksNext[duckType][duckNum][8],imgY + moveY);  // New level after move takes place
		}
		
		

	// Selects a new direction for the duck	to take based on the previous diorection moved.
		function getNewDirection(duckType,duckNum,lastMove,action){
			var options = [];
			var nextMove = "";

			// Checks to see if a duck has reached either the minimum or maximum Depth into the picture or level on the screen and sets a bias movement against the movement options to change
			// the direction away from the extremeties of the scene.
			if (action === 'S' || action === 'D'){
				if (lastMove.substring(0,1) != 'D'){
					if (lastMove.substring(0,1) === 'R'){
						if (ducksNext[duckType][duckNum][7] === maximumDepth) options.push('RF','RF');
						else options.push('RB');
						if (ducksNext[duckType][duckNum][7] === minimumDepth) options.push('RB','RB');
						else options.push('RF');
						if (lastMove.substring(1,1) === 'U'){
							if (ducksNext[duckType][duckNum][8] === maximumLevel) options.push('RD','RD');
							else options.push('RU');
						}
						if (lastMove.substring(1,1) === 'D'){
							if (ducksNext[duckType][duckNum][8] === minimumLevel) options.push('RU','RU');
							else options.push('RD');
						}		
					}else {
						if (ducksNext[duckType][duckNum][7] === maximumDepth) options.push('LF','LF');
						else options.push('LB');
						if (ducksNext[duckType][duckNum][7] === minimumDepth) options.push('LB','LB');	
						else options.push('LF');
						if (lastMove.substring(1,1) === 'U'){
							if (ducksNext[duckType][duckNum][8] === maximumLevel) options.push('LD','LD');
							else options.push('LU');
						}
						if (lastMove.substring(1,1) === 'D'){
							if (ducksNext[duckType][duckNum][8] === minimumLevel) options.push('LU','LU');	
							else options.push('LD');
						}						
					}
				}
			}

			// Deals with normal movement of ducks that do not require object avoidance.
			// Movements can be linked together to create a sequence of moves by allowing only one movement option that links to another movement. DH > DD1 > DD2 > DD3 > DD4 > DD1
			// or by adding a list of valid directions to an options array for random selection.
			if (action === 'S'){
				switch (lastMove){
					case 'DH':
						options.push('DD1');
						break;
					case 'DD1':
						options.push('DD2');
						break;
					case 'DD2':
						options.push('DD3');
						break;
					case 'DD3':
						options.push('DD4');
						break;
					case 'DD4':
						options.push('DD1');
						break;					
					case 'RR':
						if (ducksNext[duckType][duckNum][7] != maximumDepth) options.push('RB');
						if (ducksNext[duckType][duckNum][7] != minimumDepth) options.push('RF');	
						options.push('RR','RR','RL1','RU','RD','RD'); 
						break;
					case 'RU':
						if (ducksNext[duckType][duckNum][7] != maximumDepth) options.push('RB');
						if (ducksNext[duckType][duckNum][7] != minimumDepth) options.push('RF');						
						options.push('RR','RR','RL','LU','RU');
						break;
					case 'RL1':
						options.push('RL2');
						break;
					case 'RL2':
						options.push('LL','LL'); 
						break;		
					case 'RD':
						if (ducksNext[duckType][duckNum][7] != minimumDepth) options.push('RF');		
						options.push('RR','RR','RD','LD');
						break;			
					case 'RB':
						options.push('RB1');
						break;	
					case 'RB1':
						options.push('RR','RR','RU'); 
						break;
					case 'RF':
						options.push('RF1');
						break;
					case 'RF1':
						options.push('RR','RR','RD');
						break;
					case 'LL':
						if (ducksNext[duckType][duckNum][7] != maximumDepth) options.push('LB');
						if (ducksNext[duckType][duckNum][7] != minimumDepth) options.push('LF');		
						options.push('LL','LL','LR1','LU','LD','LD');
						break;
					case 'LU':
						if (ducksNext[duckType][duckNum][7] != maximumDepth) options.push('LB');
						if (ducksNext[duckType][duckNum][7] != minimumDepth) options.push('LF');
						options.push('LL','LL','LR1','RU','LU');
						break;
					case 'LR1':
						options.push('LR2');
						break;
					case 'LR2':
						options.push('RR','RR');
						break;			
					case 'LD':
						if (ducksNext[duckType][duckNum][7] != minimumDepth) options.push('LF');		
						options.push('LL','LL','LD','RD');
						break;
					case 'LB':
						options.push('LB1');
						break;
					case 'LB1':
						options.push('LL','LL','LU');
						break;
					case 'LF':
						options.push('LF1');
						break;
					case 'LF1':
						options.push('LL','LL','LD');
						break;
					default:
						options.push('LL','RR');
						break;
				}
			}else {
			// Deals with normal object avoidance.
			// Assigns the best direction to avoid another duck.		
				switch (lastMove){
					case 'DH':
						options.push('DD1');
						break;
					case 'DD1':
						options.push('DD2');
						break;
					case 'DD2':
						options.push('DD3');
						break;
					case 'DD3':
						options.push('DD4');
						break;
					case 'DD4':
						options.push('DD1');
						break;					
					case 'RR':
						options.push('LL');
						break;
					case 'RU':
						options.push('LD');
						break;
					case 'RL1':
						options.push('LU');
						break;
					case 'RL2':
						options.push('LU');
						break;		
					case 'RD':
						options.push('LU');
						break;			
					case 'RB':
						options.push('LB1');
						break;	
					case 'RB1':
						options.push('LB1');
						break;
					case 'RF':
						options.push('LF1');
						break;
					case 'RF1':
						options.push('LF1');
						break;
					case 'LL':
						options.push('LD');
						break;
					case 'LU':
						options.push('RD');
						break;
					case 'LR1':
						options.push('RU');
						break;
					case 'LR2':
						options.push('RU');
						break;			
					case 'LD':
						options.push('LU');
						break;
					case 'LB':
						options.push('RB1');
						break;
					case 'LB1':
						options.push('RB1');
						break;
					case 'LF':
						options.push('RF1');
						break;
					case 'LF1':
						options.push('RF1');
						break;
					default:
						options.push('LL','LU','LD','LB','LF','RR','RU','RD','RB','RF');
						break;
				}
			}

			// randomely select the next direction the duck will take from the list of valid movement options.
			nextMove = options[Math.floor(Math.random()*options.length)];

			return nextMove;
		}
	

	// returns the number of pixels the duck will move on the x and y axis 
		function getXandYMovement(nextMove,depth){
			var moveX = 0;
			var moveY = 0;
			
			switch (nextMove){
				case 'DH':
					moveX  = 0;								  // Move x
					moveY  = 0;								  // Move y
					break;			
				case 'DD1':
					switch (depth){
						case 0:
							moveX = 9
							moveY = 32;
							break;
						case 1:
							moveX = 6;
							moveY = 24;
							break;
						case 2:
							moveX = 4;
							moveY = 16;
							break;
						case 3:
							moveX =	2;
							moveY =	10;
							break;
					}
					break;	
				case 'DD4':
					switch (depth){
						case 0:
							moveX = 9
							moveY = 32;
							break;
						case 1:
							moveX = 6;
							moveY = 24;
							break;
						case 2:
							moveX = 4;
							moveY = 16;
							break;
						case 3:
							moveX =	2;
							moveY =	10;
							break;
					}
					break;						
				case 'DD2':
					switch (depth){
						case 0:
							moveX = -9;
							moveY = 32;
							break;
						case 1:
							moveX = -6;
							moveY = 24;
							break;
						case 2:
							moveX = -4;
							moveY = 16;
							break;
						case 3:
							moveX =	-2;
							moveY =	10;
							break;
					}		
					break;	
				case 'DD3':
					switch (depth){
						case 0:
							moveX = -9;
							moveY = 32;
							break;
						case 1:
							moveX = -6;
							moveY = 24;
							break;
						case 2:
							moveX = -4;
							moveY = 16;
							break;
						case 3:
							moveX =	-2;
							moveY =	10;
							break;
					}		
					break;	
				case 'RR':
					switch (depth){
						case 0:				
							moveX = 24;
							break;
						case 1:
							moveX = 16;
							break;
						case 2:
							moveX = 12;
							break;
						case 3:
							moveX = 8;
							break;
					}
					moveY = 0;
					break;
				case 'RU':
					switch (depth){
						case 0:				
							moveX = 12;
							moveY = -18;
							break;
						case 1:
							moveX = 8;
							moveY = -12;
							break;
						case 2:
							moveX = 6;
							moveY = -9;
							break;
						case 3:
							moveX =	4;
							moveY =	-6;
							break;
					}		
					break;
				case 'RL1':
					switch (depth){
						case 0:				
							moveX = 12;
							moveY = -18;
							break;
						case 1:
							moveX = 8;
							moveY = -12;
							break;
						case 2:
							moveX = 6;
							moveY = -9;
							break;
						case 3:
							moveX =	4;
							moveY =	-6;
							break;
					}		
					break;					
				case 'RL2':
					switch (depth){
						case 0:								
							moveX = -12;
							moveY = -18;
							break;
						case 1:
							moveX = -8;
							moveY = -12;
							break;
						case 2:
							moveX = -6;
							moveY = -9;
							break;
						case 3:
							moveX =	-4;
							moveY =	-6;
							break;
					}									
					break;
				case 'LU':
					switch (depth){
						case 0:								
							moveX = -12;
							moveY = -18;
							break;
						case 1:
							moveX = -8;
							moveY = -12;
							break;
						case 2:
							moveX = -6;
							moveY = -9;
							break;
						case 3:
							moveX =	-4;
							moveY =	-6;
							break;
					}									
					break;					
				case 'LD':
					switch (depth){
						case 0:								
							moveX = -12;
							moveY = 18;
							break;
						case 1:
							moveX = -8;
							moveY = 12;
							break;
						case 2:
							moveX = -6;
							moveY = 9;
							break;
						case 3:
							moveX =	-4;
							moveY =	6;
							break;
					}									
					break;
				case 'RD':
					switch (depth){
						case 0:
							moveX = 12;
							moveY = 18;
							break;
						case 1:
							moveX = 8;
							moveY = 12;
							break;
						case 2:
							moveX = 6;
							moveY = 9;
							break;
						case 3:
							moveX =	4;
							moveY =	6;
							break;
					}
					break;			
				case 'RB':
					switch (depth){
						case 0:				
							moveX = 12;
							moveY = -18;
							break;
						case 1:
							moveX = 8;
							moveY = -12;
							break;
						case 2:
							moveX = 6;
							moveY = -9;
							break;
						case 3:
							moveX =	4;
							moveY =	-6;
							break;
					}							
					break;
				case 'RB1':
					switch (depth){
						case 0:				
							moveX = 12;
							moveY = -18;
							break;
						case 1:
							moveX = 8;
							moveY = -12;
							break;
						case 2:
							moveX = 6;
							moveY = -9;
							break;
						case 3:
							moveX =	4;
							moveY =	-6;
							break;
					}							
					break;					
				case 'RF':
					switch (depth){
						case 0:		
							moveX = 12;
							moveY = 18;
							break;
						case 1:
							moveX = 8;
							moveY = 12;
							break;
						case 2:
							moveX = 6;
							moveY = 9;
							break;
						case 3:
							moveX =	4;
							moveY =	6;
							break;
					}										
					break;
				case 'RF1':
					switch (depth){
						case 0:		
							moveX = 12;
							moveY = 18;
							break;
						case 1:
							moveX = 8;
							moveY = 12;
							break;
						case 2:
							moveX = 6;
							moveY = 9;
							break;
						case 3:
							moveX =	4;
							moveY =	6;
							break;
					}										
					break;						
				case 'LL':
					switch (depth){
						case 0:		
							moveX = -24;
							break;
						case 1:
							moveX = -16;
							break;
						case 2:
							moveX = -12;
							break;
						case 3:
							moveX =	-8;
							break;
					}
					moveY = 0;
					break;
				case 'LB':
					switch (depth){
						case 0:		
							moveX = -12;
							moveY = -18;
							break;
						case 1:
							moveX = -8;
							moveY = -12;
							break;
						case 2:
							moveX = -6;
							moveY = -9;
							break;
						case 3:
							moveX =	-4;
							moveY =	-6;
							break;
					}
					break;
				case 'LB1':
					switch (depth){
						case 0:		
							moveX = -12;
							moveY = -18;
							break;
						case 1:
							moveX = -8;
							moveY = -12;
							break;
						case 2:
							moveX = -6;
							moveY = -9;
							break;
						case 3:
							moveX =	-4;
							moveY =	-6;
							break;
					}
					break;	
				case 'LF':
					switch (depth){
						case 0:		
							moveX = -12;
							moveY = 18;
							break;
						case 1:
							moveX = -8;
							moveY = 12;
							break;
						case 2:
							moveX = -6;
							moveY = 9;
							break;
						case 3:
							moveX =	-4;
							moveY =	6;
							break;
					}
					break;
				case 'LF1':
					switch (depth){
						case 0:		
							moveX = -12;
							moveY = 18;
							break;
						case 1:
							moveX = -8;
							moveY = 12;
							break;
						case 2:
							moveX = -6;
							moveY = 9;
							break;
						case 3:
							moveX =	-4;
							moveY =	6;
							break;
					}
					break;	
				case 'LR1':
					switch (depth){
						case 0:				
							moveX = -12;
							moveY = -18;
							break;
						case 1:
							moveX = -8;
							moveY = -12;
							break;
						case 2:
							moveX = -6;
							moveY = -9;
							break;
						case 3:
							moveX =	-4;
							moveY =	-6;
							break;
					}		
					break;					
				case 'LR2':
					switch (depth){
						case 0:								
							moveX = 12;
							moveY = -18;
							break;
						case 1:
							moveX = 8;
							moveY = -12;
							break;
						case 2:
							moveX = 6;
							moveY = -9;
							break;
						case 3:
							moveX =	6;
							moveY =	-6;
							break;
					}									
					break;					
				default:
					moveX = 9;
					moveY = 16;
					break;
			}
			return {
				x: moveX,
				y: moveY
			};
		}
	

	// Stores the start and end coordinates for the ducks head, ducks body, and starting position 
		function storeDuckPosition(duckType,duckNum,duckFrame,currX,currY,duckDepth){
			var bodyXStart = currX + duckBodyOffsets[duckDepth][duckFrame][0];
			var bodyYStart = currY + duckBodyOffsets[duckDepth][duckFrame][1];
			var bodyXEnd   = bodyXStart + duckBodySizes[duckDepth][duckFrame][0];
			var bodyYEnd   = bodyYStart   + duckBodySizes[duckDepth][duckFrame][1];
			var headXStart = currX + duckHeadOffsets[duckDepth][duckFrame][0];
			var headYStart = currY + duckHeadOffsets[duckDepth][duckFrame][1];
			var headXEnd   = headXStart + duckHeadSizes[duckDepth][duckFrame][0];
			var headYEnd   = headYStart   + duckHeadSizes[duckDepth][duckFrame][1];
			
			headsNext[duckType][duckNum] = [headXStart,headYStart,headXEnd,headYEnd];
			bodiesNext[duckType][duckNum] = [bodyXStart,bodyYStart,bodyXEnd,bodyYEnd];
			positionsNext[duckType][duckNum] = [currX,currY];
		}			
	
	
	// Duck sounds are assigned to a group of ducks.
		function playDuckSound(duckType,duckNum,depth){
			duckSounds[duckType][duckNum].pause();
			duckSounds[duckType][duckNum].volume = setDuckVolume(depth);
			duckSounds[duckType][duckNum].play();
		}
		
	// Changed the volumn based on current depth.	
		function setDuckVolume(depth){
			var volume = 0.0;
			
			switch (depth){
				case 0:
					volume = 0.26;
					break;
				case 1:
					volume = 0.2;
					break;
				case 2:
					volume = 0.12;
					break;
				default:
					volume = 0.07;
			}

			return volume;
		}

	
	//  Adds the score to the Totals and displays new totals.
		function addScoreToTotal(headOrBody,depth){
			totalDucks++;
			var shotScore = 0;
			if (headOrBody === 'H'){
				shotScore = 150;
				totalHeads++;
			}else {
				shotScore = 100;
				totalBodys++;
			}
			
			shotScore = shotScore + ((shotScore / 100) * (depth * 20));
			totalScore = totalScore + shotScore;
			document.getElementById("totalDucks").innerHTML = totalDucks;
			document.getElementById("totalHeads").innerHTML = totalHeads;
			document.getElementById("totalBodys").innerHTML = totalBodys;
			document.getElementById("totalScore").innerHTML = totalScore;
		}
		
   }

}
