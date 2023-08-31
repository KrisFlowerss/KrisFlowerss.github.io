---
title: JQurey的Ajax
Date: 2023-08-30
Categories:
- Java
tags:
- JQuery
---



# JQuery的Ajax

### 一、Ajax概述

#### 概述

> Ajax： 异步的JS和XML的组合；也就是需要在JS中发异步请求到服务器(XML操作被JQuery封装)
>
> 异步：多线程的执行；客户端与服务器可以同时执行
>
> 用途：可用于页面的局部刷新；在不需要刷新整个页面的情况下，可使用ajax
>
> 应用场景：注册功能、购物车、地图搜索

#### 应用流程

> 客户端在JS中发异步请求url到服务器；服务器可进行处理，处理完成后，将数据回调给客户端（局部刷新）；同时客户端发完请求后，也可以继续处理前端的代码的执行；构成了异步操作

### 二、Ajax应用

> ajax的应用，可以分为两个部分：1.从服务器中获取数据    2.客户端传参数，再从服务器取数据
>
> 具体的ajax的异步功能有三种方式：$.get(..)、 $.post(..)、 $.ajax(..)
>
> get和post用于处理较为简单的异步请求；ajax方法用于处理功能更为强大的异步处理
>
> get和post基本操作类似；只不过get异步是通过url方式传参数，效率高，不安全；post异步通过请求体方式传参数，效率低，但安全

#### 获取服务器数据

> 由于ajax需要前后端的操作，所以需使用eclipse来完成；服务器使用tomcat

> eclipse服务器配置：
>
> 新建web项目：File->new->Other..->动态web； 编码项目名和导入web服务器tomcat
>
> src目录：存储java代码
>
> webContent：存前端资源：html，css，js，图片；
>
> 说明：由于还没有学习Servlet服务器资源，所以此处使用jsp来替代服务器资源；jsp即可写前端，也可写后端，在长期项目实践中，往往归为前面，所以也是放到WebContent目录

```html
<!--客户端：-->
<!-- 案例：从服务器中获取数据，到前端展示；使用局部刷新 -->
<input type="button" value="加载数据" /><br/>
<div>...</div>

<script type="text/javascript" src="js/jquery-1.11.min.js"></script>
<script type="text/javascript">
    $("input").click(function(){
        //get异步请求  参数1：url路径  参数2：函数回调
        $.get("load.jsp",function(data){
            $("div").html(data); //服务器回调数据后，进行局部刷新
        })

        //js可以继续异步执行操作，只是此处没代码
    }) 
</script>
```

```java
//服务器：
<%
	//此处用于编写java代码
	//response-相应的内置对象   相应回客户端
	response.getWriter().write("服务器返回的数据~");
%>   
```

#### 客户端传参数

> 案例：做一个注册提示功能；输入用户名后，失去焦点，发异步请求到服务器，服务器根据用户名进行判断，如果为zs，则返回已注册；否则，返回恭喜可用
>
> 分析：使用ajax异步请求，且需要传参数到服务器，再服务器里面进行判断

```html
<!--客户端：-->
<form action="">
    用户名：<input type="text" id="username" /><span></span><br/>
    密码：   <input type="text" id="password" /><span></span><br/>
    <input  type="submit" value="注册"/>
</form>

<script type="text/javascript" src="js/jquery-1.11.min.js"></script>
<script type="text/javascript">
    var isOK = false;  //开关判断
    $("#username").blur(function(){
        var value = $(this).val().trim();
        //参数1：url  参数2：传到后端的参数 json数据格式  参数3：回调函数
        //参数最终拼接到url中：?username=zs&age=12
        //$.get("reg.jsp",{username:value},function(data){
        //将参数以请求体方式传到服务器
        $.post("reg.jsp",{username:value},function(data){
            if(data==1){ //建议此处使用整数1,比较内容相等
                $("#username+span").html("<font color='red'>已注册</font>");
                isOK = false;
            }else if(data==0){
                $("#username+span").html("<font color='green'>恭喜可用</font>");
                isOK = true;
            }
        })
    })
    $("form").submit(function(){
        return isOK;
    })
</script>
```

```java
//服务器
<%
    //接收请求参数：request 根据key获取value 
	String username = request.getParameter("username"); //username=zs 得到zs字符串
    if("zs".equals(username)){
    	//通过response响应对象，回传数据到客户端
    	response.getWriter().write("1");  //注意：传字符串“1”或“0”
    }else{
    	response.getWriter().write("0");
    }
%>    
```

### 三、ajax方法

> 相对于get和post的异步请求，ajax的方法功能更为强大；如果需要完成处异步请求以外的功能，则需使用ajax方法，例如: 发完请求后的刷新图片提示

```html
<!--客户端-->
<!-- 案例：从服务器中获取数据，未取到数据前，显示一张一直刷新的图片 -->
<input type="button" value="加载数据" /><br/>
<div>...</div>
<script type="text/javascript" src="js/jquery-1.11.min.js"></script>
<script type="text/javascript">
    $("input").click(function(){
        $.ajax({  //data属性就是传参数的
            type:"get",  //请求类型
            url:"ajax.jsp",   //路径
            beforeSend:function(){ //发送数据前的触发执行
                $("div").html("<img src='img/Loading.gif'>服务器正在闹情绪...");
            },
            success:function(data){ //成功的请求
                $("div").html(data);
            }
        })
    })
</script>
```

