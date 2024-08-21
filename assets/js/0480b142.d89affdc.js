"use strict";(self.webpackChunknestjs_query=self.webpackChunknestjs_query||[]).push([[836],{571:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>l,contentTitle:()=>r,default:()=>h,frontMatter:()=>t,metadata:()=>a,toc:()=>c});var s=i(5893),o=i(1151);const t={title:"FAQ"},r=void 0,a={id:"faq",title:"FAQ",description:"The resolver is complaining about my QueryService",source:"@site/docs/faq.md",sourceDirName:".",slug:"/faq",permalink:"/nestjs-query/docs/faq",draft:!1,unlisted:!1,editUrl:"https://github.com/tripss/nestjs-query/edit/master/documentation/docs/faq.md",tags:[],version:"current",frontMatter:{title:"FAQ"}},l={},c=[{value:"The resolver is complaining about my QueryService",id:"the-resolver-is-complaining-about-my-queryservice",level:2},{value:"Do I need a DTO and Entity?",id:"do-i-need-a-dto-and-entity",level:2},{value:"Can I use OFFSET paging instead of a cursor with connections?",id:"can-i-use-offset-paging-instead-of-a-cursor-with-connections",level:2},{value:"Can I use turn off paging?",id:"can-i-use-turn-off-paging",level:2},{value:"How can I filter on relations?",id:"how-can-i-filter-on-relations",level:2},{value:"Does nestjs-query support specifying complexity.",id:"does-nestjs-query-support-specifying-complexity",level:2}];function d(e){const n={a:"a",admonition:"admonition",code:"code",h2:"h2",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,o.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.h2,{id:"the-resolver-is-complaining-about-my-queryservice",children:"The resolver is complaining about my QueryService"}),"\n",(0,s.jsx)(n.p,{children:"If you see an error that contains the following"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:"The types of 'service.query' are incompatible between these types.\n"})}),"\n",(0,s.jsx)(n.p,{children:"It means that your entity and DTO are not compatible."}),"\n",(0,s.jsx)(n.p,{children:"Typically this indicates that your DTO contains additional fields that your entity does not OR that you have different types for fields."}),"\n",(0,s.jsx)(n.p,{children:"To fix:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"Ensure that your entity has the same fields and field types as your DTO."}),"\n",(0,s.jsxs)(n.li,{children:["If you have fields that should be computed or derived from your entity try using an ",(0,s.jsx)(n.a,{href:"/nestjs-query/docs/concepts/advanced/assemblers",children:"Assembler"})]}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"do-i-need-a-dto-and-entity",children:"Do I need a DTO and Entity?"}),"\n",(0,s.jsx)(n.p,{children:"No, you do not!"}),"\n",(0,s.jsx)(n.p,{children:"For a small project the overhead may not be worth managing both the Entity and DTO especially if they are copies of eachother."}),"\n",(0,s.jsx)(n.p,{children:"In a larger, longer lived project the initial overhead of creating a DTO in the beginning can pay off if you need to make changes to your persistence layer while keeping changes in your API passive."}),"\n",(0,s.jsx)(n.p,{children:"DTOs also provide a clean separation between the fields and relationships that the persistence layer should not know or care about."}),"\n",(0,s.jsx)(n.admonition,{type:"note",children:(0,s.jsxs)(n.p,{children:["When combining your entity and DTO you should ",(0,s.jsx)(n.strong,{children:"NOT"})," decorate your relationships with ",(0,s.jsx)(n.code,{children:"@Field"})," or ",(0,s.jsx)(n.code,{children:"@FilterableField"}),". Instead, add them to your CRUDResolver. ",(0,s.jsx)(n.a,{href:"/nestjs-query/docs/persistence/services#relations",children:"Read More"})]})}),"\n",(0,s.jsx)(n.h2,{id:"can-i-use-offset-paging-instead-of-a-cursor-with-connections",children:"Can I use OFFSET paging instead of a cursor with connections?"}),"\n",(0,s.jsxs)(n.p,{children:["Yes! You can specify a ",(0,s.jsx)(n.code,{children:"pagingStrategy"})," option to customize how paging is handled at the DTO or relation level."]}),"\n",(0,s.jsx)(n.p,{children:"For more information and examples check out the following docs"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/nestjs-query/docs/graphql/dtos#paging-strategy",children:"DTO Paging Strategy"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/nestjs-query/docs/graphql/relations",children:"Relations"})}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"can-i-use-turn-off-paging",children:"Can I use turn off paging?"}),"\n",(0,s.jsxs)(n.p,{children:["Yes! You can specify a ",(0,s.jsx)(n.code,{children:"pagingStrategy"})," option to customize how paging is handled at the resolver or relation level."]}),"\n",(0,s.jsx)(n.p,{children:"For more information and examples check out the following docs"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/nestjs-query/docs/graphql/dtos#paging-strategy",children:"DTO Paging Strategy"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/nestjs-query/docs/graphql/relations",children:"Relations"})}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"how-can-i-filter-on-relations",children:"How can I filter on relations?"}),"\n",(0,s.jsxs)(n.p,{children:["You can filter based on relations if you use the ",(0,s.jsx)(n.code,{children:"@FilterableRelation"})," or ",(0,s.jsx)(n.code,{children:"@FilterableConnection"})," decorators when defining your relations."]}),"\n",(0,s.jsx)(n.p,{children:"To read more and see examples, read the following docs."}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/nestjs-query/docs/graphql/relations#filterablerelation",children:(0,s.jsx)(n.code,{children:"@FilterableRelation"})})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/nestjs-query/docs/graphql/relations#filterableoffsetconnection",children:(0,s.jsx)(n.code,{children:"@FilterableConnection"})})}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"does-nestjs-query-support-specifying-complexity",children:"Does nestjs-query support specifying complexity."}),"\n",(0,s.jsx)(n.p,{children:"Yes!"}),"\n",(0,s.jsxs)(n.p,{children:["The ",(0,s.jsx)(n.code,{children:"@FilterableField"})," decorator accepts the same arguments as the ",(0,s.jsx)(n.code,{children:"@Field"})," decorator from ",(0,s.jsx)(n.code,{children:"@nestjs/graphql"})]}),"\n",(0,s.jsxs)(n.p,{children:["The ",(0,s.jsx)(n.code,{children:"@Relation"})," ",(0,s.jsx)(n.code,{children:"@FilterableRelation"}),", ",(0,s.jsx)(n.code,{children:"@UnPagedRelation"}),", ",(0,s.jsx)(n.code,{children:"@FilterableUnPagedRelation"}),", ",(0,s.jsx)(n.code,{children:"@OffsetConnection"}),", ",(0,s.jsx)(n.code,{children:"@FilterableOffsetConnection"}),", ",(0,s.jsx)(n.code,{children:"@CursorConnection"}),", and ",(0,s.jsx)(n.code,{children:"@FilterableCursorConnection"})," decorators also accept a complexity option."]}),"\n",(0,s.jsxs)(n.p,{children:["To read more about complexity ",(0,s.jsx)(n.a,{href:"https://docs.nestjs.com/graphql/complexity",children:"see the nestjs docs"})]})]})}function h(e={}){const{wrapper:n}={...(0,o.a)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(d,{...e})}):d(e)}},1151:(e,n,i)=>{i.d(n,{Z:()=>a,a:()=>r});var s=i(7294);const o={},t=s.createContext(o);function r(e){const n=s.useContext(t);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:r(e.components),s.createElement(t.Provider,{value:n},e.children)}}}]);