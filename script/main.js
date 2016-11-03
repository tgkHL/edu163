var clientWidth = getClientWidth();     //全局变量，获取可视区宽度

/**
 * 模块：响应式布局
 * 说明：由于IE8不兼容媒体查询，这里统一使用JS进行宽窄屏适配
 *       由于需要改变的样式很少，所以没有创建<link>，而是直接更改元素类名
 */
(function() {
    /* 初始化布局，如果是窄屏，则更改样式 */
    if(clientWidth < 1205) {
        changeStyle(true);
    }
    /**
     * 更改样式函数，通过操作类名，进行响应式布局
     * @param  {Boolean} isNarrow 若为true，进行窄屏布局；为false，宽屏
     */
    function changeStyle(isNarrow) {
        var gFlows = getElementsByClassName(document, 'g-flow'),
            main = getElementsByClassName(document, 'g-mn')[0],
            footer = getElementsByClassName(document, 'm-ft')[0],
            intro = getElementsByClassName(document, 'm-intro')[0];
        if(isNarrow){
            for(var i = 0; i < gFlows.length; i++){
                addClassName(gFlows[i], 'j-narrow');
            }
            addClassName(main, 'j-narrow');
            addClassName(footer, 'j-narrow');
            addClassName(intro, 'j-narrow');
        }else{
            for(var i = 0; i < gFlows.length; i++){
                removeClassName(gFlows[i], 'j-narrow');
            }
            removeClassName(main, 'j-narrow');
            removeClassName(footer, 'j-narrow');
            removeClassName(intro, 'j-narrow');
        }
    }
    /* 注册resize事件，宽窄屏切换时更改布局 */
    addEvent(window, 'resize', function(){
        var newWidth = getClientWidth();
        /* 确实切换的时候，才进行更改 */
        if(newWidth >= 1205 && clientWidth < 1205){
            changeStyle(false);
        }else if (newWidth < 1205 && clientWidth >= 1205){
            changeStyle(true);
        }
        clientWidth = newWidth;     // 更新视口宽度
    });
})();

/**
 * 模块：关闭顶部通知条
 * 说明：tips默认是隐藏的，根据有无cookie判断显示还是继续隐藏
 *       点击关闭后，设置tips cookie
 */
(function () {
    var tips = document.getElementById('tips'),
        close = getElementsByClassName(tips, 'j-close')[0];
    /* 没有cookie时，显示通知条并注册关闭事件 */
    if(!getCookies().tips){
        addClassName(tips, 'z-show');
        addEvent(close, 'click', closeTips);
    }
    /* 事件处理：隐藏通知条并设置cookie（有效期7天） */
    function closeTips() {
        removeClassName(tips, 'z-show');
        setCookie('tips', 'off', setExpires(7));
    }
})();

/**
 * 模块：登录
 * @param  {function} func 如果传参数，登录成功后会执行所传函数
 * 举例：通过“关注”调用时，可以传入登录成功后希望进行的“关注”动作
 */
function login(func) {
    var layout = getElementsByClassName(document, 'g-login')[0],
        close = getElementsByClassName(layout, 'close')[0],
        form = layout.getElementsByTagName('form')[0],
        username = document.getElementById('username'),
        password = document.getElementById('password'),
        submit = document.getElementById('submit'),
        error = getElementsByClassName(layout, 'error')[0];
    /* 先出现弹窗，并注册关闭事件 */
    addClassName(layout, 'z-show');
    addEvent(close, 'click', function(){
        removeClassName(layout, 'z-show');
    });

    var url = '//study.163.com/webDev/login.htm';
    /**
     * 回调函数，ajax请求成功时调用
     * 功能：登录成功时，关闭弹窗，设置cookie，并执行func（如果传入的话）
     *       登录失败时，显示提示信息
     * @param  {Number} response 响应文本，1表示登录成功
     */
    function loginResponse(response) {
        if(response == 1) {
            removeClassName(layout, 'z-show');  // 关闭弹窗
            setCookie('loginSuc', true);        // 设置cookie
            if(typeof func == 'function') {     // 如果有传入函数，执行
                func();
            }
        }else{
            addClassName(error, 'z-show');      // 显示提示
            setTimeout(function(){              // 5秒后提示消失
                removeClassName(error, 'z-show');
            }, 5000);
        }
    }
    /* 表单提交事件 */
    addEvent(form, 'submit', function(event){
        event = getEvent(event);
        /* 查询参数（对象） */
        var searchObj = {
            userName: md5(username.value),
            password: md5(password.value)
        };
        /* 表单验证：用户名和密码不能为空，若为空，取消默认事件
         * 我已经使用了表单控件的required属性进行验证，但是IE8不支持，所以加一层判断
         */
        if(!searchObj.userName || !searchObj.password){
            preventDefault(event);
            return;
        }
        /* 将查询参数序列化，构建请求url，并发送 */
        var _url = url+'?'+serialize(searchObj);
        get(_url, loginResponse);
        preventDefault(event);
    });
}

