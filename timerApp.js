"use strict";


var TimerApp = function()
{
  this._scrambleView = new TimerApp.ScrambleView(this);
  this._statsView = new TimerApp.StatsView(this);
  this._domElement = document.getElementById("timer-app");

  applicationCache.addEventListener("updateready", function() {
    var infoBar = document.getElementById("update-bar");
    infoBar.addEventListener("click", function() {
      location.reload();
    })
    infoBar.classList.remove("hidden");
  });

  // Prevent a timer tap from scrolling the whole page on touch screens.
  this._domElement.addEventListener("touchmove", function(event)
  {
    event.preventDefault();
  });

  this._timerController = new Timer.Controller(
                                  document.getElementById("timer"),
                                  this._solveDone.bind(this),
                                  this._attemptDone.bind(this));
  this._setRandomThemeColor();

  this._scramblers = new Cubing.Scramblers();
  this._shortTermSession = new ShortTermSession();
  this._updateDisplayStats(this._shortTermSession.getTimes());

  // This should trigger a new attempt for us.
  this._setInitialEvent();
}

TimerApp.prototype = {
  DEFAULT_EVENT: "333",
  STORED_EVENT_TIMEOUT_MS: 15 * 60 * 1000, // 15 min

  _setInitialEvent: function() {
    var storedEvent = localStorage["current-event"];
    var lastAttemptDate = new Date(localStorage["last-attempt-date"]);

    var currentDate = new Date();

    if (storedEvent in Cubing.EventMetadata &&
        !isNaN(lastAttemptDate) &&
        (currentDate.getTime() - lastAttemptDate.getTime() < this.STORED_EVENT_TIMEOUT_MS)
    ) {
      this.setEvent(storedEvent, false);
    } else {
      this.setEvent(this.DEFAULT_EVENT, false);
    }
  },

  _startNewAttempt: function ()
  {
    this._awaitedScrambleId = (typeof this._awaitedScrambleId !== "undefined") ? this._awaitedScrambleId + 1 : 0;

    /**
     * @param {integer} scrambledId
     * @param {!Cubing.Scramble} scramble
     */
    function scrambleCallback(scrambledId, scramble)
    {
      if (scrambledId === this._awaitedScrambleId) {
        this._currentScramble = scramble;
        this._scrambleView.setScramble(this._currentScramble);
      } else {
        var logInfo = console.info ? console.info.bind(console) : console.log;
        logInfo("Scramble came back out of order late (received: ", scrambledId, ", current expected: ", this._awaitedScrambleId, "):", scramble)
      }
    }

    this._scrambleView.clearScramble();
    this._scramblers.getRandomScramble(this._currentEvent, scrambleCallback.bind(this, this._awaitedScrambleId));
  },

  /**
   * @param {!Cubing.EventName} eventName
   * @param {bool} restartShortTermSession
   */
  setEvent: function(eventName, restartShortTermSession)
  {
    localStorage["current-event"] = eventName;
    this._currentEvent = eventName;
    this._scrambleView.setEvent(this._currentEvent);
    this._startNewAttempt();
    this._timerController.reset();
    if (restartShortTermSession) {
      this._shortTermSession.restart();
      this._updateDisplayStats([]);
    }
  },

  _setRandomThemeColor: function()
  {
    var themeColors = [
      {name: "orange", value: "#f95b2a"},
      {name: "green", value: "#0d904f"},
      {name: "red", value: "#ce2e20"},
      {name: "blue", value: "#4285f4"}
    ];
    var randomChoice = TimerApp.Util.randomChoice(themeColors);
    this._domElement.classList.add("theme-" + randomChoice.name);

    document.head || (document.head = document.getElementsByTagName('head')[0]);

    var favicon = document.createElement('link');
    var currentFavicon = document.getElementById('favicon');
    favicon.id = 'favicon';
    favicon.rel = 'shortcut icon';
    favicon.href = 'lib/favicons/favicon_' + randomChoice.name + '.ico';
    if (currentFavicon) {
      document.head.removeChild(currentFavicon);
    }
    document.head.appendChild(favicon);

    var meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.id = "theme-color";
    meta.content = randomChoice.value;
    document.head.appendChild(meta);
  },

  /**
   * @param {!TimerApp.Timer.Milliseconds} time
   */
  _solveDone: function(time)
  {
    this._persistResult(time);
    var times = this._shortTermSession.addTime(time);
    this._updateDisplayStats(times);
  },

  /**
   * @param {!TimerApp.Timer.Milliseconds} time
   */
  _persistResult: function(time)
  {
    var today = new Date();
    var dateString = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();

    var serializationFormat = "v0.1";
    var scrambleString = this._currentScramble ? this._currentScramble.scrambleString : "/* no scramble */";
    var result = "[" + serializationFormat + "][" + this._currentEvent + "][" + new Date() + "] " + (time / 1000) + " (" + scrambleString + ")";

    var store = (dateString in localStorage) ? localStorage[dateString] + "\n" : "";
    localStorage[dateString] = store + result;

    localStorage["last-attempt-date"] = today.toString();
  },

  /*
   * @param {Array<!TimerApp.Timer.Milliseconds>} times
   */
  _updateDisplayStats: function(times) {
    this._statsView.setStats({
      "avg5": Stats.prototype.formatTime(Stats.prototype.trimmedAverage(Stats.prototype.lastN(times, 5))),
      "avg12": Stats.prototype.formatTime(Stats.prototype.trimmedAverage(Stats.prototype.lastN(times, 12))),
      "mean3": Stats.prototype.formatTime(Stats.prototype.mean(Stats.prototype.lastN(times, 3))),
      "best": Stats.prototype.formatTime(Stats.prototype.best(times)),
      "worst": Stats.prototype.formatTime(Stats.prototype.worst(times)),
      "numSolves": times.length
    });
  },

  _attemptDone: function()
  {
    this._startNewAttempt();
  }
}

