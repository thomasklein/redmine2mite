document.observe("dom:loaded", function() {
	
// uncovers the input field for the mite api key
	$('plugin_mite_link_change_value').observe('click', function() {
		
		$('mite_mite_api_key').writeAttribute("readonly",false).removeClassName("readonly").clear().focus();
	});
	
	$('check_account_data').observe('click', function() {
		
		$(this).writeAttribute('disabled','disabled').setStyle({cursor: 'wait'});
		if ($('disconnect_account_data')) {
			$('disconnect_account_data').writeAttribute('disabled','disabled').setStyle({cursor: 'wait'});
		}
		$('mite_plugin_notifier_account_data').setStyle({display: 'block'});
		$('mite_account_data_button_pressed').writeAttribute('value','check_account_data');
		this.form.submit();// for safari, otherwise the click action will not submit the form
	});
	
	$('disconnect_account_data').observe('click', function(e) {
		
		if (confirm($('msg_confirm_disconnecting_account').innerHTML)) {
			$(this).writeAttribute('disabled','disabled').setStyle({cursor: 'wait'});
			$('check_account_data').writeAttribute('disabled','disabled').setStyle({cursor: 'wait'}); 
			$('mite_plugin_notifier_account_data').setStyle({display: 'block', cursor: 'wait'});
			$('mite_account_data_button_pressed').writeAttribute('value','disconnect_account_data');
			this.form.submit();// for safari, otherwise the click action will not submit the form
		}
		else {
			Event.stop(e);
			return false;
		}
	});
	
	$('save_bindings').observe('click', function() {
		$(this).writeAttribute('disabled','disabled');
		$('mite_plugin_notifier_preferences').setStyle({display: 'block'});
		this.form.submit();// for safari, otherwise the click action will not submit the form"
	});
	
// hide/unhide and deactivate/activate binding masks for individual projects
// if the user clicks on a checkbox
	$$('.project_connection').each(function(checkbox){
		
		checkbox.observe('click', function(event) {
			
			var element = Event.element(event);
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
		});
	});
});