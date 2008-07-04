
engine.register_participant "Tang" do |workitem|
  puts "Hello, my name is Tang and I just received some work..."
  workitem.fields["total_price"] = 12000 * workitem.fields["count"]
end

