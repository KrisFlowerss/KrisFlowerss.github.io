---
title: Spring整合MyBatis
Date: 2023-10-10
Categories:
- Java
tags:
- MyBatis
- Spring
---

# Spring整合MyBatis

### 一、后处理器

#### 概述

> Spring的AOP应用中，会产生处理后处理器的代理对象，我们可以通过debug调试得到该Aspectware..对象。
>
> 该对象可以在产生bean完成之前做一些再加工处理的操作。

#### 自定义后处理器

> Spring的AOP中会产生动态代理对象去调用后处理器方法；我们也可以自定义一个后处理器的类；同样可以完成AOP的触发过程。
>
> 生命周期：后处理器的触发执行，在init方法的前后
>
> 构造方法->SET->后处理器前->init->后处理器后->bean完成->销毁

```java
public class MyBeanPostProcessor implements BeanPostProcessor {
    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        System.out.println("后处理器 在init之前执行~~~"+bean.getClass());
        return bean;
    }

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        System.out.println("后处理器 在init之后执行~~~"+bean.getClass());
        return bean;// 此处的返回是 getBean() 最终的返回值
    }
}
```

> 注意：需要将后处理器的bean放到spring容器

#### 动态代理源码（了解）

> 在Spring的AOP过程中，搜索AbstractAutoProxyCreator类，里面提供了产生动态代理对象的后处理器的执行过程，判断缓存里面有没有代理的bean，如果没有，则创建动态代理的bean。

### 二、Spring整合MyBatis

#### 导包

> 导入依赖包，及引入完整的容器配置，需要将tx事务相关的文件引入

```xml
<!-- Spring常用依赖 -->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context</artifactId>
    <version>5.1.6.RELEASE</version>
</dependency>

<!-- aop包-->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-aspects</artifactId>
    <version>5.1.6.RELEASE</version>
</dependency>

<!-- spring的包 -->
<dependency>
    <groupId>org.mybatis</groupId>
    <artifactId>mybatis</artifactId>
    <version>3.4.6</version>
</dependency>

<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.28</version>
</dependency>

<!-- Druid连接池包 -->
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid</artifactId>
    <version>1.1.10</version>
</dependency>
<!-- spring-jdbc -->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-jdbc</artifactId>
    <version>5.1.6.RELEASE</version>
</dependency>

<!-- spring+mybatis集成依赖 -->
<dependency>
    <groupId>org.mybatis</groupId>
    <artifactId>mybatis-spring</artifactId>
    <version>1.3.1</version>
</dependency>
```

#### DAO测试

> 先从DAO层测试开始，将mybatis相关bean交给spring容器完成。
>
> 创建DAO接口与Mapper文件。

```xml
<!-- 数据库配置的引入 -->
<context:property-placeholder location="classpath:db.properties"></context:property-placeholder>
<!-- 类似mybatis配置文件中的数据源的引入 -->
<bean id="dataSource" class="com.alibaba.druid.pool.DruidDataSource" init-method="init" destroy-method="close">
    <!--基本配置-->
    <property name="driverClassName" value="${jdbc.driver}"/>
    <property name="url" value="${jdbc.url}"/>
    <!-- 注意：不要直接使用${username}和${password}因为会读到系统的账户 -->
    <property name="username" value="${jdbc.username}"/>
    <property name="password" value="${jdbc.password}"/>
</bean>
<!-- 产生SQLSessionFactory的bean -->
<bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
    <!-- 将上面的数据源引入到SqlSessionFactoryBean的工厂中 -->
    <property name="dataSource" ref="dataSource"></property>
    <!-- 注册Mapper文件 -->
    <property name="mapperLocations">
        <list>
            <value>classpath:mapper/*.xml</value>
        </list>
    </property>
    <!-- 取别名 -->
    <property name="typeAliasesPackage" value="com.qf.b_project.entity"></property>
</bean>
<!-- 产生UserDao的bean -->
<bean class="org.mybatis.spring.mapper.MapperScannerConfigurer">
    <!--产生DAO接口下的实现类的对象(bean方式)  id为接口首字母小写
            <bean id="userDao" class="com.qf.dao.Userdao实现类" >
         -->
    <property name="basePackage" value="com.qf.b_project.dao"></property>
</bean>

<bean id="userService" class="com.qf.b_project.service.UserServiceImpl">
    <property name="userDao" ref="userDao"></property>
</bean>
```

#### Druid监控中心（了解）

> 只要配置web，并加入映射路径，即可访问到该监控中心

