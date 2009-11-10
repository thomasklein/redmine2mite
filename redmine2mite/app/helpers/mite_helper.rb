module MiteHelper
  
# Select helper for displaying unbinded and binded mite resources in a select box
# TODO: improve readability of code
  def self.select_binded_mite_rsrcs(namespace,field_name,rsrc_klass,project_id, options = {})
    
    collection = {}
    options_html = ''
  
    collection[:binded_rsrces] = User.current.mite_bindings.select{|binding| (binding.mite_rsrc.class == rsrc_klass) && (binding.project_id == project_id)}.collect{|binding| [binding.mite_rsrc.mite_rsrc_id,binding.mite_rsrc.mite_rsrc_name]}
    
  # In case only ONE binded resource shoud be possible AND ONE IS BINDED 
  # display only the name of the resource as simple text since there's nothing to choose from
    if options[:has_at_most_one_binding] && collection[:binded_rsrces].size == 1
    
      return "<input type='hidden' name='#{namespace}[#{field_name}]' value='#{collection[:binded_rsrces][0][0]}'/> #{collection[:binded_rsrces][0][1]}"
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
  end
  
# fills the global container for a flash message
# with a specific message for actions regarding
# the connections of the user accounts
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
  end
  

# Just another select helper
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
  end
  
end
