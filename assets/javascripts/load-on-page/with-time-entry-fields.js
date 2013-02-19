(function (win, doc, $, _undefined_) {
  define(["helper"], function (helper) {
    "use strict";
    var _h = helper,
        _domCheckboxSendToMite,
        _$mite_resources, _$time_entry_mite_project_id, _$time_entry_mite_service_id,
        _$timeEntryHours, _$mite_resources_wrapper,
        
    _setTimeEntryHoursTo0h0m = function () {
      if (!!!_$timeEntryHours.val()) {
        _$timeEntryHours.val(_h.VALUES.TIME_0H0M);
      }
    },

    _onRunningTracker = function(runningTrackerOptions) {
      _setTimeEntryHoursTo0h0m();
    },

    _onNotRunningTracker = function(notRunningTrackerOptions) {
      _setTimeEntryHoursTo0h0m();
    },
    
    _showMiteResourceFields = function(){
      _$mite_resources.css({"display" : "block"});
      _$time_entry_mite_project_id.attr("name","time_entry[mite_project_id]");
      _$time_entry_mite_service_id.attr("name","time_entry[mite_service_id]");
    },

    _hideMiteResourceFields = function() {
      _$mite_resources.css({"display" : "none"});
      _$time_entry_mite_project_id.attr("name","");
      _$time_entry_mite_service_id.attr("name","");
    },

    _toggleMiteResourceFields = function(show) {
      if (show) { _showMiteResourceFields(); }
      else { _hideMiteResourceFields(); }
      // fields are visible if show = true
      $(doc).trigger(_h.EVENTS.MITE_RESOURCE_FIELDS_TOGGLED, [show]);
    },

    _onCheckboxStatusChange = function() {
      _toggleMiteResourceFields(_$mite_resources.css("display") !== "block");
    },

    _initVars = function() {
      _$mite_resources_wrapper = $(doc.getElementById("mite_resources_wrapper"));
      _$mite_resources = $(doc.getElementById("mite_resources"));
      _$timeEntryHours = $(doc.getElementById("time_entry_hours"));
      _$time_entry_mite_project_id = $(doc.getElementById("time_entry_mite_project_id"));
      _$time_entry_mite_service_id = $(doc.getElementById("time_entry_mite_service_id"));
      _domCheckboxSendToMite = doc.getElementById("option_send_te_to_mite");
    },

    _initEventHandlers = function() {
      $(_domCheckboxSendToMite).on('click', _onCheckboxStatusChange);
      $(doc).on(_h.EVENTS.TRACKER_INITIALIZED_RUNNING, function(evt, runningTrackerOptions) {
        _onRunningTracker(runningTrackerOptions);
      });
      $(doc).on(_h.EVENTS.TRACKER_INITIALIZED_NOT_RUNNING, function(evt, notRunningTrackerOptions) {
        _onNotRunningTracker(notRunningTrackerOptions);
      });
      $(doc).on(_h.EVENTS.MITE_RESOURCE_FIELDS_SHOULD_TOGGLE, function(eEvent, showFields) {
        _toggleMiteResourceFields(showFields);
      });
    },

    _init = function() {
      _initVars();
      _initEventHandlers();
    };
    return {
      init : _init
    };
  });
}(window, document, jQuery));