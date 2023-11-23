---
title: Seata分布式
Date: 2023-11-23
Categories:
- cloud
tags:
- Seata
---

## 昨日回顾

### Seata 中AT模式

1、TM先TC注册一个全局事务ID，把这个XID在服务链路中传递

2、RM被调用后先向TC做一个本地事务的分支注册，和XID存在关系

3、记录undo_log表的数据，然后执行本地事务，向TC反馈本地事务的执行结果

4、最终由TC发送最终的提交


### Seata中TCC模式

1、远程调用预处理的方法的时候先给冻结100

2、然后继续处理业务

3、如果全部处理成功，调用远程的commit方法，取消解冻，然后扣减

4、如果由一个失败，调用远程的rollback方法，取消解冻



### 锁类型

悲观锁：在修改数据之前会加锁

乐观锁：在修改时间的时候不会加锁，在提交的时候回做一个判断。ABA的问题通过一个版本号来解决（CAS)



### Java中锁

同步锁：Java关键字，自动加锁，自动释放锁，没有锁中断，重量级(需要操作系统支持)。

LOCK：JDK提供的一个接口，手动加锁，手动释放，有锁中断机制，轻量级。

加锁锁的是对象，不是代码。



### 线程可见性

1、什么是线程可见性？

​	多个线程操作同一个资源同事，一个线程修改了资源，另一个线程拿不到最新的数据，所以两个线程之间是不可见的。



2、什么原因的导致的？

JMM，主内存，work内存。



3、如何解决

voliate关键字，加锁

## 今日内容

### 画图

~~~
https://www.processon.com/view/link/655ea22493553315d1117a11
~~~



### 抢购

总过有10件商品，卖出一件商品应该创建一个订单，卖完的数量库存为0，订单为10。

~~~Java
package com.ts.day23lock01native.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.PostConstruct;

@RestController
@RequestMapping("/native")
public class NativeSynController {

    @Autowired
    private StringRedisTemplate redisTemplate;

    private String stockKey = "seckill:%s:stock";
    private String orderKey = "seckill:%s:order";

    @PostConstruct // method-init
    public void init() {
        redisTemplate.opsForValue().set(String.format(stockKey, 10), "10");
        redisTemplate.opsForValue().set(String.format(orderKey, 10), "0");
    }

    @RequestMapping("/kill")
    public String kill(Integer id) throws Exception {

        // 1.查询秒杀商品的数量，根据商品id查询商品的数量
        Integer stock = Integer.parseInt(redisTemplate.opsForValue().get(String.format(stockKey, id)));

        // 2、判断库存是否充足
        if (stock >= 1) {
            // 库存-1，
            redisTemplate.opsForValue().decrement(String.format(stockKey, id));

            // 订单+1，
            redisTemplate.opsForValue().increment(String.format(orderKey, id));

            return "商品抢购成功，库存【" + redisTemplate.opsForValue().get(String.format(stockKey, id)) + "】，订单【" + redisTemplate.opsForValue().get(String.format(orderKey, id)) + "】";
        }
        return "商品抢购太火爆了，已经抢购完毕。。。";
    }
}
~~~



单个用户访问是没有问题

![image-20231123103126038](https://091023.xyz/2023/11/23/230202.webp)



### 高并发的情况下访问

![image-20231123103151533](https://091023.xyz/2023/11/23/230203.webp)

造成这个问题的原因是什么？

![image-20231123103608862](https://091023.xyz/2023/11/23/230204.webp)

典型高并发的问题。



### 如何解决这个问题

使用锁机制来解决

![image-20231123103814886](https://091023.xyz/2023/11/23/230205.webp)

有了锁就不会出现了多个线程同时操作的问题，在一个时间点上只有一个线程去做对比，扣减然后把锁释放，第二个线程才能进去。



~~~java
  @RequestMapping("/kill")
    public String kill(Integer id) throws Exception {
        //1 .枷锁
        lock.lock();

        try {
            // 2.处理
            return killProduct(id);
        } finally {
            // 3.释放锁
            lock.unlock();
        }
    }
~~~

 为什么加了finally后不用再写return null了？

如果有了catch快说明这个异常已经被处理了，所以需要返回内容出去。

如果没有catch快，他会认为这个异常没有被处理，就直接把异常信息返回出去了。



### 分布式在情况下测试

1、搭建集群

![image-20231123104942733](https://091023.xyz/2023/11/23/230206.webp)



2、负载均衡服务器

![image-20231123111225359](https://091023.xyz/2023/11/23/230206_1.webp)

3、测试

![image-20231123111244835](https://091023.xyz/2023/11/23/230206_2.webp)



4、不是有锁吗？为什么数据还有问题？

​	现在的锁是本地锁，只能锁住当前JVM中的对象，其他的线程从其他的JVM中也获取到了锁，结果两个线程都去Redis中作计算

![image-20231123111457049](https://091023.xyz/2023/11/23/230206_3.webp)	这种情况就要使用分布式锁来解决了。

### 分布式锁解决方案

分布式锁的解决方案必须要做到下面两点

1、锁的创建和锁的管理必须在同一个地方，然后每个服务都去锁的管理的地方去获取锁即可。

~~~
mysql/redis/zk
~~~



2、锁管理的这个组件(服务)必须要做到多个线程同时获取锁的时候要保证只能有一个获取成功。

### 使用redis setnx来实现分布式锁

![image-20231123141452080](https://091023.xyz/2023/11/23/230207.webp)	

![image-20231123141846781](https://091023.xyz/2023/11/23/230210.webp)

它是解决了多个线程只允许有一个插入成功，插入成功的代表拿到锁。



1、拿到锁后宕机了如何解决？

  通过设置过期时间，不手动释放，过期自动释放了。



2、过期时间设置多久呢？

​	过期时间设置少了，还没有处理完呢结果自动释放了，别人有拿到锁了。

  这个问题需要用定时任务来给这个锁续期



3、锁如何释放呢？

​      删除这个key就可以了。

​	  线程1拿锁成功，处理业务也成功，准备做释放锁的操作，此时锁刚号过期自动释放了，线程1又拿到了锁，此时才去执行释放锁的操作，最终把别人的锁给释放了。

​	  

 		解决上面的问题可以这样来，每个线程拿到的锁都是唯一(UUID)的，再删除的时候比对一下是否是自己的锁，如果是自己的锁就删除，不是自己的锁就不删。

~~~~java

// 1、获取锁标识
String uuid = UUIDUtils.getId();

// 2.拿锁
boolean lock = setnx("lock",uuid,3);

if(lock){
    try{
     // 3.处理业务
    }finally{
	   // 释放锁
        String redisLock = get(“lock”);
        if(uuid.equals(redisLock)){
            delete("lock");
		}
    }
}

~~~~



这个问题的根本原因在于原子性的问题，在做删除的这个动作的时候被打断了，中间有额外的做了两个操作(过期，拿锁)。



需要保证读取，对比，写入这三个操作的原子性。



Redis中提供了Lua脚本，可以把这三个操作写入到lua脚本中，执行lua脚本，redis的Lua脚本可以保证原子性。



### 为什么使用Redison来实现分布式锁

1、它给锁会设置默认的过期时间

2、会给锁自动续期

3、加锁，续期，释放全部采用lua脚本保证了他们的原子性

4、它也是LOCK接口的子类

5、它里面的锁也是非常的丰富