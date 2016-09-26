(function () { 
    if (!mstrmojo.plugins.D3Waterfall) {
        mstrmojo.plugins.D3Waterfall = {};
    }

    mstrmojo.requiresCls(
        "mstrmojo.vi.models.editors.CustomVisEditorModel",
        "mstrmojo.array"
    );
	
	var $WT = mstrmojo.vi.models.editors.CustomVisEditorModel.WIDGET_TYPE;
	 
    mstrmojo.plugins.D3Waterfall.D3WaterfallEditorModel = mstrmojo.declare(
        mstrmojo.vi.models.editors.CustomVisEditorModel,
        null,
        {
            scriptClass: "mstrmojo.plugins.D3Waterfall.D3WaterfallEditorModel",
            cssClass: "d3waterfalleditormodel",
            getCustomProperty: function getCustomProperty(){
				//Retrieve the viz created in the D3Waterfall.js 
			var myViz = this.getHost();
			var continuousFlag, totalsFlag, lineFlag, totalsColor;
			 // Fill the property data here
		return [
		{
				name: 'Visualization Mode',
				value: [
					{
						style: $WT.EDITORGROUP,
						items: [
							{
								style: $WT.CHECKBOXANDLABEL,
								propertyName: "continuousMode", 
								labelText: "Waterfall Mode",	
								config: {
									suppressData: true,
									clientUndoRedoCallback: function(){},
									onPropertyChange: function (propertyName, newValue) {
                                            if (propertyName === "continuousMode") {
                                               continuousFlag = newValue;
                                            }
                                            return {};
                                    }  ,
									 callback: function(){
										 myViz.switchContinuousMode(continuousFlag);
										 myViz.refresh();
									}   
								}
							},
							{
								style: $WT.CHECKBOXANDLABEL,
								propertyName: "showTotals", 
								labelText: "Show Totals",
								config: {
									suppressData: true,
									clientUndoRedoCallback: function(){},
									onPropertyChange: function (propertyName, newValue) {
                                            if (propertyName === "showTotals") {
                                               totalsFlag = newValue;
                                            }
                                            return {};
                                    } ,
									 callback: function(){
										
										 myViz.showTotal(totalsFlag);
										 myViz.refresh();
									}  
								}
							},
							{
								style: $WT.CHECKBOXANDLABEL,
								propertyName: "showLine", 
								labelText: "Show Horizontal Lines",
								config: {
									suppressData: true,
									clientUndoRedoCallback: function(){},
									onPropertyChange: function (propertyName, newValue) {
                                            if (propertyName === "showLine") {
                                               lineFlag = newValue;
                                            }
                                            return {};
                                    } ,
									 callback: function(){
										
										 myViz.showLine(lineFlag);
										 myViz.refresh();
									}  
								}
								
							}
							
						]
					}
				]
			}
			
				
		];
}
})}());
//@ sourceURL=D3WaterfallEditorModel.js