/**
 * 模块：导航关注
 * 说明：如果有关注cookie，直接换成不可点击的已关注状态
 *       点击关注时，如果有登录cookie，则发送关注请求
 *                   如果没有登录cookie，调用登录模块，成功后发送关注请求
 */
(function() {
    var follow = document.getElementById('follow');
    addEvent(follow, 'click', setFollow);
    /* 如果有关注cookie，切换状态，取消点击关注事件 */
    if(getCookies().followSuc == 'true'){
        addClassName(follow, 'z-followed');
        getElementsByClassName(follow, 'status')[0].innerText = '已关注';
        removeEvent(follow, 'click', setFollow);
    }
    /**
     * 关注请求函数
     * 请求成功，设置关注cookie，切换已关注状态
     */
    function followRequest(){
        var url = '//study.163.com/webDev/attention.htm';
        /* 回调函数，请求成功，设置关注cookie，切换已关注状态 */
        function followResponse(response) {
            if(response == 1){
                setCookie('followSuc', true, setExpires(365));
                addClassName(follow, 'z-followed');
                getElementsByClassName(follow, 'status')[0].innerText = '已关注';
                removeEvent(follow, 'click', setFollow);
            }
        }
        /* 发送请求 */
        get(url, followResponse);
    }
    /**
     * 点击关注时的事件处理函数
     * 功能：没有登录cookie，调用登录模块，登陆成功后发送关注请求
     *       有登录cookie，直接发送关注请求
     */
    function setFollow() {
        if(!getCookies().loginSuc) {
            login(followRequest);   // 登录成功后，执行传入的函数
        }else{
            followRequest();
        }
    }
})();


/**
 * 模块：轮播
 * 说明：每5秒入场图片淡入，循环播放，hover时暂停，点击下方导航圆点可切换图片
 */
(function() {
    var slider = document.getElementById('slider'),
        imgs = slider.getElementsByTagName('a'),
        navs = slider.getElementsByTagName('i'),
        index = 0,      // 当前下标
        timer = null;   // 计时器
    /* 淡入函数，使element透明度 0 --> 1 */
    function fadein(element){
        var value = 0,
            step = 0.1;
        setOpacity(element, 0);
        var change = setInterval(function(){
            value += step;
            setOpacity(element, value);
            if(value >= 1){
                clearInterval(change);
            }
        }, 50);
    }
    /* 展示下标为curIndex的图片 */
    function banner(curIndex) {
        /* 隐藏图片，清除导航样式 */
        for (var i = 0; i < imgs.length; i++) {
            removeClassName(navs[i], 'z-selected');
            imgs[i].style.display = 'none';
            setOpacity(imgs[i], 0);
        }
        /* 淡入显示图片，切换导航圆点 */
        addClassName(navs[curIndex], 'z-selected');
        imgs[curIndex].style.display = 'block';
        fadein(imgs[curIndex]);
        index = curIndex;   // 更新下标
    }
     /* 自动轮播函数，每5秒调用banner切换 */
    function autoPlay() {
        clearInterval(timer);
        timer = setInterval(function () {
            index = (index + 1) % imgs.length;  // 用取余的方法保证下标始终为0-2
            banner(index);
        }, 5000);
    }
    /* 开始执行轮播 */
    autoPlay();
    /* 给原点注册事件，点击切换 */
    for (var i = 0; i < imgs.length; i++) {
        (function(){
            var this_i = i;     // 保存当前i的值
            addEvent(navs[this_i], "click", function () {
                banner(this_i);
            });
        })();
    }   
    /* 添加鼠标移入移出事件 */
    addEvent(slider, "mouseover", function () {
        clearInterval(timer);
    });
    addEvent(slider, "mouseout", autoPlay);
})();


/**
 * 模块：获取课程列表
 * 说明：获取课程列表的请求由tab栏、分页器、视口宽度三方面决定
 */
