var updateFileTimer = "";
var obj = new Array;
var where = "";
var time_to_change_wall;
var dayhour;
var nighthour;
var ampm = false;		// not necessary to change, the tweak changes it in settings
var iPhoneType = "auto";
var iOS = navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false;

// SET A TIME OUT FOR ALL AJAX REQUEST AND DEACTIVATE THE CACHE
$.ajaxSetup({timeout: 8000, cache: false}); 

// WEATHER CONDITIONS
var Conditions = [
	"thunderstorm", // 0 tornado
	"thunderstorm", // 1 tropical storm
	"thunderstorm", // 2 hurricane
	"thunderstorm", // 3 severe thunderstorms
	"thunderstorm", // 4 thunderstorms
    "sleet", // 5 mixed rain and snow
    "sleet", // 6 mixed rain and sleet
    "sleet", // 7 mixed snow and sleet
    "sleet", // 8 freezing drizzle
	"showers", // 9 drizzle
    "sleet", // 10 freezing rain
    "showers", // 11 showers
	"rain", // 12 rain
	"lightsnow", // 13 snow flurries
	"lightsnow", // 14 light snow showers
    "snow", // 15 blowing snow
    "snow", // 16 snow
    "hail", // 17 hail
    "sleet", // 18 sleet
    "fog", // 19 dust
    "fog", // 20 foggy
    "haze", // 21 haze
    "fog", // 22 smoky
	"wind", // 23 blustery
	"wind", // 24 windy
    "frost", // 25 cold
    "cloud", // 26 cloudy
    "mostlycloudy", // 27 mostly cloudy (night)
    "mostlycloudy", // 28 mostly cloudy (day)
    "partlycloudy", // 29 partly cloudy (night)
    "partlycloudy", // 30 partly cloudy (day)
    "clear", // 31 clear (night)
    "clear", // 32 sunny
    "fair", // 33 fair (night)
    "fair", // 34 fair (day)
    "sleet", // 35 mixed rain and hail
    "clear", // 36 hot
	"scattered_thunderstorms", // 37 isolated thunderstorms
	"scattered_thunderstorms", // 38 scattered thunderstorms
	"scattered_thunderstorms", // 39 scattered thunderstorms
	"showers", // 40 scattered showers
	"heavysnow", // 41 heavy snow
	"lightsnow", // 42 scattered snow showers
	"heavysnow", // 43 heavy snow
    "partlycloudy", // 44 partly cloudy
    "thunderstorm", // 45 thundershowers
	"lightsnow", // 46 snow showers
	"thunderstorm", // 47 isolated thundershowers
	"blank"
]; // 3200 not available

function init() {
updateClock();
setInterval(updateClock, 1000);
updateWeather();
}

