"use strict";(self.webpackChunknestjs_query=self.webpackChunknestjs_query||[]).push([[6877],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>b});var r=n(7294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var u=r.createContext({}),s=function(e){var t=r.useContext(u),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},p=function(e){var t=s(e.components);return r.createElement(u.Provider,{value:t},e.children)},d="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},c=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,a=e.originalType,u=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),d=s(n),c=o,b=d["".concat(u,".").concat(c)]||d[c]||m[c]||a;return n?r.createElement(b,i(i({ref:t},p),{},{components:n})):r.createElement(b,i({ref:t},p))}));function b(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=n.length,i=new Array(a);i[0]=c;var l={};for(var u in t)hasOwnProperty.call(t,u)&&(l[u]=t[u]);l.originalType=e,l[d]="string"==typeof e?e:o,i[1]=l;for(var s=2;s<a;s++)i[s]=n[s];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}c.displayName="MDXCreateElement"},5162:(e,t,n)=>{n.d(t,{Z:()=>i});var r=n(7294),o=n(6010);const a={tabItem:"tabItem_Ymn6"};function i(e){var t=e.children,n=e.hidden,i=e.className;return r.createElement("div",{role:"tabpanel",className:(0,o.Z)(a.tabItem,i),hidden:n},t)}},4866:(e,t,n)=>{n.d(t,{Z:()=>k});var r=n(7462),o=n(7294),a=n(6010),i=n(2466),l=n(6550),u=n(1980),s=n(7392),p=n(12);function d(e){return function(e){var t,n;return null!=(t=null==(n=o.Children.map(e,(function(e){if(!e||(0,o.isValidElement)(e)&&(t=e.props)&&"object"==typeof t&&"value"in t)return e;var t;throw new Error("Docusaurus error: Bad <Tabs> child <"+("string"==typeof e.type?e.type:e.type.name)+'>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.')})))?void 0:n.filter(Boolean))?t:[]}(e).map((function(e){var t=e.props;return{value:t.value,label:t.label,attributes:t.attributes,default:t.default}}))}function m(e){var t=e.values,n=e.children;return(0,o.useMemo)((function(){var e=null!=t?t:d(n);return function(e){var t=(0,s.l)(e,(function(e,t){return e.value===t.value}));if(t.length>0)throw new Error('Docusaurus error: Duplicate values "'+t.map((function(e){return e.value})).join(", ")+'" found in <Tabs>. Every value needs to be unique.')}(e),e}),[t,n])}function c(e){var t=e.value;return e.tabValues.some((function(e){return e.value===t}))}function b(e){var t=e.queryString,n=void 0!==t&&t,r=e.groupId,a=(0,l.k6)(),i=function(e){var t=e.queryString,n=void 0!==t&&t,r=e.groupId;if("string"==typeof n)return n;if(!1===n)return null;if(!0===n&&!r)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return null!=r?r:null}({queryString:n,groupId:r});return[(0,u._X)(i),(0,o.useCallback)((function(e){if(i){var t=new URLSearchParams(a.location.search);t.set(i,e),a.replace(Object.assign({},a.location,{search:t.toString()}))}}),[i,a])]}function f(e){var t,n,r,a,i=e.defaultValue,l=e.queryString,u=void 0!==l&&l,s=e.groupId,d=m(e),f=(0,o.useState)((function(){return function(e){var t,n=e.defaultValue,r=e.tabValues;if(0===r.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(n){if(!c({value:n,tabValues:r}))throw new Error('Docusaurus error: The <Tabs> has a defaultValue "'+n+'" but none of its children has the corresponding value. Available values are: '+r.map((function(e){return e.value})).join(", ")+". If you intend to show no default tab, use defaultValue={null} instead.");return n}var o=null!=(t=r.find((function(e){return e.default})))?t:r[0];if(!o)throw new Error("Unexpected error: 0 tabValues");return o.value}({defaultValue:i,tabValues:d})})),v=f[0],y=f[1],h=b({queryString:u,groupId:s}),g=h[0],T=h[1],k=(t=function(e){return e?"docusaurus.tab."+e:null}({groupId:s}.groupId),n=(0,p.Nk)(t),r=n[0],a=n[1],[r,(0,o.useCallback)((function(e){t&&a.set(e)}),[t,a])]),I=k[0],N=k[1],O=function(){var e=null!=g?g:I;return c({value:e,tabValues:d})?e:null}();return(0,o.useLayoutEffect)((function(){O&&y(O)}),[O]),{selectedValue:v,selectValue:(0,o.useCallback)((function(e){if(!c({value:e,tabValues:d}))throw new Error("Can't select invalid tab value="+e);y(e),T(e),N(e)}),[T,N,d]),tabValues:d}}var v=n(2389);const y={tabList:"tabList__CuJ",tabItem:"tabItem_LNqP"};function h(e){var t=e.className,n=e.block,l=e.selectedValue,u=e.selectValue,s=e.tabValues,p=[],d=(0,i.o5)().blockElementScrollPositionUntilNextRender,m=function(e){var t=e.currentTarget,n=p.indexOf(t),r=s[n].value;r!==l&&(d(t),u(r))},c=function(e){var t,n=null;switch(e.key){case"Enter":m(e);break;case"ArrowRight":var r,o=p.indexOf(e.currentTarget)+1;n=null!=(r=p[o])?r:p[0];break;case"ArrowLeft":var a,i=p.indexOf(e.currentTarget)-1;n=null!=(a=p[i])?a:p[p.length-1]}null==(t=n)||t.focus()};return o.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,a.Z)("tabs",{"tabs--block":n},t)},s.map((function(e){var t=e.value,n=e.label,i=e.attributes;return o.createElement("li",(0,r.Z)({role:"tab",tabIndex:l===t?0:-1,"aria-selected":l===t,key:t,ref:function(e){return p.push(e)},onKeyDown:c,onClick:m},i,{className:(0,a.Z)("tabs__item",y.tabItem,null==i?void 0:i.className,{"tabs__item--active":l===t})}),null!=n?n:t)})))}function g(e){var t=e.lazy,n=e.children,r=e.selectedValue,a=(Array.isArray(n)?n:[n]).filter(Boolean);if(t){var i=a.find((function(e){return e.props.value===r}));return i?(0,o.cloneElement)(i,{className:"margin-top--md"}):null}return o.createElement("div",{className:"margin-top--md"},a.map((function(e,t){return(0,o.cloneElement)(e,{key:t,hidden:e.props.value!==r})})))}function T(e){var t=f(e);return o.createElement("div",{className:(0,a.Z)("tabs-container",y.tabList)},o.createElement(h,(0,r.Z)({},e,t)),o.createElement(g,(0,r.Z)({},e,t)))}function k(e){var t=(0,v.Z)();return o.createElement(T,(0,r.Z)({key:String(t)},e))}},5036:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>m,contentTitle:()=>p,default:()=>v,frontMatter:()=>s,metadata:()=>d,toc:()=>c});var r=n(7462),o=n(3366),a=(n(7294),n(3905)),i=n(4866),l=n(5162),u=["components"],s={title:"Subscriptions"},p=void 0,d={unversionedId:"graphql/subscriptions",id:"graphql/subscriptions",title:"Subscriptions",description:"Before reading this it is recommended to read the nestjs graphql subscriptions docs.",source:"@site/docs/graphql/subscriptions.mdx",sourceDirName:"graphql",slug:"/graphql/subscriptions",permalink:"/nestjs-query/docs/graphql/subscriptions",draft:!1,editUrl:"https://github.com/tripss/nestjs-query/edit/master/documentation/docs/graphql/subscriptions.mdx",tags:[],version:"current",frontMatter:{title:"Subscriptions"},sidebar:"docs",previous:{title:"Aggregations",permalink:"/nestjs-query/docs/graphql/aggregations"},next:{title:"Relations",permalink:"/nestjs-query/docs/graphql/relations"}},m={},c=[{value:"Enabling Subscriptions",id:"enabling-subscriptions",level:2},{value:"Enabling/Disabling Individual Subscriptions",id:"enablingdisabling-individual-subscriptions",level:3},{value:"Filtering Subscriptions",id:"filtering-subscriptions",level:2},{value:"Custom PubSub Provider",id:"custom-pubsub-provider",level:2}],b={toc:c},f="wrapper";function v(e){var t=e.components,n=(0,o.Z)(e,u);return(0,a.kt)(f,(0,r.Z)({},b,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("admonition",{type:"note"},(0,a.kt)("p",{parentName:"admonition"},"Before reading this it is recommended to read the ",(0,a.kt)("a",{parentName:"p",href:"https://docs.nestjs.com/graphql/subscriptions"},"nestjs graphql subscriptions docs"),".")),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"nestjs-query")," includes out of the box subscription support. When enabling subscriptions the following subscriptions will be created"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"created{ObjectName}")," - published when the ",(0,a.kt)("inlineCode",{parentName:"li"},"createOne")," or ",(0,a.kt)("inlineCode",{parentName:"li"},"createMany")," mutation is called."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"updatedOne{ObjectName}"),"  - published when the ",(0,a.kt)("inlineCode",{parentName:"li"},"updateOne")," mutation is called."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"updatedMany{ObjectName}")," - published when ",(0,a.kt)("inlineCode",{parentName:"li"},"updateMany")," mutation is called."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"deletedOne{ObjectName}")," - published when the ",(0,a.kt)("inlineCode",{parentName:"li"},"deleteOne")," mutation is called."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"deletedMany{ObjectName}"),"  - published when ",(0,a.kt)("inlineCode",{parentName:"li"},"deleteMany")," mutation is called.")),(0,a.kt)("h2",{id:"enabling-subscriptions"},"Enabling Subscriptions"),(0,a.kt)("p",null,"You can enable subscriptions through the auto-generated resolver using the ",(0,a.kt)("inlineCode",{parentName:"p"},"NestjsQueryGraphQLModule")," or by manually defining your resolver."),(0,a.kt)("p",null,"In both cases you need to set the ",(0,a.kt)("inlineCode",{parentName:"p"},"enableSubscriptions")," option to ",(0,a.kt)("inlineCode",{parentName:"p"},"true"),"."),(0,a.kt)("p",null,"In the below example the following subscriptions will be exposed."),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"createdTodoItem")," - published when the ",(0,a.kt)("inlineCode",{parentName:"li"},"createOne")," or ",(0,a.kt)("inlineCode",{parentName:"li"},"createMany")," mutation is called."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"updatedOneTodoItem"),"  - published when the ",(0,a.kt)("inlineCode",{parentName:"li"},"updateOne")," mutation is called."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"updatedManyTodoItems")," - published when ",(0,a.kt)("inlineCode",{parentName:"li"},"updateMany")," mutation is called."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"deletedOneTodoItem")," - published when the ",(0,a.kt)("inlineCode",{parentName:"li"},"deleteOne")," mutation is called."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"deletedManyTodoItems"),"  - published when ",(0,a.kt)("inlineCode",{parentName:"li"},"deleteMany")," mutation is called.")),(0,a.kt)(i.Z,{defaultValue:"module",values:[{label:"NestjsQueryGraphQLModule",value:"module"},{label:"CRUDResolver",value:"resolver"}],mdxType:"Tabs"},(0,a.kt)(l.Z,{value:"module",mdxType:"TabItem"},(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts",metastring:'title="todo-item.module.ts" {17}',title:'"todo-item.module.ts"',"{17}":!0},"import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';\nimport { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';\nimport { Module } from '@nestjs/common';\nimport { TodoItemInputDTO } from './todo-item.input';\nimport { TodoItemDTO } from './todo-item.dto';\nimport { TodoItemEntity } from './todo-item.entity';\n\n@Module({\n  imports: [\n    NestjsQueryGraphQLModule.forFeature({\n      imports: [NestjsQueryTypeOrmModule.forFeature([TodoItemEntity])],\n      resolvers: [{\n        DTOClass: TodoItemDTO,\n        EntityClass: TodoItemEntity,\n        CreateDTOClass: TodoItemInputDTO,\n        UpdateDTOClass: TodoItemInputDTO,\n        enableSubscriptions: true,\n      }],\n    }),\n  ],\n})\nexport class TodoItemModule {}\n"))),(0,a.kt)(l.Z,{value:"resolver",mdxType:"TabItem"},(0,a.kt)("p",null,"When manually defining your resolver you must also provide a readonly ",(0,a.kt)("inlineCode",{parentName:"p"},"pubSub")," property. In this the default ",(0,a.kt)("inlineCode",{parentName:"p"},"PubSub")," implementation is injected."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts",metastring:'title="todo-item.resolver.ts" {13,17}',title:'"todo-item.resolver.ts"',"{13,17}":!0},"import { QueryService, InjectQueryService } from '@ptc-org/nestjs-query-core';\nimport { CRUDResolver, InjectPubSub } from '@ptc-org/nestjs-query-graphql';\nimport { Resolver } from '@nestjs/graphql';\nimport { PubSub } from 'graphql-subscriptions';\nimport { TodoItemInputDTO } from './todo-item.input';\nimport { TodoItemDTO } from './todo-item.dto';\nimport { TodoItemEntity } from './todo-item.entity';\n\n@Resolver()\nexport class TodoItemResolver extends CRUDResolver(TodoItemDTO, {\n  CreateDTOClass: TodoItemInputDTO,\n  UpdateDTOClass: TodoItemInputDTO,\n  enableSubscriptions: true,\n}) {\n  constructor(\n      @InjectQueryService(TodoItemEntity) readonly service: QueryService<TodoItemEntity>,\n      @InjectPubSub() readonly pubSub: PubSub\n  ) {\n    super(service);\n  }\n}\n")))),(0,a.kt)("h3",{id:"enablingdisabling-individual-subscriptions"},"Enabling/Disabling Individual Subscriptions"),(0,a.kt)("p",null,"You also have the option to selectively enable or disable individual subscriptions."),(0,a.kt)("p",null,"In this example the ",(0,a.kt)("inlineCode",{parentName:"p"},"updatedMany")," and ",(0,a.kt)("inlineCode",{parentName:"p"},"deletedMany")," subscriptions are disabled."),(0,a.kt)(i.Z,{defaultValue:"module",values:[{label:"NestjsQueryGraphQLModule",value:"module"},{label:"CRUDResolver",value:"resolver"}],mdxType:"Tabs"},(0,a.kt)(l.Z,{value:"module",mdxType:"TabItem"},(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts",metastring:'title="todo-item.module.ts" {18-19}',title:'"todo-item.module.ts"',"{18-19}":!0},"import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';\nimport { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';\nimport { Module } from '@nestjs/common';\nimport { TodoItemInputDTO } from './dto/todo-item-input.dto';\nimport { TodoItemUpdateDTO } from './dto/todo-item-update.dto';\nimport { TodoItemDTO } from './dto/todo-item.dto';\nimport { TodoItemEntity } from './todo-item.entity';\n\n@Module({\n  imports: [\n    NestjsQueryGraphQLModule.forFeature({\n      imports: [NestjsQueryTypeOrmModule.forFeature([TodoItemEntity])],\n      resolvers: [\n        {\n          DTOClass: TodoItemDTO,\n          EntityClass: TodoItemEntity,\n          CreateDTOClass: TodoItemInputDTO,\n          UpdateDTOClass: TodoItemUpdateDTO,\n          enableSubscriptions: true,\n          update: { many: { enableSubscriptions: false } },\n          delete: { many: { enableSubscriptions: false } },\n        },\n      ],\n    }),\n  ],\n})\nexport class TodoItemModule {}\n\n"))),(0,a.kt)(l.Z,{value:"resolver",mdxType:"TabItem"},(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts",metastring:'title="todo-item.resolver.ts" {14-15}',title:'"todo-item.resolver.ts"',"{14-15}":!0},"import { QueryService, InjectQueryService } from '@ptc-org/nestjs-query-core';\nimport { CRUDResolver, InjectPubSub } from '@ptc-org/nestjs-query-graphql';\nimport { Resolver } from '@nestjs/graphql';\nimport { PubSub } from 'graphql-subscriptions';\nimport { TodoItemInputDTO } from './todo-item.input';\nimport { TodoItemDTO } from './todo-item.dto';\nimport { TodoItemEntity } from './todo-item.entity';\n\n@Resolver()\nexport class TodoItemResolver extends CRUDResolver(TodoItemDTO, {\n  CreateDTOClass: TodoItemInputDTO,\n  UpdateDTOClass: TodoItemInputDTO,\n  enableSubscriptions: true,\n  update: { many: { enableSubscriptions: false } },\n  delete: { many: { enableSubscriptions: false } },\n}) {\n  constructor(\n      @InjectQueryService(TodoItemEntity) readonly service: QueryService<TodoItemEntity>,\n      @InjectPubSub() readonly pubSub: PubSub\n  ) {\n    super(service);\n  }\n}\n")))),(0,a.kt)("h2",{id:"filtering-subscriptions"},"Filtering Subscriptions"),(0,a.kt)("p",null,"The ",(0,a.kt)("inlineCode",{parentName:"p"},"created"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"updatedOne")," and ",(0,a.kt)("inlineCode",{parentName:"p"},"deletedOne")," subscriptions all for a ",(0,a.kt)("inlineCode",{parentName:"p"},"Filter")," to be passed in filter for events that match the criteria"),(0,a.kt)("p",null,"The filter your provide is the same type that is used when querying for records."),(0,a.kt)("p",null,"For example to filter for all created ",(0,a.kt)("inlineCode",{parentName:"p"},"TodoItems")," where the like starts with ",(0,a.kt)("inlineCode",{parentName:"p"},"Foo")," and is completed, you could do the following."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-graphql"},'subscription {\n  createdTodoItem(\n    input: { filter: { title: { like: "Foo%" }, completed: { is: true } } }\n  ) {\n    id\n    title\n    description\n    completed\n    created\n    updated\n  }\n}\n')),(0,a.kt)("h2",{id:"custom-pubsub-provider"},"Custom PubSub Provider"),(0,a.kt)("p",null,"You can override the default ",(0,a.kt)("inlineCode",{parentName:"p"},"PubSub")," implementation by creating your own provider and providing it to ",(0,a.kt)("inlineCode",{parentName:"p"},"nestjs-query"),"."),(0,a.kt)("p",null,"Below is an example provider."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts",metastring:'title="redis-pub-sub.provider.ts"',title:'"redis-pub-sub.provider.ts"'},"import { pubSubToken } from '@ptc-org/nestjs-query-graphql';\nimport { RedisPubSub } from 'graphql-redis-subscriptions';\nimport Redis from 'ioredis';\nimport { Provider } from '@nestjs/common';\n\nexport class RedisPubSubProvider {\n  static provider(): Provider {\n    return {\n      provide: pubSubToken(),\n      useValue: new RedisPubSub({\n        publisher: new Redis(),\n        subscriber: new Redis(),\n      }),\n    };\n  }\n}\n\n")),(0,a.kt)("p",null,"In order to let ",(0,a.kt)("inlineCode",{parentName:"p"},"nestjs-query")," know about the provider you can set the ",(0,a.kt)("inlineCode",{parentName:"p"},"pubSub")," option."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts",metastring:'title="todo-item/todo-item.module.ts" {14}',title:'"todo-item/todo-item.module.ts"',"{14}":!0},"import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';\nimport { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';\nimport { Module } from '@nestjs/common';\nimport { TodoItemInputDTO } from './dto/todo-item-input.dto';\nimport { TodoItemUpdateDTO } from './dto/todo-item-update.dto';\nimport { TodoItemDTO } from './dto/todo-item.dto';\nimport { TodoItemEntity } from './todo-item.entity';\nimport { RedisPubSubProvider } from '../redis-pub-sub.provider';\n\n@Module({\n  imports: [\n    NestjsQueryGraphQLModule.forFeature({\n      imports: [NestjsQueryTypeOrmModule.forFeature([TodoItemEntity])],\n      pubSub: RedisPubSubProvider.provider(),\n      resolvers: [\n        {\n          DTOClass: TodoItemDTO,\n          EntityClass: TodoItemEntity,\n          CreateDTOClass: TodoItemInputDTO,\n          UpdateDTOClass: TodoItemUpdateDTO,\n          enableSubscriptions: true,\n        },\n      ],\n    }),\n  ],\n})\nexport class TodoItemModule {}\n")))}v.isMDXComponent=!0}}]);