/*global jQuery,define */
(function (win, doc, $, undefined) {
  define(["helper", "lib/chosen"], function (helper) {
    "use strict";
    
    var _cssProperties = {"width" : "450px"},
        _h = helper,

    _init = function() {
      switch (_h.currentPage) {
        case _h.PAGES.MITE_PREFERENCES:
          $(".mite_customer_filter").css(_cssProperties).chosen();
          $(".mite_project_select").css(_cssProperties).chosen();
          $(".mite_services_select").css(_cssProperties).chosen();
          $(doc).on(_h.EVENTS.CHANGED_CUSTOMER_FILTER, function(evt, mite_project_select_box) {
            $(mite_project_select_box).trigger("liszt:updated");
          });
          break;
        case _h.PAGES.TIME_ENTRY:
        case _h.PAGES.VIEW_ISSUE:
          $(doc.getElementById("time_entry_mite_project_id")).css(_cssProperties).chosen();
          $(doc.getElementById("time_entry_mite_service_id")).css(_cssProperties).chosen();
          break;
      }
    };
    
    return {
      init : _init
    };
  });
}(window, document, jQuery));