```java
//服务器
<%
	Thread.sleep(5000);   //睡眠5秒

	response.getWriter().write("服务器数据加载完成！！！");
%>    
```

### 四、JSON数据

#### 概述

> JSON数据本质上就是带格式的字符串； 是一种数据交换格式，也就是用于前后端传递数据

#### 语法

> JSON数据有两种：1.最外层为{}  2.最外层为[]
>
> 最外层为{}，表示该JSON数据最终解析为对象
>
> 最外层为[]，表示该JSON数据最终解析为数组或集合

> JSON数据的格式如下："{key:value, key2: value2}"

### 五、JSON解析

> JSON的解析方式有两种：1.将JSON数据解析为对象或容器  2.对象或容器反向解析为JSON数据

#### FastJson解析

> FastJson是阿里巴巴提供的解析方式

```java
public class Grade {
	private int id;
	private String name;
	private List<Student> stus;
    //set/get  toString 构造...
}

public class Student {
	private int id;
	private String name;
	private int age;
	//set/get  toString 构造...
}
```

```java
//1.正向解析：将json数据解析成对象或容器
//String json1 = "{'id':1,'name':'JAVAEE-2305'}";
//解析复杂的数据：
String json1 = "{'id':1,'name':'JAVAEE-1703','stus':[{'id':101,'name':'刘铭','age':16}]}";
//规则：实体属性名与json数据的key要一致，值才能注入实体中
Grade grade = JSON.parseObject(json1, Grade.class);
System.out.println(grade);

String json2 = "['北京','天津','杭州']";
List<String> list = JSON.parseArray(json2, String.class);
System.out.println(list);
```

```java
//2.反向解析：已知对象，产生JSON数据
List<Student> list = new ArrayList<Student>();
list.add(new Student(10000, "zs", 30));
Grade grade = new Grade(101, "java2305", list);

String json1 = JSON.toJSONString(grade);
System.out.println(json1);

//已知容器，产生JSON数据
String[] arr = {"北京","上海","深圳"};
String json2 = JSON.toJSONString(arr);
System.out.println(json2);
```

#### Jackson解析

```java
//正向解析：1.根据json数据，解析成对象或容器
String json1 = "{\"id\":1,\"name\":\"JAVAEE-1703\",\"stus\":[{\"id\":101,\"name\":\"刘一\",\"age\":16}]}";
//解析成对象
ObjectMapper om = new ObjectMapper();
Grade grade = om.readValue(json1, Grade.class);
System.out.println(grade);

//解析成容器
String json2 = "[\"北京\",\"天津\",\"杭州\"]";
//<ArrayList<String>>：泛型中传的是集合
List<String> list = om.readValue(json2, new TypeReference<List<String>>() {
});
System.out.println(list);
```

```java
//2.反向解析：已知对象或容器转json数据
List<Student> list = new ArrayList<Student>();
list.add(new Student(101, "ls", 35));
Grade grade = new Grade(1, "java2202", list);
//已知对象转json数据
ObjectMapper om = new ObjectMapper();
String json1 = om.writeValueAsString(grade);
System.out.println(json1);

//已知数组转json数据
String[] arr = {"北京","上海","广州"};
String json2 = om.writeValueAsString(arr);
System.out.println(json2);
```

#### JS的JSON解析

```html
<input type="button" value="JSON解析" onclick="myclick()">
<script type="text/javascript">
    function myclick(){
        //JS的json解析：已知对象，转json字符串
        var obj = {name:'zs',age:30}; //通过json创建的对象
        var str = JSON.stringify(obj); //对象转字符串
        alert(str+"--->"+(typeof str))

        var obj2 = JSON.parse(str); //传入json字符串，解析成对象
        alert(obj2.name+","+obj2.age+"--->"+(typeof obj2))
    }
</script> 
```

#### 六、总结与作业

#### 总结

```
1.ajax概述（重点）
什么是ajax，用途，应用场景；应用流程
2.ajax的应用（重点）
获取服务器的数据的案例
客户端传参数到服务器，再获取服务器数据
3.ajax方法（重点）
比get和post异步加载更为强大
4.JSON数据
概述-数据交换格式；语法结构
5.json解析
FastJson解析-正向，反向解析（重点）
jacsson解析（了解）
JS的json解析（重点）
```

#### 作业

```
1. 使用jquery的get异步请求，传入name和age，将jsp中定义的student对象返回并解析
在标签中显示对象的name和age值
提示： jsp返回字符串-->后端可以将对象转字符串； 到达前端：字符串接收，再转对象
，，
2. 使用jquery的ajax异步请求，传入name和age，将jsp中定义的student对象返回并解析，
在标签中显示对象的name和age值
```

#### 晨考

```
1.fastjson包中，解析成对象和解析成集合的方法是什么？
String json1 = "{'id':1,'name':'JAVAEE-1703','stus':[{'id':101,'name':'刘铭','age':16}]}";
//规则：实体属性名与json数据的key要一致，值才能注入实体中
Grade grade = JSON.parseObject(json1, Grade.class);

解析成对象：JSON.parseObject();
解析成容器：JSON.parseArray();
2. js解析成对象和对象解析成json字符串的方法分别是什么？
解析成对象:JSON.parse();
解析成JSON：JSON.stringfy();
3. 使用ajax时，可以使用submit提交按钮吗？ 为什么?
不可以，submit是整个页面的刷新，ajax是局部的刷新
```

