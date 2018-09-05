function createProviderDetails(refLPInfo){

	var refLicNum = refLPInfo.getStateLicense();
	var refLicNumInx = refLicNum.indexOf("-") +1;
	var refLicNumPart = refLicNum.substr(refLicNumInx);
	
	logDebug("LIC NUMBER PART: " + refLicNumPart);

	
	//Adding Provider Template
	var provNme = "";
	
	var provMdl = aa.proxyInvoker.newInstance("com.accela.orm.model.education.ProviderModel").getOutput();
	
	if (refLPInfo.getBusinessName() != null)
		provNme = refLPInfo.getBusinessName();
	else
		provNme = refLPInfo.getContactFirstName()+ " " + refLPInfo.getContactLastName();
	
	provMdl.setProviderName(provNme+refLicNumPart);
	
	provMdl.setOfferExamination("Y");
	provMdl.setOfferEducation("N");
	provMdl.setOfferContinuing ("N");
	provMdl.setServiceProviderCode(servProvCode);

	//Getting look up model
	var provBus = aa.proxyInvoker.newInstance("com.accela.aa.education.provider.ProviderBusiness").getOutput();
	qf = aa.util.newQueryFormat(); 
	var args = new Array();
	
	var auditModel = aa.proxyInvoker.newInstance("com.accela.orm.model.common.AuditModel",args).getOutput();
	
	logDebug("CHECKING TO SEE IF PROV EXISTS");	
	var provExists = provBus.getProvider(provMdl);	

	provMdl.setProviderNbr(refLPInfo.getLicSeqNbr());
	provMdl.setProviderNo(refLPInfo.getStateLicense());
	
	auditModel.setAuditDate(new Date());
	auditModel.setAuditStatus("A");
	auditModel.setAuditID("ADMIN");

	provMdl.setAuditModel(auditModel);
	
	if (provExists == null){
		var provCreate = provBus.create(provMdl);
	
		logMessage("PROVCREATED: " + provCreate);
		return provMdl.getProviderNo();
	}
	else{
	logDebug("PROVIDER ALREADY EXISTS.  CANNNOT CREATE");
	return false;
	}

}

