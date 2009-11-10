class AddMiteAccountDataToUserPreferences < ActiveRecord::Migration
  def self.up
    add_column :user_preferences, :mite_account_name, :string

    add_column :user_preferences, :mite_api_key, :string
    
    add_column :user_preferences, :mite_note_pattern, :string
    
    add_column :user_preferences, :mite_connection_updated_on, :datetime

  end

  def self.down
    remove_column :user_preferences, :mite_api_key

    remove_column :user_preferences, :mite_account_name
    
    remove_column :user_preferences, :mite_note_pattern
    
    remove_column :user_preferences, :mite_connection_updated_on

  end
end
