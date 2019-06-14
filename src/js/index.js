var icpShowState = false //icp显示状态 true显示;false隐藏
var url = window.location.href //记录当前地址，微信分享中会用到
var header = []
var indexCh = 0
var list = {}
// var stateList = []
var finishedCatagory = {} //已触底的catagory
var firstload = {} //首页特定分类是否是第一次加载数据n
// var limitRoomObj = {} //限竞房（初始进入页面时限竞房的第一条）
var lastIndex = {} //首页特定分类下最后一条数据id
var scrolltopPosition = {} //首页特定分类滚动到的位置
var bottomTestList = [] //底部文字集合，不同的分类下面的文字可能是不同的，需要持久化
var bottomText = ""
var sw = true
// var height = 0
var showNoDataIcon = false
// var isLoading = false
var last_id = 0
var mcShow = false//控制底部文字显示
// var metaArticle = {} //获取meta中应该显示的文章（暂时定为第一个分类下的第一篇文章）
$(function () {
    window.addEventListener("scroll", onScrollPull);

    $(".searchbox").click(() => {
        window.open(util.vars.domain + 'pages/Search', '_self')
    })

    //加载分类
    ajaxHeader();
})


function jqExecIcp() {
    if (icpShowState) {
        $(".icpWrap").show();
    }
    else {
        $(".icpWrap").hide();
    }
}
function jqExecNoDataIcon() {
    if (showNoDataIcon) {
        $(".index-view_list").hide();
        $(".vf-no-news").show();
    }
    else {
        $(".index-view_list").show();
        $(".vf-no-news").hide();
    }
}
function jqExecHeader() {
    let headerHtml = ''
    header.forEach(item => {
        headerHtml += `<li onclick="clickHeader(${item.category_id})">`
        if (item.category_id == indexCh) {
            headerHtml += `<a class="active" href="javascript:void(0);">${item.category_name}</a>`
        }
        else {
            headerHtml += `<a  class="" href="javascript:void(0);">${item.category_name}</a>`
        }
        headerHtml += `</li >`;
    })
    $(".header-list").children('ul').html(headerHtml);
}
function jqExecListData() {
    let articleHtml = ''
    list[indexCh].forEach((item, index) => {
        if (!item.isAD) {
            if (item.img_list.length < 3) {
                let articleImgHtml = ''
                if (item.img_list && item.img_list.length > 0) {
                    articleImgHtml = `<div class="news-img border">
                                                <img src="${item.img_list[0].url}" alt="">
                                             </div>`
                }
                let $html = ``
                if (index == list[indexCh].length - 1) {
                    $html += `<article class="vf-news-list_con vf-news-list_con-LR" >`
                }
                else {
                    $html += `<article class="vf-news-list_con vf-news-list_con-LR border-bottom">`
                }
                $html += `<a href="./detail.html?articleid=${item.view_id}">
                                            <div class="news-info">
                                                <h3 class="title">${item.view_title}</h3>
                                                <div class="title-tips">
                                                    <span class="news-scour">${item.author_name}</span>
                                                    <span class="pubtime">${'阅读 ' + item.view_sum}</span>
                                                    <span class="pubtime">${item.publish_time_fmt}</span>
                                                </div>
                                            </div>
                                            ${articleImgHtml}
                                        </a> 
                                  </article>`
                articleHtml += $html
            }
            else {
                let $html = ``
                if (index == list[indexCh].length - 1) {
                    $html += `<article class="vf-news-list_con vf-news-list_con-three" >`
                }
                else {
                    $html += `<article class="vf-news-list_con vf-news-list_con-three border-bottom">`
                }

                $html += `<a href="./detail.html?articleid=${item.view_id}">
                  <h3 class="title">${item.view_title}</h3>
                  <div class="news-info">`
                if (index < 3) {
                    item.img_list.forEach(img => {
                        $html += `<div class="news-img border">
                            <img src="${img.url + '?x-oss-process=image/resize,m_fill,h_144,w_226,limit_0'}" alt="">
                        </div>`
                    })
                }
                $html += `</div>
                  <div class="title-tips">
                    <span class="news-scour">${item.author_name}</span> 
                    <span class="reply">阅读 ${item.view_sum}</span>`
                if (item.dateShow) {
                    $html += `<span class="pubtime"  >${item.publish_time_fmt}</span>`
                }
                $html += `</div>
                </a>
              </article>`
                articleHtml += $html
            }
        }
        else {
            // let $html = ``
            // if (index == list[indexCh].length - 1) {
            //     $html += `<article class="vf-news-list_con" >`
            // }
            // else {
            //     $html += `<article class="vf-news-list_con border-bottom">`
            // }
            // $html += `<a href="javascript:void(0);" onclick="routeAD(${item.id},${item.type},'${item.title}','${item.url}')">
            //         <div class="AD-info">
            //           <h3 class="title">${item.title}</h3>
            //         </div>
            //         <div class="AD-img">
            //           <img src="${item.bigPic}">
            //         </div>
            //         <div class="AD-bottom">
            //           <img src="http://image.vfanghao.com/ad/ad_txt_blue.png">
            //           <span class="AD-Owern">${item.advertiser}</span>
            //         </div>
            //       </a>
            //     </article>`
            // articleHtml += $html
        }
    })
    $("#articlewrap").html(articleHtml);
}
function jqBottomText() {
    let bottomTextHtml = '';
    if (mcShow && bottomText.length > 0) {
        bottomTextHtml += `<div class="vf-bottom-tps_line" style="display:'block'">
        <span>${bottomText}</span>
      </div>`
    }
    else {
        bottomTextHtml += `<div class="vf-bottom-tps_line" style="display:'none'">
        <span>${bottomText}</span>
      </div>`
    }

    $(".vf-bottom-tps").html(bottomTextHtml);
}
// header 数据加载
function ajaxHeader() {
    util.ajaxGet("/api/view/category").then(res => {
        header = res.data;
        let list = {};
        let need_init_text = bottomTestList.length == 0;
        for (let i = 0; i < res.data.length; i++) {
            list[res.data[i].category_id] = [];
            if (need_init_text) {
                bottomTestList[res.data[i].category_id] = "";
            }

            lastIndex[res.data[i].category_id] = 0;
            firstload[res.data[i].category_id] = true;
            finishedCatagory[res.data[i].category_id] = false;
            scrolltopPosition[res.data[i].category_id] = 0;
        }
        list = list;

        let categoryItem = res.data.find(item => {
            return item.category_id == header[0].category_id;
        });
        clickHeader(header[0].category_id, categoryItem);
    });
}
// header点击
function clickHeader(categoryId) {
    document.documentElement.scrollTop = 0;
    icpShowState = false;
    mcShow = false;
    indexCh = categoryId;
    // 点击数据从新加载
    lastIndex[categoryId] = 0;
    //将没有数据图片隐藏
    showNoDataIcon = false;
    //切换分类之后，需要把对应的开关清空
    finishedCatagory[categoryId] = false;


    jqExecIcp();
    jqExecNoDataIcon();
    jqExecHeader();

    ajaxList(categoryId);
}
// 加载数据列表
function ajaxList(categoryId) {
    return new Promise((resolve, reject) => {

        bottomText = bottomTestList[categoryId] || "";
        if (finishedCatagory[categoryId] == true) {
            return false;
        }

        last_id = lastIndex[categoryId] || 0;

        util.ajaxGet(
            `/api/view/category/list?category_id=${categoryId}&last_id=${
            last_id
            }&platform=1`
        )
            .then(res => {
                // 数据加载完毕
                sw = true;
                if (res.data.length == 0 && last_id == 0) {
                    showNoDataIcon = true;

                    jqExecNoDataIcon();
                    return;
                }
                if (res.code == "1" && res.data) {
                    // 取最后一条数据id
                    if (res.data.length > 0) {
                        let len = res.data.length - 1;
                        lastIndex[categoryId] = res.data[len]["view_id"] || res.data[len - 1]["view_id"] || 0;

                        res.data.map(item => {
                            if (item["publish_time"]) {
                                item["publish_time_fmt"] = util.formatDate(
                                    item["publish_time"]
                                );
                                if ((item.author_name.length < 6 && item.view_sum > 1000 && item.publish_time_fmt.indexOf("201") != -1) || (item.author_name.length > 6 && item.publish_time_fmt.indexOf("201") != -1)) {
                                    item.dateShow = false
                                } else {
                                    item.dateShow = true;
                                }
                            }
                        });

                        if (last_id == 0) {
                            list[categoryId] = res.data;
                            icpShowState = true;
                            jqExecIcp();
                            jqExecListData();
                        } else {
                            list[categoryId] = list[categoryId].concat(
                                res.data
                            );
                            jqExecListData();
                        }
                    }

                    if (
                        res.data.length < 10 ||
                        (res.data.length == 10 &&
                            list[categoryId].length == res.count)
                    ) {
                        finishedCatagory[categoryId] = true;
                        //如果第一页就加载完毕，则不显示文字
                        if (last_id == 0) {
                            bottomTestList[categoryId] = "";
                        } else {
                            mcShow = false;
                            bottomTestList[categoryId] = "您太勤奋了，没有更多了";
                        }
                    } else {
                        bottomTestList[categoryId] = "加载中";
                    }
                    if (!mcShow) {
                        mcShow = true;
                        bottomText = bottomTestList[categoryId];
                    }
                    jqBottomText();

                    resolve(res.data);
                }
            });

    });
}

