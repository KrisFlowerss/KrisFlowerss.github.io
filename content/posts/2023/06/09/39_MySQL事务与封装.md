---
title: MySQL的事务与封装
Date: 2023-09-010
Categories:
- Java
tags:
- 事务
- 封装
---

# MySQL的事务与封装

### 一、事务

> 概述：一条或多条SQL语句的捆绑，要么都成立则提交，要么都失败则回滚

#### 事务应用

> 事务的应用，放在业务层；因为一个业务功能可以包含多个SQL功能，所以在业务层可捆绑这些功能
>
> 事务应用：
>
> 通过连接对象调用方法，进行开启事务，提交和回滚事务

```java
//---转账操作---
public int transfer(String sendCart,String acceptCart,String password,int money){
    Connection con = null;
    try{
        con = DBUtils.getConnection();  //获取连接对象
        con.setAutoCommit(false); //手动提交--开启事务
        sendAccount.setMoney(sendAccount.getMoney()-money); //发送方减钱
        int res = accountDao.updateAccMoney(sendAccount); //修改发送方账户金额
        System.out.println("发送方："+res);

        int i = 1/0;  //模拟异常  跑到catch中，回滚事务

        acceptAcc.setMoney(acceptAcc.getMoney()+money); //接收方加钱
        res = accountDao.updateAccMoney(acceptAcc);
        System.out.println("接收方："+res);
        con.commit();  //提交事务
        return  res;
    }catch (Exception e){
        e.printStackTrace();
        System.out.println("事务回滚");
        try {
            con.rollback();  //事务回滚
        } catch (SQLException ex) {}
    }finally {
        DBUtils.closeAll(con);  //关闭连接对象
    }
    return 0;
}
```

#### 异常分析

> 问题：在业务层设计的事务无法回滚，原因是业务层的连接对象和DAO层的不是同一个对象
>
> 处理方案：只需要将连接对象统一为一个即可
>
> 方案1：将业务层的连接对象以传参方式传到AO层（不推荐-接口污染）
>
> 方案2：在工具类中，使用共享的连接对象（ThreadLocal），可以在业务层和DAO层进行使用

#### ThreadLocal

> - 可以将整个线程中（单线程）中，存储一个共享值，这个共享值就是Connection。
> - 线程拥有一个类似 Map 的属性，键值对结构<ThreadLocal对象，值>。
>
> 注意：在DAO层不要关闭连接对象，统一在事务处理完成后，再关闭和移除

```java
public class DBUtils { //数据库的工具类
    //共享ThreadLocal，里面管理连接对象
    private static final ThreadLocal<Connection> TH = new ThreadLocal<>();
    //...加载驱动
    public static Connection getConnection(){ //封装连接对象
        Connection conn = null;
        try {
            conn = TH.get(); //从ThreadLocal中获取连接对象
            if(conn==null) {
                conn = DriverManager.getConnection(p.getProperty("url"),
                        p.getProperty("username"), p.getProperty("password"));
                TH.set(conn); //连接对象存储到ThreadLocal中
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return  conn;
    }

    public static void closeAll(AutoCloseable...ac){ //关闭资源
        for(AutoCloseable a:ac){
            if(a instanceof Connection){
                TH.remove();  //移除连接对象
                System.out.println("移除连接对象");
            }
            if(a!=null){
                try {
                    a.close();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
```

### 二、封装事务

#### 说明

> 在前面的设计中已经说明，在一个类中尽可能的少出现其他类的对象(解耦合)；所以，在业务层还需要对事务进一步封装，对代码的结构也会设计更清晰合理。

#### 应用

> 在工具类中进行封装

```java
public static void begin(){  //开启事务
    Connection conn = null;
    try {
        conn = getConnection();
        conn.setAutoCommit(false);
    } catch (Exception e) {
        e.printStackTrace();
    }
}

public static void commit(){ //提交事务
    Connection conn = null;
    try {
        conn = getConnection();
        conn.commit();  //提交
    } catch (Exception e) {
        e.printStackTrace();
    }finally {
        TH.remove();  //移除连接对象
        closeAll(conn);
    }
}
public static void rollbock(){ //回滚
    Connection conn = null;
    try {
        conn = getConnection();
        conn.rollback();
    } catch (Exception e) {
        e.printStackTrace();
    }finally {
        TH.remove();  //移除连接对象
        closeAll(conn);
    }
}
```

### 三、三层架构

#### 概述

