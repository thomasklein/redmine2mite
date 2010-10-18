module MiteHelper
  
  #******************************
  # Return a div container containing
  # - possible option to deactivate attaching mite resources
  #   to a time entry (depending on the users preferences)
  # - select box to a mite project
  # - select box to a mite service
  #
  def self.mite_rsrcs_assignment_container(project_id, display_initially = true)
    
    display = ""
    display = style='display:none' if display_initially
    new_fields = "<div id='mite_resources_wrapper' #{display}>"
    
    # provide an option to hide the mite resource assignments
    # if set in the users preferences
    if User.current.preference.mite_omit_transmission_option
    
      onclickAction = '
        if ($("mite_resources").getStyle("display")=="block") {
          $("mite_resources").setStyle({display:"none"});
          $("time_entry_mite_project_id").setAttribute("name","");
          $("time_entry_mite_service_id").setAttribute("name","");
        }
        else {
          $("mite_resources").setStyle({display:"block"});
          $("time_entry_mite_project_id").setAttribute("name","time_entry[mite_project_id]");
          $("time_entry_mite_service_id").setAttribute("name","time_entry[mite_service_id]");
        }';
      
      new_fields += 
        "<p><label for='time_entry_option_send_te_to_mite'>#{I18n.translate(:label_option_send_te_to_mite)}</label>" +
        "<input type='checkbox' id='option_send_te_to_mite' value='1' checked='checked' onclick='#{onclickAction}' /></p>"
    end
    
    new_fields += "<div id='mite_resources'>"
    
    # select box for mite.projects  
    new_fields += "<p><label for='time_entry_mite_project_id'>#{I18n.translate(:label_mite_project)}</label>" + self::select_binded_mite_rsrcs(:time_entry, :mite_project_id, MiteProject, project_id, :include_blank => I18n.translate(:none1_option_select_box), :has_at_most_one_binding => true) + "</p>"  

    # select box for mite.services  
    new_fields += "<p><label for='time_entry_mite_service_id'>#{I18n.translate(:label_mite_service)}</label>" +  self::select_binded_mite_rsrcs(:time_entry, :mite_service_id, MiteService, project_id, :include_blank => I18n.translate(:none2_option_select_box), :optgroup_separator => I18n.translate(:label_option_group_other_services)) + "</p>"

    new_fields += "</div><!-- mite_resources -->"
    new_fields += "</div><!-- mite_resources_wrapper -->"
    
    new_fields
  end  #mite_rsrcs_assignment_container
  
  
  #******************************  
  # Select helper for displaying unbinded and binded mite resources in a select box
  # TODO: improve readability of code
  #
  def self.select_binded_mite_rsrcs(namespace,field_name,rsrc_klass,project_id, options = {})
    
    collection = {}
    options_html = ''
  
    collection[:binded_rsrces] = User.current.mite_bindings.select{|binding| (binding.mite_rsrc.class == rsrc_klass) && (binding.project_id == project_id)}.collect{|binding| [binding.mite_rsrc.mite_rsrc_id,binding.mite_rsrc.mite_rsrc_name]}
    
  # In case only ONE binded resource shoud be possible AND ONE IS BINDED 
  # display only the name of the resource as simple text since there's nothing to choose from
    if options[:has_at_most_one_binding] && collection[:binded_rsrces].size == 1
    
      return "<input type='hidden' name='#{namespace}[#{field_name}]' value='#{collection[:binded_rsrces][0][0]}' id='#{namespace}_#{field_name}' /> #{collection[:binded_rsrces][0][1]}"
    end
      
    
  # put binded resources on top
    if !collection[:binded_rsrces].empty?
      collection[:binded_rsrces].each do |key, value|
        options_html << "<option value='#{key}'>#{value}</option>\n"
      end
    end
    
    if !options[:show_only_binded_rsrcs]
      
      collection[:other_rsrces] = User.current.mite_rsrcs.select{|rsrc| (rsrc.class == rsrc_klass) && !collection[:binded_rsrces].include?([rsrc.mite_rsrc_id,rsrc.mite_rsrc_name])}.collect{|rsrc| [rsrc.mite_rsrc_id,rsrc.mite_rsrc_name]}
      
      options_other_rsces = ''
      
      collection[:other_rsrces].each do |key, value|
        options_other_rsces << "<option value='#{key}'>#{value}</option>\n"
      end
        
    # append other resources
      if !collection[:other_rsrces].empty? && !collection[:binded_rsrces].empty? && !options[:has_at_most_one_binding]
      # separate other resources with an optgroup if more than one binding is possible
        options_other_rsces = "<optgroup label='#{options[:optgroup_separator]}'>" + options_other_rsces + "</optgroup>"
      end
      
      options_html << options_other_rsces
    end
    
  # prepend blank option if desired
    if options[:include_blank]
      options_html = "<option>#{options[:include_blank]}</option>\n" + options_html
    end
    
    "<select id='#{namespace}_#{field_name}' name='#{namespace}[#{field_name}]'>#{options_html}</select>"
  end #select_binded_mite_rsrcs
  
  
  #******************************  
  # fills the global container for a flash message
  # with a specific message for actions regarding
  # the connections of the user accounts
  #
  def fill_flash_msg(predefined_msg, msg_type, exception = "")
    
    msg = ''
    details = ""
    
    if msg_type == "error"
      
    # NOTE: case construct doesn't work for me with ActiveResource constants => using normal if-else clauses
      if exception.class == ActiveResource::UnauthorizedAccess
        msg = l("msg_invalid_api_key")
        details = exception
      elsif exception.class == ActiveResource::ResourceNotFound
        msg = l("msg_invalid_account_name")
        details = exception
      elsif exception.class == ActiveRecord::RecordInvalid
        msg = "Could not create new resource because entry already exists!"
        details = exception
      else
        msg = l("msg_error_updating_account_data")
      end
    end  
  
    if details 
      msg += "<br /><small>#{details}</small>"
    end
    
    msg = predefined_msg if predefined_msg
    
    flash[msg_type] = msg
  end #fill_flash_msg
  

  #******************************  
  # Just another select helper
  #
  def simple_select_with_label(label, name, entries, selected_entries, options = {}, html_options = {})
    
    options_html = ''
    options_html = "<option>#{options[:prompt]}</option>\n" if (options[:prompt])
    
    entries.each do |key, value|
      selected = selected_entries.include?(key) ? " selected='selected'" : ""
      options_html << "<option value='#{key}'#{selected}>#{value}</option>\n"
    end
    
    tag_options = html_options.map { |key, value| %(#{key}="#{value}") }.join(" ")
    
    # return
    "<label>#{label}</label><select name='#{name}' #{tag_options}>#{options_html}</select>"
  end #simple_select_with_label
  
end
