
branch('EMSE:GlobalFlags');
branch('ASA:' + appTypeArray[0] + '/*/*/*');
branch('ASA:' + appTypeArray[0] + '/' + appTypeArray[1] + '/*/*');
branch('ASA:' + appTypeArray[0] + '/' + appTypeArray[1] + '/' + appTypeArray[2] + '/*');
branch('ASA:' + appTypeArray[0] + '/*/*/' + appTypeArray[3]);
branch('ASA:' + appTypeArray[0] + '/' + appTypeArray[1] + '/*/' + appTypeArray[3]);
branch('ASA:' + appTypeArray[0] + '/*/'+ appTypeArray[2] + '/*');
branch('ASA:' + appTypeString);
if (matches(currentUserID,'PUBLICUSER153')) {
	branch('EMSE:TESTDRIVE_ASA');
	}

