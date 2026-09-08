/* NSG WELLFARE - DEMO VERSION */

const UPI_ID="yadav-rishab@fam";
const SUPPORT="https://t.me/Hammerff7gcz";

const products=[
 {id:1,name:"Product 1",price:500,daily:10},
 {id:2,name:"Product 2",price:1500,daily:30},
 {id:3,name:"Product 3",price:3600,daily:72}
];

let data=JSON.parse(localStorage.getItem(NSG.Data")||"null")||{
 balance:500000.00,
 attendance:{},
 purchased:[],
 rewards:[],
 deposits:[],
 withdrawals:[],
 transactions:[]
};

function save(){
 localStorage.setItem(NSG.Data",JSON.stringify(data));
}

function money(n){
 return Number(n||0).toLocaleString("en-IN",{
  minimumFractionDigits:2,
  maximumFractionDigits:2
 });
}

function openPage(id){
 document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
 const page=document.getElementById(id);
 if(page)page.classList.add("active");
 window.scrollTo({top:0,behavior:"smooth"});
 updateUI();
}

function updateBalance(){
 const ids=["balance","homeBalance","withdrawBalance"];

 ids.forEach(id=>{
  const el=document.getElementById(id);
  if(el)el.textContent=money(data.balance);
 });
}

function createUser(){
 let id=localStorage.getItem("nsgUserId");

 if(!id){
  const n=Number(localStorage.getItem("nsgCounter")||0)+1;
  localStorage.setItem("nsgCounter",n);
  id="You-7519"+String(n).padStart(3,"0");
  localStorage.setItem("nsgUserId",id);
 }

 const p=document.getElementById("profileUserId");
 if(p)p.textContent=id;
}

function productHTML(p){
 const bought=data.purchased.includes(p.id);

 return `
 <div class="product">
   <div class="product-head">
     <div>
       <h3>${p.name}</h3>
       <p>Demo product</p>
     </div>
     <div class="product-price">₹${p.price}</div>
   </div>

   <ul>
     <li>Daily demo reward: ₹${p.daily}</li>
     <li>Demo/Test mode</li>
     <li>No real financial transaction</li>
   </ul>

   ${
    bought
    ? `<button class="secondary-btn" disabled>✓ Purchased</button>`
    : `<button class="primary-btn" onclick="buyProduct(${p.id})">
        Purchase Demo
       </button>`
   }
 </div>`;
}

function loadProducts(){
 const html=products.map(productHTML).join("");

 const home=document.getElementById("homeProducts");
 const list=document.getElementById("productsList");

 if(home)home.innerHTML=html;
 if(list)list.innerHTML=html;
}

function buyProduct(id){
 const p=products.find(x=>x.id===id);
 if(!p)return;

 if(data.purchased.includes(id)){
  alert("Already purchased.");
  return;
 }

 if(data.balance<p.price){
  alert("Insufficient demo balance.");
  return;
 }

 data.balance-=p.price;
 data.purchased.push(id);

 data.transactions.unshift({
  type:"Product",
  amount:p.price,
  status:"COMPLETED",
  date:new Date().toLocaleString()
 });

 save();
 updateUI();
 alert("product purchased.");
}

let calDate=new Date();

function changeMonth(step){
 calDate.setMonth(calDate.getMonth()+step);
 renderCalendar();
}

function renderCalendar(){
 const title=document.getElementById("monthTitle");
 const calendar=document.getElementById("calendar");
 if(!title||!calendar)return;

 const y=calDate.getFullYear();
 const m=calDate.getMonth();

 title.textContent=new Intl.DateTimeFormat("en-IN",{
  month:"long",
  year:"numeric"
 }).format(calDate);

 calendar.innerHTML="";

 const first=new Date(y,m,1).getDay();
 const total=new Date(y,m+1,0).getDate();

 for(let i=0;i<first;i++){
  const d=document.createElement("div");
  d.className="day empty";
  calendar.appendChild(d);
 }

 for(let day=1;day<=total;day++){
  const el=document.createElement("div");
  el.className="day";

  const key=
   y+"-"+String(m+1).padStart(2,"0")+"-"+String(day).padStart(2,"0");

  el.textContent=day;

  if(data.attendance[key])el.classList.add("attended");

  const now=new Date();

  if(
   day===now.getDate() &&
   m===now.getMonth() &&
   y===now.getFullYear()
  ){
   el.classList.add("today");
  }

  el.onclick=()=>{
   if(data.attendance[key]){
    alert("Attendance already marked.");
    return;
   }

   data.attendance[key]=true;
   save();
   renderCalendar();
   updateAttendanceTotal();
  };

  calendar.appendChild(el);
 }

 updateAttendanceTotal();
}

function updateAttendanceTotal(){
 const el=document.getElementById("attendanceTotal");
 if(el)el.textContent=Object.keys(data.attendance).length;
}

function renderRewards(){
 const box=document.getElementById("rewardsList");
 if(!box)return;

 if(!data.purchased.length){
  box.innerHTML="<div class='history-item'>No demo rewards available yet.</div>";
  return;
 }

 box.innerHTML=data.purchased.map(id=>{
  const p=products.find(x=>x.id===id);
  return `
   <div class="history-item">
    <b>🎁 ${p.name}</b>
    <small> daily reward: ₹${p.daily}</small>
   </div>`;
 }).join("");
}


/* =========================
   DEPOSIT
========================= */

function showDeposit(){
 openPage("deposit");
}

function copyUPI(){
 if(navigator.clipboard){
  navigator.clipboard.writeText(UPI_ID)
   .then(()=>alert("UPI ID copied: "+UPI_ID))
   .catch(()=>fallbackCopy(UPI_ID));
 }else{
  fallbackCopy(UPI_ID);
 }
}

function fallbackCopy(text){
 const input=document.createElement("input");
 input.value=text;
 document.body.appendChild(input);
 input.select();
 document.execCommand("copy");
 input.remove();
 alert("UPI ID copied: "+text);
}

const screenshotInput=document.getElementById("paymentScreenshot");

if(screenshotInput){
 screenshotInput.addEventListener("change",function(){
  const file=this.files[0];
  const box=document.getElementById("paymentPreview");

  if(!file){
   box.innerHTML="";
   return;
  }

  if(file.size>3*1024*1024){
   alert("Screenshot must be 3 MB or smaller.");
   this.value="";
   box.innerHTML="";
   return;
  }

  const reader=new FileReader();

  reader.onload=e=>{
   box.innerHTML=
    `<img src="${e.target.result}" alt="Payment screenshot preview">`;
  };

  reader.readAsDataURL(file);
 });
}

function submitDeposit(){

 const amount=Number(
  document.getElementById("depositAmount")?.value||0
 );

 const utr=
  document.getElementById("utr")?.value.trim()||"";

 const file=
  document.getElementById("paymentScreenshot")?.files?.[0];

 const msg=document.getElementById("depositStatus");

 if(amount<500){
  msg.textContent="Minimum deposit is ₹500.";
  return;
 }

 if(amount>20000){
  msg.textContent="Maximum deposit is ₹20,000.";
  return;
 }

 if(!utr){
  msg.textContent="Please enter UTR / Transaction ID.";
  return;
 }

 if(!file){
  msg.textContent="Please select payment screenshot.";
  return;
 }

 const request={
  id:"DEP-"+Date.now(),
  amount,
  utr,
  status:"Pending Verification",
  date:new Date().toLocaleString()
 };

 data.deposits.unshift(request);

 data.transactions.unshift({
  type:"Deposit",
  amount,
  status:"Pending Verification",
  date:request.date
 });

 save();

 document.getElementById("depositAmount").value="";
 document.getElementById("utr").value="";
 document.getElementById("paymentScreenshot").value="";
 document.getElementById("paymentPreview").innerHTML="";

 msg.textContent=
  "Demo deposit request recorded locally. No payment was processed.";

 updateUI();
}


/* =========================
   WITHDRAWAL
========================= */

function showWithdrawal(){
 openPage("withdraw");
}

function submitWithdrawal(){

 const amount=Number(
  document.getElementById("withdrawAmount")?.value||0
 );

 const name=
  document.getElementById("bankName")?.value.trim()||"";

 const account=
  document.getElementById("accountNumber")?.value.trim()||"";

 const confirm=
  document.getElementById("confirmAccount")?.value.trim()||"";

 const bank=
  document.getElementById("bank")?.value.trim()||"";

 const ifsc=
  document.getElementById("ifsc")?.value.trim().toUpperCase()||"";

 const msg=document.getElementById("withdrawMessage");

 if(amount<300){
  msg.textContent="Minimum withdrawal is ₹300.";
  return;
 }

 if(amount>10000){
  msg.textContent="Maximum withdrawal is ₹10,000.";
  return;
 }

 if(amount>data.balance){
  msg.textContent="Insufficient demo balance.";
  return;
 }

 if(!name||!account||!confirm||!bank||!ifsc){
  msg.textContent="Please fill all bank details.";
  return;
 }

 if(account!==confirm){
  msg.textContent="Account numbers do not match.";
  return;
 }

 if(!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)){
  msg.textContent="Invalid IFSC code.";
  return;
 }

 const now=new Date();

 const indiaTime=new Intl.DateTimeFormat("en-IN",{
  timeZone:"Asia/Kolkata",
  hour:"2-digit",
  minute:"2-digit",
  hour12:false
 }).format(now);

 const parts=indiaTime.split(":");
 const mins=Number(parts[0])*60+Number(parts[1]);

 if(mins<630||mins>1050){
  msg.textContent="Withdrawal time is 10:30 AM - 5:30 PM India time.";
  return;
 }

 const today=new Intl.DateTimeFormat("en-CA",{
  timeZone:"Asia/Kolkata"
 }).format(now);

 const count=data.withdrawals.filter(x=>x.dateKey===today).length;

 if(count>=3){
  msg.textContent="Daily withdrawal limit of 3 reached.";
  return;
 }

 const request={
  id:"WDR-"+Date.now(),
  amount,
  date:new Date().toLocaleString(),
  dateKey:today,
  status:"Pending",
  holder:name,
  account:account,
  bank:bank,
  ifsc:ifsc
 };

 data.withdrawals.unshift(request);

 data.transactions.unshift({
  type:"Withdrawal",
  amount,
  status:"Pending",
  date:request.date
 });

 data.balance-=amount;

 save();

 document.getElementById("withdrawAmount").value="";

 msg.textContent=
  "withdrawal request recorded local storage.";

 updateUI();
}


/* =========================
   HISTORY
========================= */

function renderHistories(){

 const wd=document.getElementById("withdrawHistoryList");
 const dp=document.getElementById("depositHistoryList");
 const tr=document.getElementById("transactionList");

 if(wd){
  wd.innerHTML=data.withdrawals.length
   ?data.withdrawals.map(x=>`
    <div class="history-item">
     <b>Withdrawal ₹${money(x.amount)}</b>
     <small>${x.date}</small>
     <p>Status: ${x.status}</p>
    </div>
   `).join("")
   :"<div class='history-item'>No withdrawal history.</div>";
 }

 if(dp){
  dp.innerHTML=data.deposits.length
   ?data.deposits.map(x=>`
    <div class="history-item">
     <b>Deposit ₹${money(x.amount)}</b>
     <small>${x.date}</small>
     <p>UTR: ${escapeHTML(x.utr)}</p>
     <p>Status: ${x.status}</p>
    </div>
   `).join("")
   :"<div class='history-item'>No deposit history.</div>";
 }

 if(tr){
  tr.innerHTML=data.transactions.length
   ?data.transactions.map(x=>`
    <div class="history-item">
     <b>${escapeHTML(x.type)} ₹${money(x.amount)}</b>
     <small>${x.date}</small>
     <p>Status: ${escapeHTML(x.status)}</p>
    </div>
   `).join("")
   :"<div class='history-item'>No transactions yet.</div>";
 }
}

function escapeHTML(v){
 return String(v||"")
  .replace(/&/g,"&amp;")
  .replace(/</g,"&lt;")
  .replace(/>/g,"&gt;")
  .replace(/"/g,"&quot;")
  .replace(/'/g,"&#039;");
}


/* =========================
   INVITE
========================= */

function inviteNow(){

 const link=location.href;

 const text=
  "Check out NSG Wellfare:\n"+link;

 const url=
  "https://wa.me/?text="+encodeURIComponent(text);

 window.open(url,"_blank");
}

function copyInvite(){

 const link=location.href;

 const msg=document.getElementById("inviteMessage");

 if(navigator.clipboard){
  navigator.clipboard.writeText(link)
   .then(()=>{
    msg.textContent="Invite link copied successfully.";
   })
   .catch(()=>{
    msg.textContent=link;
   });
 }else{
  msg.textContent=link;
 }
}


/* =========================
   CUSTOMER SERVICE
========================= */

function customerService(){
 window.open(SUPPORT,"_blank");
}


/* =========================
   UPDATE UI
========================= */

function updateUI(){

 updateBalance();
 loadProducts();
 renderRewards();
 renderCalendar();
 renderHistories();

 const invite=document.getElementById("inviteLink");
 if(invite)invite.value=location.href;
}


/* =========================
   START
========================= */

createUser();
updateUI();
openPage("home");
