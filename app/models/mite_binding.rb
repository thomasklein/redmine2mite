class MiteBinding < ActiveRecord::Base
  belongs_to :project
  belongs_to :user
  belongs_to :mite_rsrc
  
  validates_presence_of :user_id, :mite_rsrc_id, :project_id
  
end
