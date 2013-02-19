class TimeLogEntryLayoutHook < Redmine::Hook::ViewListener
  
  def view_timelog_edit_form_bottom(context = {})
    return unless User.current.preference["mite_connection_updated_on"]
    firstBinding = User.current.mite_bindings.find(:first,:conditions => [ "project_id = ?", context[:time_entry][:project_id]])
  
    return if !firstBinding || firstBinding[:mite_rsrc_id] < 0
    te = context[:time_entry]
    new_fields = MiteHelper::mite_rsrcs_assignment_container(te.project_id, true, te.mite_project_id, te.mite_service_id)
    new_fields
  end
end