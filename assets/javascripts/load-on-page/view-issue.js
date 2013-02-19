(function(win, doc, $, undefined) {
  define(["helper"], function(helper) {
    "use strict";

    var _domFieldsetBookEffort, _domMiteResourcesWrapper, _domRedmineActivityLabel,
        _h = helper,
    
    _initVars = function() {
      // get the second fieldset with the class 'tabular' which is initially hidden
      // and contains the fields to append an time entry to the "Log time" tab
      _domFieldsetBookEffort = $('fieldset.tabular')[1];
      _domMiteResourcesWrapper = doc.getElementById("mite_resources_wrapper");
      _domRedmineActivityLabel = $("label[for=time_entry_activity_id]")[0];
    },
    
    _improveEditFormFields = function() {
      _domRedmineActivityLabel.innerHTML =
        _domRedmineActivityLabel.innerHTML + "<span class='required'> *</span>";
    },

    _addResourcesWrapperToEditForm = function() {
      _domFieldsetBookEffort.appendChild(_domMiteResourcesWrapper);
      _h.removeClass(_domMiteResourcesWrapper, "hidden");
    },
    
    _init = function() {
      _initVars();
      _addResourcesWrapperToEditForm();
      _improveEditFormFields();
    };
    return {
      init : _init
    };
  });
}(window, document, jQuery));