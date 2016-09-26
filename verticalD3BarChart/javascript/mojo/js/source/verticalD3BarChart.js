(function () {
    // Define this code as a plugin in the mstrmojo object
    if (!mstrmojo.plugins.verticalD3BarChart) {
        mstrmojo.plugins.verticalD3BarChart = {};
    }
    // All mojo visualization require the CustomVisBase library to render
    mstrmojo.requiresCls("mstrmojo.CustomVisBase");

    /**
     * <p>Hichert visualization using D3 library</p>
     * @class
     * @extends mstrmojo.CustomVisBase
     */
	// Declare the visualization object
    mstrmojo.plugins.verticalD3BarChart.verticalD3BarChart = mstrmojo.declare(
	    // Declare that this code extends CustomVisBase
        mstrmojo.CustomVisBase,
        null,
        {
		// Define the JavaScript class that renders your visualization as mstrmojo.plugins.{plugin name}.{js file name}
			scriptClass: 'mstrmojo.plugins.verticalD3BarChart.verticalD3BarChart',
	    // Define the CSS class that will be appended to container div
            cssClass: "verticalD3BarChart",
	    // Define the error message to be displayed if JavaScript errors prevent data from being displayed
            errorDetails: "This visualization requires one or more attributes and one metric.",
	    // Define whether a tooltip should be displayed with additional information
            useRichTooltip: true,
	    // Define whether the DOM should be reused on data/layout change - no, reconstruct it from scratch
            reuseDOMNode: true,
	    // Define the external libraries to be used - the D3 library
            externalLibraries: [
                {url: "//d3js.org/d3.v3.min.js"}
            ],

            plot: function () {
                if(this.domNode.childNodes.length===1){
                    this.domNode.removeChild(this.domNode.childNodes[0]);
                }

                var margin = {top: 10, right: 50, bottom: 50, left: 50},
                    width = parseInt(this.width,10) - margin.left - margin.right,
                    height = parseInt(this.height,10) - margin.top - margin.bottom;
                var chart = d3.select(this.domNode).append("svg").attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                var x = d3.scale.ordinal()
                    .rangeRoundBands([0, width], 0.1);

                var rawData = this.dataInterface.getRawData(mstrmojo.models.template.DataInterface.ENUM_RAW_DATA_FORMAT.TREE),
                	metricName = this.dataInterface.getColHeaders(0).getHeader(0).getName(),
                	data = [];

				/**
				 * Utility function that unescapes HTML entities <,>,& and '.  D3 will re-escape them when creating it's DOM elements.
				 * @param {String} st
				 * @returns {String}
				*/
				var unescapeString = function(st) {
					return st.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&").replace(/&#039;/g, "\'");
				};
					
                /**
                 * Recursive function used to flatten raw data tree into an array. The output is appended to the 'data' array declared above.
                 *
                 * @param {Array} nodes Nodes to process
                 * @param {String} nodeName Name of the current node so far
                */
			    var processRawData = function(nodes,nodeName) {
			        if ( nodes ) {
			            nodes.forEach(function(c) {
			            	if ( c.children ) {
			            		processRawData(c.children, nodeName + c.name + " " );
			            	} else {
					            data.push({
					                "name": unescapeString(nodeName + c.name),
					                "value" : c.value
					            });
			            	}
			            });
			        }
			    };
				

                // Begin processing the raw data with the children of the root node
				processRawData(rawData.children, "");

                x.domain(data.map(function (d) {
                    return d.name;
                }));
				
				var x = d3.scale.linear()
					.range([100, width]);

				var y = d3.scale.ordinal()
					.rangeRoundBands([0, height], 0.1);

				x.domain(d3.extent(data, function(d) { 
					return d.value; 
				})).nice();
				
				y.domain(data.map(function(d) { 
					return d.name; 
				}));

				var y1Axis = d3.svg.axis()
					.scale(y)
					.orient("left")
					.tickSize(0)
					.tickPadding(6);
					
				var y2Axis = d3.svg.axis()
					.scale(y)
					.orient("left")
					.tickSize(0)
					.tickPadding(6);
					
				var bar = chart.selectAll(".bar").data(data);				
								
				function checkNegative(){
					for (i=0;i<data.length;i++){
						if (data[i].value<0){
							return true;
						}
					}
					return false;
				}
				
				function checkAbsoulte(){
					return false;
				}
				
				
				bar.enter().append("rect")
					.attr("class", function(d) { 
						var boolNegative = checkNegative();
						var boolAbsolute = checkAbsoulte();
						
						if(boolNegative){
							if(boolAbsolute){
								return "bar bar--" + (d.value < 0 ? "negativeGray" : "positiveGray");
							}
							return "bar bar--" + (d.value < 0 ? "negativeRed" : "positiveGreen");
						}else{
							return "bar bar--black";
						}
					})
					.attr("x", function(d) { 
						return x(Math.min(0, d.value)); 
					})
					.attr("y", function(d) { 
						return y(d.name); 
					})
					.attr("width", function(d) { 
						return Math.abs(x(d.value) - x(0)); 
					})
					.attr("height", y.rangeBand());
					
				bar.enter().append("text")
					.attr("class", "barText")
					.attr("text-anchor", "middle")
					.attr("x", function(d) { 
						if(d.value < 0){
							if(d.value<-999){
								return x(d.value) - y.rangeBand()/3*2;
							}
							return x(d.value) - y.rangeBand()/2;
						}else{
							if(d.value>9999){
								return x(d.value) + y.rangeBand()/3*2;
							}
							return x(d.value) + y.rangeBand()/2;
						};
					})
					.attr("y", function(d) { 
						return y(d.name) + y.rangeBand()/3*2-2; 
					})
					.text(function(d){ 
						return d.value;
					});

                chart.append("g")
                    .attr("class", "y1 axis")
					.attr("transform", "translate(0,0)")
					.call(y1Axis);
					
				chart.append("g")
					.attr("class", "y2 axis")
					.attr("transform", "translate(" + x(0) + ",0)")
					.call(y2Axis);
            }
        }
    );
}());
//@ sourceURL=verticalD3BarChart.js