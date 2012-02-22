document.observe("dom:loaded", function() {
	
	var MITE_TRACKER = function() {
		
		// PRIVATE VARS
		
		// selectors
		var $title, $tracker_time_styled, $mite_pref_link, $tracker_timer, $hours;
		
		var tracker_data, tracker_active, title_default, timer_update_time, timer_ref;
		
		// PRIVATE METHODS
		
		var initVars = function() {
			
			$title = $tracker_time_styled = $mite_pref_link = $tracker_timer = null;
			tracker_time = tracker_issue = tracker_te = 0;
			timer_ref = null;
			tracker_active = false;
			title_default = "";
			timer_update_time = 60000; // update the timer each minute
			
			var tracker_data_temp = $('plugin_mite_tracker').readAttribute('value');
			
			if (tracker_data_temp && tracker_data_temp != 'nil') {
				tracker_data = tracker_data_temp.evalJSON();
				tracker_data.time = parseInt(tracker_data.time);
				tracker_active = tracker_data.active;
			}
			
			// 'time_entry_hours' is an input field available on all pages
			// where the user can log a time entry.
			// If it is available it will be set to '0h0m' in order 
			// to let the backend recognize a time entry that should start
			// the mite tracker.
			$hours = $('time_entry_hours');
		}
		
		var insertTimeEntryPlaceHolders = function() {
			
			if ($hours.readAttribute('value') == null) {
				$hours.writeAttribute('value', '0h0m');
			}
		}
		
		var initTimerVars = function() {
				
			$title = $$('title')[0];
			title_default = $title.innerHTML;
			$mite_pref_link = $('plugin_mite_prefs').up();
			$tracker_time_styled = 
				new Element('a', 
					{"id": "plugin_mite_tracker_time", "href": tracker_data.issue_url});
		}
		
		var display_timer = function () {

			// the class 'time-entries' is set on a table listing all time entries for an issue
			// if its available, it is traversed over it until the currently active time entry
			// was found. on that an interactive clock is displayed (similar to mite)
			// which allows to stop an active tracker.
			if ($$('.time-entries').length) {

				var $tracker_timer = 
					new Element("a", {"id": "plugin_mite_tracker_active", "title": "Stop the running tracker", "href": "#"});

				$tracker_timer.observe('click', function(e) {

					var confirm = window.confirm ("Are you sure you want to stop the tracker?");

					if (confirm == true) {
						
						new Ajax.Request("/mite/stop_tracker", {
							
							parameters: tracker_data,
							method: 'post',
							
							// rails backend action will always return a valid response 200
							// but with different response texts
							onSuccess: function(transport) {
							    
								var response = transport.responseText;
								
								if (response == "Success") {
									
									$tracker_time_styled.remove();
									$title.update(title_default);
									 window.clearTimeout(timer_ref);
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
					if ($(item).firstDescendant().firstDescendant().value == tracker_data.te) {

						// selecting the row which contains the currently active time entry
						te_row = $$('.time-entries > tbody > tr')[index];

						// selecting the last column which contains the action links 'edit' and 'delete' 
						te_action_column = $(te_row).select("td:last-child a")[0];
						return;
					}
				});

				if (te_row && te_action_column) {
					$(te_action_column).insert({before:$tracker_timer});
				}
			}
			
			$mite_pref_link.appendChild($tracker_time_styled);
			
			update_timers();
		}
		
		/*
		 * Returns a time value in the format hh:mm
		 * 
		 * @param int
		 */
		var format_time = function(minutes) {
			
			var hours_part = Math.floor(minutes / 60);
			var minutes_part = minutes % 60;
			var time_formated = "";
			
			if (hours_part < 10) time_formated += "0"
			
			time_formated += "" + hours_part + ":"
			
			if (minutes_part < 10) minutes_part += "0"
			
			time_formated += "" + minutes_part
			
			return time_formated;
		} // format_time
		
		
		var update_timers = function() {

			$title.update("(" + format_time(tracker_data.time) + ") " + title_default);
			$tracker_time_styled.update("(" + format_time(tracker_data.time) + ")");
			
			tracker_data.time += 1;
			timer_ref = window.setTimeout(update_timers, timer_update_time);
		} // update_timers
		
		return {
		
			init : function () {
				
				initVars();
				
				if ($hours) {
					insertTimeEntryPlaceHolders();
				}
				
				if (tracker_active) {
					initTimerVars();
					display_timer();
				}
			} //init
		};
	}();
	
	MITE_TRACKER.init();
});