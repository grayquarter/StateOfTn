
// DISABLED: DocumentUploadAfter:01
// br_nch('EMSE:GlobalFlags');
branch('DUA:' + appTypeArray[0] + '/*/*/*');
branch('DUA:' + appTypeArray[0] + '/' + appTypeArray[1] + '/*/*');
branch('DUA:' + appTypeArray[0] + '/' + appTypeArray[1] + '/' + appTypeArray[2] + '/*');
branch('DUA:' + appTypeArray[0] + '/' + appTypeArray[1] + '/*/' + appTypeArray[3]);
branch('DUA:' + appTypeString);
branch('DUA:' + appTypeArray[0] + '/*/'+ appTypeArray[2] + '/*');

