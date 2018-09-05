function removeParent(parentAppNum)
//
// removes the current application from the parent
//
{
    itemCap = capId;
    if (arguments.length == 2) {
        itemCap = arguments[1]; // subprocess

    }

    var getCapResult = aa.cap.getCapID(parentAppNum);
    if (getCapResult.getSuccess()) {
        var parentId = getCapResult.getOutput();
        var linkResult = aa.cap.removeAppHierarchy(parentId, itemCap);
        if (linkResult.getSuccess())
            logDebug("Successfully removed link to Parent Application : " + parentAppNum);
        else
            logDebug("**WARNING: removing link to parent application parent cap id (" + parentAppNum + "): " + linkResult.getErrorMessage());
    }
    else
    { logDebug("**WARNING: getting parent cap id (" + parentAppNum + "): " + getCapResult.getErrorMessage()) }

}

/* ---------------------------------------------------------------------------- */

/* Added by FJB 09-08-15 to include comment on send email for Hearing */

