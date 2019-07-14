function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(), //day
        "h+": this.getHours(), //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
        "S": this.getMilliseconds() //millisecond
    }
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
        (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(format))
            format = format.replace(RegExp.$1,
                RegExp.$1.length == 1 ? o[k] :
                ("00" + o[k]).substr(("" + o[k]).length));
    return format;
};

function global_log(message) {
    console.log(new Date().format("yyyy/MM/dd hh:mm:ss") + ":" + message);
}

function global_erro(message) {
    console.error(new Date().format("yyyy/MM/dd hh:mm:ss") + ":" + message);
}

function global_warn(message) {
    console.warn(new Date().format("yyyy/MM/dd hh:mm:ss") + ":" + message);
}

function global_info(message) {
    console.info(new Date().format("yyyy/MM/dd hh:mm:ss") + ":" + message);
}