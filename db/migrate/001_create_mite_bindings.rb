class CreateMiteBindings < ActiveRecord::Migration
  def self.up
    create_table :mite_bindings do |t|

      t.column :user_id, :integer

      t.column :mite_rsrc_id, :integer

      t.column :project_id, :integer
    end
  end

  def self.down
    drop_table :mite_bindings
  end
end
