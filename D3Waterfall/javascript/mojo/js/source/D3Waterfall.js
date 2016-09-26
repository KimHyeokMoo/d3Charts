(function () {
if (!mstrmojo.plugins.D3Waterfall) {
	mstrmojo.plugins.D3Waterfall = {};
}

mstrmojo.requiresCls(
	"mstrmojo.CustomVisBase",
	"mstrmojo.models.template.DataInterface"
);

var continuous = false, total = false, lineFlag = false;

function toBoolean(str) {
	if (str && str === 'true') {
		return true;
	} else {
		return false;
	}
}

mstrmojo.plugins.D3Waterfall.D3Waterfall = mstrmojo.declare(
	mstrmojo.CustomVisBase,
	null,
	{
		scriptClass: "mstrmojo.plugins.D3Waterfall.D3Waterfall",
		cssClass: "d3waterfall",
		errorMessage: "Either there is not enough data to display the visualization or the visualization configuration is incomplete.",
		errorDetails: "This visualization requires one or more attributes and one metric.",
		externalLibraries: [{url: "//d3js.org/d3.v3.min.js"}],
		useRichTooltip: false,
		reuseDOMNode: false,
		switchContinuousMode: function (continuousFlag) {
			continuous = toBoolean(continuousFlag);
		},
		showTotal: function (totalsFlag) {
			total = toBoolean(totalsFlag);
		},
		showLine: function (isLine) {
			lineFlag = toBoolean(isLine);
		},
		plot: function () {

			var ZONE_ATTRIBUTE_INDEX = 0, ZONE_METRIC_INDEX = 1;
			var is10point4 = typeof this.zonesModel.getColorByAttributes  == 'function'; // Metric only mode is supported only in 10.4
			var metricOnly = is10point4 ? this.zonesModel.getDropZones().zones[ZONE_ATTRIBUTE_INDEX].items.length==0 : false;
			var is10point2 = ! typeof this.addThresholdMenuItem == 'function'; //True if we are using MSTR 10.2

//************* Process data retreived from the API
			// Get the selected data
			var dataConfig = {hasSelection: true};
			if (!is10point2) {
				dataConfig.hasThreshold = true;
			}
			if(metricOnly){
				dataConfig.minAttribute = 0;
				dataConfig.minMetric = 1;
				this.setProperty("continuousMode", 'true');
			}

			debugger;
			var rawD = this.dataInterface.getRawData(mstrmojo.models.template.DataInterface.ENUM_RAW_DATA_FORMAT.ADV, dataConfig);


			if (!is10point2) {
				this.addThresholdMenuItem();

				this.setDefaultPropertyValues({
					continuousMode: metricOnly ? 'true' : this.getProperty("continuousMode") ? this.getProperty("continuousMode").toString() : 'true',
					showTotals: this.getProperty("showTotals") ? this.getProperty("showTotals").toString() : 'false',
					showLine: this.getProperty("showLine") ? this.getProperty("showLine").toString() : 'true',
					totalsColor: {
						fillColor: '#0064FF'
					}
				});
			}

			//to maintain persistence after save and load
			if (!is10point2) {
				if (this.getProperty("showTotals")) {
					total = toBoolean(this.getProperty("showTotals").toString());
				}
				if (this.getProperty("continuousMode")) {
					continuous = toBoolean(this.getProperty("continuousMode").toString());
				}
				if (this.getProperty("showLine")) {
					lineFlag = toBoolean(this.getProperty("showLine").toString());
				}
			}

			scrollingHeight = true;
			var quantityName = "";
			var totalsColor = is10point2 ? '#0064FF' : this.getProperty("totalsColor").fillColor.toString();
			var total_width = parseInt(this.width, 10);
			var total_height = parseInt(this.height, 10);
			var max_number_char_labels = metricOnly ?20:14;
			var max_number_bars_before_scrolling = 25;
			var yaxiswidth = 50; //if you change the formatting of the y Axis, you might need to make this value bigger.
			var margin = {top: 40, right: 30, bottom: metricOnly? 50:110, left: 40},
				width = total_width - margin.left - margin.right - 20 - yaxiswidth,// -20 is to avoid having a scrolling mode by defaut
				height = total_height - margin.top - margin.bottom - 20;// -20 is to avoid having a scrolling mode by defaut
			var colors = {positive: "#8CB400", negative: "#ff0000", total: totalsColor};
			var transitionDuration = 1;// Duration of the animations
			var me = this;
			var VIformat = this.defn.fmts;
			var percentage_witdh_path_x_axis = 0.95;


			// Enable the "use as selector" option on the visualization menu
			this.addUseAsFilterMenuItem();

//  **************************  Functions
			// Get the max metric value of a data set
			var getMaxValue = function (borders) {
				var maxValue = 0;
				for (j = 0; j < borders.length; j++) {
					if ((borders[j][0] + borders[j][1]) > maxValue) {
						maxValue = borders[j][0] + borders[j][1];
					}
				}
				return maxValue;
			};

			// Get the min metric value of a data set
			var getMinValue = function (borders) {
				var minValue = 0;
				for (j = 0; j < borders.length; j++) {
					if ((borders[j][0] + borders[j][1]) < minValue) {
						minValue = borders[j][0] + borders[j][1];
					}
				}
				return minValue;
			};

			// Create an array with the base value (where to start) and the value of the bar (the height of the bar)
			var getBarBorders = function (data) {
				var borders = [], k = 0, last = 0, minValue = 0;
				for (j = 0; j < dataS.length; j++) {
					for (i = 0; i < dataS[j].metrics.length; i++) {
						var v = 0;
						v = +dataS[j].metrics[i];
						if (total && (i == dataS[j].metrics.length - 1)) {
							v = last;
							last = 0;
						}
						borders[k++] = [last, v];
						last += v;
					}
					if (!continuous)
						last = 0;
				}
				return borders;
			};

			// Retrieve the metrics' label to be displayed on the X axis
			var genMetricsLabel = function (metrics) {
				var metricLabels = [], cut = false;
				for (i = 0; i < metrics.length; i++) {
					var length = metrics[i].length;
					cut = false;
					if (length > max_number_char_labels) {
						cut = true;
						length = max_number_char_labels;
					}
					metricLabels [i] = metrics[i].substring(0, length);
					if (cut)
						metricLabels [i] = metricLabels [i] + "..";

				}
				return metricLabels;
			};

			// Retrieve the metric values from the array of raw data
			var getMetricsValues = function (tab) {
				var metrics = [];
				totalV = 0;
				for (var j = 0; j < tab.values.length; j++) {
					metrics.push(tab.values[j]["rv"] + "");
					totalV += +tab.values[j]["rv"];
					countBars++;
				}
				if (!continuous)
					metrics.unshift("0"); // To create a spacing between the attributeName cycles
				if (total)
					metrics.push(totalV);
				return metrics;
			};

//************************** Chart Implementation

			var container1 = d3.select(this.domNode).select("div");

			if (container1.empty()) {
				container1 = d3.select(this.domNode).append("div")
					.attr("class", "yaxiscontainer")
					.style("position", "relative");
			}

			var ycontainer = d3.select(this.domNode.firstChild).select("svg");

			if (ycontainer.empty()) {
				ycontainer = d3.select(this.domNode.firstChild).append("svg")
					.attr("class", "containerY")
					.attr("width", yaxiswidth)
					.attr("height", height + margin.top + margin.bottom)
					.style("float", "left")
					.style("postition", "relative");
			}

			var container2 = d3.select(this.domNode).select("div.maincontainer");

			if (container2.empty()) {
				container2 = d3.select(this.domNode).append("div")
					.attr("class", "maincontainer")
					.style("position", "absolute");
			}

			// Get the metrics names
			var gridData = this.dataInterface;
			var colHeaders = gridData.getColHeaders(0);
			var metricsL = [];
			for (var i = 0; i < colHeaders.headers.length; i++) {
				metricsL[i] = colHeaders.getHeader(i).getName();
			}
			
			if (!continuous)
				metricsL.unshift("");// To create a spacing between the attributeName cycles
			if (total)
				metricsL.push("Total ");

			// Process the raw data into dataS to make the manipulation of the data easier while making the chart
			var countBars = 0, totalV = 0;// To count the number of bars to be displayed in the chart
			var dataS = [];

			for (var i = 0; i < rawD.children.length; i++) {
				var mMetrics = getMetricsValues(rawD.children[i]);
				dataS.push({
					attribute: {
						value: rawD.children[i]["name"],
						selector: rawD.children[i]["attributeSelector"]
					},
					valueObj: rawD.children[i].values,
					metrics: mMetrics
				});
			}

			// Retrieve for each bar the value to which the bar should start and the actual value of the bar
			var borders = getBarBorders(dataS);

			// Get the max value of the metrics. It will be used to scale the Y coordinates.
			var maxVal = 0;
			maxVal = getMaxValue(borders);

			// Get the min value of the metrics. It will be used to scale the Y coordinates.
			var minVal = 0;
			minVal = getMinValue(borders);

//************* Adapt the view with the size of the Visualization

			// Get the Y coordinate of a metric value
			var toYCoord = function (y) {
				return (y) * ( height / (maxVal + Math.abs(minVal)));
			};

			var zeroYPos = 0;
			zeroYPos = height - toYCoord(Math.abs(minVal));
			var offsetLeft = true;
			
			// If there is too much bars to be displayed directly, adapt the width of the chart and make the chart scrollable
			if (countBars > max_number_bars_before_scrolling) {
				container2.style("position", "relative");
				offsetLeft = false;
				this.domNode.lastChild.style.overflowX = "scroll";
				this.domNode.lastChild.style.overflowY = "hidden";
				total_width = total_width * (countBars / max_number_bars_before_scrolling);
				width = total_width - margin.left - margin.right;
			}

			var xAttrWidth = width / dataS.length; // Get the width of a attributeName cycle
			var xBarWidth = xAttrWidth / metricsL.length; //Get the width of a bar

			//If the width of the window is shrinking too much
			if (xBarWidth < 25) {
				xBarWidth = 25;
				xAttrWidth = xBarWidth * metricsL.length;
				this.domNode.lastChild.style.overflowX = "scroll";
				this.domNode.lastChild.style.overflowY = "hidden";
				width = xAttrWidth * dataS.length;
			}

//************* Create the axis and the chart

			// Create the scale functions the chart
			var x = d3.scale.ordinal()
				.rangeRoundBands([0, width]);
			x.domain(dataS.map(function (d) {
				return d.attribute.value;
			}));

			var y = d3.scale.linear()
				.range([height, 0]);
			y.domain([minVal, maxVal]); // Use to scale the metric values to the Y coordinates

			// Create the svg and axis if it is not existing already in the visualization
			var chart = d3.select(this.domNode.lastChild).select("svg");
			var xAxis, yAxis;
			if (chart.empty()) {
				chart = d3.select(this.domNode.lastChild).append("svg")
					.attr("class", "waterfall")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
					.on("click", function (d) {
						if (event.target.classList.contains('waterfall')) {
							me.clearSelections();
							me.endSelections();
						} else {
							return true;
						}
					})
					.append("svg:g")
					.attr("transform", "translate(" + (offsetLeft ? (yaxiswidth + 10) : 1) + "," + margin.top + ")"); // Adding 10 to yaxiswidth to account for margin.

				//Create X axis representing the values of the attributeName
				xAxis = d3.svg.axis()
					.scale(x)
					.orient("bottom");

				chart.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + ( height ) + ")")
					.call(xAxis)
					.selectAll("text")
					.attr("y", 12)
					.attr("x", 0);

				//Do grey horizontal line for more readability
				if (lineFlag) {
					chart.insert("g", ".grid")
						.attr("class", "grid horizontal")
						.call(
							d3.svg.axis().scale(y)
								.orient("left")
								.tickSize(-(width), 0, 0)
								.tickFormat("")
						);
				}

				// Create X axis representing the different metricsL
				//var metricLabels = genMetricsLabel(metricsL);// Get metricsL' labels in proper format (cut string if too long)
				var xAttr = d3.scale.ordinal()
					.rangeRoundBands([0, xAttrWidth]);
				//xAttr.domain(metricLabels);
				var xAttrAxis = d3.svg.axis()
					.scale(xAttr)
					.orient("bottom");


				for (i = 0; i < dataS.length; i++) { // for each attributeName cycle, print the metric labels
					var axisAttr = chart.append("g")
						.attr("class", "x axis attributes continuous"); // display axis line with continuous mode to make the separation more clear
					if (!metricOnly) {
						axisAttr
							.attr("transform", "translate(" + (xAttrWidth * i) + "," + (height -(height /(maxVal + Math.abs(minVal)))) + ")")
							.call(xAttrAxis)
							.selectAll("text")
							.attr("y", 0)
							.attr("dx", 0)
							.attr("transform", "rotate(-55)")
							.style("text-anchor", "end");
					}else {
						axisAttr
							.attr("transform", "translate(" + (xAttrWidth*i ) + "," + (height -(height /(maxVal + Math.abs(minVal)))) + ")")
							.call(xAttrAxis)
							.selectAll("text")
							.style("text-anchor", "middle");
					}
				}
			}


//************* Draw the bars

			var bar = chart.selectAll(".bar")
				.data(borders);

			//Adapt the format
			d3.selectAll("text").style("font", VIformat.font);
			d3.selectAll(".x.axis text").style("font-weight", "bold");
			d3.selectAll(".x.axis.attributes text").style("font", "12px arial");

			if (continuous){
				var newBar = bar.enter()	
					.append("text")
					.attr("class", "barText")
					.attr("text-anchor", "middle")
					.attr("x", function (d, i) { 
						return xAttrWidth * i + (xBarWidth/2);
					})
					.attr("y", function (d, i) {
						var v = 0;
						if (d[1] > 0)
							v += toYCoord(d[0] + d[1]);
						else
							v += toYCoord(d[0]);
						return zeroYPos - v - 5;
					})
					.text(function (d, i) {
						var infoText = d[1];
						return infoText;
					})
					.attr("stroke","black")
					.style("stroke-width", "0.5")
					.attr("opacity","1.0");
			}else{
				var newBar = bar.enter()	
					.append("text")
					.attr("class", "barText")
					.attr("text-anchor", "middle")
					.attr("x", function (d, i) { 
						return xBarWidth * i + (xBarWidth/2);
					})
					.attr("y", function (d, i) {
						var v = 0;
						if (d[1] > 0)
							v += toYCoord(d[0] + d[1]);
						else
							v += toYCoord(d[0]);
						return zeroYPos - v - 5;
					})
					.text(function (d, i) {
						var infoText = d[1];
						return infoText;
					})
					.attr("stroke","black")
					.style("stroke-width", "0.5")
					.attr("opacity","1.0");
			}
			
			bar.enter()
				.append("rect")
				.attr("class", "bar")
				.attr("x", function (d, i) {
					return xBarWidth * i;
				})
				.attr("width", xBarWidth)
				.attr("transform", function (d, i) {
					return "translate(" + 0 + "," + (-height * (i + 1)) + ")";
				})
				.attr("opacity", "1.0")
				.attr("y", function (d, i) {
					var v = 0;
					if (d[1] > 0)
						v += toYCoord(d[0] + d[1]);
					else
						v += toYCoord(d[0]);
					return zeroYPos - v;
				})

				.attr("height", function (d, i) {
					return (toYCoord(Math.abs(d[1])));
				})

				.style("stroke-width", "1")
				.on("click", function (d, i) {
					me.applySelection(dataS[Math.floor(i / metricsL.length)].attribute.selector);// Use the selector API when clicking on a bar
				})
				.append("svg:title").attr("class", "tooltip")
				.text(function (d, i) {
					var tooltip =
						dataS[Math.floor(i / metricsL.length)].attribute.value + ", " + metricsL[i % metricsL.length]
						+ " : [" + Math.round(d[0]) + " ; " + Math.round(d[1] + d[0]) + "]  -> " + Math.round(d[1]);
					return tooltip;
				});
				
			

			// Set the bar colors
			bar.style("fill", function (d, i) {
				return applyColor(d, i);
			})
				.style("stroke", function (d, i) {
					return applyColor(d, i);
				});


			function applyColor(d, i) {
				if (total && i % metricsL.length == (metricsL.length - 1))
					return d3.rgb(colors.total);
				var skipObj = i % metricsL.length;
				if (!continuous && skipObj != 0)
					var threshold = dataS[Math.floor(i / metricsL.length)].valueObj[skipObj - 1].threshold;
				else
					var threshold = dataS[Math.floor(i / metricsL.length)].valueObj[skipObj].threshold;

				if (typeof threshold !== "undefined") {
					return threshold.fillColor;
				}
				else if (d[1] > 0) {
					return d3.rgb(colors.positive);
				}
				else
					return d3.rgb(colors.negative);
			}

			bar.exit().remove();

			bar.transition()
				.duration(transitionDuration)
				.attr("transform", function (d) {
					return "translate(" + 0 + "," + 0 + ")";
				})
				.each("end", function () {
					d3.select(this).attr("opacity", "1").attr("fill-opacity", "0.70");
				});


			//For the visualization to start at the bottom of the scroll
			this.domNode.scrollTop = height;

			//IE SVG refresh bug: re-insert SVG node to update/redraw contents.
			var svgNode = this.domNode.firstChild;
			this.domNode.insertBefore(svgNode, svgNode);
			
			// Set the bar text
			
				
		}
	})
}());
//@ sourceURL=D3Waterfall.js