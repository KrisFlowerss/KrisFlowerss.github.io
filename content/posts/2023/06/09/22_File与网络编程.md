---
title: File与网络编程
Date: 2023-08-13
Categories:
- Java
tags:
- File
- IO
---

# File与网络编程

### 一、IO汇总

#### 写法整理

> 字节流：以stream结尾
>
> 抽象类：OutputStream/InputStream
>
> 字节节点流：FileOutputStream/FileInputStream
>
> 字节缓冲流：BuferedOutputStream/BufferedInputStream
>
> 对象流： ObjectOutputStream/ObjectInputStream

> 字符流： 以Writer/Reader结尾
>
> 抽象类：Writer/Reader
>
> 字符节点流：FileWriter/FileReader
>
> 字符缓冲流：BufferedWriter/BufferedReader
>
> 字符输出流：PrintWriter
>
> 字符转换流：OutputStreamWriter/InputStreamReader

#### 应用场景

> 数据量小的内容拷贝使用字节节点流，例如图片拷贝；  只是拷贝简单文本内容则使用字符节点流
>
> 读写内容较大的二进制，且需要考虑性能则使用字节缓冲流； 非二进制或读写换行则用字符缓冲流
>
> 从字节流转字符流，或需要乱码处理，则使用转换流； 
>
> 读写对象内容，则使用对象流；
>
> 简单的换行打印输出，则使用输出流；
>
> 结论：常用的流--字节节点流，字节缓冲流，字符缓冲流

### 二、File类

> 概述：和IO的读写无关，File类主要获取文件或目录本身的属性信息
>
> 应用：实例化对象(传路径)，然后调用常用方法

#### 常用方法

```java
//获取文件名，获取路径，是否可读，是否可写；是否存在；是否为文件，是否为目录；创建目录，创建文件...
//File类的常用方法:
//相对路径：相对于当前位置的路径；例如此处相对当前工程目录下的a.txt
//绝对路径：从盘符出发指定的路径
File file = new File("a.txt"); //传相对路径
System.out.println("是否可读："+ file.canRead());
System.out.println("是否可写："+ file.canWrite());
System.out.println("是否隐藏："+ file.isHidden());
System.out.println("是否为文件："+ file.isFile());
System.out.println("是否为目录："+ file.isDirectory());
System.out.println("是否存在："+ file.exists());
System.out.println("长度："+ file.length());
System.out.println("获取文件名："+ file.getName());
System.out.println("获取绝对路径："+ file.getAbsoluteFile()); //带判断
System.out.println("获取父目录:"+file.getParentFile());
System.out.println("获取相对路径："+ file.getPath()); 

//System.out.println("删除文件或空目录："+ file.delete());
System.out.println("文件重命名："+ file.renameTo(new File("b.txt")));
```

#### 创建文件或目录

```java
//案例：创建多级目录下的文件： a/b/a.txt
//分析：先获取上一级目录，判断是否存在，如果不存在则创建；才能创建子文件
File file = new File("a/b/a.txt");
File parent = file.getParentFile(); //a/b 获取父目录
if(parent!=null&&!parent.exists()) {//如果上一级目录不为null且不存在，则创建
    if(parent.mkdirs()) { //创建一级或多级目录
        System.out.println("创建目录成功~");
    }
}
if(!file.exists()) {  //如果文件不存在，则创建
    if(file.createNewFile()) {
        System.out.println("创建文件成功~");
    }
}
```

#### 查找文件

```java
//案例：遍历当前目录层下的文件和目录，并找出txt文件
//分析：调用file方法，得到数组或容器；然后循环遍历每个File对象，并判断
//判断是否为文件；是否以txt结尾
File file = new File("a"); 
/*
		File[] fs = file.listFiles();  //调方法返回容器
		for(File f:fs) { //循环遍历File对象
			//判断是否为文件；是否以txt结尾
			if(f.isFile()&&f.getName().endsWith("txt")){
				System.out.println(f);
			}
		}*/

System.out.println("-----------文件过滤器-----------");
File[] fs = file.listFiles(new FileFilter() {
    @Override
    public boolean accept(File pathname) {
        //false-过滤  true-存数组
        return pathname.isFile()&&pathname.getName().endsWith("txt");
    }
});
System.out.println(Arrays.toString(fs));
```

### 三、文件递归

```java
public static void main(String[] args) {
    //案例：遍历当前目录层下的所有子文件和子目录，并找出txt文件
    //分析：有循环规律--递归（循环调自己-设计方法），空目录（出口）
    //此处只能用递归才能更好的完成多级遍历（递归往往就是用在文件的操作中-其他地方基本不会涉及）
    f(new File("a")); //传入的File对象应该是目录
}
private static void f(File dir) {
    File[] fs = dir.listFiles(); 
    for(File file :fs) {
        if(file.isFile()) { //如果是文件
            if(file.getName().endsWith("txt")) {
                System.out.println(file);
            }
        }else {  //如果是目录
            f(file); //递归调自己
        }
    }
}
```

### 四、Properties使用

