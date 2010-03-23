class AddMiteOmitTransmissionOptionToUserPreferences < ActiveRecord::Migration
  def self.up
    add_column :user_preferences, :mite_omit_transmission_option, :boolean, :default => 0
  end

  def self.down
    remove_column :user_preferences, :mite_omit_transmission_option
  end
end