function dealWithWeather(obj) {
	
	// City Name Display Option
	var cityname = obj.city;
	switch (UseExtraLocation) {
		case "city":
		if (obj.yCity) { cityname = obj.yCity; }
		else if (obj.extraLocCity) { cityname = obj.extraLocCity; }
		break;
		
		case "neighborhood":
		if (obj.yNeigh) { cityname = obj.yNeigh; }
		else if (obj.extraLocNeighborhood) { cityname = obj.extraLocNeighborhood; }
		else if (obj.extraLocCounty) { cityname = obj.extraLocCounty; }
		break;
		
		case "auto":
		if ((obj.gNeigh) && (obj.gNeigh3) && (obj.gNeigh3.indexOf(obj.gNeigh) == -1)) { cityname = obj.gNeigh + " / " + obj.gNeigh3; }
		else if ((obj.yNeigh) && (obj.gNeigh3) && (obj.gNeigh3.indexOf(obj.yNeigh) == -1)) { cityname = obj.yNeigh + " / " + obj.gNeigh3; }
		else if (obj.yNeigh) { cityname = obj.yNeigh; }
		else if (obj.extraLocNeighborhood) { cityname = obj.extraLocNeighborhood; }
		else if (obj.yCity) { cityname = obj.yCity; }
		else if (obj.extraLocCity) { cityname = obj.extraLocCity; }
		else if (obj.extraLocCounty) { cityname = obj.extraLocCounty; }
		break;
	}
	
	// EXIT RAMP INFO
	if ((/\d/.test(obj.extraLocLine1) ) &&
		(obj.extraLocLine1.length <=4) &&
		(obj.extraLocLine1.indexOf("-") == -1))
		{ exitRamp = "Exit " + obj.extraLocLine1 + " Ramp"; }
	else { exitRamp = ""; }
	
	// ADDRESS
	if (exitRamp) { document.getElementById("address").innerHTML = exitRamp; }
	
	else if (obj.extraLocLine1) { document.getElementById("address").innerHTML = obj.extraLocLine1; }
		 
	else if (obj.gStreet) { document.getElementById("address").innerHTML = obj.gHouse + " " + obj.gStreet; }
	
	else { document.getElementById("address").innerHTML = "Address not available!"; }
	
	// xmlupdate is the time that the xml updated with new information for location and weather
	document.getElementById("xmlupdate").innerHTML = lastupdatetext + obj.updatetimestring.slice(11);
	
	// SUNSET SUNRISE INFORMATION
	var sunriseh = parseInt(obj.sunrise.split(':')[0]) + GMT;
	var sunrisem = obj.sunrise.split(':')[1];
	var sunseth = parseInt(obj.sunset.split(':')[0]) + GMT;
	var sunsetm = obj.sunset.split(':')[1];
	dayhour = sunriseh + parseInt(sunrisem)/60;
	nighthour = sunseth + parseInt(sunsetm)/60;
			
	if (ampm == false) {
		var sunriseh = ( sunriseh < 10 ? "0" : "" ) + sunriseh;
		var sunseth = ( sunseth < 10 ? "0" : "" ) + sunseth;
		var sunrise = sunriseh + ":" + sunrisem;		
		var sunset = sunseth + ":" + sunsetm;
		} else {
		var timeOfSunset = ( sunseth < 12 ) ? "am" : "pm";
		var timeOfSunrise = ( sunriseh < 12 ) ? "am" : "pm";
		sunriseh = ( sunriseh > 12 ) ? sunriseh - 12 : sunriseh;
		sunriseh = ( sunriseh == 0 ) ? 12 : sunriseh;
		sunseth = ( sunseth > 12 ) ? sunseth - 12 : sunseth;
		sunseth = ( sunseth == 0 ) ? 12 : sunseth;
		var sunrise = sunriseh + ":" + sunrisem + " " + timeOfSunrise;	
		var sunset = sunseth + ":" + sunsetm + " " + timeOfSunset;
	}

	// CHANGE THE BACKGROUND FOR DAY OR NIGHT CONDITION
	if ((time_to_change_wall < dayhour) || (time_to_change_wall >= nighthour)) { where = "night"; } else { where = "day"; }
	
	// ADJUST THE HOURLY FORECAST FOR THE RIGHT SUNSET/SUNRISE TIME
	for (i=0; i < 12; i++) {
		if ((parseInt(obj.time24hour[i].split(':')[0]) <(dayhour)) || (parseInt(obj.time24hour[i].split(':')[0]) >= (nighthour))) {
			obj.hwhere[i] = "night";
			} else {
			obj.hwhere[i] = "day";
		}
	}
	
	// CONVERSIONS
	if (obj.unitsspeed == "mph") {
		var convertS = 0.621371; //kilometers per hour to miles per hour
	} else {
		var convertS = 1;
	}
	
	if (obj.unitsdistance == "mile") {
		var convertD = 0.621371; //kilometers to miles
		var convertM = 0.03937007874; //millimeters to inches
		var convertF = 1;
		var visibilityunit = "miles";
		var measureunit = "in.";
		var feetunit = "ft";
	} else {
		var convertD = 1;
		var convertM = 1;
		var convertF = 3.2808; //feet to meters - for WU elevation which only comes in feet from feed
		var visibilityunit = "km";
		var measureunit = "mm";
		var feetunit = "m";
	}

	
	if (obj.unitspressure == "InHg") {
		var convertP = 33.8638864; //millibars to Inches of Mercury
		var pressureunit = "InHg";
	} else {
		var convertP = 1;
		var pressureunit = "mb";
	}

	switch(mainInfo) {
		case "ACCU":
			obj.description = '<span style= color:#B6A1Af>' + obj.accuDesc + '</span>';
			obj.high[0] = '<span style= color:#B6A1Af>' + obj.accuHigh + '</span>';
			obj.low[0] = '<span style= color:#B6A1Af>' + obj.accuLow + '</span>';
			obj.temp = obj.accuTemp;
			document.getElementById("temp").style.color = "#B6A1Af";
		break;
		case "YAHOO":
			obj.description = '<span style= color:#8B776C>' + obj.yahooDesc + '</span>';
			obj.high[0] = '<span style= color:#8B776C>' + obj.yahooHigh + '</span>';
			obj.low[0] = '<span style= color:#8B776C>' + obj.yahooLow + '</span>';
			obj.temp = obj.yahooTemp;
			document.getElementById("temp").style.color = "#8B776C";
		break;
		case "FIO":
			obj.description = '<span style= color:#F1B39E>' + obj.fioDesc + '</span>';
			obj.high[0] = '<span style= color:#F1B39E>' + obj.fioHigh + '</span>';
			obj.low[0] = '<span style= color:#F1B39E>' + obj.fioLow + '</span>';
			obj.temp = obj.fioTemp;
			document.getElementById("temp").style.color = "#F1B39E";
		break;
		case "WU":
			obj.description = '<span style= color:#768A95>' + obj.wuDesc + '</span>';
			obj.high[0] = '<span style= color:#768A95>' + obj.wuHigh + '</span>';
			obj.low[0] = '<span style= color:#768A95>' + obj.wuLow + '</span>';
			obj.temp = obj.wuTemp;
			document.getElementById("temp").style.color = "#";
		break;
		case "DEFAULT":
		break;
	}
	document.getElementById("visibility").innerHTML = visibilitytext + Math.round(obj.visibility*convertD) + " " + visibilityunit;
	
	if (pressureunit == "InHg"){
		document.getElementById("pressure").innerHTML = pressuretext + (obj.pressure/convertP).toFixed(2) + " " + pressureunit;
	} else {
		document.getElementById("pressure").innerHTML = pressuretext + Math.round(obj.pressure/convertP) + " " + pressureunit;
	}
	
	document.getElementById("humidity").innerHTML = humiditytext + obj.humidity + "%";
	document.getElementById("wind").innerHTML = windtext + Math.round(obj.windspeed*convertS) + " " + obj.unitsspeed + "-" + obj.cardinal;	    
	
	if (obj.rising == 0) document.getElementById('rising').innerHTML= "&larr;&rarr;";
	if (obj.rising == 1) document.getElementById('rising').innerHTML= "&uarr;";
	if (obj.rising == 2) document.getElementById('rising').innerHTML= "&darr;";
			
	// WEATHER UNDERGROUND INFORMATION 
	document.getElementById("wuCity").innerHTML = '<span style= color:#81989D>' + "City: " + '</span>' + obj.wuCity;
	document.getElementById("wuForecast").innerHTML = '<span style= color:#81989D>' + "Forecast: " + '</span>' + obj.wuForecast;
	document.getElementById("wuForecastMetric").innerHTML = '<span style= color:#81989D>' + "Forecast Metric: " + '</span>' + obj.wuForecastMetric;
	document.getElementById("wuWeatherStation").innerHTML = '<span style= color:#81989D>' + "Weather Station: " + '</span>' + obj.wuWeatherStation;
	document.getElementById("wuElevation").innerHTML = '<span style= color:#81989D>' + "Elevation: " + '</span>' + Math.round(obj.wuElevation*convertF) + " " + feetunit;
	document.getElementById("wuWindText").innerHTML = '<span style= color:#81989D>' + "Wind Text: " + '</span>' + obj.wuWindText;
	if (obj.celsius == "NO") {
		document.getElementById("wuSumm").innerHTML = '<span style= color:#81989D>' + "<BR>Daily/Nightly Summaries: " + '</span>' + "<BR>" + '<span style= color:#97AAAE>' + obj.dayname[0] + ' night' + '</span>' + "- " + obj.nightWuSumm[0]+ "<BR>" + '<span style= color:#97AAAE>' + obj.dayname[1] + '</span>' + "- " +
		obj.dayWuSumm[1] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[1] + ' night' + '</span>' + "- " +
		obj.nightWuSumm[1] + "<BR>" + '<span style= color:#97AAAE>' + obj.dayname[2] + '</span>' + "- " +
		obj.dayWuSumm[2] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[2] + ' night' + '</span>' + "- " +
		obj.nightWuSumm[2] /*+ "<BR>" + '<span style= color:#97AAAE>' + obj.dayname[3] + '</span>' + "- " +
		obj.dayWuSumm[3] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[3] + ' night' + '</span>' + "- " +
		obj.nightWuSumm[3] + "<BR>" + '<span style= color:#97AAAE>' + obj.dayname[4] + '</span>' + "- " +
		obj.dayWuSumm[4] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[4] + ' night' + '</span>' + "- " +
		obj.nightWuSumm[4] + "<BR>" + '<span style= color:#97AAAE>' + obj.dayname[5] + '</span>' + "- " +
		obj.dayWuSumm[5] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[5] + ' night' + '</span>' + "- " +
		obj.nightWuSumm[5] + "<BR>" + '<span style= color:#97AAAE>' + obj.dayname[6] + '</span>' + "- " +
		obj.dayWuSumm[6] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[6] + ' night' + '</span>' + "- " +
		obj.nightWuSumm[6] + "<BR>" + '<span style= color:#97AAAE>' + obj.dayname[7] + '</span>' + "- " +
		obj.dayWuSumm[7] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[7] + ' night' + '</span>' + "- " +
		obj.nightWuSumm[7] + "<BR>" + '<span style= color:#97AAAE>' + obj.dayname[8] + '</span>' + "- " +
		obj.dayWuSumm[8] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[8] + ' night' + '</span>' + "- " +
		obj.nightWuSumm[8] + "<BR>" + '<span style= color:#97AAAE>' + obj.dayname[9] + '</span>' + "- " +
		obj.dayWuSumm[9] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[9] + ' night' + '</span>' + "- " +
		obj.nightWuSumm[9]*/ ; // ^^ up to 9 forecast days/night of summary available if you want ^^
	} else {
		document.getElementById("wuSumm").innerHTML = '<span style= color:#81989D>' + "<BR>Daily/Nightly Summaries: " + '</span>' + "<BR>" + '<span style= color:#97AAAE>' + obj.dayname[0] + ' night' + '</span>' + "- " + obj.nightWuSummMetric[0] + "<BR>" + '<span style= color:#97AAAE>' + obj.dayname[1] + '</span>' + "- " + obj.dayWuSummMetric[1] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[1] + ' night' + '</span>' + "- " +
		obj.nightWuSummMetric[1]  + "<BR>" + '<span style= color:#97AAAE>' + obj.dayname[2] + '</span>' + "- " +
		obj.dayWuSummMetric[2] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[2] + ' night' + '</span>' + "- " +
		obj.nightWuSummMetric[2]/* + "<BR>" + '<span style= color:#97AAAE>' + obj.dayname[3] + '</span>' + "- " +
		obj.dayWuSummMetric[3] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[3] + ' night' + '</span>' + "- " +
		obj.nightWuSummMetric[3] + "<BR>" + '<span style= color:#97AAAE>' + obj.dayname[4] + '</span>' + "- " +
		obj.dayWuSummMetric[4] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[4] + ' night' + '</span>' + "- " +
		obj.nightWuSummMetric[4] + "<BR>" + '<span style= color:#97AAAE>' + obj.dayname[5] + '</span>' + "- " +
		obj.dayWuSummMetric[5] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[5] + ' night' + '</span>' + "- " +
		obj.nightWuSummMetric[5] + "<BR>" + '<span style= color:#97AAAE>' + obj.dayname[6] + '</span>' + "- " +
		obj.dayWuSummMetric[6] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[6] + ' night' + '</span>' + "- " +
		obj.nightWuSummMetric[6]+ "<BR>" + '<span style= color:#97AAAE>' + obj.dayname[7] + '</span>' + "- " +
		obj.dayWuSummMetric[7] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[7] + ' night' + '</span>' + "- " +
		obj.nightWuSummMetric[7] + "<BR>" + '<span style= color:#97AAAE>' + obj.dayname[8] + '</span>' + "- " +
		obj.dayWuSummMetric[8] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[8] + ' night' + '</span>' + "- " +
		obj.nightWuSummMetric[8] + "<BR>" + '<span style= color:#97AAAE>' + obj.dayname[9] + '</span>' + "- " +
		obj.dayWuSummMetric[9] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[9] + ' night' + '</span>' + "- " +
		obj.nightWuSummMetric[9] */ ; // ^^ up to 9 forecast days/night of summary available if you want ^^
	}
	
	// FORECASTIO INFORMATION
	document.getElementById("fioAPICalls").innerHTML = '<span style= color:#81989D>' + "API Calls Today: " + '</span>' + obj.fioAPICalls;
	document.getElementById("fioCloudCover").innerHTML = '<span style= color:#81989D>' + "Cloud Cover: " + '</span>' + Math.round(obj.fioCloudCover)+"%";
	document.getElementById("fioOzone").innerHTML = '<span style= color:#81989D>' + "Ozone: " + '</span>' + obj.fioOzone + " DU";
	document.getElementById("fioStormDistance").innerHTML = '<span style= color:#81989D>' + "Storm Distance: " + '</span>' + Math.round(obj.fioStormDistance*convertD) + " " + visibilityunit;
	document.getElementById("fioMinuteSummary").innerHTML = '<span style= color:#81989D>' + "Hour Summary: " + '</span>' + obj.fioMinuteSummary;
	document.getElementById("fioHourlySummary").innerHTML = '<span style= color:#81989D>' + "Day Summary: " + '</span>' + obj.fioHourlySummary;
	document.getElementById("fioDailySummary").innerHTML = '<span style= color:#81989D>' + "Week Summary: " + '</span>' + obj.fioDailySummary;
	document.getElementById("fioPrecipIntensity").innerHTML = '<span style= color:#81989D>' + "Precip. Intensity: " + '</span>' + Math.round(obj.fioPrecipIntensity*convertM*100)/100 + " " + measureunit + "/hour";
	document.getElementById("fioStormBearing").innerHTML = '<span style= color:#81989D>' + "Storm Bearing: " + '</span>' + obj.fioStormBearing + "&#176;";
	document.getElementById("fioSumm").innerHTML = '<span style= color:#81989D>' + "<BR>Daily Summaries: " + '</span>' + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[1] + '</span>' + "- " +
	obj.dayFioSumm[1] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[2] + '</span>' + "- " +
	obj.dayFioSumm[2] /* + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[3] + '</span>' + "- " + 
	obj.dayFioSumm[3] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[4] + '</span>' + "- " + 
	obj.dayFioSumm[4]+ "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[5] + '</span>' + "- " + 
	obj.dayFioSumm[5]+ "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[6] + '</span>' + "- " + 
	obj.dayFioSumm[6]+ "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[7] + '</span>' + "- " + 
	obj.dayFioSumm[7] */ ; // ^^ up to 7 forecast days of summary available if you want ^^
	
	//ACCUWEATHER INFORMATION
	document.getElementById("accuUV").innerHTML = '<span style= color:#81989D>' + "UV Index: " + '</span>' + obj.accuUV;
	document.getElementById("accuCity").innerHTML = '<span style= color:#81989D>' + "City: " + '</span>' + obj.accuCity;
	document.getElementById("accuPrecip").innerHTML = '<span style= color:#81989D>' + "Current Precip: " + '</span>' + Math.round(obj.accuPrecip * convertM * 100)/100 + " " + measureunit;
	document.getElementById("accuRain").innerHTML = '<span style= color:#81989D>' + "Forecasted Rain: " + '</span>' + Math.round(obj.accuRain[0] * convertM * 100)/100 + " " + measureunit;
	document.getElementById("accuSnow").innerHTML = '<span style= color:#81989D>' + "Forecasted Snow: " + '</span>' + Math.round(obj.accuSnow[0] * convertM * 100)/100 + " " + measureunit;
	document.getElementById("accuTStormProb").innerHTML = '<span style= color:#81989D>' + "Thunderstorm Chance: " + '</span>' + obj.accuTStormProb[0] + "%";
	document.getElementById("accuShortSumm").innerHTML = '<span style= color:#81989D>' + "Short Summary: " + '</span>' + obj.accuShortSumm;
	document.getElementById("accuLongSumm").innerHTML = '<span style= color:#81989D>' + "Long Summary: " + '</span>' + obj.accuLongSumm;
	document.getElementById("accuAirQuality_Type").innerHTML = '<span style= color:#81989D>' + "Air Quality [Type]: " + '</span>' + obj.accuAirQuality + " [" + obj.accuAirQualityType + "]";
	document.getElementById("accuWeed").innerHTML = '<span style= color:#81989D>' + "Weed Pollen Count: " + '</span>' + obj.accuWeeds;
	document.getElementById("accuGrass").innerHTML = '<span style= color:#81989D>' + "Grass Pollen Count: " + '</span>' + obj.accuGrass;
	document.getElementById("accuTree").innerHTML = '<span style= color:#81989D>' + "Tree Pollen Count: " + '</span>' + obj.accuTree;
	document.getElementById("accuMold").innerHTML = '<span style= color:#81989D>' + "Mold Pollen Count: " + '</span>' + obj.accuMold;
	document.getElementById("accuMercury").innerHTML = '<span style= color:#81989D>' + "Mercury Rise/Set: " + '</span>' + obj.accuMercury;
	document.getElementById("accuVenus").innerHTML = '<span style= color:#81989D>' + "Venus Rise/Set: " + '</span>' + obj.accuVenus;
	document.getElementById("accuMars").innerHTML = '<span style= color:#81989D>' + "Mars Rise/Set: " + '</span>' + obj.accuMars;
	document.getElementById("accuJupiter").innerHTML = '<span style= color:#81989D>' + "Jupiter Rise/Set: " + '</span>' + obj.accuJupiter;
	document.getElementById("accuSaturn").innerHTML = '<span style= color:#81989D>' + "Saturn Rise/Set: " + '</span>' + obj.accuSaturn;
	document.getElementById("accuUranus").innerHTML = '<span style= color:#81989D>' + "Uranus Rise/Set: " + '</span>' + obj.accuUranus;
	document.getElementById("accuNeptune").innerHTML = '<span style= color:#81989D>' + "Neptune Rise/Set: " + '</span>' + obj.accuNeptune;
	
	document.getElementById("accuDayShortSumm").innerHTML = '<span style= color:#81989D>' + "<BR>Daily Short Summaries: " + '</span>' + "<BR>" + '<span style= color:#97AAAE>'+  " " +obj.dayname[1] + '</span>' + "- " + 
	obj.dayAccuShortSumm[1] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[2] + '</span>' + "- " + 
	obj.dayAccuShortSumm[2] /* + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[3] + '</span>' + "- " + 
	obj.dayAccuShortSumm[3] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[4] + '</span>' + "- " + 
	obj.dayAccuShortSumm[4] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[5] + '</span>' + "- " + 
	obj.dayAccuShortSumm[5] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[6] + '</span>' + "- " + 
	obj.dayAccuShortSumm[6] */ ; // ^^ up to 6 forecast days of short summary available if you want ^^
	
	document.getElementById("accuDayLongSumm").innerHTML = '<span style= color:#81989D>' + "<BR>Daily Long Summaries: " + '</span>' + "<BR>" + '<span style= color:#97AAAE>'+  " " +obj.dayname[1] + '</span>' + "- " + 
	obj.dayAccuLongSumm[1] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[2] + '</span>' + "- " + 
	obj.dayAccuLongSumm[2] /* + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[3] + '</span>' + "- " + 
	obj.dayAccuLongSumm[3] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[4] + '</span>' + "- " + 
	obj.dayAccuLongSumm[4] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[5] + '</span>' + "- " + 
	obj.dayAccuLongSumm[5] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[6] + '</span>' + "- " + 
	obj.dayAccuLongSumm[6] */ ;  // ^^ up to 6 forecast days of long summary available if you want ^^
	
	// YAHOO INFORMATION
	document.getElementById("yCity").innerHTML = '<span style= color:#81989D>' + "City: " + '</span>' + obj.yCity;
	document.getElementById("yNeigh").innerHTML = '<span style= color:#81989D>' + "Neighborhood: " + '</span>' + obj.yNeigh;
	document.getElementById("ySumm").innerHTML = '<span style= color:#81989D>' + "<BR>Daily Forecasts: " + '</span>' + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[1] + '</span>' + "- " +
	obj.ySumm[1] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[2] + '</span>' + "- " + 
	obj.ySumm[2] /* + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[3] + '</span>' + "- " + 
	obj.ySumm[3] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[4] + '</span>' + "- " + 
	obj.ySumm[4] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[5] + '</span>' + "- " + 
	obj.ySumm[5] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[6] + '</span>' + "- " + 
	obj.ySumm[6] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[7] + '</span>' + "- " + 
	obj.ySumm[7] + "<BR>" + '<span style= color:#97AAAE>'+ obj.dayname[1] + '</span>' + "- " + 
	obj.ySumm[8] */ ; // ^^ up to 8 forecast days of description available if you want ^^
	
	// GOOGLE INFORMATION 
	document.getElementById("gCity").innerHTML = '<span style= color:#81989D>' + "City: " + '</span>' + obj.gCity;
	document.getElementById("gNeigh").innerHTML = '<span style= color:#81989D>' + "Neighborhood: " + '</span>' + obj.gNeigh;
	document.getElementById("gPlace").innerHTML = '<span style= color:#81989D>' + "Place: " + '</span>' + obj.gPlace;
	document.getElementById("gTrain").innerHTML = '<span style= color:#81989D>' + "Train/Bus: " + '</span>' + obj.gTrain + obj.gBus;
	document.getElementById("gNeigh2").innerHTML = '<span style= color:#81989D>' + "Neigh2: " + '</span>' + obj.gNeigh2;
	document.getElementById("gNeigh3").innerHTML = '<span style= color:#81989D>' + "Neigh3: " + '</span>' + obj.gNeigh3;
	document.getElementById("gPostalSuffix").innerHTML = '<span style= color:#81989D>' + "Postal: " + '</span>' + obj.gPostal +'<span style= color:#81989D>' + "	Suffix: " + '</span>' +obj.gPostalSuffix;
	document.getElementById("gAddress").innerHTML = '<span style= color:#81989D>' + "Address: " + '</span>' + obj.gHouse + " " + obj.gStreet;
	document.getElementById("gCounty").innerHTML = '<span style= color:#81989D>' + "County: " + '</span>' + obj.gCounty;
	document.getElementById("gState").innerHTML = '<span style= color:#81989D>' + "State: " + '</span>' + obj.gState + " [" + obj.gStateCode + "]";
	document.getElementById("gCountry").innerHTML = '<span style= color:#81989D>' + "Country: " + '</span>' + obj.gCountry + " [" + obj.gCountryCode + "]";
	document.getElementById("gFullAddr0").innerHTML = '<span style= color:#81989D>' + "FormAddr0: " + '</span>' + obj.gFullAddr0;
	document.getElementById("gFullAddr1").innerHTML = '<span style= color:#81989D>' + "FormAddr1: " + '</span>' + obj.gFullAddr1;
	document.getElementById("gFullAddr2").innerHTML = '<span style= color:#81989D>' + "FormAddr2: " + '</span>' + obj.gFullAddr2;
	document.getElementById("gFullAddr3").innerHTML = '<span style= color:#81989D>' + "FormAddr3: " + '</span>' + obj.gFullAddr3;
	document.getElementById("gCoordinates").innerHTML = '<span style= color:#81989D>' + "Coordinates: " + '</span>' + obj.gCoordinates + "<BR><BR>";
	
	// MAIN WEATHER INFORMATION
	document.getElementById("city").innerHTML = cityname;
	document.getElementById("state").innerHTML = obj.state;
	document.getElementById("temp").innerHTML = Math.round(obj.temp) + "&#176;";
	document.getElementById("RealFeel").innerHTML = feelsliketext + obj.RealFeel + "&#176;";
	document.getElementById("highlowtemp").innerHTML = hightext + obj.high[0] + "\&#176" + " / " + lowtext + obj.low[0]  + "\&#176";
	document.getElementById("CurrentConditionIcon").src = "Icon Sets/"+iconSet+"/"+AdjustIcon(obj.icon, where)+".png";
	/***__Remove the '//' from these next 2 lines for proper sizing of Current Condition Icon on iPad__***/
	//document.getElementById("CurrentConditionIcon").style.height = Math.round(screen.height*0.1)+"px";
	//document.getElementById("CurrentConditionIcon").style.width = Math.round(screen.height*0.1)+"px";
	
	if ((lang == "am") || (lang == "en")) { 
		document.getElementById("desc").innerHTML = obj.description;
	} else {
		if ((obj.icon == 32) && (where == "night")) { document.getElementById("desc").innerHTML = WeatherDesc[31]; }
		else if ((obj.icon == 34) && (where == "night")) { document.getElementById("desc").innerHTML = WeatherDesc[33]; }
		else { document.getElementById("desc").innerHTML = WeatherDesc[obj.icon]; }
	}
	document.getElementById("sunrise").innerHTML = sunrisetext + " - " + sunrise;
	document.getElementById("sunset").innerHTML = sunsettext + " - " + sunset;
	document.getElementById("MoonIcon").style.height = Math.round(screen.height*0.05)+"px";
	document.getElementById("MoonIcon").style.width = Math.round(screen.height*0.05)+"px";
	document.getElementById("MoonIcon").src = "Icon Sets/Moon/"+obj.moonphase+".png";
	document.getElementById("moonphase").innerHTML = MoonDesc[obj.moonphase];

// HOURLY FORECAST
	for (var i=0; i < 12; i++) {
		if ((parseInt(obj.time24hour[i].split(':')[0]) < dayhour) || (parseInt(obj.time24hour[i].split(':')[0]) >= nighthour)) {
			obj.hwhere[i] = "night";
		} else {
			obj.hwhere[i] = "day";
		}
	}

    for (var i=0; i < 12; i++) {
	$("#Hour" + i).html(TwelveHourForecast(obj.time24hour[i]));
	$("#Hpop" + i).html(obj.hpop[i] + "%");
	$("#Htemp" + i).html(obj.htemp[i]);
	$("#Hicon" + i).attr("src", "Icon Sets/"+iconSet+"/" + AdjustIcon(obj.hcode[i], obj.hwhere[i]) + ".png");
	}

	for (var i = 0; i<12; i++) {
	document.getElementById("Hicon" + i).style.left = 3 +  8.333*i + "%";
	document.getElementById("Hpop" + i).style.left = 2 +  8.333*i + "%";
	document.getElementById("Hour" + i).style.left = 2.5 +	8.333*i + "%";
	document.getElementById("Htemp" + i).style.left = 2 +  8.333*i + "%";
	/***__Remove the '//' from these next 2 lines for proper sizing of Current Condition Icon on iPad__***/
	//document.getElementById("Hicon" + i).style.height = Math.round(screen.height*0.06)+"px";
	//document.getElementById("Hicon" + i).style.width = Math.round(screen.height*0.06)+"px";
	}
	
	// DAILY FORECAST
	var numberOfDays = numberOfForcastDays -1 +2;
	for (var i=1; i < numberOfDays; i++) { /* TO CHANGE NUMBER OF FORECAST DAYS, CHANGE THE "6" VALUE */
		$("#Day" + i).removeClass();
		$("#Day" + i).html(days[obj.dayofweek[i]-1].substring(0,3));
		$("#Day" + i + "Icon").attr("src", "Icon Sets/" + iconSet + "/" + AdjustIcon(obj.code[i], "day") + ".png");
		$("#Day" + i + "HiLo").html(obj.high[i] +  " / " + obj.low[i]); 	
		
	}
	for (var i = 1; i<6; i++) {
		document.getElementById("Day" + i + "Icon").style.left = 10.5 +  17.5*(i-1) + "%";
		document.getElementById("Day" + i).style.left = 7.8 +  17.5*(i-1) + "%";
		document.getElementById("Day" + i + "HiLo").style.left = 8 +  17.5*(i-1) + "%";
		/***__Remove the '//' from these next 2 lines for proper sizing of Current Condition Icon on iPad__***/
		//document.getElementById("Day" + i + "Icon").style.height = Math.round(screen.height*0.06)+"px"; 		
		//document.getElementById("Day" + i + "Icon").style.width = Math.round(screen.height*0.06)+"px";
	}
	
	// WALLPAPER OPTIONS
	switch (Wallpaper_options) {
		case "daynightwalls":
			document.getElementById("Wallpapers").src = "Images/Wallpapers/DayNight/" + where + ".jpg"
		break;
		case "userwall":
			document.getElementById("Wallpapers").src = "Images/Wallpapers/userwall/user.jpg"
	 	break;
	 	case "weatherwalls":
		document.getElementById("Wallpapers").src = "Images/Wallpapers/Weather/" + Conditions[obj.icon] + where + ".jpg";
		break;
		case "none":
			document.getElementById("Wallpapers").style.display = "none";
		break;
	}

} //closes dealWithWeather Function

