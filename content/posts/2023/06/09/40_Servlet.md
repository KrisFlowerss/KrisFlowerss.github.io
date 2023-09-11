---
title: Servlet
Date: 2023-09-11
Categories:
- Java
tags:
- Servlet
---

# Servlet

### 一、DaoUtils插件

#### 概述

> 昨天我们写过了DaoUtils的DML和DQL的封装，今天引入第三方插件直接使用DaoUtils即可。
>
> 功能：
>
> DML的操作变得很简单，直接传入SQL语句和参数即可完成
>
> DQL操作变得很灵活，查询的数据可转储到Map，List，对象
>
> 除此之外还会扩展其他的SQL功能，例如获取总条数

#### 应用

> 先导入DaoUtils的jar包，操作DAO层即可完成增删改查

```java
public class PersonDaoImpl {
    //DaoUtils插件搭配Druid连接池更方便
    private QueryRunner runner = new QueryRunner(DruidUtils.dataSource);
    public int add(Person p) throws SQLException {
        String sql = "insert into person(name,age,bornDate,email) values(?,?,?,?)";
        //QueryRunner中传入数据源后，无需每个功能都加入连接对象
        return runner.update(sql,p.getName(),p.getAge(),p.getBornDate(),p.getEmail());
    }

    public int update(Person p) throws SQLException {
        String sql = "update person set name=?,age=?,bornDate=?,email=? where id=?";
        return runner.update(sql,p.getName(),p.getAge(),
                             p.getBornDate(),p.getEmail(),p.getId());
    }

    public int deleteById(int id) throws SQLException {
        String sql = "delete from person where id=?";
        return runner.update(sql,id);
    }

    public List<Person> queryAll() throws SQLException { //查询返回的是集合
        String sql="select * from person";
        //查询时，使用BeanListHandler对象--返回集合
        return runner.query(sql,new BeanListHandler<>(Person.class));
    }

    public Person queryById(int id) throws SQLException {
        String sql = "select * from person where id=?";
        //查询时，BeanHandler对象--返回对象
        return runner.query(sql,new BeanHandler<>(Person.class),id);
    }

    public long selectCount() throws SQLException {//查询总条数，返回long类型的值
        String sql = "select count(*) from person";
        return runner.query(sql,new ScalarHandler<>());
    }
}
```

### 二、软件结构

> 在项目开发中，往往有两种软件设计结构：B/S, C/S

> B/S:  浏览器/服务器模式，Java常用这种结构--企业级web，互联网级web；案例：门户网站，商城
>
> 好处：无需安装客户端软件，直接使用浏览器即可访问服务器；方便项目升级
>
> 弊端：服务器压力特别大; 图形化效果不是太好

> C/S :  客户端/服务器模式，C/C++常用该结构； 典型案例：QQ，飞秋等
>
> 好处 ：图形化效果好，减轻了服务器压力
>
> 弊端：每次项目变更都需要在客户端重新安装，不方便升级

### 三、服务器

#### web资源

> 存放在服务器中的资源；包含了静态资源和动态资源
>
> 静态资源：前端资源-HTML，CSS，JS，图片等；每个用户访问页面得到的都是同一个，例如：门户网站，新浪，搜狐等。
>
> 动态资源：与服务器资源Servlet/JSP有交流，每个用户看到的都是不同信息，例如，登录淘宝。

#### web服务器

> web服务器就是一个容器，可以装载很多资源，包括静态资源和动态资源
>
> 我们学习的web服务器是tomcat服务器
>
> 特点：简单，方便入门，开源，免费； 我们所使用的版本为tomcat8.5

#### Web安装及目录结构

> 安装；只需下载tomcat8.5的压缩包，解压到指定目录即可： d:/tool/tomcat8.5..
>
> 目录结构：
>
> bin：存放可执行文件目录；例如，启动和关闭tomcat
>
> conf: 存放配置文件  server.xml-启动时会加载该配置文件，监听里面配置的ip和端口   web.xml：路径
>
> webapps：部署项目路径；项目开发完成即可部署到该目录中

