
Ruote.process_definition do
  sequence do
    logistics
    delivery
    accounting
    _if '${f:success}' do
      archive
    end
  end
end

