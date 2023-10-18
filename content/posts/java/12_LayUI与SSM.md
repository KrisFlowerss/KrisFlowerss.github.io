---
title: LayUI与SSM
Date: 2023-10-17
Categories:
- Java
tags:
- SSM
- LayUI
---

# [LayUI与SSM]()

### 一、考卷与作业

#### 修改功能

```java
<a href="/user/selectOne/${u.id}">修改</a>
    
@RequestMapping("/selectOne/{id}")
public String selectOne(@PathVariable Integer id,HttpServletRequest request){
    User user = userService.selectById(id);
    request.setAttribute("u",user);
    return "update";
}

@RequestMapping("/update")
public String update(User user){
    int res = userService.updateUser(user);
    System.out.println("修改:"+res);
    return "redirect:/user/pages";
}
```

### 二、LayUI介绍

#### 概述

> 类似于bootstrap的前端框架库，内部整合了css与js的用法
>
> 引入css外部样式，可以改变页面效果
>
> 引入js文件，可以动态使用js的触发及传值功能

> 应用：
>
> 导入文件后，即可使用layui

#### 栅格系统

```html
<!-- 引入css文件  -->
<link rel="stylesheet" type="text/css" href="layui/css/layui.css"/>
<!-- 引入js文件  jquery需要放前面，因为layui中会使用到jquery-->
<script src="js/jquery-1.11.min.js"></script>
<script src="layui/layui.js"></script>

<style>
    .a{
        background-color: red;
    }
    .b{
        background-color: green;
    }
    .c{
        background-color: blue;
    }
    .d{
        background-color: yellow;
    }
    .e{
        background-color: gray;
    }
</style>

<!-- layui-container居中显示有固定尺寸；layui-fluid占满行宽 -->
<!--<div class="layui-container">-->
<div class="layui-container">
    <div class="layui-row">
        <div class="layui-col-md9 layui-col-lg6 layui-bg-orange">
            你的内容 9/12b
        </div>
        <div class="layui-col-md3 layui-col-lg6 layui-bg-gray">
            你的内容 3/12
        </div>
    </div>

    <div class="layui-row">
        <div class="layui-col-xs6 layui-col-sm6 layui-col-md4 layui-col-lg3 a">
            移动：6/12 | 平板：6/12 | 桌面：4/12;
        </div>
        <div class="layui-col-xs6 layui-col-sm6 layui-col-md4 layui-col-lg3 b">
            移动：6/12 | 平板：6/12 | 桌面：4/12;
        </div>
        <div class="layui-col-xs4 layui-col-sm12 layui-col-md4 layui-col-lg3 c">
            移动：4/12 | 平板：12/12 | 桌面：4/12;
        </div>
        <div class="layui-col-xs4 layui-col-sm7 layui-col-md8 layui-col-lg3 d">
            移动：4/12 | 平板：7/12 | 桌面：8/12;
        </div>
        <div class="layui-col-xs4 layui-col-sm5 layui-col-md4 layui-col-lg3 e">
            移动：4/12 | 平板：5/12 | 桌面：4/12;
        </div>
    </div>
</div>
```

#### 表单

