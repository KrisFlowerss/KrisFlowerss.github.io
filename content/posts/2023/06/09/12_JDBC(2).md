---
title: JDBC
Date: 2023-09-06
Categories:
- Java
tags:
- JDBC
---



# JDBC

### 一、权限管理

> 创建一个用户，并指定好操作权限（增删改查权限）

```mysql
#权限管理
#创建用户
create user 'zs' IDENTIFIED by '123';

#给用户分配权限
GRANT ALL ON mydb1.* to 'zs'; 

#撤销用户权限
REVOKE ALL ON mydb1.* from 'zs';

#删除用户 zs
drop user 'zs';
```

### 二、视图

#### 概述

> 视图就是一张虚拟表；从原表中抽取出来的虚拟表； 关于虚拟表的操作，也会联动的改变原表
>
> 好处：
>
> 1.屏蔽了原表的重要数据，提升安全性
>
> 2.当需要从多表中提取数据时，使用视图可以提升性能
>
> 缺点：
>
> 1.单表的操作，会变得复杂（增删改的操作要联动原表）
>
> 2.复杂的视图是无法被修改的  例如：聚合函数形成的视图

#### 应用

```mysql
#视图操作：
#创建视图 创建 t_emp 的视图，其视图从 t_employees 表中查询到员工编号、员工姓名、员工邮箱、工资
create view t_emp as select employee_id,first_name,email,salary from t_employees;

#视图的操作，与原表一致的；且会联动改变原表
select * from t_emp;
select * from t_employees;

update t_emp set salary=30000 where employee_id=100;

#修改视图
#方式1：创建或替换视图   存在则替换，不存在则创建
create or REPLACE view t_emp as select employee_id,salary from t_employees;

#方式 2：直接对已存在的视图进行修改
alter view t_emp as select employee_id,first_name,email,salary from t_employees;

#删除t_emp视图
drop view t_emp;

#视图的注意事项：如果视图是聚合函数或分组形成的，则不能变更
create  view emp as select count(*) as count from t_employees;
select * from emp;
update emp set count=5;
```

### 三、SQL分类与综合练习

#### SQL语言分类

> - 数据查询语言DQL（Data Query Language）：select、where、order by、group by、having 。
>
> - 数据定义语言DDL（Data Definition Language）：create、alter、drop。
>
> - 数据操作语言DML（Data Manipulation Language）：insert、update、delete 。
>
> - 事务处理语言TPL（Transaction Process Language）：commit、rollback 。
>
> - 数据控制语言DCL（Data Control Language）：grant、revoke。

#### 综合案例

```mysql
#查询所有用户的订单
select * from user u INNER JOIN orders o ON u.userId=o.userId;

#查询用户id为 1 的所有订单详情
select * from user u INNER JOIN orders o ON u.userId=o.userId
inner JOIN orderitem oi ON o.oid=oi.oid and u.userId=1;

#查看用户为张三的订单
#先查用户张三的userid
select userId from user where username='张三';
#再匹配userID为1的订单
select * from orders where userId = (select userId from user where username='张三');


#查询出订单的价格大于800的所有用户信息。
#先查询订单大于800的userId
select DISTINCT userId from orders where totalprice>800;
#再使用枚举查询
select * from user where userId in (select DISTINCT userId from orders where totalprice>800);
```

### 四、JDBC概述

#### 引言

> 前面的操作，不管是通过DOS还是navicat操作数据库，都是特别麻烦的，特别频繁的复制型的操作
>
> 如果使用java代码（软件）去操作数据库，则只需要触发一个指令，内部即可联动性的循环操作SQL语句

#### JDBC概述

> 连接数据库的一套标准，只需要数据库产品提供驱动，java代码即可连上数据库

#### 使用JDBC

> 先将驱动放入项目中，添加到库，即可使用驱动
>
> mysql的驱动选择： mysql-connector-java-8.0.X  适用于 8.X版本
>
> 编写JDBC操作步骤

#### JDBC操作步骤

> 1.加载驱动
>
> 2.获取连接对象
>
> 3.创建执行对象
>
> 4.执行SQL语句
>
> 5.返回结果  查询则返回结果集  DML则返回影响条数
>
> 6.关闭数据库

### 五、安装IDEA工具

#### 安装

> 按照安装文档一步步安装；如果之前安装过，可以替换版本

#### 破解

> 默认30天有效，需要进行破解，按照文档进行

#### 配置

> 设置字体大小、编码、编译版本等
>
> 基本都是在File->Settings下进行配置

### 六、应用案例

#### DML操作

```java
//案例：增删改t_jobs数据
Connection conn = null;
Statement st = null;
try {
    //1.加载驱动
    Class.forName("com.mysql.cj.jdbc.Driver");
    //2.通过驱动管理器获取连接对象
    conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/mydb1?serverTimezone=UTC", "root", "123");
    //3.创建执行对象
    st = conn.createStatement();
    //添加
    //String sql = "insert into t_jobs values('MY_IT','IT_1',10000,25000)";
    //修改
    //String sql = "update t_jobs set min_salary=20000 where job_id='MY_IT'";
    //删除
    String sql = "delete from t_jobs where job_id='IT_PROG'";
    //4.执行SQL操作   5.返回影响条数
    int res = st.executeUpdate(sql);
    System.out.println("执行update："+res);
}catch (Exception e){
    e.printStackTrace();
}finally {
    //关闭数据库的接口为AutoCloseable
    DBUtils.closeAll(st,conn);  //统一资源关闭
}
```

> 统一数据库资源关闭

