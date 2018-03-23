/*eslint-env browser*/
/*eslint "no-console": "off" */
/*global $ */

Vue.component('search-results', {
    props: ['city_name', 'desc_condition', 'temp', 'min_temp', 'max_temp', 'humidity', 'wind', 'clouds', 'icon'],
    template: '<div class="search-results"><h2>{{ city_name }} <img :src=icon></h2><div>General conditions: {{ desc_condition }}</div><div>Current temperature: {{ temp }} ℃</div><div>Min temperature: {{ min_temp }} ℃</div><div>Max temperature: {{ max_temp }} ℃</div><div>Humidity: {{ humidity }}%</div><div>Wind speed: {{ wind }}m/s</div><div>Cloudiness: {{ clouds }}%</div></div>'
})

Vue.component('map-iframe', {
    props: ['map_url'],
    template: "<div><iframe width='600' height='450' frameborder='0' style='border:0' :src=map_url allowfullscreen></iframe></div>"

})



var weatherApp = new Vue({
    el: '#weatherApp',
    data: {
        base_url: "http://api.openweathermap.org/data/2.5/weather?q=",
        base_forecast_url: "http://api.openweathermap.org/data/2.5/forecast?q=",
        current_loc_url: "http://api.openweathermap.org/data/2.5/weather?lat=",
        weather_data: [],
        forecast: [],
        current_loc_data: [],
        city: "",
        API_key: "dc2aa7606a67abbba089bc244eba2e55",
        latitude: "",
        longitude: "",
        location_url: ""

    },


    methods: {
        getValueSearch: function (event) {
            localStorage.setItem("city", $(event.target).find('input').val())
        },
        
        showSearch : function () {
            this.city = localStorage.getItem("city")
            this.weather_data = []
            $.getJSON(this.base_url + this.city + "&units=metric&APPID=" + this.API_key, function (data) {
                weatherApp.weather_data.push(data)
                $.getJSON(weatherApp.base_forecast_url + weatherApp.city + "&units=metric&APPID=" + weatherApp.API_key, function (data) {
                    weatherApp.forecast = data.list
                    weatherApp.forecast = weatherApp.getForecast()

                })
            })
        },

        getForecast: function () {
            var today = new Date()
            var date_today = today.getFullYear() + "-0" + today.getMonth() + "-" + today.getDate()
            var date_today_plus_one = today.getFullYear() + "-0" + (today.getMonth() + 1) + "-" + (today.getDate() + 1)
            var date_today_plus_two = today.getFullYear() + "-0" + (today.getMonth() + 1) + "-" + (today.getDate() + 2)
            var date_today_plus_three = today.getFullYear() + "-0" + (today.getMonth() + 1) + "-" + (today.getDate() + 3)
            var temp_set = new Set()
            var count_one = 0
            var count_two = 0
            var count_three = 0

            weatherApp.forecast.forEach(function (element) {

                if (element.dt_txt.startsWith(date_today_plus_one) && count_one < 1) {
                    temp_set.add(element)
                    count_one += 1
                } else if (element.dt_txt.startsWith(date_today_plus_two) && count_two < 1) {
                    temp_set.add(element)
                    count_two += 1

                } else if (element.dt_txt.startsWith(date_today_plus_three) && count_three < 1) {
                    temp_set.add(element)
                    count_three += 1

                }
            })

            return Array.from(temp_set)
        },

        getCurrentPosition: function () {
            function getLocation() {
                if (navigator.geolocation) {

                   navigator.geolocation.getCurrentPosition(showPosition,  errorCallback)
    

                } else {
                    
                    alert("Geolocation is not supported by this browser.");
                }
            }

            function showPosition(position) {
                weatherApp.latitude = position.coords.latitude;
                weatherApp.longitude = position.coords.longitude;

                var location = position.coords.latitude + "," + position.coords.longitude

                var url = "https://www.google.com/maps/embed/v1/streetview?key=AIzaSyBWaZFnTzwHKpaq7lOEFNdxC-I_JnJFkgE&location=" + location + "&heading=210&pitch=10&fov=35"

                weatherApp.location_url = url


                $.getJSON(weatherApp.current_loc_url + position.coords.latitude + "&lon=" + position.coords.longitude + "&units=metric&APPID=" + weatherApp.API_key, function (data) {
                    weatherApp.current_loc_data.push(data)
                })
            }
            
            function errorCallback(error) {
               if (error.code == error.PERMISSION_DENIED) {
                     $('#loader').fadeOut()
                     $('.error').show()
                  }
              }
            getLocation()

        }




    },



    created: function () {
        this.getCurrentPosition();
        if($('#search').length) {
           this.showSearch()
           }

    },

    updated: function () {
        if ($('.search-results').length) {
            $('#loader').fadeOut()
        }
    }


})
