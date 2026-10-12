/* All chart marks are rendered by Vega or Vega-Lite for FIT3179 assessment. */
const C = {ink:'#24243b',brick:'#ad4a3d',orange:'#d7824b',gold:'#e2b04d',blue:'#45778d',plum:'#6b4c69',muted:'#696775',line:'#e2d8c8',cream:'#fff7e8'};
const names = {AUS:'Australia',NSW:'New South Wales',VIC:'Victoria',QLD:'Queensland',SA:'South Australia',WA:'Western Australia',TAS:'Tasmania',NT:'Northern Territory',ACT:'Australian Capital Territory'};
const stateOrder = ['NSW','VIC','QLD','SA','WA','TAS','NT','ACT'];
let D, features, selected = 'AUS', chartViews = {};

function width(id, reserve=48){return Math.max(280, Math.floor(document.getElementById(id).clientWidth-reserve));}
function base(id, height=260, reserve=48){return {$schema:'https://vega.github.io/schema/vega-lite/v5.json',width:width(id,reserve),height,background:null,config:{view:{stroke:null},axis:{labelFont:'Arial',titleFont:'Arial',labelColor:C.muted,titleColor:C.muted,domainColor:C.line,tickColor:C.line,gridColor:'#eee7dc',labelFontSize:12,titleFontSize:12},legend:{labelFont:'Arial',titleFont:'Arial',labelColor:C.muted,titleColor:C.muted},text:{font:'Arial'},style:{'guide-label':{font:'Arial'}}}};}
async function embed(id,spec){try{const result=await vegaEmbed('#'+id,spec,{actions:false,renderer:'svg',tooltip:{theme:'light'}});chartViews[id]=result.view;return result.view;}catch(error){console.error(id,error);document.getElementById(id).innerHTML='<p class="chart-error">Chart could not load. '+String(error.message||error)+'</p>';return null;}}
function commonTooltip(fields){return fields.map(([field,title,format])=>({field,type:'quantitative',title,format}));}

