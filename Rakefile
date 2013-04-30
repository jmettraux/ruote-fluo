
require 'rake'
require 'rake/clean'


LIBRARY =
  `pwd`.split('/').last.strip
LICENSE_URI =
  "http://github.com/jmettraux/#{LIBRARY}/LICENSE.txt"

COMPRESSOR =
  %w[ yui-compressor yuicompressor ].find { |com| `which #{com}`.strip != '' }

raise(
  "did not find yui-compressor (or yuicompressor) on this system"
) unless COMPRESSOR


#
# tasks

#CLEAN.include('pkg')
  # no cleaning for now

task :default => [ :clean ]

desc %q{
  packages/minifies the js files to pkg/
}
task :package => :clean do

  version = File.read(
    "js/#{LIBRARY}.js"
  ).match(
    / var VERSION *= *['"]([^'"]+)/
  )[1]

  sha = `git log -1 --format="%H"`.strip[0, 7]

  sh 'mkdir -p pkg'

  js_count = Dir['js/*.js'].length
    # don't create -all- files if there is only 1 js file

  FileUtils.rm_f("pkg/#{LIBRARY}-all-#{version}.js")

  Dir['js/*.js'].each do |path|

    fname = File.basename(path, '.js')

    FileUtils.cp(path, "pkg/#{fname}-#{version}.js")

    sh(
      COMPRESSOR + ' ' +
      path + ' ' +
      "-o pkg/#{fname}-#{version}.min.js")

    File.open("pkg/#{LIBRARY}-all-#{version}.js", 'ab') do |f|
      f.puts(File.read(path))
    end if js_count > 1
  end

  sh(
    COMPRESSOR + ' ' +
    "pkg/#{LIBRARY}-all-#{version}.js " +
    "-o pkg/#{LIBRARY}-all-#{version}.min.js"
  ) if js_count > 1

  Dir['pkg/*.min.js'].each do |path|

    fname = File.basename(path)

    header = "/* #{fname} | MIT license: #{LICENSE_URI} */\n"

    s = header + File.read(path)
    File.open(path, 'wb') { |f| f.print(s) }
  end

  footer = "\n/* compressed from commit #{sha} */\n"

  Dir['pkg/*.js'].each { |path| File.open(path, 'ab') { |f| f.puts(footer) } }

  sh(
    "mkdir -p pkg/css-#{version}; cp css/* pkg/css-#{version}/"
  ) if File.exist?('css')
end

desc %q{
  alias for 'package'
}
task :pkg => :package

desc %q{
  alias for 'package'
}
task :p => :package

desc %q{
  serve the current dir over HTTP for testing
}
task :serve do

  sh 'python -m SimpleHTTPServer 1234'
end

desc %q{
  alias for 'serve'
}
task :s => :serve

