class SynchronizeMiteProject
  def initialize
  end
  
  def synchronize
    # DELETE images in Redmine of REMOVED mite records
    MiteProject.destroy_all(:conditions => {
      :mite_rsrc_id => local_record_ids_to_destroy
    }) if local_record_ids_to_destroy.any?
    
    # UPDATE or CREATE record in Redmine
    # prevent update if nothing changed within the mite record
    changed_remote_records.each do |remote_record|
      update_or_create_local_record(remote_record)
    end
  end
  
  private
  
  def remote_records
    @remote_records ||= Mite::Project.all
  end
    
  def changed_remote_records
    return remote_records unless mite_connection_updated_on = User.current.preference.mite_connection_updated_on
    @changed_remote_records ||= remote_records.map do |remote_record|
      remote_record.updated_at > mite_connection_updated_on
    end
  end
  
  def local_records
    @local_records ||= User.current.mite_projects
  end
  
  def local_record_ids_to_destroy
    @local_record_ids_to_destroy ||= local_records.map(&:mite_rsrc_id) - remote_records.map(&:id)
  end
  
  def update_or_create_local_record(remote_record)
    local_record = find_local_record(remote_record) || new_local_record
    
    return if !local_record || local_record.mite_rsrc_updated_at != remote_record.updated_at
    
    local_record.update_attributes({
      :mite_rsrc_name         => remote_record.name_with_customer,
      :mite_rsrc_updated_at   => remote_record.updated_at.localtime,
      :mite_rsrc_id           => remote_record.id
    })
  end
  
  def find_local_record(remote_record)
    local_records.find do |local_record| 
      local_record.mite_rsrc_id == remote_record.id
    end
  end
  
  def new_local_record
    User.current.mite_projects.new
  end
end
