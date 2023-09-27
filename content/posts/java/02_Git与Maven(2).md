---
title: Git与Maven
Date: 2023-09-26
Categories:
- Java
tags:
- Maven
- Git
---

# Git与Maven

### 一、分支

#### 创建分支

> 只要产生了提交点，则会对本地库产生一个分支，默认为master
>
> 我们可以通过指令创建及切换分支，如下所示：（远程库和本地库类似，都有分支）

```shell
git branch        #查看分支
git branch dev    #创建分支
git checkout dev  #切换分支
```

#### 细节

> 如果创建了分支，则创建的分支与master分支在同一个提交点上；
>
> 创建完分支后，继续进行提交，则master和创建的分支不在同一个提交点上
>
> 测试案例如下所示：

```shell
#创建了dev分支后，在本地库变更新内容，例如创建d.txt;再使用dev分支提交
git add .
git commit -m "666"
#切换到master分支，master分支看不到dev分支创建的d.txt
git checkout master
```

### 二、IDEA关联GIT

#### 概述

> idea关联git的操作，和前面的DOS测试类似；需要创建本地库（当前项目作为本地库），再进行推送和拉取即可。

#### 应用

> 创建web项目，然后在工程中创建.gitignore放置要忽略的文件，例如: *.jar, out, *.war等文件
>
> 检查git是否集成到IDEA工具中： 在Settings的版本库中查看，如果没有集成，则手动配置
>
> 创建java代码，然后初始化本地库，并进行提交
>
> 关联远程仓库，再推送到远程仓库
>
> 另一个客户端可以克隆远程仓库中的所有内容；然后该客户端变更内容后，提交并推送
>
> 其他客户端则可拉取新推送的内容

#### 冲突问题

> 客户端1修改了A文件内容并提交和推送到远程仓库；客户端2也改了A文件内容并进行提交，先拉取远程仓库，发现和自身提交的冲突了，这时需要解决冲突，双方探讨需要使用谁修改的。
>
> 如果使用远程的，则会覆盖当前提交点；如果使用自己的，则可推送后覆盖远程的。

#### 多人协同开发

> 项目经理需要在远程仓库中，绑定多个成员；(码云最多5人，多了则付费)
>
> 具体的操作，和上面的应用案例类似。
>
> 注意：每次的推送前，都需要先拉取，再推送。

### 三、Maven介绍

#### 引言

> 之前的项目管理中，有什么问题？
>
> 导包的麻烦问题，尤其是依赖包没有导全，则会出现报错，很难找出问题。
>
> 且项目升级后，需要删除之前的jar包，并导入新的jar包，这个过程非常麻烦。

#### maven介绍

> maven的主要用途：依赖管理（管理jar包-关键）和项目构建（编译，打包，部署，测试）
>
> 使用maven后，如果jar包没有导全，则会自动关联依赖的jar包
>
> 应用：maven项目是通过pom文件来配置依赖jar包；在pom文件中只要设置了坐标，则会自动下载需要的依赖包，如果不用了，删除该坐标，对应的jar包自动删除

#### maven安装

> 将maven文件下载后解压，放置指定英文位置：D:/maven下
>
> 配置maven的环境变量，这样在任意位置都可使用maven指令

```
MAVEN_HOME : D:\maven\apache-maven-3.5.4
pATH中引入路径： %MAVEN_HOME%\bin

使用指令查看版本：
mvn -v
```

#### maven配置

> 需要在Settings.xml中进行配置：配置本地仓库(存jar包)，镜像（下载jar包），配置jdk版本

```xml
<!-- 选择一个磁盘目录，作为本地仓库 -->
<localRepository>D:\maven\myrepository</localRepository>
```

```xml
<mirror>
    <id>aliyun</id>  
    <!-- 中心仓库的 mirror(镜像) -->
    <mirrorOf>central</mirrorOf>    
    <name>Nexus aliyun</name>
    <!-- aliyun仓库地址 以后所有要指向中心仓库的请求，都会指向aliyun仓库-->
    <url>http://maven.aliyun.com/nexus/content/groups/public</url>  
</mirror>
```

```xml
<profiles>
    <!-- 在已有的profiles标签中添加profile标签 -->
    <profile>    
        <id>myjdk</id>    
        <activation>    
            <activeByDefault>true</activeByDefault>    
            <jdk>1.8</jdk>    
        </activation>    
        <properties>    
            <maven.compiler.source>1.8</maven.compiler.source>    
            <maven.compiler.target>1.8</maven.compiler.target>
            <maven.compiler.compilerVersion>1.8</maven.compiler.compilerVersion> 
        </properties>    
    </profile>
</profiles>

<!-- 让增加的 profile生效 -->
<activeProfiles>
    <activeProfile>myjdk</activeProfile>
</activeProfiles>
```

