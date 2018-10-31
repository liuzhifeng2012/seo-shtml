let util = {}

util.vars={} 

let domain = window.location.protocol+'//'+ window.location.hostname +'/';
if(domain.indexOf("seo.davfang.com") > -1){//正式环境
    util.vars.domain=window.location.protocol+'//'+'www.davfang.com/'
}
else{//测试环境
    util.vars.domain=window.location.protocol+'//'+'c.davfang.com/'
}

//获取浏览器参数
util.getQueryString = function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}

util.ajaxGet = function (url) {

    return new Promise((resolve, reject) => {

        $.ajax({
            type: 'get',
            url: url,
            async: true,
            headers: {
                vfang_token: ''
            },
            success(res) {
                resolve(res)
            },
            error(err) {
                resolve(null)
            }
        });

    });
};

util.ajaxPost = function (url, params) {

    return new Promise((resolve, reject) => {

        $.ajax({
            type: 'post',
            url: url,
            data: params,
            async: true,
            headers: {
                vfang_token: ''
            },
            success(res) {
                resolve(res)
            },
            error(err) {
                resolve(null)
            }
        });

    });
};

util.formatDate = function (date) {
    let time = new Date();
    if (typeof (date) === 'number') {
        time = new Date(date);
    } else {
        let dateFor = date.toString().replace(/\-/g, "/");
        time = new Date(dateFor);
    }

    let nowD = new Date();//当前时间

    //相隔的天数
    let diffDay = Math.round(Math.abs((nowD.getTime() - time.getTime())) / (1000 * 60 * 60 * 24));
    if (diffDay >= 3 && diffDay < 4) {
        return '三天前';
    }
    else if (diffDay >= 2 && diffDay < 3) {
        return '两天前';
    }
    else if (diffDay >= 1 && diffDay < 2) {
        return '昨天';
    }
    else if (diffDay >= 0 && diffDay < 1) {
        if (nowD.getDate() == time.getDate()) {
            let diffHour = Math.round(Math.abs((nowD.getTime() - time.getTime())) / (1000 * 60 * 60));
            //当天，需要判断小时
            if (diffHour >= 3) {
                return '今天';
            }
            else if (diffHour >= 2 && diffHour < 3) {
                return '2小时前';
            } else if (diffHour >= 1 && diffHour < 2) {
                return '1小时前';
            } else {
                //当前小时，判断分钟
                let diffMin = Math.round(Math.abs((nowD.getTime() - time.getTime())) / (1000 * 60));
                if (diffMin >= 10) {
                    return diffMin + '分钟前';
                } else {
                    return '刚刚';
                }
            }
        } else {
            return '昨天';
        }
    } else {
        return `${time.getFullYear()}-${('0' + (time.getMonth() + 1)).slice(-2)}-${('0' + time.getDate()).slice(-2)}`;
    }
};

