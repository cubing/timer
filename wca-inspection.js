
document.ontouchmove = function (event) {
    event.preventDefault();
}

var state = "set";

var states = {
  "none":  {"function": null,       "background": ["white", "white", "white", "white", "white"],   "down": "ready", "up": "ready"},
  "ready": {"function": null,       "background": [null, null, null, null, null],                  "down": "set",   "up": "ready"},
  "set":   {"function": set,        "background": ["#987", "#987", "#987", "#987", "#987"],        "down": "set",   "up": "go"   },
  "go":    {"function": startTimer, "background": ["green", "green", "green", "green", "green"],   "down": "stop",  "up": "stop" },
  "stop":  {"function": stopTimer,  "background": ["green", "#ff0", "#f80", "#f00", "#800"],         "down": "stop",  "up": "ready" }
}
console.log(states["stop"].background[2]);

function set() {
  $("#sec").html("-");
  $("#milli").html("000");
}

var startTime;
var lastTime;
var counting = false;
var penalty = 0;


function startTimer() {
  counting = true;
  penalty = 0;
  lastTime = startTime = Date.now();
  animFrame();
}

function stopTimer() {
  $("#main").stop().fadeOut(0).fadeIn(250);
  counting = false;
}

function animFrame() {
  if (counting) {
    var now = Date.now();
    var time = Math.floor((now - startTime) / 1000);
    $("#sec").html(time);
    $("#milli").html(("000" + ((now - startTime) % 1000)).substr(-3));

    if (lastTime < 7 && time === 7) {
      $("#main").animate({"background-color": "#ff0"}, 1000);
    }
    if (lastTime < 8 && time === 8) {
      penalty = 1;
      $("#main").fadeOut(0).fadeIn(250);
    }

    if (lastTime < 11 && time === 11) {
      $("#main").animate({"background-color": "#f80"}, 1000);
    }
    if (lastTime < 12 && time === 12) {
      penalty = 2;
      $("#main").fadeOut(0).fadeIn(250);
    }

    if (lastTime < 14 && time === 14) {
      $("#main").animate({"background-color": "#f00"}, 1000);
    }
    if (lastTime < 15 && time === 15) {
      penalty = 3;
      $("#main").fadeOut(0).fadeIn(250);
    }

    if (lastTime < 16 && time === 16) {
      $("#main").animate({"background-color": "#800"}, 1000);
    }
    if (lastTime < 17 && time === 17) {
      penalty = 4;
      $("#main").fadeOut(0).fadeIn(250);
    }

    lastTime = time;
    requestAnimationFrame(animFrame);
  }
}

function trigger(dir) {
  console.log(dir);
  try {
    state = states[state][dir];
  }
  catch (e) {
    state = "ready";
  }
  console.log("state", state);
  if (states[state].background) {
    $("#main").css("background", states[state].background[penalty]);
  }
  if (states[state]["function"]) {
    (states[state]["function"])();
  }
}

function keyboardHandler(dir, ev) {
  // Only trigger on spacebar.
  if (ev.which === 32) {
    trigger(dir);
  }
}

function touchHandler(dir) {
  trigger(dir);
}

$(document.body).ready(function() {
  FastClick.attach(document.body);
  $(document.body).on("keypress",   keyboardHandler.bind(this, "down"));
  $(document.body).on("keyup",      keyboardHandler.bind(this, "up"));
  $(document.body).on("touchstart", touchHandler.bind(this, "down"));
  $(document.body).on("touchend",   touchHandler.bind(this, "up"));
})
