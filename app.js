const els={
  accessCode:document.getElementById('accessCode'),
  rememberCode:document.getElementById('rememberCode'),
  gateMsg:document.getElementById('gateMsg'),
  warfarinNo:document.getElementById('warfarinNo'),fetchBtn:document.getElementById('fetchBtn'),
  printBtn:document.getElementById('printBtn'),sticker:document.getElementById('sticker'),
  fullName:document.getElementById('fullName'),hn:document.getElementById('hn'),wfno:document.getElementById('wfno'),
  indication:document.getElementById('indication'),inr:document.getElementById('inr'),extra:document.getElementById('extraArea'),
  btnInr23:document.getElementById('btnInr23'),btnInr2535:document.getElementById('btnInr2535'),btnAll:document.getElementById('btnAll')
};

function setFetchEnabled(ok){
  els.fetchBtn.disabled = !ok;
  els.gateMsg.textContent = ok ? 'พร้อมดึงข้อมูล' : 'ใส่รหัสให้ถูกต้องก่อน จึงจะดึงข้อมูลได้';
}
function checkCode(){
  const ok = (els.accessCode.value.trim() === ACCESS_CODE);
  setFetchEnabled(ok);
  if(ok && els.rememberCode.checked){ sessionStorage.setItem('access_ok','1'); }
  else if(!ok){ sessionStorage.removeItem('access_ok'); }
  return ok;
}
(function initGate(){
  if(sessionStorage.getItem('access_ok')==='1'){ setFetchEnabled(true); }
  else { setFetchEnabled(false); }
  els.accessCode.addEventListener('input', checkCode);
  els.rememberCode.addEventListener('change', checkCode);
})();

function clearSticker(){
  els.fullName.textContent='—';
  els.hn.textContent='—';
  els.wfno.textContent='—';
  els.indication.textContent='—';
  els.inr.textContent='—';
  els.extra.textContent='';
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
  els.fullName.textContent=d.fullName||'—';
  els.hn.textContent=d.hn||'—';
  els.wfno.textContent=d.warfarinNo||'—';
  els.indication.textContent=d.indication||'—';
  els.inr.textContent=d.inr||'—';
}
async function doFetch(){
  if(!checkCode()){ alert('รหัสไม่ถูกต้อง'); return; }
  const no=els.warfarinNo.value.trim();
  if(!no){ alert('กรุณาใส่ Warfarin No'); return; }
  clearSticker();
  try{ const rec=await fetchByAppsScript(no); fillSticker(rec); }
  catch(e){ alert('ดึงข้อมูลไม่สำเร็จ: '+e.message); }
}
els.fetchBtn.addEventListener('click',doFetch);
els.warfarinNo.addEventListener('keydown',e=>{if(e.key==='Enter')doFetch();});
els.printBtn.addEventListener('click',()=>window.print());

document.querySelectorAll('input[name="size"]').forEach(r=>{
  r.addEventListener('change',()=>{
    els.sticker.classList.remove('size-4_5','size-6_0');
    els.sticker.classList.add('size-'+r.value);
  });
});

els.btnInr23.addEventListener('click',()=>{ els.inr.textContent='2-3'; });
els.btnInr2535.addEventListener('click',()=>{ els.inr.textContent='2.5-3.5'; });
els.btnAll.addEventListener('click',()=>{
  const t=els.extra.textContent.trim();
  els.extra.textContent = t ? (t + ' ALL:') : 'ALL:';
  const sel=window.getSelection(); const range=document.createRange();
  range.selectNodeContents(els.extra); range.collapse(false);
  sel.removeAllRanges(); sel.addRange(range); els.extra.focus();
});

window.addEventListener('beforeprint',()=>{
  const ex=els.extra;
  if(ex && ex.textContent.trim()===''){ ex.dataset.wasHidden='1'; ex.style.display='none'; }
});
window.addEventListener('afterprint',()=>{
  const ex=els.extra;
  if(ex && ex.dataset.wasHidden==='1'){ ex.style.display=''; delete ex.dataset.wasHidden; }
});
