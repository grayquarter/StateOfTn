function editCapConditionStatus(pType, pDesc, pStatus, pStatusType) {
	// updates a condition with the pType and pDesc
	// to pStatus and pStatusType, returns true if updates, false if not
	// will not update if status is already pStatus && pStatusType
	// all parameters are required except for pType

	if (pType == null)
		var condResult = aa.capCondition.getCapConditions(capId);
	else
		var condResult = aa.capCondition.getCapConditions(capId, pType);

	if (condResult.getSuccess())
		var capConds = condResult.getOutput();
	else {
		logMessage("**ERROR: getting cap conditions: " + condResult.getErrorMessage());
		logDebug("**ERROR: getting cap conditions: " + condResult.getErrorMessage());
		return false;
	}

	for (cc in capConds) {
		var thisCond = capConds[cc];
		var cStatus = thisCond.getConditionStatus();
		var cStatusType = thisCond.getConditionStatusType();
		var cDesc = thisCond.getConditionDescription();
		logDebug("Condition: " + cDesc + " " + cStatus + ": " + cStatusType);

		if (cDesc.toUpperCase() == pDesc.toUpperCase()) {
			if (!pStatus.toUpperCase().equals(cStatus.toUpperCase())) {
				thisCond.setConditionStatus(pStatus);
				thisCond.setConditionStatusType(pStatusType);
				aa.capCondition.editCapCondition(thisCond);
				logDebug("Condition Updated: " + cDesc + " " + cStatus + ": " + cStatusType);

				return true;
				// condition has been found and updated
			} else {
				logDebug("ERROR: condition " + cDesc + " found but already in the status of " + cStatus + " and type of " + cStatusType);
				return false;
				// condition found but already in the status of pStatus and pStatusType
			}
		}
	}

	logDebug("ERROR: no matching condition found for " + cDesc);
	return false;
	// no matching condition found

}


