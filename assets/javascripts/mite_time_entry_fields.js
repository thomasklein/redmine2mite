var MITE_TIME_ENTRY_FIELDS = function() {
  
  // PRIVATE
  
  var $_checkboxSendToMite, $_fsBookEffort, $_mite_resources_wrapper, $_mite_resources, $_time_entry_mite_project_id,
  $_timeLogFormElementContainer, $_messageRunningTracker;
  var _editFormHasTimeLogFields;
  
  var _initVars = function() {
    $_checkboxSendToMite = $('option_send_te_to_mite');
    // get the second fieldset with the class 'tabular'
  	// which contains the fields to append an time entry to the change
  	$_fsBookEffort = $$('fieldset.tabular')[1];
  	if ($_fsBookEffort != null) {
  	  _editFormHasTimeLogFields = true;
  	  $_fsBookEffort = $($_fsBookEffort);
	  } 
	  // if it is does not exist, the user is most probably
  	// not allowed to create a time entry
	  else {
	    _editFormHasTimeLogFields = false;
	  }
	  $_mite_resources_wrapper = $('mite_resources_wrapper');
	  $_mite_resources = $("mite_resources");
    $_time_entry_mite_project_id = $("time_entry_mite_project_id");
    $_time_entry_mite_service_id = $("time_entry_mite_service_id");
    $_timeLogFormElementContainer = new Element('div', 
      {"id": "plugin_mite_hidden_time_log_form_elements", "style": "display:none"});
    $_messageRunningTracker = new Element('p', {"id": "", "style": "display:block"});
    $_messageRunningTracker.update(
      "Currently the mite time tracker is running on this ticket. " +
      "If you want to log a new time entry you have to stop it first: ");
  }
  
  var _addResourcesWrapperToEditForm = function() {
    
  // if it does exist, append the mite fields created in
	// IssueDetailsLayoutHook.view_issues_form_details_bottom
	// to the fieldset
		$_fsBookEffort.insert($_mite_resources_wrapper, content);
		$_mite_resources_wrapper.setStyle({display: 'block'});
  }
  
  var _toggleMiteResourceFields = function(show) {
    if (show) {
      $_mite_resources.setStyle({display:"block"});
      $_time_entry_mite_project_id.setAttribute("name","time_entry[mite_project_id]");
      $_time_entry_mite_service_id.setAttribute("name","time_entry[mite_service_id]");
      if (MITE_TRACKER.active && MITE_TRACKER.$timeEntryHours.getAttribute("value") == "") {
        MITE_TRACKER.$timeEntryHours.writeAttribute("value", "0h0m");
      }
    }
    else {
      $_mite_resources.setStyle({display:"none"});
      $_time_entry_mite_project_id.setAttribute("name","");
      $_time_entry_mite_service_id.setAttribute("name","");
      if (MITE_TRACKER.active && MITE_TRACKER.$timeEntryHours.getAttribute("value") == "0h0m") {
        MITE_TRACKER.$timeEntryHours.writeAttribute("value", "");
      }
    }
  }
  
  var _onCheckboxStatusChange = function() {
    if ($_mite_resources.getStyle("display")=="block") {
      _toggleMiteResourceFields(false);
    }
    else {
      _toggleMiteResourceFields(true);
    } 
  }
  
  var _initTimeLogForm = function(show) {
    $_fsBookEffort.childElements().each(function(el, index){
      if (index > 0) {
        $_timeLogFormElementContainer.appendChild($(el));
      }
    });
    
    $_messageRunningTracker.appendChild(MITE_TRACKER.$stopTrackerLink);
    $_fsBookEffort.appendChild($_messageRunningTracker);
    $_fsBookEffort.appendChild($_timeLogFormElementContainer);
  }
  
  var _toggleTimeLogForm = function(show) {
    if (show) {
      $_timeLogFormElementContainer.setStyle({display:"block"});
      $_messageRunningTracker.setStyle({display:"none"});
    }
    else {
      $_timeLogFormElementContainer.setStyle({display:"none"});
      $_messageRunningTracker.setStyle({display:"block"});
    }
    _toggleMiteResourceFields(show);
  }
  
  var _addEventHandler = function() {
    $_checkboxSendToMite.observe('click', _onCheckboxStatusChange);
  }
  
  var _initObservers = function() {
    if (MITE_TRACKER.active && _editFormHasTimeLogFields) {
      document.observe("mite_tracker:stopped", function(event) {
        _toggleTimeLogForm(true);
      });
    }
  }
  
  var _init = function() {
    _initVars();
    if (_editFormHasTimeLogFields) {
      _addResourcesWrapperToEditForm();
      if (MITE_TRACKER.active) {
        _initTimeLogForm();
        _toggleTimeLogForm(false);
      }
    }
    _addEventHandler();
    _initObservers();
  }
  
  // PUBLIC
  
  return {
	  init : _init
	};
}();

document.observe("dom:loaded", function() {
  if (typeof(MITE_TRACKER) == "undefined") {
    MITE_TRACKER = {active : false};
    MITE_TIME_ENTRY_FIELDS.init();
  } else {
    document.observe("mite_tracker:loaded", function(event) {
      MITE_TIME_ENTRY_FIELDS.init();
    });
  }
});