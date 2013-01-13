class AddMiteTrackerFieldsToUserPreferences < ActiveRecord::Migration
  def self.up
    add_column :user_preferences, :mite_tracker_option, :boolean, :default => false
    add_column :user_preferences, :mite_tracker_data, :text
  end

  def self.down
    remove_column :user_preferences, :mite_tracker_option
    remove_column :user_preferences, :mite_tracker_data
  end
end