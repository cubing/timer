
// These two listeners will reload the page if the manifest has changed.
// This code should be used on any page that should refresh itself immediately if it is stale.
if (typeof window.applicationCache !== "undefined") {
  window.applicationCache.addEventListener('updateready', function() {
    window.applicationCache.swapCache();
    setTimeout(function() {location.reload(true)}, 1000);
  }, false);

  window.applicationCache.addEventListener('downloading', function() {
    document.body.innerHTML="<center><br><br><h1>Fetching latest version...<br><br>Page will reload in a moment.</h1><br></center>";
    document.body.style.setProperty("background", "#987");
  }, false);
}



document.ontouchmove = function (event) {
    event.preventDefault();
};

var state = "set";

var states = {
  "none":  {"function": null,       "background": ["white", "white", "white", "white", "white"],   "down": "ready", "up": "ready"},
  "ready": {"function": null,       "background": [null, null, null, null, null],                  "down": "set",   "up": "ready"},
  "set":   {"function": set,        "background": ["#987", "#987", "#987", "#987", "#987"],        "down": "set",   "up": "go"   },
  "go":    {"function": startTimer, "background": ["green", "green", "green", "green", "green"],   "down": "stop",  "up": "stop" },
  "stop":  {"function": stopTimer,  "background": ["green", "#ff0", "#f80", "#f00", "#800"],         "down": "stop",  "up": "ready" }
}

var fading = {
   8: {color: "#ff0", penalty: 1},
  12: {color: "#f80", penalty: 2},
  15: {color: "#f00", penalty: 3},
  17: {color: "#800", penalty: 4}
}

function set() {
  $("#sec").html("0");
  $("#milli").html("000");
}

var startTime;
var currentSecond;
var lastSecond;
var counting = false;
var penalty = 0;


function startTimer() {
  counting = true;
  penalty = 0;
  lastSecond = startTime = Date.now();
  animFrame();
}

function stopTimer() {
  $("#main").stop().fadeOut(0).fadeIn(250);
  counting = false;
}

function justPassed(threshold) {
  return lastSecond < threshold && currentSecond === threshold;
}

function animFrame() {
  if (counting) {
    var now = Date.now();
    currentSecond = Math.floor((now - startTime) / 1000);
    $("#sec").html(currentSecond);
    $("#milli").html(("000" + ((now - startTime) % 1000)).substr(-3));

    for (time in fading) {
      if (justPassed(time-1)) {
        var color = fading[time].color;
        $("#main").animate({"background-color": color}, 1000);
      }
      if (justPassed(time)) {
        penalty = fading[time].penalty;
        $("#main").fadeOut(0).fadeIn(250);
      }
    }

    lastSecond = currentSecond;
    requestAnimationFrame(animFrame);
  }
}

function trigger(dir) {
  // console.log(dir);
  try {
    state = states[state][dir];
  }
  catch (e) {
    state = "ready";
  }
  // console.log("state", state);
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

  // If we do this now, we can avoid flickering later.
  $("#sec").html("-");
  $("#milli").html("---");

  FastClick.attach(document.body);
  $(document.body).on("keypress",   keyboardHandler.bind(this, "down"));
  $(document.body).on("keyup",      keyboardHandler.bind(this, "up"));
  $(document.body).on("touchstart", touchHandler.bind(this, "down"));
  $(document.body).on("touchend",   touchHandler.bind(this, "up"));
})
