---
title: SpringMVC配置
Date: 2023-10-11
Categories:
- Java
tags:
- SpringMVC
---

# SpringMVC配置

### 一、环境搭建

#### 概述

> SpringMVC是Spring旗下的一个独立的模块，在容器工厂之上的模块（Spring的子容器）；在SpringMVC的配置中，完全可以使用spring容器的配置方式。只不过springMVC容器中，只配置控制层相关的bean注入；Spring容器配置service层和dao层。
>
> 和spring类似，主要功能就是解耦合；同时SpringMVC又包含了MVC框架架构；里面的前端控制器用于和视图层交流；后端控制器用于和业务层交流。

#### 配置

> SpringMVC配置步骤：
>
> 1.准备web环境
>
> 2.导包，在web.xml中配置前端控制器的访问
>
> 3.并初始加载SpringMVC的容器（产生springMVC容器配置）
>
> 4.编写后端控制器操作，里面的功能看成是一个一个的handler(功能)

> SpringMVC依赖包的导入：

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-webmvc</artifactId>
    <version>5.1.6.RELEASE</version>
</dependency>
```

> web.xml中配置前端控制器

```xml
<servlet>
    <servlet-name>mvc</servlet-name>
    <!-- 真实前端控制器的类路径 -->
    <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
    <init-param><!--通过初始化参数加载springMVC容器 -->
        <param-name>contextConfigLocation</param-name>
        <param-value>classpath:mvc.xml</param-value>
    </init-param>
</servlet>
<servlet-mapping>
    <servlet-name>mvc</servlet-name>
    <url-pattern>/</url-pattern>
</servlet-mapping>
```

> 后端控制器创建，并产生目标handler

```java
@Controller //产生控制层bean <bean id="userController" ...
@RequestMapping("/user")  //请求路径,可选，建议加上，用于区分模块
public class UserController {
    //访问：http://localhost:8080/user/test1
    @RequestMapping("/test1") //用于区分下面的handler(方法)
    public String test1(){  //返回类型统一String
        System.out.println("hello，SpringMVC");
        return "a";  //跳转默认为：转发
    }
}
```

> 访问路径：http://localhost:8080/user/test1

### 二、请求参数

> springMVC中的参数接收，指的是从前端传入的参数的接收；一定要和mybatis参数绑定区分开

#### 变量收参

> 前端参数匹配上handler的变量名后，值自动注入。

```java
@RequestMapping("/param1")
//Date类型默认传参格式为：2023/08/09
//使用注解DateTimeFormat修改格式：2023-08-09
public String param1(Integer id, String name, @DateTimeFormat(pattern="yyyy-MM-dd") Date birthday){
    System.out.println(id+"--"+name+"--"+birthday);
    return "a";
}
```

> 访问路径：http://localhost:8080/user/param1?id=2&name=zs&birthday=2023-08-09

#### 实体收参

> 请求参数为实体对象，传的参数与实体属性一致，则值自动注入。

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private  Integer id;
    private  String name;
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date birthday;
}
```

```java
@RequestMapping("/param2")  //实体收参
public String param2(User user){
    System.out.println(user);
    return "a";
}
```

#### 数组收参

> 往往前端相同参数名，匹配不同的value值，在目标handler中使用数组参数接收。
>
> 数组名与参数名也是要一致，才能接收到。

```jsp
<form action="/user/param3">
    爱好：<input type="checkbox" name="love" value="eat">吃
    <input type="checkbox" name="love" value="drink">喝<br>
    <input type="submit" value="提交">
</form>
```

```
@RequestMapping("/param3")  //数组收参
public String param2(String[] love){
System.out.println(Arrays.toString(love));
return "a";
}
```

#### 集合收参（了解）

> 此处的集合收参，本质上讲，还是实体收参，只不过属性为集合。

```jsp
<form action="/user/param4">
    用户名:<input type="text" name="users[0].name" value="zs1" /><br>
    密码:<input type="text" name="users[0].id" value="1" /><br>

    用户名:<input type="text" name="users[1].name" value="zs2" /><br>
    密码:<input type="text" name="users[1].id" value="2" /><br>
    <input type="submit" value="提交">
</form>
```

```java
@RequestMapping("/param4")  //集合收参（了解）
//本质上还是实体收参，实体中的集合属性名，要和传参的一致
//且集合中的实体元素属性，和前端传入的属性也要一致
public String param4(UserList userList){
    for(User u :userList.getUsers()){
        System.out.println(u);
    }
    return "a";
}
```

#### 路径传参

> 通过路径的方式，将参数传递

```java
@RequestMapping("/param5/{id}")  //路径传参
//@PathVariable("id"):如果参数名和路径{名}一致，则可省略"id"，直接写成@PathVariable
public String param4(@PathVariable("id") Integer id){
    System.out.println("路径传参:"+id);
    return "a";
}
```

> 访问路径：http://localhost:8080/user/param5/666

#### 乱码处理

> post请求中的中文参数传递，则需要处理乱码；之前的做法可以通过request.setCharactorEncoding("utf-8");，现在交给编码过滤器类中，完成此操作

