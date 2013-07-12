/*	Kronometro Tomata - Pomodoro-style Javascript Timer
*	Copyright (C) 2013  Kyle Alexander Thompson (Kyle.Alexander.Thompson@gmail.com)
*
*	This program is free software: you can redistribute it and/or modify
*	it under the terms of the GNU General Public License as published by
*	the Free Software Foundation, either version 3 of the License, or
*	(at your option) any later version.
*
*	This program is distributed in the hope that it will be useful,
*	but WITHOUT ANY WARRANTY; without even the implied warranty of
*	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*	GNU General Public License for more details.
*
*	You should have received a copy of the GNU General Public License
*	along with this program.  If not, see <http://www.gnu.org/licenses/>.*/

(function(){
$(document).ready(function() {

	//Load the settings defined at the end of the file
	loadSettings();

	//Set variables for each time setting to the values held in local storage
	setpom = localStorage.getItem("pomodoro") * 60;
	shrtbreak = localStorage.getItem("shortbreak") * 60;
	lngbreak = localStorage.getItem("longbreak") * 60;

	//Set switch to be used in pausing the timer with keystroke
	timerswitch = false;

	//Load alarm tone
	alarm = new Audio("./audio/alarm.wav");

	//Check if timerstorageseconds is set to a value
	if(localStorage.getItem("timerstorageseconds")) {
		restartTimer();
	}
	//Otherwise set timerdisplay to the normal pomodoro duration with autostart set to false
	else {
		handleTimer(setpom, false);
	}

	//Initializes and starts the Pomodoro
	$("#pomodorobutton").click(function(){
		//Pass setpom to handleTimer
		handleTimer(setpom, true);
	});

	//Initializes and starts the short break
	$("#shortbreakbutton").click(function(){
		//Pass shrtbreak to handleTimer
		handleTimer(shrtbreak, true);
	});

	//Initializes and starts the long break
	$("#longbreakbutton").click(function(){
		//Pass lngbreak to handleTimer
		handleTimer(lngbreak, true);
	});

	//Starts the timer if paused
	$("#startbutton").click(function(){
		restartTimer();
	});

	//Pauses the timer
	$("#pausebutton").click(function(){
		$("#timerdisplay").pauseTimer();
	});

	//Set lengths of various timers via button in settings dialogue
	$("#setlengthbutton").click(function(){
		setLengths();
	});

	//Reset timers to default lengths via button in settings dialogue
	$("#defaultbutton").click(function(){
		defaultLengths();
	});

	//Reset pomodoro counter
	$("#resetcountbutton").click(function(){
		localStorage.pomodorocount = 0;
		$("#pomodorocounter").text("Pomodoro Count: 0");
	});

	//Resets the timer to top of countdown, gets "top of countdown" value from timerinput
	$("#resetbutton").click(function(){
		$("#timerdisplay").createTimer({
			time_in_seconds: localStorage.getItem("timerinput"),
			tick: function(){
				localStorage.setItem("timerstorage", arguments[2]);
				localStorage.setItem("timerstorageseconds", arguments[1]);
				$("span").css("width",((arguments[1] / localStorage.getItem("timerinput")) * 100 + "%"));
			},
			//Call buzzer function defined in the final countdown, play alarm tone
			buzzer: function(){
				alarm.play();
			}
		});
	});

	var isAlt = false;
	$(document).keyup(function (e) {
		if (e.which === 18) isAlt = false;
		}).keydown(function (e) {
			if (e.which === 18) isAlt = true;
			if (e.which === 80 && isAlt === true) {
			//ALT+P -- Pomodoro
			handleTimer(setpom, true);
			return false;
			}
			if (e.which === 83 && isAlt === true) {
			//ALT+S -- Short Break
			handleTimer(shrtbreak, true);
			return false;
			}
			if (e.which === 76 && isAlt === true) {
			//ALT+L -- Long Break
			handleTimer(lngbreak, true);
			return false;
			}
			if (e.which === 82 && isAlt === true) {
			//ALT+R -- Reset Timer
			executeReset();
			return false;
			}
			if (e.which === 32) {
			//SPACE -- Start/Stop Timer
			if (timerswitch === false) {$("#timerdisplay").pauseTimer(); timerswitch=true;}
			else {restartTimer(); timerswitch=false;}
			return false;
			}
		}
	);
});

//Sets the various times in minutes to be used at startup
function loadSettings() {
  if (localStorage["pomflag"] != 1) {
    localStorage.setItem("pomodoro", 25);
    localStorage.setItem("shortbreak", 5);
    localStorage.setItem("longbreak", 30);
    localStorage.setItem("pomflag", 1);
    localStorage.setItem("pomodorocount", 0);
  }
}

function handleTimer(timertype, autostartflag) {
	//Set timerinput to the pomodoro duration value 
	//stored in appropriate time variable and include in local storage
	localStorage.setItem("timerinput", timertype);
	$("#timerdisplay").createTimer({
		autostart: autostartflag,
		time_in_seconds: localStorage.getItem("timerinput"),
		tick: function(){
			//On each tick of the timer store the seconds value 
			//(taken from tick arguments[1]) and adjust the progress bar
			localStorage.setItem("timerstorageseconds", arguments[1]);
			$("span").css("width",((arguments[1] / localStorage.getItem("timerinput")) * 100 + "%"));
			document.title = "Kronometro Tomata (" + $("#timerdisplay").text() + ")";
		},
		//Call buzzer function defined in the final countdown, 
		//play alarm tone, add to pomodoro count and output count text 
		//if pomodoro-type timer is active
		buzzer: function(){
			alarm.play();
			document.title = "Time's up!";
			if(timertype === setpom) {
				$("#pomodorocounter").text(
					"Pomodoro Count: " + (localStorage.pomodorocount = (parseInt(localStorage.pomodorocount, 10) + 1))
				);
			}
		}
	});
}

function restartTimer() {
	//Check that timerstorageseconds is initialized
	//and greater than zero to avoid unwanted activation.
	if(localStorage.timerstorageseconds && parseInt(localStorage.timerstorageseconds, 10) > 0){
		//Set progress bar to proper length 
		//(As it would normally reset to the default HTML defined value unless the timer was fired)
		$("span").css("width",((localStorage.getItem("timerstorageseconds") / localStorage.getItem("timerinput")) * 100 + "%"));
		//If it is, set timerdisplay to the value stored in timerstorage seconds, 
		//so the user can continue timer if they close a tab by accident
		$("#timerdisplay").createTimer({
			time_in_seconds: localStorage.getItem("timerstorageseconds"),
			autostart: true,
			tick: function(){
				//On each tick of the timer store the seconds value 
				//(taken from tick arguments[1]) and adjust the progress bar
				localStorage.setItem("timerstorageseconds", arguments[1]);
				$("span").css("width",((arguments[1] / localStorage.getItem("timerinput")) * 100 + "%"));
				document.title = "Kronometro Tomata (" + $("#timerdisplay").text() + ")";
			},
			//Call buzzer function defined in the final countdown, 
			//play alarm tone, add to pomodoro count and output count text 
			//if pomodoro-type timer is active
			buzzer: function(){
				alarm.play();
				document.title = "Time's up!";
				if(localStorage.getItem("timerinput") === setpom) {
					$("#pomodorocounter").text(
						"Pomodoro Count: " + (localStorage.pomodorocount = (parseInt(localStorage.pomodorocount, 10) + 1))
					);
				}
			}
		});
	}
}

function setLengths() {
	if($("#pomodoroinputbox").val() > 0) {
		setpom = $("#pomodoroinputbox").val() * 60;
		localStorage.pomodoro = $("#pomodoroinputbox").val();
	}
	if($("#shortbreakinputbox").val() > 0) {
		shrtbreak = $("#shortbreakinputbox").val() * 60;
		localStorage.shortbreak = $("#shortbreakinputbox").val();
	}
	if($("#longbreakinputbox").val() > 0) {
		lngbreak = $("#longbreakinputbox").val() * 60;
		localStorage.longbreak = $("#longbreakinputbox").val();
	}
}

function defaultLengths() {
	setpom = 25 * 60;
	localStorage.pomodoro = 25;
	shrtbreak = 5 * 60;
	localStorage.shortbreak = 5;
	lngbreak = 30 * 60;
	localStorage.longbreak = 30;
}

function executeReset() {
	$("#timerdisplay").createTimer({
			time_in_seconds: localStorage.getItem("timerinput"),
			tick: function(){
				localStorage.setItem("timerstorage", arguments[2]);
				localStorage.setItem("timerstorageseconds", arguments[1]);
				$("span").css("width",((arguments[1] / localStorage.getItem("timerinput")) * 100 + "%"));
			},
			//Call buzzer function defined in the final countdown, play alarm tone
			buzzer: function(){
				alarm.play();
			}
		});
}

})();