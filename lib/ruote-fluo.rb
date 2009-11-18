
require 'json' # gem install json_pure
require 'ruote/parser' # gem install ruote


set :public, File.expand_path(File.join(File.dirname(__FILE__), '..', 'public'))
set :views, File.expand_path(File.join(File.dirname(__FILE__), '..', 'views'))


get '/' do

  pdef = request['pdef'] || 'pdef.rb'

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
