---
title: Session与过滤器
Date: 2023-09-15
Categories:
- Java
tags:
- JSP
---

# 监听器与JSP

### 一、过滤器的扩展

#### 脚本过滤分析

> 案例：使用过滤器完成过滤敏感词汇：前端文本框写入内容，点击提交；在后台接收数据后，屏蔽敏感词，并将屏蔽后的内容响应回客户端。
>    例如：文本框输入-“暴力的黄色小说”，将黄色替换成xx，并响应回客户端
>    提示：敏感过滤，编码过滤
>
> 分析：在Servlet中可以接收到字符串并处理，但是每个Servlet如果都处理字符串则会特别繁琐；所以必须在过滤器中完成；但是过滤器中过滤后，输入如何传到Servlet？------封装请求类（装饰着模式）

#### 代码实现

```java
@WebFilter("/*")
public class ScriptFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain filterChain) throws IOException, ServletException {
        //编码过滤
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;

        String uri = req.getRequestURI();  //获取访问路径
        if(!uri.contains(".html")&&!"/".equals(uri)){//避免前端页面进入编码处理
            System.out.println("后台进入编码处理");
            req.setCharacterEncoding("utf-8");
            resp.setContentType("text/html;charset=utf-8");
        }
        //传入基本请求对象，得到包装的请求对象
        MyHttpRequestWrapper wrapReq = new MyHttpRequestWrapper(req);
        //传入包装请求对象到目标servlet，在目标Servlet中会回调包装的getParameter
        filterChain.doFilter(wrapReq,resp);
    }
    //装饰者，自定义包装类继承Http请求包装类
    class MyHttpRequestWrapper extends HttpServletRequestWrapper{
        public MyHttpRequestWrapper(HttpServletRequest request) {
            super(request);
        }
        @Override  //获取请求参数的重写方法
        public String getParameter(String name) { //name-->"title"
            String value = super.getParameter(name); //获取到参数值后，进行处理内容
            //过滤敏感词，并返回
            String res = value.replace("黄色","xx");
            return res;
        }
    }
}
```

### 二、监听器的扩展

#### 概述

> 后端三剑客：Servlet，过滤器，监听器； 其中监听器只需要了解其用法即可，主要用于监听request，session，context的生命周期阶段，也就是何时创建，何时销毁。
>
> 应用：类似于Servlet和过滤器的用法，需要实现监听器的接口，接口主要有三个，分别对应request,session,context
>
> 启动流程：
>
> request: 从客户端发请求到服务器，则创建request，并立即销毁
>
> session：在Servlet中调用了req.getSession才创建session对象；或访问了JSP也会创建(封装了Servlet，且直接创建了内置对象)
>
> context：在tomcat启动时，则创建context；

#### 应用

> 案例：统计当前在线人数；如果有用户访问了，即创建session，记录数量；触发的session的销毁，则记录数量减-；在监听器中完成统计即可
>
> 分析：当前在线统计数，只能在Session的监听中完成；因为Session的监听就是监听多个用户的访问数量的。

```java
@WebListener("/*") //接收所有的访问路径
public class SessionListener implements HttpSessionListener {
    @Override
    public void sessionCreated(HttpSessionEvent event) {
        System.out.println("session创建..."+event.getSession().getId());
        //获取全局对象
        ServletContext context = event.getSession().getServletContext();
        Integer count = (Integer) context.getAttribute("count");
        if(count==null){
            count = 1;
        }else{
            count++;
        }
        context.setAttribute("count",count);
        System.out.println("创建时，当前的访问数量为:"+count);
    }

    @Override
    public void sessionDestroyed(HttpSessionEvent event) {
        //没有设置有效期，默认session有效期为30分钟
        System.out.println("session销毁...");
        ServletContext context = event.getSession().getServletContext();
        //获取数量
        Integer count = (Integer) context.getAttribute("count");
        //触发到销毁后，只需将数量--即可
        context.setAttribute("count",--count);
        System.out.println("销毁后，当前的访问数量为:"+count);
    }
}
```

