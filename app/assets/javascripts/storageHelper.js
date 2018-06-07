var VRPStorageHelper = (function () {
	var ordersInput = {}, depotsInput = {}, trucksInput = {};
	var returnRoutes = {}, returnStops = {}, returnDirections = {}, returnUnassignedStops = {};

	// private functions
	function convertCSVToJson(csvData) {
		// console.log(csvData);
		var lines=csvData.split("\n");

  		var result = [];

  		var headers=lines[0].split(",");
  		// console.log(headers,lines);

  		for(var i=1;i<lines.length;i++){

	  		var obj = {};
  			var currentline=lines[i].split(",");

	  		for(var j=0;j<headers.length;j++){
		  		obj[headers[j]] = currentline[j];
	  		}
	  		// console.log('push obj',(obj.OBJECTID == ''));
	  		if (obj.OBJECTID != '')
	  			result.push(obj);
  		}
  		return result;
	}

	function processData(vrpFile,fileName) {
		if (fileName.includes('.csv')) {
			var JSONData = convertCSVToJson(vrpFile);
			if (fileName.includes(window.config.ordersKey)) {
				// console.log(window.config.ordersKey,JSON.stringify(JSONData));
				localStorage.setItem(window.config.ordersKey, JSON.stringify(JSONData));
				showPoints();
			} else if(fileName.includes(window.config.depotsKey)) {
				// console.log(window.config.ordersKey,JSON.stringify(JSONData));
				localStorage.setItem(window.config.depotsKey, JSON.stringify(JSONData));
				showPoints();
			} else if(fileName.includes(window.config.trucksKey)) {
				// console.log(window.config.ordersKey,JSON.stringify(JSONData));
				localStorage.setItem(window.config.trucksKey, JSON.stringify(JSONData));
				showTrucksTable();
			}
		}
	}

	// public functions
	return {
		activate: function() {
			orders = {}, depots = {}, trucks = {};
		},

		storeInput: function(vrpFile) {
			console.log('vrpFile',vrpFile);
	        var fileReader = new FileReader();
	        var fileName = '';
	        // finished reading the file 
	        fileReader.onloadend = function(e) {
	            //console.log(e.target.result, file);
	            if ('name' in vrpFile) {
	                fileName = vrpFile.name;
	            }
	            var csvData = e.target.result;
	            processData(csvData, fileName);
	        };
	        fileReader.readAsText(vrpFile);
		}, 

		getDataFromKey: function(key) {
			return (localStorage.getItem(key)) ? JSON.parse(localStorage.getItem(key)) : [];
		},

		getOrdersJSONArray: function() {
			return (localStorage.getItem(window.config.ordersKey)) ? JSON.parse(localStorage.getItem(window.config.ordersKey)) : [];
		},

		getDepotsJSONArray: function() {
			return (localStorage.getItem(window.config.depotsKey)) ? JSON.parse(localStorage.getItem(window.config.depotsKey)) : [];
		},

		getTrucksJSONArray: function() {
			return (localStorage.getItem(window.config.trucksKey)) ? JSON.parse(localStorage.getItem(window.config.trucksKey)) : [];
		}
	};
})();
