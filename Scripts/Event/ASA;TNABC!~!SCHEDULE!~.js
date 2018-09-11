
parentCapId = getParent();
if (parentCapId) {
	copyLicensedProf(parentCapId, capId);
}

if (!publicUser && AInfo['Program Certificate ID'] != null) {
	copyLicensedProf(parentCapId, capId);
}
