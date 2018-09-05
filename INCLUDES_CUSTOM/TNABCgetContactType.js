function TNABCgetContactType(LGroup, LType, LSubType, LCateg) 
{
	var contactType = null;

	if (matches(LType, "Liquor by the Drink", "Retail", "Supplier", "Wholesale") && LSubType == "License") 
	{
	contactType = "Business Information";
	}

	if (LType == "Permits" && LSubType == "NA") 
	{
	contactType = "Permittee";
	}

	if (LType == "Education" && LSubType == "Certificate" && matches(LCateg, "RV Trainer", "Server Training Trainer")) 
	{
	contactType = "Applicant-Individual";
	}

	if (LType == "Education" && LSubType == "Certificate" && matches(LCateg, "Server Training Program", "RV Program")) 
	{
	contactType = "Business Information";
	}

	return contactType;
}

/* Added by Laurent Sorrentino, developed by Larry Cooper   06-05-2016      */
/* New client-specific reference contact compare before creation            */

