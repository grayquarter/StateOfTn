
branch('IRSA:' + appTypeArray[0] + '/*/*/*');
branch('IRSA:' + appTypeArray[0] + '/' + appTypeArray[1] + '/*/*');
branch('IRSA:' + appTypeArray[0] + '/' + appTypeArray[1] + '/' + appTypeArray[2] + '/*');
branch('IRSA:' + appTypeArray[0] + '/*/'+ appTypeArray[2] + '/*');
branch('IRSA:' + appTypeString);
if (matches(currentUserID,'TESTDRIVE')) {
	branch('EMSE:TESTDRIVE_IRSA');
	}

