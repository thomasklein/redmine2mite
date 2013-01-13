RedmineApp::Application.routes.draw do
  #match 'mite/:action/:id', :to => 'mite', :via => [:get, :post]
  match 'mite/(:action(/:id))', :controller => 'mite'
end
