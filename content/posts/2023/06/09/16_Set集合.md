---
title: Set集合
Date: 2023-08-07
Categories:
- Java
tags:
- Set
---

# Set集合

### 一、List实现类补充

#### Vector

> 描述：和ArrayList类似，都是通过数组扩容进行数据存储；区别在于Vector加了锁；
>
> 与ArrayList的区别：
>
> Vector： 安全，性能低；在多线程中数据不会混乱；只是被ArrayList所取代(后面学习线程安全ArrayList)
>
> ArrayList：不安全，性能高；倾向于用在单线程中

```java
//和ArrayList的操作是类似的(扩展)
List list = new Vector();
list.add(1);
list.add(3);
list.add(2);
for (Object object : list) {
    System.out.println(object);
}
//Vector除了上述功能外，自身也提供了存储和遍历的方法
Vector vector = new Vector();
vector.addElement(5);
vector.addElement(2);
vector.addElement(8);
Enumeration enumer = vector.elements();  //枚举器遍历
System.out.println("===============");
while(enumer.hasMoreElements()) { //和迭代器类似
    System.out.println(enumer.nextElement());
}
```

### 二、泛型

> 后续经常要使用泛型集合，在泛型集合中直接进行泛型应用；泛型设计则是先设计，再进行使用

#### 泛型集合

> 概述：用于约束集合中存储的类型是同一种类型

```java
//案例: 通过集合存储自定义对象，来引出泛型
//需求：存了自定自定义对象后，循环遍历，取出属性---问题：假设存一个非Student类型？
//处理方案：使用泛型约束存储类型
//使用泛型的好处：不用强转，更安全；约束了类型，更规范；使程序更健壮
class Student{
	String name;
	
	public Student(String name) {
		this.name = name;
	}
}
public class Test1 {
	public static void main(String[] args) {
		List<Student> list = new ArrayList<>();
		list.add(new Student("张三丰"));
		list.add(new Student("灭绝"));
		list.add(new Student("张无忌"));
		//list.add("赵敏"); //从源头上规避了存储其他类型
		for (Student st : list) {
			//Student st = (Student) obj; //强转后，取出本身类型
			System.out.println(st.name); //不用强转，直接取出本身类型
		}
	}
}
```

#### 泛型设计

> 泛型描述：相当于参数化类型
>
> 泛型分类：泛型接口，泛型类，泛型方法
>
> 语法：<T>    说明：<>里面是一个大写字母，一般为T(自定义)、E（集合中）； 键值对则使用 K和V

```java
//泛型接口：
interface MyList <T>{ //定义了泛型T，在使用时，即可约束使用的类型
	void add(T t);  //往往泛型作为参数或返回值来使用
}
//泛型类：
class MyArrayList<T> implements MyList <T>{
	@Override
	public void add(T t) {
		System.out.println("模拟集合存存元素");
	}
    
    public <E> void Test1(E e){ //泛型方法 <E>
		//T t = e;  //不同的泛型不能赋值
	}
}
//泛型方法：
class MyClass{
	public <T> T test(T t) {
		System.out.println("泛型方法");
		return t;
	}
}
public class Test2 {
	public static void main(String[] args) {
		//使用类泛型类或泛型接口的设计，往往约束传参的类型为同一种类型
		MyList<Integer> list = new MyArrayList<>();
		list.add(666);
		list.add(111);
		
		MyClass class1 = new MyClass();
		class1.test(666); //泛型方法的使用
		
	}
}
```

### 三、Collections工具类

> Collections：集合工具类； 里面提供了除集合存取以外的方法

```java
//常用方法：
List<Integer> list = new ArrayList<Integer>();
list.add(1);
list.add(3);
list.add(2);
Collections.sort(list);  //排序
System.out.println(list);  //1，2，3

Collections.reverse(list);  //集合元素反转
System.out.println(list);  //3,2,1

Collections.shuffle(list); //随机重置（了解）
System.out.println(list);

//扩充：sort中是如何针对对象排序的？
//存储Integer其实是对象，要重写比较的方法，按照对象的内容来排的
//<T extends Comparable<T>>:说明Integer必须要实现Comparable接口
//<T extends Comparable<? super T>>:说明Integer或父类必须实现Comparable接口
```

### 四、Set接口之HashSet

> Set接口：Collection的子接口，Set接口没有提供抽象方法，全部继承Collection
>
> Set的特点：无序、无下标，唯一
>
> 两个实现类都可以实现该特点：HashSet, TreeSet

#### 基本应用

```java
//基本使用：
Set<Integer> set = new HashSet<Integer>();
set.add(11);
set.add(33);
set.add(22);
set.add(22);  //唯一
System.out.println(set);  //HashSet特点：无序，唯一
//Set是Collection的子接口，所以Collection的常用方法，Set可完全继承

//循环遍历：1.基本for   无下标，不能使用
//for(int i=0;i<set.size();i++) {}

//增强for：有增强for，所以肯定有迭代器
for (Integer integer : set) {
    System.out.println(integer);
}
```

#### 分析原理

> HashSet存储方式：hash算法+数组+链表
>
> 细化原理：
>
> 存储的对象要得到hash值，hash值在hash表中(数组)得到一个下标位置；判断该下标位置是否有值，如果没有则直接存储；如果有，与该位置的链表元素一一比较；如果相等，则退出，确定唯一性；如果都不相等，则存储到该链表中。
>
> 分析规则： 画图分析+原码分析
>
> 结论：存储的元素要确定唯一性，则必须重写hashCode和equals