(function() {
    var pageNo = 1,         // 当前页码
        psize = (clientWidth >= 1205) ? 20 : 15,    // 根据视口宽度确定课程数
        type = 10;          // 课程类型

    var ul = document.getElementById('courseslist');
    var url = '//study.163.com/webDev/couresByCategory.htm';
    /* 先获取初始课程列表 */
    get(url+'?pageNo='+pageNo+'&psize='+psize+'&type='+type, addItems);
    /**
     * ajax回调函数
     * 功能：创建并添加课程节点
     *       注册悬停出现浮层的事件
     * @param {[String]} response 返回的响应文本
     */
    function addItems(response) {
        var itemsArr = JSON.parse(response),    // JSON --> 对象
            list = itemsArr.list,               // 课程数组
            htmlStr = '';
        /* 构建节点（htmlStr） */
        for(var i = 0; i < list.length; i++){
            /* 处理免费 */
            if(list[i].price == '0'){
                list[i].price = '免费';
            }
            htmlStr += '<li class="f-fl">\
                            <a href="#">\
                                <div class="course">\
                                    <img src="'+list[i].bigPhotoUrl+'" alt="'+list[i].name+'">\
                                    <div class="info">\
                                        <h3>'+list[i].name+'</h3>\
                                        <span class="provider">'+list[i].provider+'</span>\
                                        <div class="f-cb"><span class="learner f-fl"><i></i>'+list[i].learnerCount+'</span></div>\
                                        <span class="price">￥'+list[i].price+'</span>\
                                    </div>\
                                </div>\
                                <div class="detail">\
                                    <div class="main f-cb">\
                                        <img src="'+list[i].bigPhotoUrl+'" alt="'+list[i].name+'" class="f-fl">\
                                        <div class="info">\
                                            <h3>'+list[i].name+'</h3>\
                                            <span class="learner"><i></i>'+list[i].learnerCount+'人在学</span>\
                                            <span class="provider">发布者：'+list[i].provider+'</span>\
                                            <span class="category">分类：'+list[i].categoryName+'</span>\
                                        </div>\
                                    </div>\
                                    <div class="description">\
                                        <p>'+list[i].description+'</p>\
                                    </div>\
                                </div>\
                            </a>\
                        </li>';
        }
        /* 添加节点 */
        ul.innerHTML = htmlStr;
        /* 获取添加的课程节点 */
        var lis = ul.getElementsByTagName('li');
        var timer = null;
        /* 注册悬停事件 */
        for(var i = 0; i < lis.length; i++){
            (function(){
                var _i = i;     // 保存当前i
                var detail = getElementsByClassName(lis[_i], 'detail')[0],
                    course = getElementsByClassName(lis[_i], 'course')[0];
                /* 鼠标移入时，过500ms显示详细图层 */
                addEvent(lis[_i], 'mouseenter', function(event){
                    timer = setTimeout(function(){
                        addClassName(detail, 'z-show');
                    }, 500);
                });
                /* 移出时，图层消失；如果图层本来还没出现，取消定时器 */
                addEvent(lis[_i], 'mouseleave', function(){
                    removeClassName(detail, 'z-show')
                    clearTimeout(timer);
                });
            })();
        }
    }
    /**
     * 课程列表请求函数
     * @param  {Object} searchObj 对象形式的查询参数
     */
    function getCourses(searchObj) {
        var _url = url + '?' + serialize(searchObj);
        get(_url, addItems);
    }
    /* 获取相关节点 */
    var tabDiv = document.getElementById('tab'),
        tabs = tabDiv.getElementsByTagName('li');
    var page = document.getElementById('page'),
        prev = getElementsByClassName(page, 'prev')[0],
        next = getElementsByClassName(page, 'next')[0],
        navs = page.getElementsByTagName('a');
/**
 * 子模块：Tab切换
 * 说明：切换Tab时，获取当前Tab首页的课程列表，并重置分页器状态
 *       我对Tab模块进行了扩展，即使今后Tab项超过2项，代码也可重复使用
 */
    (function() {
        /* 获取节点对应的类型 */
        function getType(element) {
            switch(element) {
                case tabs[0]: return 10;
                case tabs[1]: return 20;
            }
        }
        /**
         * 事件处理函数，点击Tab项时触发
         * 功能：请求对应Tab类型的首页课程列表，并进行样式切换
         */
        function selectTab(event) {
            event = getEvent(event);
            /* 获取事件处理对象 */
            var target = getTarget(event);
            /* 清除所有tab的选中状态，并注册click事件 */
            for(var j = 0; j < tabs.length; j++){
                (function(){
                    var _j = j;
                    removeClassName(tabs[_j], 'z-checked');
                    tabs[_j].onclick = selectTab;
                })();
            }
            /* 添加点击的tab的选中样式，清楚该项的click事件 */
            addClassName(target, 'z-checked');
            target.onclick = null;
            /* 获取并更新type */
            type = getType(target);
            /* 请求课程列表 */
            getCourses({pageNo: 1, psize: psize, type: type});
            /* 重置分页器 */
            for(var i = 1; i < navs.length-1; i++){
                removeClassName(navs[i], 'z-selected');
            }
            addClassName(navs[1], 'z-selected');
            addClassName(prev, 'z-disable');
            removeClassName(next, 'z-disable');
            pageNo = 1;
        }
        /* 除第一个tab外，添加click事件 */
        for(var k = 1; k < tabs.length; k++){
            tabs[k].onclick = selectTab;
        }
    })();
/**
 * 子模块：分页器
 * 说明：点击页数或上一页、下一页时，获取对应的课程列表
 */
    (function() {
        /* 设置分页器样式 */
        function setSelected(element) {
            for(var j = 1; j < navs.length-1; j++){
                removeClassName(navs[j], 'z-selected');
            }
            addClassName(element, 'z-selected');
            if(element.innerText == 1){
                addClassName(prev, 'z-disable');
            }else{
                removeClassName(prev, 'z-disable');
            }
            if(element.innerText == 8){
                addClassName(next, 'z-disable');
            }else{
                removeClassName(next, 'z-disable');
            }
        }
        /* 对页数按钮添加click事件 */
        for(var i = 1; i < navs.length-1; i++){
            (function(){
                var _i = i;
                addEvent(navs[_i], 'click',function(event){
                    event = getEvent(event);
                    setSelected(navs[_i]);          // 更新样式
                    pageNo = navs[_i].innerText;    // 更新pageNo
                    getCourses({pageNo: pageNo, psize: psize, type: type}); // 发送请求
                    preventDefault(event);
                });
            })();
        }
        /* 对上一页和下一页按钮添加click事件 */
        addEvent(prev, 'click', function(event){
            event = getEvent(event);
            if(pageNo > 1){     // 首页点击无效
                pageNo--;
                setSelected(navs[pageNo]);
                getCourses({pageNo: pageNo, psize: psize, type: type});
            }
            preventDefault(event);
        });
        addEvent(next, 'click', function(event){
            event = getEvent(event);
            if(pageNo < 8){     // 尾页点击无效
                pageNo++;
                setSelected(navs[pageNo]);
                getCourses({pageNo: pageNo, psize: psize, type: type});
            }
            preventDefault(event);
        });
    })();
/**
 * 子模块：根据宽窄屏切换，重新请求
 */
    (function() {
        addEvent(window, 'resize', function(){
            var newClientWidth = getClientWidth();
            /* 只有切换宽窄屏时，才会更新psize并重新请求 */
            if(newClientWidth < 1205 && psize == 20){
                psize = 15;
                getCourses({pageNo: pageNo, psize: 15, type: type});
            }else if (newClientWidth >= 1205 && psize == 15){
                psize = 20;
                getCourses({pageNo: pageNo, psize: 20, type: type});
            }
        });
    })();
})();

