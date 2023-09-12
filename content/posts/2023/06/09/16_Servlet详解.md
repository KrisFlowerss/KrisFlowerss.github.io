# Servlet详解

### 一、HTTP协议

#### HTTP概述

> 超文本传输协议（HTTP，HyperText Transfer Protocol)是互联网上应用最为广泛的一种网络协议,是一个基于请求与响应模式的、无状态的、应用层的协议，运行于**TCP协议**基础之上。

#### 特点

> 基于客户端(浏览器)与服务器模式的协议（底层是TCP协议）
>
> 无连接：与UDP协议是由区别的，UDP是不会建立连接；HTTP的无连接是建立连接后，立马端口连接。
>
> 1.0版本：建立连接后立即端口
>
> 1.1版本：建立连接后，等待几秒再断开连接；如果此时还有其他访问请求，则可使用同一个访问资源
>
> 无状态：HTTP的访问是没有记忆能力的

#### 通讯协议

> - 客户与服务器建立连接（三次握手）。
>
> - 客户向服务器发送请求。
> - 服务器接受请求，并根据请求返回相应的文件作为应答。
> - 客户与服务器关闭连接（四次挥手）。

#### 请求报文

> 当浏览器向Web服务器发出请求时，它向服务器传递了一个数据块，也就是请求信息（请求报文），HTTP请求信息由4部分组成：（查看f12的网络选项-点击访问链接）
> 1、请求行 请求方法/地址 URI协议/版本
> 2、请求头(Request Header)
> 3、空行
> 4、请求正文

#### 响应报文

> HTTP响应报文与HTTP请求报文相似，HTTP响应也由4个部分组成：
> 1、状态行
> 2、响应头(Response Header)
> 3、空行
> 4、响应正文

> 注意：要了解相关的响应状态码：200，302，404，500

### 二、Servlet详解

#### Servlet访问

> 前面Servlet的访问，需要创建MyServlet类去实现Servlet接口；然后在MyServlet类中需要重写5个方法；往往Servlet中只需要service方法，其余方法基本都是冗余，所以会有另外方便的Servlet访问方式。
>
> 1. 继承GenericServlet 
>
>    GenericServlet 是抽象类，实现了Servlet接口，且重写了Servlet的4个方法(除service方法外)；我们继承了GenericServlet，则只需重写service方法。
>
> 2. 继承HttpServlet（推荐）
>
>    HttpServlet是GenericServlet 的子类，里面重写了service方法，service方法中会调用doGet或doPost方法； 我们编写的MyServlet可继承HttpServlet，则不会直接提示重写

```java
//继承GenericServlet方式
public class MyServlet extends GenericServlet {
    @Override
    public void service(ServletRequest servletRequest, ServletResponse servletResponse) throws ServletException, IOException {
        System.out.println("hello,GenericServlet!!");
    }
}
```

```java
public class MyServlet2 extends HttpServlet {
    /*
    @Override //注意：此处的servcie和doget往往只用一个
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        System.out.println("hello,HttpServlet!!!");
        super.service(req,resp); //调用父类的service方法，才能触发到doGet
    }*/
    @Override //访问请求默认是get请求
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        System.out.println("doGet...");
    }
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        System.out.println("doPost...");
    }
}
```

#### 配置属性

> 在web.xml中可以配置映射路径，映射路径有多种方式：
> 精确匹配     /具体的名称	只有url路径是具体的名称的时候才会触发Servlet（推荐）
> 后缀匹配     * xxx		       只要是以xxx结尾的就匹配触发Servlet
> 通配符匹配   / *			     匹配所有请求，包含服务器的所有资源（过滤器常用）
> 通配符匹配   /                  匹配所有请求，包含服务器的所有资源，不包括.jsp

#### 自启动加载

> 在servlet标签中加入自启动标签，在启动tomcat时自动触发该servlet的init方法；自启动标签的基本值为正整数，值越小优先级越高。

```xml
<servlet>
    <servlet-name>b</servlet-name>
    <servlet-class>com.qf.a_servlet.MyServlet2</servlet-class>
    <!--自启动标签（自启动对应servlet的init方法），基本值为正整数；值越小，优先级越高
         -->
    <load-on-startup>0</load-on-startup>
</servlet>
```

#### 注解访问

> 注解访问，在项目中较常用；使用注解方式进行访问后，即可取代web.xml中的映射路径的配置
>
> - name: Serlvet名字 （可选）
>
> - value: 配置url路径,可以配置多个
>
> - urlPatterns：配置url路径 ，和value作用一样，不能同时使用
>
> - loadOnStartup: 如果是0或者正数 启动程序时自动触发init方法， 数值越小优先级越高。

```java
@WebServlet("/my") //直接加映射路径
public class MyServlet extends GenericServlet {}

//urlPatterns与value类似  name: servlet-name  value: url-pattern loadOnStartup:自启动
@WebServlet(name="a",value ="/my2",loadOnStartup=1)
public class MyServlet2 extends HttpServlet {}
```

### 三、Servlet应用

> 前端访问Servlet的方式有多种：url直接访问，超链接访问，表单访问
>
> 这三种方式，暂时只有表单方式可使用post请求

#### 请求方式

> get请求：
>
> 默认的访问方式就是get请求的方式，以url的方式传参数；优点：效率高   缺点：不安全

