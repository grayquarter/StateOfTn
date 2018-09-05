
// DISABLED: ASB:TNABC/*/Application/*:03
// message='NO LICENSE : At least one License Type must be entered.';
// showMessage = true;
// DISABLED: ASB:TNABC/*/Application/*:04
// cancel = true;

var docList = getDocumentList();
var catFound = false;
for (d in docList)
	if (docList[d].getDocCategory().equals("Consumer Education Seminar")) 
		catFound = true; 

if (catFound)
	addAdHocTask("ABC TASKS","Consumer Education Documentation Uploaded","");