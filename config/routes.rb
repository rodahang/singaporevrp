Rails.application.routes.draw do
  	root 'dashboard#home'
  	
  	get 'research', 	to: 'dashboard#research'
	get 'about', 	to: 'dashboard#about'

	get 'input', 	to: 'vrp#input'
  	get 'solve', 	to: 'vrp#solve'
end
