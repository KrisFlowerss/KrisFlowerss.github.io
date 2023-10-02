---
title: MyBatis的CRUD
Date: 2023-09-27
Categories:
- Java
tags:
- Maven
- MyBatis
---

# MyBatis的CRUD

### 一、环境搭建

#### 设计表和实体类

```mysql
drop table user;
create table user(
  id int primary key auto_increment,
  name varchar(50),
  password varchar(50),
  sex varchar(1),
  birthday datetime
);
insert into user(name,password,sex,birthday) values('zs','123','男',now());
insert into user(name,password,sex,birthday) values('ls','123','女',now());
```

> 创建实体类

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private  Integer id;  //在框架中往往都是包装类
    private  String name;
    private  String password;
    private  String sex;
    private  Date  birthday;
}
```

#### 配置

> 将依赖包引入

```xml
<!--依赖-->
<dependencies>
    <!--MyBatis核心依赖-->
    <dependency>
        <groupId>org.mybatis</groupId>
        <artifactId>mybatis</artifactId>
        <version>3.4.6</version>
    </dependency>

    <!--MySql驱动依赖-->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>5.1.47</version>
    </dependency>
</dependencies>
```

> 编写DAO接口与实现类(Mapper文件)

```java
public interface UserDao {
    public User selectById(Integer id); //根据id获取对象
}
```

> Mapper文件中的配置，放置在resources下

```xml
<!-- mapper文件类似dao层是实现类，在mabatis中mapper中只需关注SQL
 namespace: 命名空间，用于关联DAO接口
 select标签：表示查询  id：关联接口中的方法名
 resultType:返回类型（全限定名）
 #{id}: 获取方法参数中的值-->
<mapper namespace="com.qf.dao.UserDao">
    <select id="selectById" resultType="com.qf.entity.User">
        select * from user where id=#{id}
    </select>
</mapper>
```

> mybaits配置，引入数据源（类似之前的utils工具类）

```xml
<!-- myabtis的配置，主要引入数据源 -->
<configuration>
    <!-- 搭建环境的标记名：自定义 -->
    <environments default="aaa">
        <environment id="aaa">
            <transactionManager type="jdbc"></transactionManager>
            <!-- 从数据源工厂中取出数据源对象 -->
            <dataSource type="org.apache.ibatis.datasource.pooled.PooledDataSourceFactory">
                <!-- 数据源对象中的属性 -->
                <property name="driver" value="com.mysql.cj.jdbc.Driver"/>
                <property name="url" value="jdbc:mysql:///mydb1?serverTimezone=UTC"/>
                <property name="username" value="root"/>
                <property name="password" value="123"/>
            </dataSource>
        </environment>
    </environments>
</configuration>

<!-- 注册mapper文件 -->
    <mappers>
        <mapper resource="UserMapper.xml"></mapper>
    </mappers>
```

> DAO测试

```java
//加载mybatis配置文件，获取到资源
InputStream is = Resources.getResourceAsStream("mybatis-config.xml");
//获取sqlSession工厂（相当于连接对象的工厂）
SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(is);
//通过工厂获取sqlSesson对象(连接对象)
SqlSession session = factory.openSession();
//调Mapper方法传入反射对象获取对应实体对象（获取DAO实现类对象）
UserDao userDao = session.getMapper(UserDao.class);
User user = userDao.selectById(1);
System.out.println(user);
```

### 二、配置细节

#### Mapper位置

> mapper文件可以放置到resources资源目录下，也可以放置到dao层；如果需要放置到dao层，则需要配置。
>
> 需要将src/main/java配置成资源目录；再改路径即可

```xml
<!--  在pom.xml中进行构建资源路径
构建一个资源目录:src/main/java -->
<build>
    <resources>
        <resource>
            <directory>src/main/java</directory>
            <!-- 资源目录下包含的文件
                    **/*.xml: 多级路径下的所有xml -->
            <includes>
                <include>**/*.xml</include>
            </includes>
            <!-- 需要过滤 -->
            <filtering>true</filtering>
        </resource>
    </resources>
