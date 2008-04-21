
#
# an example of a Ruby process definition, for a small
# vacation request application.
#
class VacationRequest0 < OpenWFE::ProcessDefinition

    #
    # setting some fields right at the beginning of the 
    # process
    #
    # those are the fields to be filled by the employee 
    # for his request to be considered.

    set :v => "employee", :value => "user_${f:launcher}"
    set :v => "boss", :value => "user_alice"
    set :v => "assistant", :value => "user_bob"

    set :f => "employee", :value => "${f:launcher}"
    set :f => "from_date", :value => ""
    set :f => "to_date", :value => ""
    set :f => "reason", :value => ""


    #
    # the 'body' of the process definition
    #
    sequence do

        #
        # the first participant is the employee (the user who
        # launched the process)
        #
        employee
        
        #
        # now setting some fields that the assistant and perhaps 
        # the boss will fill.
        #
        set :f => "granted", :value => "false"
        set :f => "not_enough_info", :value => "false"
        set :f => "boss_should_have_a_look", :value => "false"

        assistant

        #
        # if the assistant set the field 'boss_should_have_a_look', 
        # then the process will head to the boss desk
        #
        boss :if => "${f:boss_should_have_a_look}"

        #
        # employee gets the answer to his request
        #
        employee
    end
end
