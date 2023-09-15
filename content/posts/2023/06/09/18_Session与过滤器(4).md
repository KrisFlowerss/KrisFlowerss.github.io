---
title: Session与过滤器
Date: 2023-09-14
Categories:
- Java
tags:
- Session
---

# Session与过滤器

### 一、Session场景

> 可用户存数据，存到服务器中；特点是同一个用户的多次访问属于同一个会话；不同用户访问则是不同会话
>
> 应用场景：访问权限，验证码

#### 访问权限

> 昨天的登录案例，直接访问Servlet的showAll路径，即可展示数据；但真实场景中，考虑安全性，应该是登录后才能访问后台数据
>
> 模拟编写简单权限限制的例子：
>
> 思路：直接访问showAll时，判断没有登录凭证，则跳转到登录页面，登录成功；存了凭证后，才能显示到showAll路径。
>
> 存凭证方式：session(多次访问有效-推荐)，request（一次访问有效），cookie（不安全）

> 登录凭证的设置：

```java
@WebServlet("/login")
public class LoginServlet extends HttpServlet {
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        //处理乱码：
        req.setCharacterEncoding("utf-8");
        resp.setContentType("text/html;charset=utf-8");

        String username = req.getParameter("username");
        String password = req.getParameter("password");
        if("zs".equals(username)&&"123".equals(password)){
            //存凭证
            req.getSession().setAttribute("username",username);
            //跳转：重定向-可看到目标url
            resp.sendRedirect("showAll");
        }else{
            resp.getWriter().write("登录失败");
        }
    }
}
```

> 展示数据中判断凭证：

```java
@WebServlet("/showAll")
public class ShowServlet extends HttpServlet {
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("text/html;charset=utf-8");

        String name = (String) req.getSession().getAttribute("username");
        if(name!=null) { //拿到登录凭证了，可以展示数据
            resp.getWriter().write("展示后台数据成功!!!");
        }else{//跳转到登录页面：重定向-改变url，可读性好
            resp.sendRedirect("login.html");
        }
    }
}
```

#### 验证码

> 在登录中往往除了登录校验外，还需要验证码的校验；
>
> 验证码的操作方式：
>
> 1. 生成验证码        2. 判断验证码       3.刷新验证码     

> 生成验证码：需要到验证码的依赖包，且使用session存储验证码内容

```java
@WebServlet("/valid")
public class ValidateServlet extends HttpServlet {
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        //展示验证码  参数1，2：宽高  参数3：验证码个数  参数4：干扰线数量
        ValidateCode code = new ValidateCode(110, 50, 4, 8);
        System.out.println("验证码："+code.getCode()); //获取验证码
        //存储验证码
        req.getSession().setAttribute("imgCode",code.getCode());
        code.write(resp.getOutputStream());  //写出验证码，传入字节流
    }
}
```

> 判断验证码：在登录的Servlet中判断验证码增强登录权限

```java
//验证码校验：
String code = req.getParameter("code");
String imgCode = (String) req.getSession().getAttribute("imgCode");
if(!imgCode.equalsIgnoreCase(code)){
    resp.getWriter().write("验证码失败！");
    return;
}
```

> 刷新验证码：点击触发显示验证码的img标签，改变访问路径

```html
<form action="login" method="get">
    用户名：<input type="text" name="username"><br>
    密码:<input type="text" name="password"><br>
    验证码：<input type="text" name="code" />
    <!-- 用于展示验证码的图片标签 -->
    <img src="valid" onclick="change(this)" /><br>
    <input type="submit" value="提交">
</form>

<script>
    function change(obj) {
        alert()
        obj.src="valid?date="+new Date();  //清缓存
    }
</script>
```

#### Session与Cookie

> Session存值到服务器；Cookie存储到客户端
>
> 场景：
>
> 1. 当需要临时存储数据(内存存储)，且安全性较高时，使用Session； 例如：权限验证，验证码
> 2. 永久性存储，需要存储有效期，安全性不是特别高的应用中，则使用cookie； 例如：浏览记录，购物车

### 二、context全局对象

#### 概述

