
class MyProcessDefinition < OpenWFE::ProcessDefinition
    set_fields :value => {
        "customer" => "Toto",
        "dimension" => { "width" => 5, "height" => 4 }
    }
    sequence do
        participant "toto0"
        participant :ref => "toto1"
        set :v => "toto", :val => "nada"
        toto2 :if => "${f:valid} is set"
        _if do
            equals :field_val => "f0", :other_val => "ok"
            toto_then
            toto_else
        end
        _if do
            equals :field_val => "f0", :other_val => "ok"
            sequence do
                toto_then_0
                toto_then_1
            end
        end
        _if :test => "${f0} == ok" do
            toto_then
        end
        concurrence do
            sequence do
                participant "toto4"
                subprocess "sub0"
            end
            #toto5
            participant "佐々木さん"
            sequence do
                sub0
                participant :ref => "toto6"
            end
        end
        toto8
    end
    process_definition :name => "sub0" do
        participant "toto3"
    end
end

