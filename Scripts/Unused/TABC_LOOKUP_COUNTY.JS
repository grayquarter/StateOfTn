
comment('County Code : '+AInfo['License County']);
CountyInfo = lookup('TABC_County_Code',AInfo['License County']);
comment('County Code : '+AInfo['License County']);
tempvalue = CountyInfo;
tempval = tempvalue.split('/');
disableTokens = true;
CountyAbbrev=tempval[0];
CountyName=tempval[1];
CountyLetter=tempval[2];
disableTokens = false;

