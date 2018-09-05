
// DISABLED: TABC_Create_Individual_Licenses_7:01
// AppID=capId;
// AppCap = capIDString;
// appCapModel = false;
// appCapCreator = false;
// DISABLED: TABC_Create_Individual_Licenses_7:02
// licID=getParent();
// // licCap = licID.getCustomID();
// DISABLED: TABC_Create_Individual_Licenses_7:03
// comment('Child=> '+AppID.getCustomID()+'      Parent=> '+licID);
// DISABLED: TABC_Create_Individual_Licenses_7:04
// if (licID) {
// 	appCapModel = aa.cap.getCapViewByID(licID).getOutput();
// 	}

// DISABLED: TABC_Create_Individual_Licenses_7:05
// if (appCapModel) {
// 	appCapCreator = appCapModel.getCapDetailModel().getCreateBy();
// 	}

// DISABLED: TABC_Create_Individual_Licenses_7:06
// if (appCapCreator) {
// 	attachResult = aa.cap.updateCreatedAccessBy4ACA(AppID,appCapCreator,'Y','Y');
// DISABLED: TABC_Create_Individual_Licenses_7:07
// 	comment ('App Cap attached to ' + appCapCreator);
// 	}

