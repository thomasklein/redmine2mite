/*global jQuery,define,require */
(function (win, doc, $, undefined) {
  define(function () {
    "use strict";
    
    var _COMPONENTS = {
          CHOSEN_HANLDER                          : "chosen-handler",
          TRACKER                                 : "tracker/tracker",
          ON_PAGE_MITE_PREFERENCES                : "load-on-page/mite-preferences",
          ON_PAGE_WITH_TIME_ENTRY_FIELDS          : "load-on-page/with-time-entry-fields",
          ON_PAGE_VIEW_ISSUE                      : "load-on-page/view-issue",
          ON_PAGE_VIEW_ISSUE_WITH_ACTIVE_TRACKER  : "load-on-page/view-issue-with-active-tracker"
        },
        _components = [],

    _add = function (component_name) {
      _components.push("!"+component_name);
    },
    
    _init = function () {
      require(_components, function() {
        var components = [].slice.call(arguments, 0),
            i = 0, len;

        for (len = components.length; i < len; i++) {
          components[i].init();
        }
      });
    };

    return {
      COMPONENTS : _COMPONENTS,
      init : _init,
      add : _add
    };
  });
}(window, document, jQuery));