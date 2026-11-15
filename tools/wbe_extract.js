const fs=require('fs');
let src=fs.readFileSync('tools/wbe_pre.js','utf8')+'\nmodule.exports={INDS,JOBS,LIB,PROFILES,PROF_FIELDS};';
fs.writeFileSync('/tmp/wbe_mod.js',src);
const W=require('/tmp/wbe_mod.js');
const out={inds:W.INDS,jobs:W.JOBS,tasks:{}};
const MULT={d:30.4,w:365/7/12,m:1,q:1/3,y:1/12};
for(const [jk] of W.JOBS){
  const rows=[];
  const walk=(t,path)=>{
    if(t.kids){ t.kids.forEach(k=>walk(k,path.concat([t.name]).map(x=>x))); return; }
    const qs=W.INDS.map(([ik])=>{
      const p=Object.assign({key:ik},W.PROFILES[ik]);
      // check only/not along path: need flags; we store on objects
      if(t._skip && t._skip(ik)) return null;
      const v=x=>typeof x==='function'?x(p):x;
      let q=v(t.q); if(!(q>0)) return null; q=Math.max(1,Math.round(q));
      const f=v(t.freq); return [q,+f.toFixed?+(+f).toFixed(2):f];
    });
    rows.push({p:path,n:t.name,m:t.min,u:t.unit,per:t.per,post:t.post?1:0,g:t.g||'',qs});
  };
  const mark=(t,parentSkip)=>{
    const own=ik=>(t.only&&!t.only.split(',').includes(ik))||(t.not&&t.not.split(',').includes(ik));
    const sk=ik=>(parentSkip&&parentSkip(ik))||own(ik);
    t._skip=sk; if(t.kids) t.kids.forEach(k=>mark(k,sk));
  };
  W.LIB[jk].forEach(t=>mark(t,null));
  W.LIB[jk].forEach(t=>walk(t,[]));
  out.tasks[jk]=rows;
  console.log(jk,rows.length);
}
fs.writeFileSync('tools/wbe_tasks.json',JSON.stringify(out));
console.log(fs.statSync('tools/wbe_tasks.json').size);
console.log(JSON.stringify(out.tasks.clean.slice(0,3)));
