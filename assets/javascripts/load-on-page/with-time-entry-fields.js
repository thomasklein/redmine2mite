(function (win, doc, $, _undefined_) {
  define(["helper"], function (_h) {
    "use strict";
    var _domCheckboxSendToMite, _domRedmineActivity, _domMiteResources,
        _domMiteProjects, _domMiteServices, _domHours,
        _servicesShouldSynchronize,
        
    _setHoursTo0h0m = function () {
      _domHours.value = _h.VALUES.TIME_0H0M;
    },

    _onRunningTracker = function(runningTrackerOptions) {
      if (!!!_domHours.value) {
        _setHoursTo0h0m();
      }
    },

    _onNotRunningTracker = function(notRunningTrackerOptions) {
      _setHoursTo0h0m();
    },
    
    _showMiteResourceFields = function(){
      _h.removeClass(_domMiteResources, "hidden");
      _domMiteProjects.name = "time_entry[mite_project_id]";
      _domMiteServices.name = "time_entry[mite_service_id]";
    },

    _hideMiteResourceFields = function() {
      _domMiteResources.className += "hidden";
      _domMiteProjects.name = "";
      _domMiteServices.name = "";
    },

    _toggleMiteResourceFields = function(show) {
      if (show) { _showMiteResourceFields(); }
      else { _hideMiteResourceFields(); }
      // fields are now visible if show = true
      $(doc).trigger(_h.EVENTS.MITE_RESOURCE_FIELDS_TOGGLED, [show]);
    },

    _onCheckboxStatusChange = function() {
      _toggleMiteResourceFields(!_h.hasClass(_domMiteResources, "hidden"));
    },

    _synchronizeMiteServiceAndActivitySelection = function (evt, domSelectToSynchronize) {
      var domSelectedSelect = evt.target || evt.srcElement,
          lookupValue = domSelectedSelect.options[domSelectedSelect.selectedIndex].innerHTML,
          domOptions,
          len;
      
      for(domOptions = domSelectToSynchronize.options, len = domOptions.length - 1; len >= 0; len--) {
        if( domOptions[len].innerHTML === lookupValue ) {
          domSelectToSynchronize.selectedIndex = len;
          $(doc).trigger(_h.EVENTS.IMPROVED_SELECTBOX_UPDATED, [domSelectToSynchronize]);
          break;
        }
      }
    },

    _improveSelectboxes = function() {
      // in case the mite project is fixed and therefore an hidden input field,
      // don't try to improve it
      if (_domMiteProjects.nodeName === "SELECT") {
        $(doc).trigger(_h.EVENTS.SELECTBOX_SHOULD_BE_IMPROVED, [_domMiteProjects]);
      }
      $(doc).trigger(_h.EVENTS.SELECTBOX_SHOULD_BE_IMPROVED, [_domMiteServices]);
    },

    _initEventHandlers = function() {
      $(_domCheckboxSendToMite).on('click', _onCheckboxStatusChange);
      $(doc).on(_h.EVENTS.TRACKER_INITIALIZED_RUNNING, function(evt, runningTrackerOptions) {
        _onRunningTracker(runningTrackerOptions);
      });
      $(doc).on(_h.EVENTS.TRACKER_INITIALIZED_NOT_RUNNING, function(evt, notRunningTrackerOptions) {
        _onNotRunningTracker(notRunningTrackerOptions);
      });
      $(doc).on(_h.EVENTS.MITE_RESOURCE_FIELDS_SHOULD_TOGGLE, function(evt, showFields) {
        _toggleMiteResourceFields(showFields);
      });
      if (_servicesShouldSynchronize) {
        $(_domMiteServices).on("change", function(evt) {
          _synchronizeMiteServiceAndActivitySelection(evt, _domRedmineActivity);
        });
        $(_domRedmineActivity).on("change", function(evt) {
          _synchronizeMiteServiceAndActivitySelection(evt, _domMiteServices);
        });
      }
    },

    _initVars = function() {
      _domMiteResources = doc.getElementById("mite_resources");
      _domHours = doc.getElementById("time_entry_hours");
      _domMiteProjects = doc.getElementById("time_entry_mite_project_id");
      _domMiteServices = doc.getElementById("time_entry_mite_service_id");
      _domRedmineActivity = doc.getElementById("time_entry_activity_id");
      _domCheckboxSendToMite = doc.getElementById("option_send_te_to_mite");
      _servicesShouldSynchronize = doc.getElementById("plugin_mite_synchronize_services_option") !== null;
    },

    _init = function() {
      _initVars();
      _initEventHandlers();
      _improveSelectboxes();
    };
    return {
      init : _init
    };
  });
}(window, document, jQuery));