/*------------------------------------------------------------------------------------------------------/
| Program : ACA Amend CERTMGN.js
| Event   : ACA Amend OnLoad
|
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : N/A
| Action# : N/A
|
| Notes   :
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
 
var br = "<BR>";
 
var errorMessage = "";
 
var errorCode = "0";
var currentUserID = aa.env.getValue("CurrentUserID");
if (currentUserID.indexOf("PUBLICUSER") == 0) { currentUserID = "ADMIN" ; publicUser = true }  // ignore public users

useAppSpecificGroupName = false;

//execute
var capModelInited = aa.env.getValue("CAP_MODEL_INITED");
if (capModelInited != "TRUE")
{
    copy();
}

/*------------------------------------------------------------------------------------------------------/
| <===========Functions (used by copy)
/------------------------------------------------------------------------------------------------------*/


function copy()
{
    //----------------------------------------
    var capModel = aa.env.getValue("CapModel");
		
    targetCapId = capModel.getCapID();
   
    aa.debug("Debug:","TargetCapId:" + targetCapId);

    if(targetCapId==null)
    {
      errorMessage+="targetCapId is null.";
      errorCode=-1;
      end();
      return;
    }
	
	//var parentCapId = capModel.getParentCapID();
    var parentCapId = getParent(targetCapId);
	
	aa.debug("Debug","Parent:" + parentCapId);

    if(parentCapId==null)
    {
      errorMessage+="Parent is null.";
      errorCode=-1;
      end();
      return;
    }
	
    try
    { 
	  //Added Manager Table 07202018
	   var existDesMgrTable= loadASITable("CERTIFIED MANAGER LIST", targetCapId);
	   var existCertClkTable = loadASITable("CERTIFIED CLERK LIST", targetCapId);
         if(existDesMgrTable || existCertClkTable)
	     {
			 return;
		 }
		 else{
	         copyAppSpecificTable(parentCapId, targetCapId);
			 thisArr = new Array();
		     var countyName = null;
		     var capAddressResult = aa.address.getAddressWithAttributeByCapId(parentCapId);
		     if (capAddressResult.getSuccess()){
		      	Address = capAddressResult.getOutput();
			for (yy in Address){
				chkAddress = Address[0];
				
				addressAttrObj = chkAddress.getAttributes().toArray();
				
				for (z in addressAttrObj){
					if (addressAttrObj[z].getB1AttributeName() == "COUNTY"){
						countyName = addressAttrObj[z].getB1AttributeValue();
						
					//thisArr["AddressAttribute." + addressAttrObj[z].getB1AttributeName()]=addressAttrObj[z].getB1AttributeValue();
					//aa.print("AddressAttribute." + addressAttrObj[z].getB1AttributeName() + ": " + addressAttrObj[z].getB1AttributeValue());
					}
				}
			}
		}
		if (countyName != null){
			aa.appSpecificInfo.editSingleAppSpecific(targetCapId,"County",countyName,"COUNTY");
		}	
		
		var amendCapModel = aa.cap.getCapViewBySingle4ACA(targetCapId);
		amendCapModel.getCapType().setSpecInfoCode(capModel.getCapType().getSpecInfoCode());
		
		aa.env.setValue("CapModel", amendCapModel);     
		aa.env.setValue("CAP_MODEL_INITED", "TRUE");
		// }
	}
	  	
    }
    catch(e)
    { 
		logError("Error: "+e); 
		end();
    }
}

function copyAppSpecificTable(srcCapId, targetCapId)
{
  var tableNameArray = getTableName(srcCapId);
  if (tableNameArray == null)
  {
    return;
  }
  for (loopk in tableNameArray)
  {
    var tableName = tableNameArray[loopk];
	var targetAppSpecificTable = loadASITable(tableName,srcCapId);
     
	if(tableName == "RPS APP" || tableName == "RPS APP GROUP")
	{
	}
	else{
	addASITable(tableName, targetAppSpecificTable,targetCapId);
	}
  }
}


function getTableName(capId)
{
  var tableName = null;
  var result = aa.appSpecificTableScript.getAppSpecificGroupTableNames(capId);
  if(result.getSuccess())
  {
    tableName = result.getOutput();
    if(tableName!=null)
    {
      return tableName;
    }
  }
  return tableName;
}

function getAppSpecificTable(capId,tableName)
{
  appSpecificTable = null;
  var s_result = aa.appSpecificTableScript.getAppSpecificTableModel(capId,tableName);
  if(s_result.getSuccess())
  {
    appSpecificTable = s_result.getOutput();
    if (appSpecificTable == null || appSpecificTable.length == 0)
    {
      aa.print("WARNING: no appSpecificTable on this CAP:" + capId);
      appSpecificTable = null;
    }
  }
  else
  {
    appSpecificTable = null;  
  }
  return appSpecificTable;
}

