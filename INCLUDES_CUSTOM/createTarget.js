function createTarget(grp, typ, stype, cat, desc, initStatus, copyASI, createRefLP, contactType, licHolderSwitch, licHolderType, opAltId, count) {
    //initStatus - record status to set the license to initially
    //copyASI - copy ASI from Application to License? (true/false)
    //createRefLP - create the reference LP (true/false)
    //licHolderSwitch - switch the applicant to license holder

    var newLic = null;
    var newLicId = null;
    var newLicIdString = null;
    var newLicenseType = null;
    var oldAltID = null;
    var AltIDChanged = false;
	
    //create the Target record

    //create the record
    // newLicId = createChild(grp, typ, stype, cat, desc); Commented out by FJB 12-30-15
	newLicId = createChildwithAddrAttributes(grp, typ, stype, cat, desc);
	
	
 //copy all ASI
    if (copyASI && newLicId ) {
        copyAppSpecific(newLicId);
        copyASITables(capId, newLicId); 
    }

    /* if (copyASI && newLicId && typ == "Hearing") {
        copyAppSpecific(newLicId);
      }  */



    //field repurposed to represent the current term effective date
    // editScheduledDate(sysDateMMDDYYYY, newLicId);
    //field repurposed to represent the original effective date
    //editFirstIssuedDate(sysDateMMDDYYYY, newLicId);
    oldAltID = newLicId.getCustomID();
	

    // generate the new AltID 
    var newAltID = generateTargetAltID(newLicId,opAltId, count);
	
	
    var updateCapAltIDResult = aa.cap.updateCapAltID(newLicId, newAltID);
    if (updateCapAltIDResult.getSuccess())
        logDebug(newLicId + " AltID changed from " + oldAltID + " to " + newAltID);
    else
        logDebug("**WARNING: AltID was not changed from " + oldAltID + " to " + newAltID + ": " + updateCapAltIDResult.getErrorMessage());
    newLicId = aa.cap.getCapID(newAltID).getOutput();
 

    // update the application status
    //updateAppStatus(initStatus, "", newLicId);
    newLicIdString = newLicId.getCustomID();

    logDebug("newLicIdString:" + newLicIdString);

   
	//setLicExpirationDate(newLicId);
/* Commented by FJB 02-01-2016
/*	var vExpDate = null;
	try {
		vExpDate =  aa.expiration.getLicensesByCapID(newLicId).getOutput().getExpDate();
		}
	catch (e) {
		vExpDate = null;
	}   */

    if (createRefLP && newLicId) {
        logDebug("Creating Ref LP.");
        createRefLicProf_custom(newLicIdString, newLicenseType, contactType,newLicId);

/*        newLic = getRefLicenseProf(newLicIdString);

        if (newLic) {
        	logDebug("Reference LP successfully created");
            associateLpWithCap(newLic, newLicId);
        } else {
            logDebug("Reference LP not created");
        }*/
    }

    if (licHolderSwitch && newLicId) {
        conToChange = null;
        cons = aa.people.getCapContactByCapID(newLicId).getOutput();
        logDebug("Contacts:" + cons);
        logDebug("Contact Length:" + cons.length);

        for (thisCon in cons) {
            if (cons[thisCon].getCapContactModel().getPeople().getContactType() == contactType) {
                conToChange = cons[thisCon].getCapContactModel();
                p = conToChange.getPeople();
                p.setContactType(licHolderType);
                conToChange.setPeople(p);
                aa.people.editCapContact(conToChange);
                logDebug("Contact type successfully switched to " + licHolderType);

                //added by thp to copy contact-Addres
                var source = getPeople(capId);
                //source = aa.people.getCapContactByCapID(capId).getOutput();
                for (zz in source) {
                    sourcePeopleModel = source[zz].getCapContactModel();
                    if (sourcePeopleModel.getPeople().getContactType() == contactType) {
                        p.setContactAddressList(sourcePeopleModel.getPeople().getContactAddressList());
                        aa.people.editCapContactWithAttribute(conToChange);
                        logDebug("ContactAddress Updated Successfully");
                    }
                }
            }
        }
    }

    return newLicId;
}
