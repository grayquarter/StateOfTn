function loadTable(tableName, capId)
{
		var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(capId).getOutput();
		var ta = gm.getTablesArray()
		var tai = ta.iterator();

		while (tai.hasNext())
		{
			var tsm = tai.next();
			var tn = tsm.getTableName();

			
			if (!tn.equals(tableName))
				continue;

			if (!tsm.rowIndex.isEmpty())
			{
				var tempObject = new Array();
				var tempArray = new Array();

				var tsmfldi = tsm.getTableField().iterator();
				var tsmcoli = tsm.getColumns().iterator();
				var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly field
				var numrows = 1;
				var columnSize = tsm.getColumns().size();
				
				while (tsmfldi.hasNext())  // cycle through fields
				{
					if (!tsmcoli.hasNext())  // cycle through columns
					{
						var tsmcoli = tsm.getColumns().iterator();
						tempArray.push(tempObject);  // end of record
						var tempObject = new Array();  // clear the temp obj
						numrows++;
					}
					var tcol = tsmcoli.next();
					var tval = tsmfldi.next();
					var readOnly = 'N';
					if (readOnlyi.hasNext()) 
						readOnly = readOnlyi.next();
					var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
					tempObject[tcol.getColumnName()] = fieldInfo;

				}
				tempArray.push(tempObject);  // end of record
			}
		}
		//if (tempArray != undefined)
			//aa.print("Total Rows in " + tableName + ": " + tempArray.length);	

	return tempArray;
}

