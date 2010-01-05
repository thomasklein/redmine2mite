class TimeLogEntryLayoutHook < Redmine::Hook::ViewListener
  
  def view_timelog_edit_form_bottom(context = {})
      
    # do nothing if a connection to a mite account was yet not established  
      return unless User.current.preference["mite_connection_updated_on"]
      
      te = context[:time_entry]
      
    # select box for mite.projects  
      new_fields = "<p><label for='time_entry_mite_project_id'>#{l(:label_mite_project)}</label>"
      new_fields += MiteHelper::select_binded_mite_rsrcs(:time_entry, :mite_project_id, MiteProject, te.project_id, :include_blank => l(:none1_option_select_box), :has_at_most_one_binding => true) + "</p>"  
      
    # select box for mite.services  
      new_fields += "<p><label for='time_entry_mite_service_id'>#{l(:label_mite_service)}</label>"
      new_fields += MiteHelper::select_binded_mite_rsrcs(:time_entry, :mite_service_id, MiteService, te.project_id, :include_blank => l(:none2_option_select_box), :optgroup_separator => l(:label_option_group_other_services)) + "</p>"
      
      new_fields
  end

end
