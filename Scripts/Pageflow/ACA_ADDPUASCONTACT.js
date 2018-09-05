/*------------------------------------------------------------------------------------------------------/
| Event   : ACA_ADDPUAsContact
|
| Usage   : 
|
| Notes   :
|
/------------------------------------------------------------------------------------------------------*/
var errorMessage = "";
 
var errorCode = "0";
var useAppSpecificGroupName = false;			// Use Group name when populating App Specific Info Values

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
    var cap = aa.env.getValue("CapModel");
	
    capId = cap.getCapID();
	
    aa.debug("Debug","capId:" + capId);
	
    try
    {
		aa.debug("Debug","GO");
		
		attachPUAsContact("Business Information");
		
		var amendCapModel = aa.cap.getCapViewBySingle4ACA(capId);

		aa.env.setValue("CapModel", amendCapModel);
		aa.env.setValue("CAP_MODEL_INITED", "TRUE");       
    }
    catch(e)
    { 
      aa.debug("Debug","Error occurred while copy information:"+e); 
    }
}

function attachPUAsContact(conType) 
{	
	applicantAdded = false;
	
	var c1Added = false;
	
	var currentUserID = aa.env.getValue("CurrentUserID");  // Current User
	var seqNbr = currentUserID.substring(10);
	
	//var publicUserModel = aa.env.getValue("PublicUserModel");
	var publicUserModel=aa.publicUser.getPublicUser(parseInt(seqNbr)).getOutput();
	//aa.debug("Debug","publicUserModel: " + publicUserModel);
	aa.debug("Debug","seqNbr: " + seqNbr);
	
	//for (x in publicUserModel)
		//aa.debug("Debug","publicUserModel[x]: " + publicUserModel[x]);
			
	var contactType = conType;//set contact type you want

	if(publicUserModel != null)
	{
		var newConRef = null;
		
		var email = publicUserModel.getEmail();

		//get Reference Contact model to get Ref Seq#
		aa.debug("Debug","Finding Reference");
		
		var newPeople = aa.people.createPeopleModel().getOutput().getPeopleModel();
		newPeople.setEmail(email);
		
		var result = aa.people.getPeopleByPeopleModel(newPeople);
		
		if (result.getOutput() != null && result.getOutput().length > 0)
		{
			//aa.debug("Debug","Retrive Ref Contacts length = " + result.getOutput().length);

			newConRef = result.getOutput()[0];
			//for (x in newConRef)
				//aa.debug("Debug","Model " + x + ": " + newConRef[x]);			
			
			aa.debug("Debug","Ref ContactSeqNbr = " + newConRef.getContactSeqNumber());			
		}		
		else
		{
			newConRef = null;
			aa.debug("Debug","No Reference found");
		}
		if (newConRef != null)
		{
			//get initial contact
			var CapContactModel = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.CapContactModel").getOutput();

			aa.debug("Debug","capContact: " + CapContactModel);
			
			//set values for new contact
			CapContactModel.setCapID(capId);
			CapContactModel.setRefContactNumber(newConRef.getContactSeqNumber());
			
			CapContactModel.setContactType(contactType);
			CapContactModel.setBusinessName(newConRef.getBusinessName());

			CapContactModel.setFullName(newConRef.getPeopleModel().fullName);			
			CapContactModel.setFirstName(newConRef.getPeopleModel().firstName);
			CapContactModel.setMiddleName(newConRef.getPeopleModel().middleName);
			CapContactModel.setLastName(newConRef.getPeopleModel().lastName);
			CapContactModel.setEmail(email);			
			
			CapContactModel.setAddressLine1(newConRef.getCompactAddress().getAddressLine1());
			CapContactModel.setCity(newConRef.getCompactAddress().getCity());
			CapContactModel.setState(newConRef.getCompactAddress().getState());
			CapContactModel.setZip(newConRef.getCompactAddress().getZip());
			
			//Set Contact Work Phone
			CapContactModel.setPhone2(newConRef.getPhone2());	
			
			//Set Contact Mobile Phone
			CapContactModel.setPhone3(newConRef.getPhone3());

			//Set Contact Fax Phone
			CapContactModel.setFax(newConRef.getFax());


			//add Cap contact from Reference found to Applicant
			aa.people.createCapContact(CapContactModel);
			
			aa.debug("Debug","Ref Contact#: " +CapContactModel.getRefContactNumber());
		}
	}
}
function getAppSpecific(itemName)  // optional: itemCap
{
	var updated = false;
	var i=0;
	var itemCap = arguments[1]; // use cap ID specified in args
   	
    var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
	if (appSpecInfoResult.getSuccess())
 	{
		var appspecObj = appSpecInfoResult.getOutput();
		
		if (itemName != "")
		{
			for (i in appspecObj)
				if( appspecObj[i].getCheckboxDesc() == itemName)
				{
					return appspecObj[i].getChecklistComment();
					break;
				}
		} // item name blank
	} 
	else
		{ aa.debug("Debug", "**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage()) }
}

function editAppSpecific(itemName,itemValue)  // optional: itemCap
{
	var updated = false;
	var i=0;
	
	itemCap = capId;
	
	if (arguments.length == 3) itemCap = arguments[2]; // use cap ID specified in args
   	
  	if (useAppSpecificGroupName)
	{
		if (itemName.indexOf(".") < 0)
			{ aa.debug("Debug","**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
		
		var itemGroup = itemName.substr(0,itemName.indexOf("."));
		var itemName = itemName.substr(itemName.indexOf(".")+1);
	}
   	
   	var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
	if (appSpecInfoResult.getSuccess())
 	{
		var appspecObj = appSpecInfoResult.getOutput();
		if (itemName != "")
		{
			while (i < appspecObj.length && !updated)
			{
				if (appspecObj[i].getCheckboxDesc() == itemName && (!useAppSpecificGroupName || appspecObj[i].getCheckboxType() == itemGroup))
				{
					appspecObj[i].setChecklistComment(itemValue);
						
					var actionResult = aa.appSpecificInfo.editAppSpecInfos(appspecObj);
					if (actionResult.getSuccess()) 
					{							
						aa.debug("Debug","app spec info item " + itemName + " has been given a value of " + itemValue);
					} 
					else 
					{
						aa.debug("Debug","**ERROR: Setting the app spec info item " + itemName + " to " + itemValue + " .\nReason is: " +   actionResult.getErrorType() + ":" + actionResult.getErrorMessage());
					}
						
					updated = true;
					//AInfo[itemName] = itemValue;  // Update array used by this script
				}
				
				i++;
				
			} // while loop
		} // item name blank
	} // got app specific object	
	else
	{ 
		aa.debug("Debug", "**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage());
	}
}//End Function

