"use strict";
var gameboy = null;						//GameBoyCore object.
var gbRunInterval = null;				//GameBoyCore Timer
var gbRunRAF = null;					//GameBoyCore rAF handle
var gbRAFAccumulator = 0;				//Accumulated elapsed ms for fixed-step emulation
var gbRAFLastTimestamp = 0;			//Last rAF timestamp
var gbMobileProfileApplied = false;	//One-time mobile audio/perf tuning
var settings = [						//Some settings.
	true, 								//Turn on sound.
	true,								//Boot with boot ROM first?
	false,								//Give priority to GameBoy mode
	1,									//Volume level set.
	true,								//Colorize GB mode?
	false,								//Disallow typed arrays?
	8,									//Interval for the emulator loop.
	10,									//Audio buffer minimum span amount over x interpreter iterations.
	20,									//Audio buffer maximum span amount over x interpreter iterations.
	false,								//Override to allow for MBC1 instead of ROM only (compatibility for broken 3rd-party cartridges).
	false,								//Override MBC RAM disabling and always allow reading and writing to the banks.
	false,								//Use the GameBoy boot ROM instead of the GameBoy Color boot ROM.
	false,								//Scale the canvas in JS, or let the browser scale the canvas?
	true,								//Use image smoothing based scaling?
	[true, true, true, true]            //User controlled channel enables.
];

// Helper for console output (missing in original code)
function cout(message, level) {
	const prefix = "[GameBoyIO] ";
	if (level === 1 || level === 2) {
		console.warn(prefix + message);
	} else {
		console.log(prefix + message);
	}
}

function isDocumentVisible() {
	return !document.hidden && !document.msHidden && !document.mozHidden && !document.webkitHidden;
}

function shouldUseRAFScheduler() {
	var ua = navigator.userAgent || "";
	var uaMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone/i.test(ua);
	var uaDataMobile = navigator.userAgentData && navigator.userAgentData.mobile === true;
	var touchPoints = (navigator.maxTouchPoints || 0) > 0;
	var coarsePointer = false;
	try {
		coarsePointer = typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;
	}
	catch (error) {
		coarsePointer = false;
	}
	return (uaMobile || uaDataMobile || (touchPoints && coarsePointer)) && typeof window.requestAnimationFrame === "function";
}

function applyMobilePerformanceProfile() {
	if (gbMobileProfileApplied) {
		return;
	}

	if (shouldUseRAFScheduler()) {
		settings[7] = Math.max(settings[7], 18);
		settings[8] = Math.max(settings[8], 36);
	}

	gbMobileProfileApplied = true;
}

function runWithRAF() {
	var emulationStep = Math.max(1, settings[6] | 0);
	gbRAFAccumulator = 0;
	gbRAFLastTimestamp = 0;

	var tick = function (timestamp) {
		if (!GameBoyEmulatorInitialized() || !GameBoyEmulatorPlaying()) {
			gbRunRAF = null;
			return;
		}

		if (gbRAFLastTimestamp === 0) {
			gbRAFLastTimestamp = timestamp;
		}

		if (!isDocumentVisible()) {
			gbRAFAccumulator = 0;
			gbRAFLastTimestamp = timestamp;
			gbRunRAF = window.requestAnimationFrame(tick);
			return;
		}

		var delta = timestamp - gbRAFLastTimestamp;
		gbRAFLastTimestamp = timestamp;

		if (delta > 250) {
			delta = 250;
		}

		gbRAFAccumulator += delta;

		var maxCatchUpSteps = 4;
		var steps = 0;
		while (gbRAFAccumulator >= emulationStep && steps < maxCatchUpSteps) {
			gameboy.run();
			gbRAFAccumulator -= emulationStep;
			++steps;
		}

		if (steps >= maxCatchUpSteps) {
			gbRAFAccumulator = Math.min(gbRAFAccumulator, emulationStep * maxCatchUpSteps);
		}

		gbRunRAF = window.requestAnimationFrame(tick);
	};

	gbRunRAF = window.requestAnimationFrame(tick);
}

