
// DISABLED: CTRCA:TNABC/Change Request/Manager/NA:10
// if (parentCapId) {
// 	parentAltID = parentCapId.getCustomID();
// 	logDebug('PARENT ALT ID: ' + parentAltID);
// 	logDebug('PARENT CAP ID: ' + parentCapId );
// 	addCertifiedManagers(parentCapId);
// 	copyAppSpecificTable(capId, parentCapId );
// 	}


/*
Event Script: CTRCA:TNABC/CHANGE REQUEST/MANAGER/NA
Event: ConvertToRealCapAfter

CHANGE LOG:
06/29/2018 (Chris Kim)
-- Modified block to replace Certified Clerks List in the parent with whatever was in the Amendment.

-- Modified LBD block for Manager INFO ASIT.
 */

if (typeof(CERTIFIEDMANAGERLIST) == "object" && CERTIFIEDMANAGERLIST.length > 0 && parentCapId) {
	parentAltID = parentCapId.getCustomID();
	logDebug("PARENT ALT ID: " + parentAltID);
	logDebug("PARENT CAP ID: " + parentCapId);

	//Added to Refresh the parent list.
	//removeASITable("CERTIFIED MANAGER LIST",parentCapId);


	var parentCap = aa.cap.getCap(parentCapId).getOutput();
	var parentAppTypeResult = parentCap.getCapType();
	var parentAppTypeString = parentAppTypeResult.toString();
	var parentAppTypeArray = parentAppTypeString.split("/");

	if (parentAppTypeArray[1].equals("Retail")) {
		addCertifiedManagers(parentCapId);
		removeASITable("CERTIFIED MANAGER LIST", parentCapId);
		removeASITable("CERTIFIED CLERK LIST", parentCapId);
		copyAppSpecificTable(capId, parentCapId);
	} else {
		removeASITable("CERTIFIED MANAGER LIST", parentCapId);
		removeASITable("CERTIFIED CLERK LIST", parentCapId);
		copyASITables(capId, parentCapId);
	}
}

// TODO: embedded redefined custom function name, could cause confusion.   Consider renaming and placing in INCLUDES_CUSTOM dir 
function copyAppSpecificTable(srcCapId, targetCapId) {
	var tableNameArray = getTableName(srcCapId);
	if (tableNameArray == null) {
		return;
	}
	for (loopk in tableNameArray) {
		var tableName = tableNameArray[loopk];
		var targetAppSpecificTable = loadASITable(tableName, srcCapId);

		if (tableName != "RPS APP" || tableName != "RPS APP GROUP" || tableName != "LICENSES") {
			addASITable(tableName, targetAppSpecificTable, targetCapId);
		}
	}
}