> context是一个全局对象，只要启动了Tomcat，那么任何Servlet都可使用到该对象；且任意用户的访问，都属于同一个context对象。
>
> 生命周期：
>
> 启动：在tomcat启动时，产生context对象
>
> 结束：只有tomcat关闭后，context才关闭

#### context用法

```java
@WebServlet("/context")
public class ContextServlet extends HttpServlet {
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        //创建全局对象的方式：1.req对象获取  2.通过session对象获取 3.当前Servlet对象获取
        ServletContext context1 = req.getServletContext();
        ServletContext context2 = req.getSession().getServletContext();
        ServletContext context3 = this.getServletContext();
        System.out.println(context1==context2); //true
        System.out.println(context1==context3); //true

        //调用常用方法：
        String realPath = context1.getRealPath("/"); //获取真实路径，在上传图片时用到
        System.out.println("从盘符出发的路径："+realPath);

        System.out.println("context获取上下文:"+context1.getContextPath()); //获取上下文路径
        System.out.println("req获取上下文:"+req.getContextPath());

        //和req，session类似，用于存值(没有req和session常用)
        //req:一次请求有效
        //session:一次会话有效(浏览器不改变，就一直有效)
        //context:除了关闭或重启tomcat，其余都有效
        context1.setAttribute("key","context存值");
    }
}
```

```java
@WebServlet("/get")
public class GetContext extends HttpServlet {
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        ServletContext context = req.getServletContext();
        System.out.println("获取值："+context.getAttribute("key"));

        System.out.println("清除key:");
        context.removeAttribute("key"); //移除只是移除存储的值，context还在，session和req也类似
    }
}
```

> 存储方式说明：
>
> 能用作用域小的存值，尽量用小的；       顺序：request，session, context

#### 应用案例

> 案例：统计某个网页的访问量，每访问一次，则浏览量增加一次；并显示统计量到页面上

```java
@WebServlet("/count")
public class CountServlet extends HttpServlet {
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("text/html;charset=utf-8");
        ServletContext context = req.getServletContext();
        //获取全局对象中存的值
        Integer count = (Integer) context.getAttribute("cou");
        if(count==null){ //如果为null，说明第一次访问
            count = 1;
        }else{
            count++;   //值+1
        }
        context.setAttribute("cou",count);
        resp.getWriter().write("访问了"+count+"次");
    }
}
```

### 三、过滤器

> 概述：浏览器到目标Servlet之间的一道拦截技术

#### 过滤器引入

> 上面的访问权限，每次访问目标Servlet时，都需要进行凭证的判断，会非常繁琐；而且后续再次新增Servlet可能会忘记写凭证判断，则有安全性问题，这些都是需要进行处理的。
>
> 如果有一种技术，在访问所有目标资源时，都能拦截处理，即可解决冗余和安全性的问题。
>
> 应用场景：权限处理，编码处理
>
> 过滤器流程：浏览器访问目标资源之前，先进入过滤器; 过滤器中需要放行(doFilter())，否则无法到达目标资源 ; 到达目标资源后，响应会客户端时，依然会先进入过滤器

#### 应用

```java
//@WebFilter("/dest")  //精确匹配-不常用   进入过滤器的注解
//@WebFilter("/*")  //通配符匹配-常用  /xx/yy/* - 常用(多级路径)
public class DestFilter implements Filter {
    //Filter的生命周期与Servlet类似的：1.构造 2.初始化  3.doFilter 4.destroy
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        System.out.println("进入过滤器...开始");
        chain.doFilter(request,response);  //放行
        System.out.println("进入过滤器...结束");
    }
    //...
}
```

#### 配置方式

> 配置方式有两种：注解配置，xml配置
>
> 1. 注解配置： @WebFilter(映射路径)
> 2. xml配置： 与servlet的配置类似，如下所示

```xml
<filter>
    <filter-name>f</filter-name> <!-- 根据映射路径找到真实Filter路径 -->
    <filter-class>com.qf.d_filter.DestFilter</filter-class>
</filter>
<filter-mapping><!-- 配置映射路径 -->
    <filter-name>f</filter-name>
    <url-pattern>/*</url-pattern>
</filter-mapping>
```