function stopSchedulers() {
	if (gbRunInterval) {
		clearInterval(gbRunInterval);
		gbRunInterval = null;
	}
	if (gbRunRAF) {
		if (typeof window.cancelAnimationFrame === "function") {
			window.cancelAnimationFrame(gbRunRAF);
		}
		gbRunRAF = null;
	}
	gbRAFAccumulator = 0;
	gbRAFLastTimestamp = 0;
}

function start(canvas, ROM) {
	applyMobilePerformanceProfile();
	clearLastEmulation();
	autoSave();	//If we are about to load a new game, then save the last one...
	gameboy = new GameBoyCore(canvas, ROM);
	gameboy.openMBC = openSRAM;
	gameboy.openRTC = openRTC;
	gameboy.start();
	run();
}
function run() {
	if (GameBoyEmulatorInitialized()) {
		if (!GameBoyEmulatorPlaying()) {
			gameboy.stopEmulator &= 1;
			cout("Starting the iterator.", 0);
			var dateObj = new Date();
			gameboy.firstIteration = dateObj.getTime();
			gameboy.iterations = 0;

			stopSchedulers();
			if (shouldUseRAFScheduler()) {
				runWithRAF();
			}
			else {
				gbRunInterval = setInterval(function () {
					if (isDocumentVisible()) {
						gameboy.run();
					}
				}, settings[6]);
			}
		}
		else {
			cout("The GameBoy core is already running.", 1);
		}
	}
	else {
		cout("GameBoy core cannot run while it has not been initialized.", 1);
	}
}
function pause() {
	if (GameBoyEmulatorInitialized()) {
		if (GameBoyEmulatorPlaying()) {
			autoSave();
			clearLastEmulation();
		}
		else {
			cout("GameBoy core has already been paused.", 1);
		}
	}
	else {
		cout("GameBoy core cannot be paused while it has not been initialized.", 1);
	}
}
function clearLastEmulation() {
	if (GameBoyEmulatorInitialized() && GameBoyEmulatorPlaying()) {
		stopSchedulers();
		gameboy.stopEmulator |= 2;
		cout("The previous emulation has been cleared.", 0);
		if (gameboy.canvas) {
			var ctx = gameboy.canvas.getContext("2d");
			if (ctx) {
				ctx.clearRect(0, 0, gameboy.canvas.width, gameboy.canvas.height);
			}
		}
	}
	else {
		cout("No previous emulation was found to be cleared.", 0);
	}
}
function save() {
	if (GameBoyEmulatorInitialized()) {
		var state_suffix = 0;
		while (findValue("FREEZE_" + gameboy.name + "_" + state_suffix) != null) {
			state_suffix++;
		}
		saveState("FREEZE_" + gameboy.name + "_" + state_suffix);
	}
	else {
		cout("GameBoy core cannot be saved while it has not been initialized.", 1);
	}
}
function saveSRAM() {
	if (GameBoyEmulatorInitialized()) {
		if (gameboy.cBATT) {
			try {
				var sram = gameboy.saveSRAMState();
				if (sram.length > 0) {
					cout("Saving the SRAM...", 0);
					if (findValue("SRAM_" + gameboy.name) != null) {
						//Remove the outdated storage format save:
						cout("Deleting the old SRAM save due to outdated format.", 0);
						deleteValue("SRAM_" + gameboy.name);
					}
					setValue("B64_SRAM_" + gameboy.name, arrayToBase64(sram));
				}
				else {
					cout("SRAM could not be saved because it was empty.", 1);
				}
			}
			catch (error) {
				cout("Could not save the current emulation state(\"" + error.message + "\").", 2);
			}
		}
		else {
			cout("Cannot save a game that does not have battery backed SRAM specified.", 1);
		}
		saveRTC();
	}
	else {
		cout("GameBoy core cannot be saved while it has not been initialized.", 1);
	}
}
function saveRTC() {	//Execute this when SRAM is being saved as well.
	if (GameBoyEmulatorInitialized()) {
		if (gameboy.cTIMER) {
			try {
				cout("Saving the RTC...", 0);
				setValue("RTC_" + gameboy.name, gameboy.saveRTCState());
			}
			catch (error) {
				cout("Could not save the RTC of the current emulation state(\"" + error.message + "\").", 2);
			}
		}
	}
	else {
		cout("GameBoy core cannot be saved while it has not been initialized.", 1);
	}
}
function autoSave() {
	if (GameBoyEmulatorInitialized()) {
		cout("Automatically saving the SRAM.", 0);
		saveSRAM();
		saveRTC();
	}
}
function openSRAM(filename) {
	try {
		if (findValue("B64_SRAM_" + filename) != null) {
			cout("Found a previous SRAM state (Will attempt to load).", 0);
			return base64ToArray(findValue("B64_SRAM_" + filename));
		}
		else if (findValue("SRAM_" + filename) != null) {
			cout("Found a previous SRAM state (Will attempt to load).", 0);
			return findValue("SRAM_" + filename);
		}
		else {
			cout("Could not find any previous SRAM copy for the current ROM.", 0);
		}
	}
	catch (error) {
		cout("Could not open the  SRAM of the saved emulation state.", 2);
	}
	return [];
}
function openRTC(filename) {
	try {
		if (findValue("RTC_" + filename) != null) {
			cout("Found a previous RTC state (Will attempt to load).", 0);
			return findValue("RTC_" + filename);
		}
		else {
			cout("Could not find any previous RTC copy for the current ROM.", 0);
		}
	}
	catch (error) {
		cout("Could not open the RTC data of the saved emulation state.", 2);
	}
	return [];
}
function saveState(filename) {
	if (GameBoyEmulatorInitialized()) {
		try {
			setValue(filename, gameboy.saveState());
			cout("Saved the current state as: " + filename, 0);
		}
		catch (error) {
			cout("Could not save the current emulation state(\"" + error.message + "\").", 2);
		}
	}
	else {
		cout("GameBoy core cannot be saved while it has not been initialized.", 1);
	}
}
function openState(filename, canvas) {
	try {
		if (findValue(filename) != null) {
			try {
				clearLastEmulation();
				cout("Attempting to run a saved emulation state.", 0);
				gameboy = new GameBoyCore(canvas, "");
				gameboy.savedStateFileName = filename;
				gameboy.returnFromState(findValue(filename));
				run();
			}
			catch (error) {
				alert(error.message + " file: " + error.fileName + " line: " + error.lineNumber);
			}
		}
		else {
			cout("Could not find the save state " + filename + "\".", 2);
		}
	}
	catch (error) {
		cout("Could not open the saved emulation state.", 2);
	}
}
function import_save(blobData) {
	blobData = decodeBlob(blobData);
	if (blobData && blobData.blobs) {
		if (blobData.blobs.length > 0) {
			for (var index = 0; index < blobData.blobs.length; ++index) {
				cout("Importing blob \"" + blobData.blobs[index].blobID + "\"", 0);
				if (blobData.blobs[index].blobContent) {
					if (blobData.blobs[index].blobID.substring(0, 5) == "SRAM_") {
						setValue("B64_" + blobData.blobs[index].blobID, base64(blobData.blobs[index].blobContent));
					}
					else {
						setValue(blobData.blobs[index].blobID, JSON.parse(blobData.blobs[index].blobContent));
					}
				}
				else if (blobData.blobs[index].blobID) {
					cout("Save file imported had blob \"" + blobData.blobs[index].blobID + "\" with no blob data interpretable.", 2);
				}
				else {
					cout("Blob chunk information missing completely.", 2);
				}
			}
		}
		else {
			cout("Could not decode the imported file.", 2);
		}
	}
	else {
		cout("Could not decode the imported file.", 2);
	}
}
function generateBlob(keyName, encodedData) {
	//Append the file format prefix:
	var saveString = "EMULATOR_DATA";
	var consoleID = "GameBoy";
	//Figure out the length:
	var totalLength = (saveString.length + 4 + (1 + consoleID.length)) + ((1 + keyName.length) + (4 + encodedData.length));
	//Append the total length in bytes:
	saveString += to_little_endian_dword(totalLength);
	//Append the console ID text's length:
	saveString += to_byte(consoleID.length);
	//Append the console ID text:
	saveString += consoleID;
	//Append the blob ID:
	saveString += to_byte(keyName.length);
	saveString += keyName;
	//Now append the save data:
	saveString += to_little_endian_dword(encodedData.length);
	saveString += encodedData;
	return saveString;
}
function generateMultiBlob(blobPairs) {
	var consoleID = "GameBoy";
	//Figure out the initial length:
	var totalLength = 13 + 4 + 1 + consoleID.length;
	//Append the console ID text's length:
	var saveString = to_byte(consoleID.length);
	//Append the console ID text:
	saveString += consoleID;
	var keyName = "";
	var encodedData = "";
	//Now append all the blobs:
	for (var index = 0; index < blobPairs.length; ++index) {
		keyName = blobPairs[index][0];
		encodedData = blobPairs[index][1];
		//Append the blob ID:
		saveString += to_byte(keyName.length);
		saveString += keyName;
		//Now append the save data:
		saveString += to_little_endian_dword(encodedData.length);
		saveString += encodedData;
		//Update the total length:
		totalLength += 1 + keyName.length + 4 + encodedData.length;
	}
	//Now add the prefix:
	saveString = "EMULATOR_DATA" + to_little_endian_dword(totalLength) + saveString;
	return saveString;
}
function decodeBlob(blobData) {
	/*Format is as follows:
		- 13 byte string "EMULATOR_DATA"
		- 4 byte total size (including these 4 bytes).
		- 1 byte Console type ID length
		- Console type ID text of 8 bit size
		blobs {
			- 1 byte blob ID length
			- blob ID text (Used to say what the data is (SRAM/freeze state/etc...))
			- 4 byte blob length
			- blob length of 32 bit size
		}
	*/
	var length = blobData.length;
	var blobProperties = {};
	blobProperties.consoleID = null;
	var blobsCount = -1;
	blobProperties.blobs = [];
	if (length > 17) {
		if (blobData.substring(0, 13) == "EMULATOR_DATA") {
			var length = Math.min(((blobData.charCodeAt(16) & 0xFF) << 24) | ((blobData.charCodeAt(15) & 0xFF) << 16) | ((blobData.charCodeAt(14) & 0xFF) << 8) | (blobData.charCodeAt(13) & 0xFF), length);
			var consoleIDLength = blobData.charCodeAt(17) & 0xFF;
			if (length > 17 + consoleIDLength) {
				blobProperties.consoleID = blobData.substring(18, 18 + consoleIDLength);
				var blobIDLength = 0;
				var blobLength = 0;
				for (var index = 18 + consoleIDLength; index < length;) {
					blobIDLength = blobData.charCodeAt(index++) & 0xFF;
					if (index + blobIDLength < length) {
						blobProperties.blobs[++blobsCount] = {};
						blobProperties.blobs[blobsCount].blobID = blobData.substring(index, index + blobIDLength);
						index += blobIDLength;
						if (index + 4 < length) {
							blobLength = ((blobData.charCodeAt(index + 3) & 0xFF) << 24) | ((blobData.charCodeAt(index + 2) & 0xFF) << 16) | ((blobData.charCodeAt(index + 1) & 0xFF) << 8) | (blobData.charCodeAt(index) & 0xFF);
							index += 4;
							if (index + blobLength <= length) {
								blobProperties.blobs[blobsCount].blobContent = blobData.substring(index, index + blobLength);
								index += blobLength;
							}
							else {
								cout("Blob length check failed, blob determined to be incomplete.", 2);
								break;
							}
						}
						else {
							cout("Blob was incomplete, bailing out.", 2);
							break;
						}
					}
					else {
						cout("Blob was incomplete, bailing out.", 2);
						break;
					}
				}
			}
		}
	}
	return blobProperties;
}
function matchKey(key) {	//Maps a keyboard key to a gameboy key.
	//Order: Right, Left, Up, Down, A, B, Select, Start
	var keymap = ["right", "left", "up", "down", "a", "b", "select", "start"];	//Keyboard button map.
	for (var index = 0; index < keymap.length; index++) {
		if (keymap[index] == key) {
			return index;
		}
	}
	return -1;
}
function GameBoyEmulatorInitialized() {
	return (typeof gameboy == "object" && gameboy != null);
}
function GameBoyEmulatorPlaying() {
	return ((gameboy.stopEmulator & 2) == 0);
}
function GameBoyKeyDown(key) {
	if (GameBoyEmulatorInitialized() && GameBoyEmulatorPlaying()) {
		GameBoyJoyPadEvent(matchKey(key), true);
	}
}
function GameBoyJoyPadEvent(keycode, down) {
	if (GameBoyEmulatorInitialized() && GameBoyEmulatorPlaying()) {
		if (keycode >= 0 && keycode < 8) {
			gameboy.JoyPadEvent(keycode, down);
		}
	}
}
function GameBoyKeyUp(key) {
	if (GameBoyEmulatorInitialized() && GameBoyEmulatorPlaying()) {
		GameBoyJoyPadEvent(matchKey(key), false);
	}
}
function GameBoyGyroSignalHandler(e) {
	if (GameBoyEmulatorInitialized() && GameBoyEmulatorPlaying()) {
		if (e.gamma || e.beta) {
			gameboy.GyroEvent(e.gamma * Math.PI / 180, e.beta * Math.PI / 180);
		}
		else {
			gameboy.GyroEvent(e.x, e.y);
		}
		try {
			e.preventDefault();
		}
		catch (error) { }
	}
}
//The emulator will call this to sort out the canvas properties for (re)initialization.
function initNewCanvas() {
	if (GameBoyEmulatorInitialized()) {
		gameboy.canvas.width = gameboy.canvas.clientWidth;
		gameboy.canvas.height = gameboy.canvas.clientHeight;
	}
}
//Call this when resizing the canvas:
function initNewCanvasSize() {
	if (GameBoyEmulatorInitialized()) {
		if (!settings[12]) {
			if (gameboy.onscreenWidth != 160 || gameboy.onscreenHeight != 144) {
				gameboy.initLCD();
			}
		}
		else {
			if (gameboy.onscreenWidth != gameboy.canvas.clientWidth || gameboy.onscreenHeight != gameboy.canvas.clientHeight) {
				gameboy.initLCD();
			}
		}
	}
}

// Helper functions moved from base64.js
function to_little_endian_dword(str) {
	return to_little_endian_word(str) + to_little_endian_word(str >> 16);
}
function to_little_endian_word(str) {
	return to_byte(str) + to_byte(str >> 8);
}
function to_byte(str) {
	return String.fromCharCode(str & 0xFF);
}
function arrayToBase64(arrayIn) {
	var binString = "";
	var length = arrayIn.length;
	for (var index = 0; index < length; ++index) {
		if (typeof arrayIn[index] == "number") {
			binString += String.fromCharCode(arrayIn[index]);
		}
	}
	return window.btoa(binString);
}
function base64ToArray(b64String) {
	var binString = window.atob(b64String);
	var outArray = [];
	var length = binString.length;
	for (var index = 0; index < length;) {
		outArray.push(binString.charCodeAt(index++) & 0xFF);
	}
	return outArray;
}
function base64(data) {
	return window.btoa(data);
}
