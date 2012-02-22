require_dependency 'user'

module UserPatch
  
  def self.included(base)
      base.class_eval do
        unloadable
      
        has_many :mite_bindings, :dependent => :destroy
      
      # relationship to super class for all resource types  
        has_many :mite_rsrcs, :dependent => :destroy
      
      # define subclass releationships for each resource types for easier selection  
      # :dependent => :destroy is already defined for the super class relationship (mite_rsrc)
        has_many :mite_projects
        has_many :mite_services
      end
  end
  
end