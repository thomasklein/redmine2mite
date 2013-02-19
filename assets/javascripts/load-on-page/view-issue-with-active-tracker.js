/*global showAndScrollTo */
(function (win, doc, $, undefined) {
  define(["helper"], function(helper) {
    "use strict";

    var _domIconLogTime, _domTimeEntryHours, _domMessageRunningTrackerInfobox,
        _domFormEditIssue, _domRedmineActivity, _domPreStopTrackerLink,
        _domTimeEntryComments, _domRedmineActivityLabel, _miteTimeEntryWasDisconnected,
        _msgMissingActivity,
        _h = helper,
        _onTrackerStopped = function() {}, // defined at runtime
        _onTrackerStarted = function() {}, // defined at runtime

    _initVars = function() {
      var oNode,
          labelStopRunningTracker = doc.getElementById("plugin_mite_label_stop_running_time_tracker").value,
          messageRunningTracker = doc.getElementById("plugin_mite_message_running_tracker").value;

      _domIconLogTime = $('#content .contextual .icon-time-add')[0];
      _domTimeEntryHours = doc.getElementById("time_entry_hours");
      _domFormEditIssue = $('form.edit_issue')[0];
      _domRedmineActivity = doc.getElementById("time_entry_activity_id");
      _domRedmineActivityLabel = $("label[for=time_entry_activity_id]");
      _domTimeEntryComments = doc.getElementById("time_entry_comments");
      _msgMissingActivity = doc.getElementById("plugin_mite_msg_missing_activity").value;
      _miteTimeEntryWasDisconnected = false;

      oNode = doc.createElement("div");
      oNode.id = "plugin_mite_running_tracker_infobox";
      oNode.innerHTML = messageRunningTracker;
      _domMessageRunningTrackerInfobox = oNode;

      oNode = doc.createElement("a");
      oNode.href = "#";
      oNode.className = "icon mite-icon-tracker-running";
      oNode.innerHTML = labelStopRunningTracker;
      _domPreStopTrackerLink = oNode;
    },

    _replaceTimeEntryHoursByRunningTrackerMessage = function() {
      var domTimeEntryHoursParentNode = _domTimeEntryHours.parentNode,
          domReplacedContent = doc.createDocumentFragment();

      _domTimeEntryHours.className += "hidden";
      domReplacedContent.appendChild($(_domTimeEntryHours).prev()[0]); // label
      domReplacedContent.appendChild(_domTimeEntryHours);
      domReplacedContent.appendChild(_domMessageRunningTrackerInfobox);
      // remove all content to remove the text node "hours"
      domTimeEntryHoursParentNode.innerHTML = "";
      domTimeEntryHoursParentNode.appendChild(domReplacedContent);
    },

    _prepareTimeEntryFormFields = function() {
      _replaceTimeEntryHoursByRunningTrackerMessage();
    },

    _onBeforeSubmittingEditFormWhenTrackerStopped = function() {
      _domFormEditIssue.reset();
      $(doc).trigger(_h.EVENTS.MITE_RESOURCE_FIELDS_SHOULD_TOGGLE, [false]);
      $(_domFormEditIssue).off();
      $(_domFormEditIssue).submit();
    },

    _stopTrackerApplyingEditFormValues = function() {
      var postDataForTracker;

      postDataForTracker = {
        "comments" : doc.getElementById("time_entry_comments").value,
        "activity_id" : _domRedmineActivity.options[_domRedmineActivity.selectedIndex].value,
        "mite_time_entry_was_disconnected" : _miteTimeEntryWasDisconnected
      };
      if (!_miteTimeEntryWasDisconnected) {
        postDataForTracker.mite_project_id = doc.getElementById("time_entry_mite_project_id").value;
        postDataForTracker.mite_service_id = doc.getElementById("time_entry_mite_service_id").value;
      }
      $(doc).trigger(_h.EVENTS.TRACKER_SHOULD_STOP, [postDataForTracker]);
    },

    _onBeforeSubmittingEditForm = function($event) {
      $(doc).on(_h.EVENTS.TRACKER_STOPPED, function(eEvent) {
        _onBeforeSubmittingEditFormWhenTrackerStopped();
      });
      if (_domRedmineActivity.selectedIndex === 0) {
        win.alert(_msgMissingActivity);
        showAndScrollTo("plugin_mite_running_tracker_infobox", "time_entry_activity_id");
      }
      else {
        _stopTrackerApplyingEditFormValues();
      }
      $event.preventDefault();
      return false;
    },

    _prepareEditIssueForm = function() {
      $(_domFormEditIssue).on('submit', _onBeforeSubmittingEditForm);
    },

    _addPreStopTrackerLinkToIssueHeader = function() {
      $(_domPreStopTrackerLink).insertAfter(_domIconLogTime);
    },

    _onClickPreStopTrackerLink = function($event) {
      showAndScrollTo("update", "time_entry_activity_id");
      showAndScrollTo("plugin_mite_running_tracker_infobox", "time_entry_activity_id");
      $event.preventDefault();
      return false;
    },

    _setEventHandlersForPreStopTrackerLink = function() {
      $(_domPreStopTrackerLink).on("click", _onClickPreStopTrackerLink);
    },

    _preparePreStopTrackerLink = function() {
      _setEventHandlersForPreStopTrackerLink();
      _addPreStopTrackerLinkToIssueHeader();
    },

    _onTrackerIsRunningOnCurrentIssue = function() {
      _preparePreStopTrackerLink();
      _prepareTimeEntryFormFields();
      _prepareEditIssueForm();
    },

    _onTrackerIsNotRunningOnCurrentIssue = function(trackerOptions) {
      _prepareStartTrackerLink(trackerOptions.startTrackerLink);
    },

    _isTrackerRunningOnCurrentIssue = function(trackerIssueId) {
      return parseInt(_h.urlParts.issues, 10) === trackerIssueId;
    },
    
    _onRunningTracker = function(trackerOptions) {
      if (_isTrackerRunningOnCurrentIssue(trackerOptions.trackerData.issue_id)) {
        _onTrackerIsRunningOnCurrentIssue();
      }
      else {
        _onTrackerIsNotRunningOnCurrentIssue(trackerOptions);
      }
    },

    _onClickStartTrackerLink = function(eEvent) {
      var domProjectId = doc.getElementById("issue_project_id"),
          projectId = domProjectId.options[domProjectId.selectedIndex].value,
          issueId = _h.urlParts.issues,
          activityId = _domRedmineActivity.options[1].value,
          postData = {
            "project_id" : projectId,
            "issue_id" : issueId,
            "hours" : _h.VALUES.TIME_0H0M,
            "comments" : "",
            "activity_id" : activityId,
            "mite_project_id" : "",
            "mite_service_id" : ""
          };
      $(doc).trigger(_h.EVENTS.TRACKER_START_LINK_CLICK_WAS_PROCESSED, [postData]);
      eEvent.preventDefault();
      return false;
    },

    _setEventHandlerForStartTrackerLink = function(domStartTrackerLink) {
      $(doc).on(_h.EVENTS.TRACKER_STARTED, function(event) {
        _onTrackerStarted();
      });
      $(doc).on(_h.EVENTS.TRACKER_START_LINK_CLICKED, function($event, clickEvent) {
        _onClickStartTrackerLink(clickEvent);
      });
      _onTrackerStarted = function() {
        $(domStartTrackerLink).detach();
      };
    },

    _styleStartTrackerLink = function(domStartTrackerLink) {
      domStartTrackerLink.className = "icon mite-icon-tracker-not-running";
    },

    _prepareStartTrackerLink = function(domStartTrackerLink) {
      _styleStartTrackerLink(domStartTrackerLink);
      _setEventHandlerForStartTrackerLink(domStartTrackerLink);
      $(domStartTrackerLink).insertAfter(_domIconLogTime);
    },

    _onNotRunningTracker = function(trackerOptions) {
      _prepareStartTrackerLink(trackerOptions.startTrackerLink);
    },

    _onMiteTimeEntryWasDisconnected = function () {
      _miteTimeEntryWasDisconnected = true;
    },

    _onMiteTimeEntryWasConnected = function () {
      _miteTimeEntryWasDisconnected = false;
    },

    _onMiteTimeEntryFieldsToggled = function(fieldsAreVisible) {
      if (fieldsAreVisible) {
        _onMiteTimeEntryWasConnected();
      }
      else {
        _onMiteTimeEntryWasDisconnected();
      }
    },

    _setEventHandlers = function() {
      $(doc).on(_h.EVENTS.TRACKER_INITIALIZED_RUNNING, function($event, trackerOptions) {
        _onRunningTracker(trackerOptions);
      });
      $(doc).on(_h.EVENTS.TRACKER_INITIALIZED_NOT_RUNNING, function($event, trackerOptions) {
        _onNotRunningTracker(trackerOptions);
      });
      $(doc).on(_h.EVENTS.MITE_RESOURCE_FIELDS_TOGGLED, function($event, fieldsAreVisible) {
        _onMiteTimeEntryFieldsToggled(fieldsAreVisible);
      });
    },

    _init = function() {
      _initVars();
      _setEventHandlers();
    };

    return {
      init : _init
    };
  });
}(window, document, jQuery));