### 四、仓库

#### 仓库分类

> 仓库分为本地仓库与远程仓库。
>
> 项目中需要jar包，优先找本地仓库；如果没有再找远程；
>
> 远程仓库包括：私服，公共仓库（国内仓库，例如，阿里云），中央仓库（国外的仓库）
>
> 优先级： 本地>私服>公共>中央

#### IDEA关联Maven

> 创建maven项目，创建当期项目的GAV坐标。
>
> 导入maven中的Settings.xml配置，导入后，只需要在pom.xml中生成坐标即可

```xml
<!-- 默认生成jar项目（javase项目）；war则是web项目 -->
<packaging>jar</packaging>

<!-- 导入依赖坐标，自动从本地库下载，如果没有则到公共仓库下载 -->
<dependencies>
    <!-- io流的依赖jar包 -->
    <dependency>
        <groupId>commons-io</groupId>
        <artifactId>commons-io</artifactId>
        <version>2.6</version>
    </dependency>
</dependencies>
```

### 五、创建Web项目

#### 配置

> 1. pom文件中，需要将jar包改成war包
> 2. 在main目录下创建webapp/WEB-INF，并创建web.xml模板
> 3. 使用坐标导入Servlet，jsp，jstl等web依赖
> 4. 配置web的运行及创建Servlet代码，和之前非maven项目配置一致

```xml
<!-- 默认生成jar项目（javase项目）；war则是web项目 -->
<packaging>war</packaging>

<!-- 导入依赖坐标，自动从本地库下载，如果没有则到公共仓库下载 -->
<dependencies>
    <dependency>
        <!-- jstl 支持 -->
        <groupId>javax.servlet</groupId>
        <artifactId>jstl</artifactId>
        <version>1.2</version>
    </dependency>
    <dependency>
        <!-- servlet编译环境 -->
        <groupId>javax.servlet</groupId>
        <artifactId>javax.servlet-api</artifactId>
        <version>3.1.0</version>
        <scope>provided</scope>
    </dependency>
    <dependency>
        <!-- jsp编译环境 -->
        <groupId>javax.servlet</groupId>
        <artifactId>jsp-api</artifactId>
        <version>2.0</version>
        <scope>provided</scope>
    </dependency>
</dependencies>
```

#### 依赖生命周期

> 依赖的生命周期，也就是jar包的产生到销毁的阶段。生命周期需要在坐标中通过scope标签来配置
>
> compile： (默认) 在任何阶段都起作用，包括(测试，编译，打包，运行)等阶段----常用
>
> provided：在测试与编译阶段起作用，运行阶段不起作用； 例如：servlet及jsp包，因为在运行时已经到过jar包
>
> runtime： 运行和测试时起作用； 例如：数据库驱动，因为编译是通过的，只需运行时加载即可
>
> test：         只在测试时起作用，例如：junit单元测试的jar包

```xml
<dependency>
    <!-- jsp编译环境 -->
    <groupId>javax.servlet</groupId>
    <artifactId>jsp-api</artifactId>
    <version>2.0</version>
    <scope>provided</scope>
</dependency>

<!--  数据库驱动可以设置作用域为runtime -->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.28</version>
    <scope>runtime</scope>
</dependency>

<dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>4.12</version>
    <!-- 只在测试阶段起作用 -->
    <scope>test</scope>
</dependency>
```

#### 项目构建

> maven的两大功能，前面已经讲了依赖管理；除此之外还有项目构建，也就是将清除，编译，打包，安装，部署等功能，集成到一块； 可以使用指令的方式：mvn clean； 推荐使用面板方式。

### 六、私服

#### 概述

> 如果没有私服，公司的任何客户端都需要去远程下载；每个客户端都需要下载，会特别麻烦
>
> 如果有了私服，公司的一个客户端去远程下载后，存到私服，其他客户端只需要到私服中下载即可
>
> 同时，客户端的依赖可部署的私服，公司内部可共用，提升安全性。

#### 配置

> 安装私服工具nexus,安装并启动（如果安装不了，则使用管理员身份安装）
>
> 访问路径：http://localhost:8081/nexus/
>
> 登录用户：admin        密码：admin123

> 仓库：
>
> 公共仓库：  所有仓库中有数据都会集中到公共仓库中显示                        类型为：group
>
> central：     中心仓库，私服中没有jar包时，可通过该仓库去远程下载    类型为：proxy
>
> releases:      发行版，如果发行版项目需要部署内容，可部署到该仓库     类型为：hosted
>
> snapshots:  开发版，如果开发版项目需要部署内容，可部署到该仓库     类型为：hosted

#### 私服测试