```html
<!-- 引入css文件  -->
<link rel="stylesheet" type="text/css" href="layui/css/layui.css"/>
<!-- 引入js文件  jquery需要放前面，因为layui中会使用到jquery-->
<script src="js/jquery-1.11.min.js"></script>
<script src="layui/layui.js"></script>

<form class="layui-form" action="">
    <div class="layui-form-item">
        <label class="layui-form-label">输入框</label>
        <div class="layui-input-block">
            <input type="text" name="title" required  lay-verify="required" placeholder="请输入标题" autocomplete="off" class="layui-input">
        </div>
    </div>
    <div class="layui-form-item">
        <label class="layui-form-label">密码框</label>
        <div class="layui-input-inline">
            <input type="password" name="password" required lay-verify="required" placeholder="请输入密码" autocomplete="off" class="layui-input">
        </div>
        <div class="layui-form-mid layui-word-aux">辅助文字</div>
    </div>
    <div class="layui-form-item">
        <label class="layui-form-label">选择框</label>
        <div class="layui-input-block">
            <select name="city" lay-verify="required">
                <option value=""></option>
                <option value="0">北京</option>
                <option value="1">上海</option>
                <option value="2">广州</option>
                <option value="3">深圳</option>
                <option value="4">杭州</option>
            </select>
        </div>
    </div>
    <div class="layui-form-item">
        <label class="layui-form-label">复选框</label>
        <div class="layui-input-block">
            <input type="checkbox" name="like[write]" title="写作">
            <input type="checkbox" name="like[read]" title="阅读" checked>
            <input type="checkbox" name="like[dai]" title="发呆">
        </div>
    </div>
    <div class="layui-form-item">
        <label class="layui-form-label">开关</label>
        <div class="layui-input-block">
            <input type="checkbox" name="switch" lay-skin="switch">
        </div>
    </div>
    <div class="layui-form-item">
        <label class="layui-form-label">单选框</label>
        <div class="layui-input-block">
            <input type="radio" name="sex" value="男" title="男">
            <input type="radio" name="sex" value="女" title="女" checked>
        </div>
    </div>
    <div class="layui-form-item layui-form-text">
        <label class="layui-form-label">文本域</label>
        <div class="layui-input-block">
            <textarea name="desc" placeholder="请输入内容" class="layui-textarea"></textarea>
        </div>
    </div>
    <div class="layui-form-item">
        <div class="layui-input-block">
            <!-- lay-filter:js中的触发事件（标记） -->
            <button class="layui-btn" lay-submit lay-filter="formDemo">立即提交</button>
            <button type="reset" class="layui-btn layui-btn-primary">重置</button>
        </div>
    </div>
</form>

<script>
    //Demo  使用指定的模块--form js相关
    layui.use(['form','layer'], function(){
        var form = layui.form;
        var layer = layui.layer;  //弹出模块  定义局部变量

        //监听提交  监听formDemo
        form.on('submit(formDemo)', function(data){ //data是表单中的数据（数据的结构）
            //layer.msg:类似弹窗的警告框
            layer.msg(JSON.stringify(data.field));  //(类似java实体)
            return false;  //不提交到后台
        });
    });
</script>
```

### 三、布局

#### 主页布局

```html
    <!-- 引入css文件  -->
    <link rel="stylesheet" type="text/css" href="layui/css/layui.css"/>
    <!-- 引入js文件  jquery需要放前面，因为layui中会使用到jquery-->
    <script src="js/jquery-1.11.min.js"></script>
    <script src="layui/layui.js"></script>


    <div class="layui-header">
        <div class="layui-logo">layui 后台布局</div>
        <!-- 头部区域（可配合layui已有的水平导航） -->

        <ul class="layui-nav layui-layout-right">
            <li class="layui-nav-item">
                <a href="javascript:;">
                    <img src="http://t.cn/RCzsdCq" class="layui-nav-img">
                    贤心
                </a>
                <dl class="layui-nav-child">
                    <dd><a href="">基本资料</a></dd>
                    <dd><a href="">安全设置</a></dd>
                </dl>
            </li>
            <li class="layui-nav-item"><a href="">退了</a></li>
        </ul>
    </div>

    <div class="layui-side layui-bg-black">
        <div class="layui-side-scroll">
            <!-- 左侧导航区域（可配合layui已有的垂直导航） -->
            <ul class="layui-nav layui-nav-tree"  lay-filter="test">
                <li class="layui-nav-item layui-nav-itemed">
                    <a class="" href="javascript:;">所有商品</a>
                    <dl class="layui-nav-child">
                        <dd><a href="javascript:;" onclick="openRight('users.html')">用户列表</a></dd>
                        <dd><a href="javascript:;">列表二</a></dd>
                        <dd><a href="javascript:;">列表三</a></dd>
                        <dd><a href="">超链接</a></dd>
                    </dl>
                </li>

            </ul>
        </div>
    </div>

    <div class="layui-body" id="main">
        <!-- 内容主体区域 -->

    </div>

    <div class="layui-footer">
        <!-- 底部固定区域 -->
        © layui.com - 底部固定区域
    </div>
</div>
<script>
    //JavaScript代码区域
    layui.use('element', function(){
        var element = layui.element;

    });
    //在当前页面加载目标页面,以免在新窗口打开
    function openRight(url) {
        //加载传入的users.html到主体区域
        $("#main").load(url); //main就是用于显示数据的div的id
    }
</script>
```

#### 动态数据表格

> 点击“用户列表”，将数据展示

```html
<table id="demo" lay-filter="test"></table><!-- lay-filter 触发事件标记 -->

<script>
    /* 使用的模块有：table*/
    layui.use(['table'], function(){
        var table = layui.table;

        //第一个实例
        table.render({  //填充table标签中的数据  json对象
            elem: '#demo' //指定的匹配元素
            ,height: 480  //表格高度
            ,url: '/user/pages' //数据接口  访问后端服务器路径
            ,page: true //开启分页
            ,cols: [[ //表头
                /* field:属性名 */
                {field: 'id', title: 'ID', width:90, sort: true, fixed: 'left'}
                ,{field: 'name', title: '用户名'} /* 去掉width表示平均分配 */
                ,{field: 'password', title: '密码'}
                ,{field: 'sex', title: '性别'}
                ,{field: 'birthday', title: '生日'}
            ]]
        });

    });
</script>
```

