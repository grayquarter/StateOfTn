function validateControlNumber(cntrlNum) {
    var wsdl = "https://rlpsdev.abc.tn.gov/TABCSOS/ServiceTABCSOS.svc?wsdl";    
	var method = "GetBusinessEntityInfo";
    var my_array = new Array();
    my_array[0] = cntrlNum; //"000221622";

    var res = aa.wsConsumer.consume(wsdl, method, my_array);
    if (res.getSuccess()) {
        var result = res.getOutput();
        logDebug("Success:" + result[0]);
		return result[0];
        //aa.env.setValue("ScriptReturnCode", "0");
        //aa.env.setValue("ScriptReturnMessage", result);
    } else {
        logDebug("NOT Success:");
        aa.env.setValue("ScriptReturnCode", "-1");
        aa.env.setValue("ScriptReturnMessage", res.getErrorMessage());
    }
}

