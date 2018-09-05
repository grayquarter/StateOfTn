
branch('EMSE:GlobalFlags');
branch('WTUA:' + appTypeArray[0] + '/*/*/*');
branch('WTUA:' + appTypeArray[0] + '/' + appTypeArray[1] + '/*/*');
branch('WTUA:' + appTypeArray[0] + '/' + appTypeArray[1] + '/' + appTypeArray[2] + '/*');
branch('WTUA:' + appTypeArray[0] + '/*/*/' + appTypeArray[3]);
branch('WTUA:' + appTypeArray[0] + '/' + appTypeArray[1] + '/*/' + appTypeArray[3]);
branch('WTUA:' + appTypeArray[0] + '/*/'+ appTypeArray[2] + '/*');
branch('WTUA:' + appTypeString);
if (matches(currentUserID,'TESTDRIVE')) {
	branch('EMSE:TESTDRIVE_WTUA');
	}

