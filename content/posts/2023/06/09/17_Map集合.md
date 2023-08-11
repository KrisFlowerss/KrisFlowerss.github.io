---
title: Map集合
Date: 2023-08-08
Categories:
- Java
tags:
- Map
---

# Map集合

### 一、扩展TreeSet应用

#### 比较器排序

> 昨天验证TreeSet原理时，使用了自然排序法；今天再将比较器法说明

```java
//TreeSet存储自定义对象，使用比较器法进行排序和确定唯一性
class Student{
	String name;
	int    age;
	public Student(String name,int age) {
		this.name = name;
		this.age  = age;
	}
	@Override
	public String toString() {
		return "Student [name=" + name + ", age=" + age + "]";
	}
}
public class Test1 {
	public static void main(String[] args) {
		Set<Student> set = new TreeSet<Student>(new Comparator<Student>() {
			@Override
			public int compare(Student o1, Student o2) {
				//规则：先按姓名的降序排列；姓名相同，则按年龄升序排列
				if(o1.name.equals(o2.name)) { //姓名相同，则按年龄升序
					return o1.age-o2.age;
				}
				return o2.name.compareTo(o1.name); //先按姓名的降序
			}
		});
		set.add(new Student("zs", 30));
		set.add(new Student("ls", 40));
		set.add(new Student("zs", 25));
		set.add(new Student("zs", 32));
		System.out.println(set);
	}
}
```

### 二、Map接口

#### Map概述

> 概述：和Collection同级的根接口，Collection子孙类都是存单个对象；Map接口子孙类存的都是两个对象(键值对)
>
> 应用场景：往往key是已知的（基本上key是String类型），value是未知的； 后续我们需要去配置文件中取值，key就是已知字符串；值是我们可以随意更换

> Map接口有两个重要的实现类： HashMap，TreeMap； 此外还有Hashtable，Properties

### 三、HashMap实现类

> 描述：HashMap是Map接口的实现类，集合中存储键值对
>
> 存储特点：key无序，无下标，唯一； 确定唯一性后，后面的value会覆盖前面的。

#### 基本应用

```java
//HashMap的基本应用:
Map<String, Integer> map = new HashMap<String, Integer>();
map.put("aa", 666);
map.put("cc", 999);
map.put("bb", 666);
map.put("bb", 999);  //key无序，唯一；key相等后，value会覆盖前面的
System.out.println(map);

System.out.println(map.get("cc")); //根据key获取value值

Collection<Integer> col = map.values(); //将所有value放入Collection集合
System.out.println(col);

//循环遍历:1.基本for---不行，无下标
//for(int i=0;i<map.size();i++) {}

//增强for： 不行，没有统一的类型;  迭代器也不行
//for(String key :map) {}

//只能间接循环： keySet   entrySet
//1.keySet:将所有key放入Set集合，然后循环根据key遍历出value
Set<String> set = map.keySet();
for (String key : set) {
    System.out.println(key+"--"+map.get(key));
}
System.out.println("=======================");
//2.entrySet:将键值对作为实体存到Set；再循环Set取出实体拿出里面的键值对
Set<Entry<String, Integer>> entries = map.entrySet();
for(Entry<String, Integer> entry:entries) {
    System.out.println(entry.getKey()+"=="+entry.getValue());
}
```

#### 原理分析

> HashMap的存储原理与HashSet是类似的，都是通过hash算法+数组+链表的方式
>
> 直接分析源码即可得出结论
>
> 结论：存储key的类要重写hashCode和equals才能确定唯一性

#### 验证原理

> HashMap存储key为自定义的对象验证唯一性； 注意后续key往往为String，此处只是为了验证原理

```java
//HashMap的key存储自定义对象：
class Student{
	String name;
	int    age;
	public Student(String name,int age) {
		this.name = name;
		this.age  = age;
	}
	
	@Override
	public String toString() {
		return "Student [name=" + name + ", age=" + age + "]";
	}
	@Override
	public int hashCode() {
		//...
		return result;
	}
	@Override
	public boolean equals(Object obj) {
		//...
		return true;
	}
}
public class Test2 {
	public static void main(String[] args) {
		Map<Student, Integer> map = new HashMap<Student, Integer>();
		map.put(new Student("zs", 13), 666);
		map.put(new Student("ls", 13), 999);
		map.put(new Student("zs", 20), 999);
		map.put(new Student("ls", 13), 999);
		System.out.println(map); //
	}
}
```

### 四、TreeMap实现类

> TreeMap的存储特点：key可排序，唯一；  确定唯一后，后面的值覆盖前面的

#### 基本应用

```java
//TreeMap的基本应用：
Map<String, Integer> map  = new TreeMap<String, Integer>();
map.put("aa", 11);
map.put("cc", 11);
map.put("bb", 11);
map.put("aa", 66);
System.out.println(map);   //3
System.out.println(map.get("cc"));  //根据key获取value

//循环遍历：keySet,entrySet
Set<String> set = map.keySet();
for(String key:set) {
    System.out.println(key+"=="+map.get(key));
}
System.out.println("-----------------");
Set<Entry<String, Integer>> ens = map.entrySet();
for(Entry<String, Integer> entry:ens) {
    System.out.println(entry.getKey()+"--"+entry.getValue());
}
```