> 前面的内容已经涉及到三层架构了，此处整理三层架构概述
>
> 三层架构包括，表示层(测试类)，业务层，DAO层
>
> 表示层（测试类）：搜集数据交给业务层处理，并接收返回数据，并展示数据
>
> 业务层：对数据进行逻辑判断，并调用dao层的一个或多个功能；事务操作
>
> DAO层：和数据库进行交互处理
>
> 注意：在项目中，往往业务层和DAO层都是接口与实现类的设计(解耦合-实现类任意分离与更换）

#### 应用

> 将三层架构的所有层次结构进行设计与描述：
>
> 1.数据表-实体类设计
>
> 2.DBUtils工具类与配置文件
>
> 3.编写测试类--调用业务层
>
> 4.编写DAO层的接口与实现类--增删改查功能
>
> 5.编写业务层的接口与实现类--代表业务的功能
>
> 案例：user表，有id，name和age字段，只需将三层架构的结构设计出来，无需具体代码

### 四、DAOUtils

#### 概述

> 在DAO层的操作中，每个功能都需要JDBC的重复性的操作，一个模块的增删改查直接重复性的不是太多；但是在项目中，如果有多个模块，每个模块都需要这些重复代码，那么冗余特别多，不方便管理。
>
> 所以，需要有一个JDBC的工具类来提升复用性。

#### DML封装

> 封装的做法，往往需要将变动的代码从参数中传递；增删改中固定的代码可以直接写死。
>
> 此处的测试，无需使用service层，参数无需逻辑判断和无需dao功能的捆绑

```java
//DML的封装操作 参数1：sql语句 参数2：可变长参数
public static int commomUpdate(String sql,Object...obs){
    Connection conn = null;
    PreparedStatement prst = null;
    try {
        conn = DBUtils.getConnection();
        prst = conn.prepareStatement(sql);
        for(int i=0;i<obs.length;i++){ //循环遍历传入的参数，即可完成值的注入
            prst.setObject(i+1,obs[i]);
        }
        return prst.executeUpdate();
    }catch (Exception e){
        e.printStackTrace();
    }finally {
        DBUtils.closeAll(prst,conn);
    }
    return 0;
}
```

#### DQL封装

```java
//DQL操作:
//注意此处不能使用List<Person>  而是泛型； 需定义泛型方法<T>
//参数1：sql语句 参数2：反射对象  参数3：接收传过来的参数
public static <T> List<T> commonQuery(String sql,Class<T> clazz ,Object...obs){
    Connection conn = null;
    PreparedStatement prst = null;
    ResultSet rs = null;
    List<T> list = new ArrayList<>();
    try {
        conn = DBUtils.getConnection();
        prst = conn.prepareStatement(sql);
        for(int i=0;i<obs.length;i++){ //设置参数，与DML封装类似
            prst.setObject(i+1,obs[i]);
        }
        rs = prst.executeQuery();
        Field[] fields = clazz.getDeclaredFields();  //获取所有的属性
        while(rs.next()){//循环进来就是一条记录
            T t = clazz.newInstance();  //获取实例对象
            for(Field f:fields){
                //从表中根据字段获取值  注意：表字段与实体属性要一致，否则无法取到值
                Object value = rs.getObject(f.getName()); //将属性充当字段获取字段值
                f.setAccessible(true);  //设置权限
                f.set(t,value); //设置注入实体的属性值
            }
            list.add(t);  //用集合存储
        }
    }catch (Exception e){
        e.printStackTrace();
    }finally {
        DBUtils.closeAll(rs,prst,conn);
    }
    return list;
}
```

### 五、Druid连接池

> 回顾之前的线程池，容器中创建了多个线程对象；有用户访问从线程池中获取线程对象，用完后回收到线程池，进行复用； 好处-减少创建和销毁线程的数目，提升性能

#### 概述

> 连接池类似线程池，预先创建一个容器，存多个连接对象；有用户过来，从连接池中获取连接对象；用完了，则回收到连接池进行复用--复用机制。
>
> 好处：减少创建和销毁连接对象的数目，提升性能
>
> 有多款连接池，例如：c3p0，dbcp，druid等连接池，其中阿里巴巴提供的druid连接池性能最高，使用最广

#### 应用

> druid连接池的应用很简单，已经封装成工具类，类似DBUtils

```java
public class DruidUtils { //数据库的工具类
    private static DataSource dataSource;  //准备数据源
    private  static Properties p = new Properties(); //实例化Properties对象
    static { //静态代码块只执行一次
        try {
            p.load(new FileInputStream("druid.properties"));
            //传入Properties资源，得到druid的数据源
            dataSource = DruidDataSourceFactory.createDataSource(p);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static Connection getConnection(){ //封装连接对象
        Connection conn = null;
        try {
            conn = dataSource.getConnection(); //从数据源中取出连接对象
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return  conn;
    }
}
```

### 六、总结与作业

#### 总结

```
1.事务应用（重点）
回顾事务概述；使用-在业务层；异常分析-无法回滚的分析
ThreadLocal用法-解决事务异常处理
2.事务封装
解耦合-封装了开启事务，提交事务，回滚
3.三层架构（重点）
概述、使用-service和dao都是接口与实现类
4.DAOUtils(重点)
概述-dao层的jdbc的封装；DML封装；DQL封装-提升复用性
5.Druid连接池（重点）
连接池概述，应用
```

#### 作业

```
1. 表结构: student表中有id,name ,age,stno(学号)
2. 编写DaoUtils,进行dao层DML和DQL的封装（可以写一个添加和查询功能进行测试即可）
3. 编写StudentService层,处理业务，判断学号不存在, 才添加
4. 将判断和插入学员的功能, 用事务绑定,(注意: 使用ThreadLocal存连接对象)
```

