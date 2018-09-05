function copyAppSpecificTable(capId, parentCapId) {
	parentAppNum = parentCapId.getCustomID();
	var tableNameArray = getTableName(capId);
	if (tableNameArray == null) {
		return;
	}

	//for (l in tableNameArray)
	//aa.print("Table: " + tableNameArray[l]);

	for (loopk in tableNameArray) {
		var tableName = tableNameArray[loopk];
		//if (!matches(tableName,"OFFICER/OWNERSHIP INFORMATION","SIGNING AUTHORITY","POWER OF ATTORNEY INFORMATION"))
		//continue;

		aa.print("Checking Amnd Table : " + tableName + " for rows");

		amndTableArray = new Array();
		origTableArray = new Array();
		udtedTableArray = new Array();

		amndTableArray = loadTable(tableName, capId);
		origTableArray = loadTable(tableName, parentCapId);

		if (amndTableArray != undefined && amndTableArray.length > 0) {
			//for each row in orig table
			for (loopOE in origTableArray) {

				var aRowFound = false;

				var origID = origTableArray[loopOE]["Certified Manager RLPS ID"];
				var oClrkName = origTableArray[loopOE]["First Name"] + origTableArray[loopOE]["Middle Name"] + origTableArray[loopOE]["Last Name"];

				aa.print("Checking Original For updates on Row: " + origID + "/" + oClrkName);

				//for each row in amend table
				for (loopAE in amndTableArray) {
					//find matching Record#
					var amndID = amndTableArray[loopAE]["Certified Manager RLPS ID"];
					var amndStatus = amndTableArray[loopAE]["Change Status"];
					var aClrkName = amndTableArray[loopAE]["First Name"] + amndTableArray[loopAE]["Middle Name"] + amndTableArray[loopAE]["Last Name"];

					if (tableName.equals("CERTIFIED MANAGER LIST") && (amndID != undefined && String(origID) == String(amndID))) {
						//if found push amnd table row
						udtedTableArray.push(amndTableArray[loopAE]);
						aRowFound = true;
						aa.print("Original Row: " + origID + " found in Amendment; Copying");

						aa.print("Change Status: " + amndStatus);
						if (amndStatus == "Inactive") {
							//if Row has been deleted from Amendment or marked Inactive remove record from hierarchy
							var desMgrCAPId = aa.cap.getCapID(origID).getOutput();
							removeParent(parentAppNum, desMgrCAPId);
						}
						continue;
					} else {
						if (tableName.equals("CERTIFIED CLERK LIST") && (oClrkName == aClrkName)) {
							//if found push amnd table row
							udtedTableArray.push(amndTableArray[loopAE]);
							aRowFound = true;
							aa.print("Original Row: " + oClrkName + " found in Amendment; Copying");
							continue;
						}
					}

				}

				//if matching row not found update orig row inactive & push orig row
				if (!aRowFound) {
					origTableArray[loopOE]["Change Status"].fieldValue = "Inactive";
					aa.print("Row: " + origID + "/" + oClrkName + " not found in Amendment; Inactivating");

					udtedTableArray.push(origTableArray[loopOE]);
				}

			}

			//for each row in amend table

			//loop through orig table to find Record; if not found push amend table row
			for (loopAN in amndTableArray) {

				var nRowFound = true;

				var amndNID = amndTableArray[loopAN]["Certified Manager RLPS ID"];
				var amndClrkName = amndTableArray[loopAN]["First Name"] + amndTableArray[loopAN]["Middle Name"] + amndTableArray[loopAN]["Last Name"];

				aa.print("Checking Amendment For Row not in Original: " + amndNID + "/" + amndClrkName);

				//for each row in orig table
				for (loopON in origTableArray) {
					//find matching Record#
					var origNID = origTableArray[loopON]["Certified Manager RLPS ID"];
					var origClrkName = origTableArray[loopON]["First Name"] + origTableArray[loopON]["Middle Name"] + origTableArray[loopON]["Last Name"];

					if (tableName.equals("CERTIFIED MANAGER LIST") && (String(amndNID) == String(origNID))) {
						aa.print("origNID: " + origNID + "/" + origClrkName);
						aa.print("HERE");
						//if found skip & go to next
						aa.print("Amendment Row: " + amndNID + " found in Original; Skipping");
						nRowFound = false;
						continue;
					} else {
						if (tableName.equals("CERTIFIED CLERK LIST") && (amndClrkName == origClrkName)) {
							aa.print("HERE2");
							//if found skip & go to next
							aa.print("Amendment Row: " + amndClrkName + " found in Original; Skipping");
							nRowFound = false;
							continue;
						}
					}
				}
				aa.print("New Row? " + nRowFound);

				//if matching row not found push amnd row to new table
				if (nRowFound) {
					aa.print("HERE3");
					udtedTableArray.push(amndTableArray[loopAN]);
					aa.print("Row: " + amndNID + "/" + amndClrkName + " not found in Original; Copying");
				}
			}

			//update orig w/new table entries
			removeASITable(tableName, parentCapId);
			addASITable(tableName, udtedTableArray, parentCapId);
		} else
			aa.print("NO Rows on Amendment.  Skipping");
	}
}
