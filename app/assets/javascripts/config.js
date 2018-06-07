(function() {
	window.config = {
		STORES_LOCATION: "https://arcgisweb01.nus.edu.sg/arcgis/rest/services/VRPTest2/vrpData/MapServer/0",
		DEPOTS_LOCATION: "https://arcgisweb01.nus.edu.sg/arcgis/rest/services/VRPTest2/vrpData/MapServer/1",
		ROUTES_SCHEMA: "",
		VRP_GP_URL: "https://arcgisweb01.nus.edu.sg/arcgis/rest/services/VRPTest2/SGVRPTask/GPServer/SGVRPModel",

		ordersKey: "orders",
		depotsKey: "depots",
		trucksKey: "trucks",
		directionsKey: "directions",
		routesResultsKey: "routesResults",
		storesResultsKey: "storesResults",
		unassignedStopsResultsKey: "unassignedStopsResults",

		storeTemplate: { // autocasts as new PopupTemplate()
	      	title: "Order Info for store: {NAME}",
	      	content: [{
	        	type: "fields",
	        	fieldInfos: [{
	          		fieldName: "DeliveryQuantities",
	          		label: "Delivery Quantities",
	          		visible: true
		        }, {
		          	fieldName: "ServiceTime",
		          	label: "Service Time",
		          	visible: true,
		          	format: {
		            	digitSeparator: true,
		            	places: 0
		          	}
		        }, {
		          	fieldName: "defaultTimeStart",
		          	label: "Time Start",
		          	visible: true,
		          	format: {
		            	digitSeparator: true,
		            	places: 0
		          	}
		        }, {
		          	fieldName: "defaultTimeEnd",
		          	label: "Time End",
		          	visible: true,
		          	format: {
		            	digitSeparator: true,
		            	places: 0
		          	}
		        }]
	      	}],
	      	actions: [{
		        title: "Add Order",
		        id: "addOrderAction",
		        image: "/addtolist.png"
		    },
		    {
		        title: "Edit Order",
		        id: "editOrderAction",
		        image: "/editOrder.png"
		    }]
	    },

	    addedOrderSymbol: {
	        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
	        color: [226, 0, 40],
	        outline: { // autocasts as new SimpleLineSymbol()
	          	color: [255, 255, 255],
	          	width: 3
	        }
      	},

      	routeLineSymbol: {
	        type: "simple-line",  // autocasts as new SimpleLineSymbol()
	        color: [255, 0, 0],  // RGB color values as an array
	        width: 6
	    },

	    routeHighlightSymbol: {
	    	type: "simple-line",  // autocasts as new SimpleLineSymbol()
	        color: [0,255,255],  // RGB color values as an array
	        width: 4.5
	    },

	    stopPictureMarkerSymbol: {
			type: "picture-marker",  // autocasts as new PictureMarkerSymbol()
			url: "/mappin.png", //http://static.arcgis.com/images/Symbols/Shapes/YellowCircleLargeB.png",
			width: "25px",
			height: "34px"
		},

	    originPictureMarkerSymbol: {
			type: "picture-marker",  // autocasts as new PictureMarkerSymbol()
			url: "/School.png",
			width: "20px",
			height: "20px"
		},

		stopTextSymbol: {
			type: "text",  // autocasts as new TextSymbol()
			color: [255,255,255],
			text: "",
			xoffset: 0,
			yoffset: -2,
			font: {  // autocast as new Font()
				size: 6,
				family: "sans-serif",
				weight: 600
			},
			popupTemplate: {}
		},

      	depotTemplate: { // autocasts as new PopupTemplate()
	      	title: "Depot Info: {NAME}",
	      	content: [{
	        	type: "fields",
	        	fieldInfos: [{
		          	fieldName: "TimeStart",
		          	label: "Time Start",
		          	visible: true,
		          	format: {
		            	digitSeparator: true,
		            	places: 0
		          	}
		        }, {
		          	fieldName: "TimeEnd",
		          	label: "Time End",
		          	visible: true,
		          	format: {
		            	digitSeparator: true,
		            	places: 0
		          	}
		        }]
	      	}],
	      	actions: [{
		        title: "Add Depot",
		        id: "addDepotAction",
		        image: "addtolist.png"
		    },
		    {
		        title: "Edit Depot",
		        id: "editDepotAction",
		        image: "editOrder.png"
		    }]
	    },

	    Routes: {
			"displayFieldName": "",
			"fields": [
				{
					"name": "ObjectID",
					"type": "esriFieldTypeOID",
					"alias": "ObjectID"
				},
				{
					"name": "Name",
					"type": "esriFieldTypeString",
					"alias": "Name",
					"length": 128
				},
				{
					"name": "StartDepotName",
					"type": "esriFieldTypeString",
					"alias": "StartDepotName",
					"length": 128
				},
				{
					"name": "EndDepotName",
					"type": "esriFieldTypeString",
					"alias": "EndDepotName",
					"length": 128
				},
				{
					"name": "StartDepotServiceTime",
					"type": "esriFieldTypeDouble",
					"alias": "StartDepotServiceTime"
				},
				{
					"name": "EndDepotServiceTime",
					"type": "esriFieldTypeDouble",
					"alias": "EndDepotServiceTime"
				},
				{
					"name": "EarliestStartTime",
					"type": "esriFieldTypeDate",
					"alias": "EarliestStartTime",
					"length": 8
				},
				{
					"name": "LatestStartTime",
					"type": "esriFieldTypeDate",
					"alias": "LatestStartTime",
					"length": 8
				},
				{
					"name": "ArriveDepartDelay",
					"type": "esriFieldTypeDouble",
					"alias": "ArriveDepartDelay"
				},
				{
					"name": "Capacities",
					"type": "esriFieldTypeString",
					"alias": "Capacities",
					"length": 128
				},
				{
					"name": "FixedCost",
					"type": "esriFieldTypeDouble",
					"alias": "FixedCost"
				},
				{
					"name": "CostPerUnitTime",
					"type": "esriFieldTypeDouble",
					"alias": "CostPerUnitTime"
				},
				{
					"name": "CostPerUnitDistance",
					"type": "esriFieldTypeDouble",
					"alias": "CostPerUnitDistance"
				},
				{
					"name": "OvertimeStartTime",
					"type": "esriFieldTypeDouble",
					"alias": "OvertimeStartTime"
				},
				{
					"name": "CostPerUnitOvertime",
					"type": "esriFieldTypeDouble",
					"alias": "CostPerUnitOvertime"
				},
				{
					"name": "MaxOrderCount",
					"type": "esriFieldTypeInteger",
					"alias": "MaxOrderCount"
				},
				{
					"name": "MaxTotalTime",
					"type": "esriFieldTypeDouble",
					"alias": "MaxTotalTime"
				},
				{
					"name": "MaxTotalTravelTime",
					"type": "esriFieldTypeDouble",
					"alias": "MaxTotalTravelTime"
				},
				{
					"name": "MaxTotalDistance",
					"type": "esriFieldTypeDouble",
					"alias": "MaxTotalDistance"
				},
				{
					"name": "SpecialtyNames",
					"type": "esriFieldTypeString",
					"alias": "SpecialtyNames",
					"length": 1024
				},
				{
					"name": "AssignmentRule",
					"type": "esriFieldTypeInteger",
					"alias": "AssignmentRule"
				}
			],
			"features": [],
			"exceededTransferLimit": false
		},

		Orders: {
			"displayFieldName": "",
			"geometryType": "esriGeometryPoint",
			"spatialReference": {
			"wkid": 4326,
			"latestWkid": 4326
			},
			"fields": [
				{
					"name": "ObjectID",
					"type": "esriFieldTypeOID",
					"alias": "ObjectID"
				},
				{
					"name": "Name",
					"type": "esriFieldTypeString",
					"alias": "Name",
					"length": 128
				},
				{
					"name": "ServiceTime",
					"type": "esriFieldTypeDouble",
					"alias": "ServiceTime"
				},
				{
					"name": "TimeWindowStart1",
					"type": "esriFieldTypeDate",
					"alias": "TimeWindowStart1",
					"length": 8
				},
				{
					"name": "TimeWindowEnd1",
					"type": "esriFieldTypeDate",
					"alias": "TimeWindowEnd1",
					"length": 8
				},
				{
					"name": "TimeWindowStart2",
					"type": "esriFieldTypeDate",
					"alias": "TimeWindowStart2",
					"length": 8
				},
				{
					"name": "TimeWindowEnd2",
					"type": "esriFieldTypeDate",
					"alias": "TimeWindowEnd2",
					"length": 8
				},
				{
					"name": "MaxViolationTime1",
					"type": "esriFieldTypeDouble",
					"alias": "MaxViolationTime1"
				},
				{
					"name": "MaxViolationTime2",
					"type": "esriFieldTypeDouble",
					"alias": "MaxViolationTime2"
				},
				{
					"name": "InboundArriveTime",
					"type": "esriFieldTypeDate",
					"alias": "InboundArriveTime",
					"length": 8
				},
				{
					"name": "OutboundDepartTime",
					"type": "esriFieldTypeDate",
					"alias": "OutboundDepartTime",
					"length": 8
				},
				{
					"name": "DeliveryQuantities",
					"type": "esriFieldTypeString",
					"alias": "DeliveryQuantities",
					"length": 128
				},
				{
					"name": "PickupQuantities",
					"type": "esriFieldTypeString",
					"alias": "PickupQuantities",
					"length": 128
				},
				{
					"name": "Revenue",
					"type": "esriFieldTypeDouble",
					"alias": "Revenue"
				},
				{
					"name": "SpecialtyNames",
					"type": "esriFieldTypeString",
					"alias": "SpecialtyNames",
					"length": 128
				},
				{
					"name": "AssignmentRule",
					"type": "esriFieldTypeInteger",
					"alias": "AssignmentRule"
				},
				{
					"name": "RouteName",
					"type": "esriFieldTypeString",
					"alias": "RouteName",
					"length": 128
				},
				{
					"name": "Sequence",
					"type": "esriFieldTypeInteger",
					"alias": "Sequence"
				},
				{
					"name": "CurbApproach",
					"type": "esriFieldTypeInteger",
					"alias": "CurbApproach"
				}
			],
			"features": [],
			"exceededTransferLimit": false
		},
		
		Depot: {
			"displayFieldName": "",
			"geometryType": "esriGeometryPoint",
			"spatialReference": {
				"wkid": 4326,
				"latestWkid": 4326
			},
			"fields": [
				{
					"name": "ObjectID",
					"type": "esriFieldTypeOID",
					"alias": "ObjectID"
				},
				{
					"name": "Name",
					"type": "esriFieldTypeString",
					"alias": "Name",
					"length": 128
				},
				{
					"name": "TimeWindowStart1",
					"type": "esriFieldTypeDate",
					"alias": "TimeWindowStart1",
					"length": 8
				},
				{
					"name": "TimeWindowEnd1",
					"type": "esriFieldTypeDate",
					"alias": "TimeWindowEnd1",
					"length": 8
				},
				{
					"name": "TimeWindowStart2",
					"type": "esriFieldTypeDate",
					"alias": "TimeWindowStart2",
					"length": 8
				},
				{
					"name": "TimeWindowEnd2",
					"type": "esriFieldTypeDate",
					"alias": "TimeWindowEnd2",
					"length": 8
				},
				{
					"name": "CurbApproach",
					"type": "esriFieldTypeInteger",
					"alias": "CurbApproach"
				},
				{
					"name": "Bearing",
					"type": "esriFieldTypeDouble",
					"alias": "Bearing"
				},
				{
					"name": "BearingTol",
					"type": "esriFieldTypeDouble",
					"alias": "BearingTol"
				},
				{
					"name": "NavLatency",
					"type": "esriFieldTypeDouble",
					"alias": "NavLatency"
				}
			],
			"features": [],
			"exceededTransferLimit": false
		},

		Route_renewals_org: {
			"displayFieldName": "",
			"fields": [
				{
					"name": "ObjectID",
					"type": "esriFieldTypeOID",
					"alias": "ObjectID"
				},
				{
					"name": "RouteName",
					"type": "esriFieldTypeString",
					"alias": "RouteName",
					"length": 128
				},
				{
					"name": "DepotName",
					"type": "esriFieldTypeString",
					"alias": "DepotName",
					"length": 128
				},
				{
					"name": "ServiceTime",
					"type": "esriFieldTypeDouble",
					"alias": "ServiceTime"
				},
				{
					"name": "Sequences",
					"type": "esriFieldTypeString",
					"alias": "Sequences",
					"length": 128
				}
			],
			"features": [],
			"exceededTransferLimit": false
		},

		RouteRenewals: {
		    "features": [
		        {
		            "attributes": {
		                "RouteName": "Truck1",
		                "DepotName": "800 Brush St",
		                "ServiceTime": 15
		            }
		        },
		        {
		            "attributes": {
		                "RouteName": "Truck1",
		                "DepotName": "100 Old County Rd",
		                "ServiceTime": 15
		            }
		        },
		        {
		            "attributes": {
		                "RouteName": "Truck2",
		                "DepotName": "800 Brush St",
		                "ServiceTime": 15
		            }
		        },
		        {
		            "attributes": {
		                "RouteName": "Truck2",
		                "DepotName": "100 Old County Rd",
		                "ServiceTime": 15
		            }
		        }
		    ]
		},

		RouteRenewalsFeatureFormat: {
			"attributes": {
                "RouteName": "Truck1",
                "DepotName": "Sample_Warehouse",
                "ServiceTime": 15
            }
		},

		OrderFeatureJSONFormat: {
			"attributes": {
			    "OBJECTID": 1,
			    "NAME": "Store_1",
			    "DeliveryQuantities": 1706,
			    "ServiceTime": 25,
			    "TimeWindowStart1": -2209129200000,
			    "TimeWindowEnd1": -2209100400000,
			    "MaxViolationTime1": 0
		   },
		   "geometry": {
			    "x": -122.5100181819999,
			    "y": 37.772363637000069
		   }
		},

		DepotFeatureJSONFormat: {
		   	"attributes": {
		   		"OBJECTID": 1,
		    	"NAME": "Sample_Warehouse",
		    	"TimeWindowStart1": -2209132800000,
		    	"TimeWindowEnd1": -2209100400000
		   },
		   "geometry": {
		    	"x": -122.39431795899992,
		    	"y": 37.796748019000063
		   	}
		},

		RouteFeatureJSONFormat: {
			"attributes": {
			    "OBJECTID": 1,
			    "Name": "Truck_1",
			    "Description": null,
			    "StartDepotName": "Sample_Warehouse",
			    "EndDepotName": "Sample_Warehouse",
			    "StartDepotServiceTime": 60,
			    "EndDepotServiceTime": null,
			    "EarliestStartTime": -2209132800000,
			    "LatestStartTime": -2209132800000,
			    "Capacities": "15000",
			    "FixedCost": null,
			    "CostPerUnitTime": 0.20000000000000001,
			    "CostPerUnitDistance": 1.5,
			    "OvertimeStartTime": null,
			    "CostPerUnitOvertime": null,
			    "MaxOrderCount": 60,
			    "MaxTotalTime": 600,
			    "MaxTotalTravelTime": 600,
			    "MaxTotalDistance": 100,
			    "SpecialtyNames": null,
			    "AssignmentRule": 1,
			    "Shape_Length": 0
		   	}
		},

		ToastOptions: {
	        "closeButton": false,
	        "debug": false,
	        "newestOnTop": false,
	        "progressBar": false,
	        "positionClass": "toast-top-center",
	        "preventDuplicates": false,
	        "onclick": null,
	        "showDuration": 300,
	        "hideDuration": 1000,
	        "timeOut": 5000,
	        "extendedTimeOut": 1000,
	        "showEasing": "swing",
	        "hideEasing": "linear",
	        "showMethod": "fadeIn",
	        "hideMethod": "fadeOut"
	    },

	    markerSymbol: {
	        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
	        color: [226, 119, 40],
	        outline: { // autocasts as new SimpleLineSymbol()
	          color: [255, 255, 255],
	          width: 2
	        }
      	},

	    routeColorArray: [
	    	[128, 0, 128, 0.5], //PURPLE
	    	[0, 0, 128, 0.5], //NAVY
	    	[255, 0, 255, 0.5], //FUCHSIA
	    	[0, 0, 255, 0.5], //BLUE
	    	[0, 128, 128, 0.5], //TEAL
	    	[0, 128, 0, 0.5], //GREEN
	    	[128, 0, 0, 0.5], //MAROON
	    	[128, 128, 0, 0.5], //OLIVE
	    	[255, 255, 0, 0.5], //YELLOW	
	    	[255, 0, 0, 0.5], //RED
	    	[128, 128, 128, 0.5] //GRAY
	    ],

	    routeColorPaletteArray: [
	    	[170, 215, 35, .6],
	    	[255, 45, 85, .6],
	    	[88, 86, 214, .6],
	    	[0, 122, 255, .6],
	    	[255, 149, 0, .6],
	    	[183, 217, 104, 0.5],
	    	[181, 118, 173, 0.5],
	    	[224, 70, 68, 0.5],
	    	[253, 228, 127, 0.5],
	    	[124, 204, 229, 0.5],
	    	[193, 7, 141, 0.5],
	    	[104, 60, 224, 0.5],
	    	[219, 168, 87, 0.5],
	    	[216, 207, 75, 0.5],
	    	[135, 237, 40, 0.5],
	    	[209, 146, 12, 0.5],
	    	[16, 64, 186, 0.5],
	    	[209, 168, 237, 0.5],
	    	[221, 247, 150, 0.5],
	    	[181, 82, 7, 0.5],
	    	[249, 215, 134, 0.5]
	    ],

	    storeStopInfo: {
	    	"id": "",
	    	"info": {
	    		"name": ""
	    	},
	    	"geometry": {
	    		"x" : 0,
	    		"y" : 0
	    	}
	    },

	    depotStopInfo: {
	    	"id": "",
	    	"info": {
	    		"name": ""
	    	},
	    	"geometry": {
	    		"x" : 0,
	    		"y" : 0
	    	}
	    },

	    routeInfo: {
	    	"routeName" : "",
	    	"tripNo" : 0,
	    	"trips" : [] //array of tripInfo
	    },

	    tripInfo: {
	    	"id" : "",
	    	"stopName": "",
	    	"sequenceNo" : 0
	    }
	}
}).call(this);