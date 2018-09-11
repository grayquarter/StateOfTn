
licCapId = capId;
generateEnforcementAltID(capId);
newLicId = capId;
updateEnforcementAltID(newLicId);
comment('New Alt ID ===> ' + newLicId);
if (AInfo['License Number']) {
	addParent(AInfo['License Number']);
}

comment('License Number ===> ' + AInfo['License Number']);
