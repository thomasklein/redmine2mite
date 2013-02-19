require_dependency 'application_controller'

module ApplicationControllerPatch
  
  def self.included(base)
    base.class_eval do
      unloadable

      before_filter :plugin_mite_check_tracker_status, :only => [:show, :index, :edit], :if => :mite_conditions_apply?
      
      def mite_conditions_apply?
        User.current && 
        User.current.preference &&
        User.current.preference.mite_connection_updated_on && 
        User.current.preference.mite_tracker_option &&
        User.current.preference.mite_tracker_data &&
        User.current.preference.mite_tracker_data.include?(:active) && 
        User.current.preference.mite_tracker_data[:active]
      end
      
      def plugin_mite_check_tracker_status
        user_pref = User.current.preference
        Mite.account = user_pref["mite_account_name"]
        Mite.key = user_pref["mite_api_key"]
        Mite.user_agent = 'Redmine2mite/' + MiteController::REDMINE_2_MITE_VERSION
        mtracker = Mite::Tracker.current
        tracker_data = user_pref.mite_tracker_data
        
        # check a tracker in mite is running and if it is still the same tracker
        # as saved in the user preferences
        if (mtracker && mtracker.attributes["id"] == tracker_data[:mite_te_id])
          tracker_data[:time] = mtracker.attributes["minutes"]
          tracker_data[:active] = true
        else
          tracker_data[:active] = false
        end
        
        user_pref.mite_tracker_data = tracker_data
        user_pref.save
      end
    end
  end
end