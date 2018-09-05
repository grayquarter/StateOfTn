function createContact4ACA(strBusiName,strContType,strLglBusiStruct,strCharDt,strAddress1,strAddress2,strCity,strState,strZip,strCountry)
{
	peopleResult = aa.people.createPeopleModel();
	newPMObj = peopleResult.getOutput().getPeopleModel();

	newPMObj.setBusinessName(strBusiName);
	newPMObj.setContactType(strContType);
	newPMObj.setServiceProviderCode(aa.getServiceProviderCode());

	//Get Template
	// contact ASI
	// This is the ASI Group Name that is tied to the contact type
	var tm = aa.genericTemplate.getTemplateStructureByGroupName("C-BUSINESS").getOutput();
	if (tm)      {
		  var templateGroups = tm.getTemplateForms();
		  var gArray = new Array();
		  
		  if (!(templateGroups == null || templateGroups.size() == 0)) {
		  		 var subGroups = templateGroups.get(0).getSubgroups();
				 for (var subGroupIndex = 0; subGroupIndex < subGroups.size(); subGroupIndex++) {
					   var subGroup = subGroups.get(subGroupIndex);
					   var fields = subGroup.getFields();
					   for (var fieldIndex = 0; fieldIndex < fields.size(); fieldIndex++) {
							  var field = fields.get(fieldIndex);
							  //aa.print("Contact Template: " + field.getDisplayFieldName()) 
							  //aa.print("Contact Tempalte Value: " + field.getDefaultValue());
							  
							  //test the attribute label to confirm you are updating right attribute
							if (String(field.getDisplayFieldName()) == "Legal Business Structure"){
								field.setDefaultValue(strLglBusiStruct); //Set the Attribute Value
							}else if(String(field.getDisplayFieldName()) == "Charter Date"){
								field.setDefaultValue(strCharDt); //Set the Attribute Value
							}
							  
					   }
				 }
		  }
	}

	//set the generic Template on the contact
    newPMObj.setTemplate(tm);
	
	// instantiate a CapContactModel
	var ccm = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.CapContactModel").getOutput();
	// update the peoplemodel on the new object
	ccm.setCapID(capId);
	ccm.setPeople(newPMObj);

	//Create the capContact and get the sequence number
	aa.people.createCapContact(ccm);
	var capContactID = ccm.getContactSeqNumber();

	// add the address
	// check country
	if(strCountry=="USA")
	{
		strCountry="US";
	}
	
	// remove line breaks from state
	strState=(strState + "").replace(/[\\]/g, "\\\\").replace(/[\"]/g, "\\\""); //strState.replace(/[\r\n]/g, '); //.replace(/(\r\n|\n|\r)/gm,"");
	strState=strState.trim();
	
	var conAdd = aa.address.createContactAddressModel().getOutput().getContactAddressModel();
	conAdd.setEntityType("CAP_CONTACT");
	conAdd.setEntityID(parseInt(capContactID));
	conAdd.setAddressType("Mailing");
	conAdd.setAddressLine1(strAddress1);
	conAdd.setAddressLine2(strAddress2);
    conAdd.setCity(strCity);
    conAdd.setState(strState);
    conAdd.setZip(strZip);
	conAdd.setCountryCode("US");
	conAdd.setStatus("A");
	
	//Create AddressList 
    var contactAddrModelArr = aa.util.newArrayList();
    contactAddrModelArr.add(conAdd);
    
	// set the address
	newPMObj.setContactAddressList(contactAddrModelArr);
	   
	// instantiate a CapContactModel
	var ccm = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.CapContactModel").getOutput();
	// update the peoplemodel on the new object
	ccm.setCapID(capId);
	ccm.setPeople(newPMObj);
	
	// update the capModel
	cap.setApplicantModel(ccm);

}


