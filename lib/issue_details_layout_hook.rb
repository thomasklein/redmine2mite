class IssueDetailsLayoutHook < Redmine::Hook::ViewListener
  
  def view_issues_form_details_bottom(context = {})
      return unless MiteHelper::user_is_logged_in_and_mite_plugin_is_setup?
      
      issue = context[:issue]
      return unless issue.id
      
      new_fields = MiteHelper::mite_rsrcs_assignment_container(issue.project_id, false)
      new_fields += "<input type='hidden' id='plugin_mite_message_running_tracker' value='" + l("msg_running_tracker_on_this_issue") + "' />"
      new_fields
  end
end