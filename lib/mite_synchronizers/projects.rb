class MiteSynchronizer::Projects < MiteSynchronizer::Base
  
  protected
  
  def destroy_old_local_records
    MiteProject.destroy_all(:mite_rsrc_id => local_record_ids_to_destroy)
  end
  
  def update_local_record(local_record, remote_record)
    attributes = {
      :mite_rsrc_id           => remote_record.id,
      :mite_rsrc_name         => remote_record.name,
      :mite_rsrc_updated_at   => remote_record.updated_at.localtime
    }
    if (remote_record.customer_id)
      bound_customer = User.current.mite_customers.detect do |local_customer_record|
        local_customer_record.mite_rsrc_id == remote_record.customer_id
      end
      attributes[:mite_customer_id] = bound_customer.id if bound_customer
    end
    local_record.update_attributes(attributes)
  end
  
  def remote_records
    @remote_records ||= Mite::Project.all
  end
    
  def local_records
    @local_records ||= User.current.mite_projects
  end
  
  def new_local_record
    User.current.mite_projects.new
  end
  
end