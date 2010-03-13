class TimeLogEntryLayoutHook < Redmine::Hook::ViewListener
  
  def view_timelog_edit_form_bottom(context = {})
      
    # do nothing if a connection to a mite account was yet not established  
      return unless User.current.preference["mite_connection_updated_on"]
      
      te = context[:time_entry]
      
      onclickAction = '
        if ($("mite_resources").getStyle("display")=="block") {
          $("mite_resources").setStyle({display:"none"});
          $("time_entry_mite_project_id").setAttribute("name","");
          $("time_entry_mite_service_id").setAttribute("name","");
        }
        else {
          $("mite_resources").setStyle({display:"block"});
          $("time_entry_mite_project_id").setAttribute("name","time_entry[mite_project_id]");
          $("time_entry_mite_service_id").setAttribute("name","time_entry[mite_service_id]");
        }';
      
      new_fields = 
        "<br /><p><label for='time_entry_option_send_te_to_mite'>#{l(:label_option_send_te_to_mite)}</label>" +
        "<input type='checkbox' id='option_send_te_to_mite' value='1' checked='checked' onclick='#{onclickAction}' /></p>"
        
      new_fields += "<div id='mite_resources'>"

      # select box for mite.projects  
      new_fields += "<p><label for='time_entry_mite_project_id'>#{l(:label_mite_project)}</label>" + MiteHelper::select_binded_mite_rsrcs(:time_entry, :mite_project_id, MiteProject, te.project_id, :include_blank => l(:none1_option_select_box), :has_at_most_one_binding => true) + "</p>"  

      # select box for mite.services  
      new_fields += "<p><label for='time_entry_mite_service_id'>#{l(:label_mite_service)}</label>" +  MiteHelper::select_binded_mite_rsrcs(:time_entry, :mite_service_id, MiteService, te.project_id, :include_blank => l(:none2_option_select_box), :optgroup_separator => l(:label_option_group_other_services)) + "</p>"

      new_fields += "</div><!-- mite_resources -->"
      
      new_fields
  end

end
