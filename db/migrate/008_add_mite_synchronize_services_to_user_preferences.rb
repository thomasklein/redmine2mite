class AddMiteSynchronizeServicesToUserPreferences < ActiveRecord::Migration
  def self.up
    add_column :user_preferences, :mite_synchronize_services, :boolean, :default => false
  end

  def self.down
    remove_column :user_preferences, :mite_synchronize_services
  end
end