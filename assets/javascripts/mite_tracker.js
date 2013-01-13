/*global jQuery */
var MITE_APP = MITE_APP || {};

(function (win, doc, $, undefined) {
  "use strict";

  MITE_APP.tracker = (function() {
    
    // PRIVATE
    
    var _domTitle, _domStopTrackerLink, _domTrackerTimeStyled, _domTrackerTimer, 
    _$timeEntryHours, _$mitePrefLink, _$timeEntries,
    _trackerData, _active, _titleDefault, _timerUpdateTime, _timerRef, _isOnIssueTimeEntriesPage,
    _msg_stop_tracker = "Are you sure you want to stop the tracker?",
    
    _initVars = function() {
      var tracker_time, tracker_issue, tracker_te, tracker_data_temp;
      _domTitle = _domTrackerTimeStyled = _$mitePrefLink = _domTrackerTimer = null;
      tracker_time = tracker_issue = tracker_te = 0;
      _timerRef = null;
      _active = false;
      _titleDefault = "";
      _timerUpdateTime = 60000; // update the timer each minute
      
      tracker_data_temp = $(doc.getElementById("plugin_mite_tracker")).val();
      
      if (tracker_data_temp && tracker_data_temp !== 'null' && tracker_data_temp !== "{}") {
        _trackerData = $.parseJSON(tracker_data_temp);
        _trackerData.time = parseInt(_trackerData.time, 10);
        _active = _trackerData.active;
      }
      
      // 'time_entry_hours' is an input field available on all pages
      // where the user can log a time entry.
      // If it is available it will be set to '0h0m' in order 
      // to let the backend recognize a time entry which should start the mite tracker.
      _$timeEntryHours = $(doc.getElementById("time_entry_hours"));
      
      // the class 'time-entries' is set on a table listing for all time entries of an issue
      // on page: issues/X/time_entries
      _$timeEntries = $('.time-entries');
      
      _isOnIssueTimeEntriesPage = false;
      if (_$timeEntries.length) {
        _isOnIssueTimeEntriesPage = true;
      }
    },
    
    _insertTimeEntryPlaceHolders = function() {
      if (!_active && !!!_$timeEntryHours.val()) {
        _$timeEntryHours.attr('value', '0h0m');
      }
    },
    
    _initTimerVars = function() {
      _domTitle = doc.getElementsByTagName('title')[0];
      _titleDefault = _domTitle.innerHTML;
      _$mitePrefLink = $(doc.getElementById('plugin_mite_prefs')).parent();
      
      _domTrackerTimeStyled = document.createElement("a");
      _domTrackerTimeStyled.id = "plugin_mite_tracker_time";
      _domTrackerTimeStyled.href = _trackerData.issue_url;

      _domTrackerTimer = document.createElement("a");
      _domTrackerTimer.id = "plugin_mite_tracker_active";
      _domTrackerTimer.title = "Stop the running tracker";
      _domTrackerTimer.href = "#";

      _domStopTrackerLink = document.createElement("a");
      _domStopTrackerLink.title = "Stop the running tracker";
      _domStopTrackerLink.href = "#";         
      _domStopTrackerLink.innerHTML = "Stop the running tracker";
    },
    
    _onStopTrackerHandler = function() {
      var sResponse;

      $.ajax({
        url: "/mite/stop_tracker",
        type: "POST",
        data: "te=" + _trackerData.te + "&time=" + _trackerData.time,
      })
      .done(function(data) { 
        sResponse = data.responseText || data;
        if (sResponse == "Success") {
          $(_domTrackerTimeStyled).remove();
          _domTitle.innerHTML = _titleDefault;
          window.clearTimeout(_timerRef);
          $(document).trigger("mite_tracker:stopped");
        } 
        else {
          console.error("Could not stop the running tracker: " + sResponse);
        }
      })
      .fail(function(data) {
        console.error("An unknown error occurred when trying to stop the mite tracker.");
      });
    },

    _onClickOnStopTrackerHandler = function(eEvent) {
      if (window.confirm (_msg_stop_tracker) == true) {
        _onStopTrackerHandler();
        $(this).remove();
      }
      eEvent.preventDefault();
      return false;
    },

    _addEventHandlerForActiveTracker = function() {
      if (_isOnIssueTimeEntriesPage) {
        $(_domTrackerTimer).on('click', _onClickOnStopTrackerHandler);
      }
      $(_domStopTrackerLink).on('click', _onClickOnStopTrackerHandler);
    },

    _addEventHandler = function() {
      if (_active) {
        _addEventHandlerForActiveTracker();
      }
    },
    
    _displayMenuBarTimer = function () {
      _$mitePrefLink.append(_domTrackerTimeStyled);
    },
    
    // Traverses over all time entries in the table listing until the currently active time entry
    // was found. On that an interactive clock is displayed (similar to mite)
    // which allows to stop an active tracker.
    _displayTimerInTimeEntryTable = function() {
      var teRow = null, teActionColumn = null;

      $('.time-entries > tbody > tr').each(function(index, item) {

        // select the first table cell which contains a checkbox with the id of the time entry
        if ($(item).children().first().children().first().val() == _trackerData.te) {

          // selecting the row which contains the currently active time entry
          teRow = $('.time-entries > tbody > tr')[index];

          // selecting the last column which contains the action links 'edit' and 'delete' 
          teActionColumn = $(teRow).find("td:last-child a")[0];
          return;
        }
      });
      if (teRow && teActionColumn) {
        $(teActionColumn).before(_domTrackerTimer);
        $(teActionColumn).parent().prev().html("...");
      }
    },

    /* Returns a time value in the format hh:mm
     * @param int
     */
    _format_time = function(minutes) {
      var hoursPart = Math.floor(minutes / 60),
          minutesPart = minutes % 60,
          timeFormated = hoursPart + ":";
      if (minutesPart < 10) {
        minutesPart = "0" + minutesPart;
      }
      timeFormated += minutesPart;
      return timeFormated;
    },

    _update_timers = function() {
      _domTitle.innerHTML = "(" + _format_time(_trackerData.time) + ") " + _titleDefault;
      _domTrackerTimeStyled.innerHTML = "(" + _format_time(_trackerData.time) + ")";
      _trackerData.time += 1;
      _timerRef = window.setTimeout(_update_timers, _timerUpdateTime);
    };
    
    return {
      $timeEntryHours : _$timeEntryHours,
      $stopTrackerLink : _domStopTrackerLink,
      active : _active,
    
      init : function () {
        _initVars();
        if (_active) {
          _initTimerVars();
          _displayMenuBarTimer();
          if (_isOnIssueTimeEntriesPage) {
            _displayTimerInTimeEntryTable();
          }
          _update_timers();
        }
        _addEventHandler();
        if (_$timeEntryHours) {
          _insertTimeEntryPlaceHolders();
        }
        this.$timeEntryHours = _$timeEntryHours;
        this.$stopTrackerLink = _domStopTrackerLink;
        this.active = _active;
      }
    };
  }());

  $(function() {
    MITE_APP.tracker.init();
    $(document).trigger("mite_tracker:loaded");
  });
}(window, document, jQuery));