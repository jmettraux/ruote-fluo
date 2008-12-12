
#
# this script turn a process definition into its escaped JSON representation,
# ready for http://difference.openwfe.org:4567/intake?pdef=...
#

$: << "~/ruote/lib"
require 'rubygems'

require 'json'
require 'rack/utils'
require 'openwfe'

DEF =
  OpenWFE.process_definition :name => 'toto' do
    sequence do
      participant 'alpha'
      participant 'bravo'
    end
  end

puts
puts Rack::Utils.escape(DEF.to_json)
puts