```xml
<filter>
    <filter-name>en</filter-name>
    <filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>
    <init-param> <!-- 初始化参数，将名为encoding的utf-8值注入到编码类中 -->
        <param-name>encoding</param-name>
        <param-value>utf-8</param-value>
    </init-param>
</filter>
<filter-mapping>
    <filter-name>en</filter-name>
    <url-pattern>/*</url-pattern>
</filter-mapping>
```

### 三、跳转

> 有两种跳转方式，转发与重定向。

#### 转发

> 可以转发到JSP页面，也可以转发到后端控制器路径

```java
//转发:
@RequestMapping("/for1")
public String for1(){ //转发到jsp页面
    System.out.println("for1...");
    return "forward:/a.jsp"; //内部识别转发前缀，后面内容忽略视图解析器拼接
}

//转发2
@RequestMapping("/for2")
public String for2(){ //转发到后端控制器
    System.out.println("for2...");
    return "forward:/user/for1"; //内部识别转发前缀，后面内容忽略视图解析器拼接
}
```

#### 重定向

> 与转发类似，可重定向到JSP页面，也可重定向到后端控制器路径

```java
//重定向1：跳转到jsp页面
@RequestMapping("/red1")
public String red1(){
    System.out.println("red1...");
    return "redirect:/a.jsp"; //重定向前缀，后面内容忽略视图解析器拼接
}

//重定向2：跳转到后端控制器handler
@RequestMapping("/red2")
public String red2(){
    System.out.println("red2...");
    return "redirect:/user/red1"; //重定向前缀，后面内容忽略视图解析器拼接
}
```

> 细节：
>
> 进行增删改操作时，往往使用重定向；避免重复出现变更异常
>
> 进行查询操作时，往往使用转发；实时更新数据。

### 四、传值

> 传值主要讲返回结果后的值的传递。通常需要使用request或session来存值
>
> 使用request必须讲Servlet、JSP，jstl依赖包导入

#### request与session

> 基本的存值方式：使用request与session

```java
//传值：
@RequestMapping("/resValue1")
//只要写了request和session参数，则前端控制器会帮我们注入对象
public String resValue1(HttpServletRequest request, HttpSession session){
    request.setAttribute("id",100); //request存值
    session.setAttribute("name","zs"); //session存值
    session.setAttribute("date",new Date());
    return "a"; //默认是转发的
}
```

> 前端使用EL表达式${id},${name}来获取值。

```jsp
${id}<br> <%-- 优先接收request，session，context --%>
${name}<br>
<fmt:formatDate value="${date}" pattern="yyyy-MM-dd"/><br>
```

#### Model

> Model存值和request是一致的。

```java
@RequestMapping("/resValue2")  //Model存值是默认存到request中的
public String resValue2(Model model){
    model.addAttribute("age",30);
    return "a";
}
```

> 前端取值：

```jsp
<%-- requestScope:取reqeust的值 只能取自身域存储的值 --%>
request:${requestScope.age}<br>
session:${sessionScope.age}<br>
```

#### ModelAndView

> ModelAndView既可以存值，又可以展示视图
>
> Model表示存到request域；View表示可以展示视图；handler中可以返回该类型；视图解析器可以解析到

```java
@RequestMapping("/resValue3")  //ModelAndView存值
public ModelAndView resValue3(){
    ModelAndView mav = new ModelAndView(); //实例化对象并存值及返回
    mav.setViewName("a");
    mav.addObject("love","吃");
    return mav;
}
```

> jsp展示中获取数据：

```java
love1:${requestScope.love}<br>
love2:${sessionScope.love}<br>
```

#### @SessionAttributes

> 该注解，可以将Model中的值拷贝到Session中，这样request和session都有存值。

```java
@SessionAttributes({"sex"}) //sex属性，将model的值从requst转session
public class UserController {
    @RequestMapping("/resValue4")  //Model转session存值
    public String resValue4(Model model){
        model.addAttribute("sex","nan"); //sex存到了session中
        return "a";
    }

    @RequestMapping("/resValue5")  //Model转session存值
    public String resValue5(SessionStatus ss){
        ss.setComplete(); //移除SessionAttributes中session的存志
        return "a";
    }
}
```

> JSP获取数据：

```jsp
<%-- 两个都能显示值 除非使用SessionStatus的移除，session的值就没了 --%>
sex1:${requestScope.sex}<br>  
sex2:${sessionScope.sex}<br>
```

### 五、静态资源

#### 问题

> 在前端的定位中，html,css,js以及图片都是属于静态资源。静态资源的访问，在全局web.xml中使用了映射路径"/"的方式，去处理静态资源。但是，在我们在局部的web.xml中配置前端控制器时，使用到了"/"路径，所以会导致冲突，冲突后，局部优先，前端控制器可以使用；但静态资源的访问则失效了。

#### 处理方案

> 方式1：将前端控制器的映射路径改为：*.do (不推荐)
>
> 这种方式，在后端控制器中，每一个handler都需要带上*.do的路径，非常麻烦。

> 方式2：生成静态资源映射路径