/**
 * 模块：右侧热门推荐
 * 说明：根据ajax取得的数据构建节点，并实现5秒更新的效果
 */
(function () {
    var list = document.getElementById('hotlist'),
        url = '//study.163.com/webDev/hotcouresByCategory.htm',
        htmlStr = '';
    /**
     * 回调函数，请求成功时执行
     * 功能：创建并添加节点
     * @param {String} response 响应文本
     */
    var addItems = function(response) {
        var itemsArr = JSON.parse(response);    // 将JSON转换为对象
        for(var i = 0; i < itemsArr.length; i++) {
            htmlStr += '<li>\
                            <img src="' +itemsArr[i].smallPhotoUrl+ '" alt="' +itemsArr[i].name+ '">\
                            <div class="info">\
                                <h3>' +itemsArr[i].name+ '</h3>\
                                <span class="num"><i></i>' +itemsArr[i].learnerCount+ '</span>\
                            </div>\
                        </li>'
        }
        list.innerHTML = htmlStr;
        /* 每5秒更新，其实节点都已经获取，只是overflow隐藏了，通过节点操作实现更新 */
        var scrollCourses = setInterval(function(){
            list.appendChild(getFirstElementChild(list));
        }, 5000);
    };
    /* 发送ajax请求 */
    get(url, addItems);
})();

/**
 * 模块：机构介绍视频
 * 说明：点击图片实现视频弹窗
 *       点击关闭按钮，暂停视频并关闭弹窗
 */
(function () {
    var poster = document.getElementById('videoposter'),
        layout = getElementsByClassName(document, 'g-video')[0],
        video = layout.getElementsByTagName('video')[0],
        close = getElementsByClassName(layout, 'close')[0];
    /* 点击 --> 弹窗 */
    addEvent(poster, 'click', function(){
        addClassName(layout, 'z-show');
    });
    /* 点击 --> 关闭 */
    addEvent(close, 'click', function(){
        removeClassName(layout, 'z-show');
        video.pause();      // 暂停播放
    })
})();