function getContactValues(strItem,capId)
                {
                var capContactResult = aa.people.getCapContactByCapID(capId);
                if (capContactResult.getSuccess())
                {
                                var capContactArray = capContactResult.getOutput();
                }

                if (capContactArray)
                                {
                                for (yy in capContactArray)
                                                                                             
                                                {
                                                if(capContactArray[yy].getPeople().getContactType() == "Business Information")
                                                {                                               
                                                if(strItem.toUpperCase()=="FIRSTNAME")
                                                {
                                                                return capContactArray[yy].getPeople().firstName;
                                                }else if(strItem.toUpperCase()=="LASTNAME")
                                                {
                                                                return capContactArray[yy].getPeople().lastName;
                                                }else if(strItem.toUpperCase()=="ADDRESSLINE1")
                                                {
                                                                return capContactArray[yy].getPeople().getAddressLine1;
                                                }else if(strItem.toUpperCase()=="ADDRESSLINE2")
                                                {
                                                                return capContactArray[yy].getPeople().getAddressLine2;
                                                }else if(strItem.toUpperCase()=="CITY")
                                                {
                                                                return capContactArray[yy].getPeople().getCity;
                                                }else if(strItem.toUpperCase()=="STATE")
                                                {
                                                                return capContactArray[yy].getPeople().getState;
                                                }else if(strItem.toUpperCase()=="ZIP")
                                                {
                                                                return capContactArray[yy].getPeople().getZip;
                                                }else if(strItem.toUpperCase()=="TRADENAME")
                                                {
                                                               
                                                                return capContactArray[yy].getPeople().getTradeName();
                                                }
                                                else if(strItem.toUpperCase()=="LEGALNAME")
                                                {
                                                               
                                                                return capContactArray[yy].getPeople().getBusinessName();
                                                }

                                                else if(strItem.toUpperCase()=="CONTACTYPE")
                                                {
                                                                return capContactArray[yy].getPeople().getContactType();
                                                }
                                                 else if(strItem.toUpperCase()=="EMAIL")
                                                {
                                                                return capContactArray[yy].getPeople().getEmail();
                                                }


                                        }
                                }
                }
}


//edit an ASIT with col/edit value where key matches col value
