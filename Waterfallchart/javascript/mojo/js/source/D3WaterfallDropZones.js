(function () { 
    if (!mstrmojo.plugins.D3Waterfall) {
        mstrmojo.plugins.D3Waterfall = {};
    }

    mstrmojo.requiresCls(
        "mstrmojo.vi.models.CustomVisDropZones",
        "mstrmojo.array"
    );
	
	var ZONE_ATTRIBUTES = 'Attribute',
        ZONE_METRIC = 'Metrics',
        ZONE_CONTINUOUS = 'Continuous';
    ZONE_TOTAL = 'Total';
	
    mstrmojo.plugins.D3Waterfall.D3WaterfallDropZones = mstrmojo.declare(
        mstrmojo.vi.models.CustomVisDropZones,
        null,
        {
            scriptClass: "mstrmojo.plugins.D3Waterfall.D3WaterfallDropZones",
            cssClass: "d3waterfalldropzones",
            getCustomDropZones: function getCustomDropZones(){
				 var ENUM_ALLOW_DROP_TYPE = mstrmojo.vi.models.CustomVisDropZones.ENUM_ALLOW_DROP_TYPE;
                // Fill the zones’ definition here.
                return [{
                    name: ZONE_ATTRIBUTES,
                    title: mstrmojo.desc(13828, 'Drag attribute here'),
                    maxCapacity: 1,
                    allowObjectType: ENUM_ALLOW_DROP_TYPE.ATTRIBUTE
                }, {
                    name: ZONE_METRIC,
                    title: mstrmojo.desc(13828, 'Drag metric here'),
                    maxCapacity: 20,
                    allowObjectType: ENUM_ALLOW_DROP_TYPE.METRIC
                }];
 },
            shouldAllowObjectsInDropZone: function shouldAllowObjectsInDropZone(zone, dragObjects, idx, edge, context) {
				var me = this;
                return {
                    allowedItems: mstrmojo.array.filter(dragObjects, function (object) {
                        return true;
                    })
                };
},
            getActionsForObjectsDropped: function getActionsForObjectsDropped(zone, droppedObjects, idx, replaceObject, extras) {
 








},
            getActionsForObjectsRemoved: function getActionsForObjectsRemoved(zone, objects) { 
 








},
            getDropZoneContextMenuItems: function getDropZoneContextMenuItems(cfg, zone, object, el) {
 








}
})}());
//@ sourceURL=D3WaterfallDropZones.js