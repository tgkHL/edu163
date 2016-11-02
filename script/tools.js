// ------------------------ 节点操作的工具函数 -----------------------
/**
 * firstElementChild的兼容实现
 * @param  {object} element DOM节点
 * @return {object}         第一个元素子节点
 */
function getFirstElementChild(element) {
    if(element.firstElementChild){
        return element.firstElementChild;
    } else {
        var node = element.firstChild;
        while(node.nodeType != 1){
            node = node.nextSibling;
        }
        return node;
    }
}

/**
 * getElementsByClassName的兼容实现
 * @param  {object} element DOM节点
 * @param  {string} names   类名字符串
 * @return {object}         具有相应类名的元素列表
 */
function getElementsByClassName(element, names) {
    if (element.getElementsByClassName) {       // 特性侦测，优先使用原生
        return element.getElementsByClassName(names);
    } else {
        var elements = element.getElementsByTagName('*');
        var result = [];
        var element,
            classNameStr,
            flag;
        names = names.split(' ');
        for (var i = 0; element = elements[i]; i++) {
            classNameStr = ' ' + element.className + ' ';
            flag = true;
            for (var j = 0, name; name = names[j]; j++) {
                if (classNameStr.indexOf(' ' + name + ' ') == -1) {
                    flag = false;
                    break;
                }
            }
            if (flag) {
                result.push(element);
            }
        }
        return result;
    }
}

/**
 * 给元素添加类名
 * @param {object} element DOM元素
 * @param {string} names   类名
 */
function addClassName(element, names) {
    element.className += ' '+names;
}

/**
 * 移除类名
 * @param  {object} element DOM元素
 * @param  {string} names   要移除的类
 * @return {[type]}         [description]
 */
function removeClassName(element, names) {
    var classNameStr = ' ' + element.className + ' ';
    names = names.split(' ');
    for (var i = 0, name; name = names[i]; i++) {
        var index = classNameStr.indexOf(' '+name+' ');
        while(index != -1){         // 循环是为了保证有重复的类也能移除
            classNameStr = classNameStr.replace(' '+name+' ', ' ');
            index = classNameStr.indexOf(' '+name+' ');
        }
    }
    element.className = classNameStr.slice(1, -1);
}

/**
 * innerText的兼容实现
 */
if(!('innerText' in document.body)) {
    HTMLElement.prototype.__defineGetter__("innerText", function(){
        return this.textContent;
    });
    HTMLElement.prototype.__defineSetter__("innerText", function(s){
        return this.textContent = s;
    });
}

// ----------------------- 事件相关的工具函数 -----------------------------
/**
 * 注册事件的兼容实现
 * @param {object} element DOM元素
 * @param {string} type    事件名
 * @param {function} handler 事件处理函数
 */
function addEvent(element, type, handler){
    if (element.addEventListener){
        element.addEventListener(type, handler, false);
    }else{
        element.attachEvent('on'+type, handler);
    }
}

/**
 * 移除事件的兼容实现
 * @param  {object} element DOM元素
 * @param  {string} type    事件名
 * @param  {function} handler 事件处理函数
 */
function removeEvent(element, type, handler){
    if(element.removeEventListener){
        element.removeEventListener(type, handler, false);
    }else{
        element.detachEvent('on'+type, handler);
    }
}

/**
 * 获取事件对象的兼容实现
 * @param  {[type]} event [description]
 * @return {object}       事件对象
 */
function getEvent(event) {
    return event||window.event;
}

/**
 * 获取事件目标的兼容实现
 * @param  {[type]} event [description]
 * @return {object}       事件的目标元素
 */
function getTarget(event) {
    return event.target || event.srcElement;
}

/**
 * 取消事件默认行为的兼容实现
 */
function preventDefault(event){
    if(event.preventDefault){
        event.preventDefault();
    }else{
        event.returnValue = false;
    }
}

// -------------------- cookie相关的工具函数 ---------------------
/**
 * 获取cookie对象
 * @return {object} 对象形式的cookie
 */
function getCookies () {
    var cookie = {};
    var all = document.cookie;
    if (all === '')
        return cookie;
    var list = all.split('; ');
    for (var i = 0; i < list.length; i++) {
        var item = list[i];
        var p = item.indexOf('=');
        var name = item.substring(0, p);
        name = decodeURIComponent(name);
        var value = item.substring(p + 1);
        value = decodeURIComponent(value);
        cookie[name] = value;   // 添加名值对
    }
    return cookie;
}

/**
 * 设置cookie
 * @param {string} name    cookie名
 * @param {[type]} value   cookie值
 * @param {Date} expires 时间戳
 * @param {[type]} path    路径
 * @param {[type]} domain  作用域
 * @param {[type]} secure  安全
 */
function setCookie (name, value, expires, path, domain, secure) {
    var cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);
    if (expires)
        cookie += '; expires=' + expires.toGMTString();
    if (path)
        cookie += '; path=' + path;
    if (domain)
        cookie += '; domain=' + domain;
    if (secure)
        cookie += '; secure=' + secure;
    document.cookie = cookie;
}

/**
 * 设置时间戳
 * @param {number} days 天数
 * @return {object} 相应天数后的Date对象
 */
function setExpires(days) {
    var date = new Date();
    date.setDate(date.getDate()+days)
    return date;
}

/**
 * 删除cookie
 * @param  {string} name   cookie名
 * @param  {[type]} path   路径
 * @param  {[type]} domain 作用域
 * @return {[type]}        [description]
 */
function removeCookie (name, path, domain) {
    document.cookie = name + '='
    + '; path=' + path
    + '; domain=' + domain
    + '; max-age=0';
}

// ---------------------------- ajax相关的工具函数-----------------------
/**
 * 创建ajax请求对象的兼容实现
 * @return {object} ajax请求对象
 */
function createRequest() {
    try {
        request = new XMLHttpRequest();
    } catch (tryMS) {
        try {
            request = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (otherMS) {
            try {
                request = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (failed) {
                request = null;
            }
        }
    } 
  return request;
}

/**
 * 封装GET方法
 * @param  {string}   url      url
 * @param  {Function} callback 回调函数
 */
function get(url, callback){
    var xhr = createRequest();
    xhr.onreadystatechange = function () {
        if(xhr.readyState == 4) {
            if((xhr.status >= 200 && xhr.status <300) || xhr.status == 304) {
                callback(xhr.responseText);     // 请求成功，调用回调函数
            } else {
                console.log('Request was unsuccessful: ' + xhr.status);
            }
        }
    };
    xhr.open('get', url, true);
    xhr.send(null);
}

/**
 * 查询参数序列化
 * @param  {object} data 对象形式的查询参数
 * @return {string}      序列化查询参数
 */
function serialize(data){
    if (!data) {return '';}
    var pairs = [];
    for (var name in data) {
        if (!data.hasOwnProperty(name)) {continue;}
        if (typeof data[name] === 'function') {
            continue;
        }
        var value = data[name].toString();
        name = encodeURIComponent(name);
        value = encodeURIComponent(value);
        pairs.push(name + '=' + value);
    }
    return pairs.join('&');
}

// -------------------- 其他工具函数 --------------------
/**
 * 设置元素透明度
 * @param {object} element DOM元素
 * @param {number} value   opacity值
 */
function setOpacity(element, value){
    element.style.opacity = value;
    element.style.filter = 'alpha(opacity=' + value*100 + ')';
}

/**
 * 获得页面可视区域宽度
 * @return {number} 视口宽度
 */
function getClientWidth() {
    // console.log(document.documentElement.clientWidth);
    return document.documentElement.clientWidth;
}