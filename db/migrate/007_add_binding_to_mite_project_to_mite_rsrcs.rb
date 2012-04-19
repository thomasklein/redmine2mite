class AddBindingToMiteProjectToMiteRsrcs < ActiveRecord::Migration
  def self.up
    add_column :mite_rsrcs, :mite_customer_id, :integer
  end
  def self.down
    remove_column :mite_rsrcs, :mite_customer_id
  end
end