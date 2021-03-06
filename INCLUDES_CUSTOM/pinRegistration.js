function pinRegistration(pin, publicUserId) {
	if (arguments.length > 2) {
		setAsCreator = arguments[2];
	} else {
		setAsCreator = true;
	}
	if (arguments.length > 3) {
		linkFirstLP = arguments[3];
	} else {
		linkFirstLP = true;
	}
	if (arguments.length > 4) {
		linkFirstContact = arguments[4];
	} else {
		linkFirstContact = true;
	}
	if (arguments.length > 5) {
		contactType = arguments[5];
	}

	// get the public user
	var puserObj = aa.publicUser.getPublicUserByPUser(publicUserId).getOutput();
	if (puserObj) {
		var puserSeq = puserObj.getUserSeqNum();
		logDebug("public user: " + puserObj);
	} else {
		logDebug("Public user does not exist. " + publicUserId);
		return false;
	}

	//get parent record
	var parentCapIdResult = aa.cap.getCapID(pin.substr(0, 5), "00000", pin.substr(5, 10));
	if (!parentCapIdResult.getSuccess()) {
		logDebug("Could not find parent record with PIN: " + pin);
		return false;
	}

	var parentCapId = parentCapIdResult.getOutput();

	if (linkFirstContact) {
		// find the record contact with the correct contact type
		var refContactNbr = null;
		var contacts = aa.people.getCapContactByCapID(parentCapId).getOutput();
		var refContactNbr;
		var recContactExists = false;

		// if contactType was not specified, get the first contact
		if (contactType) {
			for (c in contacts) {
				if (contactType && contacts[c].getCapContactModel().getContactType() == contactType) {
					refContactNbr = contacts[c].getCapContactModel().getRefContactNumber();
					recContactExists = true;
					// create ref contact if the record contact is not already linked to reference
					if (!refContactNbr) {
						logDebug("Ref contact does not exist, creating one.")
						var contactTypeArray = new Array(contactType);
						createRefContactsFromCapContactsAndLink(parentCapId, contactTypeArray, iArr, false, false, comparePeopleStandard);
					}
					break;
				}
			}
			if (!recContactExists)
				logDebug("No record contact exists with type: " + contactType);
		} else {
			logDebug("No contact type specified. No contact was linked to public user.")
		}

		// associate the ref contact with the public user
		var linkResult = aa.licenseScript.associateContactWithPublicUser(puserSeq, refContactNbr);
		logDebug("Successfully associated contact with public user: " + refContactNbr);
	}

	// find the LP and associate to the public user
	if (linkFirstLP) {
		logDebug("Parent CAP ID: " + parentCapId);
		var licProf = createRefLicProfFromLicProf(parentCapId);
		logDebug("Reference License Professional ID: " + licProf);

		// var licProfArray = getLicenseProfessional(parentCapId);
		// var licProf = licProfArray[0];
		 if (licProf) {
			
			var refLP = aa.licenseScript.getRefLicensesProfByLicNbr(aa.servProvCode, licProf).getOutput();
			if (refLP) {
	            aa.licenseScript.associateLpWithPublicUser(puserObj, refLP[0]);
		        logDebug("Successfully associated LP with public user.");
			} else {
				logDebug("No reference LP exists to associate to the public user.");
			 }
		 } else {
			 logDebug("No LP on record to associate to public user.");
		 }
	}

	// make the public user the record creator
	if (setAsCreator) {
		var createdByResult = aa.cap.updateCreatedAccessBy4ACA(parentCapId, publicUserId, "Y", "N");
		if (!createdByResult.getSuccess()) {
			logDebug("Error updating created by ACA: " + createdbyResult.getErrorMessage());
		} else {
			logDebug("Successfully set public user as record creator.");
		}
	}
}

