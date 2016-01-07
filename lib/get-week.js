var getWeek = function(start) {
    //Calcing the starting point
    start = start || 0;
    var today = new Date(this.setHours(0, 0, 0, 0));
    var day = today.getDay() - start;
    var date = today.getDate() - day;

    // Grabbing Start/End Dates
    var StartDate = new Date(today.setDate(date + 1));
    var EndDate = new Date(today.setDate(date + 7));
    EndDate.setHours(23,59,59,999);
    
    return {
        start: StartDate,
        end: EndDate
    };
};

module.exports = getWeek;