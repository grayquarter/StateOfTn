function updateAddressCounty(countyValue) {

    var addResult = aa.address.getAddressByCapId(capId);
	
    if (addResult.getSuccess()) {
    	var addArray = addResult.getOutput();
		
    	for (var jj in addArray) {
    		var thisAddress = addArray[jj];

			thisAddress.setCounty(countyValue);
	    	aa.print("Address County field updated to " + countyValue);
    	}
		var addressUpdate = aa.address.editAddress(thisAddress);
		if (addressUpdate.getSuccess())
			return true;
		else
			return false;
    }
    else {
    	logDebug("Could not return address: " + addResult.getErrorMessage());
    	return false;
    }
}
