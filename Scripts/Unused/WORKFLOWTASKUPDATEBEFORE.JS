
branch('EMSE:GlobalFlags');
branch('WTUB:' + appTypeArray[0] + '/*/*/*');
branch('WTUB:' + appTypeArray[0] + '/' + appTypeArray[1] + '/*/*');
branch('WTUB:' + appTypeArray[0] + '/' + appTypeArray[1] + '/' + appTypeArray[2] + '/*');
branch('WTUB:' + appTypeArray[0] + '/*/*/' + appTypeArray[3]);
branch('WTUB:' + appTypeArray[0] + '/*/'+ appTypeArray[2] + '/*');
branch('WTUB:' + appTypeString);

