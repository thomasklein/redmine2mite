document.observe("dom:loaded", function() {

	// get the second fieldset with the class 'tabular'
	// which contains the fields to append an time entry to the change
	var o_fsBookEffort = $$('fieldset.tabular')[1];
	
	// if it is does not exist, the user is most probably
	// not allowed to create a time entry
	if (o_fsBookEffort != null) {
	
	// if it does exist, append the mite fields created in
	// IssueDetailsLayoutHook.view_issues_form_details_bottom
	// to the fieldset 
		
		$(o_fsBookEffort).insert($('mite_resources_wrapper'), content);
		$('mite_resources_wrapper').setStyle({display: 'block'});
	}
});