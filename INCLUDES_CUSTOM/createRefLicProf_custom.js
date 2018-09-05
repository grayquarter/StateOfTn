function createRefLicProf_custom(rlpId, rlpType, pContactType) {
	var itemCap = capId;

	if (arguments.length == 4)
		itemCap = arguments[3]; // use cap ID specified in args

	//Creates/updates a reference licensed prof from a Contact
	//06SSP-00074, modified for 06SSP-00238
	var updating = false;
	var capContResult = aa.people.getCapContactByCapID(capId);
	if (capContResult.getSuccess()) {
		conArr = capContResult.getOutput();
	} else {
		logDebug("**ERROR: getting cap contact: " + capAddResult.getErrorMessage());
		return false;
	}

	if (!conArr.length) {
		logDebug("**WARNING: No contact available");
		return false;
	}

	var newLic = getRefLicenseProf(rlpId)

		if (newLic) {
			updating = true;
			logDebug("Updating existing Ref Lic Prof : " + rlpId);
		} else
			var newLic = aa.licenseScript.createLicenseScriptModel();

		var licenseModel = newLic.getLicenseModel();

	// set license template
	var result = aa.genericTemplate.getTemplateStructureByGroupName("LIC_GENERAL");
	licenseModel.setTemplate(result.getOutput());

	//get contact record
	if (pContactType == null)
		var cont = conArr[0]; //if no contact type specified, use first contact
	else {
		var contFound = false;
		for (yy in conArr) {
			if (pContactType.equals(conArr[yy].getCapContactModel().getPeople().getContactType())) {
				cont = conArr[yy];
				contFound = true;
				break;
			}
		}
		if (!contFound) {
			logDebug("**WARNING: No Contact found of type: " + pContactType);
			return false;
		}
	}

	peop = cont.getPeople();
	addr = peop.getCompactAddress();

	newLic.setContactFirstName(cont.getFirstName());
	//newLic.setContactMiddleName(cont.getMiddleName());  //method not available
	newLic.setContactLastName(cont.getLastName());
	newLic.setBusinessName(peop.getBusinessName());
	newLic.setAddress1(addr.getAddressLine1());
	newLic.setAddress2(addr.getAddressLine2());
	newLic.setAddress3(addr.getAddressLine3());
	newLic.setCity(addr.getCity());
	newLic.setState("TN");
	newLic.setZip(addr.getZip());
	newLic.setPhone1(peop.getPhone1());
	newLic.setPhone2(peop.getPhone2());
	newLic.setEMailAddress(peop.getEmail());
	newLic.setFax(peop.getFax());

	newLic.setAgencyCode(aa.getServiceProviderCode());
	newLic.setAuditDate(sysDate);
	newLic.setAuditID(currentUserID);
	newLic.setAuditStatus("A");

	if (AInfo["Insurance Co"])
		newLic.setInsuranceCo(AInfo["Insurance Co"]);
	if (AInfo["Insurance Amount"])
		newLic.setInsuranceAmount(parseFloat(AInfo["Insurance Amount"]));
	if (AInfo["Insurance Exp Date"])
		newLic.setInsuranceExpDate(aa.date.parseDate(AInfo["Insurance Exp Date"]));
	if (AInfo["Policy #"])
		newLic.setPolicy(AInfo["Policy #"]);

	if (AInfo["Business License #"])
		newLic.setBusinessLicense(AInfo["Business License #"]);
	if (AInfo["Business License Exp Date"])
		newLic.setBusinessLicExpDate(aa.date.parseDate(AInfo["Business License Exp Date"]));

	newLic.setLicenseType(rlpType);

	if (addr.getState() != null)
		newLic.setLicState(addr.getState());
	else
		newLic.setLicState("TN"); //default the state if none was provided

	newLic.setStateLicense(rlpId);

	if (updating)
		myResult = aa.licenseScript.editRefLicenseProf(newLic);
	else
		myResult = aa.licenseScript.createRefLicenseProf(newLic);

	if (myResult.getSuccess()) {
		logDebug("Successfully added/updated License No. " + rlpId + ", Type: " + rlpType);
		logMessage("Successfully added/updated License No. " + rlpId + ", Type: " + rlpType);

		lpsmResult = aa.licenseScript.getRefLicenseProfBySeqNbr(servProvCode, myResult.getOutput())
			if (!lpsmResult.getSuccess()) {
				logDebug("**WARNING error retrieving the LP just created " + lpsmResult.getErrorMessage());
				return null
			}

			lpsm = lpsmResult.getOutput();

		// Now add the LP to the CAP
		asCapResult = aa.licenseScript.associateLpWithCap(itemCap, lpsm)
			if (!asCapResult.getSuccess()) {
				logDebug("**WARNING error associating CAP to LP: " + asCapResult.getErrorMessage())
			} else {
				logDebug("Associated the CAP: " + itemCap + " to the new LP: " + rlpId)
			}

			// Find the public user by contact email address and attach
			puResult = aa.publicUser.getPublicUserByEmail(peop.getEmail())
			if (!puResult.getSuccess()) {
				logDebug("**WARNING finding public user via email address " + peop.getEmail() + " error: " + puResult.getErrorMessage())
			} else {
				var pu = puResult.getOutput();
				var asResult = aa.licenseScript.associateLpWithPublicUser(pu, lpsm)
					if (!asResult.getSuccess()) {
						logDebug("**WARNING error associating LP with Public User : " + asResult.getErrorMessage());
					} else {
						logDebug("Associated LP with public user " + peop.getEmail())
					}
			}

			return lpsm; // return the LP script model

	} else {
		logDebug("**ERROR: cant create ref lic prof: " + myResult.getErrorMessage());
		logMessage("**ERROR: cant create ref lic prof: " + myResult.getErrorMessage());
		return false;
	}
}