### 四、访问web

#### 访问静态web

> 1. 静态web的访问特别简单，只需要将html文件放入webapps/myweb中(myweb是自己创建的目录),
>
> 2. 启动web服务器即可访问该路径
>
> 3. 访问方式：http:/localhost:8080/myweb/a.html
>
> 注意：启动tomcat，访问http://localhost:8080，是tomcat的主页，说明tomcat启动正常
>
> 访问细节：http:/localhost:8080都是在tomcat中监听的协议，主机，端口

#### 访问动态web

> 访问动态web，也就是访问Servlet/JSP，需要以下步骤：
>
> 1. 编写Servlet的代码，并将其编译成class文件
> 2. 引入Servlet的jar包，才能启动识别Servlet代码
> 3. 编写web.xml指定好Servlet的路径（注意：Servlet路径不能直接访问）
>
> 说明：每一步的操作都比较麻烦，都需要开发工具来生成，接下来可以在IDEA中集成Tomcat

### 五、IDEA集成Tomcat

#### 概述

> 如果直接使用bin目录下启动tomcat，会非常繁琐；因为java代码的编写和生成都是在工具中完成的，如果能将tomcat集成到工具中，那么启动tomcat后，即可完成class的生成和web.xml的识别。

#### 访问静态web

> 1. 先创建web项目，并将tomcat集成进来
> 2. 再将a.html放到web目录下
> 3. 在web.xml中配置默认启动路径，然后启动项目即可访问到静态页面

```xml
<!-- web.xml中设置默认启动页面路径 -->
<welcome-file-list>
    <welcome-file>a.html</welcome-file>
</welcome-file-list>
```

#### 访问动态web

> 1. 在src下创建MyServlet类，并实现Servlet接口
>
> 2. 导入servlet支持的依赖包，有两种导入方式
>
>    a. 在项目结构中，导入tomcat
>
>    b.在WEB-INF下新建lib目录，拷贝servlet-api.jar到此处，添加到库
>
> 3. 在web.xml中配置servlet的路径

> web.xml的配置如下：

```xml
<servlet>
    <!-- 标记名 -->
    <servlet-name>a</servlet-name>
    <!-- 真实servlet路径 -->
    <servlet-class>com.qf.a_servlet.MyServlet</servlet-class>
</servlet>
<!-- servlet的映射路径的配置   访问时 http://localhost:8080/my  -->
<servlet-mapping>
    <!-- servlet标记名，用于找到servlet标签的标记名 -->
    <servlet-name>a</servlet-name>
    <!-- 映射路径，不要忘记/ -->
    <url-pattern>/my</url-pattern>
</servlet-mapping>
```

### 六、导出war包

> 写完web项目后，最终需要部署上线，需要将项目导出，部署到webapps中即可
>
> 步骤：
>
> 1. 在项目结构中添加归档项目
> 2. 构建项目生成war包，并将war包拷贝到webapps中
> 3. 启动tomcat项目，自动解压，直接访问该部署目录即可
> 4. 访问方式：http://localhost:8080/归档目录/映射路径

### 七、总结与作业

#### 总结

```
1.DaoUtils插件
昨天手写DaoUtils；今天直接使用插件应用
2.软件结构
B/S; C/S结构
3.服务器概述（重点）
web资源-动态web，静态web
web服务器-tomcat；web服务器的安装及目录结构的介绍
4.访问web（重点）
访问静态web-html放置到webapps下；
访问动态web-servlet资源的class，web.xml放置到webapps下，jar包
5.IDEA集成Tomcat（重点）
概述-集成好处   访问静态web-a.html放到web下；配置web
动态web访问-编写MyServlet类；编写web.xml映射路径
6.导出web包
在项目结构中进行归档，构建，并拷贝war包到webapps中
```

#### 作业

```
1.将IDEA中的静态web和动态web的访问写熟练
2.了解tomcat的体系结构
```

