---
title: Spring概述
Date: 2023-10-08
Categories:
- Java
tags:
- Maven
- Spring
---



# Spring概述

### 一、mybatis嵌套查询

#### 嵌套查询

> 与前面的关联查询对立，关联查询一次性查询出关联数据，并注入到关联实体中
>
> 嵌套查询则是分开两条独立的SQL语句进行查询
>
> 案例：部门与员工一对多关系
>
> 关联查询SQL语句：（放到Mapper）
>
> select d.id,d.name,e.id eid,e.name ename from t_departments d 
> INNER JOIN t_employees e on d.id=e.dept_id where d.id=1
>
> 嵌套查询SQL语句：（放到Mapper-两个Mapper文件）
>
> select * from t_departments where id=1
>
> select * from t_employees where dept_id=1

> 实体类：部门的实体包含员工集合

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Dept {
  private Integer id;
  private String name;
  private String location;

  private List<Emp> emps;  //部门中包含员工集合
}
```

> 部门和员工都需要有DAO接口（略）

> 在mapper文件中，需要从部门的Mapper查询的员工Mapper

```xml
<mapper namespace="com.qf.dao.DeptDao">
    <resultMap id="rm" type="dept">
        <id property="id" column="id"></id>
        <result property="name" column="name"></result>
        <result property="location" column="location"></result>
        <!-- 一对多关系：column="id"当前部门的id字段传到员工的方法中作为参数
         select="selectByDeptId"：调用员工的方法-->
        <collection property="emps" ofType="emp" column="id"
                    select="com.qf.dao.EmpDao.selectByDeptId">
        </collection>
    </resultMap>
    <select id="selectByDeptId" resultMap="rm">
        select * from t_departments where id=#{id}
    </select>
</mapper>
```

> 员工Mapper展示：

```xml
<mapper namespace="com.qf.dao.EmpDao">
    <select id="selectByDeptId" resultType="emp">
        select * from t_employees where dept_id=#{id}
    </select>
</mapper>
```

> 结论：嵌套查询的性能没有关联查询的性能高（关联查询一次性查询，嵌套查询是分多次查询--看日志）；所以，通常常用关联查询

#### 懒加载

> 如果嵌套的表，在项目中用不到，则可以不用加载进来；这样可以提升性能； 例如：我们如果不使用员工信息，则可以不用查询员工表。
>
> 在mybatis配置文件中开启懒加载：

```xml
<settings>
		<setting name="lazyLoadingEnabled" value="true"/> <!-- 开启延迟加载（默认false） -->
