---
title: Object类
Date: 2023-08-04
Categories:
- Java
tags:
- Object
---

# Object类

### 一、匿名内部类

> 匿名内部类在设计上和局部内部类相似；但是本质为多态，也就是能用多态的案例，肯定能用匿名内部类
>
> 回顾多态案例（接口或抽象类都可以），有直接引用，传参多态，返回值多态

#### 直接引用

```java
//案例：喷火娃具有喷火的能力
//应用场景：
//当实例化一次对象，倾向于用匿名内部类;写法上简单，节约资源
//当实例化多次对象，倾向于用多态；结果清晰，无需创建多个class资源
interface Fireable{
	void fire();
}
class WaWa implements Fireable{
	@Override
	public void fire() {
		System.out.println("喷火娃正在喷火...");
	}
}
public class Test1 {
	public static void main(String[] args) {
		//1.接口直接引用的多态
		Fireable able = new WaWa();
		able.fire();
		//2.匿名内部类的方式
		Fireable able2 = new Fireable() {
			@Override
			public void fire() {
				System.out.println("匿名内部类的喷火..");
			}
		};
		able2.fire();
	}
}
```

#### 传参多态

```java
//案例：直接调方法，多态传参；接口为USB标准；实现类为Disk
interface USB{
	void run();
}
class Disk implements USB{
	@Override
	public void run() {
		System.out.println("硬盘正在运转");
	}
}
public class Test2 {
	public static void main(String[] args) {
		//传参多态：将Test2看成第三方类来使用
		Test2.connect(new Disk());
		
		//匿名内部类实现
		Test2.connect(new USB() {
			@Override
			public void run() {
				System.out.println("匿名设备正在运转");
			}
		});
	}
	private static void connect(USB u) {
		u.run();  //接口回调
	}
}
```

> 结论：多态有什么应用场景，那么匿名内部类就有什么场景

### 二、Object类概述

#### 概述

> Object类是所有类的祖宗类，所有的类直接或间接继承Object类
>
> 直接继承：当一个类没有直接父类，则继承Object类
>
> 间接继承：当一个类有父类，则父类继承Object类
>
> Object类天生就是多态的应用

#### Object创建

> 创建对象的方式有三种：1.直接new对象   2.传参new   3.返回值new

```java
//创建Object对象
class Person{ //直接继承Object
}
public class Test1 {
	public static void main(String[] args) {
		//Object o = new Object();  //面向对象方式--不常用
		Object o = new Person();    //1.直接引用多态
		
		Test1.invoke(new Person()); //2.传参多态
		
		Object o1 = Test1.getPerson(); //3.返回值多态
	}
	private static Object getPerson() {
		return new Person();  //返回值多态
	}
	private static void invoke(Object o) { //传参多态
		System.out.println("传参多态");
	}
}
```

### 三、常用方法

#### getClass方法

> 获取类对象的方法，相同类的类对象只有一个

```java
//Object的getClass方法：获取类对象
class Person{
}
public class Test1 {
	public static void main(String[] args) {
		Class c1 = new Person().getClass();
		Class c2 = new Person().getClass();
		//==：在引用类型中，用于比较地址；同一块地址则为true；不同则为false
		System.out.println(new Person()==new Person()); //false
		System.out.println(c1==c2); //true
		
		Class c3 = new Test1().getClass();
		System.out.println(c1==c3); //false
	}
}
```

> 场景：和instanceof场景类似，用于判断类型；另一个场景就是反射的应用(后面学)

#### hashCode方法

> 每个对象都可以调用hashCode后，返回hash值(整数值)； 不同对象返回的hash值不同

