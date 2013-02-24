class BaseContentLayoutHook < Redmine::Hook::ViewListener
	
	require 'json'
	
	def get_mite_tracker_values
		tracker_data = User.current.preference.mite_tracker_data
		html_content = "<input type='hidden' id='plugin_mite_tracker_data' value='" + (tracker_data.to_json) + "' />\n"
		html_content += "<input type='hidden' id='plugin_mite_msg_confirmation_stopping_tracker' value='" + l("msg_confirmation_stopping_tracker") + "' />\n"
		html_content += "<input type='hidden' id='plugin_mite_msg_missing_activity' value='" + l("msg_missing_activity") + "' />\n"
		html_content += "<input type='hidden' id='plugin_mite_label_start_time_tracker' value='" + l("label_start_time_tracker") + "' />\n"
		html_content += "<input type='hidden' id='plugin_mite_label_stop_time_tracker' value='" + l("label_stop_time_tracker") + "' />\n"
		html_content += "<input type='hidden' id='plugin_mite_label_stop_running_time_tracker' value='" + l("label_stop_running_time_tracker") + "' />\n"
		html_content += stylesheet_link_tag 'mite_tracker', :plugin => 'redmine2mite', :cache => true
		html_content.html_safe
	end

	def get_synchronize_services_option
		"<input type='hidden' id='plugin_mite_synchronize_services_option' value='1' />\n".html_safe
	end

	def view_layouts_base_content(context = {})
		return unless MiteHelper::user_is_logged_in_and_mite_plugin_is_setup?

		html_content = stylesheet_link_tag 'chosen', :plugin => 'redmine2mite', :cache => true
		html_content += get_mite_tracker_values if User.current.preference[:mite_tracker_option]
		html_content += get_synchronize_services_option if User.current.preference[:mite_synchronize_services]
		html_content += 
			javascript_include_tag 'lib/require',
				:plugin => 'redmine2mite', 
				"data-main" =>"/plugin_assets/redmine2mite/javascripts/main", 
				:cache => true
		html_content.html_safe
	end
end