### 四、数据回调

#### 回调内容

> 展示的数据出现异常，因为访问springMVC后，获取到数据，但无法返回到动态数据表格中，需要遵循动态数据表格的接口规则。规则格式如下：

```json
{
	"code": 0,
   	"msg": "",
  	"count": 1000,
  	"data": [{}, {}]
} 
```

> 需要对返回的数据进行封装，再转成json字符串

> 创建实体类

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TableData <T>{ //表格数据的实体类，遵循json格式规则返回
    private Integer code;  //返回响应码：0-成功  1-失败
    private  String msg;   //返回的提示信息
    private  Long   count;  //条数
    private  List<T> data;
}
```

#### 控制层封装

```java
@RestController  //返回字符串或json数据（jackson包）
@RequestMapping("/user")
public class UserController {
    @Resource
    private UserService userService;

    @RequestMapping("/pages")
    public TableData<User> pages(HttpServletRequest request){
        System.out.println("展示分页...");
        String pageNum = request.getParameter("pageNum");
        String pageSize = request.getParameter("pageSize");
        PageInfo<User> pageInfo = userService.selectPage(pageNum,pageSize);
        request.setAttribute("p",pageInfo);
        long count = pageInfo.getTotal();
        TableData<User> td = new TableData<>(0,"成功状态",count,pageInfo.getList());
        System.out.println("返回封装："+td);
        return td;
    }
}
```

### 五、分页功能

> 在动态数据展示时，有默认的分页模板，由如下配置决定的

```json
,page: true //开启分页
```

#### 定制分页

> 如果需要自己定制分页模板，需要自定义配置规则，自定义格式如下

```json
page:{limit:5//每页显示5条
      ,limits:[1,2,3] //可选每页条数
      ,first: '首页' //首页显示文字，默认显示页号
      ,last: '尾页'
      ,prev: '<em>←</em>' //上一页显示内容，默认显示 > <
      ,next: '<i class="layui-icon layui-icon-next"></i>'
      ,layout:['prev', 'page', 'next','count','limit','skip','refresh'] //自定义分页布局
     }
```

#### 控制层调整

```java
@RequestMapping("/pages")  //page-当前页  limit-页大小
public TableData<User> pages(HttpServletRequest request,int page,int limit){
    System.out.println("展示分页...");
    PageInfo<User> pageInfo = userService.selectPage(page,limit);
    request.setAttribute("p",pageInfo);
    long count = pageInfo.getTotal();
    TableData<User> td = new TableData<>(0,"成功状态",count,pageInfo.getList());
    System.out.println("返回封装："+td);
    return td;
}
```

### 六、操作功能

#### 工具栏

只需要在table的渲染中，加入工具类配置即可

```json
//第一个实例
table.render({  //填充table标签中的数据  json对象
    elem: '#demo' //指定的匹配元素
    ,height: 480  //表格高度
    ,url: '/user/pages' //数据接口  访问后端服务器路径
    ,page: true //开启分页
    ,toolbar:true  //设置工具栏
})
```

#### 操作功能显示

> 在table渲染中，加入操作表头

```json
,{field:"right",title:"操作",toolbar: '#barDemo'}
```

> 在表头下面绑定编辑和删除按钮；通过id="barDemo"进行绑定的

```js
<!-- 如下script可以定义在页面的任何位置 -->
<script type="text/html" id="barDemo">
    <a class="layui-btn layui-btn-xs" lay-event="edit">编辑</a>
    <a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="del">删除</a>
