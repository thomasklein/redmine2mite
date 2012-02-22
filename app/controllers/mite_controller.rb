# TODO: find a cheap way to check for each time entry made in Redmine if it still exists in mite

class MiteController < ApplicationController
  unloadable

  require 'mite-rb'
  include MiteHelper
  
  before_filter :require_login
  
  REDMINE_2_MITE_VERSION = 'v1.5'
  
  def index
    
    @user_preferences = User.current.preference # im view direkt aufrufen
    @user_projects = User.current.projects.find(:all, :select => 'projects.id,name', :include => :mite_bindings, :order => "name")
    @user_mite_projects = User.current.mite_projects.find(:all,:select => 'id,mite_rsrc_name', :order => "mite_rsrc_name").collect {|mite_project| [mite_project.id, mite_project.mite_rsrc_name]}
    @user_mite_services = User.current.mite_services.find(:all,:select => 'id,mite_rsrc_name', :order => "mite_rsrc_name").collect {|mite_service| [mite_service.id, mite_service.mite_rsrc_name]}
    @bindings_per_project = {}
    
    @user_projects.each do |user_project|
      @bindings_per_project[user_project.id] = user_project.mite_bindings.collect {|binding| binding.mite_rsrc_id}
    end
    
    @last_updated = User.current.preference[:mite_connection_updated_on]
  end
  
#########
# Decides which action to perform by checking
# which submit button was used in the account form (in index.rhtml)
#########  
  def process_account_form
    
    if params[:check_account_data] || params[:mite_account_data_button_pressed] == 'check_account_data'
      save_account_data
    elsif params[:disconnect_account_data] || params[:mite_account_data_button_pressed] == 'disconnect_account_data'
      delete_account_data
    end
    
    redirect_to :action => "index"
  end

#########
# Gets called by an AJAX request in 'mite_tracker.js' and 
# - stops the remote mite tracker
# - nullifies the value for User.current.preference.mite_tracker_data
# Returns either true or an error text as response back to the calling script
#########
  def stop_tracker
    
    params = request.parameters
    
    begin
      
      Mite.account = User.current.preference["mite_account_name"]
      Mite.key = User.current.preference["mite_api_key"]
      Mite.user_agent = 'Redmine2mite/' + MiteController::REDMINE_2_MITE_VERSION
      mtracker = Mite::Tracker.current
      
      if mtracker.stop
        
        te = TimeEntry.find(params["te"])
        
        hours = Float(params["time"])
        
        # do not consider a time if it not 0
        if hours > 0
          
          te[:hours] = hours / 60
          te.save
        end
        
        User.current.preference.mite_tracker_data = {:active => false}
        User.current.preference.save
        render :text => "Success"
      else
        raise "Tracker was stopped for an unforseen reason."
      end
      
    rescue StandardError => exception
      render :text => "Error: " + exception
    end
  end # stop_tracker

  
