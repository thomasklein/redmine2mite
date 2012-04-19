class BaseContentLayoutHook < Redmine::Hook::ViewListener
  
  require 'json'
  
  def view_layouts_base_content(context = {})
    # do not proceed if a connection to a mite account was yet not established  
      return unless User.current.preference[:mite_connection_updated_on]
    # do not proceed if the tracker option is not activated
      return unless User.current.preference[:mite_tracker_option]
  
      tracker_data = User.current.preference.mite_tracker_data
      html_content = "<input type='hidden' id='plugin_mite_tracker' value='" + (tracker_data.to_json) + "' />\n"
    # include JavaScript files for dynamic manipulation of different DOM nodes
    # reflecting the tracker functionality
      html_content += stylesheet_link_tag 'mite_tracker', :plugin => 'redmine2mite', :cache => false
      html_content += javascript_include_tag 'mite_tracker', :plugin => 'redmine2mite', :cache => false
  end
end