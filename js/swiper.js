(function() {
    var Swiper = function(options, wrapper) {
        this.width = options.width || 400;
        this.height = options.height || 300;
        this.content = options.content || [];
        this.lrBtnStatus = options.lrBtnStatus || 'hover';
        this.isSpots = boolIdea(options.isSpots);
        this.spotSize = options.spotSize || 8;
        this.spotPos = options.spotPos || 'center';
        this.type = options.type || 'animate';
        this.aTime = options.aTime || 'normal';
        this.autoTime = options.autoTime || 3000;
        this.autoPlay = boolIdea(options.autoPlay);
        this.wrapper = wrapper;
        this.len = this.content.length;
        this.nowIndex = 0;
        this.$sContent = null;
        this.isPlaying = false;
        this.timerId = null;
        this.init(); //初始化
    };
    // 处理传递的布尔值
    function boolIdea(bool) {
        return typeof bool === 'boolean' ? bool : true;
    }
    Swiper.prototype = {
        constructor: Swiper,
        // 初始化
        init: function() {
            // 初始化结构、样式
            this.renderSwiperDom();
            // 绑定事件
            this.bindEvent();
        },
        // 渲染结构、样式
        renderSwiperDom: function() {
            // 轮播图内容
            this._swiperContentDom();
            // 轮播图左右按钮
            this._swiperBtnDom();
            // 轮播图小圆点
            this.isSpots && this._swiperSpotDom();
        },
        // 渲染轮播图内容到页面
        _swiperContentDom: function() {
            var sContent = Array.prototype.slice.call(this.content);
            sContent[this.len] = $(sContent[0]).clone();
            $('<div class="my-swiper-content"/>').
            css({
                width: this.type === 'animate' ? this.width * (this.len + 1) : this.width
            }).
            append(
                $.map(sContent, function(ele, index) {
                    return $('<div class="my-swiper-' + this.type + '"/>').
                    css({
                        width: this.width,
                        height: this.height,
                        zIndex: (this.len + 1) - index
                    }).
                    append(ele);
                }.bind(this))).
            appendTo(this.wrapper);
            $(this.wrapper).css({
                position: 'relative',
                width: this.width,
                height: this.height,
                overflow: 'hidden'
            });
            this.$sContent = $('.my-swiper-content', this.wrapper);
        },
        // 渲染按钮到页面
        _swiperBtnDom: function() {
            $('<div class="my-swiper-cbtn"/>').
            append('<button class="my-swiper-btn my-swiper-lbtn iconfont">&#xe72a;</button>').
            append('<button class="my-swiper-btn my-swiper-rbtn iconfont">&#xe71a;</button>').
            appendTo(this.wrapper);
            // 按钮显示状态设置
            var cbtn = $('.my-swiper-cbtn', this.wrapper);
            switch (this.lrBtnStatus) {
                case 'always':
                    cbtn.show();
                    break;
                case 'hide':
                case 'hover':
                    cbtn.hide();
                    break;
                default:
                    break;
            }
        },
        // 渲染小圆点到页面
        _swiperSpotDom: function() {
            $('<div class="my-swiper-cspots ' + this.spotPos + '"/>').
            append($.map(this.content, function(ele, index) {
                return $('<span class="my-swiper-spot" data-index="' + index + '"/>').
                css({
                    width: this.spotSize,
                    height: this.spotSize
                });
            }.bind(this))).
            appendTo(this.wrapper).
            children().
            eq(0).
            addClass('my-swiper-spot-active');
        },
        // 事件绑定
        bindEvent: function() {
            /**
             * 绑定进入、出去轮播图事件：
             * 1. 根据参数是否显示左右按钮
             * 2. 暂停与开始轮播图轮播
             */
            this.swiperHover();
            // 左右按钮绑定点击事件
            this.lrBtnStatus != 'hide' && this.swiperBtnClick();
            // 小圆点点击事件
            this.isSpots && this.swiperSpotClick();
            // 自动播放
            this.autoPlay && this.swiperAutoPlay();
        },
        // 轮播图鼠标进入、离开事件
        swiperHover: function() {
            var that = this,
                count = 0;
            $(this.wrapper).hover(function() {
                // 显示、隐藏按钮切换
                if (that.lrBtnStatus === 'hover') {
                    $('.my-swiper-cbtn', this).toggle();
                }
                // 启动、暂停自动播放
                if (count++ % 2 == 0) {
                    // true：鼠标进入-暂停播放
                    clearInterval(that.timerId);
                } else {
                    // false：鼠标离开-启动播放
                    that.autoPlay && that.swiperAutoPlay();
                }
            });
        },
        // 按钮点击事件
        swiperBtnClick: function() {
            var that = this;
            $('.my-swiper-cbtn', this.wrapper).on('click', '.my-swiper-btn', function(ev) {
                var targetClass = ev.target.classList;
                if (that.isPlaying) {
                    return false;
                }
                that.isPlaying = true;
                // 左按钮点击事件
                if (targetClass.contains('my-swiper-lbtn')) {
                    if (that.nowIndex > that.len - 1) {
                        that.$sContent.css({
                            left: 0
                        });
                        that.nowIndex = 1;
                    } else {
                        that.nowIndex++;
                    }
                    that._swiperSport();
                } else if (targetClass.contains('my-swiper-rbtn')) {
                    // 右按钮点击事件
                    if (that.nowIndex <= 0) {
                        that.type == 'animate' && (that.$sContent.css({
                            left: -that.len * that.width
                        }));
                        that.nowIndex = that.len - 1;
                    } else {
                        that.nowIndex--;
                    }
                    that._swiperSport();
                }
            });
        },
        // 轮播图动画
        _swiperSport: function() {
            var that = this;
            // 轮播图小圆点样式变化
            this._swiperSpotActive();
            // 轮播图运动
            if (this.type === 'animate') {
                this.$sContent.animate({
                    left: -this.nowIndex * this.width
                }, this.aTime, function() {
                    that.isPlaying = false;
                });
            } else if (this.type === 'fade') {
                this.$sContent.children().eq(this.nowIndex).fadeIn(this.aTime, function() {
                    that.isPlaying = false;
                }).siblings().fadeOut(this.aTime, function() {
                    that.isPlaying = false;
                });
            }
        },
        // 小圆点样式激活
        _swiperSpotActive: function() {
            $('.my-swiper-cspots', this.wrapper).
            children().
            removeClass('my-swiper-spot-active').
            eq(this.nowIndex % this.len).
            addClass('my-swiper-spot-active');
        },
        // 小圆点点击事件
        swiperSpotClick: function() {
            var that = this;
            $('.my-swiper-cspots', this.wrapper).on('click', '.my-swiper-spot', function(ev) {
                var currentIndex = ev.target.dataset['index'];
                if (currentIndex === that.nowIndex) {
                    return false;
                }
                that.nowIndex = currentIndex;
                that._swiperSport();
            });
        },
        // 自动播放
        swiperAutoPlay: function() {
            this.timerId = setInterval(function() {
                $('.my-swiper-lbtn', this.wrapper).trigger('click');
            }.bind(this), this.autoTime);
        }
    };
    //jQuery原型扩展
    $.fn.extend({
        swiper: function(options) {
            var obj = new Swiper(options || {}, this);
            return $(this);
        }
    });
}());

$('#wrapper').swiper({
    width: 500,
    height: 300,
    content: $('.item'), //插入轮播图内容
    // lrBtnStatus: 'hover',
    // isSpots: true,
    // spotSize: 8,
    // spotPos: 'right',
    // type: 'animate',
    // autoPlay: true,
    // aTime: 'normal',
    // autoTime: 5000
});