
class MyProcessDefinition < OpenWFE::ProcessDefinition
    sequence do
        step "stage0"
    end
    define "stage0" do
        participant "toto"
    end
    define "out0" do
        participant "totoout"
    end
end

