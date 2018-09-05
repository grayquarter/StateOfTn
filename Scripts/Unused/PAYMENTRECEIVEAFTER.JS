
branch('EMSE:GlobalFlags');
branch('PRA:' + appTypeArray[0] + '/*/*/*');
branch('PRA:' + appTypeArray[0] + '/' + appTypeArray[1] + '/*/*');
branch('PRA:' + appTypeArray[0] + '/' + appTypeArray[1] + '/' + appTypeArray[2] + '/*');
branch('PRA:' + appTypeString);
branch('PRA:' + appTypeArray[0] + '/' + appTypeArray[1] + '/*/' + appTypeArray[3]);
branch('PRA:' + appTypeArray[0] + '/*/*/' + appTypeArray[3]);
branch('PRA:' + appTypeArray[0] + '/*/'+ appTypeArray[2] + '/*');

