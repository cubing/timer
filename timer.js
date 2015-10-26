"use strict";

var TimerApp = {};

TimerApp.ScrambleView = function() {
  this._eventSelectDropdown = document.getElementById("event-select-dropdown");
  this._cubingIcon = document.getElementById("cubing-icon");

  this._setEvent(this.DEFAULT_EVENT);

  this._eventSelectDropdown.addEventListener("change", function() {
    this._setEvent(this._eventSelectDropdown.value);
  }.bind(this));

  console.log("foo");
}

TimerApp.ScrambleView.prototype = {
  DEFAULT_EVENT: "333",

  /**
   * @param {!Cubing.Event} eventName
   */
  _setEvent: function(eventName) {
    if (this._event) {
      this._cubingIcon.classList.remove("icon-" + this._event);
    }
    this._event = eventName;
    this._cubingIcon.classList.add("icon-" + eventName);
  }
}

window.addEventListener("load", function() {
  var scrambleView = new TimerApp.ScrambleView();
});
