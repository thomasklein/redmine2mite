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
    
      html_content += stylesheet_link_tag 'mite_tracker', :plugin => 'redmine2mite', :cache => false
      html_content += javascript_include_tag 'mite_tracker', :plugin => 'redmine2mite', :cache => false
  end
end