```java
//Object的hashCode方法：不同对象(对象就是地址)返回不同hash值(整数值)
//应用场景：我们直接使用Object的hashCode是没有意义的；往往需要重写
//重写后，认为属性值一致，则返回相同的hash值
class Man{	
}
class WoMan{
	String name;
	int  age;
	public WoMan(String name,int age) {
		this.name = name;
		this.age  = age;
	}
	@Override  //当前类重写的hashCode，里面获取的是属性的hash值
	public int hashCode() {
		//name.hashCode():String类型的hashCode：用于比较内容是否一致
		return name.hashCode()+age;
	}
}
public class Test2 {
	public static void main(String[] args) {
		System.out.println(new Man().hashCode()); //366712642
		System.out.println(new Man().hashCode()); //1829164700
		
		System.out.println("字符串的hashCode："+"凤姐".hashCode());
		System.out.println("字符串的hashCode："+"凤姐".hashCode());
		
		System.out.println(new WoMan("凤姐", 30).hashCode()); //
		System.out.println(new WoMan("凤姐", 30).hashCode());
	}
}
```

#### toString方法

> Object的toString，就是将对象以字符串方式返回： 类名@hash值

```java
//Object的toString：将对象以字符串方式返回； 结果：类名@hash值
//不同对象的类名@hash值不同；只能用于查看地址是否一致
//真正应用场景：重写--用于返回属性的字符串形式  
class Dog{
	String name;
	int    age;
	
	public  Dog(String name,int age) {
		this.name = name;
		this.age  = age;
	}
	@Override
	public String toString() {
		return name+":"+age; //调用重写的toString，可以查看到属性是否有赋值
	}
}
public class Test3 {
	public static void main(String[] args) {
		Dog wc = new Dog("旺财",3);
		Dog bj = new Dog("八戒",600);
		System.out.println(wc.toString());
		System.out.println(bj.toString());
		
		System.out.println("-----------");
		System.out.println(wc);  //打印对象-一样可以查看属性
		
		//分析打印对象流程：
		//1.System.out.println(wc)里面的println(Object),具体实现调用了String.valueOf(x)
		//2.查看String.valueOf(x)的实现里面调用了obj.toString() 
	}
}
```

#### equals方法

> Object的equals方法：用于比较两个对象的地址是否相等；和==是一样的

```java
//Object的equals方法：用于比较两个对象的地址是否相等；和==是一样的
//如果相等则返回true；不相等则返回false
//应用场景：比较属性是否相等---在实体类中重写equals方法，认为属性一致则返回true
class Pig{
}
class Cat{
	String name;
	int    age;
	public Cat(String name,int age) {
		this.name = name;
		this.age  = age;
	}
	@Override
	public boolean equals(Object obj) {//Object obj = "加菲猫";
		//if (obj instanceof Cat) { //方式1：使用instanceof匹配类型
		if(this.getClass()==obj.getClass()){
			Cat cat = (Cat) obj;  //将字符串转成Cat
			//String的equals重写方法用于比较内容，内容一致，则返回true
			return this.name.equals(cat.name)&&this.age==cat.age;
		}
		return false;
	}
}
public class Test4 {
	public static void main(String[] args) {
		//1.调用Object的equals方法
		Pig peiQi = new Pig();
		Pig qiaoZhi = new Pig();
		System.out.println(peiQi==qiaoZhi);  //false
		System.out.println(peiQi.equals(qiaoZhi));  //false
		
		//2.重写equals方法--比较属性
		Cat jf = new Cat("加菲猫", 5);
		Cat jf2 = new Cat("加菲猫", 5);
		System.out.println(jf.equals(jf2));  //true
		
		System.out.println(jf.equals("加菲猫"));  //
	}
}
```

#### finalize方法

> 如果一个对象变为了垃圾对象，JVM就会调用finalize方法，标记该方法需要进行回收了。可以通过垃圾回收器进行回收
>
> 一般不会立即进行回收(触发finalize方法)，除非内存满了，则会立即回收
>
> 垃圾对象：没有引用变量去指向new出来的对象，这个new对象就是垃圾对象
>
> 自动回收机制：JVM内存耗尽，才会一次性回收。
>
> 手动回收机制：调用System.gc(),告诉JVM现在需要回收内存了

