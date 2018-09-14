function refExamObj(vRefExamModel) {
	/**
	 * This function is intended to create reference exam data for use with transactional records.
	 *
	 * Call Example:
	 * 	var vRefExmObj = new refExamObj();
	 *
	 * @param vRefExamModel {RefExamModel} (Optional)
	 * Methods:
	 * refreshObject() - Refreshes the object data following a createExamination() or updateExam() call
	 * createExamination() - Uses the current object information to create a new Exam record.
	 * updateExam() - Uses the current object information to update an existing Exam record.
	 * getReferenceExamList() - Returns an array of RefExamModel objects that match the current refExamName
	 */

	this.auditModel = null;
	this.providerModels = null;
	this.resId = null;
	this.refExamModel = null;
	this.refExamName = null;
	this.refExamNbr = null;
	this.refExmProviderModels = null;
	this.refExmAppTypeModels = null;
	this.comments = null;
	this.templateModel = null;
	this.valid = false;
	this.gradingStyle = null;
	this.passingNumber = null;
	this.isSchedulingInACA = null;

	var newRefExamModel = null;

	if (vRefExamModel) {
		this.refExamModel = vRefExamModel;
		this.valid = (this.refExamModel != null);
	}

	this.refreshObject = function () {
		if (this.valid) {
			//this.auditModel = this.refExamModel.getAuditModel();
			//this.comments = this.refExamModel.getComments();
			this.refExamName = this.refExamModel.getExamName();
			this.refExamNbr = this.refExamModel.getRefExamNbr();
			this.refExmProviderModels = this.refExamModel.getRefExamProviderModels();
			this.refExmAppTypeModels = this.refExamModel.getRefExamAppTypeModels();
			this.templateModel = this.refExamModel.getTemplate();
		} else {
			this.valid = false;
		}
	}
	this.refreshObject(); //Invoke the Object Refresh to popualte our object variables

	this.generateNewRefExamModel = function () {
		var args = new Array();
		newRefExamModel = aa.proxyInvoker.newInstance("com.accela.orm.model.education.RefExaminationModel", args).getOutput();
		var auditModel = aa.proxyInvoker.newInstance("com.accela.orm.model.common.AuditModel", args).getOutput();

		auditModel.setAuditDate(new Date());
		auditModel.setAuditStatus("A");
		auditModel.setAuditID("ADMIN");

		newRefExamModel.setAuditModel(auditModel);
		newRefExamModel.setServiceProviderCode(aa.getServiceProviderCode());
		newRefExamModel.setExamName(this.refExamName);
		newRefExamModel.setComments(this.comments);
		newRefExamModel.setGradingStyle(this.gradingStyle);
		newRefExamModel.setIsSchedulingInACA(this.isSchedulingInACA);
		newRefExamModel.setPassingScore(this.passingNumber);

		if (this.templateModel)
			newRefExamModel.setTemplate(this.templateModel);
	}

	this.createExaminationcreateExamination = function () {
		this.generateNewRefExamModel();
		var refExmBus = aa.proxyInvoker.newInstance("com.accela.aa.education.refexamination.RefExaminationBusiness").getOutput();
		// TODO: disabled try/catch since all MS 3.0 scripts execute in a try/catch
		//		try {
		var addedRefExamModel = refExmBus.create(newRefExamModel);
		logDebug("Created Reference Exam: " + this.refExamName + ": " + addedRefExamModel.getRefExamNbr());
		this.refExamNumber = addedRefExamModel.getRefExamNbr();

		//for (xr in refExmBus)
		//aa.print(xr + " - " + refExmBus[xr]);

		this.refreshObject();
		//}
		//		catch (err) {
		//			logDebug("createExam: A JavaScript Error occured: " + err.message);
		//		}
	}
	this.getReferenceExamList = function () {
		// Returns a list of RefExaminationModels based on the Exam Name
		var refExmBus = aa.proxyInvoker.newInstance("com.accela.aa.education.refexamination.RefExaminationBusiness").getOutput();
		var args = new Array();
		var newRefExamModel = aa.proxyInvoker.newInstance("com.accela.orm.model.education.RefExaminationModel", args).getOutput();
		newRefExamModel.setServiceProviderCode(aa.getServiceProviderCode());
		newRefExamModel.setExamName(this.refExamName);
		var exmList = refExmBus.getRefExaminationList(newRefExamModel, true);

		if (exmList.toArray().length > 0) {
			logDebug("Exam " + this.refExamName + " has been found in reference");
			return exmList.toArray();
		} else
			return false;
	}
	this.assignProvider = function () {

		logDebug("Assigning Exam to provider");
		// Returns a list of RefExaminationModels based on the Exam Name
		var refExmBus = aa.proxyInvoker.newInstance("com.accela.aa.education.refexamination.RefExaminationBusiness").getOutput();
		var xRefExmMdl = aa.proxyInvoker.newInstance("com.accela.orm.model.education.XRefExaminationProviderModel").getOutput();

		var args = new Array();
		var newRefExamModel = aa.proxyInvoker.newInstance("com.accela.orm.model.education.RefExaminationModel", args).getOutput();
		newRefExamModel.setServiceProviderCode(aa.getServiceProviderCode());
		newRefExamModel.setExamName(this.refExamName);

		//setting xref examprovider
		xRefExmMdl.setGradingStyle(this.gradingStyle);
		xRefExmMdl.setPassingScore2String(String(this.passingNumber));
		xRefExmMdl.setPassingScore(Number(this.passingNumber));
		xRefExmMdl.setServiceProviderCode(aa.getServiceProviderCode());
		xRefExmMdl.setRefExamNbr(this.refExamNumber);
		xRefExmMdl.setExternalExamName(this.refExamName);
		xRefExmMdl.setIsSchedulingInACA(this.isSchedulingInACA);
		xRefExmMdl.setProviderNbr(prvNBR);
		var args2 = new Array();
		var auditModel = aa.proxyInvoker.newInstance("com.accela.orm.model.common.AuditModel", args2).getOutput();

		auditModel.setAuditDate(new Date());
		auditModel.setAuditStatus("A");
		auditModel.setAuditID("ADMIN");
		xRefExmMdl.setAuditModel(auditModel);

		logDebug("ProvNbr to Check = " + prvNBR);

		var provAss = false;

		var exmProvAssigned = refExmBus.getProviderList(newRefExamModel).toArray();

		logDebug("Total Providers assigned to Exam: " + exmProvAssigned.length);

		for (x in exmProvAssigned) {
			var ePAssNbr = exmProvAssigned[x].getProviderNbr();
			logDebug("Existing ProvNbr = " + ePAssNbr);

			if (ePAssNbr == prvNBR) {
				logDebug("Provider Already Assocated to Exam");
				provAss = true;
				examAssigned = true;
				return examAssigned;
			}
		}

		if (!provAss) {
			//Assigning Providers
			provList = [];
			provList.push(xRefExmMdl);
			provAssign = refExmBus.assignProviders(provList, false);

			examAssigned = true;
		}
		logDebug("Now is exam assigned: " + examAssigned);
		return examAssigned;
	}
	this.assignRecord = function (refGroup, refType, refSub, refCat, refAlias) {

		logDebug("Now assigning record to Exam");

		//Building capTypeI18NModel
		var i18nModel = aa.proxyInvoker.newInstance("com.accela.orm.model.cap.CapTypeI18NModel").getOutput();
		var args = new Array();
		var args2 = new Array();
		var auditModel = aa.proxyInvoker.newInstance("com.accela.orm.model.common.AuditModel", args2).getOutput();
		var refExmBus = aa.proxyInvoker.newInstance("com.accela.aa.education.refexamination.RefExaminationBusiness").getOutput();

		var newRefExamModel = aa.proxyInvoker.newInstance("com.accela.orm.model.education.RefExaminationModel", args).getOutput();
		newRefExamModel.setServiceProviderCode(aa.getServiceProviderCode());
		newRefExamModel.setExamName(this.refExamName);
		var exmAppTypeList = refExmBus.getAssignedAppTypeList(aa.getServiceProviderCode(), this.refExamNumber);

		for (x in exmAppTypeList) {
			var exmAppL = exmAppTypeList.getRefExamAppTypeModels;
			for (eaL in exmAppL)
				logDebug(eaL + " = " + exmAppL[eaL]);
		}

		auditModel.setAuditDate(new Date());
		auditModel.setAuditStatus("A");
		auditModel.setAuditID("ADMIN");

		i18nModel.setGroup(refGroup);
		i18nModel.setType(refType);
		i18nModel.setSubType(refSub);
		i18nModel.setCategory(refCat);
		i18nModel.setAlias(refAlias);
		i18nModel.setAuditModel(auditModel);

		var xRefAppModel = aa.proxyInvoker.newInstance("com.accela.orm.model.education.XRefExaminationAppTypeModel").getOutput();
		xRefAppModel.setServiceProviderCode(aa.getServiceProviderCode());
		xRefAppModel.setRequired("Y");
		xRefAppModel.setAuditModel(auditModel);
		xRefAppModel.setGroup(refGroup);
		xRefAppModel.setType(refType);
		xRefAppModel.setSubType(refSub);
		xRefAppModel.setCategory(refCat);
		xRefAppModel.setRequired("N");
		xRefAppModel.setRefExamNbr(this.refExamNumber);
		xRefAppModel.setCapTypeI18nModel(i18nModel);

		//Assigning AppTypes
		typeList = [];
		typeList.push(xRefAppModel);
		typeAssign = refExmBus.assignAppTypes(typeList);

		logDebug("Record type has been assigned");

		this.valid = true;

		//this.refreshObject();
	}
}