#########
# Saves account data and performs synchronzation
#########
  def save_account_data
    
    msg_type = ''
    exception = ''
    
    if params[:mite]['mite_account_name'].empty? || params[:mite]['mite_api_key'].empty?
      msg_type = "error"
      msg = l("msg_missing_account_data")
      
    else
      Mite.account = params[:mite]['mite_account_name']
      Mite.key = params[:mite]['mite_api_key']
      Mite.user_agent = 'Redmine2mite/' + MiteController::REDMINE_2_MITE_VERSION
      
      begin
      # try to validate the connection
      # could raise ActiveResource::UnauthorizedAccess or ActiveResource::ResourceNotFound
        Mite.validate!
        
        cUserPref = User.current.preference
        
      ################  
      # SYNCH IMAGES OF MITE PROJECTS  
      ############### 
      
      # get projects in mite account  
        projectsM = Mite::Project.all
        
      # get images of mite projects in Redmine  
        projectsR = User.current.mite_projects
        
      # DELETE images in Redmine of REMOVED mite projects
      #####################
        projectsR.each do |projectR|
          projectR.destroy if projectsM.find_all{|projectM| projectM.id == projectR.mite_rsrc_id}.empty?
        end
        
      # refine selection by only using those, which were changed since the last synchronization
        projectsM = projectsM.select{|projectM| !cUserPref.mite_connection_updated_on || (projectM.updated_at > cUserPref.mite_connection_updated_on)}
        
      # ITERATE through all projects in the users mite.account  
        projectsM.each do |projectM|
          
        # Check for existence of mite project in Redmine
          if existingProjectR = projectsR.find(:first, :conditions => [ "user_id = ? AND mite_rsrc_id = ?", User.current.id, projectM.id])
            
          # UPDATE project in Redmine
          #####################
            rsrc_name = projectM.name
            rsrc_name += " (" + projectM.customer_name + ")" if projectM.respond_to?("customer_name")
            
            existingProjectR.update_attributes(:mite_rsrc_name => rsrc_name,
                                               :mite_rsrc_updated_at => projectM.updated_at.localtime)
            
        # CREATE image of the mite project in Redmine
        #####################
          else
            newProjectR = MiteProject.new do |p|
              p.mite_rsrc_name = projectM.name
              p.mite_rsrc_name += " (" + projectM.customer_name + ")" if projectM.respond_to?("customer_name")
              p.mite_rsrc_id = projectM.id
              p.mite_rsrc_updated_at = projectM.updated_at
              p.user_id = User.current.id
            end
            newProjectR.save
          end
                     
        end
      
    ################  
    # SYNCH IMAGES OF MITE SERVICES  
    ###############
      
      # get projects in mite account  
        servicesM = Mite::Service.all
        
      # get images of mite projects in Redmine  
        servicesR = User.current.mite_services
        
      # DELETE images in Redmine of REMOVED mite services
      #####################
        servicesR.each do |serviceR|
          serviceR.destroy if servicesM.find_all{|serviceM| serviceM.id == serviceR.mite_rsrc_id}.empty?
        end
      
      # refine selection by only using those, which were changed since the last synchronization
        servicesM = servicesM.select{|serviceM| !cUserPref.mite_connection_updated_on || (serviceM.updated_at > cUserPref.mite_connection_updated_on)}
      
      # ITERATE through all services of the users mite.account
        servicesM.each do |serviceM|
          
        # Check for existence of mite service in Redmine
          if existingServiceR = servicesR.find(:first, :conditions => [ "user_id = ? AND mite_rsrc_id = ?", User.current.id, serviceM.id])
            
        # UPDATE service in Redmine if the mite service was changed
        #####################
            if existingServiceR.mite_rsrc_updated_at != serviceM.updated_at
              existingServiceR.update_attributes(:mite_rsrc_name => serviceM.name,
                                                :mite_rsrc_updated_at => serviceM.updated_at.localtime)
            end
          
        # CREATE image of the mite service in Redmine
        #####################
          else
            newServiceR = MiteService.new do |s|
              s.mite_rsrc_name = serviceM.name
              s.mite_rsrc_id = serviceM.id
              s.mite_rsrc_updated_at = serviceM.updated_at
              s.user_id = User.current.id
            end
              
            newServiceR.save
          end
        end
        
        msg_type = "notice"
        if User.current.preference[:mite_connection_updated_on]
          msg = l("msg_success_updating_account_data")
        else
          msg = l("msg_success_verification")
        end
        
      ################  
      # SYNCH TIME ENTRIES
      ###############
      # get time entries which are connected to mite time entries
        time_entriesR = TimeEntry.connected_to_mite.find(:all, :conditions => {:user_id => User.current.id})
        
        time_entriesM = []
        
        begin
        # try to get those connected time entries from mite, if any
          time_entriesM = Mite::TimeEntry.find( :all, :params => {:ids => time_entriesR.collect{|teR|teR.mite_time_entry_id}.join(",")}) if time_entriesR.any?
          
      # take care if time entries in mite do not exist anymore  
        rescue ActiveResource::ResourceNotFound
          # no problem with that...
        end
        
      # in case time entries were deleted in mite
      # FIND AND DELETE their images in Redmine
      #####################
        if time_entriesM.size < time_entriesR.size
          
          time_entriesR.select{|teR| !time_entriesM.find{|teM|teM.id == teR.mite_time_entry_id}}.each {|teR_to_delete| teR_to_delete.destroy}
        end
        
      # check for updated time entries, if any
        if time_entriesM.any?
          
        # refine selection by only using those, which were changed since the last synchronization
          time_entriesM = time_entriesM.select do |timeEntryM| 
            !cUserPref.mite_connection_updated_on || 
            (timeEntryM.updated_at.to_datetime > cUserPref.mite_connection_updated_on.to_datetime)
          end

        # UPDATE TIME ENTRY IMAGES
        #####################
          time_entriesM.each do |teM|
          
            time_entriesR.select{|teR| (teR.mite_time_entry_id == teM.id)}.each do |teR_to_update|
            
              teR_to_update.update_attributes(:mite_project_id => teM.project_id,
                                              :mite_service_id => teM.service_id,
                                              :hours => (teM.minutes.to_f / 60).to_f,
                                              :comments => teM.note,
                                              :mite_time_entry_updated_on => teM.updated_at.localtime)
              end
          end
        end
        
        # on this point no error was raised => save account data
          cUserPref.update_attributes(params[:mite])
          cUserPref.update_attribute(:mite_connection_updated_on,Time.now)
        
      rescue StandardError => exception
        msg_type = "error"
        p "*************"
        p "EXCEPTION in MiteController#save_preferences: #{exception}"
        #p "Backtrace: #{exception.backtrace}"
        p "*************"
      end
    end
    
  # method defined in MiteHelper  
    fill_flash_msg(msg,msg_type,exception)
  end
  
  #########
  # Deletes all data related to mite of the current user
  #########  
    def delete_account_data

      msg_type = "notice"
      msg = l("msg_success_disconnecting_account")

      begin

      # nullify the user's saved mite account data fields in the user preferences
        User.current.preference.update_attributes(:mite_account_name => nil,:mite_api_key => nil, :mite_note_pattern => nil, :mite_connection_updated_on => nil)

      # nullify all fields of a time entry connected to a mite time entry
        TimeEntry.find(:all, :conditions => [ "user_id = ? AND mite_time_entry_id IS NOT NULL", User.current.id]).each do |timeEntry|
          timeEntry.update_attributes(:mite_time_entry_id         => nil,
                                      :mite_project_id            => nil,
                                      :mite_service_id            => nil,
                                      :mite_time_entry_updated_on => nil)
        end

      # delete all mite resources and connected bindings to projects in Redmine
        MiteRsrc.destroy_all(:user_id => User.current.id)

      rescue StandardError => exception
          msg_type = "error"
          msg = l("msg_error_disconnecting_account")
          msg += "<br /><small>#{exception}</small>"
          p "EXCEPTION in MiteController#delete_mite_account_data: #{exception}"
      end

      flash[msg_type] = msg
    end
    
    
