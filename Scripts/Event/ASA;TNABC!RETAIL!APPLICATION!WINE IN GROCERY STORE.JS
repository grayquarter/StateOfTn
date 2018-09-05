
if (AInfo['Master Company RLPS ID'] != null) {
	var mstCpyCapId = aa.cap.getCapID(AInfo['Master Company RLPS ID']).getOutput();
	copyContactsByType(mstCpyCapId, capId, 'Business Owner-Organization');
	//addParent(mstCpyCapId);
}
