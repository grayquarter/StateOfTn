
if (true) {
	logDebug('Using LICENSESTATE = ' + LICENSESTATE + ' from EMSE:GlobalFlags');
	}

if (true) {
	LICENSETYPE = '';
	//License Type to be populated;
	}

if (true) {
	licCapId = null;
	isNewLic = false;
	licIDString = null;
	licObj = null;
	licCap = null;
	}

if (true) {
	
//start replaced branch: EMSE:LicProfLookup:getLicenses
 {
if (true) {
	var searchCap = capId;
	var tmpId = capId;
	var prjArr = null;
	}

if (appMatch('*/*/*/License')) {
	var childArr = getChildren('*/*/*/Application');
	if(childArr != null) searchCap = childArr[0];
	}

if (true) {
	capId = tmpId;
	var vRelationType = 'R';
	if(appMatch('*/*/*/Renewal')) vRelationType='Renewal';
	}

if (true) {
	var prjArrRes = aa.cap.getProjectByChildCapID(searchCap,vRelationType,null);
	if(prjArrRes.getSuccess()) prjArr = prjArrRes.getOutput();
	}

if (prjArr != null) {
	for(prj in prjArr) if(appMatch('*/*/*/License',prjArr[prj].getProjectID())) licCapId = prjArr[prj].getProjectID();
	}

if (licCapId == null && appMatch('*/*/*/License')) {
	licCapId = capId;
	//In the event license has no application;
	}

if (licCapId != null) {
	licCapId = aa.cap.getCapID(licCapId.getID1(),licCapId.getID2(),licCapId.getID3()).getOutput();
	logDebug('Got Lic Cap ' + licCapId.getCustomID());
	}

}
//end replaced branch: EMSE:LicProfLookup:getLicenses;
	//Get License CAP;
	}

if (licCapId !=null) {
	
//start replaced branch: EMSE:LicProfLookup:getLicenseType
 {
if (licCapId !=null) {
	licIDString = licCapId.getCustomID();
	}

if (licCapId !=null) {
	licCap = aa.cap.getCap(licCapId).getOutput();
	licCapType = licCap.getCapType().toString();
	licCapTypeArr = licCapType.split('/');
	licCapStatus = licCap.getCapStatus();
	}

if (licCapId !=null) {
	if(licCapTypeArr[1] == 'Business') LICENSETYPE = 'Business';
	else LICENSETYPE = getAppSpecific('License Type',licCapId)+'';
	}

}
//end replaced branch: EMSE:LicProfLookup:getLicenseType;
	}

if (true) {
	licObj = licenseProfObject(licIDString,LICENSETYPE);
	//Get LicArray;
	}

if (!licObj.valid && lookup('LICENSED PROFESSIONAL TYPE',LICENSETYPE) != null) {
	
//start replaced branch: EMSE:LicProfLookup:CreateLP
 {
if (true) {
	var vNewLic = aa.licenseScript.createLicenseScriptModel();
	}

if (true) {
	vNewLic.setAgencyCode(aa.getServiceProviderCode());
	vNewLic.setAuditDate(sysDate);
	vNewLic.setAuditID(currentUserID);
	vNewLic.setAuditStatus('A');
	vNewLic.setLicenseType(LICENSETYPE);
	vNewLic.setLicState(LICENSESTATE);
	vNewLic.setStateLicense(licIDString);
	}

if (true) {
	aa.licenseScript.createRefLicenseProf(vNewLic);
	}

if (true) {
	var tmpLicObj = licenseProfObject(licIDString,LICENSETYPE);
	}

if (tmpLicObj.valid) {
	isNewLic = true;
	}

}
//end replaced branch: EMSE:LicProfLookup:CreateLP;
	licObj = licenseProfObject(licIDString,LICENSETYPE );
	}

if (licObj.valid) {
	
//start replaced branch: EMSE:LicProfLookup:UpdateLP
 {
if (true) {
	
//start replaced branch: EMSE:LicProfLookup:UpdateLP:BaseFields
 {
if (true) {
	licObj.refLicModel.setState(LICENSESTATE);
	}

if (true) {
	licObj.refLicModel.setLicenseBoard(LICENSETYPE);
	}

if (true) {
	licObj.refLicModel.setLicenseIssueDate(licCap.getFileDate());
	}

if (true) {
	var expObj = null;
	var expDt = null;
	var expObjRes = aa.expiration.getLicensesByCapID(licCapId);
	if(expObjRes.getSuccess()) var expObj = expObjRes.getOutput();
	}

if (expObj != null) {
	expDt = aa.date.parseDate(expObj.getExpDateString());
	}

if (expDt != null) {
	licObj.refLicModel.setLicenseExpirationDate(expDt);
	//Expiration Date;
	}

if (licCapTypeArr[1] == 'Business') {
	licObj.refLicModel.setLicenseBoard(getAppSpecific('Business Type',licCapId));
	} else {
	licObj.refLicModel.setLicenseBoard(LICENSETYPE);
	}

if (licObj.updateFromRecordContactByType(licCapId,'',true,false);) {
	logDebug('LP Updated from Primary Contact');
	} else {
	logDebug('LP Failed to Update from Primary Contact trying License Holder');
	if(licObj.updateFromRecordContactByType(licCapId,'License Holder',true,false)) logDebug('Updated from Licens;
	}

if (licObj.updateFromAddress(licCapId)) {
	logDebug('LP Address Updated from License Address');
	} else {
	logDebug('LP Address Failed to update from License Address');
	}

if (getAppSpecific('Doing Business As (DBA) Name',licCapId)) {
	licObj.refLicModel.setBusinessName(getAppSpecific('Doing Business As (DBA) Name',licCapId) );
	}

}
//end replaced branch: EMSE:LicProfLookup:UpdateLP:BaseFields;
	}

if (true) {
	
//start replaced branch: EMSE:LicProfLookup:UpdateLP:ApplicationStatus
 {
if (true) {
	licObj.refLicModel.setBusinessName2(licCapStatus);
	logDebug('Lic Cap Status: ' + licCapStatus);
	}

}
//end replaced branch: EMSE:LicProfLookup:UpdateLP:ApplicationStatus;
	}

if (licObj.updateRecord()) {
	logDebug('LP Updated Successfully');
	} else {
	logDebug('LP Update Failed');
	}

}
//end replaced branch: EMSE:LicProfLookup:UpdateLP;
	} else {
	logDebug('LP Not found to update');
	}

