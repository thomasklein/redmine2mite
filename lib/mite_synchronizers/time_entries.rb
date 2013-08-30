class MiteSynchronizer::TimeEntries < MiteSynchronizer::Base
  
  def synchronize(is_initial_sync)
    if (!is_initial_sync)
      destroy_old_local_records if local_record_ids_to_destroy.any?
      changed_remote_records.each do |remote_record|
        update_local_record(remote_record)
      end
    end
  end
  
  protected
  
  def destroy_old_local_records
    TimeEntry.connected_to_mite.destroy_all(:mite_time_entry_id => local_record_ids_to_destroy)
  end
  
  def update_local_record(remote_record)
    local_record = find_local_record(remote_record)
    local_record.update_attributes({
      :mite_project_id => remote_record.project_id,
      :mite_service_id => remote_record.service_id,
      :mite_time_entry_updated_on => Time.parse(remote_record.updated_at).localtime,
      :hours => (remote_record.minutes.to_f / 60).to_f,
      :comments => remote_record.note
    })
  end

  def find_local_record(remote_record)
    local_records.detect do |local_record| 
      local_record.mite_time_entry_id == remote_record.id
    end
  end
  
  def local_record_ids_to_destroy
    @local_record_ids_to_destroy ||= local_records.map(&:mite_time_entry_id) - remote_records.map(&:id)
  end
  
  def remote_records
    return @remote_records if @remote_records
    @remote_records = []
    local_records.map(&:mite_time_entry_id).each_slice(500) do |i|
      @remote_records += Mite::TimeEntry.find(:all, :params => {:ids => i.join(",")})
    end
    @remote_records
  end
    
  def local_records
    @local_records ||= TimeEntry.connected_to_mite.find(:all, :conditions => {:user_id => User.current.id})
  end
end
