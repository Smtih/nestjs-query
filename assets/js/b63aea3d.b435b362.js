"use strict";(self.webpackChunknestjs_query=self.webpackChunknestjs_query||[]).push([[1788],{433:(e,n,t)=>{t.d(n,{Z:()=>i});t(7294);var r=t(6905);const a={tabItem:"tabItem_Ymn6"};var o=t(5893);function i(e){var n=e.children,t=e.hidden,i=e.className;return(0,o.jsx)("div",{role:"tabpanel",className:(0,r.Z)(a.tabItem,i),hidden:t,children:n})}},2808:(e,n,t)=>{t.d(n,{Z:()=>j});var r=t(7294),a=t(6905),o=t(3735),i=t(6550),l=t(613),s=t(4423),u=t(636),c=t(9200);function d(e){var n,t;return null!=(n=null==(t=r.Children.toArray(e).filter((function(e){return"\n"!==e})).map((function(e){if(!e||(0,r.isValidElement)(e)&&((n=e.props)&&"object"==typeof n&&"value"in n))return e;var n;throw new Error("Docusaurus error: Bad <Tabs> child <"+("string"==typeof e.type?e.type:e.type.name)+'>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.')})))?void 0:t.filter(Boolean))?n:[]}function p(e){var n=e.values,t=e.children;return(0,r.useMemo)((function(){var e=null!=n?n:function(e){return d(e).map((function(e){var n=e.props;return{value:n.value,label:n.label,attributes:n.attributes,default:n.default}}))}(t);return function(e){var n=(0,u.l)(e,(function(e,n){return e.value===n.value}));if(n.length>0)throw new Error('Docusaurus error: Duplicate values "'+n.map((function(e){return e.value})).join(", ")+'" found in <Tabs>. Every value needs to be unique.')}(e),e}),[n,t])}function b(e){var n=e.value;return e.tabValues.some((function(e){return e.value===n}))}function m(e){var n=e.queryString,t=void 0!==n&&n,a=e.groupId,o=(0,i.k6)(),l=function(e){var n=e.queryString,t=void 0!==n&&n,r=e.groupId;if("string"==typeof t)return t;if(!1===t)return null;if(!0===t&&!r)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return null!=r?r:null}({queryString:t,groupId:a});return[(0,s._X)(l),(0,r.useCallback)((function(e){if(l){var n=new URLSearchParams(o.location.search);n.set(l,e),o.replace(Object.assign({},o.location,{search:n.toString()}))}}),[l,o])]}function f(e){var n,t,a,o,i=e.defaultValue,s=e.queryString,u=void 0!==s&&s,d=e.groupId,f=p(e),h=(0,r.useState)((function(){return function(e){var n,t=e.defaultValue,r=e.tabValues;if(0===r.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(t){if(!b({value:t,tabValues:r}))throw new Error('Docusaurus error: The <Tabs> has a defaultValue "'+t+'" but none of its children has the corresponding value. Available values are: '+r.map((function(e){return e.value})).join(", ")+". If you intend to show no default tab, use defaultValue={null} instead.");return t}var a=null!=(n=r.find((function(e){return e.default})))?n:r[0];if(!a)throw new Error("Unexpected error: 0 tabValues");return a.value}({defaultValue:i,tabValues:f})})),v=h[0],g=h[1],x=m({queryString:u,groupId:d}),T=x[0],y=x[1],j=(n=function(e){return e?"docusaurus.tab."+e:null}({groupId:d}.groupId),t=(0,c.Nk)(n),a=t[0],o=t[1],[a,(0,r.useCallback)((function(e){n&&o.set(e)}),[n,o])]),I=j[0],k=j[1],F=function(){var e=null!=T?T:I;return b({value:e,tabValues:f})?e:null}();return(0,l.Z)((function(){F&&g(F)}),[F]),{selectedValue:v,selectValue:(0,r.useCallback)((function(e){if(!b({value:e,tabValues:f}))throw new Error("Can't select invalid tab value="+e);g(e),y(e),k(e)}),[y,k,f]),tabValues:f}}var h=t(5730);const v={tabList:"tabList__CuJ",tabItem:"tabItem_LNqP"};var g=t(5893);function x(e){var n=e.className,t=e.block,r=e.selectedValue,i=e.selectValue,l=e.tabValues,s=[],u=(0,o.o5)().blockElementScrollPositionUntilNextRender,c=function(e){var n=e.currentTarget,t=s.indexOf(n),a=l[t].value;a!==r&&(u(n),i(a))},d=function(e){var n,t=null;switch(e.key){case"Enter":c(e);break;case"ArrowRight":var r,a=s.indexOf(e.currentTarget)+1;t=null!=(r=s[a])?r:s[0];break;case"ArrowLeft":var o,i=s.indexOf(e.currentTarget)-1;t=null!=(o=s[i])?o:s[s.length-1]}null==(n=t)||n.focus()};return(0,g.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,a.Z)("tabs",{"tabs--block":t},n),children:l.map((function(e){var n=e.value,t=e.label,o=e.attributes;return(0,g.jsx)("li",Object.assign({role:"tab",tabIndex:r===n?0:-1,"aria-selected":r===n,ref:function(e){return s.push(e)},onKeyDown:d,onClick:c},o,{className:(0,a.Z)("tabs__item",v.tabItem,null==o?void 0:o.className,{"tabs__item--active":r===n}),children:null!=t?t:n}),n)}))})}function T(e){var n=e.lazy,t=e.children,a=e.selectedValue,o=(Array.isArray(t)?t:[t]).filter(Boolean);if(n){var i=o.find((function(e){return e.props.value===a}));return i?(0,r.cloneElement)(i,{className:"margin-top--md"}):null}return(0,g.jsx)("div",{className:"margin-top--md",children:o.map((function(e,n){return(0,r.cloneElement)(e,{key:n,hidden:e.props.value!==a})}))})}function y(e){var n=f(e);return(0,g.jsxs)("div",{className:(0,a.Z)("tabs-container",v.tabList),children:[(0,g.jsx)(x,Object.assign({},e,n)),(0,g.jsx)(T,Object.assign({},e,n))]})}function j(e){var n=(0,h.Z)();return(0,g.jsx)(y,Object.assign({},e,{children:d(e.children)}),String(n))}},814:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>c,contentTitle:()=>s,default:()=>b,frontMatter:()=>l,metadata:()=>u,toc:()=>d});var r=t(5893),a=t(1151),o=t(2808),i=t(433);const l={title:"v0.14.x to v0.15.x"},s=void 0,u={id:"migration-guides/v0.14.x-to-v0.15.x",title:"v0.14.x to v0.15.x",description:"In the v0.15.x the cursor connection type was updated to allow for enabling a totalCount field. When enabling this field nestjs-query needed to explicitly name each connection type to allow each relation connection to independently enable the totalCount field.",source:"@site/docs/migration-guides/v0.14.x-to-v0.15.x.mdx",sourceDirName:"migration-guides",slug:"/migration-guides/v0.14.x-to-v0.15.x",permalink:"/nestjs-query/docs/migration-guides/v0.14.x-to-v0.15.x",draft:!1,unlisted:!1,editUrl:"https://github.com/tripss/nestjs-query/edit/master/documentation/docs/migration-guides/v0.14.x-to-v0.15.x.mdx",tags:[],version:"current",frontMatter:{title:"v0.14.x to v0.15.x"},sidebar:"docs",previous:{title:"v0.15.x to v0.16.x",permalink:"/nestjs-query/docs/migration-guides/v0.15.x-to-v0.16.x"},next:{title:"v0.13.x to v0.14.x",permalink:"/nestjs-query/docs/migration-guides/v0.13.x-to-v0.14.x"}},c={},d=[];function p(e){const n={code:"code",p:"p",pre:"pre",...(0,a.a)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)(n.p,{children:["In the ",(0,r.jsx)(n.code,{children:"v0.15.x"})," the cursor connection type was updated to allow for enabling a ",(0,r.jsx)(n.code,{children:"totalCount"})," field. When enabling this field ",(0,r.jsx)(n.code,{children:"nestjs-query"})," needed to explicitly name each connection type to allow each relation connection to independently enable the ",(0,r.jsx)(n.code,{children:"totalCount"})," field."]}),"\n",(0,r.jsxs)(n.p,{children:["In previous versions of ",(0,r.jsx)(n.code,{children:"nestjs-query"})," the connection type was shared between all instances which caused the totalCount field to not always be exposed. In ",(0,r.jsx)(n.code,{children:"v0.15.x"})," all instances of a connection are uniquely named."]}),"\n",(0,r.jsx)(n.p,{children:"For example, suppose the following DTOS."}),"\n",(0,r.jsxs)(o.Z,{defaultValue:"todoitem",values:[{label:"todo-item.dto.ts",value:"todoitem"},{label:"sub-task.dto.ts",value:"subtask"}],children:[(0,r.jsx)(i.Z,{value:"todoitem",children:(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-ts",metastring:'title="todo-item.dto.ts"',children:"import { FilterableField, Connection } from '@ptc-org/nestjs-query-graphql';\nimport { ObjectType, ID, GraphQLISODateTime } from '@nestjs/graphql';\nimport { SubTaskDTO } from '../../sub-task/dto/sub-task.dto';\n\n@ObjectType('TodoItem')\n@Connection('subTasks', () => SubTaskDTO, { enableTotalCount: true })\nexport class TodoItemDTO {\n  @FilterableField(() => ID)\n  id!: number;\n\n  @FilterableField()\n  title!: string;\n\n  @FilterableField({ nullable: true })\n  description?: string;\n\n  @FilterableField()\n  completed!: boolean;\n\n  @FilterableField(() => GraphQLISODateTime)\n  created!: Date;\n\n  @FilterableField(() => GraphQLISODateTime)\n  updated!: Date;\n\n  @FilterableField()\n  priority!: number;\n}\n\n"})})}),(0,r.jsx)(i.Z,{value:"subtask",children:(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-ts",metastring:'title="sub-task.dto.ts"',children:"import { FilterableField, Relation } from '@ptc-org/nestjs-query-graphql';\nimport { ObjectType, ID, GraphQLISODateTime } from '@nestjs/graphql';\nimport { TodoItemDTO } from '../../todo-item/dto/todo-item.dto';\n\n@ObjectType('SubTask')\n@Relation('todoItem', () => TodoItemDTO, { disableRemove: true })\nexport class SubTaskDTO {\n  @FilterableField(() => ID)\n  id!: number;\n\n  @FilterableField()\n  title!: string;\n\n  @FilterableField({ nullable: true })\n  description?: string;\n\n  @FilterableField()\n  completed!: boolean;\n\n  @FilterableField(() => GraphQLISODateTime)\n  created!: Date;\n\n  @FilterableField(() => GraphQLISODateTime)\n  updated!: Date;\n\n  @FilterableField()\n  todoItemId!: string;\n}\n\n"})})})]}),"\n",(0,r.jsx)(n.p,{children:"In previous versions the generated graphql would have been"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-graphql",children:"type TodoItem {\n  id: ID!\n  title: String!\n  description: String\n  completed: Boolean!\n  created: DateTime!\n  updated: DateTime!\n  age: Float!\n  priority: Float!\n  subTasks(\n    paging: CursorPaging = { first: 10 }\n\n    filter: SubTaskFilter = {}\n\n    sorting: [SubTaskSort!] = []\n  ): SubTaskConnection!\n}\n\ntype SubTaskConnection {\n  pageInfo: PageInfo!\n  edges: [SubTaskEdge!]!\n}\n"})}),"\n",(0,r.jsx)(n.p,{children:"In the latest version the relation gets its own connection type."}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-graphql",children:"type TodoItem {\n  id: ID!\n  title: String!\n  description: String\n  completed: Boolean!\n  created: DateTime!\n  updated: DateTime!\n  age: Float!\n  priority: Float!\n  subTasks(\n    paging: CursorPaging = { first: 10 }\n\n    filter: SubTaskFilter = {}\n\n    sorting: [SubTaskSort!] = []\n  ): TodoItemSubTasksConnection!\n}\n\ntype TodoItemSubTasksConnection {\n  pageInfo: PageInfo!\n  edges: [SubTaskEdge!]!\n  totalCount: Int!\n}\n"})})]})}function b(e={}){const{wrapper:n}={...(0,a.a)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(p,{...e})}):p(e)}},1151:(e,n,t)=>{t.d(n,{Z:()=>l,a:()=>i});var r=t(7294);const a={},o=r.createContext(a);function i(e){const n=r.useContext(o);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:i(e.components),r.createElement(o.Provider,{value:n},e.children)}}}]);