function logError(error)
{
    aa.print(error);
 
    errorMessage += error + br;
 
    errorCode = -1;
}
 
function end()
{
    aa.env.setValue("ErrorCode", errorCode);
 
    aa.env.setValue("ErrorMessage", errorMessage);
}
function getParent(targetCapId) 
{
	// returns the capId object of the parent.  Assumes only one parent!
	//
	var getCapResult = aa.cap.getProjectParents(targetCapId,1);
	if (getCapResult.getSuccess())
	{
		var parentArray = getCapResult.getOutput();
		if (parentArray.length)
			return parentArray[0].getCapID();
		else
			{
			aa.print("**WARNING: GetParent found no project parent for this application");
			return false;
			}
	}
	else
	{ 
		aa.print("**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
		return false;
	}
}

function loadASITable(tname) 
{
	itemCap = arguments[1]; // use cap ID specified in args

	var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
	var ta = gm.getTablesArray()
	var tai = ta.iterator();

	while (tai.hasNext())
	{
	  var tsm = tai.next();
	  var tn = tsm.getTableName();

      if (!tn.equals(tname)) continue;

	  if (tsm.rowIndex.isEmpty())
	  	{
			aa.print("Couldn't load ASI Table " + tname + " it is empty");
			return false;
		}

   	  var tempObject = new Array();
	  var tempArray = new Array();

  	  var tsmfldi = tsm.getTableField().iterator();
	  var tsmcoli = tsm.getColumns().iterator();
      var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
	  var numrows = 1;

	  while (tsmfldi.hasNext())  // cycle through fields
		{
		if (!tsmcoli.hasNext())  // cycle through columns
			{
			var tsmcoli = tsm.getColumns().iterator();
			tempArray.push(tempObject);  // end of record
			var tempObject = new Array();  // clear the temp obj
			numrows++;
			}
		var tcol = tsmcoli.next();
		var tval = tsmfldi.next();
		var readOnly = 'N';
		if (readOnlyi.hasNext()) {
			readOnly = readOnlyi.next();
		}
		var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
		tempObject[tcol.getColumnName()] = fieldInfo;
		}		
	  tempArray.push(tempObject);  // end of record
	}	
	return tempArray;
}

function asiTableValObj(columnName, fieldValue, readOnly) {
	this.columnName = columnName;
	this.fieldValue = fieldValue;
	this.readOnly = readOnly;

	asiTableValObj.prototype.toString=function(){ return this.fieldValue }
};
	
function addASITable(tableName,tableValueArray) // optional capId
{
  	//  tableName is the name of the ASI table
  	//  tableValueArray is an array of associative array values.  All elements MUST be either a string or asiTableVal object
  	if (arguments.length > 2)
  		itemCap = arguments[2]; // use cap ID specified in args
  
  	var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(itemCap,tableName)
  
  	if (!tssmResult.getSuccess())
  		{ aa.print("**WARNING: error retrieving app specific table " + tableName + " " + tssmResult.getErrorMessage()) ; return false }
  
  	var tssm = tssmResult.getOutput();
  	var tsm = tssm.getAppSpecificTableModel();
  	var fld = tsm.getTableField();
    var fld_readonly = tsm.getReadonlyField(); // get Readonly field
  
    for (thisrow in tableValueArray)
	{
  
  		var col = tsm.getColumns()
  		var coli = col.iterator();
  
  		while (coli.hasNext())
  		{
  			var colname = coli.next();
  
			if (typeof(tableValueArray[thisrow][colname.getColumnName()]) == "object")  // we are passed an asiTablVal Obj

				{
	  			fld.add(tableValueArray[thisrow][colname.getColumnName()].fieldValue);
	  			fld_readonly.add(tableValueArray[thisrow][colname.getColumnName()].readOnly);
				}
			else // we are passed a string
				{
  				fld.add(tableValueArray[thisrow][colname.getColumnName()]);
  				fld_readonly.add(null);
				}
  		}
  
  		tsm.setTableField(fld);
  
  		tsm.setReadonlyField(fld_readonly);
  
  	}
  
  	var addResult = aa.appSpecificTableScript.editAppSpecificTableInfos(tsm, itemCap, currentUserID);
  
  	 if (!addResult .getSuccess())
  		{ aa.print("**WARNING: error adding record to ASI Table:  " + tableName + " " + addResult.getErrorMessage()) ; return false }
  	else
		{
			//Refresh Cap Model (Custom Addition by Engineering, but wasn't able to submit ACA record)
			//var tmpCap = aa.cap.getCapViewBySingle(capId);
			//cap.setAppSpecificTableGroupModel(tmpCap.getAppSpecificTableGroupModel()); 

			aa.print("Successfully added record to ASI Table: " + tableName);
		}
  
}/*------------------------------------------------------------------------------------------------------/
| Program : ACA Amend CERTMGN.js
| Event   : ACA Amend OnLoad
|
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : N/A
| Action# : N/A
|
| Notes   :
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
 
var br = "<BR>";
 
var errorMessage = "";
 
var errorCode = "0";
var currentUserID = aa.env.getValue("CurrentUserID");
if (currentUserID.indexOf("PUBLICUSER") == 0) { currentUserID = "ADMIN" ; publicUser = true }  // ignore public users

useAppSpecificGroupName = false;

//execute
var capModelInited = aa.env.getValue("CAP_MODEL_INITED");
if (capModelInited != "TRUE")
{
    copy();
}

/*------------------------------------------------------------------------------------------------------/
| <===========Functions (used by copy)
/------------------------------------------------------------------------------------------------------*/


function copy()
{
    //----------------------------------------
    var capModel = aa.env.getValue("CapModel");
		
    targetCapId = capModel.getCapID();
   
    aa.debug("Debug:","TargetCapId:" + targetCapId);

    if(targetCapId==null)
    {
      errorMessage+="targetCapId is null.";
      errorCode=-1;
      end();
      return;
    }
	
	//var parentCapId = capModel.getParentCapID();
    var parentCapId = getParent(targetCapId);
	
	aa.debug("Debug","Parent:" + parentCapId);

    if(parentCapId==null)
    {
      errorMessage+="Parent is null.";
      errorCode=-1;
      end();
      return;
    }
	
    try
    { 
	  //Added Manager Table 07202018
	   var existDesMgrTable= loadASITable("CERTIFIED MANAGER LIST", targetCapId);
	   var existCertClkTable = loadASITable("CERTIFIED CLERK LIST", targetCapId);
         if(existDesMgrTable || existCertClkTable)
	     {
			 return;
		 }
		 else{
	         copyAppSpecificTable(parentCapId, targetCapId);
			 thisArr = new Array();
		     var countyName = null;
		     var capAddressResult = aa.address.getAddressWithAttributeByCapId(parentCapId);
		     if (capAddressResult.getSuccess()){
		      	Address = capAddressResult.getOutput();
			for (yy in Address){
				chkAddress = Address[0];
				
				addressAttrObj = chkAddress.getAttributes().toArray();
				
				for (z in addressAttrObj){
					if (addressAttrObj[z].getB1AttributeName() == "COUNTY"){
						countyName = addressAttrObj[z].getB1AttributeValue();
						
					//thisArr["AddressAttribute." + addressAttrObj[z].getB1AttributeName()]=addressAttrObj[z].getB1AttributeValue();
					//aa.print("AddressAttribute." + addressAttrObj[z].getB1AttributeName() + ": " + addressAttrObj[z].getB1AttributeValue());
					}
				}
			}
		}
		if (countyName != null){
			aa.appSpecificInfo.editSingleAppSpecific(targetCapId,"County",countyName,"COUNTY");
		}	
		
		var amendCapModel = aa.cap.getCapViewBySingle4ACA(targetCapId);
		amendCapModel.getCapType().setSpecInfoCode(capModel.getCapType().getSpecInfoCode());
		
		aa.env.setValue("CapModel", amendCapModel);     
		aa.env.setValue("CAP_MODEL_INITED", "TRUE");
		// }
	}
	  	
    }
    catch(e)
    { 
		logError("Error: "+e); 
		end();
    }
}

function copyAppSpecificTable(srcCapId, targetCapId)
{
  var tableNameArray = getTableName(srcCapId);
  if (tableNameArray == null)
  {
    return;
  }
  for (loopk in tableNameArray)
  {
    var tableName = tableNameArray[loopk];
	var targetAppSpecificTable = loadASITable(tableName,srcCapId);
     
	if(tableName == "RPS APP" || tableName == "RPS APP GROUP")
	{
	}
	else{
	addASITable(tableName, targetAppSpecificTable,targetCapId);
	}
  }
}


function getTableName(capId)
{
  var tableName = null;
  var result = aa.appSpecificTableScript.getAppSpecificGroupTableNames(capId);
  if(result.getSuccess())
  {
    tableName = result.getOutput();
    if(tableName!=null)
    {
      return tableName;
    }
  }
  return tableName;
}

function getAppSpecificTable(capId,tableName)
{
  appSpecificTable = null;
  var s_result = aa.appSpecificTableScript.getAppSpecificTableModel(capId,tableName);
  if(s_result.getSuccess())
  {
    appSpecificTable = s_result.getOutput();
    if (appSpecificTable == null || appSpecificTable.length == 0)
    {
      aa.print("WARNING: no appSpecificTable on this CAP:" + capId);
      appSpecificTable = null;
    }
  }
  else
  {
    appSpecificTable = null;  
  }
  return appSpecificTable;
}

function logError(error)
{
    aa.print(error);
 
    errorMessage += error + br;
 
    errorCode = -1;
}
 
function end()
{
    aa.env.setValue("ErrorCode", errorCode);
 
    aa.env.setValue("ErrorMessage", errorMessage);
}
function getParent(targetCapId) 
{
	// returns the capId object of the parent.  Assumes only one parent!
	//
	var getCapResult = aa.cap.getProjectParents(targetCapId,1);
	if (getCapResult.getSuccess())
	{
		var parentArray = getCapResult.getOutput();
		if (parentArray.length)
			return parentArray[0].getCapID();
		else
			{
			aa.print("**WARNING: GetParent found no project parent for this application");
			return false;
			}
	}
	else
	{ 
		aa.print("**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
		return false;
	}
}

function loadASITable(tname) 
{
	itemCap = arguments[1]; // use cap ID specified in args

	var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
	var ta = gm.getTablesArray()
	var tai = ta.iterator();

	while (tai.hasNext())
	{
	  var tsm = tai.next();
	  var tn = tsm.getTableName();

      if (!tn.equals(tname)) continue;

	  if (tsm.rowIndex.isEmpty())
	  	{
			aa.print("Couldn't load ASI Table " + tname + " it is empty");
			return false;
		}

   	  var tempObject = new Array();
	  var tempArray = new Array();

  	  var tsmfldi = tsm.getTableField().iterator();
	  var tsmcoli = tsm.getColumns().iterator();
      var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
	  var numrows = 1;

	  while (tsmfldi.hasNext())  // cycle through fields
		{
		if (!tsmcoli.hasNext())  // cycle through columns
			{
			var tsmcoli = tsm.getColumns().iterator();
			tempArray.push(tempObject);  // end of record
			var tempObject = new Array();  // clear the temp obj
			numrows++;
			}
		var tcol = tsmcoli.next();
		var tval = tsmfldi.next();
		var readOnly = 'N';
		if (readOnlyi.hasNext()) {
			readOnly = readOnlyi.next();
		}
		var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
		tempObject[tcol.getColumnName()] = fieldInfo;
		}		
	  tempArray.push(tempObject);  // end of record
	}	
	return tempArray;
}

function asiTableValObj(columnName, fieldValue, readOnly) {
	this.columnName = columnName;
	this.fieldValue = fieldValue;
	this.readOnly = readOnly;

	asiTableValObj.prototype.toString=function(){ return this.fieldValue }
};
	
function addASITable(tableName,tableValueArray) // optional capId
{
  	//  tableName is the name of the ASI table
  	//  tableValueArray is an array of associative array values.  All elements MUST be either a string or asiTableVal object
  	if (arguments.length > 2)
  		itemCap = arguments[2]; // use cap ID specified in args
  
  	var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(itemCap,tableName)
  
  	if (!tssmResult.getSuccess())
  		{ aa.print("**WARNING: error retrieving app specific table " + tableName + " " + tssmResult.getErrorMessage()) ; return false }
  
  	var tssm = tssmResult.getOutput();
  	var tsm = tssm.getAppSpecificTableModel();
  	var fld = tsm.getTableField();
    var fld_readonly = tsm.getReadonlyField(); // get Readonly field
  
    for (thisrow in tableValueArray)
	{
  
  		var col = tsm.getColumns()
  		var coli = col.iterator();
  
  		while (coli.hasNext())
  		{
  			var colname = coli.next();
  
			if (typeof(tableValueArray[thisrow][colname.getColumnName()]) == "object")  // we are passed an asiTablVal Obj

				{
	  			fld.add(tableValueArray[thisrow][colname.getColumnName()].fieldValue);
	  			fld_readonly.add(tableValueArray[thisrow][colname.getColumnName()].readOnly);
				}
			else // we are passed a string
				{
  				fld.add(tableValueArray[thisrow][colname.getColumnName()]);
  				fld_readonly.add(null);
				}
  		}
  
  		tsm.setTableField(fld);
  
  		tsm.setReadonlyField(fld_readonly);
  
  	}
  
  	var addResult = aa.appSpecificTableScript.editAppSpecificTableInfos(tsm, itemCap, currentUserID);
  
  	 if (!addResult .getSuccess())
  		{ aa.print("**WARNING: error adding record to ASI Table:  " + tableName + " " + addResult.getErrorMessage()) ; return false }
  	else
		{
			//Refresh Cap Model (Custom Addition by Engineering, but wasn't able to submit ACA record)
			//var tmpCap = aa.cap.getCapViewBySingle(capId);
			//cap.setAppSpecificTableGroupModel(tmpCap.getAppSpecificTableGroupModel()); 

			aa.print("Successfully added record to ASI Table: " + tableName);
		}
  
}