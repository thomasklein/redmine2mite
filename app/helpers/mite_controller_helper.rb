module MiteControllerHelper
  
  class MiteAccountDataEmptyError < StandardError
  end
  
  private
  
  def validate_mite_account_data(data)
    raise MiteAccountDataEmptyError if account_data_empty?(data)
    Mite.account = data['mite_account_name']
    Mite.key = data['mite_api_key']
    Mite.user_agent = 'Redmine2mite/' + MiteController::REDMINE_2_MITE_VERSION
    Mite.validate!
  end
  
  def account_data_empty?(data)
    data['mite_account_name'].empty? || data['mite_api_key'].empty?
  end

  def synchronize_mite_and_redmine_account_data(is_initial_sync)
    MiteSynchronizer::Customers.new.synchronize(is_initial_sync)
    MiteSynchronizer::Projects.new.synchronize(is_initial_sync)
    MiteSynchronizer::Services.new.synchronize(is_initial_sync)
    MiteSynchronizer::TimeEntries.new.synchronize(is_initial_sync)
  end
  
  def user_projects_with_limited_fieldset
    @user_projects_with_limited_fieldset ||= User.current.projects.find(:all, :select => 'projects.id,name', :include => :mite_bindings, :order => "name")
  end
  
  def user_mite_customers_for_select_tag
    @user_mite_customers_for_select_tag ||= User.current.mite_customers.find(:all, :select => 'id,mite_rsrc_name', :order => "mite_rsrc_name").collect {|c| [c.id, c.mite_rsrc_name]} 
  end
  
  def user_mite_projects_for_select_tag
    @user_mite_projects_for_select_tag ||= User.current.mite_projects.find(:all,:select => 'id,mite_rsrc_name', :order => "mite_rsrc_name").collect {|p| [p.id, p.mite_rsrc_name]} 
  end
  
  def user_mite_services_for_select_tag
    @user_mite_services_for_select_tag ||= User.current.mite_services.find(:all,:select => 'id,mite_rsrc_name', :order => "mite_rsrc_name").collect {|s| [s.id, s.mite_rsrc_name]}
  end
  
  def user_mite_customer_to_project_bindings
    @user_mite_customer_to_project_bindings ||= collect_mite_project_bindings_by_customer
  end
  
  def collect_mite_project_bindings_by_customer
    collection = {}
    User.current.mite_customers.each do |c|
      collection[c.id] = c.mite_projects.map(&:id)
    end
    collection
  end
  
  def user_bindings_per_project
    @bindings_per_project = {}
    user_projects_with_limited_fieldset.each do |user_project|
      @bindings_per_project[user_project.id] = user_project.mite_bindings.map(&:mite_rsrc_id)
    end
    @bindings_per_project
  end
    
  def check_account_data_button_was_clicked
    params[:check_account_data] || params[:mite_account_data_button_pressed] == 'check_account_data'
  end
  
  def disconnect_account_data_button_was_clicked
    params[:disconnect_account_data] || params[:mite_account_data_button_pressed] == 'disconnect_account_data'
  end
  
  def delete_mite_time_entry(mte)
    mte.destroy
  end

  def update_time_entry_with_tracker_data(te, tracker_data)
    hours = Float(tracker_data["time"])
    te[:hours] = hours / 60
    te[:comments] = tracker_data["comments"]
    te[:activity_id] = tracker_data["activity_id"].to_i
    if tracker_data["mite_time_entry_was_disconnected"] == "true"
      # setting :mite_time_entry_updated_on to -1 is used in the 
      # before_update hook in time_entry_patch.rb
      # to delete the mite_time_entry which was attached to the time entry 
      te[:mite_time_entry_updated_on] = -1
    else
      te[:mite_project_id] = tracker_data["mite_project_id"].to_i
      te[:mite_service_id] = tracker_data["mite_service_id"].to_i
    end
    te.save
    User.current.preference.mite_tracker_data = {:active => false}
    User.current.preference.save
  end
  
  def mite_tracker_stopped(tracker_data)
    te = TimeEntry.find(tracker_data["te_id"].to_i)
    mte = Mite::TimeEntry.find(tracker_data["mite_te_id"].to_i)
    update_time_entry_with_tracker_data(te, tracker_data)
  end
  
  def nullify_user_preferences_fields
    User.current.preference.update_attributes(:mite_account_name => nil,
                                              :mite_api_key => nil,
                                              :mite_note_pattern => nil,
                                              :mite_synchronize_services => nil,
                                              :mite_connection_updated_on => nil)
  end
  
  def nullify_time_entry_fields
    TimeEntry.find(:all, :conditions => [ "user_id = ? AND mite_time_entry_id IS NOT NULL", User.current.id]).each do |timeEntry|
      timeEntry.update_attributes(:mite_time_entry_id         => nil,
                                  :mite_project_id            => nil,
                                  :mite_service_id            => nil,
                                  :mite_time_entry_updated_on => nil)
    end
  end
  
  def fill_flash_msg(predefined_msg, msg_type, exception = "")
    msg = predefined_msg
    details = ""
    if msg_type == "error"
      if exception.class == ActiveResource::UnauthorizedAccess
        msg = l("msg_invalid_api_key")
        details = exception.to_s
      elsif exception.class == ActiveResource::ResourceNotFound
        msg = l("msg_invalid_account_name")
        details = exception.to_s
      elsif exception.class == ActiveRecord::RecordInvalid
        msg = "Could not create new resource because entry already exists!"
        details = exception.to_s
      elsif exception.class == MiteAccountDataEmptyError
        msg = l("msg_missing_account_data")
      end
      p "*************"
      p "EXCEPTION in MiteController#save_preferences: #{exception}"
      p "#{msg}"
      p "Backtrace: #{exception.backtrace}"
      p "*************"
    end  

    unless details.empty? 
      msg += "<br /><small>#{details}</small>"
    end
    flash[msg_type] = msg.html_safe
  end
  
  def update_user_preferences(params)
    up = User.current.preference  
    up.update_attributes(params)
    up.update_attribute(:mite_connection_updated_on,Time.now)
    if up[:mite_connection_updated_on]
      return l("msg_success_updating_account_data")
    end
    l("msg_success_verification").html_safe
  end
  
  def update_bindings(bindings_raw)
    bindings = normalize_bindings(bindings_raw)
    delete_deselected_projects_bindings(bindings)
    bindings.each do |project_id,mite_rsrc_ids| 
      create_new_bindings_by_project(project_id, mite_rsrc_ids)
      delete_old_bindings_by_project(project_id, mite_rsrc_ids)
    end
  end
  
  def normalize_bindings(bindings_raw)
    bindings = {}
    bindings_raw.each do |project_id,mite_rsrc_ids| 
      bindings[project_id.to_i] = mite_rsrc_ids.collect{|rsrc_id| rsrc_id.to_i}
    end
    bindings
  end
  
  def delete_deselected_projects_bindings(bindings)
    if bindings.blank?
      User.current.mite_bindings.destroy_all
    else
      User.current.mite_bindings.each do |binding|
        binding.destroy if not bindings.has_key?(binding.project_id)
      end
    end
  end
  
  def create_new_bindings_by_project(project_id, mite_rsrc_ids)
    mite_rsrc_ids.each do |mite_rsrc_id|
      MiteBinding.create(
        :project_id => project_id,
        :user_id => User.current.id,
        :mite_rsrc_id => mite_rsrc_id) unless MiteBinding.find(:first,:conditions => {:user_id => User.current.id, :mite_rsrc_id => mite_rsrc_id, :project_id => project_id})
    end
  end
  
  def delete_old_bindings_by_project(project_id, mite_rsrc_ids)
    oldBindings = User.current.mite_bindings.select do |binding|
      (binding.project_id == project_id) && !mite_rsrc_ids.include?(binding.mite_rsrc_id)
    end
    oldBindings.each {|oldBinding| oldBinding.destroy}
  end
  
end