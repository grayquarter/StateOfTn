
// DISABLED: TABC_Create_Individual_Licenses_1a:01
// comment('===> Creating Education Certificates');
// DISABLED: TABC_Create_Individual_Licenses_1a:02
// CAPVal=lookup('TABC_CAP_Table',appTypeString);
// DISABLED: TABC_Create_Individual_Licenses_1a:03
// tempvalue = CAPVal;
// tempval = tempvalue.split('/');
// disableTokens = true;
// LGroup=tempval[0];
// LType=tempval[1];
// LSubType=tempval[2];
// LCateg=tempval[3];
// disableTokens = false;
// DISABLED: TABC_Create_Individual_Licenses_1a:04
// comment('VALUE =====> '+LGroup+ ' -  '+LType+ ' -  '+LSubType+ ' -  '+LCateg);
// DISABLED: TABC_Create_Individual_Licenses_1a:05
// newAppID=createChild('TNABC',LType,LSubType,LCateg,LICcomm);
// altid = newAppID.getCustomID();
// DISABLED: TABC_Create_Individual_Licenses_1a:06
// XICcomm = '=====> Source CAP # ' + capIDString;
// comment(XICcomm +' - Target CAP # '+altid);
// DISABLED: TABC_Create_Individual_Licenses_1a:07
// copyAppSpecific(newAppID);
// DISABLED: TABC_Create_Individual_Licenses_1a:08
// savecap=capId;
// capId=newAppID;
// br_nch('TABC_Create_Individual_Licenses_5');
// capId=savecap;
// DISABLED: TABC_Create_Individual_Licenses_1a:09
// savecap=capId;
// capId=newAppID;
// br_nch('TABC_Create_Individual_Licenses_7');
// capId=savecap;

