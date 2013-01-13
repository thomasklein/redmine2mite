class MiteSynchronizer::Customers < MiteSynchronizer::Base
  
  def synchronize(is_initial_sync)
    super(is_initial_sync)
  end
  
  protected
  
  def destroy_old_local_records
    MiteCustomer.destroy_all(:mite_rsrc_id => local_record_ids_to_destroy)
  end
  
  def remote_records
    @remote_records ||= Mite::Customer.all
  end
    
  def local_records
    @local_records ||= User.current.mite_customers
  end
  
  def new_local_record
    User.current.mite_customers.new
  end
end