module MiteSynchronizer
  
  class IsAbstractMethodError < StandardError; end
  
  class Base
    
    def initialize
    end

    def synchronize(is_initial_sync)
      if (is_initial_sync)
        remote_records.each{|remote_record| create_local_record(remote_record)}
      else
        destroy_old_local_records if local_record_ids_to_destroy.any?
        changed_remote_records.each do |remote_record|
          update_or_create_local_record(remote_record)
        end
      end
    end
    
    protected
    
    def destroy_old_local_records
      raise IsAbstractMethodError
    end

    def remote_records
      raise IsAbstractMethodError
    end

    def local_records
      raise IsAbstractMethodError
    end

    def new_local_record
      raise IsAbstractMethodError
    end
    
    def find_local_record(remote_record)
      local_records.detect do |local_record| 
        local_record.mite_rsrc_id == remote_record.id
      end
    end

    def changed_remote_records
      @changed_remote_records ||= remote_records.select do |remote_record|
        remote_record.updated_at > User.current.preference.mite_connection_updated_on
      end
    end

    def local_record_ids_to_destroy
      @local_record_ids_to_destroy ||= local_records.map(&:mite_rsrc_id) - remote_records.map(&:id)
    end

    def update_or_create_local_record(remote_record)
      local_record = find_local_record(remote_record) || new_local_record
      update_local_record(local_record, remote_record)
    end
    
    def update_local_record(local_record, remote_record)
      local_record.update_attributes({
        :mite_rsrc_id           => remote_record.id,
        :mite_rsrc_name         => remote_record.name,
        :mite_rsrc_updated_at   => remote_record.updated_at.localtime
      })
    end
    
    def create_local_record(remote_record)
      local_record = new_local_record
      update_local_record(local_record, remote_record)
    end
    
  end
  
end  

$:.unshift(File.dirname(__FILE__))
Dir[File.join(File.dirname(__FILE__), "mite_synchronizers/*.rb")].each { |f| require f }