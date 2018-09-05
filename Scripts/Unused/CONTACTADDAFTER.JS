
branch('EMSE:GlobalFlags');
branch('CAA:' + appTypeArray[0] + '/*/*/*');
branch('CAA:' + appTypeArray[0] + '/' + appTypeArray[1] + '/*/*');
branch('CAA:' + appTypeArray[0] + '/' + appTypeArray[1] + '/' + appTypeArray[2] + '/*');
branch('CAA:' + appTypeArray[0] + '/*/*/' + appTypeArray[3]);
branch('CAA:' + appTypeArray[0] + '/' + appTypeArray[1] + '/*/' + appTypeArray[3]);
branch('CAA:' + appTypeArray[0] + '/*/'+ appTypeArray[2] + '/*');
branch('CAA:' + appTypeString);

