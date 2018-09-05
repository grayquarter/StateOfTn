function getChildNodeVal(fString,fParent,fChild)
{
 var fValue = "";
 var startTag = "<"+fParent+">";
 var endTag = "</"+fParent+">";
 
 
 // if tag not available, return.
 if (fString.indexOf(startTag) < 0) {
	fValue = "";
	return unescape(fValue);
 }
 
 
pStartPos = fString.indexOf(startTag) + startTag.length;
pEndPos = fString.indexOf(endTag);
 
startTag = "<"+fChild+">";
endTag = "</"+fChild+">";


 // if tag not available, return.
 if (fString.indexOf(startTag,pStartPos) < 0) {
	fValue = "";
	return unescape(fValue);
 }


cStartPos = fString.indexOf(startTag,pStartPos) + startTag.length;
cEndPos = fString.indexOf(endTag,cStartPos);

 // make sure startPos and endPos are valid before using them
 if (cStartPos > 0 && cStartPos < cEndPos)
	  fValue = fString.substring(cStartPos,cEndPos);

 return unescape(fValue);
}


//##################function getAppSpecificValue --Added by THP