</script>
```

#### 删除功能

```js
//注：tool 是工具条事件名，test 是 table 原始容器的属性 lay-filter="对应的值"
table.on('tool(test)', function(obj){
    var data = obj.data; //获得当前行数据
    //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）
    var layEvent = obj.event;
    if(layEvent === 'del'){ //删除
        layer.confirm('真的删除行么', function(index){
            // 向服务端发送删除请求
            // 此处可以发送ajax
            $.ajax({
                type:"delete",
                url:"/user/delete/"+data.id,
                success:function(res){
                    console.log(res);
                    table.reload('demo');//重载父页表格，参数为表格ID
                }
            });
            obj.del(); //删除对应行（tr）的DOM结构
            layer.close(index); //当前弹窗索引标记删除
        });
    } 
});
```

#### 修改功能

> 修改的触发弹窗

```js
//注：tool 是工具条事件名，test 是 table 原始容器的属性 lay-filter="对应的值"
table.on('tool(test)', function(obj){
    var data = obj.data; //获得当前行数据
    //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）
    var layEvent = obj.event;
    if(layEvent === 'del'){ //删除

    } else if(layEvent === 'edit'){ //编辑
        layer.open({  //打开弹窗
            area:['500px','420px'], /* 弹窗的宽高 */
            shadeClose:true,  /* 是否遮罩 */
            anim:2,  /* 动画效果 */
            type:2,  /* 弹窗类型-以小窗口形式弹出 */
            content:'/update.html',
            success:function(layero,index){
                //获取弹出的子窗口的body标签
                var body = layer.getChildFrame('body',index);
                //查找#id的标签，并将值注入
                body.find("#id").val(data.id);
                body.find("#name").val(data.name);
                body.find("#password").val(data.password);
                body.find("#sex").val(data.sex);
            }
        })
    }
});
```

> 创建update.html页面

```html
<!-- 引入css文件  -->
<link rel="stylesheet" type="text/css" href="layui/css/layui.css"/>
<!-- 引入js文件  jquery需要放前面，因为layui中会使用到jquery-->
<script src="js/jquery-1.11.min.js"></script>
<script src="layui/layui.js"></script>

<form class="layui-form" action="">
    <div class="layui-form-item">
        <label class="layui-form-label">ID号</label>
        <div class="layui-input-block">
            <input type="text" name="id" readonly id="id" class="layui-input">
        </div>
    </div>

    <div class="layui-form-item">
        <label class="layui-form-label">姓名</label>
        <div class="layui-input-block">
            <input type="text" name="name" id="name" class="layui-input">
        </div>
    </div>

    <div class="layui-form-item">
        <label class="layui-form-label">密码</label>
        <div class="layui-input-block">
            <input type="text" name="password" id="password" class="layui-input">
        </div>
    </div>

    <div class="layui-form-item">
        <label class="layui-form-label">性别</label>
        <div class="layui-input-block">
            <input type="text" name="sex" id="sex" class="layui-input">
        </div>
    </div>

    <div class="layui-form-item">
        <div class="layui-input-block">
            <!-- lay-filter:js中的触发事件（标记） -->
            <button class="layui-btn" lay-submit lay-filter="formDemo">修改</button>
        </div>
    </div>
</form>

<script>
    //Demo  使用指定的模块--form js相关
    layui.use(['form','layer'], function(){
        var form = layui.form;
        var layer = layui.layer;  //弹出模块  定义局部变量

        //监听提交  监听formDemo
        form.on('submit(formDemo)', function(data){ //data是表单中的数据（数据的结构）
            $.ajax({
                type:"put", //修改功能
                async:false,  //同步方式
                url:"/user/update",
                contentType:"application/json", //发送数据为json数据
                data:JSON.stringify(data.field), //data中的json数据
                success:function (res) {
                    console.log(res);
                    //update小弹窗作为子窗口
                    var index = parent.layer.getFrameIndex(window.name);  //获取子级窗口索引
                    parent.layer.close(index);  //父关闭子窗口
                    parent.layui.table.reload('demo');//重载父页表格，参数为表格ID
					return false; //不触发表单的action
                }
            })
        });
    });
</script>
```

> 后端控制层的修改处理：

```java
@PutMapping("/update")
public String update(@RequestBody User user){
    System.out.println("user-->"+user);
    int res = userService.updateUser(user);
    System.out.println("修改:"+res);
    return res+"";
}
```

### 七、总结与作业

#### 总结

```
1.SSM的修改功能
根据id匹配，返回对象，再修改
2.layui介绍
概述-前端框架；应用：栅格系统，表单----查看文档
3.局部
主页布局-布局结构； 动态数据表格结构
4.数据回调（重点）
前后端交互的接口；回调内容；控制层封装-TableData实体
5.分页功能
定制分页，控制层调整接收分页参数
6.操作功能（重点）
功能栏；操作功能的显示
删除功能-ajax方式与后台交互
修改功能-模态框展示，修改的调整-ajax--rest风格
```

#### 作业

```
完成student表的动态数据展示，表字段有：id-int,name-varchar,sex-varchar,height-double
```

![截屏2023-10-18 09.06.10](https://091023.xyz/2023/10/18/090810.webp)
