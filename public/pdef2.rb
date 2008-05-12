
class MyProcessDefinition < OpenWFE::ProcessDefinition
    cursor do
        participant "one"
        participant "two"
    end
end

