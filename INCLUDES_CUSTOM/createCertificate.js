function createCertificate(grp, typ, stype, cat, desc, initStatus, copyASI, createRefLP, contactType, licHolderSwitch, licHolderType,asiLicenseCounty) 
{
    //initStatus - record status to set the Permit to initially
    //copyASI - copy ASI from Application to Permit? (true/false)
    //createRefLP - create the reference LP (true/false)
    //licHolderSwitch - switch the applicant to Permit holder

    var newLic = null;
    var newLicId = null;
    var newLicIdString = null;
    var newLicenseType = null;
    var oldAltID = null;
    var AltIDChanged = false;
	
	var prvNBR = "";
    //create the Permit record

    //create the record
    // newLicId = createChild(grp, typ, stype, cat, desc); Commented out by FJB 12-30-15
	newLicId = createChildwithAddrAttributes(grp, typ, stype, cat, desc);
	
    //copy all ASI
    if (copyASI && newLicId && typ != "Hearing") 
    {
        copyAppSpecific(newLicId);
        copyASITables(capId, newLicId); 
    }

    if (copyASI && newLicId && typ == "Hearing") 
    {
        copyAppSpecific(newLicId);
    }

    //field repurposed to represent the current term effective date
    // editScheduledDate(sysDateMMDDYYYY, newLicId);
    //field repurposed to represent the original effective date
    //editFirstIssuedDate(sysDateMMDDYYYY, newLicId);
    oldAltID = newLicId.getCustomID();


    // update the application status
    //updateAppStatus(initStatus, "", newLicId);
    newLicIdString = newLicId.getCustomID();
	
	if (appTypeArray[1].equals("Education") && matches(appTypeArray[3],"RV Trainer","Server Training Trainer"))
		newLicenseType = "Provider";
	else
		newLicenseType = aa.cap.getCap(newLicId).getOutput().getCapType().getAlias(); 	/* Added 5/4/16 FJB */

    logDebug("newLicIdString:" + newLicIdString);
    logDebug("newLicenseType:" + newLicenseType);  					/* Added 5/4/16 FJB */

	//setLicExpirationDate(newLicId);

	var vExpDate = null;
	try {
		vExpDate =  aa.expiration.getLicensesByCapID(newLicId).getOutput().getExpDate();
		}
	catch (e) 
    {
		vExpDate = null;
	}

    if (createRefLP && newLicId) 
    {
        logDebug("Creating Ref LP.");
        var refLpMdl = createRefLicProf_custom(newLicIdString, newLicenseType, contactType,newLicId);

		if (newLicenseType == "Provider"){
			prvNBR = createProviderDetails(refLpMdl);
			
			if (!prvNBR){
				newLicId = false;
				aa.print( "**ERROR: Could not Create Provider Details"); 
				return false;
			}
		}
    }

    if (licHolderSwitch && newLicId) 
    {
        conToChange = null;
        cons = aa.people.getCapContactByCapID(newLicId).getOutput();
        logDebug("Contacts:" + cons);
        logDebug("Contact Length:" + cons.length);

        for (thisCon in cons) 
        {
            if (cons[thisCon].getCapContactModel().getPeople().getContactType() == contactType) 
            {
                conToChange = cons[thisCon].getCapContactModel();
                p = conToChange.getPeople();
                p.setContactType(licHolderType);
                conToChange.setPeople(p);
                aa.people.editCapContact(conToChange);
                logDebug("Contact type successfully switched to " + licHolderType);

                //added by thp to copy contact-Addres
                var source = getPeople(capId);
                //source = aa.people.getCapContactByCapID(capId).getOutput();
                for (zz in source) 
                {
                    sourcePeopleModel = source[zz].getCapContactModel();
                    if (sourcePeopleModel.getPeople().getContactType() == contactType) 
                    {
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

