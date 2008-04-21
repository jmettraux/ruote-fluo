
class MyOtherProcessDefinition < OpenWFE::ProcessDefinition
    sequence do
        participant "toto0"
        participant "toto0", :activity => "clean glasses"
        participant "toto0", :tag => "clean dishes"
        toto0 :tag => "clean kitchen"
        toto0 :activity => "brush teeth"
    end
end

