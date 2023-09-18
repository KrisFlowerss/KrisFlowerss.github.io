---
title: JSTL与EL
Date: 2023-09-16
Categories:
- Java
tags:
- JSTL与EL
---

# JSTL与EL

### 一、添加与删除

> 完成web综合案例的添加与删除功能

#### 添加

> 在展示页面中，点击添加功能，在前端页面填充数据，并发请求到后端处理

```java
@WebServlet("/manage/safe/add")
public class AddEmpController extends HttpServlet {
    private EmpService empService = new EmpServiceImpl();
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        //获取前端参数
        String name = req.getParameter("name");
        //将String类型的值，转double和int
        double salary = Double.parseDouble(req.getParameter("salary"));
        int age = Integer.parseInt(req.getParameter("age"));
        int res = empService.addEmp(new Emp(0,name,salary,age));
        System.out.println("添加:"+res);
        resp.sendRedirect(req.getContextPath()+"/manage/safe/show");
    }
}
```

```java
//DAO层的添加操作
@Override
public int addEmp(Emp e) throws SQLException {
String sql = "insert into emp(name,salary,age) values(?,?,?)";
return runner.update(sql,e.getName(),e.getSalary(),e.getAge());
}
```

#### 删除

> 在展示页面中，根据ID进行删除

```java
@WebServlet("/manage/safe/remove")
public class RemoveEmpController extends HttpServlet {
    private EmpService empService = new EmpServiceImpl();
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        int id = Integer.parseInt(req.getParameter("id"));
        int res = empService.deleteById(id); //根据id删除
        System.out.println("删除:"+res);
        resp.sendRedirect(req.getContextPath()+"/manage/safe/show");
    }
}
```

```java
//DAO层的删除操作
@Override
public int deleteById(int id) throws SQLException {
    String sql = "delete from emp where id=?";
    return runner.update(sql,id);
}
```

> 细节： 项目中何时使用重定向？什么场景使用转发？
>
> 增删改倾向于使用重定向；如果使用了转发，DML操作后的url路径保留的，如果刷新，则会出现异常
>
> 查询倾向于使用转发； 因为查询后往往回传到前端展示数据，一般使用request+转发

### 二、修改

#### 展示修改数据

> 根据传入的ID，返回修改记录

```java
@WebServlet("/manage/safe/showEmp")
public class UpdateShowController extends HttpServlet {
    private EmpService empService = new EmpServiceImpl();
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        int id = Integer.parseInt(req.getParameter("id"));
        Emp emp = empService.selectById(id);
        System.out.println("emp--->"+emp);
        req.setAttribute("emp",emp);
        req.getRequestDispatcher("/showOne.jsp").forward(req,resp);
    }
}
```

> 在JSP中显示内容

```jsp
<%
//获取后端存的属性值
Emp emp = (Emp) request.getAttribute("emp");
%>
<form action="<%=request.getContextPath()%>/manage/safe/update">
    <%-- 编号不可变更，要么设置为只读，要么隐藏该控件 --%>
    编号:<input type="text" name="id" value="<%=emp.getId()%>" readonly><br>
    姓名:<input type="text" name="name" value="<%=emp.getName()%>"><br>
    工资:<input type="text" name="salary" value="<%=emp.getSalary()%>"><br>
    年龄:<input type="text" name="age" value="<%=emp.getAge()%>"><br>
    <input type="submit" value="修改">
</form>
```

#### 修改完成

```java
//DAO层的修改操作
@WebServlet("/manage/safe/update")
public class UpdateController extends HttpServlet {
    private EmpService empService = new EmpServiceImpl();
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        //获取前端参数
        int id = Integer.parseInt(req.getParameter("id"));
        String name = req.getParameter("name");
        //将String类型的值，转double和int
        double salary = Double.parseDouble(req.getParameter("salary"));
        int age = Integer.parseInt(req.getParameter("age"));
        int res = empService.updateEmp(new Emp(id,name,salary,age));
        System.out.println("修改:"+res);
        resp.sendRedirect(req.getContextPath()+"/manage/safe/show");
    }
}
```

```java
@Override
public int updateEmp(Emp e) throws SQLException {
    String sql = "update emp set name=?,salary=?,age=? where id=?";
    return runner.update(sql,e.getName(),e.getSalary(),e.getAge(),e.getId());
}
```

