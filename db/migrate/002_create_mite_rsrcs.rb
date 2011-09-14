class CreateMiteRsrcs < ActiveRecord::Migration
  def self.up
    create_table :mite_rsrcs do |t|

      t.column :user_id, :integer

      t.column :mite_rsrc_id, :integer

      t.column :type, :string

      t.column :mite_rsrc_name, :string

      t.column :mite_rsrc_updated_at, :datetime

    end
  end

  def self.down
    drop_table :mite_rsrcs
  end
end