```java
class Student{
	private String name;
	public Student(String name) {
		this.name=name;
	}
	@Override
	protected void finalize() throws Throwable {
		System.out.println(name+"已经准备回收");
	}
}
public class Test5 {
	public static void main(String[] args) {
		Student st = new Student("刘亦菲"); //不是垃圾对象，有引用变量使用
		
		new Student("凤姐");  //垃圾对象，没人使用
		System.gc();  //手动回收
	}
}
```

### 四、包装类

> 前面学习了8大基本类型，破坏了面向对象的纯粹性；为了承诺一切皆为对象，在java中提供了包装了，来包装这些基本类型。
>
> 好处：可以统一变量的初始值为null；且具有面向对象特点---调方法
>
> 基本类型对应包装类：
>
> byte---Byte      short---Short              int-----Integer                  long----Long
>
> float---Float     double---Double       boolean---Boolean        char-----Character

#### 包装类型转换

```java
class Person{
	//变为包装类后，同一个初始类型为null
	String name;  //null
	Integer    age;   //0---null  
	Character   sex;   //码值为0 空格---null
}
public class Test1 {
	public static void main(String[] args) {
		Person p = new Person();
		System.out.println(p.name);
		System.out.println(p.age);
		System.out.println(p.sex);
		
		//装箱：将基本类型转包装类
		Integer  a = new Integer(3); //方式1
		a = Integer.valueOf(5);   //方式2：类名调静态方法
		
		//拆箱：将包装类转基本类型
		int b = a.intValue();
		System.out.println(b);  //5
		
		//自动装箱：int-->Integer 本质还是手动装，系统自动做了（1.5版本后）--看反编译工具
		Integer aa = 3;
		//自动拆箱：
		int bb = aa;
		System.out.println(bb);  //3
		
		//字符串与其他类型的转换：
		//其他类型转字符串：拼接""
		String s = 3+"";
		//字符串转其他类型
		String ss = "33"; 
		//字符串转整数：
		int i = Integer.parseInt(ss);
		//字符串转double
		double d = Double.parseDouble(ss);
		
		//注意-字符串一定是数字字符串，否则报格式转换异常
		int ii = Integer.parseInt("aaa"); //NumberFormatException
	}
}
```

#### 整数缓冲区

> 在Integer中提供了256个(-128~127)常用的整数缓冲区的地址； 也就是在这个范围了如果值相同返回的地址相同
>
> 要使用整数缓冲区，必须调用Integer.valueOf(..)
>
> 好处：节约内存

```java
Integer i = new Integer(3);
Integer ii = new Integer(3);
System.out.println(i==ii);  //false new不同地址，肯定是false

//整数缓冲区测试：-128~127之间  ，如果参数相同，则返回地址一致
Integer a = Integer.valueOf(3);
Integer b = Integer.valueOf(3);
System.out.println(a==b);  //true

Integer aa = Integer.valueOf(300);
Integer bb = Integer.valueOf(300);
System.out.println(aa==bb);  //false
```

### 五、总结与作业

#### 总结

```
1.匿名内部类（重点）
和多态一致，应用场景也一致
应用：直接引用，传参匿名内部类的使用
2.Object类的概述（重点）
概述，创建方式
3.Object常用方法
getClass:获取类对象，new的类型相同，则类对象一致
hashCode:不同对象有不同hash值返回--重写后返回属性hash值（重点）
toString:将对象以字符串返回--重写后返回属性的字符串拼接（重点）
equals: 比较地址是否相等---重写后比较属性是否相等（重点）
finalize:垃圾回收后的触发  
4.包装类
对基本类型的包装；包装类型转换；(重点) 字符串与其他类型的转换
整数缓冲区
```

#### 作业

```
1.Object类实现多态的方式有哪些？并给出案例

2.公司招聘微服务架构标准人才,匿名内部类具备该标准，请使用匿名内部类完成

3.实例化两个String对象，调用两次hashCode，返回的值为什么一致？如何做到的。
例如： 
new String("zs").hashCode();
new String("zs").hashCode();

4.实例化两个String对象，调用equals方法进行比较，为什么会返回true？如何做到的。
String s1 =new String("zs");
String s2 =new String("zs");
s1.equals(s2)---true
```

