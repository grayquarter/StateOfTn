
currentTime = new Date();
currDate = currentTime.getMonth() + 1 + '/' + currentTime.getDate() + '/' + currentTime.getFullYear();
b1ExpResult = aa.expiration.getLicensesByCapID(capId);
if (b1ExpResult.getSuccess()) {
	this.b1Exp = b1ExpResult.getOutput();
	var expDate = this.b1Exp.getExpDate();
	}

