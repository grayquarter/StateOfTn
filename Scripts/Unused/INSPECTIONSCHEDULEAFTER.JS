
branch('EMSE:GlobalFlags');
branch('ISA:' + appTypeArray[0] + '/*/*/*');
branch('ISA:' + appTypeArray[0] + '/' + appTypeArray[1] + '/*/*');
branch('ISA:' + appTypeArray[0] + '/' + appTypeArray[1] + '/' + appTypeArray[2] + '/*');
branch('ISA:' + appTypeString);
if (matches(currentUserID,'TESTDRIVE')) {
	branch('EMSE:TESTDRIVE_ISA');
	}