#########
# Save user preferences
#########  
    def save_preferences
      
    # update note pattern for time entries  
      User.current.preference.update_attributes(params[:user_preferences])
      msg_type = "notice"
      msg = l("msg_success_saving_bindings")
      
      begin
    # process new and deleted bindings  
        if bindings = params[:bindings]
        
          bindings.each do |project_id,mite_rsrc_ids| 
            
          # delete old hash value, since it works with escaped strings   
            bindings.delete(project_id)
          
          # convert all id values to type Fixnum since they are sendt as strings
            mite_rsrc_ids = mite_rsrc_ids.collect{|rsrc_id| rsrc_id.to_i}
            project_id = project_id.to_i
          
          # reassing converted values to hash
            bindings[project_id] = mite_rsrc_ids
          
          #####################
          # DELETE OLD BINDINGS
          
          # get all deselected bindings...
            deselectedBindings = User.current.mite_bindings.select do |binding|
              (binding.project_id == project_id) && !mite_rsrc_ids.include?(binding.mite_rsrc_id)
            end
          
          # ...and delete them
            deselectedBindings.each {|oldBinding| oldBinding.destroy}
          
          #####################
          # CREATE NEW BINDINGS
            mite_rsrc_ids.each do |mite_rsrc_id|
            
              MiteBinding.create(:project_id => project_id, :user_id => User.current.id, :mite_rsrc_id => mite_rsrc_id) unless MiteBinding.find(:first,:conditions => {:user_id => User.current.id, :mite_rsrc_id => mite_rsrc_id, :project_id => project_id})
            end  
          end
        end
        
      # DELETE BINDINGS FROM DESELCTED PROJECTS
        if User.current.mite_bindings.size > 0
          User.current.mite_bindings.each do |binding|
            binding.destroy if not bindings or not bindings.has_key?(binding.project_id)
          end
        end
      
      rescue StandardError => exception
        msg_type = "error"
        msg = l("msg_error_saving_bindings")
        msg += "<br /><small>#{exception}</small>"
        p "EXCEPTION in MiteController#delete_mite_account_data: #{exception}"
      end
      
      flash[msg_type] = msg
      redirect_to :action => "index"
    end
end