/**
 * @param {!TimerApp} timerApp
 */
TimerApp.ScrambleView = function(timerApp)
{
  this._timerApp = timerApp;

  this._scrambleElement = document.getElementById("scramble-bar");
  this._eventSelectDropdown = document.getElementById("event-select-dropdown");
  this._cubingIcon = document.getElementById("cubing-icon");
  this._scrambleText = document.getElementById("scramble-text");

  this._eventSelectDropdown.addEventListener("change", function()
  {
    this._eventSelectDropdown.blur()
    this._timerApp.setEvent(this._eventSelectDropdown.value, true);
  }.bind(this));

  this.initializeSelectDropdown();
}

TimerApp.ScrambleView.prototype = {
  initializeSelectDropdown: function()
  {
    this._eventSelectDropdown.optionElementsByEventName = {};
    for (var i in Cubing.EventName) {

      var eventName = Cubing.EventName[i];

      var optionElement = document.createElement("option");
      optionElement.value = eventName;
      optionElement.textContent = Cubing.EventMetadata[eventName].name;

      this._eventSelectDropdown.optionElementsByEventName[eventName] = optionElement;
      this._eventSelectDropdown.appendChild(optionElement);
    }
  },

  /**
   * @param {!Cubing.EventName} eventName
   */
  setEvent: function(eventName)
  {
    TimerApp.Util.removeClassesStartingWith(this._scrambleText, "event-");
    this._scrambleText.classList.add("event-" + eventName);
    TimerApp.Util.removeClassesStartingWith(this._cubingIcon, "icon-");
    this._cubingIcon.classList.add("icon-" + eventName);
    if (this._eventSelectDropdown.value != eventName) {
      this._eventSelectDropdown.optionElementsByEventName[eventName].selected = true;
    }
    this._setScramblePlaceholder(eventName);
  },

  /**
   * @param {!Cubing.EventName} eventName
   */
  _setScramblePlaceholder: function(eventName) {
    this.setScramble({
      eventName: eventName,
      scrambleString: "generating..."
    });
  },

  /**
   * @param {!Cubing.Scramble} scramble
   */
  setScramble: function(scramble)
  {
    this._scrambleText.classList.remove("stale");
    this._scrambleText.textContent = scramble.scrambleString;

    // TODO(lgarron): Use proper layout code. https://github.com/cubing/timer/issues/20
    if (scramble.eventName === "minx") {
      this._scrambleText.innerHTML = scramble.scrambleString;
    }
    else if (scramble.eventName === "sq1") {
      this._scrambleText.innerHTML = scramble.scrambleString.replace(/, /g, ",&nbsp;").replace(/\) \//g, ")&nbsp;/");
    }
  },

  clearScramble: function()
  {
    this._scrambleText.href = "";
    this._scrambleText.classList.add("stale");
  }
}

TimerApp.StatsView = function() {
  this._statsDropdown = document.getElementById("stats-dropdown");
  this._elems = {
    "avg5":       document.getElementById("avg5"),
    "avg12":      document.getElementById("avg12"),
    "mean3":      document.getElementById("mean3"),
    "best":      document.getElementById("best"),
    "worst":      document.getElementById("worst"),
    "num-solves": document.getElementById("num-solves"),
  };

  this._initializeDropdown();
}

TimerApp.StatsView.prototype = {
  _initializeDropdown: function() {
    var storedCurrentStat = localStorage["current-stat"];

    if (storedCurrentStat in this._elems) {
      this._elems[storedCurrentStat].selected = true;
    }

    this._statsDropdown.addEventListener("change", function() {
      localStorage["current-stat"] = this._statsDropdown.value;
      this._statsDropdown.blur();
    }.bind(this));
  },

  setStats: function(stats) {
    this._elems["avg5"].textContent = "avg5: " + stats.avg5;
    this._elems["avg12"].textContent = "avg12: " + stats.avg12;
    this._elems["mean3"].textContent = "mean3: " + stats.mean3;
    this._elems["best"].textContent = "best: " + stats.best;
    this._elems["worst"].textContent = "worst: " + stats.worst;
    this._elems["num-solves"].textContent = "#solves: " + stats.numSolves;
  }
}

TimerApp.Util = function()
{};

// startsWith polyfill for iOS < 9
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}

/**
 * @param {!Element} element
 * @param {string} prefix
 */
TimerApp.Util.removeClassesStartingWith = function(element, prefix)
{
  var classes = Array.prototype.slice.call(element.classList);
  for (var i in classes) {
    var className = classes[i];
    if (className.startsWith(prefix)) {
      element.classList.remove(className);
    }
  }
}

/**
 * @param {Array} list
 */
TimerApp.Util.randomChoice =  function(list)
{
  return list[Math.floor(Math.random() * list.length)];
}


window.addEventListener("load", function()
{
  window.timerApp = new TimerApp();
});
