function countyLookUp(retVal,appCounty){
	
	if (appCounty != null){
		var CountyInfo = lookup("TABC_County_Code",appCounty);
		comment("County Code : "+appCounty);
		tempvalue = CountyInfo;  
		tempval = tempvalue.split("/");
		CountyAbbrev=tempval[0]; 
		CountyName=tempval[1];
		CountyLetter=tempval[2];
		
		if (retVal.equals("CName")){
			if (CountyName.equals("NASHVILLE"))
				return "TABC/NA/NA/REG/NA/NASHVILL/NA";
			
			if (CountyName.equals("CHATTANOOGA"))
				return "TABC/NA/NA/REG/NA/CHATTANO/NA";
			
			if (CountyName.equals("MEMPHIS"))
				return "TABC/NA/NA/REG/NA/MEMPHIS/NA";
			
			if (CountyName.equals("KNOXVILLE"))
				return "TABC/NA/NA/REG/NA/KNOXVILL/NA";
		}
		if (retVal.equals("CLetr"))
			return CountyLetter;
		
		if (retVal.equals("CAbbr"))
			return CountyAbbrev;
	}
	else{
		if (retVal.equals("CName"))
			return "TABC/NA/NA/REG/NA/NA/NA";
		}
}

