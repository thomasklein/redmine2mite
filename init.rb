require 'redmine'
require 'time_entry_patch'
require 'project_patch'
require 'user_patch'
require 'user_preference_patch'
require 'application_controller_patch'

# hooks
require_dependency 'time_log_entry_layout_hook.rb'
require_dependency 'issue_details_layout_hook.rb'
require_dependency 'base_content_layout_hook.rb'


ActionDispatch::Callbacks.to_prepare do
  TimeEntry.send(:include, TimeEntryPatch)
  Project.send(:include, ProjectPatch)
  User.send(:include, UserPatch)
  UserPreference.send(:include, UserPreferencePatch)
  ApplicationController.send(:include, ApplicationControllerPatch)
end

Redmine::Plugin.register :redmine2mite do
  name        'Redmine2mite'
  author      'Yolk - Sebastian Munz & Julia Soergel GbR / Thomas Klein'
  description '''
    Redmine2mite connects your Redmine account with your mite.account. 
    Track your time easily on issues within Redmine and get them automatically send to mite.
    '''
  url         'https://github.com/thomasklein/redmine2mite'
  version     '2.0.1'
  
  requires_redmine :version_or_higher => '2.0'
  menu  :account_menu, :mite, { :controller => 'mite', :action => 'index' }, 
        :caption => 'mite', :id => 'mite_config', :before => :logout,
        :if => Proc.new{User.current.logged?}, 
        :html => {:id => "plugin_mite_prefs", :style => "color:#FF8215 !important;font-style: italic;"}
end
