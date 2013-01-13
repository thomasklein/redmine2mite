/*global jQuery */
var MITE_APP = MITE_APP || {};

(function (win, doc, $, undefined) {
  "use strict";

  MITE_APP.preferences = (function() {
    
    var _$link_change_value, _$button_check_account_data, _$button_disconnect_account_data, _$field_api_key_inactive,
    _$notifier_account_data, _$account_data_button_pressed, _domMsg_confirm_disconnecting_account, _$button_save_bindings,
    _$notifier_preferences, _$project_connections,
    _customer_to_mite_project_bindings, _mite_projects, _customer_filter_by_select_box,
    _account_is_activated = false,
    
    _populateMiteProjectSelectBox = function(mite_project_select_box, options) {
      mite_project_select_box.innerHTML = options;
    },
    
    _emptyMiteProjectSelectBox = function(mite_project_select_box) {
      mite_project_select_box.innerHTML = "";
    },

    _showAllMiteProjects = function(mite_project_select_box) {
      var options = "", i;

      _emptyMiteProjectSelectBox(mite_project_select_box);
      for (i = 0; i < _mite_projects.length; i++) {
        options += "<option value='" + _mite_projects[i][0] + "'>" + _mite_projects[i][1] + "</option>";
      }
      _populateMiteProjectSelectBox(mite_project_select_box, options);
      mite_project_select_box.innerHTML = options;
    },

    _applyCustomerFilterOnMiteProjectSelectBox = function(mite_project_select_box, customer_id) {
      var projects_assigned_to_customer, options, i, j;

      if (customer_id == -1) {
        _showAllMiteProjects(mite_project_select_box);
        return;
      }
      projects_assigned_to_customer = _customer_to_mite_project_bindings[customer_id];
      if (projects_assigned_to_customer.length == 0) {
        _emptyMiteProjectSelectBox(mite_project_select_box);
        return;
      }
      options = "";
      for (i = 0; i < projects_assigned_to_customer.length; i++) {
        for (j = 0; j < _mite_projects.length; j++) {
          if (projects_assigned_to_customer[i] == _mite_projects[j][0]) {
            options += "<option value='" + _mite_projects[j][0] + "'>" + _mite_projects[j][1] + "</option>";
          }
        }
      }
      _populateMiteProjectSelectBox(mite_project_select_box, options);
    },

    _applyCustomerFilterOnAllMiteProjectSelectBoxes = function() {
      $('.mite_project_select').each(function(index, mite_project_select_box){
        var customer_id = _customer_filter_by_select_box[index];
        if (customer_id != -1) {
          _applyCustomerFilterOnMiteProjectSelectBox(mite_project_select_box, customer_id);
        }
      });
    },
    
    _onChangeCustomerFilter = function(eEvent) {
      var element = eEvent.target || eEvent.srcElement,
          customer_id = parseInt(element.value, 10) || -1,
          $project_select = $(element).next("select");
      _applyCustomerFilterOnMiteProjectSelectBox($project_select, customer_id);
    },
    
    _enableApiKeyField = function() {
      // delete the name of the hidden field containing the api_key
      doc.getElementById("mite_mite_api_key").name = "";
      // and make the form password field ready to submit
      _$field_api_key_inactive
        .attr("readonly",false)
        .attr("name","mite[mite_api_key]")
        .removeClass("readonly").val("").focus();
    },
    
    _onClickCheckAccountDataButton = function() {
      _$button_check_account_data.attr('disabled','disabled').css("cursor", 'wait');
      if (_account_is_activated) {
        _$button_disconnect_account_data.attr('disabled','disabled').css("cursor", 'wait');
      }
      _$notifier_account_data.css("display", 'block');
      _$account_data_button_pressed.attr('value','check_account_data');
      this.form.submit();
    },
    
    _onClickDisconnectAccountDataButton = function(eEvent) {
      if (win.confirm(_domMsg_confirm_disconnecting_account.innerHTML)) {
        _$button_disconnect_account_data.attr('disabled','disabled').css("cursor", "wait");
        _$button_check_account_data.attr('disabled','disabled').css("cursor", 'wait'); 
        _$notifier_account_data.css({"display": 'block', "cursor": 'wait'});
        _$account_data_button_pressed.attr('value','disconnect_account_data');
        this.form.submit();
      }
      else {
        eEvent.preventDefault();
        return false;
      }
    },
    
    _onClickSaveBindingsButton = function(e) {
      _$button_save_bindings.attr('disabled','disabled');
      _$notifier_preferences.css({"display": 'block'});
      this.form.submit();
    },
    
    _onClickOnProjectCheckbox = function(eEvent) {
      var element = eEvent.target || eEvent.srcElement,
          $element = $(element),
          id_attr = element.attr("id"),
          project_id = id_attr.substring(id_attr.lastIndexOf("_") + 1),
        // convenience vars for mite project and services
          $sb_miteProject = $element.parent().next("select"),
          $sb_miteService = $element.parent().next("select").next("select"),
          $field_noneSelected = $element.parent().next("input");

      if ($element.checked == false) {
        $field_noneSelected.attr("value","-1");
      // unset names of the project and services select boxes
      // to avoid assignment when submitting the form 
        $sb_miteProject.attr("name","").attr("disabled","disabled");
        $sb_miteService.attr("name","").attr("disabled","disabled");
      // remove possible selections from select boxes to set a visual mark for the change
        $sb_miteProject.selectedIndex = 0;
        $sb_miteService.selectedIndex = -1;
      // mark the fieldset and its children as incative using a CSS class   
        $element.parent("fieldset").attr("class","plugin_mite_inactive");
      }
      else {
        $("project_" + project_id).css({"display": "block"});
        $field_noneSelected.attr("value","0");
      // reset names of the project and services select boxes 
        $sb_miteProject.attr("name","bindings[" + project_id +"][]").removeAttribute("disabled");
        $sb_miteService.attr("name","bindings[" + project_id +"][]").removeAttribute("disabled");
        $element.parent("fieldset").attr("class","");
      }
    },

    _initVars = function() {
      _$link_change_value = $(doc.getElementById('plugin_mite_link_change_value'));
      _$button_check_account_data = $(doc.getElementById('check_account_data'));
      _$button_disconnect_account_data = $(doc.getElementById('disconnect_account_data'));
      _$notifier_account_data = $(doc.getElementById('mite_plugin_notifier_account_data'));
      _$account_data_button_pressed = $(doc.getElementById('mite_account_data_button_pressed'));
      _account_is_activated = (_$button_disconnect_account_data.length);
    },
    
    _initEvents = function() {
      _$button_check_account_data.on('click', _onClickCheckAccountDataButton);
    },
    
    _initVarsForActivatedAccount = function() {
      _domMsg_confirm_disconnecting_account = doc.getElementById('msg_confirm_disconnecting_account');
      _$field_api_key_inactive = $(doc.getElementById('mite_api_key_inactive'));
      _$button_save_bindings = $(doc.getElementById('save_bindings'));
      _$notifier_preferences = $(doc.getElementById('mite_plugin_notifier_preferences'));
      _$project_connections = $('.project_connection');
      _customer_to_mite_project_bindings = $.parseJSON(doc.getElementById("mite_customer_to_project_bindings").value);
      _mite_projects = $.parseJSON(doc.getElementById("mite_projects").value);
      _customer_filter_by_select_box = [];
      $('.customer_filter').each(function(customer_select_box_index, customer_select_box){
        var customer_id = parseInt(customer_select_box.value, 10) || -1;
        _customer_filter_by_select_box.push(customer_id);
      });
    },
    
    _initElementsForActivatedAccount = function() {
      _applyCustomerFilterOnAllMiteProjectSelectBoxes();
    },
    
    _initEventsForActivatedAccount = function() {
      _$link_change_value.on('click', _enableApiKeyField);
      _$button_disconnect_account_data.on('click', _onClickDisconnectAccountDataButton);
      _$button_save_bindings.on('click', _onClickSaveBindingsButton);
      _$project_connections.each(function(){
        $(this).on('click', _onClickOnProjectCheckbox);
      });
      $('.customer_filter').each(function(){
        $(this).on('change', _onChangeCustomerFilter);
      });
    },

    _init = function() {
      _initVars();
      _initEvents();
      if (_account_is_activated) {
        _initVarsForActivatedAccount();
        _initElementsForActivatedAccount();
        _initEventsForActivatedAccount();
      }
    };

    return {
      init : _init
    };
  }());

  $(function() {
    MITE_APP.preferences.init();
  });
}(window, document, jQuery));