```xml
<!-- 静态处理2：静态资源的映射路径方式
         mapping="/html/**":我们要访问的映射路径
         location="/hhh/: 映射到真实的路径中
         弊端：每个真实的静态资源目录，都需要有映射路径
    -->
<mvc:resources mapping="/html/**" location="/hhh/" />
```

> 方式3：默认的静态资源处理（推荐）

```xml
<!-- 在后端控制器中，产生一个映射路径为/**处理静态资源的目标handler；
      它的优先级最低；其他的资源处理不了，则会通过该目标handler处理静态资源 -->
<mvc:default-servlet-handler />
```

### 六、JSON处理

#### 概述

> 在目标handler中返回的是json数据(字符串)； 在前端页面中可以得到该数据并进行展示
>
> 说明：之前handler返回字符串时，需要进行视图解析；例如，返回 a;  转成转发到/a.jsp中； 需要加入@ResponseBody注解，表示无需视图解析；返回的就是字符串内容。

#### @ResonpseBody

> 该注解，如果handler的返回值是字符串，则直接返回字符串（类似resp.getWriter().write()）

```java
@RequestMapping("/test1")
@ResponseBody
public String test1(){
    System.out.println("test...");
    return "test1";
}

@RequestMapping(value = "/test2",produces="text/html;charset=utf-8")
@ResponseBody
public String test2(){
    //resp.setContentType("text/html;charset=utf-8");
    System.out.println("test2...");
    return "你好";
}
```

> 如果返回的是对象，则需要JSON解析器将对象解析成json字符串。需要使用jackson包进行解析

```xml
<!-- Jackson springMVC默认的Json解决方案选择是 Jackson，所以只需要导入jackson的jar，即可使用。-->
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.9.8</version>
</dependency>
```

> JSON解析的测试：

```java
@ResponseBody
public User json1(){
    User user = new User();
    user.setName("zs");
    return user;  //返回对象；json解析器会将对象解析成json字符串
}

@RequestMapping("/json2") //@ResponseBody放到返回值旁边
public @ResponseBody List<User> json2(){
    List<User> list = new ArrayList<>();
    list.add(new User());
    list.add(new User());
    return list;
}
```

#### @RestController

> @RestController=@ResonpseBode+@Controller

```java
@RestController //等价于@Controller+@ResponseBody
public class JSONController {
     @RequestMapping("/json1")
    //@ResponseBody
    public User json1(){
        User user = new User();
        user.setName("zs");
        return user;  //返回对象；json解析器会将对象解析成json字符串
    }

    @RequestMapping("/json2") //@ResponseBody放到返回值旁边
    public /*@ResponseBody*/ List<User> json2(){
        List<User> list = new ArrayList<>();
        list.add(new User());
        list.add(new User());
        return list;
    }
}
```

#### @RequestBody

> 该注解与参数有关，可以将传的json字符串转为实体对象参数。
>
> 传入json字符串，需要使用ajax传参数，且使用post请求

```js
<script src="js/jquery-1.11.min.js" />
<script>
    $(function(){
        $("#bb").click(function () {
            //ajax
            var user = {id:1,name:"张三"};
            $.ajax({
                url:'${pageContext.request.contextPath}/json3',
                type:'post',
                contentType:"application/json",//声明请求参数类型为 json
                data:JSON.stringify(user),// 转换js对象成json
                success:function(ret){
                    alert(ret);
                }
            });
        })
    })
    function aaa() {
        var xhr = new XMLHttpRequest();
        xhr.open("post","${pageContext.request.contextPath}/json3");
        xhr.setRequestHeader("content-type","application/json");//设置请求头
        xhr.send('{"id":1,"name":"shine"}');//传递json串

        xhr.onreadystatechange=function(){  //回调数据
            if(xhr.readyState==4&&xhr.status==200){
                alert(xhr.responseText);  //返回结果
            }
        }
    }
</script>
```

> 后端控制器中，使用@RequestBody将json数据解析成对象。

```java
@RequestMapping("/json3")  //前端传入的是json数据，通过@RequestBody解析成对象
//实体属性与json的key要一致，才能注入值
public String json3(@RequestBody User user){
    System.out.println(user);
    return "ok";
}
```

### 七、总结与作业

#### 总结

```
1.SpringMVC环境搭建（重点）
概述，SpringMVC的好处，与spring的关系
配置方式
2.请求参数（重点）
变量收参、实体收参，数组收参，集合收参（了解），路径传参，乱码处理
3.跳转
转发-转发到jsp，转发到handler；重定向和转发类似
4.传值（重点）
request与session，model，modelandview，@SessionAttributes
5.静态资源
静态资源处理与前端控制器的路径冲突，需要处理
6.JSON处理(重点)
@ResonpseBody使用-与返回相关、@RestController,@RequestBody-与参数相关
返回对象的解析-解析成json数据
```

#### 作业

```
1.springMVC配置，测试访问到目标handler
2.创建Student实体类，并通过实体收参，将表单中注册的学生信息接收并打印
3.在目标handler中，使用jacksoon解析器，返回json数据（返回对象解析成json数据）
4.使用ajax传递json字符串，在handler中解析成对象。
```

