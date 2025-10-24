const els={warfarinNo:document.getElementById('warfarinNo'),fetchBtn:document.getElementById('fetchBtn'),
printBtn:document.getElementById('printBtn'),sticker:document.getElementById('sticker'),
fullName:document.getElementById('fullName'),hn:document.getElementById('hn'),wfno:document.getElementById('wfno'),
indication:document.getElementById('indication'),inr:document.getElementById('inr'),extra:document.getElementById('extraArea'),
btnInr23:document.getElementById('btnInr23'),btnInr2535:document.getElementById('btnInr2535'),btnAll:document.getElementById('btnAll')};

function clearSticker(){
  els.fullName.textContent='—';
  els.hn.textContent='—';
  els.wfno.textContent='—';
  els.indication.textContent='—';
  els.inr.textContent='—';
  els.extra.textContent=''; // ล้างช่องเพิ่มข้อความทุกครั้ง
}

async function fetchByAppsScript(no){
  const url=new URL(ENDPOINT);url.searchParams.set('warfarin',String(no).trim());
  const res=await fetch(url.toString(),{cache:'no-store'});
  if(!res.ok)throw new Error('Apps Script HTTP '+res.status);
  const data=await res.json();
  if(!data||(!data.warfarinNo&&!data.fullName))throw new Error('Apps Script: invalid JSON');
  return data;
}
function fillSticker(d){
  els.fullName.textContent=d.fullName||'—';els.hn.textContent=d.hn||'—';
  els.wfno.textContent=d.warfarinNo||'—';els.indication.textContent=d.indication||'—';els.inr.textContent=d.inr||'—';
}
async function doFetch(){
  const no=els.warfarinNo.value.trim();
  if(!no){alert('กรุณาใส่ Warfarin No');return;}
  clearSticker(); // ล้างของเดิมก่อนทุกครั้ง
  try{const rec=await fetchByAppsScript(no);fillSticker(rec);}catch(e){alert('ดึงข้อมูลไม่สำเร็จ: '+e.message);}
}
els.fetchBtn.addEventListener('click',doFetch);
els.printBtn.addEventListener('click',()=>window.print());
els.warfarinNo.addEventListener('keydown',e=>{if(e.key==='Enter')doFetch();});
document.querySelectorAll('input[name="size"]').forEach(r=>{
 r.addEventListener('change',()=>{els.sticker.classList.remove('size-4_5','size-6_0');els.sticker.classList.add('size-'+r.value);});
});

// Quick select buttons (side panel)
els.btnInr23.addEventListener('click',()=>{els.inr.textContent='2-3';});
els.btnInr2535.addEventListener('click',()=>{els.inr.textContent='2.5-3.5';});
els.btnAll.addEventListener('click',()=>{
  const t=els.extra.textContent.trim();
  if(!t){ els.extra.textContent='ALL:'; }
  else { els.extra.textContent = t + ' ALL:'; }
  // place caret at end
  const sel=window.getSelection(); const range=document.createRange();
  range.selectNodeContents(els.extra); range.collapse(false);
  sel.removeAllRanges(); sel.addRange(range); els.extra.focus();
});

// Hide extra before print if only whitespace
window.addEventListener('beforeprint',()=>{const ex=els.extra;if(ex&&ex.textContent.trim()===''){ex.dataset.wasHidden='1';ex.style.display='none';}});
window.addEventListener('afterprint',()=>{const ex=els.extra;if(ex&&ex.dataset.wasHidden==='1'){ex.style.display='';delete ex.dataset.wasHidden;}});
