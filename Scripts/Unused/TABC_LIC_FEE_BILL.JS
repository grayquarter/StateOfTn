
comment('Script Test - TABC_LIC_FEE_BILL');
if (appMatch('TNABC/Liquor by the Drink/Application/*')) {
	updateFee('LBD010','TABC_LBD_FEES','FINAL',1,'Y');
	}

if (appMatch('TNABC/Permits/Application/Server')) {
	updateFee('PER010','TABC_PERMIT_FEES','FINAL',1,'Y');
	}