</settings>
```

```java
DeptDao mapper = MyBatisUtils.getMapper(DeptDao.class);
Dept dept = mapper.selectByDeptId(1);
//设置了懒加载，如果没有用上员工信息，则不会查员工表---提升性能
System.out.println(dept.getName());
```

### 二、Spring概述

#### 概述

> 处在业务层的框架，但是可以做一些控制层和DAO层的整合的事情；主要的功能就是整合
>
> 原生的WEB开发的问题：
>
> 存在过度耦合：
>
> 例如：控制层实例化业务层对象；业务层实例化DAO层对象；有了Spring后，就无需再实例化
>
> Spring是一种非入侵式，移植性强的一种框架

#### Spring能做什么

> Spring从功能角度出发，可以做以下事情：
>
> 1. 整合单元测试
> 2. 通过核心工厂产生bean对象（new出来的对象)（工厂模式）
> 3. 面向切面编程(AOP)，与事务，过滤器等相关（接口回调-代理模式）
> 4. 整合DAO层的资源（包括mybatis配置都可整合到Spring中）
> 5. 整合SpringMVC控制层资源

### 三、容器工厂

#### 自定义工厂

> 模拟Spring工厂的实现，从工厂中获取bean对象
>
> 配置文件：

```properties
userService=com.qf.a_factory.UserServiceImpl
userDao=com.qf.a_factory.UserDaoImpl
```

> 工厂的应用：

```java
public class Factory {
    private Properties p = new Properties();
    public Factory(String config){
        //加载配置文件数据到Properties中
        try {
            InputStream is = Factory.class.getResourceAsStream(config);
            p.load(is);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    public Object getBean(String key){
        try {
            String path = p.getProperty(key);
            Class c = Class.forName(path);
            return c.newInstance();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
```

> 测试：

```java
public static void main(String[] args) {
    //在表示层(控制层)直接new业务层对象，耦合性太强
    //UserService userService = new UserServiceImpl();
    Factory factory = new Factory("/user.properties");
    UserService userService = (UserService) factory.getBean("userService");
    userService.addUser();
}
```

#### spring工厂

> 通过Spring的核心工厂产生各种bean对象
>
> 导入依赖包：

```xml
<!-- Spring常用依赖 -->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context</artifactId>
    <version>5.1.6.RELEASE</version>
</dependency>
```

> 创建spring配置文件（bean工厂）--bean.xml

```xml
<!-- 产生bean对象  id:标记名  class：具体实现类-->
<bean id="us" class="com.qf.a_factory.UserServiceImpl"></bean>
```

> Spring测试：

```java
public static void main(String[] args) {
    //获取上下文对象--相当于实例化工厂对象
    ApplicationContext context = new ClassPathXmlApplicationContext("bean.xml");
    //根据匹配的ID标记，取出bean对象
    UserService us = (UserService) context.getBean("us");
    us.addUser();  //调用业务层的方法
}
```

#### 配置详解

> 我们引入了spring的context包，即可将相关的依赖包引入。
>
> 注意：Jar包彼此存在依赖，只需引入最外层Jar即可由Maven自动将相关依赖Jar引入到项目中。

### 四、IOC控制反转

> 将自身直接实例化的方式，转为由第三方(Spring容器)进行实例化
>
> 案例：根据三层架构的案例进行IOC的配置

> 在业务层引入DAO对象，编写SET方法，通过Spring容器注入bean

```java
public class UserServiceImpl implements UserService {
    //需要进行解耦合：IOC-所有bean都交给spring完成
    private UserDao userDao; //= new UserDaoImpl();

    public void setUserDao(UserDao userDao) { 
        this.userDao = userDao;
    }
    @Override
    public int addUser() {
        System.out.println("调用业务层的addUser");
        userDao.add();
        return 0;
    }
}
```

> Spring工厂中引入bean

```xml
<!-- 产生bean对象  id:标记名  class：具体实现类
        ref="ud" 代表引入bean对象   value=""只是值的注入
        name=""  setName方法名首字母小写
    -->
<bean id="us" class="com.qf.a_factory.UserServiceImpl">
    <property name="userDao" ref="ud"></property>
</bean>
<!-- IOC：dao对象需要引入到业务层，充当业务层属性 -->
<bean id="ud" class="com.qf.b_dao.UserDaoImpl"></bean>
```

### 五、DI依赖注入

> DI与IOC类似，只不过IOC是bean对象的注入，DI是基于属性的赋值。

#### SET注入

> 实体类：

```
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private Integer id;
    private String password;
    private String sex;
    private Integer age;
    private Date bornDate;
    private String[] hobbys;
    private Set<String> phones;
    private List<String> names;
    private Map<String,String> countries;
    private Properties files;
}
```

> spring容器的配置：

```xml
    <!-- User的实体bean  DI注入  set注入-->
    <bean id="user" class="com.qf.c_entity.User">
        <property name="age" value="30"></property>
        <property name="id" value="11"></property>
        <property name="password" value="123"></property>
        <property name="sex" value="man"></property>
        <property name="bornDate" value="2023/08/09" /><!--注意格式"/"-->

        <!-- 容器的属性注入 -->
        <property name="hobbys">
            <array>
                <value>吃</value>
                <value>喝</value>
                <value>玩</value>
            </array>
        </property>

        <property name="names">
            <list>
                <value>张三丰</value>
                <value>张无忌</value>
            </list>
        </property>

        <property name="phones">
            <set>
                <value>1333333</value>
                <value>1444444</value>
                <value>1555555</value>
            </set>
        </property>
        <property name="countries">
            <map>
                <entry key="a" value="111"></entry>
                <entry key="b" value="222"></entry>
                <entry key="c" value="333"></entry>
            </map>
        </property>

        <property name="files">
            <props>
                <prop key="aaa">张三</prop>
                <prop key="bbb">李四</prop>
            </props>
        </property>
    </bean>
```

### 六、总结

```
1.mybatis嵌套查询
与关联查询的区别；懒加载-没用到嵌套表数据则可以不查询
2.Spring概述（重点）
整合框架；功能-单元测试，容器，AOP，整合控制层和DAO层
3.容器工厂
自定义工厂-模拟编写Spring的工厂；Spring工厂的配置（重点）
4.IOC控制反转（重点）
由Spring容器产生bean对象
5.DI依赖注入（重点）
基于bean对象的属性设置； SET注入
```