#### 原理分析

> 存储原理：通过二叉树存储
>
> TreeMap的实现原理与TreeSet类似的，此处得出结论即可
>
> 结论：要有比较的规则：1.自然排序法（实现Comparable接口）  2.比较器法（扩展了解）

#### 验证原理

> TreeMap的key存储自定义对象，验证排序和唯一性的原理

```java
//TreeMap的key存储自定义对象，验证原理--有两个属性
class Student implements Comparable<Student>{
	String name;
	int    age;
	public Student(String name,int age) {
		this.name = name;
		this.age  = age;
	}
	@Override
	public String toString() {
		return "Student [name=" + name + ", age=" + age + "]";
	}
	@Override
	public int compareTo(Student o) {
		//规则：先按年龄降序排，年龄相同，则按姓名升序
		if(age==o.age) {
			return name.compareTo(o.name);
		}
		return o.age-age;
	}
}
public class Test2 {
	public static void main(String[] args) {
		Map<Student, Integer> map = new TreeMap<Student, Integer>();
		map.put(new Student("zs", 12), 666);
		map.put(new Student("zs", 12), 666);
		map.put(new Student("ls", 20), 666);
		map.put(new Student("ww", 12), 666);
		System.out.println(map); //不重写，则报错
	}
}
```

### 五、Map的整理

#### Map的选择

> HashMap与TreeMap的比较：
>
> 1. 优先选择HashMap，因为性能更高
>
> 2. 除非需要排序，才选择TreeMap； HashSet与TreeSet也类似

#### 应用案例

> 案例：有一个字符串，求出每个字符串的个数：  “ddcada”； 得出结果：d--3   a--2   c--1
>
> 分析：需要用到键值对，选择Map集合；没有排序的要求，则使用HashMap存储

```java
//案例：有一个字符串，求出每个字符串的个数：  “ddcada”； 得出结果：d--3   a--2   c--1
String a = "ddcada";  //将字符串转字符数组，再循环遍历
char[] cs = a.toCharArray();

Map<Character, Integer> map = new HashMap<>();//key为字符  值为次数
for(int i=0;i<cs.length;i++) {
    Integer count = map.get(cs[i]); //根据key获取value； 没有则返回null
    if(count==null) { //为空
        map.put(cs[i], 1); //存储1个
    }else { //不为null，次数+1
        map.put(cs[i], count+1);
    }
}
System.out.println(map);
```

### 六、其他Map集合

#### Map介绍

> 除类HashMap与TreeMap实现类以外，还有Hashtable和Properties集合

```java
//Hashtable：和HashMap类似，也是通过hash算法来存储
//区别在于Hashtable是线程安全，性能低；key或value都不能存null；多线程使用安全的HashMap
//HashMap是线程不安全，性能高；key或value都能存null--倾向于单线程使用
Map<String, Integer> map = new Hashtable<String, Integer>();
//map.put(null, 666);
//map.put("aa", null);

Map<String, Integer> map2 = new HashMap<String, Integer>();
map2.put(null, 666);
map2.put("aa", null);
System.out.println(map2);

//Hashtable有一个常用的子类--Properties
//应用：往往Properties通过面向对象的方式使用--里面提供了独有方法
//key和value一般都是String类型;  在IO流中会补充加载配置文件的用法
Properties p = new Properties();
p.put("aa", "11");
p.put("cc", "66");
p.put("bb", "55");
System.out.println(p);

Set<String> set = p.stringPropertyNames(); //类似keySet  将key放入Set集合
for(String key:set) {
    System.out.println(key+"--"+p.getProperty(key));
}
```

#### 集合汇总

```
Collection  VS  Map:          存单个对象             存键值对
Collections  VS Collection：  工具类                 集合接口  
List   VS    Set：            有序，有下标，可重复     无序，无下标唯一
ArrayList VS  LinkedList      数组扩容；查询修改快     双向链表； 增删快
Set   VS   Map                单个对象               存键值对
HashSet  VS   HashMap         对象无序，唯一          key无序唯一； 两者原理一致；具体实现Map完成
TreeSet  VS   TreeMap         对象可排序，唯一        key可排序唯一；两者原理一致；具体实现Map完成 
HashSet  VS   TreeSet         对象无序，唯一          对象可排序唯一
HashMap  VS   TreeMap         key无序，唯一          key可排序唯一  
```

### 七、异常

> 概述：程序的不正常的执行；会导致程序的崩溃

#### 分类

> 异常最大的根类为Throwable，下面的异常类都直接或间接继承Throwable
>
> Throwable：最大的异常类；包含错误异常和一般性异常
>
> Error： 硬件故障或JVM的内存耗尽的问题（死递归，死循环）；此类错误异常，无法处理
>
> Exception：一般性的异常，可以通过异常处理来解决；包含编译时和运行时异常
>
> 编译时异常：编译时出现异常，无法运行
>
> 例如：解析异常-日期格式
>
> 运行时异常：运行时才出现的异常，导致程序的奔溃
>
> 例如：空指针，下标越界，类型转换异常，算数异常，数字格式异常，输入不匹配异常

