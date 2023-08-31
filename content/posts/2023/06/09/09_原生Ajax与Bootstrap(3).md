---
title: 原生Ajax与Bootstrap
Date: 2023-08-31
Categories:
- Java
tags:
- Ajax
- Bootstrap
---

# 原生Ajax与Bootstrap

### 一、原生Ajax应用

> Ajax：异步的JS与XML的组合；用途，应用场景等方面，和昨天的jquery的Ajax一致
>
> 写法上的区别：
>
> 原生Ajax需要在JS中使用XML的请求对象发请求到服务器

#### 从服务器取数据

```html
<!-- 客户端： -->
<div id="myDiv"><h2>使用 AJAX 修改该文本内容</h2></div>
<button type="button" onclick="loadXMLDoc()">修改内容</button>

<script type="text/javascript">
    function loadXMLDoc(){
        //原生Ajax操作：
        var xmlHttp = new XMLHttpRequest(); //实例化xml的请求对象
        //xml请求对象发请求：参数1：请求类型   参数2：路径  参数3：异步true 同步false
        xmlHttp.open("get","load.jsp",true); //数据填充
        xmlHttp.send(); //发送请求

        //回调函数
        xmlHttp.onreadystatechange=function(){
            //readyState=4:服务器已处理完数据，响应已就绪  响应状态为200表示成功的响应
            if(xmlHttp.readyState==4&&xmlHttp.status==200){
                //responseText：获取服务器中返回的文本内容
                document.getElementById("myDiv").innerHTML=xmlHttp.responseText;
            }
        }
    }
</script>
```

```java
//服务器：
<%
	response.getWriter().write("返回数据到客户端~~");
%> 
```

#### 传参到服务器

```html
<!-- 客户端： -->
<div id="myDiv"><h2>使用 AJAX 修改该文本内容</h2></div>
<button type="button" onclick="loadXMLDoc()">修改内容</button>

<script type="text/javascript">
    function loadXMLDoc(){
        //原生Ajax操作：
        var xmlHttp = new XMLHttpRequest(); //实例化xml的请求对象
        //xml请求对象发请求：参数1：请求类型   参数2：路径  参数3：异步true 同步false
        //传参格式：?name=value&name2=value2
        xmlHttp.open("get","load2.jsp?name=zs&age=30",true); //数据填充
        xmlHttp.send(); //发送请求

        //回调函数
        xmlHttp.onreadystatechange=function(){
            //readyState=4:服务器已处理完数据，响应已就绪  响应状态为200表示成功的响应
            if(xmlHttp.readyState==4&&xmlHttp.status==200){
                //responseText：获取服务器中返回的文本内容
                document.getElementById("myDiv").innerHTML=xmlHttp.responseText;
            }
        }
    }
</script>
```

```java
//服务器：
<%
	String name = request.getParameter("name");
	String age  = request.getParameter("age");
	response.getWriter().write("返回数据-name="+name+";age="+age);
%>    
```

### 二、Ajax细节

#### get清除缓存

> 缓存在Java中很重要，且有很多种缓存，例如，浏览器有缓存，服务器有缓存，数据库也有缓存; 每个地方的缓存所代表的含义都是类似的，都是提高查询效率； 但有些场景需要清除缓存，例如，获取验证码，如果有缓存，则每次发同样链接，返回同样的验证码；则有安全隐患，这种场景需要清除缓存。

```js
//原生Ajax操作：
var xmlHttp = new XMLHttpRequest(); //实例化xml的请求对象
//date=日期；每毫秒值都不同，意味着每次发的请求都是不同的，意味着每
//次都会取服务器获取新的新资源;相当于清除了缓存
xmlHttp.open("get","load.jsp?date="+new Date(),true); //数据填充
xmlHttp.send(); //发送请求
```

#### post异步请求

```js
//post请求：post不带参数，和get不带参一样
//xmlHttp.open("post","load.jsp",true);
//xmlHttp.send();

//post带参数: 需要在send中传参数，且需要设置请求头
xmlHttp.open("post","load2.jsp",true);
//由于post传参数，可以传文本和二进制数据(上传图片)；所以需要指定请求头类型
xmlHttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
xmlHttp.send("name=zsf&age=99");
```

#### 响应状态码

> 描述：当客户端发送请求后，服务器是否接收，或响应是否成功都会给客户端一个响应状态，最典型的是200或404；200表示成功状态，404则是未找到服务器；以下需要记住的状态码：

> 200：服务器能够接收客户端请求，且服务器处理无异常，响应回来的成功的状态码
>
> 302：重定向；也就是客户端访问服务器后；服务器中指定客户端再发一次请求到另一个页面或服务器
>
> 404：客户端未发现服务器路径；往往是路径写错了
>
> 500：客户端找到了服务器，但是服务器中代码出现异常了

#### 回调XML数据

> 回调xml数据，意味着，可以将xml文件当成服务器数据；获取这些xml数据后，只需要解析出来想要的数据即可。

