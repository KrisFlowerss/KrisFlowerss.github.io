#### 1.添加与修改

1.改校验规则

2.改表单属性名称

3.数据都在model里

4.写submit方法



编辑修改公用一个：
```js
saveOrUpdateEmp() {
      this.axios
        .request({
          url: "http://localhost:8080/emp",
		  method: this.empno ? "PUT" : "POST",
          data: this.ruleForm,
        })
```

但是this.empno需要通过上一个页面传过来：
```js
handleEdit(row) {
      this.$router.push({
        path:"/toEmp",
        query:{
          empno:row.empno
        }
      });
```

接收到的页面需要通过以下方法接收：

```
mounted() {
    // 添加和更新都会调用这个方法
    this.empno = this.$route.query.empno;
    if (this.empno) {
      this.info(); // 根据id查询
    }
  },
};
```



#### 2.嵌套路由

在路由加上children：

```vue
routes: [
    {
      path: '/',
      name: 'index',
      component: index,
      children: [{
        path: '/emp',
        name: 'emplist',
        component: empList
      },{
        path: '/toEmp',
        name: 'emp',
        component: emp
      }]
    },
    
  ]
```





在主页面加上

```vue
<el-main>
      <router-view></router-view>
</el-main>
```

在需要点击的块中添加：

```vue
<el-menu-item index="1-1"><router-link to="emp">员工管理</router-link>
```

