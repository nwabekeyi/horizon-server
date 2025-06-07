import{r as l,t as Ae,R as q,a as B,_ as H,g as Me,b as oe,s as G,W as de,u as ie,j as w,f as g,h as xe,a5 as re}from"./index-C-veA1Rv.js";import{a as Ke,u as fe,b as qe}from"./useIsFocusVisible-SVz0b4Hl.js";function Y(e){const t=l.useRef(e);return Ae(()=>{t.current=e}),l.useRef((...n)=>(0,t.current)(...n)).current}const he=e=>{let t;return e<1?t=5.11916*e**2:t=4.5*Math.log(e+1)+2,(t/100).toFixed(2)};function te(e,t){return te=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(n,s){return n.__proto__=s,n},te(e,t)}function We(e,t){e.prototype=Object.create(t.prototype),e.prototype.constructor=e,te(e,t)}const me=q.createContext(null);function Xe(e){if(e===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function se(e,t){var n=function(o){return t&&l.isValidElement(o)?t(o):o},s=Object.create(null);return e&&l.Children.map(e,function(i){return i}).forEach(function(i){s[i.key]=n(i)}),s}function Ye(e,t){e=e||{},t=t||{};function n(f){return f in t?t[f]:e[f]}var s=Object.create(null),i=[];for(var o in e)o in t?i.length&&(s[o]=i,i=[]):i.push(o);var r,c={};for(var u in t){if(s[u])for(r=0;r<s[u].length;r++){var p=s[u][r];c[s[u][r]]=n(p)}c[u]=n(u)}for(r=0;r<i.length;r++)c[i[r]]=n(i[r]);return c}function j(e,t,n){return n[t]!=null?n[t]:e.props[t]}function He(e,t){return se(e.children,function(n){return l.cloneElement(n,{onExited:t.bind(null,n),in:!0,appear:j(n,"appear",e),enter:j(n,"enter",e),exit:j(n,"exit",e)})})}function Ge(e,t,n){var s=se(e.children),i=Ye(t,s);return Object.keys(i).forEach(function(o){var r=i[o];if(l.isValidElement(r)){var c=o in t,u=o in s,p=t[o],f=l.isValidElement(p)&&!p.props.in;u&&(!c||f)?i[o]=l.cloneElement(r,{onExited:n.bind(null,r),in:!0,exit:j(r,"exit",e),enter:j(r,"enter",e)}):!u&&c&&!f?i[o]=l.cloneElement(r,{in:!1}):u&&c&&l.isValidElement(p)&&(i[o]=l.cloneElement(r,{onExited:n.bind(null,r),in:p.props.in,exit:j(r,"exit",e),enter:j(r,"enter",e)}))}}),i}var Je=Object.values||function(e){return Object.keys(e).map(function(t){return e[t]})},Qe={component:"div",childFactory:function(t){return t}},ae=function(e){We(t,e);function t(s,i){var o;o=e.call(this,s,i)||this;var r=o.handleExited.bind(Xe(o));return o.state={contextValue:{isMounting:!0},handleExited:r,firstRender:!0},o}var n=t.prototype;return n.componentDidMount=function(){this.mounted=!0,this.setState({contextValue:{isMounting:!1}})},n.componentWillUnmount=function(){this.mounted=!1},t.getDerivedStateFromProps=function(i,o){var r=o.children,c=o.handleExited,u=o.firstRender;return{children:u?He(i,c):Ge(i,r,c),firstRender:!1}},n.handleExited=function(i,o){var r=se(this.props.children);i.key in r||(i.props.onExited&&i.props.onExited(o),this.mounted&&this.setState(function(c){var u=B({},c.children);return delete u[i.key],{children:u}}))},n.render=function(){var i=this.props,o=i.component,r=i.childFactory,c=H(i,["component","childFactory"]),u=this.state.contextValue,p=Je(this.state.children).map(r);return delete c.appear,delete c.enter,delete c.exit,o===null?q.createElement(me.Provider,{value:u},p):q.createElement(me.Provider,{value:u},q.createElement(o,c,p))},t}(q.Component);ae.propTypes={};ae.defaultProps=Qe;function Ze(e){return Me("MuiPaper",e)}oe("MuiPaper",["root","rounded","outlined","elevation","elevation0","elevation1","elevation2","elevation3","elevation4","elevation5","elevation6","elevation7","elevation8","elevation9","elevation10","elevation11","elevation12","elevation13","elevation14","elevation15","elevation16","elevation17","elevation18","elevation19","elevation20","elevation21","elevation22","elevation23","elevation24"]);const et=["className","component","elevation","square","variant"],tt=e=>{const{square:t,elevation:n,variant:s,classes:i}=e,o={root:["root",s,!t&&"rounded",s==="elevation"&&`elevation${n}`]};return xe(o,Ze,i)},nt=G("div",{name:"MuiPaper",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.root,t[n.variant],!n.square&&t.rounded,n.variant==="elevation"&&t[`elevation${n.elevation}`]]}})(({theme:e,ownerState:t})=>{var n;return B({backgroundColor:(e.vars||e).palette.background.paper,color:(e.vars||e).palette.text.primary,transition:e.transitions.create("box-shadow")},!t.square&&{borderRadius:e.shape.borderRadius},t.variant==="outlined"&&{border:`1px solid ${(e.vars||e).palette.divider}`},t.variant==="elevation"&&B({boxShadow:(e.vars||e).shadows[t.elevation]},!e.vars&&e.palette.mode==="dark"&&{backgroundImage:`linear-gradient(${de("#fff",he(t.elevation))}, ${de("#fff",he(t.elevation))})`},e.vars&&{backgroundImage:(n=e.vars.overlays)==null?void 0:n[t.elevation]}))}),Mt=l.forwardRef(function(t,n){const s=ie({props:t,name:"MuiPaper"}),{className:i,component:o="div",elevation:r=1,square:c=!1,variant:u="elevation"}=s,p=H(s,et),f=B({},s,{component:o,elevation:r,square:c,variant:u}),m=tt(f);return w.jsx(nt,B({as:o,ownerState:f,className:g(m.root,i),ref:n},p))});function ot(e){const{className:t,classes:n,pulsate:s=!1,rippleX:i,rippleY:o,rippleSize:r,in:c,onExited:u,timeout:p}=e,[f,m]=l.useState(!1),v=g(t,n.ripple,n.rippleVisible,s&&n.ripplePulsate),E={width:r,height:r,top:-(r/2)+o,left:-(r/2)+i},h=g(n.child,f&&n.childLeaving,s&&n.childPulsate);return!c&&!f&&m(!0),l.useEffect(()=>{if(!c&&u!=null){const R=setTimeout(u,p);return()=>{clearTimeout(R)}}},[u,c,p]),w.jsx("span",{className:v,style:E,children:w.jsx("span",{className:h})})}const b=oe("MuiTouchRipple",["root","ripple","rippleVisible","ripplePulsate","child","childLeaving","childPulsate"]),it=["center","classes","className"];let J=e=>e,be,ve,ge,Re;const ne=550,rt=80,st=re(be||(be=J`
  0% {
    transform: scale(0);
    opacity: 0.1;
  }

  100% {
    transform: scale(1);
    opacity: 0.3;
  }
`)),at=re(ve||(ve=J`
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
`)),lt=re(ge||(ge=J`
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(0.92);
  }

  100% {
    transform: scale(1);
  }
`)),ut=G("span",{name:"MuiTouchRipple",slot:"Root"})({overflow:"hidden",pointerEvents:"none",position:"absolute",zIndex:0,top:0,right:0,bottom:0,left:0,borderRadius:"inherit"}),ct=G(ot,{name:"MuiTouchRipple",slot:"Ripple"})(Re||(Re=J`
  opacity: 0;
  position: absolute;

  &.${0} {
    opacity: 0.3;
    transform: scale(1);
    animation-name: ${0};
    animation-duration: ${0}ms;
    animation-timing-function: ${0};
  }

  &.${0} {
    animation-duration: ${0}ms;
  }

  & .${0} {
    opacity: 1;
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: currentColor;
  }

  & .${0} {
    opacity: 0;
    animation-name: ${0};
    animation-duration: ${0}ms;
    animation-timing-function: ${0};
  }

  & .${0} {
    position: absolute;
    /* @noflip */
    left: 0px;
    top: 0;
    animation-name: ${0};
    animation-duration: 2500ms;
    animation-timing-function: ${0};
    animation-iteration-count: infinite;
    animation-delay: 200ms;
  }
`),b.rippleVisible,st,ne,({theme:e})=>e.transitions.easing.easeInOut,b.ripplePulsate,({theme:e})=>e.transitions.duration.shorter,b.child,b.childLeaving,at,ne,({theme:e})=>e.transitions.easing.easeInOut,b.childPulsate,lt,({theme:e})=>e.transitions.easing.easeInOut),pt=l.forwardRef(function(t,n){const s=ie({props:t,name:"MuiTouchRipple"}),{center:i=!1,classes:o={},className:r}=s,c=H(s,it),[u,p]=l.useState([]),f=l.useRef(0),m=l.useRef(null);l.useEffect(()=>{m.current&&(m.current(),m.current=null)},[u]);const v=l.useRef(!1),E=Ke(),h=l.useRef(null),R=l.useRef(null),U=l.useCallback(d=>{const{pulsate:M,rippleX:x,rippleY:L,rippleSize:I,cb:z}=d;p(y=>[...y,w.jsx(ct,{classes:{ripple:g(o.ripple,b.ripple),rippleVisible:g(o.rippleVisible,b.rippleVisible),ripplePulsate:g(o.ripplePulsate,b.ripplePulsate),child:g(o.child,b.child),childLeaving:g(o.childLeaving,b.childLeaving),childPulsate:g(o.childPulsate,b.childPulsate)},timeout:ne,pulsate:M,rippleX:x,rippleY:L,rippleSize:I},f.current)]),f.current+=1,m.current=z},[o]),F=l.useCallback((d={},M={},x=()=>{})=>{const{pulsate:L=!1,center:I=i||M.pulsate,fakeElement:z=!1}=M;if((d==null?void 0:d.type)==="mousedown"&&v.current){v.current=!1;return}(d==null?void 0:d.type)==="touchstart"&&(v.current=!0);const y=z?null:R.current,$=y?y.getBoundingClientRect():{width:0,height:0,left:0,top:0};let T,k,D;if(I||d===void 0||d.clientX===0&&d.clientY===0||!d.clientX&&!d.touches)T=Math.round($.width/2),k=Math.round($.height/2);else{const{clientX:N,clientY:P}=d.touches&&d.touches.length>0?d.touches[0]:d;T=Math.round(N-$.left),k=Math.round(P-$.top)}if(I)D=Math.sqrt((2*$.width**2+$.height**2)/3),D%2===0&&(D+=1);else{const N=Math.max(Math.abs((y?y.clientWidth:0)-T),T)*2+2,P=Math.max(Math.abs((y?y.clientHeight:0)-k),k)*2+2;D=Math.sqrt(N**2+P**2)}d!=null&&d.touches?h.current===null&&(h.current=()=>{U({pulsate:L,rippleX:T,rippleY:k,rippleSize:D,cb:x})},E.start(rt,()=>{h.current&&(h.current(),h.current=null)})):U({pulsate:L,rippleX:T,rippleY:k,rippleSize:D,cb:x})},[i,U,E]),O=l.useCallback(()=>{F({},{pulsate:!0})},[F]),S=l.useCallback((d,M)=>{if(E.clear(),(d==null?void 0:d.type)==="touchend"&&h.current){h.current(),h.current=null,E.start(0,()=>{S(d,M)});return}h.current=null,p(x=>x.length>0?x.slice(1):x),m.current=M},[E]);return l.useImperativeHandle(n,()=>({pulsate:O,start:F,stop:S}),[O,F,S]),w.jsx(ut,B({className:g(b.root,o.root,r),ref:R},c,{children:w.jsx(ae,{component:null,exit:!0,children:u})}))});function dt(e){return Me("MuiButtonBase",e)}const ft=oe("MuiButtonBase",["root","disabled","focusVisible"]),ht=["action","centerRipple","children","className","component","disabled","disableRipple","disableTouchRipple","focusRipple","focusVisibleClassName","LinkComponent","onBlur","onClick","onContextMenu","onDragLeave","onFocus","onFocusVisible","onKeyDown","onKeyUp","onMouseDown","onMouseLeave","onMouseUp","onTouchEnd","onTouchMove","onTouchStart","tabIndex","TouchRippleProps","touchRippleRef","type"],mt=e=>{const{disabled:t,focusVisible:n,focusVisibleClassName:s,classes:i}=e,r=xe({root:["root",t&&"disabled",n&&"focusVisible"]},dt,i);return n&&s&&(r.root+=` ${s}`),r},bt=G("button",{name:"MuiButtonBase",slot:"Root",overridesResolver:(e,t)=>t.root})({display:"inline-flex",alignItems:"center",justifyContent:"center",position:"relative",boxSizing:"border-box",WebkitTapHighlightColor:"transparent",backgroundColor:"transparent",outline:0,border:0,margin:0,borderRadius:0,padding:0,cursor:"pointer",userSelect:"none",verticalAlign:"middle",MozAppearance:"none",WebkitAppearance:"none",textDecoration:"none",color:"inherit","&::-moz-focus-inner":{borderStyle:"none"},[`&.${ft.disabled}`]:{pointerEvents:"none",cursor:"default"},"@media print":{colorAdjust:"exact"}}),xt=l.forwardRef(function(t,n){const s=ie({props:t,name:"MuiButtonBase"}),{action:i,centerRipple:o=!1,children:r,className:c,component:u="button",disabled:p=!1,disableRipple:f=!1,disableTouchRipple:m=!1,focusRipple:v=!1,LinkComponent:E="a",onBlur:h,onClick:R,onContextMenu:U,onDragLeave:F,onFocus:O,onFocusVisible:S,onKeyDown:d,onKeyUp:M,onMouseDown:x,onMouseLeave:L,onMouseUp:I,onTouchEnd:z,onTouchMove:y,onTouchStart:$,tabIndex:T=0,TouchRippleProps:k,touchRippleRef:D,type:N}=s,P=H(s,ht),A=l.useRef(null),C=l.useRef(null),ye=fe(C,D),{isFocusVisibleRef:le,onFocus:Ce,onBlur:Ee,ref:Te}=qe(),[_,W]=l.useState(!1);p&&_&&W(!1),l.useImperativeHandle(i,()=>({focusVisible:()=>{W(!0),A.current.focus()}}),[]);const[Q,Pe]=l.useState(!1);l.useEffect(()=>{Pe(!0)},[]);const Ve=Q&&!f&&!p;l.useEffect(()=>{_&&v&&!f&&Q&&C.current.pulsate()},[f,v,_,Q]);function V(a,ce,ze=m){return Y(pe=>(ce&&ce(pe),!ze&&C.current&&C.current[a](pe),!0))}const Be=V("start",x),$e=V("stop",U),ke=V("stop",F),De=V("stop",I),we=V("stop",a=>{_&&a.preventDefault(),L&&L(a)}),Le=V("start",$),Ne=V("stop",z),_e=V("stop",y),je=V("stop",a=>{Ee(a),le.current===!1&&W(!1),h&&h(a)},!1),Fe=Y(a=>{A.current||(A.current=a.currentTarget),Ce(a),le.current===!0&&(W(!0),S&&S(a)),O&&O(a)}),Z=()=>{const a=A.current;return u&&u!=="button"&&!(a.tagName==="A"&&a.href)},ee=l.useRef(!1),Se=Y(a=>{v&&!ee.current&&_&&C.current&&a.key===" "&&(ee.current=!0,C.current.stop(a,()=>{C.current.start(a)})),a.target===a.currentTarget&&Z()&&a.key===" "&&a.preventDefault(),d&&d(a),a.target===a.currentTarget&&Z()&&a.key==="Enter"&&!p&&(a.preventDefault(),R&&R(a))}),Ie=Y(a=>{v&&a.key===" "&&C.current&&_&&!a.defaultPrevented&&(ee.current=!1,C.current.stop(a,()=>{C.current.pulsate(a)})),M&&M(a),R&&a.target===a.currentTarget&&Z()&&a.key===" "&&!a.defaultPrevented&&R(a)});let X=u;X==="button"&&(P.href||P.to)&&(X=E);const K={};X==="button"?(K.type=N===void 0?"button":N,K.disabled=p):(!P.href&&!P.to&&(K.role="button"),p&&(K["aria-disabled"]=p));const Ue=fe(n,Te,A),ue=B({},s,{centerRipple:o,component:u,disabled:p,disableRipple:f,disableTouchRipple:m,focusRipple:v,tabIndex:T,focusVisible:_}),Oe=mt(ue);return w.jsxs(bt,B({as:X,className:g(Oe.root,c),ownerState:ue,onBlur:je,onClick:R,onContextMenu:$e,onFocus:Fe,onKeyDown:Se,onKeyUp:Ie,onMouseDown:Be,onMouseLeave:we,onMouseUp:De,onDragLeave:ke,onTouchEnd:Ne,onTouchMove:_e,onTouchStart:Le,ref:Ue,tabIndex:p?-1:T,type:N},K,P,{children:[r,Ve?w.jsx(pt,B({ref:ye,center:o},k)):null]}))});export{xt as B,Mt as P,ae as T,We as _,me as a,Y as u};
