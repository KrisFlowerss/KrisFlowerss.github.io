---
title: MySQL基础
Date: 2023-09-04
Categories:
- Java
tags:
- MySQL
---

# MySQL基础

### 一、数据库引入

#### 现有数据存储方式

> 变量、数组、对象、集合、IO流               分类：瞬时存储、永久存储 
>
> 瞬时存储：存储在内存中，程序启动时存在，关闭时消失；              例如：变量、数组、对象、集合
>
> 永久存储：存储在硬盘中，程序关闭类，硬盘文件数据依然存在；  例如：IO流

#### 现有存储弊端

> 存储量级小、可读性差、不安全无权限限制、无备份与恢复机制、 取数据特别麻烦、不方便管理...

### 二、数据库

#### 概述

> 存储和管理数据的仓库；长期存储在计算机中的有组织、有结构的数据的集合；通过库中的多张表进行分类存储

#### 数据库分类

> 关系型数据库：oracle，MySQL，sqlserver,sqlite.. ;有行有列，可进行多表关联查询
>
> 非关系型数据库：redis； 内部通过键值对方式存储； 数据量级比关系型大

### 三、数据库管理系统

#### 概述

> 用于建立、维护、和管理数据的一种产品

#### 常用的管理系统

> Oracle：oracle旗下的数据库产品，一般用在政府机构；收费----20%
>
> MySQL：oralce旗下的数据库产品，市面上常用；免费-------------80%
>
> SQL Server：微软产品   C#中使用该数据库
>
> sqlite： 轻量级的移动端数据库     存通讯数据

#### MySQL安装

> 两种安装方式：
>
> 1.图形化方式-可读性强，但容易出错，卸载麻烦  
>
> 2.文本指令方式-安装不容易出错，容易卸载（推荐）

#### SQL指令

> 概述：结构化查询语言； 用于对数据的增删改查操作
>
> 应用：编写指令，在最后加上；表示指令的结束
>
> 数据库操作指令如下：

```mysql
show databases;   #查询数据库
create database mydb2 character set gbk;   #创建数据库并设置编码格式为gbk
SHOW CREATE DATABASE mydb2; #查看创建数据库时的基本信息
DROP DATABASE mydb1; #删除数据库mydb1
select database(); #查看当前使用的数据库
USE mydb1; #使用mydb1数据库
```

#### 客户端工具

> 访问数据库的两种方式：1.DOS指令   2.navicat客户端（推荐）
>
> navicat是图形化客户端工具，可视化操作效果可读性更强

### 四、查询数据

> 概述：数据库的操作，主要是针对表的增删改查操作，最为重点和难点就是查询
>
> 查询之后反馈的结果是一张虚拟表；
>
> 先将数据表导入，然后进行查询

#### 基本查询

> 语法：select  字段  from 表；

```mysql
#1,基本查询   select  字段  from  表;
#查询员工表中所有员工的所有信息（所有列）  ctrl+‘+' 字体变大
select * from t_employees;

#查询员工表中所有员工的编号、名字、邮箱
select employee_id,first_name,email from t_employees;

#对列进行运算：
#查询员工表中所有员工的编号、名字、年薪
select employee_id,first_name,salary*12 from t_employees;

#对列取别名  as
#查询员工表中所有员工的编号、名字、年薪（列名均为中文）
select employee_id,first_name as '姓名',salary*12 '年薪' from t_employees;

#去重  distinct
#查询员工表中所有经理的ID。
select DISTINCT manager_id from t_employees;

#排序查询  order by 字段 排序规则(asc|desc)
#查询员工的编号，名字，薪资。按照工资高低进行降序排序。
select employee_id,first_name,salary from t_employees order by salary desc;

#按多列查询  order by 字段 desc,字段 asc(默认)
#查询员工的编号，名字，薪资。按照工资高低进行升序排序（薪资相同时，按照编号进行升序排序）。
select employee_id,first_name,salary from t_employees order by salary,EMPLOYEE_ID;
```

#### 条件查询

> 语法： select 字段  from 表  where 条件;

