export const skyFunctions = `
vec3 sunset(vec3 d) {
 float h=max(d.y,0.);
 vec3 horizon=vec3(1.,.73,.65);
 vec3 mid=vec3(.83,.47,.61);
 vec3 top=vec3(.34,.36,.56);
 vec3 col=mix(horizon,mid,smoothstep(0.,.32,h));
 col=mix(col,top,smoothstep(.25,.95,h));
 vec3 sunDir=normalize(vec3(-.24,.09,-1.));
 float s=max(dot(d,sunDir),0.);
 col+=vec3(1.,.55,.28)*pow(s,22.)*.28;
 col+=vec3(1.,.83,.58)*smoothstep(.9992,.99965,s)*1.1;
 float cloud=sin(d.x*7.+d.z*3.+sin(d.y*26.)*.6)*sin(d.x*21.-d.y*55.);
 float wisps=smoothstep(.37,.95,cloud)*smoothstep(.06,.2,h)*(1.-smoothstep(.2,.47,h));
 col=mix(col,vec3(1.,.75,.77),wisps*.16);
 return col;
}
`;
export const skyVertex = `varying vec3 vDirection;void main(){vDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
export const skyFragment = `varying vec3 vDirection;${skyFunctions}void main(){gl_FragColor=vec4(sunset(normalize(vDirection)),1.);}`;
export const waveFunctions = `
float wave(vec2 p,float t) {
 return sin(p.x*.75+p.y*.48+t*.62)*.085+
 sin(p.x*1.62-p.y*.91+t*.8)*.038+
 sin(p.x*3.7+p.y*2.6-t*.9)*.012+
 sin(p.x*8.1-p.y*4.3+t*.74)*.004;
}
`;
export const waterVertex = `uniform float uTime;varying vec3 vWorld;${waveFunctions}
void main(){vec4 world=modelMatrix*vec4(position,1.);world.y+=wave(world.xz,uTime);vWorld=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}`;
export const waterFragment = `
uniform float uTime;uniform float uRipple;varying vec3 vWorld;
${skyFunctions}${waveFunctions}
void main(){
 vec2 p=vWorld.xz;
 float e=.035;
 float h=wave(p,uTime);
 vec3 n=normalize(vec3((h-wave(p+vec2(e,0.),uTime))/e,1.,(h-wave(p+vec2(0.,e),uTime))/e));
 float radius=length(p-vec2(0.,2.));
 float ring=sin(radius*11.-uRipple*5.)*exp(-pow(radius-uRipple*1.4,2.)*2.)*step(.01,uRipple)*exp(-uRipple*.24);
 n=normalize(n+vec3(ring*.13,0.,ring*.13));
 vec3 viewDir=normalize(cameraPosition-vWorld);
 vec3 reflection=reflect(-viewDir,n);
 float fresnel=.18+.82*pow(1.-max(dot(viewDir,n),0.),4.);
 vec3 depth=vec3(.055,.25,.29);
 float caustic=pow(max(0.,sin(p.x*4.+sin(p.y*3.+uTime)*.8)*sin(p.y*4.-uTime*.3)),7.);
 vec3 refraction=depth+vec3(.08,.16,.12)*caustic;
 vec3 col=mix(refraction,sunset(reflection),fresnel*.88);
 vec3 sunDir=normalize(vec3(-.24,.09,-1.));
 float sun=pow(max(dot(reflect(-sunDir,n),viewDir),0.),180.);
 col+=vec3(1.,.7,.4)*sun*1.8;
 float glimmer=pow(max(dot(normalize(sunDir+viewDir),n),0.),420.);
 col+=vec3(1.,.84,.65)*glimmer*.8;
 float fog=1.-exp(-length(cameraPosition-vWorld)*.012);
 col=mix(col,vec3(.94,.65,.66),fog*.72);
 gl_FragColor=vec4(col,1.);
}
`;
