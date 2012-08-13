
require 'rake'
require 'rake/clean'


#
# tasks

CLEAN.include('logs/*')
CLEAN.include('pkg/*')

task :default => [ :clean ]

desc %q{
  packages the ruote-fluo js files under pkg/
}
task :package => :clean do

  FileUtils.rm_rf('pkg')
  FileUtils.mkdir('pkg')

  version = File.read(
    'public/js/ruote-fluo.js'
  ).match(
    / var VERSION *= *['"]([^'"]+)/
  )[1]

  sha = `git log -1 --format="%H"`.strip[0, 7]

  FileUtils.cp(
    'public/js/ruote-fluo.js', "pkg/ruote-fluo-#{version}.js")
  FileUtils.cp(
    'public/js/ruote-fluo.js', "pkg/ruote-fluo-#{version}-#{sha}.js")

  sh(
    "yuicompressor " +
    "public/js/ruote-fluo.js " +
    "-o pkg/ruote-fluo-#{version}.min.js")
  sh(
    "yuicompressor " +
    "public/js/ruote-fluo.js " +
    "-o pkg/ruote-fluo-#{version}-#{sha}.min.js")

  Dir['pkg/*.min.js'].each do |path|
    fname = File.basename(path)
    header = "/* #{fname} | MIT license: http://git.io/RAWt2w */\n"
    s = header + File.read(path)
    File.open(path, 'wb') { |f| f.print(s) }
  end
end

