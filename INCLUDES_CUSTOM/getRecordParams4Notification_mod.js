function getRecordParams4Notification_mod(params) {
	// pass in a hashtable and it will add the additional parameters to the table

	var capDetailObjResult = aa.cap.getCapDetail(capId);		
	if (capDetailObjResult.getSuccess())
	{
		capDetail = capDetailObjResult.getOutput();
		var balanceDueAtRenewal = capDetail.getBalance();
	}
	
	addParameter(params, "$$balanceDueAtRenewal$$", "$" + parseFloat(balanceDueAtRenewal).toFixed(2));
	return params;
}

/* Added by FJB 4/6/2015  */

