new Vue({
    el: '#app',
    data() {
        return {
            author: {},         //  作者详情
            viewDetail: { view_title: '', author_name: '', label: '' },     //  观点详情
            metaTitle: 'V房，买房指导专家，房产大V_一对一买房建议，房产知识平台',
            metaContent: '',
            previewImgList: [],  //  预览图片列表
            view_content: "",    //  观点详情详细内容
            likeAmount: 0,      //  观点点赞数
            recommendList: [],  //  推荐列表
            commentList: {},    //  评论列表及回复
            commentTotal: 0,
            showFollow: !1,
            isFollow: 0,        //  0:取消关注(已关注)，1:关注(当前未关注)
            isLike: 0,    //  1 默认点赞 初始化修改
            isCollect: 0, //  1 默认收藏 初始化修改
            isDigg: 0,    // 点赞
            view_id: '',
            author_id: '',
            isblock: 'none',
            isOpenShare: false,
            isShareListMask: 'none',
            url: window.location.href,
            weiboUrl: "",
            downFlag: true,//是否还有数据 true 还有数据
            sw: true,//是否正在请求数据中，防止多次请求 true 加载完毕
            last_id: 0,
            isWechat: false,
            bottomText: "",//底部提示文字
            pageSize: 3,//分页的页面大小

            showCommentLayer: false,//是否显示评论弹层
            commentContent: '',//评论内容

            showReplyLayer: false,//是否显示回复弹层
            replyContent: '',//回复内容
            replyingComment: {},//正在回复的评论对象
            bodyw: document.body.clientWidth,
            subCommentSwitchState: true,//提交评论开关状态
            subCommentLikeSwitchState: true,//提交点赞功能开关状态
            subPostCommentReplyState: true,//提交回复开关状态
            coverdivState: true,//遮罩层展示状态
            isOwnArticle: false,//是否是大v自己的文章
        }
    },
    watch: {},
    computed: {
        publishTime() {
            if (typeof (this.viewDetail.publish_time) === 'number') {
                let date = new Date(this.viewDetail.publish_time);
                return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
            } else {
                return this.viewDetail.publish_time.slice(0, 10);
            }
        }
    },
    beforeRouteLeave(to, from, next) {
        window.removeEventListener("scroll", this.onScrollPull);//移除滚动监听 
    },
    created() {
        this.initData(); 
    },
    mounted() {
        this.$nextTick(() => {
            window.addEventListener('scroll', this.onScrollPull); 
        });
    },
    methods: {
        judgeIsOwnArticle() {
            util.ajaxGet('/api/user/get').then(res => {
                if (res) {
                    if (res.code == '1201' || res.code == '1202') {
                    } else {
                        if (res.code == 1) {
                            if (res.data.v_id == this.author_id) {
                                this.isOwnArticle = true;
                            }
                            else {
                                this.isOwnArticle = false;
                            }
                        }
                    }
                }
            })
        },
        goSearchPage(skeyVal) {
            window.open(util.vars.domain+'pages/Search?skey=' + encodeURIComponent(skeyVal) + '&&isByClickKey=1','_self')
        }, 
        resetData() {
            let rawData = {
                likeAmount: 0,      //  观点点赞数
                commentList: {},    //  评价列表及回复
                isFollow: 0,        //  0:取消关注(已关注)，1:关注(当前未关注)
                isLike: 0,    //  1 默认点赞 初始化修改
                isCollect: 0, //  1 默认收藏 初始化修改
                isblock: 'none',
                isOpenShare: false,
                isShareListMask: 'none',
                url: window.location.href,
                downFlag: true,
                sw: true,
                last_id: 0,
                bottomText: ""
            };
            for (let key in rawData) {
                this[key] = rawData[key];
            }
        },
        initData(to, from) { 
            this.resetData();
            this.view_id = document.querySelector(".hidid").innerText||0;
            this.fetchViewDetail();
            this.fetchStatistic();
            this.fetchRecommendList();
            this.fetchCommentList();
            this.fetchActionStatus(); 
        },
        //滚动事件处理
        onScrollPull(e) {
            if (this.$el.querySelector('.vf-detail_container__evaulate')) {
                let innerHeight = this.$el.querySelector('.vf-detail_container__evaulate').clientHeight;
                let bottomHeight = this.$el.querySelector('.vf-bottom-tps');
                let scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
                if (innerHeight <= scrollTop + document.documentElement.clientHeight) {
                    if (this.sw && this.downFlag) {
                        // 将开关关闭
                        this.sw = false;
                        if (this.last_id != 0) {
                            this.fetchCommentList(this.last_id);
                        }
                    }
                }
            }
        },
        //获取文章详情
        fetchViewDetail() {
            let pic = "http://image-test.davfang.com/saas/id/2018/07/05/71ca43a2-ead6-4595-b225-b36f60a7662d.png";
            // 获取观点详情
            util.ajaxGet(`/api/view/detail?view_id=${this.view_id}`)
                .then((res) => {
                    if (res.code == 1) {
                        this.coverdivState = false;
                        this.viewDetail = res.data;
                        this.metaTitle = this.viewDetail.view_title + ' ' + this.viewDetail.author_name;
                        this.metaContent = 'v房 ' + this.viewDetail.view_title + ' ' + this.viewDetail.author_name + ' ' + this.viewDetail.label;
                        this.author_id = res.data.author_id;
                        this.judgeIsOwnArticle();//判断是否是大v自己的文章
                        this.view_content = res.data.view_content.replace(/\s\s+/g, function (text) {
                            let str = new Array(text.length + 1).join('&nbsp;');
                            return str
                        })
                        this.$nextTick(() => {
                            let that = this; 

                            this.$refs.viewContent.querySelectorAll(".emArticleLoop").forEach(item => {
                                item.style.color = '#36577D';
                                item.style.fontStyle = 'normal'
                                item.style.textDecoration = 'underline'
                                item.style.cursor = 'pointer'
                                item.addEventListener('click', function (params) {
                                    window.open(util.vars.domain+'pages/Search?isByClickKey=1&skey=' + encodeURIComponent(item.innerText),'_self');
                                }, false)
                            })
                        })
                        this.fatchAuthor();
                        this.authFollowStatus();

                    }
                    else if (res.code == 1401) {
                        window.open(util.vars.domain+'pages/Error404','_self');
                    }
                });
        },
        //获取作者信息详情
        fatchAuthor() {
            // 获取作者详情
            util.ajaxGet(`/api/author/detail?author_id=${this.author_id}`).then((res) => {
                if (res && res.code == 1) {
                    this.author = res.data;
                }
            });
        },
        // 获取观点点赞人数
        fetchStatistic() {
            util.ajaxGet(`/api/view/statistics/list?view_id_list=${this.view_id}`).then((res) => {
                // 模拟
                if (res) {
                    this.likeAmount = res.data[0].like_amount;
                }
            });
        },
        //获取推荐列表
        fetchRecommendList() {
            // 获取推荐评论列表
            util.ajaxGet(`/api/view/recommend/list?view_id=${this.view_id}`).then((res) => {
                if (res) {
                    this.recommendList = res.data;
                }
            });
        },
        //递归拆解回复为一个集合
        _recursionReply(reply, to) {
            let arr = [], that = this;
            reply.forEach((item, index) => {
                let obj = {};
                for (let p in item) {
                    if (item.hasOwnProperty(p) && p !== "reply") {
                        obj[p] = item[p];
                    }
                }
                obj["contentFmt"] = obj["content"] + ((to || "") ? "//@" + to : "");
                arr.push(obj);
                arr = arr.concat(that._recursionReply(item.reply, item["user_name"] + ":" + item["content"]));
            });
            return arr;
        },
        //获取评论列表
        fetchCommentList() {
            // 获取该条观点评论列表 首次加载lastId为0
            let that = this;
            let ori_last_id = this.last_id;
            util.ajaxGet(`/api/comment/list?view_id=${this.view_id}&&last_id=${this.last_id}&&page_size=${this.pageSize}`).then((res) => {
                if (res.code == 1) {
                    this.commentTotal = res.data.total_count;
                    if (res.data.comment_list && res.data.comment_list.length > 0) {
                        //调整数据格式
                        res.data.comment_list = res.data.comment_list.map((item, index) => {
                            item['publish_time'] = util.formatDate(item['publish_time']);
                            item['user_avatar'] = item['user_avatar'] || item['user_head'];
                            item['reply'] = that._recursionReply(item['reply'] || []).sort(function (x, y) {
                                //按时间倒排
                                return 0 - ((x.publish_time || 0) - (y.publish_time || 0));
                            });
                            item.userReplay = '';
                            item.showReplay = false;
                            return item;
                        });

                        if (this.last_id == 0) {
                            this.commentList = res.data;
                        } else {
                            this.commentList.comment_list = this.commentList.comment_list.concat(res.data.comment_list);
                        }

                        // 取最后一条数据的comment_id
                        let len = res.data.comment_list.length - 1;
                        this.last_id = res.data.comment_list[len]['comment_id'];

                        // 数据加载完毕
                        this.sw = true;
                    }

                    // 是否有更多记录
                    if (!res.data.comment_list || res.data.comment_list.length < this.pageSize || (res.data.comment_list.length == this.pageSize && this.commentList.comment_list.length == res.data.total)) {
                        this.downFlag = false;
                        //如果第一页就加载完毕，则不显示文字
                        if (ori_last_id == 0) {
                            this.bottomText = "";
                        } else {
                            this.bottomText = "您太勤奋了，没有更多了";
                        }

                    } else {
                        this.downFlag = true;
                        this.bottomText = "加载中";
                    }
                }
            });
        },
        //关注大v
        postFollow() {
            // 是否关注大V
            this.$parent.login(4).then((res) => {
                let follow_type = !this.isFollow + 0;
                util.ajax.post('/author/follow', util.jsonStringify({
                    'author_id': this.author_id,
                    'follow_type': follow_type
                })).then((res) => {
                    if (res.code == 1) {
                        // 切换关注状态
                        this.isFollow = follow_type;
                    }
                });
            });
        },
        //点赞
        postLike(action) {
            // action 1:收藏，2:点赞
            // next_status 0代表取消 1代表点赞/收藏
            let next_status =
                action == 2 ?
                    !this.isLike + 0 :
                    !this.isCollect + 0;

            // 先验证是否登录, 收藏传参
            //        this.$parent.login(3).then((res) => {
            util.ajax.post('/view/change_action_status', util.jsonStringify({
                'view_id': this.view_id,
                'action': action,
                'status': next_status
            })).then((res) => { 
                if (res.code == 1) {
                    // 更新状态 点赞不需要验证登录
                    if (action == 2) {
                        if (!next_status) {
                            this.isLike = 0;
                            this.likeAmount -= 1
                            this.isDigg = 0;
                        } else {
                            this.isLike = 1;
                            this.likeAmount += 1;
                            this.isDigg = 1;
                        }
                    } else if (action == 1) {
                        // 全局toast 是收藏 并且 已经登录
                        if (!next_status) {
                            this.isCollect = 0;
                            this.$toast('取消收藏', {
                                duration: '1000'
                            });
                        } else {
                            this.isCollect = 1;
                            this.$toast('收藏成功', {
                                duration: '1000'
                            });
                        }
                    }
                }
            });
            //        });
        },
        //收藏
        postCollect(action) {
            // action 1:收藏，2:点赞
            // next_status 0代表取消 1代表点赞/收藏
            let next_status =
                action == 2 ?
                    !this.isLike + 0 :
                    !this.isCollect + 0;
            // 先验证是否登录, 收藏传参
            this.$parent.login(3).then((res) => {
                util.ajax.post('/view/change_action_status', util.jsonStringify({
                    'view_id': this.view_id,
                    'action': action,
                    'status': next_status
                })).then((res) => {
                    if (res.code == 1) {
                        // 更新状态 点赞不需要验证登录
                        if (action == 2) {
                            if (!next_status) {
                                this.isLike = 0;
                                this.likeAmount -= 1
                            } else {
                                this.isLike = 1;
                                this.likeAmount += 1;
                            }
                        } else if (action == 1) {
                            // 全局toast 是收藏 并且 已经登录
                            if (!next_status) {
                                this.isCollect = 0;
                                this.$toast('取消收藏', {
                                    duration: '1000'
                                });
                            } else {
                                this.isCollect = 1;
                                this.$toast('收藏成功', {
                                    duration: '1000'
                                });
                            }
                        }
                    }
                });
            });
        },
        //在评论列表和回复列表中查找对应的评论对象
        _findComment(commentid) {
            let _data = null;
            this.commentList.comment_list.forEach((item, index) => {
                if (item.comment_id == commentid) {
                    _data = item;
                } else {
                    item.reply.forEach((ritem, rindex) => {
                        if (ritem.reply_id == commentid) {
                            _data = ritem;
                            _data["reply"] = item.reply;
                        }
                    });
                }
            });
            return _data;
        },
        //点击回复评论按钮
        showReplayInput(commentid) {
            this.$parent.login().then((res) => {
                this.replyingComment = this._findComment(commentid);
                this.showReplyLayer = !this.showReplyLayer;
                if (this.showReplyLayer) {
                    this.$nextTick(() => {
                        this.$refs.ta_replyContent.focus();
                    });
                }
            });
        },
        //提交回复
        postCommentReply() {
            if (this.replyContent.length === 0) {
                this.$toast('请填写回复内容', {
                    duration: '2000'
                });
                return;
            }



            let that = this;
            if (this.replyingComment) {
                if (this.subPostCommentReplyState == true) {//提交评论开关状态为true 则可以提交
                    this.subPostCommentReplyState = false;

                    // 回复评论 验证是否登录
                    this.$parent.login(2).then((res) => {
                        let name = res.data.user_name;
                        let userid = res.data.user_id;
                        util.ajax.post('/comment/replay', util.jsonStringify({
                            'comment_id': this.replyingComment.comment_id || this.replyingComment.reply_id,//评论id或者回复的id
                            'content': this.replyContent
                        })).then((res) => {
                            if (res.code == 1) {
                                let reply = that.replyingComment;
                                //插入到评论回复的数组头部
                                reply.reply.unshift({
                                    user_name: name,
                                    content: that.replyContent,
                                    contentFmt: that.replyContent + ((reply.reply_id || 0) ? "//@" + reply.user_name + ":" + reply.content : ""),
                                    user_id: userid,
                                    reply: [],
                                    reply_id: res.data
                                });
                                that.commentList.total_count += 1;
                            } else {
                                this.$toast('提交失败,' + res.msg || "请稍后重试", {
                                    duration: '2000'
                                });
                            }
                            that.showReplyLayer = !that.showReplyLayer;
                            that.replyContent = "";

                            //防止重复提交
                            let tt = setTimeout(() => {
                                this.subPostCommentReplyState = true;
                            }, 5000)
                        });
                    });
                }
            }

        },
        // 点击点赞评论 0:取消，1:点赞
        postCommentLike(commentid, isLike) {
            if (this.subCommentLikeSwitchState == true) {
                this.subCommentLikeSwitchState = false;

                let that = this;
                //需要校验登录
                this.$parent.login().then((res) => {

                    let comment_type = 0;
                    isLike ? comment_type = 0 : comment_type = 1;
                    util.ajax.post('/comment/like', util.jsonStringify({
                        'comment_id': commentid,
                        'comment_type': comment_type
                    })).then((res) => {
                        if (res.code == 1) {
                            let commentIndex = that.commentList.comment_list.findIndex(function (item) {
                                return item.comment_id == commentid;
                            });
                            isLike ? that.commentList.comment_list[commentIndex].is_like = false : that.commentList.comment_list[commentIndex].is_like = true;
                            isLike ? that.commentList.comment_list[commentIndex].like_amount-- : that.commentList.comment_list[commentIndex].like_amount++;
                        }

                        let tt = setTimeout(() => {
                            this.subCommentLikeSwitchState = true;
                        }, 2000)
                    });

                });
            }
        },
        //获取用户对作者的关注状态
        authFollowStatus() {
            // 获取初始化关注状态
            util.ajaxGet('/api/author/follow_status?author_id=' + this.author_id).then((res) => {
                if (res && res.code == 1) {
                    this.isFollow = res.data + 0; // bool 转换成0/1
                }
                this.showFollow = !0;
            });
        },
        fetchActionStatus() {
            // 获取初始化观点收藏/点赞状态
            util.ajaxGet(`/api/view/action_status?view_ids=${this.view_id}`).then((res) => {
                if (res.code == 1) {
                    this.isLike = res.data[0].like + 0;
                    if (this.isLike != 0) {
                        this.isDigg = 1;
                    }
                    else {
                        this.isDigg = 0;
                    }
                    this.isCollect = res.data[0].collect + 0;
                }
                else {
                    this.isDigg = 0;
                }
            });
        },
        //去大v详情
        goLargeVipDetail() {
            window.open(util.vars.domain+ "pages/LargeVipDetail?aId="+this.author_id,'_self');
        },
        //点击评论文章
        clickComment() {
            this.$parent.login().then((res) => {
                this.showCommentLayer = !this.showCommentLayer;
                if (this.showCommentLayer) {
                    this.$nextTick(() => {
                        this.$refs.ta_commnetContent.focus();
                    });
                }
            });
        },
        //提交评论
        submitComment() {
            if (this.commentContent.length === 0) {
                this.$toast('请填写评论内容', {
                    duration: '2000'
                })
            }
            else {
                if (this.subCommentSwitchState == true) {//提交评论开关状态为true 则可以提交
                    this.subCommentSwitchState = false;



                    let that = this;
                    util.ajax.post('/comment/post', util.jsonStringify({
                        view_id: this.view_id,
                        content: this.commentContent
                    })).then((res) => {
                        if (res.code === 1 && res.data) {
                            that.commentContent = "";
                            this.$toast('提交成功', {
                                duration: '1000'
                            });
                            //更新评论列表
                            that.last_id = 0;
                            that.fetchCommentList();
                        } else {
                            this.$toast('提交失败,' + res.msg || "请稍后重试", {
                                duration: '2000'
                            });
                        }
                        //关闭输入评论弹层
                        that.clickComment();
                        //清空输入的内容
                        this.commentContent = "";
                        //防止重复提交
                        let tt = setTimeout(() => {
                            this.subCommentSwitchState = true;
                        }, 5000)
                    });
                }
            }
        },
        //查看其它文章详情
        goDetail(view_id) {
            window.open(util.vars.domain+'pages/Detail?id='+view_id,'_self')
        }, 
     
        //点击浮窗调回首页
        backToHome() {
            window.open(util.vars.domain,'_self')
        },
        
        //取消评论和回复
        cancelComment() {
            this.showCommentLayer = false;
            this.showReplyLayer = false;
        }
    }
})