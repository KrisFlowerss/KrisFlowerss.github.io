---
title: MyBatis关联查询
Date: 2023-09-28
Categories:
- Java
tags:
- Maven
- MyBatis
---

# MyBatis关联查询

### 一、ORM映射

> 查询的字段值自动映射到User属性中，实体属性和字段名要一致如果不一致，则不能自动映射，需要手动关联。手动映射的方式有两种：1. 改别名  2.结果映射配置

#### 别名映射

> 当表字段与实体属性不一致时，使用别名映射方式。

> 表字段设计：

```mysql
create table manager(
	mgr_id int primary key auto_increment,
  mgr_name VARCHAR(20),
  mgr_pwd varchar(20)
);
insert into manager(mgr_name,mgr_pwd) values('zs','123');
insert into manager(mgr_name,mgr_pwd) values('ls','333');
```

> 实体类：Manager

```
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Manager {
    private  Integer id;
    private  String name;
    private  String pwd;
}
```

```mysql
#当表字段与实体属性不一致，Mapper文件中无法ORM自动映射，1.需改别名：
select mgr_id id,mgr_name name,mgr_pwd pwd from manager where mgr_id=#{id}
```

#### 结果映射

```xml
<!--
      2.结果映射
      id:标记名  type:返回值类型
      子标签id：主键映射  里面对应：属性与字段映射
      子标签result：非主键标签的映射  里面对应：属性与字段映射
    -->
<resultMap id="rm" type="manager">
    <id property="id" column="mgr_id"></id>
    <result property="name" column="mgr_name"></result>
    <result property="pwd" column="mgr_pwd"></result>
</resultMap>
<select id="selectByManagerId" resultMap="rm">
    select * from manager where mgr_id=#{id}
</select>
```

### 二、关联查询

> 关于多张表的查询，需要匹配关联查询的SQL语句；同时数据ORM映射到实体类中时，也需要建立实体间的关联关系（一个实体中包含另一个实体或集合）
>
> 关联关系有三种关系：一对一、一对多，多对多

#### 一对一

> 例如：旅客表与护照表之间就是一对一关系，一个旅客对应一张护照；同时也可以进行反向关联：一张护照对应一个旅客。往往只需要写正向关联即可。（反向一对一）

> 表设计与实体类

```mysql
create table t_passengers(
	  id int PRIMARY key auto_increment,
    name VARCHAR(20),
    sex  VARCHAR(6),
		birthday DATE
);

insert into t_passengers(id,name,sex,birthday) values(1001,'eric','man',NOW());
insert into t_passengers(id,name,sex,birthday) values(1002,'jack','man',NOW());
insert into t_passengers(id,name,sex,birthday) values(1003,'marry','woman',NOW());

create table t_passports(
		id int PRIMARY key auto_increment,
		nationality VARCHAR(20),
	  expire  date,
    passenger_id INT UNIQUE 
);

insert into t_passports(id,nationality,expire,passenger_id) values(1000001,'china','1990-11-11',1001);
insert into t_passports(id,nationality,expire,passenger_id) values(1000002,'america','2020-12-31',1002);
insert into t_passports(id,nationality,expire,passenger_id) values(1000003,'korea','1990-05-01',1003);
```

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Passenger {
    private  Integer id;
    private  String name;
    private  String sex;
    private Date birthday;

    private Passport passport;  //旅客关联护照：正向一对一
}
```

> 旅客的DAO接口

```java
public interface PassengerDao { //旅客接口
    //根据旅客id查询对象，旅客中包含护照信息：一对一
    public Passenger selectByPassengerId(Integer id);
}
```

> Mapper文件：

```xml
mapper namespace="com.qf.dao.PassengerDao">
    <!--  结果映射中，一对一关系都用association
         javaType:对一关系的类型匹配  如果两张表有相同字段，则需改别名，否则数据注入混乱
    -->
    <resultMap id="rm" type="passenger">
        <id property="id" column="id"></id>
        <result property="name" column="name"></result>
        <result property="sex" column="sex"></result>
        <result property="birthday" column="birthday"></result>
        <association property="passport" javaType="passport">
            <id property="id" column="pid"></id>
            <result property="nationality" column="nationality"></result>
            <result property="expire" column="expire"></result>
            <result property="passenger_id" column="passenger_id"></result>
        </association>
    </resultMap>
    <select id="selectByPassengerId" resultMap="rm">
        select pg.id,pg.name,pp.id pid,pp.expire from t_passengers pg INNER JOIN
        t_passports pp on pg.id=pp.passenger_id and pg.id=#{id};
    </select>
</mapper>
```

#### 一对多

> 例如：一个部门对应多个员工；一个部门ID可查询多条员工记录；同时也可以进行反向关联：一个员工查询一条部门记录（反向一对一）

> 表设计与实体类：

```
create table t_departments(
	id int primary key auto_increment,
	name varchar(50),
  location VARCHAR(100)
);

create table t_employees(
	id int PRIMARY key auto_increment,
	name varchar(50),
	salary double,
  dept_id int
);

insert into t_departments values(1,'教学部','北京'),(2,'研发部','上海');
insert into t_employees values(1,'zs',12000,1),(2,'ls',15000,1),(3,'ww',16000,2),(4,'zl',14000,2);
```

> 实体类：

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Department {
    private  Integer id;
    private  String name;
    private  String location;

    //部门与员工一对多关系
    private  List<Employee> list;
}
```

