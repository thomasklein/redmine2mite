class AddMiteDataToTimeEntries < ActiveRecord::Migration
  def self.up
    add_column :time_entries, :mite_time_entry_id, :integer

    add_column :time_entries, :mite_project_id, :integer
    
    add_column :time_entries, :mite_service_id, :integer

    add_column :time_entries, :mite_time_entry_updated_on, :datetime

  end

  def self.down
    remove_column :time_entries, :mite_time_entry_updated_on

    remove_column :time_entries, :mite_project_id
    
    remove_column :time_entries, :mite_service_id

    remove_column :time_entries, :mite_time_entry_id

  end
end
