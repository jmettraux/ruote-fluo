
class NestedIfs < OpenWFE::ProcessDefinition
    sequence do
        _if :test => "${f0} == ok" do
            toto_then
            _if :test => "${fx} == bad" do
                toto_nested_else
            end
        end
        _if :test => "${f1} == ok" do
            _if :test => "${fy} == bad" do
                toto_nested_then
            end
            toto_else
        end
        _if :test => "${f2} == ok" do
            toto_then
        end
    end
end

