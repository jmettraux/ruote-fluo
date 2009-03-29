
require 'json' # gem 'json_pure'
require 'openwfe/expool/def_parser' # gem 'ruote'
require 'openwfe/expressions/expression_tree'

include Rufus::Sixjo


get '/' do

  pdef = request['pdef'] || 'pdef.rb'

  i = pdef.rindex('/')
  pdef = pdef[i + 1..-1] if i

  pdef = File.open("public/#{pdef}").readlines.join

  prep = OpenWFE::DefParser.parse(pdef)
  prep = prep.to_a.to_json

  wi = request['wi']

  erb :index, :locals => { :prep => prep, :wi => wi }
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
    when 'xml'
      s = ''
      REXML::Formatters::Pretty.new.write(
        OpenWFE::ExpressionTree.to_xml(tree), s)
      s
    when 'ruby'
      OpenWFE::ExpressionTree.to_code_s(tree).to_s
    else
      json
  end
end

get '/intake' do # work/get around... not very restful...

  pdef = request['pdef']

  return redirect('/') unless pdef

  pdef = Rack::Utils.unescape(pdef)

  erb(
    :index,
    :locals => {
      :prep => OpenWFE::DefParser.parse(pdef).to_a.to_json, :wi => nil })
end
