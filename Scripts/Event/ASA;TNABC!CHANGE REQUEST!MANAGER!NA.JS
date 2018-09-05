
if (!publicUser) {
	parentCapId = getParent();
	copyAppSpecificTable(capId, parentCapId);
	addCertifiedManagers();
}
