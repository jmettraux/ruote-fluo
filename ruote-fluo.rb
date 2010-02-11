#--
# Copyright (c) 2005-2010, John Mettraux, jmettraux@gmail.com
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.
#
# Made in Japan.
#++

$: << File.join(File.dirname(__FILE__), %w[ .. ruote lib ])
  # TODO : vendor me

require 'rubygems'
require 'sinatra' # gem install sinatra
require 'json' # gem install json_pure
require 'ruote/parser' # gem install ruote

use Rack::CommonLogger
use Rack::ShowExceptions


get '/' do

  pdef = request['pdef'] || 'pdef_0_sequence.rb'

  i = pdef.rindex('/')
  pdef = pdef[i + 1..-1] if i

  tree = Ruote::Parser.parse(File.join(options.public, pdef)).to_json

  wi = request['wi']

  erb :process, :locals => { :tree => tree, :wi => wi }
end

get '/defs' do

  pdefs = Dir.new('public').inject('') do |r, p|

    r << "<li><a href='/?pdef=#{p}'>#{p}</a></li>\n" \
      if p.match(/\.xml$|.rb$/)
    r
  end

  erb :defs, :locals => { :pdefs => pdefs }
end

post '/def' do

  json = params[:definition]
  tree = JSON.parse(json)

  response.headers['Content-Type'] = 'text/plain'

  case params[:out_type]
    when 'xml' then Ruote::Parser.to_xml(tree)
    when 'ruby' then Ruote::Parser.to_ruby(tree)
    else json
  end
end

get '/intake' do # work/get around... not very restful...

  pdef = request['pdef']

  return redirect('/') unless pdef

  pdef = Rack::Utils.unescape(pdef)

  erb(
    :process,
    :locals => { :tree => Ruote::Parser.parse(pdef).to_json, :wi => nil })
end

