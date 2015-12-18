$(document).ready(function() {
    // set up the map
    var map = L.map('map').setView([40, -99], 4);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        minOpacity: 0.9,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1Ijoic3Bva2VuYmFuYW5hIiwiYSI6ImNpaHN0aGFtdDAweXN0NWtoczhtZnIxeTAifQ.mrsYc_CUXt9QG-bBTUKkiQ'
    }).addTo(map);

    // set up the heat map
    var heat = L.heatLayer([], {
        radius: 35,
        maxZoom: 10,
        minOpacity: 0.1,
        gradient: {
            0.1: 'purple',
            0.2: 'blue',
            0.3: '#FFF047',
            0.6: '#F6A03E',
            0.8: '#ED5035',
            1: 'red'
        } }).addTo(map);

    function findIps() {
        $('#loading').toggleClass('hidden');
        var bounds = map.getBounds();
        var northwest = bounds.getNorthWest();
        var southeast = bounds.getSouthEast();

        // in these cases the user panned too far and got us some invalid
        // lat/lng pair so shift them to the same location with a valid lat/lng
        if (northwest.lng < -180 && southeast.lng< -180) {
            northwest.lng +=360;
            southeast.lng +=360;
            map.fitBounds([northwest, southeast]);
        }
        else if (northwest.lng > 180 && southeast.lng > 180) {
            northwest.lng -=360;
            southeast.lng -=360;
            map.fitBounds([northwest, southeast]);
        }

        $.get('/get_ips/api/v1.0', {
            left: southeast.lat,
            bottom: southeast.lng,
            right: northwest.lat,
            top: northwest.lng
        },  function(ex){
            $('#loading').toggleClass('hidden');
            if (ex === 0)
                return;
            heat.setLatLngs(ex);
            heat.setOptions({
                max: Math.max.apply(Math,ex.map(function(o){return o[2];}))
            });
        }
        );
    }

    function findIpFromLatLng(e) {
        var lat = $('#lat').val();
        var lng = $('#long').val();
        var error = $('#error');

        // input handling
        if (isNaN(lat) || isNaN(lng) || lat === '' || lng === '') {
            error.text('Please enter in valid latitude and longitude values.');
            return;
        }

        lat = parseFloat(lat);
        lng = parseFloat(lng);

        if (lat < -90 || lat > 90 || lng < -180 || lng > 180){
            error.text('Please enter in valid latitude and longitude values.');
            return;
        }

        // valid, move view there
        error.text('');
        map.setView([lat, lng]);
        findIps();
    }

    function bindEnter(e) {
        if (e.keyCode === 13)
            findIpFromLatLng(e)
    }

    $('#getips').click(findIps);

    $('#find').click(findIpFromLatLng);
    $('#lat').keyup(bindEnter);
    $('#long').keyup(bindEnter);

    $('#loc').click(function(e){
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(pos){
                map.setView([pos.coords.latitude, pos.coords.longitude]);
                findIps();
            });
        }
        else
            e.target.textContent = 'Geolocation is not supported by your browser';

    });

    findIps();
});