> Properties是Map集合，确切的说是Hashtable的子类，主要用于存键值对；往往key和value都存字符串。
>
> 应用场景：从配置文件中加载数据，或存储数据到配置文件

```java
//Properties集合的使用：
Properties p = new Properties();
p.put("aa", "111");
p.put("cc", "777");
p.put("bb", "333");
System.out.println(p);

//可以将集合的数据，存储到文件中
p.store(new FileOutputStream("a.txt"), "666");  //参数2：描述内容

//将文件中的数据进行加载
Properties properties = new Properties();
properties.load(new FileInputStream("a.txt"));
Set<String> set = properties.stringPropertyNames(); //把所有key放入Set
for(String key :set) {
    System.out.println(key+":"+properties.getProperty(key));
}
```

### 五、网络编程理论

#### 网络概念

> 网络：由点和线构成的网状结构
>
> 计算机网络：不同区域的计算机，通过线路连接，能够实现数据通讯和资源共享
>
> 网络编程：实现数据通讯和资源共享的具体技术

#### 网络模型

> 网络模型是传输数据过程中的模型结构，由软件和硬件组成。
>
> 网络模型共有两种模型：OSI七层模型、TCP/IP四层模型
>
> 七层模型：应用层，表示层，会话层，传输层，网络层，数据链路层，物理层
>
> 四层模型：应用层、传输层，网络层、网络接口层
>
> 结论： 上层都是软件层面，下层数据链路和物理层是硬件层面

#### 编程三要素

> 网络编程三要素，在网络编程中需要用到，包括：IP，Port，协议

> IP：计算机的唯一识别
>
> IP分为IPV4和IPV6两种，IPV6是在IPV4的基础上进行扩充，所表示的ip地址更宽泛
>
> 但现在依然还是使用IPV4
>
> 分类：A~E类，网络段逐渐增加，主机段逐渐减少；常用C类网
>
> 回环地址：127.0.0.1， 代表的是当前的IP地址
>
> DOS指令描述： ipconfig-查看ip地址       ping  ip地址，测试电脑间是否能通信

> Port: 通讯软件的唯一标识
>
> 端口范围：0~65535
>
> 在使用或保留的端口：0~1023
>
> 可以使用的端口：1024~65535 ；  除去几个特殊端口，例如：3306,1521,8080等

> 协议：在传输层的协议约定，主要包括tcp和udp协议
>
> tcp：建立连接，安全可靠的协议，效率低--------案例：打电话
>
> udp：无连接协议，不安全的协议，效率高-------案例：发短信

### 六、网络编程

#### INetAddress

> 获取IP地址的类

```java
InetAddress net = InetAddress.getLocalHost(); //获取本地ip
System.out.println(net);

//net = InetAddress.getByName("www.baidu.com"); //根据主机或域名获取ip
//System.out.println(net);

//根据主机或域名获取所有ip
InetAddress[] nets = InetAddress.getAllByName("www.baidu.com");
System.out.println(Arrays.toString(nets));

System.out.println(net.getHostAddress()); //获取主机地址

System.out.println(net.getHostName());  //获取主机名
```

#### 传输数据

> 在网络编程中，往往tcp编程比较常用，TCP编程也叫Socket编程，通过Socket建立连接
>
> TCP编程通讯模型：客户端-服务器

> 服务器接收数据：

```java
//实例化服务器的socket，并指定自身端口9999
ServerSocket ss = new ServerSocket(9999);
System.out.println("监听9999端口...");
Socket socket = ss.accept(); //阻塞 调用监听方法，如果简单到客户端访问，在继续往下执行
System.out.println("有一个客户端连接过来了...");

//服务器-----接收数据
InputStream is = socket.getInputStream();
byte[] b = new byte[1024];
int len = is.read(b); //读取数据
System.out.println(new String(b, 0,len)); //byte[]转String
Utils.closeAll(is,socket,ss);
```

> 客户端发送数据：

```java
Socket socket = new Socket("127.0.0.1", 9999);
System.out.println("客户端连接成功...");

//客户端--发送数据
OutputStream os = socket.getOutputStream(); //使用socket获取输出流
os.write("xxxx777777".getBytes()); //将数据从socket中写出去
Utils.closeAll(os,socket);   //统一资源关闭，先关小的再关大的
```

### 七、总结与作业

#### 总结

```

```

#### 作业

```java
1.将字节流转换为字符缓冲流，并进行换行读写内容
2.使用File,输出文件的父路径,绝对路径，文件名，长度等
3.使用File创建文件/文件夹
4.使用FileNameFilter接口完成后缀为txt文件的查找

选做（不交）：
5.删除指定目录，注意，非空目录不能直接删除，需要先将文件删除后，才能删除空目录--使用递归删除
```

#### 晨考

```
晨考：
1.什么是计算机网络？ 网络编程主要完成什么功能
答：计算机网络不同区域的计算机，通过线路连接，能够实现数据通讯和资源共享。
2.网络模型的TCP/IP四层模型有哪些？
应用层、传输层，网络层、网络接口层
3.网络编程三要素是哪三个？ 分别有什么含义
```