```js
var xmlHttp = new XMLHttpRequest(); //实例化xml的请求对象
xmlHttp.open("get","student.xml",true); //数据填充
xmlHttp.send(); //发送请求

xmlHttp.onreadystatechange=function(){
    if(xmlHttp.readyState==4&&xmlHttp.status==200){
        var doc = xmlHttp.responseXML; //获取文档对象，类似js的DOM(不常用)
        //从xml文档对象中获取name的标签
        var names = doc.getElementsByTagName("name");
        var txt = "";
        //标签有多个，所以需要循环
        for(var i=0;i<names.length;i++){
            //names[i]取到下标个数的指定标签  
            //childNodes[0]：拿到第0个子节点；nodeValue取出值-张三丰或张无忌
            txt=txt + names[i].childNodes[0].nodeValue + "<br>";
        }
        document.getElementById("myDiv").innerHTML=txt;
    }
}
```

```xml
<!--student.xml-->
<students>  <!-- xml格式类似html，都有根标签，里面包含多个子标签及属性 -->
	<student>
		<name>张三丰</name>  <!-- ajax访问后，目的是解析基本值 -->
		<age>99</age>
	</student>
	<student>
		<name>张无忌</name>
		<age>22</age>
	</student>
</students>
```

### 三、校验插件

#### 概述

> validate校验插件，主要用于表单中提交时，做的提示校验规则；也就是不满足规则条件时，会给我们提供规则提示，意味着不能提交了，直到满足了规则条件才能提交。

#### 特点

> 引入插件后，校验规则会给我们做一些统一的内置提示
>
> 同时，我们也可以自己来指定规则提示，体现了校验插件的灵活性

#### 应用

> 先导校验包，且需要引入jquery.js，因为插件中需要使用到；且需要放到最前面；还需要导入中文识别包

```html
<!-- 引入包：jquery放前面 -->
<script type="text/javascript" src="../js/jquery-1.11.js" ></script>
<script type="text/javascript" src="../js/validate.min.js" ></script>
<script type="text/javascript" src="../js/messages_zh.js" ></script>
<script>
    $(function(){
        $("form").validate({  //校验规则，往往用在表单中
            rules:{ //写规则
                //里面的key对应这HTML标签中的name的属性
                username:"required",
                password:{required:true,digits:true},
                repassword:{equalTo:"[name='password']"},
                zxz:{min:3,required:true},
                shuzhiqujian:{range:[5,10],required:true}
            },messages:{  //提示信息
                username:"用户名不能为空",
                password:{required:"密码不能为空",digits:"太笨了，写数字啊"},
                repassword:{equalTo:"密码和确认密码不一致"},
                zxz:{min:"最小值为{0}"},
                shuzhiqujian:{range:"数值范围为：{0}-{1}"}
            }
        })
    })
</script>
<form>
    用户名：<input type="text" name="username"  /><br />
    密码:<input type="text" name="password" /><br />
    确认密码：<input type="text" name="repassword" /><br />
    最小值：<input type="number" name="zxz" /><br />
    数值区间:<input type="number" name="shuzhiqujian" /><br />
    <input type="submit" value="提交" />
</form>
```

### 四、Bootstrap应用

> 概述：Bootstrap集成了前端的CSS，JS的前端框架，通过CSS的class属性的引入，可以使标签控件效果更美化（关键）；通过JS可以生成控件的触发效果（不常用）
>
> 特点：可以完成响应式布局效果
>
> 响应式布局： 根据屏幕尺寸，自适应不同的平台和设备中

#### 栅格系统

> 把页面的行，分为了12等分，根据不同的尺寸，适配不同的设备   例如：col-lg-2  大屏幕     col-md-3 中屏幕

```html
<!-- 导入依赖包 -->
<script type="text/javascript" src="../js/jquery-1.11.js" ></script>
<script type="text/javascript" src="../js/bootstrap.min.js" ></script>
<link rel="stylesheet" type="text/css" href="../css/bootstrap.min.css"/>

<style>
    .a{background-color: red;}
    .b{background-color: green;}
    .c{background-color: blue;}
    .d{background-color: yellow;}
    .e{background-color: gray;}
</style>
<!-- container-fluid:占满屏幕（默认）  container：两边有间隔   -->
<div class="container">
    <div class="row">  <!-- 屏幕放大则显示md的尺寸  屏幕变小，则显示xs的尺寸 -->
        <div class="col-xs-12 col-md-8 a">.col-xs-12 .col-md-8</div>
        <div class="col-xs-6 col-md-4 b">.col-xs-6 .col-md-4</div>
    </div>
    <div class="row">
        <div class="col-xs-6 col-md-4 c">.col-xs-6 .col-md-4</div>
        <div class="col-xs-6 col-md-4 d">.col-xs-6 .col-md-4</div>
        <div class="col-xs-6 col-md-4 e">.col-xs-6 .col-md-4</div>
    </div>
    <div class="row">
        <div class="col-xs-6">.col-xs-6</div>
        <div class="col-xs-6">.col-xs-6</div>
    </div>
</div>
```

#### 排版