```xml
<!--web.xml-->
<servlet>
    <servlet-name>DruidStatView</servlet-name>
    <servlet-class>com.alibaba.druid.support.http.StatViewServlet</servlet-class>
</servlet>
<servlet-mapping>
    <servlet-name>DruidStatView</servlet-name>
    <url-pattern>/druid/*</url-pattern>
</servlet-mapping>
```

> 访问路径：http://localhost:8080//druid/
>
> 在监控平台可观察数据库访问的变化。

### 三、事务

#### 事务配置

> 在数据库操作中引入事务，提升安全性；成功了提交，失败了，回滚
>
> 事务中引入的数据源和SqlSessionFactory中引入的数据源是同一个，否则事务是无效的。

```xml
<!-- 引入事务管理器，里面的数据源和SqlSessionFactory的是同一个 -->
<bean id="txManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
    <property name="dataSource" ref="dataSource"></property>
</bean>
<!-- 事务中的增强：自身id，绑定事务管理器的bean -->
<tx:advice id="tx" transaction-manager="txManager">
    <!--  事务规则的配置 -->
    <tx:attributes>
        <!-- name对应业务层的方法名 select开头，一般是查询-->
        <tx:method name="select*"/>
        <!-- 增删改增加事务的方法   add*代表业务层方法名add开头的 -->
        <tx:method name="add*" />
        <tx:method name="delete*" />
        <tx:method name="update*" />
    </tx:attributes>
</tx:advice>
<!-- 切点与增强的绑定，形成切面 UserServiceImpl类下的方法都需要加增强-->
<aop:config>
    <aop:pointcut id="po" expression="execution(* com.qf.b_project.service.UserServiceImpl.*(..))"/>
    <aop:advisor advice-ref="tx" pointcut-ref="po"></aop:advisor>
</aop:config>
```

#### 事务的属性

> 隔离级别：
>
> 默认为repeatable-read级别，隔离级别从低到高，分别是：
>
> read-uncommited < read-commited < repeatable-read < serialized-read
>
> 级别越高安全性越高，最高的级别完全不会出现安全隐患。
>
> 级别越高性能越低，一般建议用中间的默认级别：repeatable-read。
>
> read-uncommited：可能出现脏读，不可重复读，虚读
>
> read-commited：避免了出现脏读；可能出现不可重复读，虚读
>
> repeatable-read：避免了出现脏读，不可重复读；可能出现虚读
>
> serialized-read：完全避免了所有安全隐患
>
> 脏读：处在事务当中，查看到了另一个线程中未提交的update数据
>
> 不可重复读：处在事务当中，查看到了另一个线程中已提交的update数据
>
> 虚读：处在事务当中，查看到了另一个线程中已提交的insert数据

> 传播行为：在事务的嵌套中能够使用，查询可以设置为：SUPPORTS；表示不存在外部事务，则不开启新事务。默认REQUIRED 

> 读写性：readyonly，默认为false，表示可读可写；往往查询可以改为true，只读即可。

> 事务超时：timeout，默认为-1，根据数据库设置超时时间，一般CRUD都可不用设置超时

> 事务回滚：运行时异常会自动回滚，编译时异常则不会回滚，除非将编译时异常转运行时异常；要么加上属性 : rollback-for="Exception",往往该属性用在增删改中。

#### 测试事务回滚

> 测试事务是否有效，可以通过事务的回滚实现来做实验
>
> 业务层：

```java
@Override
public int updateUser(User user) throws Exception {
    //开启事务

    int res = userDao.updateUser(user);
    System.out.println("修改："+res);
    //int i=1/0;  //运行时异常自动回滚

    if(true) { //编译时异常
        //try {
        throw new Exception("编译时异常");
        //} catch (Exception e) { //转运行时异常
        //   throw  new RuntimeException("运行时异常");
        //}
    }

    //提交或回滚事务
    return  res;
}
```

> 容器中的配置：

```xml
<!-- 事务中的增强：自身id，绑定事务管理器的bean -->
<tx:advice id="tx" transaction-manager="txManager">
    <!--  事务规则的配置 -->
    <tx:attributes>
        <!-- name对应业务层的方法名 select开头，一般是查询
            propagation="SUPPORTS":不存在外部事务，则不用开启新事务
            -->
        <tx:method name="select*" propagation="SUPPORTS" read-only="true"/>
        <!-- 增删改增加事务的方法   add*代表业务层方法名add开头的 -->
        <tx:method name="add*" rollback-for="Exception" />
        <tx:method name="delete*" rollback-for="Exception" />
        <tx:method name="update*" rollback-for="Exception" />
    </tx:attributes>
</tx:advice>
```