function updateClock() {
	var currentTime = new Date();
	var currentHours = currentTime.getHours();
	var currentMinutes = currentTime.getMinutes() < 10 ? '0' + currentTime.getMinutes() : currentTime.getMinutes();
	var currentSeconds = currentTime.getSeconds() < 10 ? '0' + currentTime.getSeconds() : currentTime.getSeconds();
	var currentDate = currentTime.getDate() < 10 ? '' + currentTime.getDate() : currentTime.getDate();
	time_to_change_wall = currentHours + currentMinutes/60;
	timeOfDay = ( currentHours < 12 ) ? "AM" : "PM";

	if (ampm == false) {
		timeOfDay = "";
		currentHours = ( currentHours < 10 ? "0" : "" ) + currentHours;
		currentTimeString = currentHours + ":" + currentMinutes;
	} else {
		currentHours = ( currentHours > 12 ) ? currentHours - 12 : currentHours;
//		currentHours = ( currentHours < 10 ? "0" : "" ) + currentHours;
		currentHours = ( currentHours == 0 ) ? 12 : currentHours;
//		currentTimeString = currentHours + ":" + currentMinutes + " " + timeOfDay;
	}

	document.getElementById("clock").innerHTML = currentHours + ":" + currentMinutes + "." + timeOfDay;
	document.getElementById("calendar").innerHTML = days[currentTime.getDay()] + "." + currentDate + "." + months[currentTime.getMonth()];
	document.getElementById("hours").innerHTML = currentHours;
	document.getElementById("minutes").innerHTML = currentMinutes;
	document.getElementById("seconds").innerHTML = currentSeconds;
	document.getElementById("ampm").innerHTML = timeOfDay;
	document.getElementById("month").innerHTML = months[currentTime.getMonth()];
	document.getElementById("weekday").innerHTML = days[currentTime.getDay()];
	document.getElementById("date").innerHTML = currentDate;
			
	// DAY OR NIGHT CHANGE
	if (dayhour != null) {
		if ((time_to_change_wall < dayhour) || (time_to_change_wall >= nighthour)) { var whereTmp = "night";	} else { var whereTmp = "day"; }
		if (whereTmp != where) { dealWithWeather(obj); } // Refresh the weather for day/night condition.
	}
}

