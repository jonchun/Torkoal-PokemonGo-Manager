var getCookie = function(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
};

var setCookie = function (cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
};


function sortById(obj1, obj2){
    if(obj1.pokemon_id > obj2.pokemon_id)
        return 1;
    if(obj2.pokemon_id > obj1.pokemon_id)
        return -1;

    // obj1.RemindingTimestamp == obj2.RemindingTimestamp

    if(obj1.cp > obj2.cp)
        return -1;
    if(obj2.cp > obj1.cp)
        return 1;

    return 0;
}