function onScrollPull() {
    if (document.querySelector(".vf-news")) {
        let innerHeight = document.querySelector(".vf-news").clientHeight;
        let scrollTop =
            document.documentElement.scrollTop || document.body.scrollTop;
        scrolltopPosition[indexCh] = scrollTop;

        if (
            innerHeight <=
            scrollTop + document.documentElement.clientHeight + 60
        ) {
            if (sw == true && finishedCatagory[indexCh] == false) {

                // 将开关关闭
                sw = false;
                ajaxList(indexCh);
            }
        }
    }
}
function routeAD(itemid, itemtype, itemtitle, itemurl) {

    // util.ajaxGet("/api/ad/click/" + itemid + "/" + itemtype).then(res => {
    //     console.log(res);
    //     if (res.code == "1201" || res.code == "1202") {
    //         return;
    //     } else {
    //         if (res.code == 1) {
    //             if (itemtype == 1) {
    //                 window.open(util.vars.domain + "pages/AD?ADId=" + itemid + "&title=" + itemtitle + "&adUrl=" + itemurl, '_self');
    //             } else if (itemtype == 2) {
    //                 window.open(util.vars.domain + "pages/AD?ADId=" + itemid + "&title=" + itemtitle + "&adUrl=" + itemurl, '_self');
    //             } else if (itemtype == 3) {
    //                 window.open(util.vars.domain + "pages/AD?ADId=" + itemid + "&title=" + itemtitle + "&adUrl=" + itemurl, '_self');
    //             }
    //         }
    //     }
    // });
}

// function routeDetail(item) {
//     window.open(util.vars.domain + 'pages/Detail?id=' + item.view_id, '_self')
// }