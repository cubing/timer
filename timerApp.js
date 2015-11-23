"use strict";


var TimerApp = function()
{
  this._scrambleView = new TimerApp.ScrambleView(this);
  this._domElement = document.getElementById("timer-app");

  // Prevent a timer tap from scrolling the whole page on touch screens.
  this._domElement.addEventListener("touchmove", function(event)
  {
    event.preventDefault();
  });

  this._timerController = new Timer.Controller(
                                  document.getElementById("face"),
                                  this._solveDone.bind(this),
                                  this._attemptDone.bind(this));
  this._setRandomBackgroundColor();

  this._scramblers = new Cubing.Scramblers();

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
      this.setEvent(storedEvent);
    } else {
      this.setEvent(this.DEFAULT_EVENT);
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
   */
  setEvent: function(eventName)
  {
    localStorage["current-event"] = eventName;
    this._currentEvent = eventName;
    this._scrambleView.setEvent(this._currentEvent);
    this._startNewAttempt();
  },

  _setRandomBackgroundColor: function()
  {
    var themeColors = ["orange", "green", "red", "blue"];
    this._domElement.classList.add("theme-" + TimerApp.Util.randomChoice(themeColors))
  },

  /**
   * @param {!TimerApp.Timer.Milliseconds} time
   */
  _solveDone: function(time)
  {
    this._persistResult(time);
  },

  /**
   * @param {!TimerApp.Timer.Milliseconds} time
   */
  _attemptDone: function(time)
  {
    this._startNewAttempt();
  },

  /**
   * @param {!TimerApp.Timer.Milliseconds} time
   */
  _persistResult: function(time)
  {
    var today = new Date();
    var dateString = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();

    var serializationFormat = "v0.1";
    var result = "[" + serializationFormat + "][" + this._currentEvent + "][" + new Date() + "] " + (time / 1000) + " (" + this._currentScramble.scrambleString + ")";

    var store = (dateString in localStorage) ? localStorage[dateString] + "\n" : "";
    localStorage[dateString] = store + result;

    localStorage["last-attempt-date"] = today.toString();
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
    this._timerApp.setEvent(this._eventSelectDropdown.value);
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
      scrambleString: "(generating scramble...)"
    });
  },

  /**
   * @param {!Cubing.Scramble} scramble
   */
  setScramble: function(scramble)
  {
    this._scrambleText.classList.remove("stale");
    this._scrambleText.href = Cubing.prototype.urlForScramble(scramble);
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