async function routines(){
  const spec={...base('chart-routines',260),data:{values:D.routines},mark:{type:'bar',cornerRadiusEnd:3,color:C.brick},encoding:{y:{field:'activity',type:'nominal',sort:D.routines.map(d=>d.activity),axis:{title:null,labelLimit:120,labelPadding:8}},x:{field:'minutes',type:'quantitative',scale:{domain:[0,700]},axis:{title:'Minutes per day',tickCount:5}},tooltip:[{field:'activity',title:'Activity'},{field:'minutes',title:'Minutes per day'}]}};
  spec.layer=[{mark:{type:'bar',cornerRadiusEnd:3,color:C.brick},encoding:spec.encoding},{mark:{type:'text',align:'left',dx:7,fontWeight:'bold',color:C.ink},encoding:{...spec.encoding,text:{field:'minutes',type:'quantitative',format:'.0f'},tooltip:null}}];delete spec.mark;delete spec.encoding;
  await embed('chart-routines',spec);
  document.getElementById('work-minutes').textContent=D.routines.find(d=>d.activity==='Work & study').minutes;
}
async function gender(){
 const p=base('chart-gender',250,65), order=['Housework','Child care','Free time'];
 const lines=order.map(activity=>{const a=D.time_gender.filter(d=>d.activity===activity);return {activity,lo:Math.min(...a.map(x=>x.minutes)),hi:Math.max(...a.map(x=>x.minutes))};});
 await embed('chart-gender',{...p,layer:[{data:{values:lines},mark:{type:'rule',strokeWidth:4,color:'#d8c6bc'},encoding:{y:{field:'activity',type:'nominal',sort:order,axis:{title:null,labelPadding:8}},x:{field:'lo',type:'quantitative',scale:{domain:[0,340]},axis:{title:'Minutes per day'}},x2:{field:'hi'}}},{data:{values:D.time_gender},mark:{type:'point',filled:true,size:140},encoding:{y:{field:'activity',type:'nominal',sort:order},x:{field:'minutes',type:'quantitative',scale:{domain:[0,340]}},color:{field:'sex',type:'nominal',scale:{domain:['Men','Women'],range:[C.blue,C.brick]},legend:{orient:'bottom',title:null}},tooltip:[{field:'activity'},{field:'sex'},{field:'minutes',title:'Minutes per day'}]}}]});
}
function mapFeatures(){const sport=Object.fromEntries(D.sport.map(d=>[d.state,d]));return features.map(f=>({...f,properties:{...f.properties,weekly:sport[f.properties.state]?.weekly}}));}
async function sportMap(){
 const id='chart-sport-map', p=base(id,345,8), all=mapFeatures();
 const spec={...p,data:{values:all},projection:{type:'conicEqualArea',center:[134,-28],parallels:[-18,-36]},mark:{type:'geoshape',strokeWidth:1.2},encoding:{color:{field:'properties.weekly',type:'quantitative',title:'Weekly participation (%)',scale:{domain:[65,80],range:['#f7dbb8',C.brick]},legend:{orient:'bottom',gradientLength:170}},stroke:{condition:{test:`datum.properties.state === '${selected}'`,value:C.ink},value:'#fffdf8'},tooltip:[{field:'properties.name',type:'nominal',title:'Place'},{field:'properties.weekly',type:'quantitative',title:'Weekly (%)',format:'.1f'}]}};
 const view=await embed(id,spec);
 if(view)view.addEventListener('click',(_event,item)=>{const state=item?.datum?.properties?.state;if(state){document.getElementById('state-select').value=state;changeState(state);}});
 const act=all.find(f=>f.properties.state==='ACT');
 await embed('chart-act-inset',{$schema:'https://vega.github.io/schema/vega-lite/v5.json',width:75,height:58,background:null,data:{values:[act]},projection:{type:'conicEqualArea',center:[149,-35.5]},mark:{type:'geoshape',fill:C.brick,stroke:C.ink,strokeWidth:1},config:{view:{stroke:null}}});
 document.getElementById('act-rate').textContent=D.sport.find(d=>d.state==='ACT').weekly.toFixed(1)+'%';
}
async function heatmap(){
 const p=base('chart-heatmap',280,60);
 await embed('chart-heatmap',{...p,data:{values:D.activities},mark:{type:'rect',stroke:'#fffdf8',strokeWidth:3},encoding:{x:{field:'activity',type:'nominal',sort:['Walking','Swimming','Cycling'],axis:{title:null,labelAngle:0}},y:{field:'state',type:'nominal',sort:stateOrder,axis:{title:null}},color:{field:'rate',type:'quantitative',scale:{domain:[0,60],range:['#f8e5ca',C.brick]},legend:{orient:'bottom',title:'Participation (%)'}},opacity:{condition:{test:`datum.state === '${selected}' || '${selected}' === 'AUS'`,value:1},value:.48},tooltip:[{field:'state',title:'Place'},{field:'activity'},{field:'rate',title:'Participation (%)',format:'.1f'}]}});
}
async function frequency(){
 const vals=D.sport.filter(d=>d.state!=='AUS'), benchmark=D.sport.find(d=>d.state==='AUS').three, p=base('chart-frequency',290,75);
 await embed('chart-frequency',{...p,layer:[{data:{values:vals},mark:{type:'bar',height:22,cornerRadiusEnd:2},encoding:{y:{field:'state',type:'nominal',sort:stateOrder,axis:{title:null,labelPadding:9}},x:{field:'three',type:'quantitative',scale:{domain:[0,65]},axis:{title:'Participation three or more times per week (%)',tickCount:7}},color:{condition:{test:`datum.state === '${selected}'`,value:C.brick},value:C.orange},tooltip:[{field:'state',title:'Place'},{field:'three',title:'Three or more times weekly (%)',format:'.1f'}]}},{data:{values:vals.map(d=>({...d,benchmark}))},mark:{type:'tick',thickness:3,size:26,color:C.ink},encoding:{y:{field:'state',type:'nominal',sort:stateOrder},x:{field:'benchmark',type:'quantitative',scale:{domain:[0,65]}},tooltip:[{field:'benchmark',title:'Australia benchmark (%)',format:'.1f'}]}},{data:{values:vals},mark:{type:'text',dx:18,align:'left',fontSize:11,color:C.ink},encoding:{y:{field:'state',type:'nominal',sort:stateOrder},x:{field:'three',type:'quantitative',scale:{domain:[0,65]}},text:{field:'three',type:'quantitative',format:'.1f'}}}]});
}
async function cultureMap(){
 const p=base('chart-culture-map',315,8), data=D.community.filter(d=>d.state!=='AUS');
 await embed('chart-culture-map',{...p,projection:{type:'conicEqualArea',center:[134,-28],parallels:[-18,-36]},layer:[{data:{values:mapFeatures()},mark:{type:'geoshape',fill:'#ebe2d7',stroke:'#fffdf8',strokeWidth:1}},{data:{values:data},mark:{type:'circle',fill:C.brick,stroke:C.cream,strokeWidth:1.3,opacity:.78},encoding:{longitude:{field:'longitude',type:'quantitative'},latitude:{field:'latitude',type:'quantitative'},size:{field:'cultural_thousands',type:'quantitative',scale:{domain:[0,5400],range:[30,3800]},legend:{orient:'bottom',title:'Attendees (thousands)'}},tooltip:[{field:'state',title:'Place'},{field:'cultural_thousands',title:'Attendees (thousands)',format:',.1f'},{field:'cultural_rate',title:'Participation (%)',format:'.1f'}]}}]});
}
async function cartogram(){
 const community=Object.fromEntries(D.community.map(d=>[d.state,d]));
 const layout={WA:[15,124],NT:[161,38],SA:[177,206],QLD:[297,57],NSW:[294,178],VIC:[310,306],TAS:[345,426],ACT:[425,276]};
 const tiles=stateOrder.map(state=>{const [x,y]=layout[state],size=Math.sqrt(community[state].volunteer_thousands)*3;return {state,x,x2:x+size,y,y2:y+size,cx:x+size/2,cy:y+size/2,count:community[state].volunteer_thousands};});
 const p=base('chart-cartogram',475,12);
 await embed('chart-cartogram',{...p,layer:[{data:{values:tiles},mark:{type:'rect',stroke:C.cream,strokeWidth:2},encoding:{x:{field:'x',type:'quantitative',scale:{domain:[0,520]},axis:null},x2:{field:'x2'},y:{field:'y',type:'quantitative',scale:{domain:[480,0]},axis:null},y2:{field:'y2'},color:{condition:{test:`datum.state === '${selected}'`,value:C.brick},value:C.blue},tooltip:[{field:'state',title:'Place'},{field:'count',title:'Formal volunteers (thousands)',format:',.1f'}]}},{data:{values:tiles},mark:{type:'text',fontWeight:'bold',color:'#fffdf8',fontSize:12},encoding:{x:{field:'cx',type:'quantitative',scale:{domain:[0,520]},axis:null},y:{field:'cy',type:'quantitative',scale:{domain:[480,0]},axis:null},text:{field:'state'}}}]});
}
async function hours(){
 const id='chart-hours', w=width(id,14), h=255, fills=[C.brick,C.orange,C.blue];
 const values=[{id:'root',parent:null,thousands:0},...D.volunteer_hours.map((d,i)=>({id:d.band,parent:'root',thousands:d.thousands,fill:fills[i],label:d.band+'\n'+(d.thousands/1000).toFixed(2)+'m'}))];
 const spec={$schema:'https://vega.github.io/schema/vega/v5.json',width:w,height:h,padding:0,background:null,data:[{name:'tree',values,transform:[{type:'stratify',key:'id',parentKey:'parent'},{type:'treemap',field:'thousands',method:'squarify',size:[w,h],padding:4}]},{name:'leaves',source:'tree',transform:[{type:'filter',expr:'datum.depth > 0'}]}],marks:[{type:'rect',from:{data:'leaves'},encode:{enter:{x:{field:'x0'},y:{field:'y0'},x2:{field:'x1'},y2:{field:'y1'},fill:{field:'fill'},tooltip:{signal:"datum.id + ': ' + format(datum.thousands, ',.1f') + ' thousand people'"}}}},{type:'text',from:{data:'leaves'},encode:{enter:{x:{signal:'(datum.x0+datum.x1)/2'},y:{signal:'(datum.y0+datum.y1)/2'},align:{value:'center'},baseline:{value:'middle'},fill:{value:'#fffdf8'},font:{value:'Arial'},fontSize:{value:16},fontWeight:{value:'bold'},text:{field:'id'}}}}]};
 await embed(id,spec);
}
async function trends(){
 const p=base('chart-trends',285,75), color={domain:['Formal volunteering','Social groups','Support groups'],range:[C.brick,C.blue,C.orange]};
 await embed('chart-trends',{...p,layer:[{data:{values:D.trends},mark:{type:'line',strokeWidth:3,point:{filled:true,size:80}},encoding:{x:{field:'year',type:'quantitative',scale:{domain:[2018,2026]},axis:{values:[2019,2025],format:'d',title:null,grid:false}},y:{field:'rate',type:'quantitative',scale:{domain:[0,60]},axis:{title:'Share of adults (%)',tickCount:4}},color:{field:'series',type:'nominal',scale:color,legend:{orient:'bottom',title:null}},tooltip:[{field:'series'},{field:'year',format:'d'},{field:'rate',title:'Share (%)',format:'.1f'}]}},{data:{values:D.trends.filter(d=>d.year===2019)},mark:{type:'text',align:'right',dx:-8,fontSize:11,fontWeight:'bold'},encoding:{x:{field:'year',type:'quantitative'},y:{field:'rate',type:'quantitative'},text:{field:'rate',format:'.1f'},color:{field:'series',type:'nominal',scale:color,legend:null}}},{data:{values:D.trends.filter(d=>d.year===2025)},mark:{type:'text',align:'left',dx:8,fontSize:11,fontWeight:'bold'},encoding:{x:{field:'year',type:'quantitative'},y:{field:'rate',type:'quantitative'},text:{field:'rate',format:'.1f'},color:{field:'series',type:'nominal',scale:color,legend:null}}}]});
}
async function waffle(){
 const row=D.community.find(d=>d.state===selected), value=row.lonely, cells=Array.from({length:100},(_,i)=>({col:i%20,row:Math.floor(i/20),filled:i<Math.round(value)}));
 document.getElementById('lonely-value').textContent=value.toFixed(1)+'%';document.getElementById('lonely-place').textContent=names[selected];
 await embed('chart-waffle',{...base('chart-waffle',180,20),data:{values:cells},mark:{type:'rect',cornerRadius:2,stroke:'#fffdf8',strokeWidth:1.5},encoding:{x:{field:'col',type:'ordinal',axis:null},y:{field:'row',type:'ordinal',axis:null},color:{field:'filled',type:'nominal',scale:{domain:[true,false],range:[C.brick,'#e9d9ca']},legend:null},tooltip:[{value:`${value.toFixed(1)}% in ${names[selected]}`}]}});
}
async function trust(){
 const vals=[],order=['People','Healthcare','Police','Justice'];
 for(const question of order){const rs=D.trust.filter(d=>d.state===selected&&d.question===question), by=Object.fromEntries(rs.map(r=>[r.answer,r.rate]));let x=-(by.Disagree+by.Neutral/2);for(const answer of ['Disagree','Neutral','Agree']){vals.push({question,answer,rate:by[answer],start:x,end:x+by[answer]});x+=by[answer];}}
 document.getElementById('trust-place').textContent=names[selected];
 await embed('chart-trust',{...base('chart-trust',255,70),data:{values:vals},mark:{type:'bar',height:26},encoding:{y:{field:'question',type:'nominal',sort:order,axis:{title:null,labelPadding:8}},x:{field:'start',type:'quantitative',scale:{domain:[-65,85]},axis:{title:'Share of adults (%)',labelExpr:'abs(datum.value)'}},x2:{field:'end'},color:{field:'answer',type:'nominal',scale:{domain:['Disagree','Neutral','Agree'],range:[C.brick,'#d9cabc',C.blue]},legend:null},tooltip:[{field:'question',title:'Trust in'},{field:'answer'},{field:'rate',title:'Share (%)',format:'.1f'}]}});
}
async function satisfaction(){
 const p=base('chart-satisfaction',315,85),colors={domain:['15-24','35-44','65+'],range:[C.brick,C.orange,C.blue]};
 await embed('chart-satisfaction',{...p,data:{values:D.satisfaction},mark:{type:'line',strokeWidth:3,point:{filled:true,size:75}},encoding:{x:{field:'year',type:'quantitative',scale:{domain:[2013,2026]},axis:{title:'Survey year',values:[2014,2019,2020,2025],format:'d'}},y:{field:'score',type:'quantitative',scale:{domain:[0,10]},axis:{title:'Mean life satisfaction (0–10)',values:[0,2,4,6,8,10]}},color:{field:'age',type:'nominal',scale:colors,legend:{orient:'bottom',title:'Age group'}},tooltip:[{field:'age',title:'Age group'},{field:'year',format:'d'},{field:'score',title:'Mean score',format:'.1f'}]}});
}
async function renderFixed(){await Promise.all([routines(),gender(),cultureMap(),hours(),trends(),satisfaction()]);}
async function renderDynamic(){await Promise.all([sportMap(),heatmap(),frequency(),cartogram(),waffle(),trust()]);}
async function changeState(value){selected=value;const sport=D.sport.find(d=>d.state===value);document.getElementById('state-summary').textContent=value==='AUS'?`National weekly activity: ${sport.weekly.toFixed(1)}%`:`${names[value]}: ${sport.weekly.toFixed(1)}% active weekly`;await renderDynamic();}
async function start(){
 try{const [data,map]=await Promise.all([fetch('data/charts.json').then(r=>{if(!r.ok)throw new Error('Chart data unavailable');return r.json()}),fetch('data/aus-states.geojson').then(r=>{if(!r.ok)throw new Error('Map data unavailable');return r.json()})]);D=data;features=map.features;document.getElementById('state-select').addEventListener('change',e=>changeState(e.target.value));await Promise.all([renderFixed(),changeState('AUS')]);let lastWidth=window.innerWidth,resizeTimer;window.addEventListener('resize',()=>{if(Math.abs(window.innerWidth-lastWidth)<20)return;clearTimeout(resizeTimer);resizeTimer=setTimeout(async()=>{lastWidth=window.innerWidth;await Promise.all([renderFixed(),renderDynamic()]);},200);});}
 catch(error){console.error(error);document.querySelectorAll('.chart').forEach(el=>el.innerHTML='<p class="chart-error">Data could not load. Serve the dist folder over HTTP to preview this page.</p>');}
}
window.addEventListener('DOMContentLoaded',start);
