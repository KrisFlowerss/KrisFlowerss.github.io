---
title: MySQL的DAO
Date: 2023-09-07
Categories:
- Java
tags:
- MySQL
- DAO
---



# MySQL的DAO

### 一、登录优化

#### 登录问题

> 昨天的登录功能，传递参数拼接成SQL语句有问题；拼接一些特定异常账户和密码，系统会识别成成功的登录；这种问题我们叫做SQL注入异常。
>
> 解决方案：先执行SQL语句，再填充账户和密码；这样，数据肯定是不会变动的；这种方式就是预处理执行方式。

#### 预处理执行

> 使用预处理执行对象PreparedStatement，来完成SQL语句的预先执行。
>
> 好处：
>
> 解决了SQL注入-安全性高； 预处理SQL执行操作-性能高；方便批处理执行
>
> 结论：后续JDBC优先使用PreparedStatement；特殊情况才使用Statement，例如事务测试

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
    PreparedStatement  prst   = null;
    ResultSet  rs   = null;
    try {
        Class.forName("com.mysql.cj.jdbc.Driver");
        //2.通过驱动管理器获取连接对象
        conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/mydb1?serverTimezone=UTC", "root", "123");
        //3.创建执行对象
        //st = conn.createStatement();
        //select count(*) from user where username='' or 1=1 #' and password='66666' #err sql注入问题
        String sql = "select count(*) from user where username= ? and password=? ";
        //？表示占位符
        prst = conn.prepareStatement(sql); //预处理sql语句
        //参数1：第几个占位符 下标从1开始  参数2：填充数据
        prst.setString(1,username);
        prst.setString(2,password);

        rs = prst.executeQuery(); //执行只是填充数据
        if(rs.next()){
            //rs.getInt(1):获取第一个字段 count(*)字段   聚合函数：0或大于0
            return rs.getInt(1)>0;
        }
    }catch (Exception e){
        e.printStackTrace();
    }finally {
        DBUtils.closeAll(rs,prst,conn);
    }
    return false;
}
```

### 二、封装工具类

#### JDBC抽取

> JDBC的操作，有很多复用的代码，例如，加载驱动，获取连接对象，可以抽取到工具类。

```java
public class DBUtils { //数据库的工具类
    static { //静态代码块只执行一次
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }
    public static Connection getConnection(){ //封装连接对象
        Connection conn = null;
        try {
            conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/mydb1?serverTimezone=UTC", "root", "123");
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return  conn;
    }
    public static void closeAll(AutoCloseable...ac){ //关闭资源
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
}
```

#### 抽取配置文件

> 工具类中的驱动，url及账户，密码都是直接写死再工具类中的。不方便项目变更与升级，例如更换数据库，需要直接找到项目代码，变更后重新上线，非常麻烦。如果抽取到配置文件中，只需要把配置文件更改并导入即可。配置文件的注入就是软编码应用（配置大于编码）

```java
public class DBUtils { //数据库的工具类
    private  static Properties p = new Properties(); //实例化Properties对象
    static { //静态代码块只执行一次
        try {
            p.load(new FileInputStream("db.properties"));
            Class.forName(p.getProperty("driver"));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    public static Connection getConnection(){ //封装连接对象
        Connection conn = null;
        try {
            conn = DriverManager.getConnection(p.getProperty("url"),
                    p.getProperty("username"), p.getProperty("password"));
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return  conn;
    }
}
```

### 三、ORM

#### 概述

> ORM：对象关系映射；对象就是java实体对象，关系就是数据表； 映射就是值的注入
>
> 实体类对应表；实体属性对应表的字段，所以表的字段值获取后需要注入到实体的属性中；反过来，对象的属性值也可以注入到表的字段中
>
> 结论：常用的方式，就是表的字段值注入到实体属性中---查询数据
>
> 其他应用：实体属性注入到表字段中---添加和修改操作

#### ORM应用

> 将t_jobs表中的数据查询后是零散的数据，需要通过实体进行封装；方便传递数据

```java
@Data  //生成了set/get  toString
@NoArgsConstructor  //无参构造
@AllArgsConstructor  //全参构造
public class Jobs { //实体类  属性与表字段一致
    private String job_id;
    private  String job_title;
    private  String min_salary;
    private  String max_salary;
}
```

```java
public static void main(String[] args) {
    //将t_jobs表中的数据查询后是零散的数据，需要通过实体进行封装；方便传递数据
    Connection conn = null;
    PreparedStatement prst = null;
    ResultSet rs = null;
    List<Jobs> list = new ArrayList<>();
    try {
        conn = DBUtils.getConnection();
        prst = conn.prepareStatement("select * from t_jobs");
        rs   = prst.executeQuery();
        while(rs.next()){
            String job_id = rs.getString("job_id");
            String job_title = rs.getString("job_title");
            String min_salary = rs.getString("min_salary");
            String max_salary = rs.getString("max_salary");
            //ORM操作：零散数据封装成实体，方便数据传递
            //一条记录对应一个实体；多个记录对应集合
            Jobs jobs = new Jobs(job_id,job_title,min_salary,max_salary);
            list.add(jobs);
        }
    }catch (Exception e){
        e.printStackTrace();
    }finally {
        DBUtils.closeAll(rs,prst,conn);
    }
    System.out.println(list);
}
```

### 四、DAO

#### 概述

> DAO：数据访问层，从测试类中抽取出来的DAO层类，用于与数据库进行交互
>
> 好处：层次结构更清晰
>
> 测试类中只需要准备数据，交给DAO层完成功能即可

#### 层次分析

> 数据库的应用案例需要的分层结构：
>
> 测试类(test)：准备好与数据库交互的数据，传递给DAO层，也可以接收DAO层反馈
>
> 实体层(entity)：存放实体类，用于进行ORM操作
>
> 工具层(utils)：抽取数据库连接参数
>
> 数据访问层(DAO): 和数据库交互-JDBC操作

#### DAO应用

> 创建一张表 Person，有以下列：
>
> - id：int，主键，自动增长
> - name：varchar(20) 非空
> - age：int 非空
> - bornDate：Date 
> - email：字符串

> 步骤：
>
> 1. 创建表，再准备对应实体类
>
> 2. 准备工具类
> 3. 编写测试类
> 4. 完成DAO层的JDBC

#### 代码实现

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Person { //实体类
    private int id;
    private  String name;
    private  int age;
    private Date bornDate; //java.util包下的日期类型
    private  String email;
}
```

```java
//测试类：
/*
            create table person(
                id int primary key auto_increment,
                name varchar(20) not null,
                age  int not null,
                bornDate date,
                email varchar(20)
            );
     */
public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    PersonDaoImpl personDao = new PersonDaoImpl();
    do{
        System.out.println("请输入操作编号：1.添加 2.修改 3.删除 4.查询 5.退出");
        int n = sc.nextInt();
        switch (n){
            case 1:
                Person p = new Person(1,"zs",30,new Date(),"lhp@163.com");
                int res = personDao.add(p);  //添加数据
                System.out.println("添加:"+res);
                break;
            case 2:
                p = new Person(2,"ls",40,new Date(),"lhp@163.com");
                res = personDao.update(p);  //修改
                System.out.println("修改:"+res);
                break;
            case 3:
                res = personDao.deleteById(2); //根据id删除
                System.out.println("删除:"+res);
                break;
            case 4:
                List<Person> list = personDao.queryAll();  //查询所有
                System.out.println(list);
                break;
            case 5:
                System.out.println("退出");
                return;
            default:
                System.out.println("输入有误~");
                break;
        }
    }while(true);
}
```

```java
//PersonDao层操作：
public int add(Person p) {
    Connection conn = null;
    PreparedStatement prst = null;
    try {
        conn = DBUtils.getConnection();
        String sql = "insert into person(name,age,bornDate,email) values(?,?,?,?)";
        prst = conn.prepareStatement(sql);
        prst.setString(1,p.getName());
        prst.setInt(2,p.getAge());
        //需要将java.util日期转java.sql
        Date date = new Date(p.getBornDate().getTime());
        prst.setDate(3,date);
        prst.setString(4,p.getEmail());
        return prst.executeUpdate();
    }catch (Exception e){
        e.printStackTrace();
    }finally {
        DBUtils.closeAll(prst,conn);
    }
    return 0;
}

public int update(Person p) {  //修改
    Connection conn = null;
    PreparedStatement prst = null;
    try {
        conn = DBUtils.getConnection();
        String sql = "update person set name=?,age=?,bornDate=?,email=? where id=?";
        prst = conn.prepareStatement(sql);
        prst.setString(1,p.getName());
        prst.setInt(2,p.getAge());
        //需要将java.util日期转java.sql
        Date date = new Date(p.getBornDate().getTime());
        prst.setDate(3,date);
        prst.setString(4,p.getEmail());
        prst.setInt(5,p.getId());
        return prst.executeUpdate();
    }catch (Exception e){
        e.printStackTrace();
    }finally {
        DBUtils.closeAll(prst,conn);
    }
    return 0;
}

public int deleteById(int id) { //删除
    Connection conn = null;
    PreparedStatement prst = null;
    try {
        conn = DBUtils.getConnection();
        String sql = "delete from person where id=?";
        prst = conn.prepareStatement(sql);
        prst.setInt(1,id);
        return prst.executeUpdate();
    }catch (Exception e){
        e.printStackTrace();
    }finally {
        DBUtils.closeAll(prst,conn);
    }
    return 0;
}

public List<Person> queryAll() { //查询返回的是集合
    Connection conn = null;
    PreparedStatement prst = null;
    ResultSet rs = null;
    List<Person> list = new ArrayList<>();
    try {
        conn = DBUtils.getConnection();
        String sql = "select * from person";
        prst = conn.prepareStatement(sql);
        rs = prst.executeQuery();
        while(rs.next()){
            int id = rs.getInt("id");
            String name = rs.getString("name");
            int age = rs.getInt("age");
            //拿到java.sql的Date类型，但可直接赋值给java.util
            //子传给父，直接转---多态
            Date bornDate = rs.getDate("bornDate");
            String email = rs.getString("email");
            Person p = new Person(id,name,age,bornDate,email);
            list.add(p);
        }
    }catch (Exception e){
        e.printStackTrace();
    }finally {
        DBUtils.closeAll(rs,prst,conn);
    }
    return list;
}
```

### 五、日期转换

> dao层操作的添加和修改功能需要java.util转java.sql，可以将转换方式抽取到日期工具类中；除此之外还有字符串转java.util（web开发）; java.util转字符串。

```java
public class DateUtils {
    private  static SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
    //传入java.util的日期转java.sql的日期
    public static java.sql.Date utilToSQL(Date date){
        return new java.sql.Date(date.getTime());
    }
    //字符串转java.util
    public static Date stringToUtil(String strDate) throws ParseException {
        return sdf.parse(strDate);
    }
    //java.util转字符串
    public static String utilToString(Date date){
        return sdf.format(date);
    }
}
```

### 六、业务层Service

#### 概述

> 在测试类与到层之间需要有一些数据判断及业务功能的捆绑，这些操作需要我们抽取出业务层service来完成这些操作。
>
> 例如：转账功能，我们需要判断账户余额，判断账户是否正确；且一个转账功能中需要有到多个DAO实现

#### 表设计

> 创建一张表accout，有以下列：
>
> - id：int，主键，自动增长
> - cart ：varchar(40) 非空
> - password ： 字符串
> - money  ：整数

```mysql
drop table account;
create table account(
	id int primary key auto_increment,
  cart varchar(30),
  password varchar(20),
  money int
);
insert into account(cart,password,money) values('10086','123',1000);
insert into account(cart,password,money) values('10010','123',1000);
select * from account;
```

#### 转账应用

```java
//转账功能： 参数1：发送方账户  参数2：接收方账户 参数3：发送方密码，参数4：金额
public int transfer(String sendCart,String acceptCart,String password,int money){
    try {
        //业务逻辑判断，且一个业务功能包含多个dao功能
        AccountDaoImpl accountDao = new AccountDaoImpl();
        Account sendAccount = accountDao.selectCart(sendCart); //查看是否有发送方账户
        if(sendAccount==null){ //判断发送方账户是否存在
            throw new RuntimeException("没有发送方账户");
        }
        if(!sendAccount.getPassword().equals(password)){ //判断密码是否正确
            throw new RuntimeException("发送方密码错误");
        }
        if(sendAccount.getMoney()<money){
            throw new RuntimeException("余额不足");
        }
        Account acceptAcc = accountDao.selectCart(acceptCart);
        if(acceptAcc==null){ //判断接收方账户是否存在
            throw new RuntimeException("接收方账户不存在");
        }
        //---转账操作---
        sendAccount.setMoney(sendAccount.getMoney()-money); //发送方减钱
        int res = accountDao.updateAccMoney(sendAccount); //修改发送方账户金额
        System.out.println("发送方："+res);

        acceptAcc.setMoney(acceptAcc.getMoney()+money); //接收方加钱
        res = accountDao.updateAccMoney(acceptAcc);
        System.out.println("接收方："+res);
        return  res;
    }catch (Exception e){
        e.printStackTrace();
    }
    return 0;
}
```

### 七、总结与作业

#### 总结

```

```

#### 作业

```
1. 什么是orm
2. 编写StudentDao层,增删改查
  2.1 创建表结构: student表中有id 主键自增长,name 字符串类型 ,age int类型
  2.2 创建Student实体类：表字段与实体属性一一对应
  2.3 抽取工具类及配置文件
  2.4 创建StudentDao完成JDBC
  
```

