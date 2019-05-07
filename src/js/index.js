$(function () {
    getList();
    function getList() {
        //首页列表接口
        util.ajaxGet(`/api/view/category/list?category_id=9999&last_id=0&platform=1`).then((res) => {
            if (res.code == 1) {
                res.data.forEach(item => {
                    let tmptime = new Date(item.publish_time);
                    tmptime = `${tmptime.getFullYear()}-${(tmptime.getMonth() + 1) > 9 ? (tmptime.getMonth() + 1) : ('0' + (tmptime.getMonth() + 1))}-${tmptime.getDate() > 9 ? tmptime.getDate() : ('0' + tmptime.getDate())}`
                    item.publish_time = tmptime

                    let articleImgHtml = ''
                    if (item.img_list && item.img_list.length > 0) {
                        articleImgHtml = `<div class="news-img border">
                                            <img src="${item.img_list[0].url}" alt="">
                                         </div>`
                    }

                    let $html = `<article class="vf-news-list_con vf-news-list_con-LR border-bottom">
                                        <a href="./detail.html?articleid=${item.view_id}">
                                        <div class="news-info">
                                            <h3 class="title">${item.view_title}</h3>
                                            <div class="title-tips">
                                                <span class="news-scour">${item.author_name}</span>
                                                <span class="pubtime">${'阅读 ' + item.view_sum}</span>
                                                <span class="pubtime">${item.publish_time}</span>
                                            </div>
                                        </div>
                                        ${articleImgHtml}
                                    </a> 
                              </article>`
                    $("#articlewrap").append($html);
                })

                setTimeout(() => {
                    $('.loadingContainer').hide();
                    firstload = false;
                }, 500)
            }

        });
    }
})