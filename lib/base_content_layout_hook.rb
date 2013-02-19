class BaseContentLayoutHook < Redmine::Hook::ViewListener
  
  require 'json'
  
  # Includes plugin assets only if 
  # - the user is logged in, 
  # - the mite-plugin activated and
  #  bound to the users mite acccount
  def view_layouts_base_content(context = {})
      return unless 
        User.current.preference &&
        User.current.preference[:mite_connection_updated_on] &&
        User.current.preference[:mite_tracker_option]
      
      tracker_data = User.current.preference.mite_tracker_data
      html_content = "<input type='hidden' id='plugin_mite_tracker' value='" + (tracker_data.to_json) + "' />\n"
      html_content += "<input type='hidden' id='plugin_mite_msg_confirmation_stopping_tracker' value='" + l("msg_confirmation_stopping_tracker") + "' />\n"
      html_content += "<input type='hidden' id='plugin_mite_msg_missing_activity' value='" + l("msg_missing_activity") + "' />\n"
      html_content += "<input type='hidden' id='plugin_mite_label_start_time_tracker' value='" + l("label_start_time_tracker") + "' />\n"
      html_content += "<input type='hidden' id='plugin_mite_label_stop_time_tracker' value='" + l("label_stop_time_tracker") + "' />\n"
      html_content += "<input type='hidden' id='plugin_mite_label_stop_running_time_tracker' value='" + l("label_stop_running_time_tracker") + "' />\n"
      html_content += stylesheet_link_tag 'mite_tracker', :plugin => 'redmine2mite', :cache => true
      html_content += stylesheet_link_tag 'chosen', :plugin => 'redmine2mite', :cache => true
      html_content += javascript_include_tag 'lib/require', :plugin => 'redmine2mite', "data-main" =>"/plugin_assets/redmine2mite/javascripts/main", :cache => false
  end
end