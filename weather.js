function getWeather( cityName ) {
	var weatherJSONURL = 'http://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&units=metric&APPID=dd7d48fd09e12f23858df736aea1b728';
	return $.ajax({
  		method: "GET",
  		url: weatherJSONURL,
  		dataType: 'JSON',
  	});
}

var weatherItem = Backbone.Model.extend({
	defaults: function(){
		return {
			city: this.get('currentCity')
		}
	}
});

var weatherItems = Backbone.Collection.extend({
	model: weatherItem,
	url: function() {
		return 'http://api.openweathermap.org/data/2.5/weather?q=' + this.currentCity + '&units=metric&APPID=dd7d48fd09e12f23858df736aea1b728'
	},
	initialize: function(){
		this.fetch();
	},
});

var weatherCities = Backbone.Collection.extend({
	model: weatherItem,
	localStorage: new Backbone.LocalStorage("jsWeatherCollection"),
	initialize: function(){
		this.fetch();
	},
});

var weatherView = Backbone.View.extend({
	template: _.template('<% if (typeof(sys) !== "undefined") { %>' +
		'<tr>' +
		'<td><%= name %>, <%= sys.country %></td>' +
		'<td><img src="https://maps.googleapis.com/maps/api/staticmap?center=<%= coord.lat %>,<%= coord.lon %>&zoom=8&size=150x150" /></td>' +
		'<td><%= main.temp %> C</td>' +
		'<td><%= weather[0].description %></td>' +
		'<td><%= main.humidity %> %</td>' + 
		'</tr>' +
		'<% } %>'),
	el: '#weatherapp',
	tagName: 'tr',

	render: function(){
		var modelJSON = this.model.toJSON();
		var currentCity = modelJSON.currentCity;
		var currentCityWeatherData = getWeather( currentCity );
		var self = this;
		currentCityWeatherData.success( function( data ) { 
			$('#weatherapp').append( self.template( data ) );
			return self;
		});
		return this;
  },
});

var weathersView = Backbone.View.extend({
	tagName: 'tbody',
	events: {
		'click #weatherFormSubmit': 'addPlace',
	},
	initialize: function(){
		this.collection.on('add', this.addOne, this);
		this.collection.on('reset', this.addAll, this);  
	},

	render: function(){
		this.addAll();
		return this;
	},

	addAll: function( model ){
		this.$el.empty();
		this.collection.forEach(this.addOne, this);
	},

	addOne: function( weatherItem ){
		var city = weatherItem.attributes.currentCity;
		var weatherViewCall = new weatherView( { model: weatherItem } );
		weatherViewCall.currentCity = city;
		this.$el.append( weatherViewCall.render().el ); 
	},
 
});

var addWeatherCity = Backbone.View.extend({
  template: _.template( '<h3>Add another place here</h3>' +
	'<div class="alert alert-info hidden" role="alert">Loading...</div>' +
	'<form id="weatherForm" name="weatherForm" method="POST">' +
		'<label>Place:</label>' +
		'<input type="text" required name="weatherCity" id="weatherCity" />' +
		'<input type="submit" value="Add" id="weatherFormSubmit" />' +
	'</form>' ),
  events: {
		'submit #weatherForm': 'addPlace',
	},
	render: function() {
		this.$el.html( this.template() );
	},
  addPlace: function( e ){
  	e.preventDefault();
    var cityName = $('#weatherCity').val();
    var city = new weatherItem( cityName );
	city.set('currentCity',cityName);
	this.weatherCities = new weatherCities();
	this.weatherCities.add( city );
	city.save();

	var currentCityWeatherData = getWeather( cityName );
	currentCityWeatherData.success( function( data ) {
		var weatherViewCall = new weatherView;
		$('#weatherapp').append( weatherViewCall.template( data ) );
	});
  },
});


var weatherApp = new (Backbone.Router.extend({
  routes: {
    "": "index",
  },

  initialize: function(){
    this.weatherCities = new weatherCities();
    this.weathersView = new weathersView( { collection: this.weatherCities } );
    this.weathersView.render();
	this.addWeatherCity = new addWeatherCity();
	this.addWeatherCity.render();
  },

  index: function(){
    $('#weatherapp').append( this.weathersView.el );
    $('body').append( this.addWeatherCity.el );
    this.weatherCities.fetch();
  },

  start: function(){
    Backbone.history.start();
  },

}));


$(function(){ 
	weatherApp.start();
	$( '#learn-more-button' ).on('click',function( e ) {
		e.preventDefault();
		$( '#learn-more-text' ).toggleClass('hidden');
	});
});