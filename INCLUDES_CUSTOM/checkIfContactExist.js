function checkIfContactExist(contType) {
	try {
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
	} catch (err) {
		logDebug(err)
	}
}
