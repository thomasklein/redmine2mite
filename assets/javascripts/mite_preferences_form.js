MITE_PREFERENCES_FORM = function() {
  
  // PRIVATE
  
  var $_link_change_value, $_button_check_account_data, $_button_disconnect_account_data, $_field_api_key,
  $_notifier_account_data, $_account_data_button_pressed, $_msg_confirm_disconnecting_account, $_button_save_bindings,
  $_notifier_preferences, $$_project_connections,
  _customer_to_mite_project_bindings, _mite_projects, _customer_filter_by_select_box,
  _account_is_activated = false;
  
  var _init = function() {
    _initVars();
    _initElements();
    _initEvents();
    if (_account_is_activated) {
      _initVarsForActivatedAccount();
      _initElementsForActivatedAccount();
      _initEventsForActivatedAccount();
    }
  }
  
  var _initVars = function() {
    $_link_change_value = $('plugin_mite_link_change_value'),
    $_field_api_key = $('mite_mite_api_key'),
    $_button_check_account_data = $('check_account_data'),
    $_button_disconnect_account_data = $('disconnect_account_data'),
    $_notifier_account_data = $('mite_plugin_notifier_account_data'),
    $_account_data_button_pressed = $('mite_account_data_button_pressed'),
    _account_is_activated = ($_button_disconnect_account_data != null);
  }
  
  var _initElements = function() {
    if (!_account_is_activated) {
      $_link_change_value.setStyle({display: 'none'});
    }
  }
  
  var _initEvents = function() {
    $_button_check_account_data.observe('click', _onClickCheckAccountDataButton);
  }
  
  var _initVarsForActivatedAccount = function() {
    $_msg_confirm_disconnecting_account = $('msg_confirm_disconnecting_account'),
    $_button_save_bindings = $('save_bindings'),
    $_notifier_preferences = $('mite_plugin_notifier_preferences'),
    $$_project_connections = $$('.project_connection');
    _customer_to_mite_project_bindings = $('mite_customer_to_project_bindings').readAttribute('value').evalJSON();
    _mite_projects = $('mite_projects').readAttribute('value').evalJSON();
    _customer_filter_by_select_box = [];
    $$('.customer_filter').each(function(customer_select_box, customer_select_box_index){
      var customer_id = parseInt(customer_select_box.value);
      if (!customer_id) customer_id = -1;
      _customer_filter_by_select_box.push(customer_id);
    });
  }
  
  var _initElementsForActivatedAccount = function() {
    _applyCustomerFilterOnAllMiteProjectSelectBoxes();
  }
  
  var _initEventsForActivatedAccount = function() {
    $_link_change_value.observe('click', _enableApiKeyField);
    $_button_disconnect_account_data.observe('click', _onClickDisconnectAccountDataButton);
    $_button_save_bindings.observe('click', _onClickSaveBindingsButton);
    $$_project_connections.each(function(checkbox){
  		checkbox.observe('click', _onClickOnProjectCheckbox)
  	});
  	$$('.customer_filter').each(function(select){
  		select.observe('change', _onChangeCustomerFilter);
  	});
  }
  
  var _applyCustomerFilterOnAllMiteProjectSelectBoxes = function() {
    $$('.mite_project_select').each(function(mite_project_select_box, index){
  		var customer_id = _customer_filter_by_select_box[index];
  		if (customer_id != -1) {
  		  _applyCustomerFilterOnMiteProjectSelectBox(mite_project_select_box, customer_id);
  		}
  	});
  }
  
  var _applyCustomerFilterOnMiteProjectSelectBox = function(mite_project_select_box, customer_id) {
    if (customer_id == -1) {
      _showAllMiteProjects(mite_project_select_box);
      return;
    }
    var projects_assigned_to_customer = _customer_to_mite_project_bindings[customer_id];
    if (projects_assigned_to_customer.length == 0) {
      _emptyMiteProjectSelectBox(mite_project_select_box);
      return;
    }
    var options = "";
    for (var i = 0; i < projects_assigned_to_customer.length; i++) {
      for (var j = 0; j < _mite_projects.length; j++) {
        if (projects_assigned_to_customer[i] == _mite_projects[j][0]) {
          options += "<option value='" + _mite_projects[j][0] + "'>" + _mite_projects[j][1] + "</option>";
        }
      }
    }
    _populateMiteProjectSelectBox(mite_project_select_box, options);
  }
  
  var _showAllMiteProjects = function(mite_project_select_box) {
    _emptyMiteProjectSelectBox(mite_project_select_box);
    var options = "";
    for (var i = 0; i < _mite_projects.length; i++) {
      options += "<option value='" + _mite_projects[i][0] + "'>" + _mite_projects[i][1] + "</option>";
    }
    _populateMiteProjectSelectBox(mite_project_select_box, options);
    mite_project_select_box.update(options);
  }
  
  var _populateMiteProjectSelectBox = function(mite_project_select_box, options) {
    mite_project_select_box.update(options);
  }
  
  var _emptyMiteProjectSelectBox = function(mite_project_select_box) {
    mite_project_select_box.update("");
  }
  
  var _onChangeCustomerFilter = function(e) {
    var element = Event.element(e);
    var customer_id = parseInt(element.value);
    if (!customer_id) customer_id = -1;
    var $project_select = $(element).next("select");
    _applyCustomerFilterOnMiteProjectSelectBox($project_select, customer_id);
  }
  
  var _enableApiKeyField = function() {
    $_field_api_key.writeAttribute("readonly",false).removeClassName("readonly").clear().focus();
  }
  
  var _onClickCheckAccountDataButton = function() {
    $_button_check_account_data.writeAttribute('disabled','disabled').setStyle({cursor: 'wait'});
		if (_account_is_activated) {
			$_button_disconnect_account_data.writeAttribute('disabled','disabled').setStyle({cursor: 'wait'});
		}
		$_notifier_account_data.setStyle({display: 'block'});
		$_account_data_button_pressed.writeAttribute('value','check_account_data');
		this.form.submit();
  }
  
  var _onClickDisconnectAccountDataButton = function() {
    if (confirm($_msg_confirm_disconnecting_account.innerHTML)) {
			$_button_disconnect_account_data.writeAttribute('disabled','disabled').setStyle({cursor: 'wait'});
			$_button_check_account_data.writeAttribute('disabled','disabled').setStyle({cursor: 'wait'}); 
			$_notifier_account_data.setStyle({display: 'block', cursor: 'wait'});
			$_account_data_button_pressed.writeAttribute('value','disconnect_account_data');
			this.form.submit();
		}
		else {
			Event.stop(e);
			return false;
		}
  }
  
  var _onClickSaveBindingsButton = function(e) {
    $_button_save_bindings.writeAttribute('disabled','disabled');
		$_notifier_preferences.setStyle({display: 'block'});
		this.form.submit();
  }
  
  var _onClickOnProjectCheckbox = function(e) {
    var element = Event.element(e);
		var id_attr = element.readAttribute("id");
		var project_id = id_attr.substring(id_attr.lastIndexOf("_") + 1);

	// convenience vars for mite project and services
		var	$sb_miteProject = $(element).up().next("select");
		var	$sb_miteService = $(element).up().next("select").next("select");
		var	$field_noneSelected = $(element).up().next("input");

		if ($(element).checked == false) {
			$field_noneSelected.writeAttribute("value","-1");
		// unset names of the project and services select boxes
		// to avoid assignment when submitting the form	
			$sb_miteProject.writeAttribute("name","").writeAttribute("disabled","disabled");
			$sb_miteService.writeAttribute("name","").writeAttribute("disabled","disabled");
		// remove possible selections from select boxes to set a visual mark for the change
			$sb_miteProject.selectedIndex = 0;
			$sb_miteService.selectedIndex = -1;
		// mark the fieldset and its children as incative using a CSS class 	
			$(element).up("fieldset").writeAttribute("class","plugin_mite_inactive");
		}
		else {
			$("project_" + project_id).setStyle({display: "block"});
			$field_noneSelected.writeAttribute("value","0");
		// reset names of the project and services select boxes	
			$sb_miteProject.writeAttribute("name","bindings[" + project_id +"][]").removeAttribute("disabled");
			$sb_miteService.writeAttribute("name","bindings[" + project_id +"][]").removeAttribute("disabled");
			$(element).up("fieldset").writeAttribute("class","");
		}
  }
  
  // PUBLIC
  
  return {
    init : _init
  }
}();

document.observe("dom:loaded", function() {
	MITE_PREFERENCES_FORM.init();
});