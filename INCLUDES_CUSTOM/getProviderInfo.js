function getProviderInfo(refLPInfo){
	//Adding Provider Template
	var provMdl = aa.proxyInvoker.newInstance("com.accela.orm.model.education.ProviderModel").getOutput();
	
	if (refLPInfo.getBusinessName() != null)
		provNme = refLPInfo.getBusinessName();
	else
		provNme = refLPInfo.getContactFirstName()+ " " + refLPInfo.getContactLastName();
	
	provMdl.setProviderName(provNme);

	//Getting look up model
	var provBus = aa.proxyInvoker.newInstance("com.accela.aa.education.provider.ProviderBusiness").getOutput();
	qf = aa.util.newQueryFormat(); 
	provList = provBus.getProviderList(provMdl, qf).toArray();

	firstModel = provList[0];
	
	//for (pL in firstModel)
		//aa.print(pL + " = " + firstModel[pL]);
	
	prvNo = firstModel.getProviderNo();
	prvNBR = firstModel.getProviderNbr();
	
	return prvNBR;
}
