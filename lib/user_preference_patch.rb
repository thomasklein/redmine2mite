require_dependency 'user_preference'

module UserPreferencePatch
  
  def self.included(base)
    base.class_eval do
      unloadable
      serialize :mite_tracker_data, Hash
    end
  end
end