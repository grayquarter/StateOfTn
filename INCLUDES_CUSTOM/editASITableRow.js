function editASITableRow(tableCapId, tableName, keyName, keyValue, editName, editValue) {
	var tableArr = loadASITable(tableName, tableCapId);
	var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos(tableName, tableCapId, "TPATEL");
	if (tableArr) {
		aa.print("updated");

		for (var r in tableArr) {
			if (tableArr[r][keyName] != keyValue) {
				var rowArr = new Array();
				var tempArr = new Array();
				for (var col in tableArr[r]) {
					var tVal = new asiTableValObj(tableArr[r][col].columnName, tableArr[r][col].fieldValue, tableArr[r][col].readOnly);
					var tVal = tableArr[r][col];
					//bizarre string conversion - just go with it
					var colName = new String(tableArr[r][col].columnName.toString());
					colName = colName.toString();
					tempArr[colName] = tVal;
				}
				rowArr.push(tempArr);
				//for (var val in rowArr) for (var c in rowArr[val]) aa.print("Value " + c + ": " + rowArr[val][c]);
				addASITable(tableName, rowArr, tableCapId);
			} else {
				aa.print(" Editing row " + r);
				var rowArr = new Array();
				var tempArr = new Array();
				for (var col in tableArr[r]) {
					if (tableArr[r][col].columnName.toString() == editName) {
						var tVal = tableArr[r][col];
						tVal.fieldValue = editValue;
					} else {
						var tVal = tableArr[r][col];
					}
					//bizarre string conversion - just go with it
					var colName = new String(tableArr[r][col].columnName.toString());
					colName = colName.toString();
					tempArr[colName] = tVal;
				}
				rowArr.push(tempArr);
				//for (var val in rowArr) for (var c in rowArr[val]) aa.print("Value " + c + ": " + rowArr[val][c]);
				addASITable(tableName, rowArr, tableCapId);
			}
		}
	} //end loop
}
