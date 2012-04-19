require_dependency 'project'

module ProjectPatch
  
  def self.included(base)
      base.class_eval do
        unloadable
        has_many :mite_bindings, :dependent => :destroy
      end
  end
end