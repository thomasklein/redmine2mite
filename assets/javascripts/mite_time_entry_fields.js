/*global jQuery */
var MITE_APP = MITE_APP || {};

(function (win, doc, $, undefined) {
  "use strict";

  MITE_APP.timeEntryFields = (function() {
    
    var _$checkboxSendToMite, _$fsBookEffort, _$mite_resources_wrapper, _$mite_resources, 
        _$time_entry_mite_project_id, _$time_entry_mite_service_id, _$timeLogFormElementContainer, 
        _$messageRunningTracker, _editFormHasTimeLogFields,
    
    _initVars = function() {
      var oNode;
      _$checkboxSendToMite = $('option_send_te_to_mite');
      // get the second fieldset with the class 'tabular'
      // which contains the fields to append an time entry to the change
      _$fsBookEffort = $('fieldset.tabular')[1];
      if (_$fsBookEffort != null) {
        _editFormHasTimeLogFields = true;
        _$fsBookEffort = $(_$fsBookEffort);
      } 
      // if it is does not exist, the user is most probably
      // not allowed to create a time entry
      else {
        _editFormHasTimeLogFields = false;
      }
      _$mite_resources_wrapper = $('mite_resources_wrapper');
      _$mite_resources = $("mite_resources");
      _$time_entry_mite_project_id = $(doc.getElementById("time_entry_mite_project_id"));
      _$time_entry_mite_service_id = $(doc.getElementById("time_entry_mite_service_id"));
      
      oNode = document.createElement("div");
      oNode.id = "plugin_mite_hidden_time_log_form_elements";
      oNode.style.display = "none";
      _$timeLogFormElementContainer = oNode;

      oNode = document.createElement("p");
      oNode.id = "";
      oNode.style.display = "block";
      oNode.innerHTML = 
        "Currently the mite time tracker is running on this ticket. " +
        "If you want to log a new time entry you have to stop it first: ";
      _$messageRunningTracker = oNode;
    },
    
    _addResourcesWrapperToEditForm = function() {
    // if it does exist, append the mite fields created in
    // IssueDetailsLayoutHook.view_issues_form_details_bottom
    // to the fieldset
      _$fsBookEffort.append(_$mite_resources_wrapper);
      _$mite_resources_wrapper.css({"display" : "block"});
    },
    
    _toggleMiteResourceFields = function(show) {
      if (show) {
        _$mite_resources.css({"display" : "block"});
        _$time_entry_mite_project_id.attr("name","time_entry[mite_project_id]");
        _$time_entry_mite_service_id.attr("name","time_entry[mite_service_id]");
        if (MITE_APP.tracker.active && MITE_APP.tracker.$timeEntryHours.attr("value") == "") {
          MITE_APP.tracker.$timeEntryHours.attr("value", "0h0m");
        }
      }
      else {
        _$mite_resources.css({"display" : "none"});
        _$time_entry_mite_project_id.attr("name","");
        _$time_entry_mite_service_id.attr("name","");
        if (MITE_APP.tracker.active && MITE_APP.tracker.$timeEntryHours.attr("value") == "0h0m") {
          MITE_APP.tracker.$timeEntryHours.attr("value", "");
        }
      }
    },
    
    _onCheckboxStatusChange = function() {
      if (_$mite_resources.css("display") === "block") {
        _toggleMiteResourceFields(false);
      }
      else {
        _toggleMiteResourceFields(true);
      } 
    },
    
    _initTimeLogForm = function(show) {
      _$fsBookEffort.children().each(function(el, index){
        if (index > 0) {
          $(_$timeLogFormElementContainer).append($(el));
        }
      });
      
      $(_$messageRunningTracker).append(MITE_APP.tracker.$stopTrackerLink);
      _$fsBookEffort.append(_$messageRunningTracker);
      _$fsBookEffort.append(_$timeLogFormElementContainer);
    },
    
    _toggleTimeLogForm = function(show) {
      if (show) {
        _$timeLogFormElementContainer.style.display = "block";
        _$messageRunningTracker.style.display = "none";
      }
      else {
        _$timeLogFormElementContainer.style.display = "none";
        _$messageRunningTracker.style.display = "block";
      }
      _toggleMiteResourceFields(show);
    },
    
    _addEventHandler = function() {
      _$checkboxSendToMite.on('click', _onCheckboxStatusChange);
    },
    
    _initObservers = function() {
      if (MITE_APP.tracker.active && _editFormHasTimeLogFields) {
        $(document).on("mite_tracker:stopped", function(event) {
          _toggleTimeLogForm(true);
        });
      }
    },
    
    _init = function() {
      _initVars();
      if (_editFormHasTimeLogFields) {
        _addResourcesWrapperToEditForm();
        if (MITE_APP.tracker.active) {
          _initTimeLogForm();
          _toggleTimeLogForm(false);
        }
      }
      _addEventHandler();
      _initObservers();
    };
    
    return {
      init : _init
    };
  }());

  $(function() {
    if (typeof(MITE_APP.tracker) === "undefined") {
      MITE_APP.tracker = {active : false};
      MITE_APP.timeEntryFields.init();
    } else {
      $(document).bind('mite_tracker:loaded', function(eEvent) {
        MITE_APP.timeEntryFields.init();
      });
    }
  });
}(window, document, jQuery));  