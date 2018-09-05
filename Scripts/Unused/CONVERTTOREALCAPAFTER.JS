
branch('EMSE:GlobalFlags');
branch('CTRCA:' + appTypeArray[0] + '/*/*/*');
branch('CTRCA:' + appTypeArray[0] + '/' + appTypeArray[1] + '/*/*');
branch('CTRCA:' + appTypeArray[0] + '/' + appTypeArray[1] + '/' + appTypeArray[2] + '/*');
branch('CTRCA:' + appTypeArray[0] + '/*/*/' + appTypeArray[3]);
branch('CTRCA:' + appTypeArray[0] + '/*/'+ appTypeArray[2] + '/*');
branch('CTRCA:' + appTypeArray[0] + '/' + appTypeArray[1] + '/*/' + appTypeArray[3]);
branch('CTRCA:' + appTypeString);

