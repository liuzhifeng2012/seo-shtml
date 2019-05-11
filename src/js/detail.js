var author = {}         //  作者详情
var viewDetail = {}     //  观点详情
// var metaTitle = 'V房，买房指导专家，房产大V_一对一买房建议，房产知识平台'
// var metaContent = ''
var previewImgList = []  //  预览图片列表
var view_content = ""    //  观点详情详细内容
var likeAmount = 0      //  观点点赞数
var recommendList = []  //  推荐列表
var commentList = {}    //  评论列表及回复
var commentTotal = 0
var showFollow = !1
var isFollow = 0        //  0=取消关注(已关注)，1=关注(当前未关注)
var isLike = 0    //  1 默认点赞 初始化修改
var isCollect = 0 //  1 默认收藏 初始化修改
var isDigg = 0    // 点赞
var view_id = ''
var author_id = ''
var isblock = 'none'
var isOpenShare = false
var isShareListMask = 'none'
var url = window.location.href
var weiboUrl = ""
var downFlag = true//是否还有数据 true 还有数据
var sw = true//是否正在请求数据中，防止多次请求 true 加载完毕
var last_id = 0
var isWechat = false
var bottomText = ""//底部提示文字
var pageSize = 3//分页的页面大小

var showCommentLayer = false//是否显示评论弹层
var commentContent = ''//评论内容

var showReplyLayer = false//是否显示回复弹层
var replyContent = ''//回复内容
var replyingComment = {}//正在回复的评论对象
var bodyw = document.body.clientWidth
var subCommentSwitchState = true//提交评论开关状态
var subCommentLikeSwitchState = true//提交点赞功能开关状态
var subPostCommentReplyState = true//提交回复开关状态
var coverdivState = true//遮罩层展示状态 
var loginWrapState = false//是否显示登录弹窗
$(function () {
    window.addEventListener('scroll', this.onScrollPull);

    initData();

    //返回首页
    $(".header-left,.floatBtnToHome").click(() => {
        backToHome();
    })
    //进入大v页面
    $("#author_name,#davFocus").click(() => {
        // goLargeVipDetail();
    })
    //关注
    $(".isFollow,.noIsFollow").click(() => {
        // postFollow();
    })
    //点赞
    $("#isDigg,#noIsDigg").click(() => {
        // postLike(2);
    })
    //写评论
    $(".detail-footer_left,.detail-footer_right").click(() => {
        // clickComment();
    })
    //点赞
    $("#postCollect").click(() => {
        // postCollect(1)
    })
    //抢沙发
    $(".comm-none").children('a').click(() => {
        // clickComment();
    })
})
function goSearchPage(skeyVal) {
    // window.open(util.vars.domain + 'pages/Search?skey=' + encodeURIComponent(skeyVal) + '&&isByClickKey=1', '_self')
}

function initData() {
    view_id = util.getQueryString("articleid");
    resetData();
    // fetchViewDetail();
    // fetchStatistic();
    fetchRecommendList();
    fetchCommentList();
    // fetchActionStatus();
}
function resetData() {
    likeAmount = 0      //  观点点赞数
    commentList = {}    //  评价列表及回复
    isFollow = 0        //  0=取消关注(已关注)，1=关注(当前未关注)
    isLike = 0    //  1 默认点赞 初始化修改
    isCollect = 0 //  1 默认收藏 初始化修改
    isblock = 'none'
    isOpenShare = false
    isShareListMask = 'none'
    url = window.location.href
    downFlag = true
    sw = true
    last_id = 0
    bottomText = ""
}

