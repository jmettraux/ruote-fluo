
Ruote.process_definition :name => 'my def', :revision => 0 do
  sequence do
    alpha
    bravo :timeout => '2d'
    participant 'charly', :task => 'same old'
    participant :ref => 'doug', :task => 'do it'
  end
end

