
$: << "~/ruote/lib"
$: << "~/rufus/rufus-sixjo/lib"

require 'rubygems'
require 'rufus/sixjo' # gem 'rufus-sixjo'

load 'lib/ruote-fluo.rb'


$app = new_sixjo_rack_app(Rack::File.new('public'))

b = Rack::Builder.new do

  use Rack::CommonLogger
  use Rack::ShowExceptions
  run $app
end

port = 4567 # TODO : optparse me

puts ".. [#{Time.now}] ruote-rest listening on port #{port}"

Rack::Handler::Mongrel.run(b, :Port => port) do |server|
  trap(:INT) do
    puts ".. [#{Time.now}] stopped."
  end
end

