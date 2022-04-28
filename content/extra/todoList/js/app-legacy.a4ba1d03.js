(function(){"use strict";var t={3963:function(t,e,o){o(6992),o(8674),o(9601),o(7727);var n=o(9567),l=function(){var t=this,e=t.$createElement,o=t._self._c||e;return o("div",{staticClass:"todoContainer"},[o("TodoHeader",{attrs:{receive2Add:t.receive2Add}}),o("TodoList",{attrs:{checkTodo:t.checkTodo,delTodo:t.delTodo,todos:t.todos}}),o("TodoFooter",{attrs:{DelAll:t.DelAll,checkAll:t.checkAll,todos:t.todos}})],1)},r=[],i=(o(1539),o(4747),o(7327),o(8862),function(){var t=this,e=t.$createElement,o=t._self._c||e;return o("div",{staticClass:"todoHeader"},[o("input",{directives:[{name:"model",rawName:"v-model",value:t.title,expression:"title"}],attrs:{placeholder:"请输入你的任务名称,按回车键确认",type:"text"},domProps:{value:t.title},on:{keyup:function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"enter",13,e.key,"Enter")?null:t.addTodo.apply(null,arguments)},input:function(e){e.target.composing||(t.title=e.target.value)}}})])}),c=[],s=(o(3210),o(562)),d={name:"TodoHeader",props:["receive2Add"],data:function(){return{title:""}},methods:{addTodo:function(){if(!this.title.trim())return alert("内容不能为空");var t={id:(0,s.x0)(),name:this.title,completed:!1};this.receive2Add(t),this.title=""}}},a=d,u=o(1001),f=(0,u.Z)(a,i,c,!1,null,"5c73af25",null),h=f.exports,p=function(){var t=this,e=t.$createElement,o=t._self._c||e;return o("div",{staticClass:"listContainer"},[o("ul",t._l(t.todos,(function(e){return o("TodoItem",{key:e.id,attrs:{todo:e,checkTodo:t.checkTodo,delTodo:t.delTodo}})})),1)])},m=[],v=function(){var t=this,e=t.$createElement,o=t._self._c||e;return o("div",{staticClass:"itemWrapper "},[o("li",[o("label",[o("input",{attrs:{type:"checkbox"},domProps:{checked:t.todo.completed},on:{change:function(e){return t.handleCheck(t.todo.id)}}}),o("span",[t._v(t._s(t.todo.name))])]),o("button",{on:{click:function(e){return t.handleDelete(t.todo.id)}}},[t._v("删除")])])])},k=[],T={name:"TodoItem",props:["todo","checkTodo","delTodo"],methods:{handleCheck:function(t){this.checkTodo(t)},handleDelete:function(t){confirm("是否删除该项？")&&this.delTodo(t)}}},A=T,_=(0,u.Z)(A,v,k,!1,null,"26d6080b",null),g=_.exports,y={name:"TodoList",components:{TodoItem:g},props:["todos","checkTodo","delTodo"]},b=y,x=(0,u.Z)(b,p,m,!1,null,"2624c3e9",null),w=x.exports,O=function(){var t=this,e=t.$createElement,o=t._self._c||e;return o("div",{directives:[{name:"show",rawName:"v-show",value:t.total,expression:"total"}],staticClass:"todoFooter"},[o("label",{attrs:{for:""}},[o("input",{directives:[{name:"model",rawName:"v-model",value:t.isAll,expression:"isAll"}],attrs:{type:"checkbox"},domProps:{checked:Array.isArray(t.isAll)?t._i(t.isAll,null)>-1:t.isAll},on:{change:function(e){var o=t.isAll,n=e.target,l=!!n.checked;if(Array.isArray(o)){var r=null,i=t._i(o,r);n.checked?i<0&&(t.isAll=o.concat([r])):i>-1&&(t.isAll=o.slice(0,i).concat(o.slice(i+1)))}else t.isAll=l}}}),o("span",[t._v("已完成 "),o("span",[t._v(t._s(t.completedNum))]),t._v(" / 全部 "),o("span",[t._v(t._s(t.total))])])]),o("button",{on:{click:t.handleDelAll}},[t._v("清除已完成任务")])])},C=[],D={name:"TodoFooter",props:["todos","checkAll","DelAll"],computed:{completedNum:function(){return this.todos.filter((function(t){return!0===t.completed})).length},total:function(){return this.todos.length},isAll:{get:function(){return this.completedNum===this.total&&this.total>0},set:function(t){this.checkAll(t)}}},methods:{handleDelAll:function(){confirm("是否删除所有已完成项？")&&this.DelAll()}}},E=D,N=(0,u.Z)(E,O,C,!1,null,"63a0b247",null),Z=N.exports,j={name:"App",components:{TodoHeader:h,TodoList:w,TodoFooter:Z},data:function(){return{todos:JSON.parse(localStorage.getItem("todos"))||[]}},methods:{receive2Add:function(t){this.todos.unshift(t)},checkTodo:function(t){console.log(t),this.todos.forEach((function(e){e.id===t&&(e.completed=!e.completed)}))},delTodo:function(t){this.todos=this.todos.filter((function(e){return e.id!==t}))},checkAll:function(t){this.todos.forEach((function(e){return e.completed=t}))},DelAll:function(){this.todos=this.todos.filter((function(t){return!0!==t.completed}))}},watch:{todos:{deep:!0,handler:function(t){localStorage.setItem("todos",JSON.stringify(t))}}}},$=j,F=(0,u.Z)($,l,r,!1,null,null,null),I=F.exports;n.Z.config.productionTip=!1,new n.Z({render:function(t){return t(I)}}).$mount("#app")}},e={};function o(n){var l=e[n];if(void 0!==l)return l.exports;var r=e[n]={exports:{}};return t[n](r,r.exports,o),r.exports}o.m=t,function(){var t=[];o.O=function(e,n,l,r){if(!n){var i=1/0;for(a=0;a<t.length;a++){n=t[a][0],l=t[a][1],r=t[a][2];for(var c=!0,s=0;s<n.length;s++)(!1&r||i>=r)&&Object.keys(o.O).every((function(t){return o.O[t](n[s])}))?n.splice(s--,1):(c=!1,r<i&&(i=r));if(c){t.splice(a--,1);var d=l();void 0!==d&&(e=d)}}return e}r=r||0;for(var a=t.length;a>0&&t[a-1][2]>r;a--)t[a]=t[a-1];t[a]=[n,l,r]}}(),function(){o.d=function(t,e){for(var n in e)o.o(e,n)&&!o.o(t,n)&&Object.defineProperty(t,n,{enumerable:!0,get:e[n]})}}(),function(){o.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(t){if("object"===typeof window)return window}}()}(),function(){o.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)}}(),function(){var t={143:0};o.O.j=function(e){return 0===t[e]};var e=function(e,n){var l,r,i=n[0],c=n[1],s=n[2],d=0;if(i.some((function(e){return 0!==t[e]}))){for(l in c)o.o(c,l)&&(o.m[l]=c[l]);if(s)var a=s(o)}for(e&&e(n);d<i.length;d++)r=i[d],o.o(t,r)&&t[r]&&t[r][0](),t[r]=0;return o.O(a)},n=self["webpackChunkvue_test"]=self["webpackChunkvue_test"]||[];n.forEach(e.bind(null,0)),n.push=e.bind(null,n.push.bind(n))}();var n=o.O(void 0,[998],(function(){return o(3963)}));n=o.O(n)})();
//# sourceMappingURL=app-legacy.a4ba1d03.js.map