/*global requirejs, require*/
(function (win, doc, $, undefined) {
  "use strict";

  requirejs.config({
    baseUrl: '/plugin_assets/redmine2mite/javascripts',
    urlArgs: "bust=v16"
  });

  $(function() {
    require(["helper", "components-manager"], function(h, cm) {
      var i,
          componentsForActiveTracker = [];

      switch (h.currentPage) {
        case h.PAGES.MITE_PREFERENCES:
          cm.add(cm.COMPONENTS.CHOSEN_HANLDER);
          cm.add(cm.COMPONENTS.ON_PAGE_MITE_PREFERENCES);
          break;
        case h.PAGES.TIME_ENTRY:
          cm.add(cm.COMPONENTS.CHOSEN_HANLDER);
          cm.add(cm.COMPONENTS.ON_PAGE_WITH_TIME_ENTRY_FIELDS);
          break;
        case h.PAGES.VIEW_ISSUE:
          cm.add(cm.COMPONENTS.CHOSEN_HANLDER);
          cm.add(cm.COMPONENTS.ON_PAGE_WITH_TIME_ENTRY_FIELDS);
          cm.add(cm.COMPONENTS.ON_PAGE_VIEW_ISSUE);
          componentsForActiveTracker.push(cm.COMPONENTS.ON_PAGE_VIEW_ISSUE_WITH_ACTIVE_TRACKER);
          break;
      }
      if (h.miteTrackerActive) {
        for (i = componentsForActiveTracker.length - 1; i >= 0; i--) {
          cm.add(componentsForActiveTracker[i]);
        }
        cm.add(cm.COMPONENTS.TRACKER);
      }
      cm.init();
    });
  });
}(window, document, jQuery));