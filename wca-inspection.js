
document.ontouchmove = function (event) {
    event.preventDefault();
}

var state = "set";

var states = {
  "none":  {"function": null,       "background": "white",     "down": "ready", "up": "ready"},
  "ready": {"function": null,       "background": null,        "down": "set",   "up": "ready"},
  "set":   {"function": set,        "background": "#987",      "down": "set",   "up": "go"   },
  "go":    {"function": startTimer, "background": "green",     "down": "stop",  "up": "stop" },
  "stop":  {"function": stopTimer,  "background": null,        "down": "stop", "up": "ready" }
}

function set() {
  $("#sec").html("-");
  $("#milli").html("000");
}

var startTime;
var lastTime;
var counting = false;


function startTimer() {
  counting = true;
  lastTime = startTime = Date.now();
  animFrame();
}

function stopTimer() {
  $("#main").stop().fadeOut(0).fadeIn(500);
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

    if (lastTime < 11 && time === 11) {
      $("#main").animate({"background-color": "#f80"}, 1000);
    }

    if (lastTime < 14 && time === 14) {
      $("#main").animate({"background-color": "#f00"}, 1000);
    }

    if (lastTime < 16 && time === 16) {
      $("#main").animate({"background-color": "#800"}, 1000);
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
    $("#main").css("background", states[state].background);
  }
  if (states[state]["function"]) {
    (states[state]["function"])();
  }
}

function keyboardHandler(dir, ev) {
  // Only trigger on spacebar.
  if (ev.keyCode === 32) {
    trigger(dir);
  }
}

function touchHandler(dir) {
  trigger(dir);
}

$(document.body).ready(function() {
  $(document.body).on("keypress",   keyboardHandler.bind(this, "down"));
  $(document.body).on("keyup",      keyboardHandler.bind(this, "up"));
  $(document.body).on("touchstart", touchHandler.bind(this, "down"));
  $(document.body).on("touchend",   touchHandler.bind(this, "up"));
})