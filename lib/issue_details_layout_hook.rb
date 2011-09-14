class IssueDetailsLayoutHook < Redmine::Hook::ViewListener
  
  #******************************
  # Desc missing...
  #
  def view_issues_form_details_bottom(context = {})
      
      issue = context[:issue]
      new_fields = MiteHelper::mite_rsrcs_assignment_container(issue.project_id, false)
      new_fields += javascript_include_tag('mite_edit_issue', :plugin => 'redmine2mite', :cache => false)
      new_fields
  end
end    