```html
<h1>我是h1</h1>我是跟随者
<!-- 要写成行内快-->
<span class="h1">我是h1</span>我是跟随者

<p class="text-left">Left aligned text.</p>
<p class="text-center">Center aligned text.</p>
<p class="text-right">Right aligned text.</p>
<!--不要让内容自动换行-->
<p class="text-nowrap">No wrap text.</p>   
<!-- 转大写 -->
<p class="text-uppercase">Uppercased text.</p>
```

#### 表格

```html
<div class="container">
    <!-- table效果  table-striped；隔行换色  table-hover悬停 -->
    <table class="table table-striped table-hover">
        <tr>
            <th>姓名</th>
            <th>年龄</th>
            <th>性别</th>
            <th>操作</th>
        </tr>
        <tr>
            <td>张三丰</td>
            <td class="active">99</td>
            <td>男</td>
            <td><a href="#">删除</a></td>
        </tr>
        <tr>
            <td>周伯通</td>
            <td>89</td>
            <td>男</td>
            <td><a href="#">删除</a></td>
        </tr>
        <tr>
            <td class="info">郭靖</td>
            <td>56</td>
            <td>男</td>
            <td><a href="#">删除</a></td>
        </tr>
        <!-- class="danger" 该记录危险效果 -->
        <tr class="danger">
            <td>小龙女</td>
            <td>35</td>
            <td>女</td>
            <td><a href="#">删除</a></td>
        </tr>
    </table>
</div>
```

### 五、表单

> 提交表单加一些class效果，排版结构更好

#### 普通表单

```html
<form>
    <!-- form-group:说明里面的子控件是上下结构排列
         form-control：当前控件独占一整行 
    -->
    <div class="form-group">
        <label >Email address</label>
        <input type="email" class="form-control" placeholder="Email">
    </div>
    <div class="form-group">
        <label for="exampleInputPassword1">Password</label>
        <input type="password" class="form-control" id="exampleInputPassword1" placeholder="Password">
    </div>
    <div class="form-group">
        <label for="exampleInputFile">File input</label>
        <input type="file" id="exampleInputFile">
        <p class="help-block">Example block-level help text here.</p>
    </div>
    <div class="checkbox">
        <label><input type="checkbox"> Check me out</label>
    </div>
    <button type="submit" class="btn btn-danger">Submit</button>
</form>
```

#### 内联表单

```html
<form class="form-inline"> <!-- 内联表单：表示在一行里面显示表单子控件 -->
    <div class="form-group"> <!-- 里面的子控件的class都失效了，没有上下排列的结构 --> 
        <label>Name</label>
        <input type="text" class="form-control"  placeholder="Jane Doe">
    </div>
    <div class="form-group">
        <label for="exampleInputEmail2">Email</label>
        <input type="email" class="form-control" id="exampleInputEmail2" placeholder="jane.doe@example.com">
    </div>
    <button type="submit" class="btn btn-default">Send invitation</button>
</form>
```

#### 水平表单

```html
<form class="form-horizontal"> <!-- 水平表单 -->
    <div class="form-group"> <!-- 设置了水平表单后，form-group控件会转换为一行里面的显示，类似与.row的效果 -->
        <label for="inputEmail3" class="col-sm-2 control-label">Email</label>
        <div class="col-sm-10">
            <input type="email" class="form-control" id="inputEmail3" placeholder="Email">
        </div>
    </div>
    <div class="form-group">
        <label for="inputPassword3" class="col-sm-2 control-label">Password</label>
        <div class="col-sm-10">
            <input type="password" class="form-control" id="inputPassword3" placeholder="Password">
        </div>
    </div>
    <div class="form-group">
        <!-- 偏移了2等份，复选框占10等分 -->
        <div class="col-sm-offset-2 col-sm-10">
            <div class="checkbox">
                <label>
                    <input type="checkbox"> Remember me
                </label>
            </div>
        </div>
    </div>
    <div class="form-group">
        <div class="col-sm-offset-2 col-sm-10">
            <button type="submit" class="btn btn-default">Sign in</button>
        </div>
    </div>
</form>
```

### 六、总结与作业

#### 总结

```
1.原生Ajax应用(重点)
从服务器中获取数据、 传参到服务器并获取服务器数据
关键是将原生ajax的操作步骤写熟练
2.ajax细节
get清除缓存： 参数+日期
post异步请求：在send中传参数，且加入请求头（重点）
响应状态码：200，302，404，500（重点）
回调xml数据；从xml中获取数据，并解析xml的标签内容
3.校验插件
概述-表单中校验规则、特点-内置规则提示，也可以自定义
应用：编写表单标签，应用校验插件
4.bootstrap应用
概述-集成css，js的框架集； 响应式布局
栅格系统，排版，表格
5.表单（重点）
普通表单：form-group,form-control的用法
内标表单：在一行中显示子控件
水平表单：每组控件，在一行中显示； 结合栅格系统使用
```

#### 作业

```
1. 将课堂案例中的注册功能，使用原生ajax完成
2. 文本框中输入内容，点击按钮，任选一种ajax异步请求，发送数据，并从jsp中返回该数据到下拉列表中
```

