const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();
for(const n of [1,2,3,4]){await p.goto('file://'+process.cwd()+`/etapa${n}.html`);
await p.pdf({path:`etapa${n}.pdf`,format:'A4',printBackground:true,displayHeaderFooter:true,
headerTemplate:'<span></span>',
footerTemplate:`<div style="font-family:Arial,'Liberation Sans',sans-serif;font-size:9pt;width:100%;text-align:center;color:#000">Fracking Design · Comercialización I · Etapa ${n}</div>`,
margin:{top:'25mm',bottom:'25mm',left:'25mm',right:'25mm'}});}
await b.close()})();
