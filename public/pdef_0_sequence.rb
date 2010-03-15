
Ruote.process_definition :name => 'my def', :revision => 0 do
  sequence do
    alpha
    bravo :timeout => '2d'
    _if '${f:success}' do
      participant 'charly', :task => 'same old'
      participant :ref => 'doug', :task => 'do it'
    end
    _if do
      equals :field => 'x', :other_field => 'y'
      participant 'charly', :task => 'same old'
      participant :ref => 'doug', :task => 'do it'
    end
  end
end