```mysql
#条件判断： select 字段  from 表 where 条件
#等值判断（=）
#查询薪资是11000的员工信息（编号、名字、薪资）
select employee_id,first_name,salary from t_employees where salary=11000;

#逻辑判断（and、or、not）
#查询薪资是11000并且提成是0.30的员工信息（编号、名字、薪资）
select employee_id,first_name,salary,COMMISSION_PCT from t_employees where salary=11000 and COMMISSION_PCT=0.3;

#不等值判断（> 、< 、>= 、<= 、!= 、<>）
#查询员工的薪资在6000~10000之间的员工信息（编号，名字，薪资）
select employee_id,first_name,salary from t_employees where salary>=6000 and salary<=10000;

# 区间判断（between and）
#查询员工的薪资在6000~10000之间的员工信息（编号，名字，薪资）
select employee_id,first_name,salary from t_employees where salary BETWEEN 6000 and 10000;

#NULL 值判断（IS NULL、IS NOT NULL）
#查询没有提成的员工信息（编号，名字，薪资 , 提成）
select employee_id,first_name,salary,COMMISSION_PCT from t_employees where COMMISSION_PCT is null;

#枚举查询（ IN (值 1，值 2，值 3 ) ）
#查询部门编号为70、80、90的员工信息（编号，名字，薪资 , 部门编号）注：in的查询效率较低，可通过多条件拼接。
select employee_id,first_name,salary,DEPARTMENT_ID from t_employees where DEPARTMENT_ID in(70,80,90);

#模糊查询  like '%' 0个或多个    like '_' 任意一个字符
#查询名字以"L"开头的员工信息（编号，名字，薪资 , 部门编号）
select employee_id,first_name,salary,DEPARTMENT_ID from t_employees where first_name like 'L%';

#查询名字以"L"开头并且长度为4的员工信息（编号，名字，薪资 , 部门编号）
select employee_id,first_name,salary,DEPARTMENT_ID from t_employees where first_name like 'L___';

/*
  分支结构查询: 
	CASE
		WHEN 条件1 THEN 结果1
		WHEN 条件2 THEN 结果2
		WHEN 条件3 THEN 结果3
		ELSE 结果
	END
*/
#查询员工信息（编号，名字，薪资 , 薪资级别<对应条件表达式生成>）
select employee_id,first_name,salary,
(CASE
  WHEN salary>=10000 THEN 'A'
  WHEN salary>=8000 THEN 'B'
  WHEN salary>=6000 THEN 'C'
  WHEN salary>=4000 THEN 'D'
  else 'E'
END) '薪资级别' from t_employees;

```

#### 数据库函数

```mysql
#数据库函数：
#日期函数：
select SYSDATE();   #系统时间
select NOW();       #系统时间
SELECT CURDATE();   #当前日期
select CURTIME();   #当前时间 
select YEAR(NOW()); #获取年份
select DATEDIFF('2023-08-09','2023-07-28');   #两个日期的天数差

#字符串函数
select CONCAT(CURDATE(),' ',CURTIME());  #日期和时间的拼接
select INSERT("helloworld",3,4,'666');   #注意，在数据库中通常下标从1开始
select LOWER('TBD');  #大写转小写
select UPPER('yut');  #小写转大写
select SUBSTRING("helloworld",3,4);  #从下标3的位置截取4个长度  下标从1开始

select upper(first_name),salary from t_employees;  #字符串函数的场景

#聚合函数   max(字段)  min(..) avg(..)  sum(..)  count(..)
#统计所有员工每月的工资总和
select sum(salary) from t_employees;
#统计所有员工每月的平均工资
select avg(salary) from t_employees;
#统计所有员工中月薪最高的工资
select max(salary) from t_employees;
#统计员工总数
select count(*) from t_employees;  #常用  查总条数，包括null的条数
select count(COMMISSION_PCT) from t_employees;  #指定字段的总数，则没有包括null条数
```

#### 分组查询

```mysql
#分组查询
#语法：SELECT 列名 FROM 表名 WHERE 条件  [GROUP BY 分组依据（列）;]

#查询各部门的总人数
#思路：
#1.按照部门编号进行分组（分组依据是 department_id）
select department_id from t_employees group by department_id;
#2.再针对各部门的人数进行统计（count）
select department_id,count(*) from t_employees group by department_id;


#查询各部门的平均工资
#思路：
#1.按照部门编号进行分组（分组依据department_id）。
select department_id from t_employees group by department_id;
#2.针对每个部门进行平均工资统计（avg）。
select department_id,avg(salary) from t_employees group by department_id;

#查询各个部门、各个岗位的人数
#思路：
#1.按照部门编号进行分组（分组依据 department_id）。
select department_id from t_employees group by department_id;
#2.按照岗位名称进行分组（分组依据 job_id）。
select department_id,job_id from t_employees group by department_id,job_id;
#3.针对每个部门中的各个岗位进行人数统计（count）
select department_id,job_id,count(*) from t_employees group by department_id,job_id;


#查询各个部门id、总人数、first_name
#select department_id,count(*),first_name from t_employees group by department_id;   #ERROR

#注意事项：分组查询的字段必须是分组依据列或聚合函数
```

#### 五、总结与作业

#### 总结

```

```

#### 作业

```mysql
#查询员工表指定列的所有信息  (eno,ename,esex,salary)
#给员工表的列取别名  (eno,ename,esex,salary)
#条件查询：查询所有女员工的信息
#使用betteen查询区间信息： 工资在 200000~290000的员工信息
#分组查询各个部门平均工资
#查询所有姓孙的学生信息
#查询名字中包含巴的所有员工信息
#查询姓孙的2个字的所有员工信息
```