> 部门DAO的接口：

```java
public interface DeptmentDao {
    //根据部门Id查询部门实体，里面包含员工集合--一对多
    public Department selectByDeptId(Integer id);
}
```

> Mapper文件中的实现：

```xml
<mapper namespace="com.qf.dao.DeptmentDao">
    <!-- 一对多关系：collection  固定搭配ofType
         ofType：类型  员工类型：employee
     -->
    <resultMap id="rm" type="department">
        <id property="id" column="id"></id>
        <result property="name" column="name"></result>
        <collection property="list" ofType="employee">
            <id property="id" column="eid"></id>
            <result property="name" column="ename"></result>
        </collection>
    </resultMap>
    <select id="selectByDeptId" resultMap="rm">
        select d.id,d.name,e.id eid,e.name ename from t_departments d
        INNER JOIN t_employees e on d.id=e.dept_id where d.id=#{id}
    </select>
</mapper>
```

#### 多对多

> 例如：学生和课程的关系；一个学生可以上多门课程；同时也可以进行反向关联：一门课程有多个学生上课（反向一对多）

> 表的设计：

```mysql
create table student(
	id INT PRIMARY key auto_increment,
  name varchar(30),
  sex  varchar(20)
);

insert into student(id,name,sex) values(1001,'tom','woman');
insert into student(id,name,sex) values(1002,'jack','woman');
insert into student(id,name,sex) values(1003,'marry','man');
insert into student(id,name,sex) values(1004,'annie','man');

create table subject(
	id INT PRIMARY key auto_increment,
	name VARCHAR(30),
	grade VARCHAR(20)
);

insert into subject(id,name,grade) values(10,'JavaSE','1');
insert into subject(id,name,grade) values(20,'H5','2');
insert into subject(id,name,grade) values(30,'C++','3');
insert into subject(id,name,grade) values(40,'UI','4');

create table stu_sub(
	student_id int,
  subject_id int
);

insert into stu_sub(student_id,subject_id) values(1001,10);
insert into stu_sub(student_id,subject_id) values(1001,20);
insert into stu_sub(student_id,subject_id) values(1002,10);
insert into stu_sub(student_id,subject_id) values(1003,10);
```

> 实体类：

```java
@NoArgsConstructor
@AllArgsConstructor
public class Student {
    private  Integer id;
    private  String  name;
    private  String  sex;

    //学生关联课程表为一对多（正向）；反向也是一对多，最终就是多对多
    private List<Subject> subjects;
}
```

> StudentDao接口

```java
public interface StudentDao {
    //根据学生id关联课程的集合
    public Student selectByStuId(Integer id);
}
```

> Mapper文件配置：

```xml
<mapper namespace="com.qf.dao.StudentDao">
    <!-- 一对多：collection  固定ofType：类型-->
    <resultMap id="rm" type="student">
        <id property="id" column="id"></id>
        <result property="name" column="name"></result>
        <collection property="subjects" ofType="subject">
            <id property="id" column="sid"></id>
            <result property="name" column="sname"></result>
        </collection>
    </resultMap>
    <!-- 三表关联查询 -->
    <select id="selectByStuId" resultMap="rm">
        select st.id,st.name,sb.id sid,sb.name sname
        from student st INNER JOIN stu_sub ss ON st.id=ss.student_id
        INNER JOIN subject sb on ss.subject_id=sb.id and st.id=#{id}
    </select>
</mapper>
```

### 三、动态SQL

> 在基础的SQL语句中增加逻辑判断，使得程序的维护性更强，复用性更强；例如：查询前面SQL语句重复性太大，可抽取出去进行复用；查询匹配条件，要判断多个条件非常繁琐，使用动态SQL，可灵活变更SQL。

#### 查询复用

```xml
<sql id="aa">select * from user where id=#{id}</sql>
<!-- 查询的字段值自动映射到User属性中，实体属性和字段名要一致
     如果不一致，则不能自动映射，需要手动关联-->
<select id="selectById" resultType="user">
    <include refid="aa"/>
</select>

<select id="selectByIdAndPwd" resultType="user">
    <include refid="aa"/> and password=#{pwd}
</select>
```

#### 查询匹配

> 需要使用where标签进行操作
>
> while标签的作用：
>
> 1.可根据SQL规则添加或忽略where关键字
>
>  2.可根据SQL规则添加或忽略and|or关键字

```xml
<select id="selectByIdAndPwd" resultType="user">
    select * from user
    <where>
        <if test="id!=null">
            id=#{id}
        </if>
        <if test="pwd!=null">
            and password=#{pwd}
        </if>
    </where>
</select>
```

### 四、总结与作业

#### 总结

```
1.ORM映射（重点）
手动映射方式-别名、结果映射
2.关联查询（重点）
多表查询-orm映射到实体(关联关系)
一对一、一对多、多对多
重点关注：mapper文件的映射；实体类中的包含关系
3.动态SQL（重点）
在基本SQL语句中加逻辑判断；维护性更强，复用性更强
sql标签（复用），where标签（维护性）
```

#### 作业

```
1.部门表与员工表的反向关联查询；员工与部门一对一关系
2.学生表与课程表的反向关联查询；课程与学生一对多关系
```

