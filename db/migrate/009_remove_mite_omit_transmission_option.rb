class RemoveMiteOmitTransmissionOption < ActiveRecord::Migration
  def self.up
    remove_column :user_preferences, :mite_omit_transmission_option
  end

  def self.down
    add_column :user_preferences, :mite_omit_transmission_option, :boolean, :default => false
  end
end