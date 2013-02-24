(function (win, doc, $, undefined) {
  define(["helper"], function (helper) {
    "use strict";
    var _domTitle, _domStopTrackerLink, _domTopNavBarTimer, _domStartTrackerLink, _domMitePrefLink,
        _trackerData, _running, _titleDefault, _timerUpdateTime, _timerRef,
        _msgStopTracker, _labelStartTimeTracker, _labelStopTimeTracker,
        _h = helper,
  
    _setTrackerData = function(oData) {
      _trackerData = oData;
      _trackerData.time = parseInt(_trackerData.time, 10);
      _running = _trackerData.active;
    },

    _initVars = function() {
      var tracker_time, tracker_issue, tracker_te, tracker_data_temp;

      tracker_time = tracker_issue = tracker_te = 0;
      _domTitle = _domTopNavBarTimer = _domMitePrefLink = null;
      _timerRef = null;
      _running = false;
      _titleDefault = "";
      _timerUpdateTime = 60000; // update the timer each minute
      _msgStopTracker = doc.getElementById("plugin_mite_msg_confirmation_stopping_tracker").value;
      _labelStartTimeTracker = doc.getElementById("plugin_mite_label_start_time_tracker").value;
      _labelStopTimeTracker = doc.getElementById("plugin_mite_label_stop_time_tracker").value;
      _domStartTrackerLink = doc.createElement("a");
      _domStartTrackerLink.href = "#";
      _domStartTrackerLink.innerHTML = _labelStartTimeTracker;
      tracker_data_temp = $(doc.getElementById("plugin_mite_tracker_data")).val();
      if (tracker_data_temp && tracker_data_temp !== 'null' && tracker_data_temp !== "{}") {
        _setTrackerData($.parseJSON(tracker_data_temp));
      }
    },

    _initVarsForRunningTracker = function() {
      _domTitle = doc.getElementsByTagName('title')[0];
      _titleDefault = _domTitle.innerHTML;
      _domMitePrefLink = doc.getElementById('plugin_mite_prefs').parentNode;
      _domTopNavBarTimer = doc.createElement("a");
      _domTopNavBarTimer.id = "plugin_mite_tracker_time";
      _domTopNavBarTimer.href = _trackerData.issue_url;
      _domStopTrackerLink = doc.createElement("a");
      _domStopTrackerLink.href = "#";
      _domStopTrackerLink.innerHTML = _labelStopTimeTracker;
    },

    _onTrackerCouldNotBeStopped = function (data) {
      console.warn( "An unknown error occurred when trying to stop the mite tracker. " +
                    "Backend response: " + data.responseText);
    },

    _onTrackerWasStopped = function (data) {
      var status = data["status"];

      if (status === "Stopped" || status === "WasNotRunning") {
        $(_domTopNavBarTimer).detach();
        _domTitle.innerHTML = _titleDefault;
        win.clearTimeout(_timerRef);
        $(doc).trigger(_h.EVENTS.TRACKER_STOPPED, [_formatTimeTo_hh_mm(_trackerData.time)]);
        _initNotRunningTracker();
      }
      else {
        console.error("Could not stop the running tracker. Status: " + status);
        return false;
      }
    },
    
    _stopTracker = function(postData) {
      postData = postData || {};
      postData.te_id = _trackerData.te_id;
      postData.mite_te_id = _trackerData.mite_te_id;
      postData.time = _trackerData.time;
      return $.ajax({
          url: _h.URLS.STOP_TRACKER,
          type: "POST",
          dataType: "json",
          data: postData
        })
        .done(_onTrackerWasStopped)
        .fail(_onTrackerCouldNotBeStopped);
    },

    _onProcessClickStopTrackerLink = function(postData) {
      if (win.confirm(_msgStopTracker) === true) {
        _stopTracker(postData);
      }
    },

    _onTrackerCouldNotBeStarted = function (data) {
      console.error(
        "An unknown error occurred when trying to stop the mite tracker." +
        data.responseText
      );
    },

    _onTrackerWasStarted = function (data) {
      var oResponse = data.responseText || data,
          timeEntry = oResponse.time_entry;
        
      if (timeEntry !== undefined) {
        _setTrackerData(
          { "active"          : true,
            "time"            : 0,
            "te_id"           : timeEntry.id,
            "activity_id"     : timeEntry.activity_id,
            "mite_te_id"      : timeEntry.mite_time_entry_id,
            "mite_project_id" : timeEntry.mite_project_id,
            "mite_service_id" : timeEntry.mite_service_id,
            "issue_id"        : timeEntry.issue_id,
            "issue_url"       : "/issues/" + timeEntry.issue_id
          }
        );
        $(doc).trigger(_h.EVENTS.TRACKER_STARTED);
        _initRunningTracker();
      }
      else {
        console.error("Could not start the tracker: " + oResponse);
      }
    },

    _startTracker = function(postData) {
      $.ajax({
        url: _h.URLS.START_TRACKER,
        type: "POST",
        dataType: "json",
        data: postData
      })
      .done(_onTrackerWasStarted)
      .fail(_onTrackerCouldNotBeStarted);
    },

    /**
     * Sends data to the backend to start the tracker.
     *
     * @param {Object} receivedData contains the data to be send to the backend.
     *                               Has to contain the keys:
     *                                 project_id, issue_id, hours, comments, activity_id,
     *                                 mite_project_id, mite_service_id
     */
    _onProcessClickStartTrackerLink = function(receivedData) {
      var $stopTrackerPromise = $.Deferred();

      if (!_running) {
        $stopTrackerPromise.resolve();
      }
      else {
        $stopTrackerPromise = _stopTracker();
      }
      $.when($stopTrackerPromise).done(function() {
        _startTracker(receivedData);
      });
    },

    _initEventHandlers = function() {
      $(_domStartTrackerLink).on('click', function(evt) {
        $(doc).trigger(_h.EVENTS.TRACKER_START_LINK_CLICKED, [evt]);
      });
      $(doc).on(_h.EVENTS.TRACKER_START_LINK_CLICK_WAS_PROCESSED, function(evt, data) {
        _onProcessClickStartTrackerLink(data);
      });
    },

    _initEventHandlersForRunningTracker = function() {
      $(_domStopTrackerLink).on('click', function(evt) {
        $(doc).trigger(_h.EVENTS.TRACKER_STOP_LINK_CLICKED, [evt]);
      });
      $(doc).on(_h.EVENTS.TRACKER_STOP_LINK_CLICK_WAS_PROCESSED, function(evt, postData) {
        _onProcessClickStopTrackerLink(postData);
      });
      $(doc).on(_h.EVENTS.TRACKER_SHOULD_STOP, function(evt, postData) {
        _stopTracker(postData);
      });
    },

    _addTimerToTopNavigationBar = function () {
      _domMitePrefLink.appendChild(_domTopNavBarTimer);
    },
    
    _formatTimeTo_hh_mm = function(minutes) {
      var hoursPart = Math.floor(minutes / 60),
          minutesPart = minutes % 60,
          timeFormated = hoursPart + ":";

      if (minutesPart < 10) {
        minutesPart = "0" + minutesPart;
      }
      timeFormated += minutesPart;
      return timeFormated;
    },

    _updateTimers = function() {
      var formatedTime = _formatTimeTo_hh_mm(_trackerData.time);

      _domTitle.innerHTML = "(" + formatedTime + ") " + _titleDefault;
      _domTopNavBarTimer.innerHTML = "(" + _formatTimeTo_hh_mm(_trackerData.time) + ")";
      _trackerData.time += 1;
      _timerRef = win.setTimeout(_updateTimers, _timerUpdateTime);
      $(doc).trigger(_h.EVENTS.TRACKER_UPDATED_TIME, [_trackerData.time, formatedTime]);
    },

    _initRunningTracker = function() {
      _initVarsForRunningTracker();
      _initEventHandlersForRunningTracker();
      _initRunningTracker = function() {
        _addTimerToTopNavigationBar();
        _updateTimers();
        _running = true;
        $(doc).trigger(_h.EVENTS.TRACKER_INITIALIZED_RUNNING, [
          {
            "startTrackerLink" : _domStartTrackerLink,
            "stopTrackerLink"  : _domStopTrackerLink,
            "trackerData"      : _trackerData
          }
        ]);
      };
      _initRunningTracker();
    },

    _initNotRunningTracker = function() {
      _running = false;
      $(doc).trigger(_h.EVENTS.TRACKER_INITIALIZED_NOT_RUNNING, [{"startTrackerLink" : _domStartTrackerLink}]);
    };

    return {
      init : function () {
        _initVars();
        _initEventHandlers();
        if (_running) {
          _initRunningTracker();
        }
        else {
          _initNotRunningTracker();
        }
      }
    };
  });
}(window, document, jQuery));