const { chromium } = require('playwright');
(async()=>{
 const b = await chromium.launch(); const p = await b.newPage();
 await p.goto('file://'+process.cwd()+'/carpeta.html');
 // detectar desbordes
 const over = await p.evaluate(()=>[...document.querySelectorAll('.pg')].map((e,i)=>{
   const lim=e.getBoundingClientRect().bottom - 38; // pie
   let max=0; e.querySelectorAll('.card,.dark,.note,table,.flow,li').forEach(x=>{max=Math.max(max,x.getBoundingClientRect().bottom)});
   return [i+1, Math.round(lim-max)];}));
 console.log(JSON.stringify(over));
 await p.pdf({path:'Entrega-100-PI-Fracking-Design.pdf',width:'297mm',height:'210mm',printBackground:true});
 await b.close();
})();
