function getAppSpecificValue(pItemName, pItemCapId)
 {
 //modified version of getAppSpecific function created for this batch script
 //
    var appSpecInfoResult = aa.appSpecificInfo.getByCapID(pItemCapId);
 if (appSpecInfoResult.getSuccess())
   {
  var appspecObj = appSpecInfoResult.getOutput();
 
  if (pItemName != "")
   for (i in appspecObj)
    if (appspecObj[i].getCheckboxDesc() == pItemName)
     {
     return appspecObj[i].getChecklistComment();
     break;
     }
  }
 else
 {
           logDebug( "ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage()) }
    return false;
 }

// FA 06-03-2016 creates contact on ACA