### 四、注解开发

#### 注解类

> @Service  业务类专用    生成<bean id="userService" class="xx.UserServiceImpl"/>
>
> @Repository  dao实现类专用    生成<bean id="userDao" class="xx.UserDaoImpl"/>
>
> @Component  通用    其他类的bean产生
>
> @Controller  web层专用   控制层的bean参数   <bean id="userController" class="xx.userController"/>
>
> @Scope  用户控制bean的创建模式

#### DI注解

> * @Autowired  基于类型自动注入      （<bean   autowired='byType'>）
> * @Resource    基于名称自动注入      （<bean   autowired='byName'>）
> * @Qualifier("userDAO") 限定要自动注入的bean的id，一般和@Autowired联用 
> * @Value  DI注入  注入属性值

> 注解所需的spring配置：

```xml
<!-- 在com.qf包下面都可以进行注解扫描 -->
<context:component-scan base-package="com.qf"></context:component-scan>
<!-- 使用事务的注解方式  不常用 -->
<tx:annotation-driven transaction-manager="txManager"></tx:annotation-driven>
```

> 注解应用：

```java
@Service  //产生<bean id="userServiceImpl" class... />
@Scope("singleton") //单例设置
public class UserServiceImpl implements UserService {
    //@Autowired
    //@Qualifier("userDao")  //@Autowired+@Qualifier=先按类型匹配，有冲突再按ID匹配
    @Resource //先按名字匹配，如果名字匹配不了则按类型
    private UserDao userDao; //IOC注入

    @Value("zsf")  //<properties name="name" value="zsf"/>
    private String name;

    @Override
    @Transactional(propagation = Propagation.SUPPORTS)
    public User selectById(Integer id) {
        System.out.println(name);
        return userDao.selectById(id);
    }
}
```

#### AOP注解

> AOP的注解方式应用，完成的目标：给核心业务加入增强

> AOP注解启动：

```xml
<!-- 添加如下配置,启用aop注解 -->
<aop:aspectj-autoproxy></aop:aspectj-autoproxy>
```

> 切面类的定义：

```java
@Aspect //将当前类MyAspect当成切面类和增强类  里面可以产生切点和增强
@Component  //MyAspect类产生bean对象
public class MyAspect {
    // 定义切入点
    @Pointcut("execution(* com.qf.b_project.service.UserServiceImpl.*(..))")
    public void pc(){}

    @Before("pc()") // 前置增强
    public void mybefore(JoinPoint a) {
        System.out.println("target:"+a.getTarget());
        System.out.println("args:"+a.getArgs());
        System.out.println("method's name:"+a.getSignature().getName());
        System.out.println("before~~~~");
    }
}
```

### 五、Spring单元测试

> 导入依赖包，然后进行单元测试

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-test</artifactId>
    <version>4.3.6.RELEASE</version>
</dependency>
<dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>4.12</version>
</dependency>
```

```java
@RunWith(SpringJUnit4ClassRunner.class) //由SpringJUnit4ClassRunner启动测试
@ContextConfiguration("classpath:bean2.xml") //spring的配置文件位置
public class SpringJunit {//当前测试类也会被纳入工厂中，产生bean
/*    @Resource
    private UserDao userDao; //IOC的注入
    @Test
    public void daoTest(){
        User user = userDao.selectById(1);
        System.out.println(user);
    }*/

    @Resource
    private UserService userService;
    @Test
    public void serviceTest(){
        User user = userService.selectById(1);
        System.out.println(user);
    }
}
```

### 六、总结与作业

#### 总结

```
1.后处理器
给bean创建过程中增加再加工过程；通过动态代理完成
自定义后处理器--实现BeanPostProcessor接口
2.Spring整合MyBatis（重点）
将之前MyBatis用Spring容器来配置
整合数据源-SqlSessionFactory-MapperScannerConfigurer产生DAO-进行DAO测试
监控中心（了解）
3.事务（重点）
事务配置、属性说明、测试事务回滚
4.注解开发（重点）
注解类（重点）-事务注解测试、DI注解（重点）、AOP注解
5.Spring单元测试
进行dao，service的单元测试
```

#### 作业

```
1.使用注解方式完成StudentService的查询
2.使用注解的事务，完成StudentService的修改
注意：使用spring的测试
```