> 修改Settings.xml的配置，去掉阿里云镜像
>
> 配置server标签，里面编写登录账号和标记名； 并激活公共仓库的链接
>
> 将public仓库配置central优先，即可从central仓库下载依赖
>
> 再将本地仓库内容删除，即可从私服中下载依赖，放置本地仓库；同时私服中也保存了一份

```xml
<server> 
    <id>nexus-public</id> <!-- nexus的认证id -->
    <username>admin</username> <!--nexus中的用户名密码-->
    <password>admin123</password> 
</server>

<profiles> 
  <profile> 
    <id>nexus</id> 
    <repositories> 
        <repository> 
            <id>nexus-public</id> <!--nexus认证id 【此处的repository的id要和 <server>的id保持一致】-->
            <!--name随便-->
            <name>Nexus Release Snapshot Repository</name> 
            <!--地址是nexus中仓库组对应的地址-->
            <url>http://localhost:8081/nexus/content/groups/public/</url>
            <releases><enabled>true</enabled></releases> 
            <snapshots><enabled>true</enabled></snapshots> 
        </repository>
    </repositories> 
    <pluginRepositories> <!--插件仓库地址，各节点的含义和上面是一样的-->
        <pluginRepository> 
            <id>nexus-public</id> <!--nexus认证id 【此处的repository的id要和 <server>的id保持一致】-->
            <!--地址是nexus中仓库组对应的地址-->
            <url>http://localhost:8081/nexus/content/groups/public/</url>
            <releases><enabled>true</enabled></releases> 
            <snapshots><enabled>true</enabled></snapshots> 
        </pluginRepository> 
    </pluginRepositories> 
    </profile>
</profiles>

<!-- 让增加的 profile生效 -->
<activeProfiles>
    <activeProfile>myjdk</activeProfile>
    <!-- 使私服配置生效 -->
    <activeProfile>nexus</activeProfile>
</activeProfiles>
```

#### 部署项目

> 可以使用部署方式，将开发版项目部署到snapshots仓库中
>
> 导入部署配置，再通过面板中的部署案例双击即可完成。（将本地库的war包部署到私服中）

```xml
<!-- 在项目的pom.xml中 配置私服的仓库地址，可以将项目打jar包部署到私服 -->
<distributionManagement>
    <repository>
        <id>nexus-public</id> <!-- nexus认证id   发行版的部署路径-->
        <url>http://localhost:8081/nexus/content/repositories/releases</url>
    </repository>
    <snapshotRepository>
        <id>nexus-public</id> <!-- nexus认证id   开发版的部署路径-->
        <url>http://localhost:8081/nexus/content/repositories/snapshots</url>
    </snapshotRepository>
</distributionManagement>
```

### 七、mybatis概述

#### 引言

> 什么是框架： 半成品项目，我们可以往框架中填充内容，编程完整项目
>
> ORM框架： 与数据库交互相关的框架（DAO层）
>
> 之前JDBC操作的弊端：
>
> 有很多冗余代码
>
> 无法分离SQL语句，代码不灵活
>
> 查询效率低，无法设置缓存操作

#### MyBatis框架

> 是一套持久层框架，与数据库交互相关
>
> 特点：几乎封装了所有JDBC操作，只关注SQL本身即可；可自动ORM，也可手动配置映射，非常灵活

### 八、总结与作业

#### 总结

```
1.Git的分支
创建分支，细节
2.IDEA关联GIT（重点）
概述，应用-提交本地库，再关联远程仓库
处理冲突、多人协同开发-绑定多个用户
3.Maven介绍（重点）
引言-没有maven，则jar管理非常麻烦；maven介绍-依赖管理和项目构建
maven安装，配置-Settings.xml中
4.仓库
仓库分类：本地库，远程仓库-私服，公共仓库，中央仓库
IDEA关联Maven-配置Settings
5.创建web项目
web配置；依赖生命周期；项目构建
6.私服（了解）
概述（重点）；配置；私服测试；部署项目
7.mybatis概述（重点）
引言-框架，orm框架，jdbc弊端； mybatis框架
```

#### 作业

```
1. Maven有什么用?  解决了哪些问题?
2. maven中有哪些仓库, 执行流程
3. IDEA集成maven的配置流程简述
4. maven的生命周期有哪些? 请至少说明4个, 请细化
5. 搭建私服有什么好处? 请说明
6. mybatis比普通jdbc的好处有哪些?
```

#### 晨考

```
1.请简述git与svn的区别
2.git与maven都有本地库和远程仓库，有什么区别
3.maven搭建web环境的步骤
4.项目构建中的清除，编译，打包，安装，部署的分别有什么作用？
```

![图片](https://xiaobao.gay/2023/09/27/092128-2.webp)
