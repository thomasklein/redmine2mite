document.observe("dom:loaded", function() {
	
	var MITE_TRACKER = function() {
		
		// PRIVATE VARS
		
		// selectors
		var $_title, $_tracker_time_styled, $_mite_pref_link, $_tracker_timer, $_hours;
		
		var _tracker_data, _tracker_active, _title_default, _timer_update_time, _timer_ref;
		
		// PRIVATE METHODS
		
		var _initVars = function() {
			
			$_title = $_tracker_time_styled = $_mite_pref_link = $_tracker_timer = null;
			tracker_time = tracker_issue = tracker_te = 0;
			_timer_ref = null;
			_tracker_active = false;
			_title_default = "";
			_timer_update_time = 60000; // update the timer each minute
			
			var tracker_data_temp = $('plugin_mite_tracker').readAttribute('value');
			
			if (tracker_data_temp && tracker_data_temp != 'null') {
				_tracker_data = tracker_data_temp.evalJSON();
				_tracker_data.time = parseInt(_tracker_data.time);
				_tracker_active = _tracker_data.active;
			}
			
			// 'time_entry_hours' is an input field available on all pages
			// where the user can log a time entry.
			// If it is available it will be set to '0h0m' in order 
			// to let the backend recognize a time entry that should start
			// the mite tracker.
			$_hours = $('time_entry_hours');
		}
		
		var _insertTimeEntryPlaceHolders = function() {
			
			if ($_hours.readAttribute('value') == null) {
				$_hours.writeAttribute('value', '0h0m');
			}
		}
		
		var _initTimerVars = function() {
				
			$_title = $$('title')[0];
			_title_default = $_title.innerHTML;
			$_mite_pref_link = $('plugin_mite_prefs').up();
			$_tracker_time_styled = 
				new Element('a', 
					{"id": "plugin_mite_tracker_time", "href": _tracker_data.issue_url});
		}
		
		var _display_timer = function () {

			// the class 'time-entries' is set on a table listing all time entries for an issue
			// if its available, it is traversed over it until the currently active time entry
			// was found. on that an interactive clock is displayed (similar to mite)
			// which allows to stop an active tracker.
			if ($$('.time-entries').length) {

				var $_tracker_timer = 
					new Element("a", {"id": "plugin_mite_tracker_active", "title": "Stop the running tracker", "href": "#"});

				$_tracker_timer.observe('click', function(e) {

					var confirm = window.confirm ("Are you sure you want to stop the tracker?");

					if (confirm == true) {
						
						new Ajax.Request("/mite/stop_tracker", {
							
							parameters: _tracker_data,
							method: 'post',
							
							// rails backend action will always return a valid response 200
							// but with different response texts
							onSuccess: function(transport) {
							    
								var response = transport.responseText;
								
								if (response == "Success") {
									
									$_tracker_time_styled.remove();
									$_title.update(_title_default);
									 window.clearTimeout(_timer_ref);
								} 
								else {
									console.error("Could not stop the running tracker: " + response);
								}
							}
						});
						$(this).remove();
					}
					Event.stop(e);
					return false;
				});

				var te_row = null, te_action_column = null;

				$$('.time-entries > tbody > tr').each(function(item, index) {

					// select the first table cell which contains a checkbox with the id of the time entry
					if ($(item).firstDescendant().firstDescendant().value == _tracker_data.te) {

						// selecting the row which contains the currently active time entry
						te_row = $$('.time-entries > tbody > tr')[index];

						// selecting the last column which contains the action links 'edit' and 'delete' 
						te_action_column = $(te_row).select("td:last-child a")[0];
						return;
					}
				});

				if (te_row && te_action_column) {
					$(te_action_column).insert({before:$_tracker_timer});
				}
			}
			
			$_mite_pref_link.appendChild($_tracker_time_styled);
			
			_update_timers();
		}
		
		/*
		 * Returns a time value in the format hh:mm
		 * 
		 * @param int
		 */
		var _format_time = function(minutes) {
			
			var hours_part = Math.floor(minutes / 60);
			var minutes_part = minutes % 60;
			var time_formated = "";
			
			time_formated += "" + hours_part + ":"
			
			if (minutes_part < 10) minutes_part = "0" + minutes_part
			
			time_formated += "" + minutes_part
			
			return time_formated;
		} // _format_time
		
		
		var _update_timers = function() {

			$_title.update("(" + _format_time(_tracker_data.time) + ") " + _title_default);
			$_tracker_time_styled.update("(" + _format_time(_tracker_data.time) + ")");
			
			_tracker_data.time += 1;
			_timer_ref = window.setTimeout(_update_timers, _timer_update_time);
		} // _update_timers
		
		return {
		
			init : function () {
				
				_initVars();
				
				if ($_hours) {
					_insertTimeEntryPlaceHolders();
				}
				
				if (_tracker_active) {
					_initTimerVars();
					_display_timer();
				}
			} //init
		};
	}();
	
	MITE_TRACKER.init();
});