```java
//运行时异常：
//String a = null;
//a.length();  //NullPointerException 空指针异常

//Object o = 1;
//String a = (String)o;  //类型转换异常

//int[] a = {1,3};
//System.out.println(a[2]);  //下标越界

//int i = 1/0;  //算数异常

//int a = Integer.parseInt("abc");  //数字格式异常

//int a = new Scanner(System.in).nextInt(); //输入字符串--输入不匹配异常

//编译时异常：编译不通过，需要给出处理方案--可以抛出，真正出了问题则崩溃
SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
String strDate = "2023-08-09";
System.out.println(sdf.parse(strDate));//String->Date

System.out.println("最后的执行..");
```

#### 异常的产生

> 异常的产生有两种方式：1. 自动产生异常    2.手动产生异常

```java
//异常的产生：  自动产生
//int i = 1/0;   //运行时异常都是自动产生的异常

//手动产生异常：
/*
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		String strDate = "2023-08=09"; 
	 	System.out.println(sdf.parse(strDate));//String->Date
	 	*/

if(true) {
    throw new RuntimeException("手动产生运行时异常"); //抛出单个对象异常
}

System.out.println("执行...");
```

#### 异常处理

> 异常的处理有两种方式：1.抛出    2.捕获    
>
> 抛出：抛出不是真正意义上的处理，弃之不管，一旦出现问题则崩溃
>
> 捕获：捕获才是真正的处理异常，出现了异常，则进行捕获后，隔离异常，不影响后面代码的执行

```java
//异常的处理：捕获异常
/*
		 * try{
		 *    用于捕获代码
		 * }catch(Exception e){
		 *     如果出现异常则隔离
		 * }
		 * 
		 * */
//运行时异常捕获：
try {
    int i = 1/0;
}/*catch (NullPointerException e) {
			e.printStackTrace();
		} catch (ArithmeticException e) {
			//在后续项目中常用捕获，捕获后需要打印出捕获的信息
			e.printStackTrace();  //打印异常信息
		}*/ catch (Exception e) {

        }

//编译时的捕获
/*
	 	try {
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			String strDate = "2023-08=09";
			System.out.println(sdf.parse(strDate));
		} catch (ParseException e) {
			e.printStackTrace();
		}*/

System.out.println("最后执行...");
```

### 八、总结与作业

#### 总结

```

```

#### 晨考

```txt
晨考：
1.Map的put 方法的作用是放入一个键值对，如果键已存在则_覆盖value值_____，如果键不存在则_增加kv值_____。 
2.Map的get方法的作用是 获取value的值，get方法的参数放入_key值____，返回值给的是_对应key值的value____。 
3.List集合的主要实现类有__Linkedlist______、__Arraylist______，Set集合的主要实现类有__TreeSet______、__Hashset______,Map集合的主要实现类有_TreeMap_______、_ HashMap______。
4.HashSet集合判断两个元素相等的标准是_2____个,先_判断hash值是否相等____,再_使用equals方法进行比较_____.
5.List<String> a = new ArrayList<>(); 手写Iterator迭代
```

#### 作业

```
1.向TreeSet集合中加入5个员工的对象，根据员工的年龄（升序）进行排序，若年龄相同，再根据
工龄（降序）来排序，若工龄相同，根据薪水（降序）排序

2.
Map
key:	value:
tom	    CoreJava
John	Oracle
Susan	Oracle
Jerry	JDBC
Jim	    Unix
Kevin	JSP
Lucy	JSP

1） 使用一个Map，以老师的名字作为键，以老师教授的课程名作为值，表示上述 课程安排。 
2） 增加了一位新老师Allen 教JDBC 
3） Lucy 改为教CoreJava   
4） 遍历Map，输出所有的老师及老师教授的课程(Set<Map.Entry<String,String>>、Set<String> get(key)) 
5） 利用Map，输出所有教JSP 的老师


3. 集合中存储学生对象,属性有,学号,姓名,分数,请选择合适的集合进行存储,要求:
  (1). 先按分数的降序排列,如果分数相同,则按学号升序排列(给定多个分数相同的学生)
  (2). 求出学员的优秀人数,及优秀率; (达到80分及以上, 则为优秀)
  (3). 求出学员的及格人数,及及格率;(达到60分及以上, 则为及格)


4. 辽宁省、吉林省、黑龙江省、广东省
辽宁省、
沈阳、大连、鞍山、抚顺、本溪、丹东、锦州、营口,阜新
吉林省
吉林市、四平市、通化市、白山市、辽源市、白城市
黑龙江省
哈尔滨市,齐齐哈尔市,鸡西市,鹤岗市,双鸭山市,大庆市
广东省
广州，深圳，珠海，东莞，佛山，中山，惠州

要求使用键盘输入省的名称,得到所有的市  get方法
```

