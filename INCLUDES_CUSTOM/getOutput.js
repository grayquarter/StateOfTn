function getOutput(result, object){
	if (result.getSuccess())
	{
		return result.getOutput();
	}
	else
	{
		logDebug("ERROR: Failed to get " + object + ": " + result.getErrorMessage());
		return null;
	}
}