#### 验证原理

> 通过HashSet存储自定义对象，来验证，是否需要重写hashCode和equals才能确定唯一性

```java
//验证HashSet存储原理：
//结论：存储自定义对象，该对象的类必须重写hashCode和equals，重写后，按属性来匹配
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
		//...系统产生
		return result;
	}
	@Override
	public boolean equals(Object obj) {
		//...系统产生
		return true;
	}
}
public class Test2 {
	public static void main(String[] args) {
		Set<Student> set = new HashSet<Student>();
		set.add(new Student("zs", 30));
		set.add(new Student("ls", 20));
		set.add(new Student("zs", 30));
		System.out.println(set); //几个？
	}
}
```

#### LinkedHashSet

> LinkedHashSet也是Set接口的实现类，是HashSet的子类；存储方式与HashSet类似，就是调用父类的方法实现的。（了解）
>
> 存储特点：有序，唯一

```java
//LinkedHashSet:HashSet的子类； 特点：有序，唯一
public class Test3 {
	public static void main(String[] args) {
		Set<Integer> set = new LinkedHashSet<Integer>();
		set.add(1);
		set.add(5);
		set.add(3);
		set.add(2);
		set.add(1); //唯一性
		System.out.println(set); //[1, 5, 3, 2]  有序
	}
}
```

### 五、TreeSet实现类

> Set接口的另一个重要实现类-TreeSet
>
> 存储特点：可排序，无下标，唯一

#### 基本应用

```java
//TreeSet基本应用
Set<Integer> set = new TreeSet<Integer>();
set.add(11);
set.add(33);
set.add(22);
set.add(22);
System.out.println(set);  //[11, 22, 33]  可排序，唯一

//循环遍历:  1.基本for--没有基本for（无下标）
//for(int i=0;i<set.size();i++) {}

//2.增强for  可以有--迭代器一样也有
for (Integer integer : set) {
    System.out.println(integer);
}
```

#### 分析原理

> TreeSet的存储方式：二叉树
>
> 细化原理：存第一个元素时，作为根节点；再次存储，则于根比较；比根大则放右边，比根小放左边；查看左/右子树是否有节点，如果没有，则直接存；如果有节点，则继续比较；依次类推；如果找到相等的，则退出，确定唯一性；否则，比较到最后，存进来。
>
> 分析规则：画图分析+源码分析
>
> 结论：存自定义对象主要要看比较的规则：1.自然排序法(Comparable接口)     2.比较器法

#### 验证原理

> TreeSet存储自定义对象，验证原理，看是否能确定唯一性和排序
>
> 自定义的类只有一个属性的情况：

```java
//自定义类为一个属性的情况：
//说明：存储自定义对象，自定义类要么实现Comparable接口；要么使用比较器
class Student implements Comparable<Student>{
	String name;
	public Student(String name) {
		this.name = name;
	}
	@Override
	public String toString() {
		return "Student [name=" + name + "]";
	}
	@Override
	public int compareTo(Student o) { //重写的比较方法中，只要返回结果于源码对应上即可
		//将对象的比较，转成属性的比较
		//String的compareTo：前面的小返回<0  前面的大则返回>0  相等则返回0
		//return this.name.compareTo(o.name); //返回<0则存左子树；>0则存右子树；=0唯一性
		
		return o.name.compareTo(this.name);  //比较规则反过来则是降序排列
	}
} 
public class Test2 {
	public static void main(String[] args) {
		Set<Student> set = new TreeSet<Student>();
		set.add(new Student("zs"));
		//ClassCastException: Student cannot be cast to Comparable
		set.add(new Student("ls"));
		set.add(new Student("ww"));
		set.add(new Student("zs"));
		
		System.out.println(set);
	}
}
```

> 自定义类有两个属性的情况：

```java
//自定义类有两个属性：比较使，按两个属性的规则来比
//比较规则，按两个属性来比较
class Man implements Comparable<Man>{
	String name;
	int    age;
	public Man(String name,int age) {
		this.name = name;
		this.age  = age;
	}
	@Override
	public int compareTo(Man o) {
		//规则：先按姓名的升序比较；如果姓名相同，再按年龄降序比较
		if(this.name.equals(o.name)) {
			return o.age-this.age; //int类型直接用-比较
		}
		return this.name.compareTo(o.name);
	}
	@Override
	public String toString() {
		return "Man [name=" + name + ", age=" + age + "]";
	}
}
public class Test3 {
	public static void main(String[] args) {
		Set<Man> set = new TreeSet<Man>();
		set.add(new Man("zs", 20));
		set.add(new Man("ls", 20));
		set.add(new Man("zs", 20));
		set.add(new Man("ls", 30));
		set.add(new Man("ls", 25));
		System.out.println(set);
	}
}
```

### 六、总结与作业

#### 总结

```

```

#### 作业

```
1.将TreeSet存两个属性对象课堂案例中的比较方式进行变更，先按年龄的升序比较，如果年龄相同，则按姓名的降序比较
2.自己重写对象Student的hashCode和equals方法,保证在set集合中能正确判断是否重复
3.两个HashSet集合中存储字符串元素，集合A:"zs","ls"   集合B:"zs","ww",
  最终使用新的hashSet集合得到交集的“zs”
4.创建一个Student类，有成员变量name和分数(Double类型)。如果两个学生对象的姓名和分数一样视为同一个学生，
先按姓名的降序排，如果姓名相同，则按分数的升序排；
提示：--分数属性使用Double，可使用compareTo方法
```

