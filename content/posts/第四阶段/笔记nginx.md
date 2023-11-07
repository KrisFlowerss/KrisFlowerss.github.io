---
title: Nginx的集群
Date: 2023-11-07
Categories:
- Linux
tags:
- Linux
- Nginx
---

## 昨日回顾

### nginx作用

nginx也可以作为服务器，它擅长处理静态资源，非常稳定。

1、正向代理

2、反向代理

3、负载均衡

4、动静分离



### 日志

SL4j+Logback。

1、项目中的调试日志全部要用log的API输出，不能在用soumt。

2、开发阶段需要关注他的日志信息，所以需要设置它的级别为debug。

3、上线就必须要关注调试信息了，需要设置它的级别为error。

4、在logback.xml中配置了logback的配置信息



### nginx配置文件

全局属性块

事件快

HTTP快

​	server快：配置端口号

​        locaiton快：完成路由的



### nginx匹配流程

1、浏览器发送HTTP请求,http://192.168.147.135:80/index.html

2、先根据IP去找主机

3、再根据端口号定位，应用，80就找到了nginx。

4、nginx根据当前请求地址和locaiton快匹配、



### nginx实现正向代理

~~~nginx
location / {
   proxy_pass http://www.baidu.com
}
~~~

### nginx实现反向代理

```nginx
upstream name {
    server ip:port;
    server ip:port;
    server ip:port;
}

location / {
   proxy_pass http://name;
}
```



### nginx负载均衡

```nginx
upstream name {
    ip_hash;
    server ip:port weight=10;
    server ip:port;
    server ip:port;
}

location / {
   proxy_pass http://name;
}
```





## 今日内容

### 画图

~~~
https://www.processon.com/view/link/6548cda5e658150649e18720
~~~



### 动静分离

动态资源交给tomcat，静态资源交给nginx。

```nginx
# 所有以api开头的都是动态资源
location /api/ {
    proxy_pass http://name; # 反向代理到tomcat上面
}

#静态资源
location /js/{ # 交给nginx来处理
    root html/js/;
};
location /css/{
    root html/css/;
};
```


### 在Linux中安装redis

1、上传压缩包

2、解压缩

3、编译

~~~
make
~~~



4、安装

~~~
make install PREFIX=/usr/local/redis
~~~



5、修改配置文件

~~~
1、开启保护模式
2、设置密码
3、允许远程连接
4、修改redis在后台运行
~~~

