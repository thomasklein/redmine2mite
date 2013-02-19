class MiteController < ApplicationController
  unloadable
  REDMINE_2_MITE_VERSION = 'v2.1'
  require 'mite-rb'
  require 'mite_synchronizer'
  include MiteControllerHelper
  before_filter :require_login
  
  def index
    @user_preferences = User.current.preference
    @user_projects = user_projects_with_limited_fieldset
    @user_mite_customers = user_mite_customers_for_select_tag
    @user_mite_projects = user_mite_projects_for_select_tag
    @user_mite_services = user_mite_services_for_select_tag
    @bindings_per_project = user_bindings_per_project
    @mite_customer_to_project_bindings = user_mite_customer_to_project_bindings
    @last_updated = User.current.preference[:mite_connection_updated_on]
  end
  
  def process_account_form
    save_account_data if check_account_data_button_was_clicked
    delete_account_data if disconnect_account_data_button_was_clicked
    redirect_to :action => "index"
  end
  
  def save_account_data
    begin
      initial_synch = User.current.preference.mite_connection_updated_on.blank?
      validate_mite_account_data(params[:mite])
      synchronize_mite_and_redmine_account_data(initial_synch)
      msg = update_user_preferences(params[:mite])
      fill_flash_msg(msg,"notice")
    rescue MiteAccountDataEmptyError, StandardError => exception
      fill_flash_msg(l('msg_error_updating_account_data'),"error",exception)
    end
  end
  
  def delete_account_data
    begin
      nullify_user_preferences_fields
      nullify_time_entry_fields
      MiteRsrc.destroy_all(:user_id => User.current.id)
      fill_flash_msg(l("msg_success_disconnecting_account").html_safe,"notice")
    rescue StandardError => exception
      fill_flash_msg(l("msg_error_disconnecting_account").html_safe, "error", exception)
    end
  end
    
  def save_preferences
    User.current.preference.update_attributes(params[:user_preferences])
    begin
      update_bindings(params[:bindings])
      fill_flash_msg(l("msg_success_saving_bindings").html_safe,"notice")
    rescue StandardError => exception
      fill_flash_msg(l("msg_error_saving_bindings").html_safe,"error", exception)
    end
    redirect_to :action => "index"
  end

  # called by an Ajax-Request in tracker.js
  def start_tracker
    time_entry_data = request.parameters
    begin
      time_entry = TimeEntry.new(
          :project => Project.find(time_entry_data[:project_id].to_i),
          :issue => Issue.find(time_entry_data[:issue_id].to_i),
          :user => User.current,
          :spent_on => User.current.today)

      time_entry.safe_attributes = time_entry_data
      if time_entry.save
        render :json => time_entry
      else
        raise "Saving a new Time Entry was not possible."
      end
    rescue StandardError => exception
      p "Mite Time Tracker could not be started for an unforeseen reason."
      p exception
      render :text => "Error: " + exception.to_s
    end
  end

  # called by an Ajax-Request in tracker.js
  def stop_tracker
    tracker_data = request.parameters
    tracker_response = {:status => ""}
    begin
      validate_mite_account_data(User.current.preference)
      mtracker = Mite::Tracker.current
      if !mtracker # the mite tracker was not running
        tracker_response[:status] = "WasNotRunning"
      elsif mtracker.stop
        mite_tracker_stopped(tracker_data)
        tracker_response[:status] = "Stopped"
      else
        raise "Tracker was not stopped for an unforeseen reason."
      end
      render :json => tracker_response
    rescue StandardError => exception
      p "Tracker was not stopped for an unforeseen reason."
      p exception
      render :text => "Error: " + exception.to_s
    end
  end
  
end