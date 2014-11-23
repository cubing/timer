
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

var state = "ready";
var running = false;
var startTime;
var lastSecond;
var stopColor;

var states = {
  "ready": {"function": null,       "down": "set",   "up": "set"  },
  "set":   {"function": set,        "down": "set",   "up": "go"   },
  "go":    {"function": startTimer, "down": "stop",  "up": "stop" },
  "stop":  {"function": stopTimer,  "down": "ready", "up": "ready"}
}

var fading = [
  {time: 8, color: "#ff0"},
  {time: 12, color: "#f80"},
  {time: 15, color: "#f00"},
  {time: 17, color: "#800"}
]

function setSec(value) {
  var strValue = "" + value;
  $("#sec-first").html(strValue.charAt(0));
  $("#sec-rest").html(strValue.substr(1));
}

function set() {
  setSec(0);
  $("#milli").html("000");
  $("#main").css("background-color", "#987");
}

function startTimer() {
  running = true;
  lastSecond = startTime = Date.now();
  animFrame();
  stopColor = "green";
  $("#main").css("background-color", "green");
}

function stopTimer() {
  $("#main").stop().fadeOut(0).css("background-color", stopColor).fadeIn(250);
  running = false;
}

function animFrame() {
  if (running) {
    var now = Date.now();
    var currentSecond = Math.floor((now - startTime) / 1000);
    setSec(currentSecond);
    $("#milli").html(("000" + ((now - startTime) % 1000)).substr(-3));

    for (i in fading) {

      var time = fading[i].time;
      var color = fading[i].color;

      function justPassed(threshold) {
        return lastSecond < threshold && currentSecond === threshold;
      }

      if (justPassed(time - 1)) {
        $("#main").animate({"background-color": color}, 1000);
      }
      if (justPassed(time)) {
        stopColor = color;
        $("#main").fadeOut(0).fadeIn(250);
      }
    }

    lastSecond = currentSecond;
    requestAnimationFrame(animFrame);
  }
}

function touchHandler(direction) {

  state = states[state][direction];

  // console.log("state", state);
  if (states[state]["function"]) {
    (states[state]["function"])();
  }
}

function keyboardHandler(direction, ev) {
  // Only trigger on spacebar.
  if (ev.which === 32) {
    touchHandler(direction);
  }
}

$(document.body).ready(function() {

  // If we do this now, we can avoid flickering later.
  setSec("-");
  $("#milli").html("---");

  FastClick.attach(document.body);
  $(document.body).on("keypress",   keyboardHandler.bind(this, "down"));
  $(document.body).on("keyup",      keyboardHandler.bind(this, "up"));
  $(document.body).on("touchstart", touchHandler.bind(this, "down"));
  $(document.body).on("touchend",   touchHandler.bind(this, "up"));
})