### 三、综合案例

> 案例：有两张表：员工表和管理员表；员工表进行登录，成功后，则显示员工的所有信息，并进行增删改的操作。

#### 分析

> 1. 创建表与实体类
> 2. 创建DuirdUtils，并引入DaoUtils
> 3. 进行Dao层设计，并进行dao层测试
> 4. 完成业务层功能
> 5. 创建控制层，将控制与展示的Servlet分离
> 6. 加入过滤器进行编码和权限设置
>
> 创建表：

```mysql
CREATE TABLE EMP(
	ID INT PRIMARY KEY AUTO_INCREMENT,
    NAME VARCHAR(20) NOT NULL,
    SALARY DOUBLE NOT NULL,
    AGE INT NOT NULL
)CHARSET=UTF8;

CREATE TABLE EmpManager(
    USERNAME VARCHAR(20) NOT NULL,
    PASSWORD VARCHAR(20) NOT NULL
)CHARSET=UTF8;
```

#### DAO测试

> 完成了表与实体类设计，及创建了utils工具类，然后在dao层测试数据库的交互是否成功。

```java
public class EmpDaoImpl implements EmpDao {
    private QueryRunner runner = new QueryRunner(DruidUtils.dataSource);
    @Override
    public List<Emp> selectEmps() throws SQLException {
        String sql = "select * from emp";
        return runner.query(sql,new BeanListHandler<>(Emp.class));
    }

    public static void main(String[] args) throws SQLException {
        List<Emp> emps = new EmpDaoImpl().selectEmps();
        System.out.println(emps);
    }
}
```

#### 登录与展示

> 结合web进行前后端数据传递，先进行管理员的登录，登录成功，则展示员工信息。
>
> 在控制层可以设置多级映射路径，这样避免了过滤时的前端页面判断；直观的对后端数据进行编码处理与权限控制。

> 管理员登录的控制层：

```java
@WebServlet("/manage/login")
public class ManagerLoginController extends HttpServlet {
    //管理员的业务层
    private EmpManagerService empManagerService = new EmpManagerServiceImpl();
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        //获取前端参数，交给业务层
        String username = req.getParameter("username");
        String password = req.getParameter("password");
        Empmanager empmanager = empManagerService.login(username, password);
        if(empmanager!=null){
            //登录成功，则跳到员工展示页面
            //设置登录凭证--在权限验证，及其他功能中使用该凭证
            req.getSession().setAttribute("em",empmanager);
            //注意：在多级路径中，不适合相对路径，必须加/...   上下文路径+“/路径”
            resp.sendRedirect(req.getContextPath()+"/manage/safe/show");
        }else{
            resp.getWriter().write("登录失败");
        }
    }
}
```

> 展示员工信息的控制层：

```java
@WebServlet("/manage/safe/show")
public class EmpShowController extends HttpServlet {
    private EmpService empService = new EmpServiceImpl();  //员工业务层
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        List<Emp> list = empService.showEmps();
        req.setAttribute("emps",list);  //request存值+转发
        //转发时不需要携带上下文路径
        req.getRequestDispatcher("/manage/safe/showJSP").forward(req,resp);
    }
}
```

### 四、过滤器与细节

#### 细节分析

