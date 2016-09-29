var $ = function(id) {
    return document.getElementById(id);
};

/**
 * UTILS
 */

$.require = function(libs, callback) {
    var scripts = [],
        inQueue = libs.length;
    
    
    for(i = 0; i < inQueue; i++)
    {
        scripts[i] = document.getElementsByTagName("HEAD")[0].appendChild(document.createElement('SCRIPT'));   
        scripts[i].onload = function()
        {
            inQueue--;
            
            if(0 === inQueue)
                callback();
        };
        
        scripts[i].src = libs[i] + '.js';
    }
};

$.extend = function(Child, Parent) {
    var F = function() {};
    F.prototype = Parent.prototype;
    
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.superclass = Parent.prototype;
    
    return Child;
};

$.merge = function() {
    var merged = {}, key;
    
    for(var i = 0; i < arguments.length; i++)
    {
        for(key in arguments[i])
        {
            merged[key] = arguments[i][key];
        }
    }
    
    return merged;
};

$.proxy = function(fn, context) {
    return function()
    {
        return fn.apply(context, arguments);
    };
};

$.serialize = function(object, stack) {
    var pairs = [], i, stackedKey;
    
    if(!stack) stack = '';
    
    for(var key in object) {
        stackedKey = stack ? stack + '[' + key + ']' : key;
        
        if(typeof object[key] != 'object') {
            pairs.push(stackedKey + '=' + object[key]);
        } else if(object[key] instanceof Array) {
            for(i = 0; i < object[key].length; i++)
            {
                pairs.push(stackedKey + '[]=' + object[key][i]);
            }
        } else if(object[key] == null) {
            pairs.push(stackedKey + '=');
        } else {
            pairs.push($.serialize(object[key], stackedKey));
        }
    }
    
    return pairs.join('&');
};

/**
 * element attribs
 */
$.hasClass = function(elem, className) {
    return -1 != elem.className.split(' ').indexOf(className);
};

$.addClass = function(elem, className) {
    var classes = elem.className.split(' ');
    if(-1 != classes.indexOf(className))
        return;
    
    classes.push(className);
    
    elem.className = classes.join(' ');
};

$.removeClass = function(elem, className) {
    var classes = elem.className.split(' ');
    
    classes.splice(classes.indexOf(className), 1);
    elem.className = classes.join(' ');
};

/**
 * AJAX
 */
$.ajax = function(settings) {
    
    if(!('url' in settings))
        throw Error('Url not specified');
    
    // prepare config
    settings = $.merge({
        success: function() {},
        context: window,
        type: 'GET',
        data: null,
        dataType: 'html'
    }, settings);
    
    var xhr = new XMLHttpRequest();
    
    // configure callback with result handler
    xhr.onreadystatechange = function()
    {
        if(xhr.readyState != 4 || xhr.status != 200)
            return;
        
        var response;
        
        switch(settings.dataType)
        {
            default:
            case 'html':
                response = xhr.responseText;
                break;
                
            case 'json':
                response = xhr.responseText
                    ? eval('(' + xhr.responseText + ')')
                    : {};
                    
                break;
        }
        
        settings.success && settings.success.call(settings.context, response);
    };
    
    
    // send request
    if(settings.type == 'POST')
    {
        xhr.open(settings.type, settings.url);
        
        var data = null;
        
        if(settings.data)
        {
            data = $.serialize(settings.data);
            
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        }
        
        xhr.send(data);
    }
    else
    {
        if(settings.data)
             settings.url += '?' + $.serialize(settings.data);
            
        xhr.open(settings.type, settings.url);
        xhr.send();
    }
    
    return xhr;
    
};

$.get = function(url, data, callback, type) {    
    return $.ajax({
        type: 'GET',
        url: url,
        data: data,
        success: callback,
        dataType: type
    });
};

$.post = function(url, data, callback, type) {    
    return $.ajax({
        type: 'POST',
        url: url,
        data: data,
        success: callback,
        dataType: type
    });
};

$.put = function(url, data, callback, type) {    
    return $.ajax({
        type: 'PUT',
        url: url,
        data: data,
        success: callback,
        dataType: type
    });
};

$.del = function(url, data, callback, type) {    
    return $.ajax({
        type: 'DELETE',
        url: url,
        data: data,
        success: callback,
        dataType: type
    });
};


$.jsonp = function(url, data, callback, context) {    
    if(typeof context == 'undefined' || !context)
        context = window;
    
    // cheate jsonp callback
    jsonpCallbackName = 'c' + (new Date()).getTime();
    window[ jsonpCallbackName ] = function(response)
    {
        callback.call(context, response);
        
        // clear
        document.body.removeChild(script);
        delete window[ jsonpCallbackName ];
    };
    
    // load script and execute jsonp callback
    var script = document.createElement('SCRIPT');
    document.body.appendChild(script);
    
    url = (-1 == url.indexOf('?'))
        ? url + '?callback=' + jsonpCallbackName
        : url + '&callback=' + jsonpCallbackName;
        
    // add data
    if(data)
        url += '&' + $.serialize(data);
    
    script.src = url;
};
