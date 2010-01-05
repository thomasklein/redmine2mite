require 'redmine'
require 'dispatcher'
require 'time_entry_patch'
require 'project_patch'
require 'user_patch'

# hooks
require_dependency 'time_log_entry_layout_hook.rb'

# extend the Redmine core
Dispatcher.to_prepare do
  TimeEntry.send(:include, TimeEntryPatch)
  Project.send(:include, ProjectPatch)
  User.send(:include, UserPatch)
end

Redmine::Plugin.register :redmine2mite do
  name 'Redmine2mite'
  author 'Yolk – Sebastian Munz & Julia Soergel GbR / Thomas Klein'
  description 'Redmine2mite connects your Redmine account with your mite.account. Track your time easily on issues within Redmine and get them automatically send to mite.'
  version '0.1'
  
  requires_redmine :version_or_higher => '0.8.0'
  menu :account_menu, :mite, { :controller => 'mite', :action => 'index' }, :caption => 'mite', :before => :logout, :if => Proc.new{User.current.logged?}
end
