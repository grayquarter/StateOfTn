function comparePeopleTNABC(peop) {

	/* 	this function will be passed as a parameter to the createRefContactsFromCapContactsAndLink function.
	takes a single peopleModel as a parameter, and will return the sequence number of the first G6Contact result
	returns null if there are no matches

	Best Practice Template Version uses the following algorithm:

	1.  Match on SSN/FEIN if either exist
	2.  else, match on Email Address if it exists
	3.  else, match on First, Middle, Last Name combined with birthdate if all exist

	This function can use attributes if desired 	*/

	if (peop.getContactTypeFlag() == "individual") {
		tmpSSN = "" + peop.getSocialSecurityNumber();
		tmpFein = "" + peop.getFein();

		if ((tmpSSN != "null" && tmpSSN != "") || (tmpFein != "null" && tmpFein != "")) {
			var qryPeople = aa.people.createPeopleModel().getOutput().getPeopleModel();

			qryPeople.setSocialSecurityNumber(peop.getSocialSecurityNumber());
			qryPeople.setFein(peop.getFein());

			var r = aa.people.getPeopleByPeopleModel(qryPeople);

			if (!r.getSuccess()) {
				logDebug("WARNING: error searching for people : " + r.getErrorMessage());
				return false;
			}

			var peopResult = r.getOutput();

			if (peopResult.length > 0) {
				logDebug("Searched for a REF Contact, " + peopResult.length + " matches found! returning the first match : " + peopResult[0].getContactSeqNumber());
				return peopResult[0].getContactSeqNumber();
			}
		}

		if (peop.getPhone1() && peop.getLastName() && peop.getFirstName() && peop.getEmail()) {
			var qryPeople = aa.people.createPeopleModel().getOutput().getPeopleModel();

			qryPeople.setPhone1(peop.getPhone1());
			qryPeople.setLastName(peop.getLastName());
			qryPeople.setFirstName(peop.getFirstName());
			qryPeople.setMiddleName(peop.getMiddleName());
			qryPeople.setEmail(peop.getEmail());

			var r = aa.people.getPeopleByPeopleModel(qryPeople);

			if (!r.getSuccess()) {
				logDebug("WARNING: error searching for people : " + r.getErrorMessage());
				return false;
			}

			var peopResult = r.getOutput();

			if (peopResult.length > 0) {
				logDebug("Searched for a REF Contact, " + peopResult.length + " matches found! returning the first match : " + peopResult[0].getContactSeqNumber());
				return peopResult[0].getContactSeqNumber();
			}
		}
	}

	if (peop.getContactTypeFlag() == "organization") {
		if (peop.getTradeName() || peop.getBusinessName()) {
			var qryPeople = aa.people.createPeopleModel().getOutput().getPeopleModel();

			qryPeople.setTradeName(peop.getTradeName());
			qryPeople.setBusinessName(peop.getBusinessName());

			var r = aa.people.getPeopleByPeopleModel(qryPeople);

			if (!r.getSuccess()) {
				logDebug("WARNING: error searching for people : " + r.getErrorMessage());
				return false;
			}

			var peopResult = r.getOutput();

			if (peopResult.length > 0) {
				logDebug("Searched for a REF Contact, " + peopResult.length + " matches found! returning the first match : " + peopResult[0].getContactSeqNumber());
				return peopResult[0].getContactSeqNumber();
			}
		}

	}

	logDebug("ComparePeople did not find a match");
	return false;
}
