(function (win, doc, undefined) {
  define(function () {
    "use strict";
    var _path = win.location.pathname.slice(1), // quit the first char which is a "/"
        _urlParts = {},
        _currentPage,
        _miteTrackerActive = doc.getElementById("plugin_mite_tracker_data") !== null,
        _PAGES = {
          MITE_PREFERENCES       : "mite_preferences",
          VIEW_ISSUE             : "view_issue",
          TIME_ENTRIES_ON_ISSUE  : "time_entries_on_issue",
          TIME_ENTRY             : "time_entry"
        },
        _VALUES = {
          TIME_0H0M : "0h0m",
          START_TRACKER_DIALOG_WIDTH : 600
        },
        _EVENTS = {
          TRACKER_INITIALIZED_RUNNING            : "mite_tracker:tracker_initialized_running",
          TRACKER_INITIALIZED_NOT_RUNNING        : "mite_tracker:tracker_initialized_not_running",
          TRACKER_STOPPED                        : "mite_tracker:stopped",
          TRACKER_SHOULD_STOP                    : "mite_tracker:should_stop",
          TRACKER_STARTED                        : "mite_tracker:started",
          TRACKER_UPDATED_TIME                   : "mite_tracker:updated_time",
          TRACKER_STOP_LINK_CLICKED              : "mite_tracker:stop_link_clicked",
          TRACKER_START_LINK_CLICKED             : "mite_tracker:start_link_clicked",
          TRACKER_STOP_LINK_CLICK_WAS_PROCESSED  : "mite_tracker:stop_link_clicked_was_processed",
          TRACKER_START_LINK_CLICK_WAS_PROCESSED : "mite_tracker:start_link_clicked_was_processed",
          MITE_RESOURCE_FIELDS_SHOULD_TOGGLE     : "mite_resource_fields:should_toggle",
          MITE_RESOURCE_FIELDS_TOGGLED           : "mite_resource_fields:toggled",
          SELECTBOX_SHOULD_BE_IMPROVED           : "mite:selectbox_should_be_improved",
          IMPROVED_SELECTBOX_UPDATED             : "mite:improved_selectbox_updated"
        },
        _URLS = {
          START_TRACKER : "/mite/start_tracker",
          STOP_TRACKER : "/mite/stop_tracker"
        },

        /**
          * Puts the URL params of the current page into an
          * ordered key value hash and provides
          * the complete page URL with the key "completeUrl"
          * E.g.: "issues/2" becomes {"completeUrl"http://localhost/issues/2", "issues" : 2}
          */
        _setUrlParts = function () {
          var parts, i = 0, len,
              isIntRegEx = /^\d+$/,
              currentPart, lastPart;

          _urlParts = {
            "completeUrl" : win.location.href
          };
          parts = _path.split("/");
          for (len = parts.length; i < len; i++) {
            currentPart = parts[i];
            if (isIntRegEx.test(currentPart) && (i > 0))  {
              lastPart = parts[(i-1)];
              _urlParts[lastPart] = currentPart;
            }
            else {
              _urlParts[currentPart] = "";
            }
          }
        },

        _setCurrentPage = function() {
          if (_path.indexOf("mite") !== -1) { _currentPage = _PAGES.MITE_PREFERENCES; }
          else if ((_path.indexOf("time_entries") !== -1) && (_path.indexOf("issues") !== -1) && (_path.indexOf("new") === -1)) {
            _currentPage = _PAGES.TIME_ENTRIES_ON_ISSUE;
          }
          else if (_path.indexOf("time_entries") !== -1) { _currentPage = _PAGES.TIME_ENTRY; }
          else if (_path.indexOf("issues") !== -1 && _path.indexOf("projects") === -1) { _currentPage = _PAGES.VIEW_ISSUE; }
        },

        _removeClass = function(domElement, className) {
           domElement.className = domElement.className.replace(new RegExp(className,"g"),"");
        },

        _hasClass = function(domElement, className) {
          return domElement.className.match(new RegExp('(\\s|^)'+ className +'(\\s|$)'));
        };

    _setUrlParts();
    _setCurrentPage();

    return {
      EVENTS            : _EVENTS,
      PAGES             : _PAGES,
      VALUES            : _VALUES,
      URLS              : _URLS,
      currentPage       : _currentPage,
      removeClass       : _removeClass,
      hasClass          : _hasClass,
      urlParts          : _urlParts,
      miteTrackerActive : _miteTrackerActive
    };
  });
}(window, document));