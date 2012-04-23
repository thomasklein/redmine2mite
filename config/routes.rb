ActionController::Routing::Routes.draw do |map|
  map.connect '/mite/:action/:id', :controller => 'mite'
end