> 1. 多级路径中的跳转设置
>
>    重定向时，需要加上下文路径，且多级路径必须是绝对路径；因为客户端发起的请求不携带上下文路径
>
>    转发时，携带上下文路径的；因为是服务器的转发，说明客户端上一次的请求已经带了上下文路径
>
> 2. 设计多级路径的思路
>
>    因为编码处理需要跳过前端页面的拦截，且权限验证中也需要跳过拦截，所以多级路径设置如下：
>
>     @WebServlet("/manage/login")： 做登录验证，不需要拦截：只需要拦截编码的即可；编码映射路径拦截设置为/manage/*
>
>    @WebServlet("/manage/safe/show"): 拦截编码及权限验证，是真正展示后台的页面；权限映射路径拦截设置为/manage/safe/*
>
> 3. 注意，映射路径不要与部署中的路径冲突了，否则提示url-pattern异常； 例如：/manager路径

#### 过滤器应用

> 编码处理：

```java
@WebFilter("/manage/*")
public class EncodingFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain filterChain) throws IOException, ServletException {
        System.out.println("进入项目的编码处理..");
        request.setCharacterEncoding("utf-8");
        response.setContentType("text/html;charset=utf-8");

        filterChain.doFilter(request,response);  //放行
    }
}
```

> 权限验证：

```java
@WebFilter("/manage/safe/*")
public class SafeFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain filterChain) throws IOException, ServletException {
        System.out.println("项目安全处理...");
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;
        Object em = req.getSession().getAttribute("em");

        if(em!=null){ //存储凭证后，即可放行
            filterChain.doFilter(req,response);
        }else{ //没有登录凭证，则跳转到登录页面
            resp.sendRedirect(req.getContextPath()+"/login.html");
        }
    }
}
```

### 五、引入JSP

#### 现有问题

> 在员工展示时，我们写了ShowJSP展示的控制层，但是展示的标签内容非常繁琐；按照现有知识，也必须要这么做，因为后端暂时无法既写java代码同时直接写HTML。
>
> 需要使用jsp文件可以实现java代码+HTML的组合。

#### JSP使用

> 概述：JSP是对Servlet的高级封装；可以在里面直接写java代码；同时也能写HTML标签
>
> 写java代码时，需要有JSP的标记：<%  %>   <%= %>
>
>  <% %>:  普通脚本，里面直接写java代码的区域 （在ajax中使用过了）
>
> <%= %>: 输出脚本，直接打印java变量到页面上

> 使用jsp文件替换ShowJSP的控制层

```jsp
<%
//获取request的属性值
List<Emp> emps = (List<Emp>) request.getAttribute("emps");
%>
<table border="1" cellspacing="5">
    <tr>
        <th>编号</th>
        <th>姓名</th>
        <th>工资</th>
        <th>年龄</th>
        <th colspan='2'>操作</th>
    </tr>
    <%
    for(Emp emp :emps){
        %>
    <tr>
        <td><%=emp.getId()%></td>
        <td><%=emp.getName()%></td>
        <td><%=emp.getSalary()%></td>
        <td><%=emp.getAge()%></td>
        <td><a href='"+request.getContextPath()+"/manage/safe/remove?id="+emp.getId()+"'>删除<a></td>
            <td><a href='"+request.getContextPath()+"/manage/safe/showEmp?id="+emp.getId()+"'>修改</a></td>
            </tr>
   <%
     }
   %>
</table>
```

### 六、总结与作业

#### 总结

```
1.过滤器扩展
脚本过滤案例-请求类的封装
2.监听器的扩展
概述-监听request，session，context生命周期
应用-统计在线数量
3.综合案例（重点）
掌握分层结构，测试dao-数据库交互完成
登录与展示-web应用，跳转方式
4.过滤器与细节（重点）
细节-多级路径，重定向和转发设计
过滤器应用-编码过滤，权限过滤
5.引入JSP
现有问题-繁琐的servlet中的打印
JSP使用-分离jsp文件-处理java代码+HTML操作
```

#### 作业

```
1.独立完成今天的综合项目的登录与展示功能
2.完成删除功能，超链接中传入id，进行删除，并跳转到展示页面
3.在展示页面创建"添加"的超链接，点击进入add.html页面，并实现添加功能；成功后跳转到展示页面
```

#### 晨考

```
1. 什么是jsp，有什么作用
2. <%%> 有什么作用
3. <%%>与<%=%> 的区别
4. 什么是过滤器，有什么用途
```

