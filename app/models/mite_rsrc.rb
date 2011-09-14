class MiteRsrc < ActiveRecord::Base
  
  belongs_to :user
  has_many :mite_bindings, :dependent => :destroy
  
  validates_presence_of :user_id, :mite_rsrc_id, :type, :mite_rsrc_name, :mite_rsrc_updated_at
  validates_uniqueness_of :mite_rsrc_id, :scope => [:user_id, :type]
  
end