> post请求：
>
> 现在只有表单方式可设置post请求，以请求体方式传参数； 优点：安全  缺点：效率低
>
> post请求还可以在上传资源的场景中使用

```html
<!--注意：action属性值；加了/则是绝对路径，从站点出发的路径(不携带上下文路径)
不加/则是相对路径，相对于当前上下文路径
-->
<form action="my2" method="get">
    用户名：<input type="text" name="username"><br>
    密码:<input type="text" name="password"><br>
    <input type="submit" value="提交">
</form>
```

#### request

> request请求对象，用于接收从客户端过来的参数
>
> 常用方法：

```java
protected void service(HttpServletRequest request, HttpServletResponse response) {
    request.setCharacterEncoding("utf-8"); //解决request的post乱码(get写和不写都没有乱码)

    String name = request.getParameter("username"); //获取请求参数
    String password = request.getParameter("password");
    System.out.println(name+"--"+password);
    System.out.println("请求方式："+request.getMethod());// 获取请求方式
    System.out.println("请求路径："+request.getRequestURI()); //获取请求路径
    request.setAttribute("name",name);  //设置属性-存值;对应使用取值
    System.out.println(request.getAttribute("name"));  //根据key取值
}
```

#### response

> response响应对象，用于将服务器的数据回传到客户端
>
> 常用方法：

```java
 //解决get/post的response方向乱码问题
response.setContentType("text/html;charset=utf-8");
//getWriter获取PrintWrite输出流 再调用write方法写出数据
response.getWriter().write("返回数据");
```

### 四、综合案例

> 要求：实现登录功能、展示所有用户功能
>
> 技术点：Servlet+JDBC+前端HTML展示

#### 案例设计

> 1.表结构创建+实体类
>
> 2.DBUtils工具类设计
>
> 3.DAO层的接口与实现类（如果先写DAO层操作，可以先进行测试DAO层是否有问题）
>
> 4.Service层的接口与实现类
>
> 5.Servlet层处理浏览器的访问(用于取代测试类)
>
> 6.前端准备登录页面

> 表结构如下：

```mysql
CREATE TABLE admin(
	username VARCHAR(20) PRIMARY KEY,
	password VARCHAR(20) NOT NULL,
    phone varchar(11) NOT NULL,
    address varchar(20) NOT NULL
)CHARSET=utf8;
INSERT INTO admin(username,PASSWORD,phone,address)
VALUES('zs','123','12345678901','北京市昌平区');
INSERT INTO admin(username,PASSWORD,phone,address)
VALUES('aaron','123456','12345678901','北京市昌平区');
```

#### DAO测试

```java
//注意：工具类需要从src中获取配置资源
//DBUtils.class反射对象调用，到资源目录src中获取配置文件的数据，返回IO流
//这种方式，在web中也能找的配置路径
InputStream is = DBUtils.class.getResourceAsStream("/db.properties");
p.load(is);
```

```java
public class AdminDaoImpl implements AdminDao {
    private QueryRunner runner = new QueryRunner();
    @Override
    public Admin selectByName(String name) throws SQLException {
        String sql = "select * from admin where username=?";
        return runner.query(DBUtils.getConnection(),sql,new BeanHandler<>(Admin.class),name);
    }

    @Override
    public List<Admin> selectAdmins() throws SQLException {
        String sql = "select * from admin";
        return runner.query(DBUtils.getConnection(),sql,new BeanListHandler<>(Admin.class));
    }

    public static void main(String[] args) throws SQLException {
        List<Admin> admins = new AdminDaoImpl().selectAdmins();
        System.out.println(admins);
    }
}
```

#### 登录功能

> 业务层处理：在业务层完成登录功能，并加入事务

```java
public Admin login(String name, String password) {
    DBUtils.begin();
    Admin res = null;
    try {
        Admin admin = adminDao.selectByName(name);
        if(admin!=null&&admin.getPassword().equals(password)){
            res = admin;
        }
        DBUtils.commit();
    }catch (Exception e){
        e.printStackTrace();
        DBUtils.rollbock();
    }
    return res;
}
```

> controller层接收前端参数，并调用servce层

```java
@WebServlet("/login")
public class AdminController extends HttpServlet {
    private AdminService adminService = new AdminServiceImpl();
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        //处理乱码问题
        req.setCharacterEncoding("utf-8");
        resp.setContentType("text/html;charset=utf-8");

        //从前端获取参数
        String username = req.getParameter("username");
        String password = req.getParameter("password");
        Admin login = adminService.login(username, password);
        if(login==null){
            resp.getWriter().write("登录失败！");
        }else{
            resp.getWriter().write("登录成功！");
        }
    }
}
```

### 五、总结与作业

#### 总结

```
1.Http协议
概述-底层是tcp协议；特点-客户端与服务器模式，无连接,无状态(重点)
通讯协议,请求报文，响应报文
2.Servlet详解
访问方式-实现Servlet接口，继承GenericServlet，继承HttpServlet
配置属性：/路径   精确匹配，通配符匹配；自启动过程
注解方式配置（重点）
3.Servlet应用(重点)
请求方式：get和post请求
request和response对象
4.综合应用案例（重点）
Servlet+JDBC+HTML
```

#### 作业

```
参考登录案例，使用当前admin表，完成注册功能（dao层只需完成添加功能，无需判断用户名是否存在）
```

