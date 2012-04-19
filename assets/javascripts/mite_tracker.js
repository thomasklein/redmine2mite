var MITE_TRACKER = function() {
	
	// PRIVATE
	
	var $_title, $_trackerTimeStyled, $_mitePrefLink, $_trackerTimer, $_timeEntryHours, $_resourceWrapper, $_timeEntries, 
	$_stopTrackerLink;
	var _trackerData, _active, _titleDefault, _timerUpdateTime, _timerRef, _isOnIssueTimeEntriesPage;
	var _msg_stop_tracker = "Are you sure you want to stop the tracker?";
	
	var _initVars = function() {
		
		$_title = $_trackerTimeStyled = $_mitePrefLink = $_trackerTimer = null;
		var tracker_time = tracker_issue = tracker_te = 0;
		_timerRef = null;
		_active = false;
		_titleDefault = "";
		_timerUpdateTime = 60000; // update the timer each minute
		
		var tracker_data_temp = $('plugin_mite_tracker').readAttribute('value');
		
		if (tracker_data_temp && tracker_data_temp != 'null') {
			_trackerData = tracker_data_temp.evalJSON();
			_trackerData.time = parseInt(_trackerData.time);
			_active = _trackerData.active;
		}
		
		// 'time_entry_hours' is an input field available on all pages
		// where the user can log a time entry.
		// If it is available it will be set to '0h0m' in order 
		// to let the backend recognize a time entry which should start the mite tracker.
		$_timeEntryHours = $('time_entry_hours');
		
		// the class 'time-entries' is set on a table listing for all time entries of an issue
		// on page: issues/X/time_entries
		$_timeEntries = $$('.time-entries');
		
		_isOnIssueTimeEntriesPage = false;
		if ($_timeEntries.length) {
		  _isOnIssueTimeEntriesPage = true;
		}
	}
	
	var _insertTimeEntryPlaceHolders = function() {
		if (!_active && $_timeEntryHours.readAttribute('value') == null) {
			$_timeEntryHours.writeAttribute('value', '0h0m');
		}
	}
	
	var _initTimerVars = function() {
		$_title = $$('title')[0];
		_titleDefault = $_title.innerHTML;
		$_mitePrefLink = $('plugin_mite_prefs').up();
		$_trackerTimeStyled = 
			new Element('a', 
				{"id": "plugin_mite_tracker_time", "href": _trackerData.issue_url});
		$_trackerTimer = 
  	  new Element("a", {"id": "plugin_mite_tracker_active", "title": "Stop the running tracker", "href": "#"});
  	$_stopTrackerLink = 
  	  new Element("a", {"title": "Stop the running tracker", "href": "#"});
  	$_stopTrackerLink.update("Stop the running tracker");
	}
	
	var _addEventHandler = function() {
    if (_active) {
      _addEventHandlerForActiveTracker();
    }
  }
  
  var _addEventHandlerForActiveTracker = function() {
    if (_isOnIssueTimeEntriesPage) {
      $_trackerTimer.observe('click', function(e) {
  			if (window.confirm (_msg_stop_tracker) == true) {
          _onStopTrackerHandler();
          $(this).remove();
  			}
  			Event.stop(e);
  			return false;
  		});
    }
    $_stopTrackerLink.observe('click', function(e) {
			if (window.confirm (_msg_stop_tracker) == true) {
        _onStopTrackerHandler();
			}
			Event.stop(e);
			return false;
		});
  }
	
	var _onStopTrackerHandler = function() {
	 	new Ajax.Request("/mite/stop_tracker", {
			parameters: _trackerData,
			method: 'post',
			onSuccess: function(transport) {
				var response = transport.responseText;
				if (response == "Success") {
					$_trackerTimeStyled.remove();
					$_title.update(_titleDefault);
					window.clearTimeout(_timerRef);
					document.fire("mite_tracker:stopped");
				} 
				else {
					console.error("Could not stop the running tracker: " + response);
				}
			}
		});
	}
	
	var _displayMenuBarTimer = function () {
		$_mitePrefLink.appendChild($_trackerTimeStyled);
	}
	
	// Traverses over all time entries in the table listing until the currently active time entry
	// was found. On that an interactive clock is displayed (similar to mite)
	// which allows to stop an active tracker.
	var _displayTimerInTimeEntryTable = function() {
	  
		var teRow = null, teActionColumn = null;

		$$('.time-entries > tbody > tr').each(function(item, index) {

			// select the first table cell which contains a checkbox with the id of the time entry
			if ($(item).firstDescendant().firstDescendant().value == _trackerData.te) {

		    // selecting the row which contains the currently active time entry
				teRow = $$('.time-entries > tbody > tr')[index];

				// selecting the last column which contains the action links 'edit' and 'delete' 
				teActionColumn = $(teRow).select("td:last-child a")[0];
				return;
			}
		});
		if (teRow && teActionColumn) {
			$(teActionColumn).insert({before:$_trackerTimer});
			$(teActionColumn).up().previous().update("...");
		}
	}
	
	var _update_timers = function() {
		$_title.update("(" + _format_time(_trackerData.time) + ") " + _titleDefault);
		$_trackerTimeStyled.update("(" + _format_time(_trackerData.time) + ")");
		_trackerData.time += 1;
		_timerRef = window.setTimeout(_update_timers, _timerUpdateTime);
	}
	
	/* Returns a time value in the format hh:mm
	 * @param int
	 */
	var _format_time = function(minutes) {
		var hoursPart = Math.floor(minutes / 60);
		var minutesPart = minutes % 60;
		var timeFormated = "";
		timeFormated += "" + hoursPart + ":";
		if (minutesPart < 10) minutesPart = "0" + minutesPart
		timeFormated += "" + minutesPart
		return timeFormated;
	}
	
	// PUBLIC
	
	return {
	
	  $timeEntryHours : $_timeEntryHours,
	  $stopTrackerLink : $_stopTrackerLink,
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
			
			if ($_timeEntryHours) {
				_insertTimeEntryPlaceHolders();
			}
			this.$timeEntryHours = $_timeEntryHours;
			this.$stopTrackerLink = $_stopTrackerLink;
			this.active = _active;
		}
	};
}();

document.observe("dom:loaded", function() {
	MITE_TRACKER.init();
	document.fire("mite_tracker:loaded");
});