
$: << File.join(File.dirname(__FILE__), %w[ .. vendor ruote lib ])

require 'rubygems'
require 'sinatra' # gem install sinatra

load 'lib/ruote-fluo.rb'


#$app = new_sixjo_rack_app(Rack::File.new('public'))

use Rack::CommonLogger
use Rack::ShowExceptions

