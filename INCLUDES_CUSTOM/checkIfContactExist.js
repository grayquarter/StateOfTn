function checkIfContactExist(contType) {
	// TODO: disabled try/catch since all MS 3.0 scripts execute in a try/catch
	//	try {
	var capContactResult = aa.people.getCapContactByCapID(capId);
	if (capContactResult.getSuccess()) {
		var Contacts = capContactResult.getOutput();
		//logDebug("Count:" + Contacts.length);
		for (yy in Contacts) {
			var contact = Contacts[yy].getCapContactModel();
			var contactType = contact.getContactType();
			//logDebug("contactType:" + contactType);
			if (contactType.toUpperCase().equals(contType)) {
				return true;
			}
		}
	}
	return false;
	//	} catch (err) {
	//		logDebug(err)
	//	}
}
