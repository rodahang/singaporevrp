var VRPHelper = (function () {
	
	return {
		convertCSVToJson: function(csvData,isStore) {
			// console.log(csvData);
			var lines=csvData.split("\n");

	  		var result = [];

	  		var headers=lines[0].split(",");
	  		// console.log(headers,lines);

	  		for(var i=1;i<lines.length;i++){

		  		var obj = {};

		  		if (isStore) {
		  			//split .{name}
		  			//if length is > 1
		  				// split (,) then append [1]
		  		} else {
		  			var currentline=lines[i].split(",");
		  		}

		  		for(var j=0;j<headers.length;j++){
			  		obj[headers[j]] = currentline[j];
		  		}
		  		// console.log('push obj',(obj.OBJECTID == ''));
		  		if (obj.OBJECTID != '')
		  			result.push(obj);
	  		}
	  		return result;
	  		//return JSON.stringify(result); //JSON
		},

		JSONToOrderFeatureJSONArray: function(jsonOrderArr) {
			var me = this;
			var orderFeatures = [];
			jsonOrderArr.forEach(function(orderFeatureArr) {
				var orderJson = jQuery.extend(true, {}, window.config.OrderFeatureJSONFormat);
				orderJson.attributes.OBJECTID = parseInt(orderFeatureArr.OBJECTID);
				orderJson.attributes.NAME = orderFeatureArr.NAME;
				orderJson.attributes.DeliveryQuantities = parseInt(orderFeatureArr.DeliveryQuantities);
				orderJson.attributes.ServiceTime = parseInt(orderFeatureArr.ServiceTime);

				if (jsonOrderArr.RouteName != undefined) {
					orderJson.attributes.RouteName = jsonOrderArr.RouteName;
				}

				if (jsonOrderArr.Sequence != undefined) {
					orderJson.attributes.Sequence = jsonOrderArr.Sequence;
				}

				orderJson.attributes.TimeWindowStart1 = me.getTimeStamp(me.getHMSMs(orderFeatureArr.TimeWindowStart1)); //-2209129200000;//
				orderJson.attributes.TimeWindowEnd1 = me.getTimeStamp(me.getHMSMs(orderFeatureArr.TimeWindowEnd1)); // -2209100400000;//
				orderJson.attributes.MaxViolationTime1 = 0;

				if (orderFeatureArr.RouteName != undefined) {
					orderJson.attributes.RouteName = orderFeatureArr.RouteName;
				}

				if (orderFeatureArr.Sequence != undefined) {
					orderJson.attributes.Sequence = parseInt(orderFeatureArr.Sequence);
				}

				if (orderFeatureArr.AssignmentRule != undefined) {
					orderJson.attributes.AssignmentRule = parseInt(orderFeatureArr.AssignmentRule);
				}

				orderJson.geometry.x = parseFloat(orderFeatureArr.x);
				orderJson.geometry.y = parseFloat(orderFeatureArr.y);
				orderFeatures.push(orderJson);
			});
			return orderFeatures;
		}, 

		JSONToDepotFeatureJSONArray: function(jsonDepotArr) {
			var me = this;
			var depotFeatures = [];
			jsonDepotArr.forEach(function(depotFeature) {
				// console.log('depotFeature',depotFeature);
				var depotJson = jQuery.extend(true, {}, window.config.DepotFeatureJSONFormat);
				depotJson.attributes.OBJECTID = parseInt(depotFeature.OBJECTID);
				depotJson.attributes.NAME = depotFeature.NAME;
				depotJson.attributes.TimeWindowStart1 = me.getTimeStamp(me.getHMSMs(depotFeature.TimeWindowStart1)); //-2209132800000;//
				depotJson.attributes.TimeWindowEnd1 = me.getTimeStamp(me.getHMSMs(depotFeature.TimeWindowEnd1)); //-2209100400000;//

				depotJson.geometry.x = parseFloat(depotFeature.x);
				depotJson.geometry.y = parseFloat(depotFeature.y);

				depotFeatures.push(depotJson);
			});
			// console.log('depotFeatures',depotFeatures);
			return depotFeatures;
		},

		JSONToRouteFeatureJSONArray: function(jsonRouteArr) {
			var me = this;
			var routeFeatures = [];
			jsonRouteArr.forEach(function(routeJson) {
				var routeFeature = jQuery.extend(true, {}, window.config.RouteFeatureJSONFormat);
				routeFeature.attributes.OBJECTID = parseInt(routeJson.OBJECTID);
				routeFeature.attributes.Name = routeJson.Name;
				routeFeature.attributes.StartDepotServiceTime = parseInt(routeJson.StartDepotServiceTime);
				routeFeature.attributes.EarliestStartTime = me.getTimeStamp(me.getHMSMs(routeJson.EarliestStartTime)); //-2209132800000;//
				routeFeature.attributes.LatestStartTime = me.getTimeStamp(me.getHMSMs(routeJson.LatestStartTime));// -2209132800000;//
				routeFeature.attributes.Capacities = routeJson.Capacities;//parseInt(routeJson.Capacities);
				routeFeature.attributes.CostPerUnitTime = parseFloat(routeJson.CostPerUnitTime);
				routeFeature.attributes.CostPerUnitDistance = parseFloat(routeJson.CostPerUnitDistance);
				routeFeature.attributes.MaxOrderCount = parseInt(routeJson.MaxOrderCount);
				routeFeature.attributes.MaxTotalTime = parseInt(routeJson.MaxTotalTime);
				routeFeature.attributes.MaxTotalTravelTime = parseInt(routeJson.MaxTotalTravelTime);
				routeFeature.attributes.MaxTotalDistance = parseInt(routeJson.MaxTotalDistance);
				
				routeFeatures.push(routeFeature);
			});

			return routeFeatures;
		},

		getHMSMs: function(hmsms) {
			var hourMin = [];
			var time = hmsms;
			var hours = Number(time.match(/^(\d+)/)[1]);
			var minutes = Number(time.match(/:(\d+)/)[1]);
			var AMPM = time.match(/\s(.*)$/)[1];
			if(AMPM == "PM" && hours<12) hours = hours+12;
			if(AMPM == "AM" && hours==12) hours = hours-12;
			var sHours = hours.toString();
			var sMinutes = minutes.toString();
			if(hours<10) sHours = "0" + sHours;
			if(minutes<10) sMinutes = "0" + sMinutes;
			hourMin.push(sHours);
			hourMin.push(sMinutes);
			// console.log(sHours + ":" + sMinutes);
			// console.log('hourMin',hourMin);
			return hourMin;
		},

		getTimeStamp: function(hoursMinArr) {
			var currentDate = new Date();
			var month = currentDate.getUTCMonth(); //months from 1-12
			var day = currentDate.getUTCDate();
			var year = currentDate.getUTCFullYear();

			var dateTime = new Date(year, month, day, hoursMinArr[0], hoursMinArr[1], 0, 0);

			// console.log('dateTime',dateTime, dateTime.getTime());
			return dateTime.getTime();
		},

		convertTimeStampToDateTime: function(timestamp) {
			var dateToConvert = new Date(timestamp);
			return dateToConvert.toLocaleString();
		},

		convertRouteFeatureOutputToJSONArray: function(routeFeatures){
			var routeJSONArray = [];
			routeFeatures.forEach(function(routeFeature) {
				//EndTime, EndTimeUTC, StartTime, StartTimeUTC
				routeJSONArray.push(routeFeature.attributes);
			});
			return routeJSONArray;
		},

		convertStopFeatureOutputToJSONArray: function(stopFeatures) {
			var stopJSONArray = [];
			stopFeatures.forEach(function(stopFeature) {
				//ArriveTime, ArriveTimeUTC, DepartTime, DepartTimeUTC
				stopJSONArray.push(stopFeature.attributes);
			});
			return stopJSONArray;
		},

		convertDirectionFeatureOutputToText: function(directionFeatures) {
			var directionJSONArray = [];
			var routeName = '', directionText = '';
			var dirCtr = 1;

			directionFeatures.forEach(function(directionFeature) {
				//directionJSONArray.push(directionFeature.attributes);
				currentRouteName = directionFeature.attributes.RouteName;
				if (currentRouteName != routeName) {
					if (routeName != '') {
						var directionJSON = {
							truckName: routeName,
							directionText: directionText
						}
						directionJSONArray.push(directionJSON);
						directionText= '';
					}
					routeName = currentRouteName;
					//directionText += '\n\n' + currentRouteName;
					dirCtr = 1;
				}
				directionText += '\n' + dirCtr + '. ' + directionFeature.attributes.Text;
				dirCtr++;
			});

			if (routeName != '') {
				var directionJSON = {
					truckName: routeName,
					directionText: directionText
				}
				directionJSONArray.push(directionJSON);
				directionText= '';
			}

			return directionJSONArray;//directionText;
		},

		getRouteTripJSON: function(routeAttribute, storesResults) {
			console.log('getRouteTripJSON',routeAttribute, storesResults);
			var routeTrip = {};
			var routeRenewalCount = routeAttribute.RenewalCount + 1;

			var tripJson = {};
            storesResults.forEach(function(storesResult) {
                if (storesResult.attributes.RouteName == routeAttribute.Name) {
                    tripJson[storesResult.attributes.Sequence] = storesResult.attributes;
                }
            });

            var routeRenewalCtr = 0;
            var tripRR = {};
            for(var key in tripJson) {
            	if (tripJson[key].StopType == 1) {
            		
            		if (Object.keys(tripRR).length) {
            			routeRenewalCtr++;
            			if (parseFloat(tripJson[key].PickupQuantities) == 0) {
            				tripRR[key] = tripJson[key];
            			}
            			routeTrip[routeRenewalCtr] = tripRR;
            			tripRR = {};

            		}
            	}
            	tripRR[key] = tripJson[key];
            }
			//console.log('routeTrip ', routeTrip);
            return routeTrip;
		}
	};
})();