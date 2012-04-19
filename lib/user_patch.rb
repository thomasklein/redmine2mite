require_dependency 'user'

module UserPatch
  
  def self.included(base)
    base.class_eval do
      unloadable
      has_many :mite_bindings, :dependent => :destroy
      has_many :mite_rsrcs, :dependent => :destroy
      has_many :mite_projects
      has_many :mite_services
      has_many :mite_customers
    end
  end
end