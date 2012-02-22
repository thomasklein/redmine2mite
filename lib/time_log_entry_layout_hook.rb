class TimeLogEntryLayoutHook < Redmine::Hook::ViewListener
  
  def view_timelog_edit_form_bottom(context = {})
      
    # do nothing if a connection to a mite account was yet not established  
      return unless User.current.preference["mite_connection_updated_on"]
    
    # get the first mite binding for this project
      firstBinding = User.current.mite_bindings.find(:first,:conditions => [ "project_id = ?", context[:time_entry][:project_id]])
      
    # return if there's no binding or 
    # the mite ressource is 0 (no resource bound) or -1 (project binding inactive)
      return if !firstBinding || firstBinding[:mite_rsrc_id] < 0
      
      te = context[:time_entry]
      
      new_fields = MiteHelper::mite_rsrcs_assignment_container(te.project_id)
      
      new_fields
  end
end