function updateWeather() {
	if (iOS == false) { var url = "widgetweather.xml" } else { var url =  "file:///private/var/mobile/Documents/widgetweather.xml"; }
	
	jQuery.get(url, function(data) {
		
		obj.updatetimestring = $(data).find('updatetimestring').text();

		if (obj.updatetimestring == "") {
			d=new Date();
			var year=d.getFullYear();
			var month=d.getMonth();
			month =month+1; //month are displayed from 0 to 11, hence the +1
			var day=d.getDate();
			var hour=d.getHours();
			var minute=d.getMinutes();
			var second=d.getSeconds();
			var timeOfDay = ( hour < 12 ) ? "AM" : "PM";
			if (hour>12) hour=hour-12;
			if (hour<10) hour="0"+hour;
			if (minute<10) minute="0"+minute;
			if (second<10) second="0"+second;
			if (month<10) month="0"+month;
			if (day<10) day="0"+day;
			obj.updatetimestring =(year+"-"+month+"-"+day+" "+hour+":"+minute+":"+second+" "+timeOfDay);
		}		
		
		if (updateFileTimer != obj.updatetimestring) {
			obj.high = new Array;
			obj.low  = new Array;
			obj.code = new Array;
			obj.daynumber = new Array;
			obj.dayofweek = new Array;
			obj.dayname = new Array;
			obj.time24hour = new Array;
			obj.htemp = new Array;
			obj.hcode = new Array;
			obj.hpop = new Array;
			obj.hwhere = new Array;
			obj.accuTStormProb = new Array;
			obj.dayWuSumm = new Array;
			obj.dayWuSummMetric = new Array;
			obj.nightWuSumm = new Array;
			obj.nightWuSummMetric = new Array;
			obj.dayFioSumm = new Array;
			obj.dayAccuShortSumm = new Array;
			obj.dayAccuLongSumm = new Array;
			obj.ySumm = new Array;
			obj.accuRain = new Array;
			obj.accuSnow = new Array;
			
		
			$(data).find('currentcondition').each( function() {
				obj.city =$(this).find('city').text();
				obj.extraLocCity = $(this).find('extraLocCity').text();
				obj.extraLocNeighborhood = $(this).find('extraLocNeighborhood').text();
				obj.extraLocCounty = $(this).find('extraLocCounty').text();
				obj.extraLocLine1 = $(this).find('extraLocLine1').text();
				obj.state =$(this).find('state').text();
				obj.country =$(this).find('extraLocCountry').text();
				obj.countrycode =$(this).find('extraLocCountryCode').text();
				obj.statecode =$(this).find('extraLocStateCode').text();
				obj.locationid = $(this).find('locationid').text();	
				obj.temp = $(this).find('temp').text(); 
				obj.icon = $(this).find('code').text();
				obj.description = $(this).find('description').text();
				obj.observationtime = $(this).find('observationtime').text();
				obj.sunset = $(this).find('sunsettime').text();
				obj.sunrise = $(this).find('sunrisetime').text();
				obj.tempUnit = $(this).find('celsius').text();
				obj.moonphase = $(this).find('moonphase').text()*1;
				obj.pressure = $(this).find('pressure').text();
				obj.humidity = $(this).find('humidity').text(); 
				obj.rising = $(this).find('rising').text()*1;		
				obj.visibility = $(this).find('visibility').text();
				obj.RealFeel = $(this).find('chill').text();
				obj.cardinal = $(this).find('cardinal').text();
				obj.direction = $(this).find('direction').text()*1;
				obj.windspeed = $(this).find('speed').text()*1;
				obj.unitsdistance = $(this).find('unitsdistance').text();
				obj.unitspressure = $(this).find('unitspressure').text();
				obj.unitsspeed = $(this).find('unitsspeed').text();
				obj.unitstemperature = $(this).find('unitstemperature').text();
				obj.wuForecast = $(this).find('wuForecast').text();
				obj.wuForecastMetric = $(this).find('wuForecastMetric').text();
				obj.wuWeatherStation = $(this).find('wuWeatherStation').text();
				obj.wuElevation = $(this).find('wuElevation').text().split(" ")[0];
				obj.wuCity = $(this).find('wuCity').text();
				obj.wuWindText = $(this).find('wuWindText').text();
				obj.celsius = $(this).find('celsius').text();
				obj.fioAPICalls = $(this).find('fioAPICalls').text();
				obj.fioCloudCover = $(this).find('fioCloudCover').text()*100;
				obj.fioOzone = $(this).find('fioOzone').text()*1;
				obj.fioStormDistance = $(this).find('fioStormDistance').text()*1;
				obj.fioMinuteSummary = $(this).find('fioMinuteSummary').text();
				obj.fioHourlySummary = $(this).find('fioHourlySummary').text();
				obj.fioDailySummary = $(this).find('fioDailySummary').text();
				obj.fioPrecipIntensity = $(this).find('fioPrecipIntensity').text();
				obj.fioStormBearing = $(this).find('fioStormBearing').text()*1;
				obj.accuUV = $(this).find('accuUV').text()*1;
				obj.accuCity = $(this).find('accuCity').text();
				obj.accuPrecip = Math.round($(this).find('accuPrecip').text()*100)/100;
				obj.accuShortSumm = $(this).find('accuShortSumm').text();
				obj.accuLongSumm = $(this).find('accuLongSumm').text();
				obj.yCity = $(this).find('yCity').text();
				obj.yNeigh = $(this).find('yNeigh').text();
			});
		
			$(data).find('googlelocation').each( function() {
				obj.gCity = $(this).find('gCity').text();
				obj.gNeigh = $(this).find('gNeigh').text();
				obj.gPlace = $(this).find('gPlace').text();
				obj.gBus = $(this).find('gBus').text();
				obj.gTrain = $(this).find('gTrain').text();
				obj.gNeigh2 = $(this).find('gNeigh2').text();
				obj.gNeigh3 = $(this).find('gNeigh3').text();
				obj.gPostal = $(this).find('gPostal').text();
				obj.gPostalSuffix = $(this).find('gPostalSuffix').text();
				obj.gHouse = $(this).find('gHouse').text();
				obj.gStreet = $(this).find('gStreet').text();
				obj.gCounty = $(this).find('gCounty').text();
				obj.gState = $(this).find('gState').text();
				obj.gStateCode = $(this).find('gStateCode').text();
				obj.gCountry = $(this).find('gCountry').text();
				obj.gCountryCode = $(this).find('gCountryCode').text();
				obj.gFullAddr0 = $(this).find('gFullAddr0').text();
				obj.gFullAddr1 = $(this).find('gFullAddr1').text();
				obj.gFullAddr2 = $(this).find('gFullAddr2').text();
				obj.gFullAddr3 = $(this).find('gFullAddr3').text();
				obj.gCoordinates = Math.round($(this).find('gLatitude').text()*1000000)/1000000 + ", " + Math.round($(this).find('gLongitude').text()*1000000)/1000000;
			});
			
			$(data).find('multicurrentcondition').each( function() {
				obj.accuDesc = $(this).find('accuDesc').text();
				obj.accuHigh = $(this).find('accuHigh').text()*1;
				obj.accuLow = $(this).find('accuLow').text()*1;
				obj.accuTemp = $(this).find('accuTemp').text()*1;
				obj.yahooDesc = $(this).find('yahooDesc').text();
				obj.yahooHigh = $(this).find('yahooHigh').text();
				obj.yahooLow = $(this).find('yahooLow').text();
				obj.yahooTemp = $(this).find('yahooTemp').text();
				obj.fioDesc = $(this).find('fioDesc').text();
				obj.fioHigh = $(this).find('fioHigh').text();
				obj.fioLow = $(this).find('fioLow').text();
				obj.fioTemp = $(this).find('fioTemp').text();
				obj.wuDesc = $(this).find('wuDesc').text();
				obj.wuHigh = $(this).find('wuHigh').text();
				obj.wuLow = $(this).find('wuLow').text();
				obj.wuTemp = $(this).find('wuTemp').text();	
			});
			
			$(data).find('environment').each( function() {
			obj.accuAirQuality = $(this).find('accuAirQuality').text();
			obj.accuAirQualityType = $(this).find('accuAirQualityType').text();
			obj.accuWeeds = $(this).find('accuWeeds').text();
			obj.accuMold = $(this).find('accuMold').text();
			obj.accuGrass = $(this).find('accuGrass').text();
			obj.accuTree = $(this).find('accuTree').text();
			obj.accuMercury = $(this).find('accuMercuryRise').text() + " / " + $(this).find('accuMercurySet').text();
			obj.accuVenus = $(this).find('accuVenusRise').text() + " / " + $(this).find('accuVenusSet').text();
			obj.accuMars = $(this).find('accuMarsRise').text() + " / " + $(this).find('accuMarsSet').text();
			obj.accuJupiter = $(this).find('accuJupiterRise').text() + " / " + $(this).find('accuJupiterSet').text();
			obj.accuSaturn = $(this).find('accuSaturnRise').text() + " / " + $(this).find('accuSaturnSet').text();
			obj.accuUranus = $(this).find('accuUranusRise').text() + " / " + $(this).find('accuUranusSet').text();
			obj.accuNeptune = $(this).find('accuNeptuneRise').text() + " / " + $(this).find('accuNeptuneSet').text();
			});	
			
			$(data).find('settings').each( function() {
				obj.timehour = $(this).find('timehour').text();
				ampm = (obj.timehour == "24h") ? false : true;	
			});
		
			var i=0;
			$(data).find('day').each( function() {
				obj.high[i] =$(this).find('high').text();
				obj.low[i] = $(this).find('low').text();
				obj.code[i] = $(this).find('code').text();	
				obj.daynumber[i] = $(this).find('daynumber').text();	
				obj.dayofweek[i] = $(this).find('dayofweek').text();
				obj.accuTStormProb[i] = $(this).find('accuTStormProb').text();
				obj.dayWuSumm[i] = $(this).find('wuSumm').text();
				obj.dayWuSummMetric[i] = $(this).find('wuSummMetric').text();
				obj.dayFioSumm[i] = $(this).find('fioSumm').text();
				obj.dayAccuShortSumm[i] = $(this).find('accuShortSumm').text();
				obj.dayAccuLongSumm[i] = $(this).find('accuLongSumm').text();
				obj.ySumm[i] = $(this).find('yahooSumm').text();
				obj.accuRain[i] = $(this).find('accuRainAmount').text();
				obj.accuSnow[i] = $(this).find('accuSnowAmount').text();
				obj.dayname[i] = $(this).find('dayofweek').text().replace("1","Sun").replace("2","Mon").replace("3","Tue").replace("4","Wed").replace("5","Thu").replace("6","Fri").replace("7","Sat");
				i++;
			});
			
			var j=0;
			$(data).find('night').each( function() {
				obj.nightWuSumm[j] = $(this).find('wuSumm').text();
				obj.nightWuSummMetric[j] = $(this).find('wuSummMetric').text();
				j++;
			});
		
			var h=0;	
			$(data).find('hour').each( function() {
			obj.htemp[h] = $(this).find('temp').text();
			obj.hcode[h] = $(this).find('code').text();
			obj.hpop[h] = Math.round($(this).find('percentprecipitation').text());	
			obj.time24hour[h] = $(this).find('time24hour').text();
			h++;
			});
			
			if (!obj.extraLocName) { obj.extraLocName = obj.gCoordinates; } //if yahoo goes down
			
			updateFileTimer = obj.updatetimestring;
			
			dealWithWeather(obj);
		}
		
	}).fail(function() {
		document.getElementById("xmlupdate").innerHTML = "No XML file !";
	});

refreshTimer = setTimeout(updateWeather, 20*1000);

} //closes updateWeather Function

// WORKAROUND FOR CORRECT ICONS IN ALL SITUATIONS AND TWELVE HOUR FORMAT* YOU NEED TO LEAVE THE DAY NIGHT FIX AND SUNRISE SUNSET INFORMATION IN SO ICONS DISPLAY. EVEN IF YOU DO NOT SHOW THEM IN A WIDGET

function AdjustIcon(icon, whereTmp) {
	switch(whereTmp) {
		case "day":
			if (icon == 27) { icon = 28; }
			if (icon == 29) { icon = 30; }	
			if (icon == 31) { icon = 32; }	
			if (icon == 33) { icon = 34; }
		break;
		case "night":
			if (icon == 28) { icon = 27; }
			if (icon == 30) { icon = 29; }	
			if (icon == 32) { icon = 31; }	
			if (icon == 34) { icon = 33; }
		break;
	}
	return icon;
}

function TwelveHourForecast(hour) {
	if (ampm == true) { 
		hour = parseInt(hour.split(':')[0]);
		var timeOfhour = ( hour < 12 ) ? "AM" : "PM";
		hour = ( hour > 12 ) ? hour - 12 : hour;
		hour = ( hour == 0 ) ? 12 : hour;
		hour = hour + " " + timeOfhour;
	}
	return hour;
}
