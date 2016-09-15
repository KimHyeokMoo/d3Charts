(function () {
    // Define this code as a plugin in the mstrmojo object
    if (!mstrmojo.plugins.D3Table) {
        mstrmojo.plugins.D3Table = {};
    }
    // All mojo visualization require the CustomVisBase library to render
    mstrmojo.requiresCls("mstrmojo.CustomVisBase");

    /**
     * <p>Hichert visualization using D3 library</p>
     * @class
     * @extends mstrmojo.CustomVisBase
     */
	// Declare the visualization object
    mstrmojo.plugins.D3Table.D3Table = mstrmojo.declare(
	    // Declare that this code extends CustomVisBase
        mstrmojo.CustomVisBase,
        null,
        {
		// Define the JavaScript class that renders your visualization as mstrmojo.plugins.{plugin name}.{js file name}
			scriptClass: 'mstrmojo.plugins.D3Table.D3Table',
	    // Define the CSS class that will be appended to container div
            cssClass: "D3Table",
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

                var margin = {top: 10, right: 50, bottom: 50, left: 200},
                    width = parseInt(this.width,10) - margin.left - margin.right,
                    height = parseInt(this.height,10) - margin.top - margin.bottom;

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

				var table = d3.select(this.domNode).append("table").attr("class", "d3Table");
				var	thead = table.append("thead").attr("class", "d3Thead");
				var	tbody = table.append("tbody").attr("class", "d3Tbody");
				var titles = d3.keys(data[0]);
				
				thead.append("tr")
					.selectAll("th")
					.data(titles).enter()
					.append("th")
					.text(function (d){
						return d;
					});
					
				var rows = tbody.selectAll("tr")
					.data(data).enter()
					.append("tr")
					.attr("class", "d3Rows");
					
				var cells = rows.selectAll("td")
					.data(function (d){
						return titles.map(function (k){
							return {
								'value': d[k], 'name': k
							};
						}); 
					}).enter()
					.append('td')
					.attr('data-th', function(d){
						return d.name;
					})
					.text(function(d){
						return d.value;
					})
					.attr("class", "d3Cells");
            }
        }
    );
}());
//@ sourceURL=D3Table.js