</build>
```

```xml
<!--  mybatis配置中需要改路径
<!-- 注册mapper文件 -->
<mappers>
    <mapper resource="com/qf/dao/UserMapper.xml"></mapper>
</mappers>
```

#### 改别名

> mapper文件中的别名是全限定名，且所有mapper文件中都是全限定名，特别麻烦；可以设置别名

```xml
<!-- 在mybatis配置文件中配置实体别名 -->
<typeAliases>
    <!-- 更改别名（不推荐） -->
    <!--<typeAlias type="com.qf.entity.User" alias="user"></typeAlias>-->
    <!-- 该包中的所有类的别名(推荐)  约定别名：实体类首字母小写
             约定大于配置 -->
    <package name="com.qf.entity" />
</typeAliases>
```

#### 抽取配置文件

> 在mybatis配置文件中，可以抽取数据源的值，在db.properties中设置数据源参数

```properties
driver=com.mysql.cj.jdbc.Driver
url=jdbc:mysql:///mydb1?serverTimezone=UTC
username=root
password=123
```

```xml
<!-- 导入数据源的配置文件  放在mybatis配置最前面  -->
<properties resource="db.properties"></properties>

......
<!-- 数据源对象中的属性   ${driver}:从Properties中根据key获取值-->
<property name="driver" value="${driver}"/>
<property name="url" value="${url}"/>
<property name="username" value="${username}"/>
<property name="password" value="${password}"/>
```

#### 导入日志

> 将日志的配置放入项目中，即可在控制台打印出mybatis内部日志信息； 配置了日志后，即可查看mybatis中所做的事。

> 导入log4j的日志依赖包

```
<!-- log4j日志依赖 https://mvnrepository.com/artifact/log4j/log4j -->
<dependency>
		<groupId>log4j</groupId>
		<artifactId>log4j</artifactId>
		<version>1.2.17</version>
</dependency>
```

> 将配置文件导入到资源目录，名字必须是log4j.properties

```properties
# Global logging configuration
log4j.rootLogger=DEBUG, stdout
# MyBatis logging configuration...
log4j.logger.org.mybatis.example.BlogMapper=TRACE
# Console output...
log4j.appender.stdout=org.apache.log4j.ConsoleAppender
log4j.appender.stdout.layout=org.apache.log4j.PatternLayout
log4j.appender.stdout.layout.ConversionPattern=%5p [%t] - %m%n
```

> 日志级别由低到高： trace，debug，info，warn，error，fatal
>
> 如果配置文件中，指定低级别，那么高级别的日志信息也会提示出来；例如，设置debug，则会打印debug，info及后面的所有；但不会出现trace.

> 关键点：根据日志提示，mybatis中做了哪些事情？

```
DEBUG [main] - Setting autocommit to false on JDBC Connection [com.mysql.cj.jdbc.ConnectionImpl@4d5d943d]
DEBUG [main] - ==>  Preparing: select * from user where id=? 
DEBUG [main] - ==> Parameters: 1(Integer)
DEBUG [main] - <==      Total: 1
User(id=1, name=zs, password=123, sex=男, birthday=Wed Sep 27 17:20:30 CST 2023)
```

> 1. 开启了事务     2. 使用了预处理执行对象（由#{id}确定的）

### 三、CRUD

> mybatis的CRUD主要针对dao方法的参数绑定

#### Mapper文件

```xml
<!-- 
     2个参数的参数绑定： #{arg0}和#{arg1}
     或者使用#{param1}和#{param2}（了解）
     select * from user where id=#{param1} and password=#{param2}

     如果强行写#{id}和#{pwd}，则必须加注解@Param
     -->
<select id="selectByIdAndPwd" resultType="user">
    select * from user where id=#{id} and password=#{pwd}
</select>

