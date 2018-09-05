function timeStandardToMilitary(time){
    return time.replace(/(\d{1,2})\s*:?\s*(\d{1,2})?\s*(am|pm)/gi, function(string, hour, minute, suffix){
        minute = minute || '00';
        return (+hour + 11)%((suffix.toLowerCase() == 'am') ? 12 : 24)+1+':'+((minute.length === 1) ? minute+'0' : minute);
    });
}
