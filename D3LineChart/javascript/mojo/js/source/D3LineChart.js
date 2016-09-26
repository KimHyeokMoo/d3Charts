(function () {
    if (!mstrmojo.plugins.D3LineChart) {
        mstrmojo.plugins.D3LineChart = {};
    }
    mstrmojo.requiresCls(
        "mstrmojo.CustomVisBase",
        "mstrmojo.models.template.DataInterface"
    );
    mstrmojo.plugins.D3LineChart.D3LineChart = mstrmojo.declare(
        mstrmojo.CustomVisBase,
        null,
        {
            scriptClass: "mstrmojo.plugins.D3LineChart.D3LineChart",
            cssClass: "D3LineChart",
			markupstring:'<div id="test" style="overflow:auto;"></div>',
            errorDetails: "This visualization requires one or more attributes and one metric.",
			externalLibraries: [{url: "//cdnjs.cloudflare.com/ajax/libs/d3/3.5.2/d3.min.js"}],
			useRichTooltip: true,
            reuseDOMNode: true,
            plot: function () {
				var $DI = mstrmojo.models.template.DataInterface,
                normalizedModel = (new $DI(this.model.data)).getRawData($DI.ENUM_RAW_DATA_FORMAT.TREE);
				var root=getNodes(normalizedModel);
				drawLineChart(this.domNode,root.children);
			}
        }
    );
    function getNodes(root) {
        var classes = [];
        function recurse(name, node) {
            if (node.children) {
                node.children.forEach(function (child) {
					recurse(name && name !== "root" ? name + ", " + node.name : node.name, child);
                });
            } else {
				classes.push({name: node.name, value:node.value});
            }
        }
        recurse(null, root);
        return {children: classes};
	}
	function drawLineChart(domEle,datac){
		domEle.innerHTML="";
		
			var data = datac;
			var myWidth;
			var myInnerWidth;
				
			var div = d3.select("body")
				.append("div")  
				.attr("class", "tooltip")              
				.style("opacity", 0);
					
			if(data.length >= 500){
					myWidth = 7500;
					myInnerWidth = 7200;
				} else if(data.length >= 250 && data.length <=499){
					myWidth = 3100;
					myInnerWidth = 3000;
				} else if(data.length >= 100 && data.length <=249){
					//alert("I am here");
					myWidth = 2100;
					myInnerWidth = 2000;
				} else if(data.length >= 50 && data.length <=99){
					//alert("I am here");
					myWidth = 1500;
					myInnerWidth = 1450;
				} else {
					myWidth = 1100;
					myInnerWidth = 1050;
			}
			var vis = d3.select(domEle).append("svg").attr("width",myWidth).attr("height",700),
				MARGINS = { top: 20, right: 20, bottom: 20, left: 70 },	WIDTH = myInnerWidth,	HEIGHT = 450;
			var xScale;
			var	yScale;
			
			if (isNaN(data[1].name)){
				//alert("X ordinal");
				xScale = d3.scale.ordinal().rangeBands([70, WIDTH]),
				xScale.domain(data.map(function(d) { return d.name; }));
			}else{
				//alert("X linear");
				xScale = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([d3.min(data, function(d) {
						return d.name;
					}), d3.max(data, function(d) {
						return d.name;
					})
				]);
			}
			
			if(isNaN(data[1].value)) {
				//alert("In String");
				yScale = d3.scale.ordinal().rangeRoundBands([0, HEIGHT],.3),
				yScale.domain(data.map(function(d) { return d.value; }));
			}else{
				//alert("In Number");
				yScale = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([d3.min(data, function(d) {
						return d.value;
					}), d3.max(data, function(d) {
						return d.value;
					})
				]);
			}
			
			xAxis = d3.svg.axis()
				.scale(xScale);
				
			var lineGen = d3.svg.line()
					.x(function(d) {
						return xScale(d.name);
					})
					.y(function(d) {
						return yScale(d.value);
					});
				
			if(data.length >= 50) {
				vis.append("svg:g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")
					.call(xAxis)
					.selectAll("text")
					.attr("y", 0)
					.attr("x", 9)
					.attr("dy", ".35em")
					.attr("transform", "rotate(90)")
					.style("text-anchor", "start");
			} else if(data.length >= 1 && data.length <= 49){
				vis.append("svg:g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")
					.call(xAxis);
			}

				vis.append('svg:path')
					.attr('d', lineGen(data))
					.attr('stroke', 'black')
					.attr('stroke-width', 2)
					.attr('fill', 'none');
				
				vis.selectAll('.dot')
					.data(data)
					.enter().append("circle")
					.attr("class", "dot")
					.attr("cx", lineGen.x())
					.attr("cy", lineGen.y())
					.attr("r", 2.0)
					/*.on("mouseover", function (d) {
						div.transition()
							.duration(500)
							.style("opacity", 0.8)
							.style("z-index",999);
						div.html(d.name + "<br/>" + d.value)
							.style("left", (d3.event.pageX) + "px")
							.style("top", (d3.event.pageY - 50) + "px");
					})
					.on("mouseout", function (d) {
						//alert("Out");
						div.html("");
						div.transition()
							.style("opacity", 0);
					})*/;
					
				vis.selectAll(".bar")
					.data(data)
					.enter().append("text")
					.attr("class","text")
					.attr("text-anchor","middle")
					.attr("x",lineGen.x())
					.attr("y",function(d){
							if (d.value < 0){
								return yScale(d.value)+15;
							} else {
								return yScale(d.value)-5;
							}
					})
					.text(function(d){
						return d.value;
					})
	}
	
}());