```java
public static void closeAll(AutoCloseable...ac){
    for(AutoCloseable a:ac){
        if(a!=null){
            try {
                a.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
```

#### DQL操作

```java
//案例：查询t_jobs数据
Connection conn = null;
Statement st = null;
ResultSet rs = null;
try {
    //1.加载驱动
    Class.forName("com.mysql.cj.jdbc.Driver");
    //2.通过驱动管理器获取连接对象
    conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/mydb1?serverTimezone=UTC", "root", "123");
    //3.创建执行对象
    st = conn.createStatement();
    String sql = "select * from t_jobs";
    rs = st.executeQuery(sql); //返回结果集--存储记录的集合
    while(rs.next()){ //结果集遍历--类似迭代器操作
        //参数为字段的字符串； 当获取聚合函数值，可使用整数标记
        String job_id = rs.getString("job_id");
        String job_title = rs.getString("job_title");
        String min_salary = rs.getString("min_salary"); //alt+enter
        String max_salary = rs.getString("max_salary");
        System.out.println(job_id+"--"+job_title+"--"+min_salary+"--"+max_salary);
    }
}catch (Exception e){
    e.printStackTrace();
}finally {
    //关闭数据库的接口为AutoCloseable
    DBUtils.closeAll(rs,st,conn);  //统一资源关闭
}
```

#### 整理报错异常

> 1. 主键约束失败-重复添加主键值（常见）  Duplicate entry 'MY_IT' for key 't_jobs.PRIMARY'
> 2. 没到驱动包或驱动名写错（常见）           ClassNotFoundException: com.mysql.cj.jdbc.Driv
> 3.  url写错了                                      SQLException: No suitable driver found for jdbc:my://...
> 4.  用户名或密码写错                       SQLException: Access denied for user 'root'@'localhost'
> 5.  数据库名写错了                           SQLSyntaxErrorException: Unknown database '666'
> 6.  sql语句异常（常见）                  SQLSyntaxErrorException: You have an error in your SQL syntax
> 7.  获取的字段名写错                       SQLException: Column 'job_i' not found

### 七、综合案例

#### 创建表

> - 创建一张用户表 User
>   - id ，主键、自动增长。
>   - 用户名，字符串类型，唯一、非空
>   - 密码，字符串类型，非空
>   - 手机号码，字符串类型
> - 插入 2 条测试语句

#### 实现登录

> - 通过控制台用户输入用户名和密码。
> - 用户输入的用户名和密码作为条件，编写查询 SQL 语句。
> - 如果该用户存在，提示登录成功，反之提示失败。

#### 登录应用

```java
public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    System.out.print("请输入用户名:");
    //next则字符串空格则结束  nextLine允许有空格，例如“zs f”是一个用户名
    String username = sc.nextLine();
    System.out.print("请输入密码:");
    String password = sc.nextLine();
    if(login(username,password)){ //调用登录功能
        System.out.println("登录成功~~！");
    }else{
        System.out.println("登录失败~~！");
    }
}
private static boolean login(String username, String password) {
    Connection conn = null;
    Statement  st   = null;
    ResultSet  rs   = null;
    try {
        Class.forName("com.mysql.cj.jdbc.Driver");
        //2.通过驱动管理器获取连接对象
        conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/mydb1?serverTimezone=UTC", "root", "123");
        //3.创建执行对象
        st = conn.createStatement();
        String sql = "select count(*) from user where username='"+username+"' and password='"+password+"'";
        rs = st.executeQuery(sql);
        if(rs.next()){
            //rs.getInt(1):获取第一个字段 count(*)字段   聚合函数：0或大于0
            return rs.getInt(1)>0;
        }
    }catch (Exception e){
        e.printStackTrace();
    }finally {
        DBUtils.closeAll(rs,st,conn);
    }
    return false;
}
```

### 八、总结与作业

#### 总结

```
1.权限管理
创建用户，分配权限
2.视图
概述-虚拟表、好处，弊端、应用
3.SQL分类与综合练习
SQL分类-sql术语、综合案例-多表查询，子查询等应用
4.JDBC概述（重点）
引言-DOS、navicat不方便操作数据库；引出通过java代码操作数据库
JDBC概述-标准、使用JDBC-导包
JDBC操作步骤-6个
5.IDEA安装
6.应用案例（重点）
DML操作、DQL操作-JDBC操作步骤、整理报错异常
7.综合案例（重点）
登录功能-创建表，登录分析，具体实现
```

#### 作业

```
1.创建admin表
- id ，主键、自动增长。
- username，字符串类型，唯一、非空
- password，字符串类型，非空
- sex，字符串类型，非空
- love，字符串类型，非空

注意：以下都是通过JDBC来操作
2.添加zs,ls,ww等3条数据
3.查询全部admin表信息
4.以指定姓名查询
```

#### 晨考

```mysql
晨考：
1.什么是JDBC
Java连接数据库的标准
2.接口Statement中定义的executeQuery方法返回的类型是_集合_ResultSet____; executeUpdate返回的类型是__int____, 代表的含义是__受影响的条数____。
3.JDBC操作步骤：（只写步骤，无需写代码）
1.加载驱动
2.获取连接对象
3.创建执行对象
4.执行sql语句
5.返回结果 查询返回结果集 DML则返回影响条数
6.关闭数据库
4.有emp表,字段为 eno int,ename varchar,esex char,手写新增,修改,删除语句（仅编写sql语句）
insert into emp values(3,'ls','男');
insert into emp values(5,'wwu','男');
update emp set ename ='wu' where eno=5;
delete from emp where eno=3;

```

