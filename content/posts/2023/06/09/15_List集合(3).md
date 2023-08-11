---
title: List集合
Date: 2023-08-06
Categories:
- Java
tags:
- Collection
---

# List集合

### 一、Collection集合

> 昨天讲解了常用方法，今天继续扩充用法

#### 循环遍历

```java
//Colletion循环遍历：
Collection col = new ArrayList();
col.add(1);
col.add(3);
col.add(2);
//1.基本for--操作下标，不可以；无下标
for(int i=0;i<col.size();i++) {}

//2.增强for  foreach
for (Object obj : col) { //本质是迭代器-查反编译工具
    System.out.println(obj);
}
System.out.println("========");
//3.迭代器 
Iterator it = col.iterator();
while(it.hasNext()) { //判断是否有下一个元素
    System.out.println(it.next());  //有则取出，并移位 
}
```

#### 扩展

> Collection存自定义对象，扩展remove，contains方法的应用

```java
class Person{
	String name;
	public Person(String name) {
		this.name = name;
	}
	@Override
	public String toString() {
		return "Person [name=" + name + "]";
	}
	@Override
	public boolean equals(Object obj) {
		if(this.getClass()==obj.getClass()) {
			Person o = (Person) obj;
			return this.name.equals(o.name);
		}
		return false;
	}
}
public class Test2 {
	public static void main(String[] args) {
		//Collection扩展： remove，contains
		//使用Collection存储自定义类型，观察移除或包含的操作
		Collection col = new ArrayList();
		col.add(new Person("zs"));
		col.add(new Person("ls"));
		System.out.println(col);
		//contains内部用equals去比较是否包含，不重写，则此处调Object的equals比较地址
		//重写后，往往按比较属性
		System.out.println(col.contains(new Person("zs"))); //false
		System.out.println(col.remove(new Person("zs")));
		System.out.println(col);
	}
}
```

### 二、List集合

> List集合是Collection的子接口，在Collection标准基础上，扩充了一些与下标操作相关的方法
>
> 存储元素特点：有序，有下标，允许重复

#### 基本用法

```java
//List的基本操作及存储特点：
List list = new ArrayList(); //ArrayList是List的实现类
list.add(1);
list.add(3);
list.add(2);
list.add(2);  //允许重复
System.out.println(list); //1,3,2,2 有序

list.add(1, 666); //指定下标位置添加元素
System.out.println(list);
List list2 = new ArrayList();
list2.add(5);
list.addAll(1, list2); //指定位置存集合
System.out.println(list);

System.out.println(list.get(2)); //根据下标取元素
list.set(2, 999);  //指定位置的修改
System.out.println(list);

List list3 = list.subList(1, 3); //提取子集合
System.out.println(list3); //根据开始和结束下标提取集合，不包括结束下标

//除以上方法外，Collection接口中提供的方法依然能用
list.remove(0); //根据下标移除
System.out.println(list);
```

#### 循环遍历

```java
//List循环遍历：
List list = new ArrayList();
list.add(1);
list.add(3);
list.add(2);
//1.基本for
for(int i=0;i<list.size();i++) {
    System.out.println(list.get(i));
}
System.out.println("==========");
//2.增强for
for (Object o : list) {
    System.out.println(o);
}
System.out.println("=====ListIterator(扩展)=====");
ListIterator li = list.listIterator();  //有迭代器功能和反向遍历
while(li.hasNext()) { //判断是否有下一个
    System.out.println(li.next());  //有下一个则取出
}
System.out.println("-----------");
while(li.hasPrevious()) { //判断是否有上一个（在迭代器指向最后，才能用）
    System.out.println(li.previous()); //取出后，指向上一个
}
```

### 三、原理分析

> List有两个重要的实现类，ArrayList和LinkedList，他们的存储特点都是一致的，调用方法也相同；但是存储原理不同

#### ArrayList

> 存储原理：通过数组扩容方式进行存储
>
> 细化原理：当存储第一个元素，内部开是个数组空间用于存元素；当没空间了，则进行扩容，并拷贝原数组值，每次扩当前元素的一半。
>
> 通过画图分析+原码分析，理解ArrayList的存储原理
>
> 说明：数组是连续的空间，本身有下标标记，很容易就找到下标的元素

#### LinkedList

> 存储原理：通过双向链表方式存储
>
> 细化原理：每次存值，都开空间节点，准备三个属性，pre，data，next；data存值，pre节点指向上一个节点，next指向下一个节点；当存储第二个值，开空间，并将旧节点的next执行新节点，新节点的pre指向上一个节点；这样就构成了双向链表。
>
> 通过画图分析+原码分析，理解LinkedList的存储原理
>
> 说明：链表的空间不连续，通过上一个或下一个节点的指向去定位元素

### 四、List性能PK

> 在List接口中上面的两个实现类都可以完成存储数据的功能，除了存储功能，还有删除，查找，修改等功能，分析两个实现类的性能。
>
> 1. 添加
>
>    向后追加：ArrayList和LinekdList都需要开空间，ArrayList稍快
>
>    指定位置追加：ArrayList考虑集体搬迁  PK   LinkedList考虑定位（快）
>
> 2. 删除（下标删）
>
>    与指定位置追加类似，ArrayList要集体搬迁 ,LinkedList要定位；LinkedList快
>
> 3. 查找
>
>    查找就是定位；数组是连续内存空间，本身有下标标记，所以定位快；ArrayList快
>
> 4. 修改
>
>    修改=查找+赋值；ArrayList快

> 结论：后续常用ArrayList，因为常用操作是查找和向后追加

### 五、总结与作业

#### 总结

```
1.Collection集合
循环遍历-增强for，迭代器   扩展存自定义对象时的contains方法分析
2.List集合（重点）
存储特点：有序，有下标，允许重复；基本用法；循环遍历：基本for，增强for，迭代器
3.原理分析（重点）
ArrayList: 数组扩容
LinkedList: 双向链表
4.List性能PK（重点）
通过增删改查功能分析List实现类的应用场景
增删---LinkedList
查询，修改--ArrayList（向后追加也可用ArrayList）
```

#### 作业

```
1、创建多个Student对象，使用集合Collection进行保存，删除一个，遍历输出，再清空后，判断是否为空。
2、创建多个Student对象，使用集合List保存，实现类为ArrayList，进行添加、以下标添加、以下标获取对象并输出，以下标删除，以下标修改值。
3、创建多个Student对象，使用集合List保存，实现类为LinkedList，进行添加、以下标添加、以下标获取对象并输出，以下标删除，以下标修改值。
4、LinkedList独有方法：addLast/addFirst/removeFirst/removeLast等方法的调用
提示：LinkedList的独有方法，使用面向对象方式做
```

