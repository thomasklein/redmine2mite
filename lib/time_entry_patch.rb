require_dependency 'time_entry'
require 'mite-rb' # to communicate with the mite api
include ActionController::UrlWriter # to generate link to mite preferences

# TODO: implement observer to get logic out of model

module TimeEntryPatch
  
  def self.included(base)
      base.send(:include, InstanceMethods)

    # extends the model TimeEntry
      base.class_eval do
        unloadable
        
      # new callback: send time entry to mite before it was saved in redmine
      # but ONLY IF the user has already connected his mite account with redmine
      # mte prefix = mite time entry
        before_create  :mte_prepare_creation, :if => :mite_conditions_apply?
        after_create :mite_tracker_start, :if => :should_mite_tracker_start?
        before_update  :mte_prepare_updating, :if => :mite_conditions_apply?
        before_destroy :mte_prepare_destroying, :if => :mite_conditions_apply?
        
        named_scope :connected_to_mite, :conditions => ["mite_time_entry_id IS NOT NULL"]
      end
    end

    module InstanceMethods
  
    private
      def mite_conditions_apply?
        User.current.preference["mite_connection_updated_on"] && self[:mite_project_id]
      end
      
      def should_mite_tracker_start?
        User.current.preference[:mite_tracker_option] && self[:mite_project_id] && self[:hours] == 0.0
      end
  
      # Starts the remote tracker in mite and
      # saves its context data in the user's preferences
      # so we have access to it on new page requests
      def mite_tracker_start
        Mite::Tracker.start(self[:mite_time_entry_id])
        User.current.preference.mite_tracker_data = {
          :active => true,
          :time => 0,
          :te => self[:id],
          :mite_te => self[:mite_time_entry_id],
          :issue_url => issue_path(self[:issue_id]) + "/time_entries"}
        User.current.preference.save
      end  
  
      def mte_prepare_creation; send_request_to_mite("create"); end
      
    # NOTE: only send a request to mite if the user account is still connected
    # this is not the case if the mite-fields of the time entry 
    # should be nullified when the user disconnects his mite-account from Redmine  
      def mte_prepare_updating; send_request_to_mite("update"); end
      
      def mte_prepare_destroying; send_request_to_mite("destroy"); end  
  
    # sends the created time entry to mite  
      def send_request_to_mite(type)
        Mite.account = User.current.preference["mite_account_name"]
        Mite.key = User.current.preference["mite_api_key"]
        Mite.user_agent = 'Redmine2mite/' + MiteController::REDMINE_2_MITE_VERSION
        mte_exists = false
        
        begin
          mte = Mite::TimeEntry.find(self[:mite_time_entry_id])
          mte_exists = true
        rescue ActiveResource::ResourceNotFound
        rescue StandardError => exception
          p "*************"
          p "EXCEPTION in TimeEntryPatch#send_request_to_mite: " + exception.inspect
          p "*************"
        end
        
        begin
          comment = replace_placeholders(self[:comments],User.current.preference[:mite_note_pattern])
          # handle possible cases
          if type == "create" || (type == "update" && !mte_exists)
            mte = Mite::TimeEntry.create(
              :service_id => self[:mite_service_id],
              :project_id => self[:mite_project_id],
              :minutes => (self[:hours] * 60),
              :date_at => self[:spent_on],
              :note => comment)
            self[:mite_time_entry_id] = mte.attributes["id"]
            self[:mite_time_entry_updated_on ] = mte.attributes["updated_at"]
            
          elsif type == "update" && mte_exists
            mte.project_id = self[:mite_project_id]
            mte.service_id = self[:mite_service_id]
            mte.note = comment
            mte.date_at = self[:spent_on]
            mte.minutes = (self[:hours] * 60)
            mte.save # sends updated attributes to mite
            mte.reload # to get new attribute 'updated_at'
            self[:mite_time_entry_updated_on] = mte.attributes["updated_at"]
          elsif type == "destroy" && mte_exists
            mte.destroy
          end
        rescue ActiveResource::UnauthorizedAccess # in case the given account params are not valid
          errors.add_to_base(l("msg_error_verification",:url => url_for(:controller => 'mite', :only_path => true))) # add error message
          return false # prevent creating a new time entry record
          
        rescue StandardError => exception # show unforeseen exceptions in the console
          p "*************"
          p "EXCEPTION in TimeEntryPatch#send_request_to_mite: " + exception.inspect
          p "*************"
        end
      end
    end
    
    
    def replace_placeholders(comment,pattern)
      
      return comment unless pattern
      
      # do not add the placeholders if the pattern was already resolved
      # (marked by "{" and "}") and is part of the comment
      return comment if comment.include?("{") && comment.include?("}")
      
      new_comment = pattern
      
      new_comment['{issue_id}']= self.issue_id.to_s if new_comment['{issue_id}']
      new_comment['{issue}']= self.issue.subject if new_comment['{issue}']
      new_comment['{issue_tracker}']= self.issue.tracker.name if new_comment['{issue_tracker}']
      new_comment['{issue_category}']= self.issue.category ? self.issue.category.name : "" if new_comment['{issue_category}']
      new_comment['{project_id}']= self.project_id.to_s if new_comment['{project_id}']
      new_comment['{project}']= self.project.name if new_comment['{project}']
      new_comment['{user_id}']= self.user_id.to_s if new_comment['{user_id}']
      new_comment['{user}']= "#{self.user.firstname} #{self.user.lastname}" if new_comment['{user}']
      
      "#{comment} {#{new_comment}}"
    end
    
  end