### 三、JSP扩展

#### 封装原理

> JSP是Servlet的高级封装，如何进行封装的？ 访问jsp文件时，jsp文件解析成servlet的代码，在里面有service方法。
>
> <% %>: 将里面的java代码解析成service方法体的内容
>
> <%=变量%>: 将里面的变量解析成service方法体的打印输出语句中。
>
> 例如，解析到此打印中：System.out.println(变量);

#### 静态与动态包含

```jsp
<%-- 静态包含：两个页面合为一个   弊端：如果两个页面中定义了相同的变量，则会奔溃 --%>
<%--<%@include file="include.jsp"%>--%>

<%-- 动态包含: 逻辑上面的包含，仍然有两个页面，
    只是在index.jsp中通过方法调用形式，将另一个页面的内容抓取
    优势：不会出现两个页面中定义变量重名问题    结论：优先选择动态包含
    --%>
<jsp:include page="include.jsp"></jsp:include>
```

### 四、EL表达式

#### 概述

> 描述：el表达式用于替换jsp中的getAttribute的用法
>
> 取值方式：${key}
>
> 取值范围：el表达式可以从request，session，context取值；优先级是request>session>context

#### 使用

```jsp
<%--EL表达式的使用--%>
<%
request.setAttribute("name","zs");  //使用request存值
session.setAttribute("name","ls");
session.setAttribute("age",33);  //使用session存值

/* el表达式获取对象及集合 */
Emp emp = new Emp(1,"zs",30000,35);
request.setAttribute("emp",emp);  //存对象
//取值：${obj.属性名}

List<Emp> list = new ArrayList<>();
list.add(new Emp(1,"zs",30000,35));
request.setAttribute("emps",list);  //存集合
%>
${name}<br>
${age}<br>
${emp.age}<br>
${emp.age+1}<br> <%-- el表达式的运算 --%>
${emps[0].name}<br> <%-- emps[0]:取集合的元素 --%>

<%-- 隐式对象获取上下文路径 --%>
<%=request.getContextPath()%><br>
${pageContext.request.contextPath}<br>
```

### 五、JSTL

#### 概述

> JSTL：JSP的标准标签库：提供了与java相关的库资源
>
> JSTL主要提供了核心库与格式库(还有不常用的函数库)供我们使用，可以非常方便的完成java应用
>
> 核心库：提供了在JSP中处理流程控制操作：if，循环等
>
> 格式库：提供了相关格式转换操作：例如-日期格式，小数保留位数
>
> EL表达式一般不会直接独立使用，而是结合JSTL一起使用

#### 应用

```jsp
<%-- JSTL应用：需要导入两个包：jstl.jar,standard.jar --%>
<%--  导入核心库  prefix：使用前缀  uri：导入库--%>
<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%
request.setAttribute("score",66);
%>

<%-- if单分支：if；双分支，多分支: choose--%>
<%-- test="": test中的el表达式成立，则执行基本值；否则不执行 --%>
<c:if test="${score>=60}">及格</c:if><br>

<%-- 成立则执行when的基本值； 不成立则执行otherwise的基本值--%>
<c:choose>
    <c:when test="${score>=80}">优秀</c:when>
    <c:when test="${score>=60}">及格</c:when>
    <c:otherwise>不优秀</c:otherwise>
</c:choose>

<%-- 循环 --%>
<c:forEach items="${emps}" var="emp">
    ${emp.id}--${emp.name}--${emp.age}
</c:forEach>
```

### 六、总结与作业

#### 总结

```
1.添加与删除修改功能（重点）
添加和修改的参数-传对象；删除-传id；修改时展示对象-传id，返回对象
重定向-增删改；转发-查询
2.JSP的扩展
封装原理-访问jsp解析成servlet，里面有内置对象；java代码都解析到service方法中
静态与动态包含：动态-逻辑包含；静态-物理包含；优先选动态包含
3.EL表达式（重点）
用户替换jsp中的getAttribute
使用：取普通值，取对象，取集合--${取值}
4.JSTL
概述-标准标签库；核心库-做流程控制
EL+JSTL综合使用（重点）
```

#### 作业

```
1.将综合案例的<%%>方式变为EL+JSTL的方式
2.回顾前端、jdbc、web的结合应用； 再预习下周的项目流程
```

