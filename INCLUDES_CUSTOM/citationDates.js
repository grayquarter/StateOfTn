function citationDates() {

	counter = 1;
	var pFreq = null;
	nASIT_PPln = new Array();

	if (AInfo['Payment Frequency'].equals("Monthly"))
		pFreq = 30;
	else
		pFreq = 14;

	pPeriods = AInfo['Payment Periods'];
	pAmount = AInfo['Payment Amount'];
	pTotalDue = AInfo['Total Amount'];
	var pDueDate = null;

	aa.print("Amt: " + pAmount);
	aa.print("pFreq: " + pFreq);
	aa.print("Periods: " + pPeriods);

	for (counter = 1; counter <= pPeriods; counter++) {
		var tempObject = new Array();

		if (counter == 1) {
			pDueDate = dateAdd(AInfo['Scheduled Start Date'], 0);
			editTaskDueDate("Payment Plan", pDueDate);
		} else
			pDueDate = dateAdd(pDueDate, pFreq);

		if (counter == pPeriods) {
			if ((pAmount * pPeriods) <= pTotalDue)
				tempObject["Amount"] = String(pAmount);
			else {
				lastPAmount = pAmount - ((pAmount * pPeriods) - pTotalDue);
				tempObject["Amount"] = String(lastPAmount);
			}
		} else
			tempObject["Amount"] = String(pAmount);

		tempObject["Payment Due Date"] = pDueDate;
		tempObject["Date Paid"] = "";
		tempObject["Comments"] = "";

		nASIT_PPln.push(tempObject);
	}

	if (nASIT_PPln.length > 0) {
		aa.print("table: " + nASIT_PPln.length);
		addASITable("PAYMENT PLAN SCH", nASIT_PPln);
	}
}
