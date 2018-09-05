function getCountyValue(licCapId) {
	
	var fcapAddressObj = null;
   	var capAddressResult = aa.address.getAddressWithAttributeByCapId(licCapId);
	
   	if (capAddressResult.getSuccess())
   		var fcapAddressObj = capAddressResult.getOutput();
   	else
     		logDebug("**ERROR: Failed to get Address object: " + capAddressResult.getErrorType() + ":" + capAddressResult.getErrorMessage())

	if (fcapAddressObj.length < 1)
		return null;
	else{
		for (i in fcapAddressObj)
		{
			addressAttrObj = fcapAddressObj[i].getAttributes().toArray();
			for (z in addressAttrObj){
				if(addressAttrObj[z].getB1AttributeName().toUpperCase().equals("COUNTY")){
					//aa.print ("Attribute Name:" + addressAttrObj[z].getB1AttributeName());
					//aa.print ("Attribute Value:" + addressAttrObj[z].getB1AttributeValue());
					return addressAttrObj[z].getB1AttributeValue();
				}
			}
		}
	}
}