<!-- map集合的参数匹配： -->
<select id="selectByMap" resultType="user">
    select * from user where id=#{id} and password=#{pwd}
</select>

<!-- 实体参数匹配 -->
<select id="selectByUser" resultType="user">
    select * from user where id=#{id} and password=#{password}
</select>

<!-- 模糊匹配查询  #{name}如果是字符串则是带‘’ -->
<select id="selectByLikeName" resultType="user">
    select * from user where name like concat('%',#{name},'%')
</select>

<!-- DML操作都不关注返回值类型；但是会关注参数类型 -->
<delete id="deleteById">
    delete from user where id=#{id}
</delete>
<!-- 修改 -->
<update id="updateUser" parameterType="user">
    update user set name=#{name},password=#{password},sex=#{sex}
    where id=#{id}
</update>

<!-- 添加 -->
<insert id="addUser" parameterType="user">
    insert into user(name,password,sex) values(#{name},#{password},#{sex})
</insert>

<!--主键回填   主键为int类型的情况
     select LAST_INSERT_ID() #查询添加的最后一行的主键ID -->
<!--  keyProperty:返回到实体属性的名字
         resultType:返回类型   order="AFTER"：在插入后返回主键
     -->
<insert id="addUserByPrimary" parameterType="user">
    <selectKey keyProperty="id" resultType="int" order="AFTER">
        select LAST_INSERT_ID()
    </selectKey>
    insert into user(name,password,sex) values(#{name},#{password},#{sex});
</insert>

<!-- 主键回填： 主键为String类型，例如：oid
         在insert之前需要填充订单ID，可以使用数据库的uuid充当订单
         SELECT UUID()  唯一识别充当订单ID
         order="BEFORE":在插入之前执行select uuid();
         keyProperty="id"实体属性中有值，并将值取出#{id}
    -->
<insert id="addOrderByPrimary">
    <selectKey keyProperty="id" resultType="string" order="BEFORE">
        SELECT UUID()
    </selectKey>
    insert into t_order(id,name) values(#{id},#{name})
</insert>
```

#### UserDao接口

```java
public interface UserDao {
    //2个参数的参数绑定  @Param("id")对应mapper的#{id}
    public User selectByIdAndPwd(@Param("id")Integer id, @Param("pwd") String pwd);

    //map传参注入
    public User selectByMap(Map map);

    //实体对象传参
    public User selectByUser(User user);

    //模糊匹配姓名
    List<User> selectByLikeName(String name);

    //根据id进行删除
    public int deleteById(Integer id);
    
        //修改功能-修改对象
    public int updateUser(User user);

    //添加功能
    public int addUser(User user);

    //主键回填-主键为int
    public int addUserByPrimary(User user);

    //主键回填-主键为String
    public  int addOrderByPrimary(Order order);
}
```

#### DAO测试

```java
/* //传两个参数的测试  接口中使用@param注解
        User user = userDao.selectByIdAndPwd(1,"123");
        System.out.println(user);
         */
//传map的测试: key对应#{pwd}
/*        Map<String,Object> map = new HashMap<>();
        map.put("id",1);
        map.put("pwd","123");
        User user = userDao.selectByMap(map);
        System.out.println(user);*/

//实体传参：只需要属性对应#{password}
/*        User user = new User();
        user.setId(1);
        user.setPassword("123");
        User u = userDao.selectByUser(user);
        System.out.println(u);*/

//模糊查询名字--1个参数;返回集合
/*        List<User> list = userDao.selectByLikeName("z");
        System.out.println(list);*/

//删除功能：CRUD都是在事务中操作的，在缓冲区操作；DML需要提交或回滚才变更
try {
    //int res = userDao.deleteById(2);
    //System.out.println("删除："+res);
    
    //修改功能
    //User user = new User(null,"张三丰","666","男",null);
    //int res = userDao.updateUser(user);
    //System.out.println("修改："+res);

    //添加功能
    //int res = userDao.addUser(user);
    //System.out.println("添加："+res);

    //int res = userDao.addUserByPrimary(user);
    //System.out.println("添加:"+res+";主键回填："+user.getId());

    Order o = new Order(null,"灭绝");
    int res = userDao.addOrderByPrimary(o);
    System.out.println("添加："+res+"--主键回填:"+o.getId());
    session.commit();  //提交
}catch (Exception e){
    e.printStackTrace();
    session.rollback();
}finally {
    session.close();  //关闭资源
}
```

### 四、封装MyBatis

#### 概述

> 在DAO测试中，后续都是业务层的功能调用，每设计一个功能，都需要加载mybatis配置，及得到SqlSessionFactory和SqlSession对象，非常麻烦。
>
> 所以，需要将DAO测试进行封装，只关注功能调用即可
>
> 封装操作和JDBC之前的事务封装类似，需要使用到ThreadLocal存储SqlSession共享对象

#### 封装应用

> 封装工具类：

```java
public class MyBatisUtils {
    //存共享数据SqlSession
    private static final ThreadLocal<SqlSession> TH = new ThreadLocal<>();
    private  static SqlSessionFactory factory;
    static{ //配置文件的加载，只加载一次；且factory共享的
        InputStream is = null;
        try {
            is = Resources.getResourceAsStream("mybatis-config.xml");
            //获取sqlSession工厂（相当于连接对象的工厂）
            factory = new SqlSessionFactoryBuilder().build(is);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    //从ThreadLocal中获取sqlSession，如果没有，则使用factory获取
    public static SqlSession openSession(){
        SqlSession session = TH.get();
        if(session==null){
            session = factory.openSession();
            TH.set(session);
        }
        return session;
    }

    //封装事务：提交事务，回滚事务
    public static void commit(){
        //事务和操作SQL的连接对象是同一个
       SqlSession session = openSession();
       session.commit(); //提交
       closeSession();  //关闭session及ThreadLocal
    }

    public static void rollback(){
        SqlSession session = openSession();
        session.rollback(); //回滚
        closeSession();
    }

    private static  void closeSession(){ //关闭
        SqlSession session = openSession();
        session.close();
        TH.remove();  //移除ThreadLocal
    }

    //封装Mapper(DAO对象)
    public static <T> T getMapper(Class<T> clazz){
        SqlSession session = openSession();
        //传入反射对象，返回实体对象
        return  session.getMapper(clazz);
    }
}
```

> DAO测试：

```java
try {
    UserDao mapper = MyBatisUtils.getMapper(UserDao.class);
    mapper.updateUser(new User(3,"灭绝","333","女",null));
    MyBatisUtils.commit();  //提交
}catch (Exception e){
    e.printStackTrace();
    MyBatisUtils.rollback();  //回滚
}
```

### 五、总结与作业

#### 总结

```
1.mybatis环境搭建（重点）
之前JDBC分层操作-->mybatis替换
2.配置细节
mapper位置-resources，dao(变资源目录)
改别名、抽取配置文件
导入日志（重点）-开启事务，预处理执行对象
3.mybatis的CRUD（重点）
针对于接口中方法的参数绑定
查询-单个参数，多参(@param)，map参数，对象，模糊查询、DML操作、主键回填-主键为int和String
4.封装mybatis（重点）
场景-dao的测试非常麻烦，需要封装
应用-ThreadLocal，封装sqlsession及事务
```

#### 作业

```
1. mybatis环境搭建的配置步骤
2. 有一张admin表，字段有：id，name，password，使用mybatis完成增删改查操作，使用mybatis封装的方式
```

#### 晨考

```
1.MyBatis的参数绑定
参数个数或类型                对应的SQL值           

2.默写user表中name模糊匹配的SQL，注意：要用上 #{}
```

![截屏2023-09-28 09.03.40](https://091023.xyz/2023/09/28/090449.webp)