![image-20231107102752643](https://091023.xyz/2023/11/07/210918_1.webp)

![image-20231107102912729](https://091023.xyz/2023/11/07/210919.webp)

![image-20231107103007395](https://091023.xyz/2023/11/07/210920.webp)



6、从源码包中拷贝一个redis的配置文件到二进制bin目录下面

![image-20231107102709858](https://091023.xyz/2023/11/07/210918.webp)



7、修改万配置文件后重启reids。

![image-20231107103048313](https://091023.xyz/2023/11/07/210921.webp)

### 部署RBAC服务端

1、必须要有环境

~~~
1、JDK
2、MySQL
3、数据库脚本也跑了
3、redis也有
~~~



2、利用postman做测试

![image-20231107103918895](https://091023.xyz/2023/11/07/210923.webp)	

### 访问后台接口需要经过nginx

![image-20231107104629210](https://091023.xyz/2023/11/07/210924.webp)

```nginx
upstream rbac-cluster {
    server localhost:8080;
}

server {
    listen 88;
    server_name localhost;

    # 动态请求都是/api开头的，全部交给tomcat
    location /api/ {
        proxy_pass http://rbac-cluster;
    }
}

```



### 部署前端

1、在本地确定下打包好的文件没有问题，有问题先在本地修改好了。

![image-20231107105746527](https://091023.xyz/2023/11/07/210926.webp)



2、下面我们要解决是	

![image-20231107105820558](https://091023.xyz/2023/11/07/210926_1.webp)

现在这个项目只能我自己访问，也就是说这个这些前端页面别人是访问不了的，所以我们需要上nginx去。

![image-20231107110002013](https://091023.xyz/2023/11/07/210927.webp)

3、在nginx中配置它的location

```nginx
 server {
    listen 88;
    server_name localhost;
    
    # 动态请求都是/api开头的，全部交给tomcat
    location /api/ {
        proxy_pass http://rbac-cluster;
    }

    # 配置静态资源
    location / {
        root html/rbac-vue;
        index index.html;
    }
}
```



### RBAC服务端搭建集群

目前断只有一个，单台tomcat的并发量是2000，那它的PQS=2000。

一段时间后用户量猛增，实际的QPS=5000了。

![image-20231107142228597](https://091023.xyz/2023/11/07/210929.webp)

多给了一个-D的参数，运行jar包的时候就会替换掉原本配置文件中的端口号。

![image-20231107142546559](https://091023.xyz/2023/11/07/210929_1.webp)	



需要让nginx来做负载均衡

![image-20231107142607175](https://091023.xyz/2023/11/07/210930.webp)



### 内网穿透

此时如果我们的虚拟机是云主机，它本身就有一个IP，这个IP是可以任何时候都可以访问的。

只需要给你绑定一个域名即可。假设我们云主机的IP是10.20.3.1。

1、购买一个域名，上万网。

2、需要把IP和域名绑定

~~~
qf-rbac.info ==>10.20.3.1
~~~

3、对外的地址

~~~
http://www.qf-rbac.info;
~~~



内网穿透它能解决的问题就是把一个内网给你映射外网，把外网地址发送给你你就可以访问了。

内网(局域网)，外网(互联网)：



1、注册和安装

natapp/花生壳都可以实现内网穿透。

~~~
https://natapp.cn/
~~~

![image-20231107143732384](https://091023.xyz/2023/11/07/210937.webp)

![image-20231107143800580](https://091023.xyz/2023/11/07/210939.webp)

![image-20231107143903993](https://091023.xyz/2023/11/07/210940.webp)

![image-20231107143925590](https://091023.xyz/2023/11/07/210942.webp)	



![image-20231107144034516](https://091023.xyz/2023/11/07/210943.webp)

```
#将本文件放置于natapp同级目录 程序将读取 [default] 段
#在命令行参数模式如 natapp -authtoken=xxx 等相同参数将会覆盖掉此配置
#命令行参数 -config= 可以指定任意config.ini文件
[default]
authtoken=d6a3890847b23ca9       #对应一条隧道的authtoken
clienttoken=                    #对应客户端的clienttoken,将会忽略authtoken,若无请留空,
log=none                        #log 日志文件,可指定本地文件, none=不做记录,stdout=直接屏幕输出 ,默认为none
loglevel=ERROR                  #日志等级 DEBUG, INFO, WARNING, ERROR 默认为 DEBUG
http_proxy=                     #代理设置 如 http://10.123.10.10:3128 非代理上网用户请务必留空
```



2、配置把本机的那个端口映射成外网。

![image-20231107144213637](https://091023.xyz/2023/11/07/210945.webp)

![image-20231107144306786](https://091023.xyz/2023/11/07/210946.webp)	



![image-20231107144502841](https://091023.xyz/2023/11/07/210947.webp)

### 搭建Nginx高可用

​	之前搭建RBAC项目都是为集群，因为三个实例都是放在同一个虚拟机的，真真的集群是每个虚拟机中都有一个服务。

 所以我们需要准备两台虚拟机，

​	先把一台虚拟机的上的所有的环境都配置好（nginx,keealived,服务端)。然后基于这个服务器拷贝一份出来。



![image-20231107152949489](https://091023.xyz/2023/11/07/210948.webp)

这样Master计算式搭建好了。

基于Master拷贝一份出来做备备用机即可。

![image-20231107153119472](https://091023.xyz/2023/11/07/210948_1.webp)



![image-20231107153213616](https://091023.xyz/2023/11/07/210949.webp)



克隆完成后首先需要改变的就是IP改成192.168.147.136。



![image-20231107160116406](https://091023.xyz/2023/11/07/210950.webp)



Keepalived是如何实现高可用的？

1、它会基于服务器网卡创建一个虚拟机主机

​	a)主和备服务创建的虚拟机主机的IP都是一样的。

2、主备服务器的优先级不一样。

​	 请求过来后主备都在的情况下优先打给优先级更高的。

3、主备都有脚本来监测nginx是否运行的





### BaseUrl如何变成动态的？

既然要变成动态的，就要从服务端查询了。

顶一个前段的配置服务，把前段用到的动态的内容全部的配置到这个服务中。

只需要配置服务的IP和端口号变就可以。

1、先到配置服务中查询baseUrl

2、保存到本地

3、发送请求的时候再从本地取出来，拼接上url就可以了。



### nginx的进程模型

为什么nginx要设计成两个进程呢？一个叫做master，一个叫做work。

![image-20231107164312226](https://091023.xyz/2023/11/07/210951.webp)

一个请求打给nginx后，这两个进程都各自干什么事情？




### 同步异步

~~~
https://www.yuque.com/jtostring/ep2g5u/rtm5zqon3f26yw6i?singleDoc# 《同步、异步、阻塞、非阻塞怎么理解？》
~~~

