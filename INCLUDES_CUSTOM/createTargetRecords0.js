function createTargetRecords0() {

	LICcomm = 'Created from Operation Record # ' + capIDString;
	comment(LICcomm);
	opAltId = capIDString;
	count = 000;
	if (typeof(TARGETLIST) == 'object') {
		for (eachrow in TARGETLIST)
			//start replaced branch: TABC_Create_Target_Records_1
		{
			count = count + 001;
			saveCap = capId;
			feeRow = TARGETLIST[eachrow];
			comment('feeRow ===> ' + count);
			licCap = TARGETLIST[eachrow]['License Number'].toString();
			tgtCap = TARGETLIST[eachrow]['Target Record ID'].toString();
			comment('===> License/Target Cap: ' + licCap + '  ' + tgtCap);
			if (!tgtCap) {
				newAppID = createTarget('TNABC', 'Enforcement', 'Target', 'NA', LICcomm, 'Pending Investigation', true, false, null, false, LICcomm, opAltId, count);
				altid = newAppID;
				XICcomm = '=====> Source CAP # ' + capIDString;
				comment(XICcomm + ' - Target CAP # ' + altid);
				updateTask('Investigation', 'Pending Investigation');
				updateAppStatus('Pending Investigation', 'Initial Target creation');
				comment('===> ChildID:' + newAppID.getCustomID());
				comment('===> License Number: ' + TARGETLIST[eachrow]['License Number'].toString());
				editASITableRow(saveCap, 'TARGET LIST', 'License Number', TARGETLIST[eachrow]['License Number'].toString(), 'Target Record ID', newAppID.getCustomID().toString());
				copyASITables(saveCap, altid);
				LicCapId = aa.cap.getCapID(licCap).getOutput();
				comment('===> Pre CopyAddress  =========> ' + LicCapId + '     ' + altid);
				copyAddresses(LicCapId, altid);
				tempCap = capId;
				capId = saveCap;
				copyAppSpecific(altid);
				capId = tempCap;
			}

		}
		//end replaced branch: TABC_Create_Target_Records_1;
	}

}
