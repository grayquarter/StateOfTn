
branch('EMSE:SetContactRelationshipToContactType');
var appCounty = getCountyValue(capId);
if (appCounty != null) {
	var POD = countyLookUp('CName', appCounty);
	aa.print('POD: ' + POD);
	assignDepartment_Custom(POD);
}