//滚动事件处理
function onScrollPull(e) {
    if (document.querySelector('.vf-detail_container__evaulate')) {
        let innerHeight = document.querySelector('.vf-detail_container__evaulate').clientHeight;
        let bottomHeight = document.querySelector('.vf-bottom-tps');
        let scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
        if (innerHeight <= scrollTop + document.documentElement.clientHeight) {
            if (sw && downFlag) {
                // 将开关关闭
                sw = false;
                if (last_id != 0) {
                    fetchCommentList(last_id);
                }
            }
        }
    }
}
//获取文章详情
function fetchViewDetail() {
    let pic = "http://image-test.davfang.com/saas/id/2018/07/05/71ca43a2-ead6-4595-b225-b36f60a7662d.png";
    // 获取观点详情
    util.ajaxGet(`/api/view/detail?view_id=${view_id}`)
        .then((res) => {
            if (res.code == 1) {
                coverdivState = false;
                viewDetail = res.data;
                // metaTitle = viewDetail.view_title + ' ' + viewDetail.author_name;
                // metaContent = 'v房 ' + viewDetail.view_title + ' ' + viewDetail.author_name + ' ' + viewDetail.label;
                let metaContent = viewDetail.view_content.replace(/<\/?.+?>/g, "").replace(/ /g, "").substr(0, 100);
                let metaKeywords = 'V房，V房网，房产大V，饭总选房，北京买房，购房买房，房产资讯，北京房产'
                $("head").append(`<meta name="description" content="${metaContent}" />`).append(`<meta name="keywords" content="${metaKeywords}" />`);
                $('title').html(viewDetail.view_title);
                if (viewDetail.label && viewDetail.label.length > 0) {
                    $(".taglist").show().html('');
                    viewDetail.label.split(',').forEach(item => {
                        let tagitem = $("<li>").addClass('tagitem').text(item).click(() => {
                            // goSearchPage(item);
                        })
                        $(".taglist").append(tagitem);
                    })
                }
                else {
                    $(".taglist").hide();
                }

                if (viewDetail.view_title) {
                    $("#view_title").show().html(viewDetail.view_title);
                }
                else {
                    $("#view_title").hide().html('');
                }

                view_content = res.data.view_content.replace(/\s\s+/g, function (text) {
                    let str = new Array(text.length + 1).join('&nbsp;');
                    return str
                })
                $("#viewContent").html(view_content);
                document.querySelectorAll(".emArticleLoop").forEach(item => {
                    item.style.color = '#36577D';
                    item.style.fontStyle = 'normal'
                    item.style.textDecoration = 'underline'
                    item.style.cursor = 'pointer'
                    item.addEventListener('click', function (params) {
                        // window.open(util.vars.domain + 'pages/Search?isByClickKey=1&skey=' + encodeURIComponent(item.innerText), '_self');
                    }, false)
                })

                let tmptime = new Date(viewDetail.publish_time);
                tmptime = `${tmptime.getFullYear()}-${(tmptime.getMonth() + 1) > 9 ? (tmptime.getMonth() + 1) : ('0' + (tmptime.getMonth() + 1))}-${tmptime.getDate() > 9 ? tmptime.getDate() : ('0' + tmptime.getDate())}`
                viewDetail.publish_time = tmptime
                if (viewDetail.publish_time) {
                    $("#publish_time").show().text(viewDetail.publish_time);
                }
                else {
                    $("#publish_time").hide().text('');
                }

                author_id = res.data.author_id;
                fatchAuthor();
                authFollowStatus();
                setTimeout(() => {
                    $('.loadingContainer').hide();
                }, 500)
            }
            else if (res.code == 1401) {
                // window.open(util.vars.domain + 'pages/Error404', '_self');
            }
        });
}
//获取作者信息详情
function fatchAuthor() {
    // 获取作者详情
    util.ajaxGet(`/api/author/detail?author_id=${author_id}`).then((res) => {
        if (res && res.code == 1) {
            author = res.data;
            let avatarImg = `<img src="./images/default_user_img.png" />`
            if (author.author_avatar) {
                avatarImg = `<img src="${author.author_avatar + '?x-oss-process=image/resize,m_fill,h_200,w_200,limit_0'}" alt="">`
            }
            $(".dvhead,.V-pic").html(avatarImg);
            if (author.desc) {
                $("#authorDesc").show().find("span").text(author.desc)
                $("#noAuthorDesc").hide()
            }
            else {
                $("#authorDesc").hide().find("span").text('')
                $("#noAuthorDesc").show()
            }

            $("#author_name,.author_name").text(author.author_name);
        }
    });
}
// 获取观点点赞人数
function fetchStatistic() {
    util.ajaxGet(`/api/view/statistics/list?view_id_list=${view_id}`).then((res) => {
        // 模拟
        if (res) {
            likeAmount = res.data[0].like_amount;
            likeAmount = likeAmount > 0 ? (likeAmount > 99 ? "99+" : likeAmount) : ""
            if (likeAmount) {
                $('.likeAmount').show().text(likeAmount);
            }
            else {
                $('.likeAmount').hide().text('');
            }
        }
    });
}
//获取推荐列表
function fetchRecommendList() {
    // 获取推荐评论列表
    util.ajaxGet(`/api/view/recommend/list?view_id=${view_id}`).then((res) => {
        if (res) {
            recommendList = res.data;
            if (recommendList && recommendList.length > 0) {
                $(".vf-detail_container__otherV").show().children("ul").html('');
                recommendList.forEach(item => {
                    let $li = $("<li>").click(() => {
                        goDetail(item.view_id);
                    });
                    let $a = $("<a>").attr('href', "javascript:;").text(item.view_title);
                    $li.append($a);
                    $(".vf-detail_container__otherV").children("ul").append($li)
                })
            }
            else {
                $(".vf-detail_container__otherV").hide().html('');
            }
        }
    });
}
//递归拆解回复为一个集合
function _recursionReply(reply, to) {
    let arr = [];
    reply.forEach((item, index) => {
        let obj = {};
        for (let p in item) {
            if (item.hasOwnProperty(p) && p !== "reply") {
                obj[p] = item[p];
            }
        }
        obj["contentFmt"] = obj["content"] + ((to || "") ? "//@" + to : "");
        arr.push(obj);
        arr = arr.concat(_recursionReply(item.reply, item["user_name"] + ":" + item["content"]));
    });
    return arr;
}
//获取评论列表
function fetchCommentList() {
    // 获取该条观点评论列表 首次加载lastId为0
    let ori_last_id = last_id;
    util.ajaxGet(`/api/comment/list?view_id=${view_id}&&last_id=${last_id}&&page_size=${pageSize}`).then((res) => {
        if (res.code == 1) {
            commentTotal = res.data.total_count;
            if (commentTotal) {
                let tmpcount = commentTotal > 99 ? "99+" : commentTotal + ""
                $("#commentListTotal").show().text(tmpcount);
                $(".comm-none").hide();
            }
            else {
                $("#commentListTotal").hide().text('');
                $(".comm-none").show();
            }
            if (res.data.comment_list && res.data.comment_list.length > 0) {
                //调整数据格式
                res.data.comment_list = res.data.comment_list.map((item, index) => {
                    item['publish_time'] = util.formatDate(item['publish_time']);
                    item['user_avatar'] = item['user_avatar'] || item['user_head'];
                    item['reply'] = _recursionReply(item['reply'] || []).sort(function (x, y) {
                        //按时间倒排
                        return 0 - ((x.publish_time || 0) - (y.publish_time || 0));
                    });
                    item.userReplay = '';
                    item.showReplay = false;
                    return item;
                });

                if (last_id == 0) {
                    commentList = res.data;
                } else {
                    commentList.comment_list = commentList.comment_list.concat(res.data.comment_list);
                }

                // 取最后一条数据的comment_id
                let len = res.data.comment_list.length - 1;
                last_id = res.data.comment_list[len]['comment_id'];

                // 数据加载完毕
                sw = true;
            }

            // 是否有更多记录
            if (!res.data.comment_list || res.data.comment_list.length < pageSize || (res.data.comment_list.length == pageSize && commentList.comment_list.length == res.data.total)) {
                downFlag = false;
                //如果第一页就加载完毕，则不显示文字
                if (ori_last_id == 0) {
                    bottomText = "";
                } else {
                    bottomText = "您太勤奋了，没有更多了";
                }

            } else {
                downFlag = true;
                bottomText = "加载中";
            }

            //jquery赋值
            if (commentTotal > 0) {
                let commentlistStr = ''
                res.data.comment_list.forEach(item => {
                    commentlistStr += `<div class="evaulate-list">
                           <div class="pic">`
                    if (item.user_avatar) {
                        commentlistStr += `<img src="${item.user_avatar}">`
                    }
                    else {
                        commentlistStr += `<img src="./images/default_user_img.png">`
                    }
                    commentlistStr += `</div>
                           <div class="info">
                               <div class="info-content">`
                    if (item.user_name) {
                        commentlistStr += `<p>${item.user_name}</p>`
                    }
                    if (item.content) {
                        commentlistStr += `<p onclick="showReplayInput(${item.comment_id},${view_id})">${item.content}</p>`
                    }
                    commentlistStr += `<div class="detail clearfix">
                                       <span class="times">${item.publish_time}</span>
                                       <!--评论点赞-->
                                       <span class="nums" onclick="postCommentLike(${item.comment_id}, ${item.is_like},${view_id})">`
                    if (item.is_like) {
                        commentlistStr += `<svg class="icon on" aria-hidden="true">
                                          <use xlink:href="#icon-thumbs-up-color1"></use>
                                        </svg>`
                    }
                    else {
                        commentlistStr += `<svg class="icon" aria-hidden="true">
                                        <use xlink:href="#icon-thumbs-up"></use>
                                    </svg>`
                    }
                    commentlistStr += `${item.like_amount > 99 ? "99+" : item.like_amount + ""}
                                       </span>
                                       <!--回复评论按钮-->
                                       <span class="message" onclick="showReplayInput(${item.comment_id})">
                                           <svg class="icon" aria-hidden="true">
                                               <use xlink:href="#icon-message-square"></use>
                                           </svg>
                                           ${item.reply.length > 99 ? "99+" : item.reply.length + ""}`
                    if (item.reply && item.reply.length > 0 || item.showReplay) {
                        commentlistStr += `<i></i>`
                    }
                    commentlistStr += `</span>
                                   </div>`
                    if (item.reply && item.reply.length > 0) {
                        commentlistStr += `<div class="return-message">
                                    <!--回复列表-->`
                        if (item.reply && item.reply.length > 0) {
                            item.reply.forEach(relayItem => {
                                commentlistStr += `<div class="return-message_list">
                                            <em>${relayItem.user_name}：</em>
                                            <em onclick="showReplayInput(${relayItem.reply_id},${view_id})">${relayItem.contentFmt}</em>
                                        </div>`
                            })
                        }
                        commentlistStr += `</div>`
                    }

                    commentlistStr += `</div>
                           </div>
                       </div> `
                })

                $(".vf-detail_container__evaulate").append(commentlistStr);
            }
            if (bottomText.length > 0) {
                $(".vf-bottom-tps").show();
                $(".vf-bottom-tps_line").children("span").text(bottomText);
            }
            else {
                $(".vf-bottom-tps").hide();
                $(".vf-bottom-tps_line").children("span").text('');
            }
        }
    });
}
//关注大v
function postFollow() {
    loginWrapState = true;
    setTimeout(() => {
        // window.open(util.vars.domain + "pages/SeoHtmlMid?sourcepath=seo&id=" + view_id, "_self");
        // window.open("http://192.168.1.225/pages/SeoHtmlMid?sourcepath=seo&id=" + view_id, "_self");
    }, 1000)
}
//点赞
function postLike(action) {
    //this.loginWrapState = true;
    // setTimeout(() => {
    //     window.open(util.vars.domain + "pages/SeoHtmlMid?sourcepath=seo&id=" + view_id, "_self");
    // }, 1000)
}
//收藏
function postCollect(action) {
    //this.loginWrapState = true;
    // setTimeout(() => {
    //     window.open(util.vars.domain + "pages/SeoHtmlMid?sourcepath=seo&id=" + view_id, "_self");
    // }, 1000)
}

