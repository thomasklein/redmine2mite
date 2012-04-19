class MiteSynchronizer::Services < MiteSynchronizer::Base
  
  protected
  
  def destroy_old_local_records
    MiteService.destroy_all(:mite_rsrc_id => local_record_ids_to_destroy)
  end
  
  def remote_records
    @remote_records ||= Mite::Service.all
  end
    
  def local_records
    @local_records ||= User.current.mite_services
  end
  
  def new_local_record
    User.current.mite_services.new
  end
end