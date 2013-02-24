(function (win, doc, $, undefined) {
  define(["helper", "lib/chosen"], function (_h) {
    "use strict";
    var _cssProperties = {"width" : "450px"},

    _onSelectboxShouldBeImproved = function(evt, domSelectbox) {
      $(domSelectbox).css(_cssProperties).chosen();
    },

    _onImprovedSelectboxUpdated = function(evt, domSelectbox) {
      $(domSelectbox).trigger("liszt:updated");
    },

    _initEventHandler = function() {
      $(doc).on(_h.EVENTS.SELECTBOX_SHOULD_BE_IMPROVED, _onSelectboxShouldBeImproved);
      $(doc).on(_h.EVENTS.IMPROVED_SELECTBOX_UPDATED, _onImprovedSelectboxUpdated);
    },

    _init = function() {
      _initEventHandler();
    };

    return {
      init : _init
    };
  });
}(window, document, jQuery));