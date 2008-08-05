
class MyProcessDefinition < OpenWFE::ProcessDefinition
  sequence do
    sub0
    subprocess 'sub0'
    subprocess :ref => "sub0"
  end
  process_definition :name => "sub0" do
    participant 'toto3'
  end
end