//获取用户对作者的关注状态
function authFollowStatus() {
    // 获取初始化关注状态
    util.ajaxGet('/api/author/follow_status?author_id=' + author_id).then((res) => {
        if (res && res.code == 1) {
            isFollow = res.data + 0; // bool 转换成0/1
        }
        showFollow = !0;
        if (showFollow) {
            $(".showFollow").show();
        }
        else {
            $(".showFollow").hide();
        }
        if (isFollow == 1) {
            $(".isFollow").show();
            $(".noIsFollow").hide();
        }
        else {
            $(".isFollow").hide();
            $(".noIsFollow").show();
        }
    });
}
function fetchActionStatus() {
    // 获取初始化观点收藏/点赞状态
    util.ajaxGet(`/api/view/action_status?view_ids=${view_id}`).then((res) => {
        if (res.code == 1) {
            isLike = res.data[0].like + 0;
            if (isLike != 0) {
                isDigg = 1;
            }
            else {
                isDigg = 0;
            }
            isCollect = res.data[0].collect + 0;
            if (isCollect) {
                $("#isCollect").show();
                $("#noIsCollect").hide();
            }
            else {
                $("#isCollect").hide();
                $("#noIsCollect").show();
            }
        }
        else {
            isDigg = 0;
        }

        if (isDigg) {
            $("#isDigg").show();
            $("#noIsDigg").hide();
        } else {
            $("#isDigg").hide();
            $("#noIsDigg").show();
        }
    });
}
//去大v详情
function goLargeVipDetail() {
    // window.open(util.vars.domain + "pages/LargeVipDetail?aId=" + author_id, '_self');
}
//点击评论文章
function clickComment() {
    //this.loginWrapState = true;
    // setTimeout(() => {
    //     window.open(util.vars.domain + "pages/SeoHtmlMid?sourcepath=seo&id=" + view_id, "_self");
    // }, 1000)
}

//查看其它文章详情
function goDetail(view_id) {
    // window.open(util.vars.domain + 'pages/Detail?id=' + view_id, '_self')
    window.open('./detail.html?articleid=' + view_id, '_self')
}

//点击浮窗调回首页
function backToHome() {
    // window.open(util.vars.domain, '_self')
    window.history.go(-1)
}

// //取消评论和回复
// function cancelComment() {
//     this.showCommentLayer = false;
//     this.showReplyLayer = false;
// }
//点击回复评论按钮
function showReplayInput(commentid, view_id) {
    //this.loginWrapState = true;
    // setTimeout(() => {
    //     window.open(util.vars.domain + "pages/SeoHtmlMid?sourcepath=seo&id=" + view_id, "_self");
    // }, 1000)
}
// 点击点赞评论 0:取消，1:点赞
function postCommentLike(commentid, isLike, view_id) {
    //this.loginWrapState = true;
    // setTimeout(() => {
    //     window.open(util.vars.domain + "pages/SeoHtmlMid?sourcepath=seo&id=" + view_id, "_self");
    // }, 1000)
}