> 过滤器路径：
>
> 过滤器的过滤路径通常有三种形式:
>
> 精确过滤匹配 ，比如/index.jsp   /myservlet1
>
> 后缀过滤匹配，比如 *.jsp、*.html、*.jpg
>
> 通配符过滤匹配/*，表示拦截所有。注意过滤器不能使用/匹配。
> 	/aaa/bbb/* 允许

#### 过滤器链

> 访问目标资源时，经过多道拦截处理的过程，就是过滤器链；
>
> 在一个Web应用中，可以开发编写多个Filter，这些Filter组合起来称之为一个Filter链。
>
> 优先级：	
>
> - 如果为注解的话，是按照类全名称的字符串顺序决定作用顺序（编码处理时必须先执行）
> - 如果web.xml，按照 filter-mapping注册顺序，从上往下
> - web.xml配置高于注解方式
> - 如果注解和web.xml同时配置，会创建多个过滤器对象，造成过滤多次。
>
> 注意：多次过滤的执行顺序和响应回来的顺序的相反

### 四、Filter应用场景

#### 编码处理

```java
@WebFilter("/*")
public class EncodingFilter implements Filter {
    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
		HttpServletRequest req = (HttpServletRequest) servletRequest;
        String uri = req.getRequestURI();
        if(!uri.endsWith(".html")){
            System.out.println("进入编码处理...");
            servletRequest.setCharacterEncoding("utf-8");
            servletResponse.setContentType("text/html;charset=utf-8");
        }
        filterChain.doFilter(servletRequest,servletResponse);  //放行
    }
}
```

#### 权限访问

```java
@WebFilter("/*")
public class SafeFilter implements Filter {
    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        //在过滤器中，判断是否得到登录凭证 --session
        HttpServletRequest req = (HttpServletRequest) servletRequest; //父转子
        HttpServletResponse resp = (HttpServletResponse) servletResponse;

        String username = (String) req.getSession().getAttribute("username");
        //注意：此处要避免多次访问到login.html;因为重定向每次都从客户端发的请求，每发一次请求都需要经过过滤器
        String uri = req.getRequestURI(); //获取请求路径
        System.out.println("uri--->"+uri);
        //判断如果有凭证，或者是登录的前端或后端判断页面,以及验证码都放行
        if(username!=null||uri.contains("/login")||uri.contains("/valid")){
            filterChain.doFilter(req,resp);  //放行
        }else{
            resp.sendRedirect("login.html");  //重定向到登录
        }
    }
}
```

> 注意：后续最好将Servlet路径设置为多级的，这样login.html就无需放行，因为本身不在过滤器的拦截中

### 五、总结与作业

#### 总结

```
1.Session的应用场景(重点)
访问权限、验证码、Session与cookie的应用区别
2.Context全局对象
概述-全局唯一对象； 创建对象、常用方法、应用案例-统计访问流量
3.过滤器
概述、引入-繁琐和安全隐患、基本应用、
配置方式-注解、web.xml、路径；过滤器链-进行多次过滤处理，优先级
4.过滤器应用场景(重点)
编码处理-在过滤器中统一完成
权限访问-在过滤器中判断session，需要考虑放行路径（考虑后台多级路径过滤）
```

#### 作业

```
1. 项目判断验证码时,我们使用了session存取值,如果改为reqeust, context存值,分别会发生什么情况,为什么?
2. 案例使用context统计浏览次数, 如果使用request, session来存储, 会出现什么情况,为什么?
3. session是什么? 请简述, 并将session的实现原理说明
4. 使用过滤器完成过滤敏感词汇：前端文本框写入内容，点击提交；在后台接收数据后，屏蔽敏感词，并将屏蔽后的内容响应回客户端。
   例如：文本框输入-“暴力的黄色小说”，将黄色替换成xx，并响应回客户端
   
```

#### 晨考

```
1. HttpRequest,HttpSession,ServletContext 的作用域是什么
2. Session与Cookie的区别
3. session设置和获取属性的方法调用
4. 设置和获取Cookie的方法调用
```

![](https://sp.zhuefy.link/file/ba4dfde0d8a9a948d3ed1.png)
