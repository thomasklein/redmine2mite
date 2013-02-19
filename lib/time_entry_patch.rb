require_dependency 'time_entry'
require 'mite-rb'

module TimeEntryPatch
  
  def self.included(base)
      base.send(:include, InstanceMethods)

    # extends TimeEntry
      base.class_eval do
        unloadable
        
      # mte prefix = mite time entry
        before_create  :mte_prepare_creation, :if => :mite_conditions_apply?
        after_create   :mite_tracker_start, :if => :should_mite_tracker_start?
        before_update  :mte_prepare_updating, :if => :mite_conditions_apply?
        before_destroy :mte_prepare_destroying, :if => :mite_conditions_apply?
        
        scope :connected_to_mite, :conditions => ["mite_time_entry_id IS NOT NULL"]

        safe_attributes 'hours', 'comments', 'issue_id', 'activity_id', 'spent_on', 'custom_field_values', 'custom_fields',
                        'mite_project_id', 'mite_service_id', 'mite_time_entry_id', 'mite_time_entry_updated_on'
      end
    end

    module InstanceMethods

    private

      include Rails.application.routes.url_helpers # to generate a link to mite preferences

      def mite_conditions_apply?
        User.current.preference[:mite_connection_updated_on] && self.has_attribute?(:mite_project_id)
      end

      def should_mite_tracker_start?
        mite_conditions_apply? && User.current.preference[:mite_tracker_option] && self[:hours] == 0.0
      end
  
      # Starts the remote tracker in mite and
      # saves its context data in the user's preferences
      # so we have access to it on new page requests
      def mite_tracker_start
        user_pref = User.current.preference
        Mite::Tracker.start(self[:mite_time_entry_id])
        user_pref.mite_tracker_data = {
          :active           => true,
          :time             => 0,
          :te_id            => self[:id],
          :mite_te_id       => self[:mite_time_entry_id],
          :mite_project_id  => self[:mite_project_id],
          :mite_service_id  => self[:mite_service_id],
          :issue_id         => self[:issue_id],
          :issue_url        => Rails.application.routes.url_helpers.issue_path(:id => self[:issue_id])}
        user_pref.save
      end  
  
      def mte_prepare_creation; send_request_to_mite("create"); end
      
    # NOTE: only send a request to mite if the user account is still connected
    # this is not the case if the mite-fields of the time entry 
    # should be nullified when the user disconnects his mite-account from Redmine  
      def mte_prepare_updating; send_request_to_mite("update"); end
      
      def mte_prepare_destroying; send_request_to_mite("destroy"); end  

      def update_mite_time_entry(mte, comment)
        mte.project_id = self[:mite_project_id]
        mte.service_id = self[:mite_service_id]
        mte.note = comment
        mte.date_at = self[:spent_on]
        mte.minutes = (self[:hours] * 60)
        mte.save # sends updated attributes to mite
        mte.reload # to get new attribute 'updated_at'
        self[:mite_time_entry_updated_on] = mte.attributes["updated_at"]
      end

      def create_new_mite_time_entry(comment)
        mte = Mite::TimeEntry.create({
          :service_id => self[:mite_service_id],
          :project_id => self[:mite_project_id],
          :minutes => (self[:hours] * 60),
          :date_at => self[:spent_on],
          :note => comment})
        self[:mite_time_entry_id] = mte.attributes["id"]
        self[:mite_time_entry_updated_on] = mte.attributes["updated_at"]
      end

      def init_connection_to_mite
        Mite.account = User.current.preference["mite_account_name"]
        Mite.key = User.current.preference["mite_api_key"]
        Mite.user_agent = 'Redmine2mite/' + MiteController::REDMINE_2_MITE_VERSION
      end

      def send_request_to_mite(type)
        init_connection_to_mite
        mte_exists = false
        mte_should_be_destroyed = self["mite_time_entry_updated_on"] == -1
        begin
          unless self[:mite_time_entry_id].nil?
            mte = Mite::TimeEntry.find(self[:mite_time_entry_id])
            mte_exists = true
          end
        rescue ActiveResource::ResourceNotFound
        rescue StandardError => exception
          p "*************"
          p "EXCEPTION in TimeEntryPatch#send_request_to_mite: " + exception.inspect
          p $!.backtrace
          p "*************"
          return false
        end

        begin
          comment = replace_placeholders(self[:comments], User.current.preference[:mite_note_pattern])
          if type == "create" || (type == "update" && !mte_exists)
            create_new_mite_time_entry(comment)
          elsif type == "update" && !mte_should_be_destroyed && mte_exists
            update_mite_time_entry(mte, comment)
          elsif (type == "destroy" && mte_exists) || mte_should_be_destroyed
            mte.destroy
          end
          return true
        rescue ActiveResource::UnauthorizedAccess # in case the given account params are not valid
          errors.add_to_base(l("msg_error_verification_html",
                             :url => url_for(:controller => 'mite', :only_path => true)).html_safe)
          return false
        rescue StandardError => exception # show unforeseen exceptions in the console
          p "*************"
          p "EXCEPTION in TimeEntryPatch#send_request_to_mite: " + exception.inspect
          p $!.backtrace
          p "*************"
          return false
        end
      end
    end

    def replace_placeholders(comment, pattern)
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