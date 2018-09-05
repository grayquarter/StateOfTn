function getInspRecordParams4Notification(params) {
	// pass in a hashtable and it will add the additional parameters to the table

        var inspNa = String(inspObj.getInspector()).split("/");
        var inspN = inspNa[inspNa.length - 1];

	addParameter(params, "$$altID$$", capIDString);
	addParameter(params, "$$capName$$", capName);
	addParameter(params, "$$capStatus$$", capStatus);
	addParameter(params, "$$fileDate$$", fileDate);
	addParameter(params, "$$iResult$$",inspResult);
	addParameter(params, "$$inspType$$",inspType);
	addParameter(params, "$$inspName$$",inspN);
	addParameter(params, "$$inspComm$$",inspResultComment);
	addParameter(params, "$$balanceDue$$", "$" + parseFloat(balanceDue).toFixed(2));
	return params;
}

