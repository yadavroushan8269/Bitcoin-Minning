const UPI="yadav-rishab@fam";
const SUPPORT="https://t.me/Hammerff7gcz";

const WEB_APP_URL="https://script.google.com/macros/s/AKfycbzCyz1pDKhy9pTVcuyIzw96fwH7MiXxDF0DnFU0KKnmZ1Ur4eLM5XJPY3xQrfQ4yDOIMg/exec";


const plans=[
{
id:1,
name:"Plan ₹500",
price:500,
reward:10
},
{
id:2,
name:"Plan ₹1,500",
price:1500,
reward:30
},
{
id:3,
name:"Plan ₹3,600",
price:3600,
reward:72
}
];


let s=
JSON.parse(localStorage.getItem("nsgState")||"null")
||
{
balance:0,
attendance:{},
deposits:[],
withdrawals:[],
transactions:[],
purchased:[]
};


/* =========================
   DEVICE ID
========================= */

function deviceID(){

let x=localStorage.getItem("nsgDeviceId");

if(!x){

x=
"DEV-"+
Date.now()+
"-"+
Math.random()
.toString(36)
.slice(2,10);

localStorage.setItem(
"nsgDeviceId",
x
);

}

return x;

}


/* =========================
   USER ID
========================= */

function userID(){

let x=
localStorage.getItem("nsgUid");

if(!x){

x=
"You-"+
Math.floor(
1000000+
Math.random()*8999999
);

localStorage.setItem(
"nsgUid",
x
);

}

return x;

}


/* =========================
   BACKEND API
========================= */

async function api(action,payload={}){

const body=
Object.assign(
{},
payload,
{
action:action,

userId:
payload.userId||
userID(),

userKey:
payload.userKey||
payload.userId||
userID()
}
);


const res=
await fetch(
WEB_APP_URL,
{
method:"POST",

headers:{
"Content-Type":
"text/plain;charset=utf-8"
},

body:
JSON.stringify(body)
}
);


const text=
await res.text();


let data;

try{

data=
JSON.parse(text);

}catch(e){

throw new Error(
"Server returned an invalid response."
);

}


if(!data.ok){

throw new Error(
data.message||
"Request failed."
);

}


return data;

}


/* =========================
   IMAGE COMPRESSION
========================= */

function compressImage(
file,
maxWidth=1000,
quality=.65
){

return new Promise(
(resolve,reject)=>{

const reader=
new FileReader();


reader.onload=e=>{

const img=
new Image();


img.onload=()=>{

const scale=
Math.min(
1,
maxWidth/img.width
);


const canvas=
document.createElement(
"canvas"
);


canvas.width=
Math.max(
1,
Math.round(
img.width*scale
)
);


canvas.height=
Math.max(
1,
Math.round(
img.height*scale
)
);


const ctx=
canvas.getContext(
"2d"
);


ctx.drawImage(
img,
0,
0,
canvas.width,
canvas.height
);


resolve(
canvas.toDataURL(
"image/jpeg",
quality
)
);

};


img.onerror=()=>{

reject(
new Error(
"Could not read screenshot."
)
);

};


img.src=
e.target.result;

};


reader.onerror=()=>{

reject(
new Error(
"Could not read screenshot."
)
);

};


reader.readAsDataURL(file);

});

}


/* =========================
   SAVE LOCAL STATE
========================= */

function save(){

localStorage.setItem(
"nsgState",
JSON.stringify(s)
);

}


/* =========================
   FORMAT MONEY
========================= */

function fmt(n){

return Number(n||0)
.toLocaleString(
"en-IN",
{
minimumFractionDigits:2,
maximumFractionDigits:2
}
);

}


/* =========================
   NAVIGATION
========================= */

function go(page){

document
.querySelectorAll(".page")
.forEach(
p=>
p.classList.remove("active")
);


const target=
document.getElementById(page);


if(target){

target.classList.add(
"active"
);

}


window.scrollTo(
0,
0
);


render();

}


/* =========================
   MAIN RENDER
========================= */

function render(){

const topBalance=
document.getElementById(
"topBalance"
);

if(topBalance){

topBalance.textContent=
fmt(s.balance);

}


const homeBalance=
document.getElementById(
"homeBalance"
);

if(homeBalance){

homeBalance.textContent=
fmt(s.balance);

}


const withdrawBalance=
document.getElementById(
"withdrawBalance"
);

if(withdrawBalance){

withdrawBalance.textContent=
fmt(s.balance);

}


const profileId=
document.getElementById(
"profileId"
);

if(profileId){

profileId.textContent=
userID();

}


const userIdHome=
document.getElementById(
"userIdHome"
);

if(userIdHome){

userIdHome.textContent=
userID();

}


const inviteLink=
document.getElementById(
"inviteLink"
);

if(inviteLink){

inviteLink.value=
location.href;

}


renderProducts();
renderCalendar();
renderRewards();
renderHistory();

}


/* =========================
   PRODUCTS
========================= */

function productHTML(p){

const bought=
s.purchased.includes(
p.id
);


return `

<div class="product">

<div class="productTop">

<div>

<h3>${p.name}</h3>

<p>
Product plan
</p>

</div>

<div class="price">
₹${p.price}
</div>

</div>

<ul>

<li>
Daily reward: ₹${p.reward}
</li>

<li>
Terms and eligibility apply
</li>

</ul>

<button
class="${bought?"secondary":"primary"}"
${bought?"disabled":""}
onclick="buy(${p.id})"
>

${bought?
"Purchased":
"Select Product"}

</button>

</div>

`;

}


function renderProducts(){

const html=
plans
.map(productHTML)
.join("");


const homeProducts=
document.getElementById(
"homeProducts"
);

if(homeProducts){

homeProducts.innerHTML=
html;

}


const productList=
document.getElementById(
"productList"
);

if(productList){

productList.innerHTML=
html;

}

}


/* =========================
   BUY PRODUCT
========================= */

function buy(i){

const p=
plans.find(
x=>x.id===i
);


if(!p){

return;

}


if(
s.purchased.includes(i)
){

return;

}


if(
s.balance<p.price
){

alert(
"Insufficient balance."
);

return;

}


s.balance-=
p.price;


s.purchased.push(
i
);


s.transactions.unshift({

type:"Product",

amount:p.price,

status:"Completed",

date:
new Date()
.toLocaleString()

});


save();

render();


alert(
"Product selected successfully."
);

}


/* =========================
   CALENDAR
========================= */

let cd=
new Date();


function month(v){

cd.setMonth(
cd.getMonth()+v
);

renderCalendar();

}


function key(
y,
m,
d
){

return (
y+
"-"+
String(m+1)
.padStart(2,"0")+
"-"+
String(d)
.padStart(2,"0")
);

}


/* =========================
   ATTENDANCE CALENDAR
========================= */

function renderCalendar(){

const y=
cd.getFullYear();

const m=
cd.getMonth();


const calendar=
document.getElementById(
"calendar"
);


if(!calendar){

return;

}


const monthTitle=
document.getElementById(
"monthTitle"
);


if(monthTitle){

monthTitle.textContent=
new Intl.DateTimeFormat(
"en-IN",
{
month:"long",
year:"numeric"
}
).format(cd);

}


calendar.innerHTML="";


const first=
new Date(
y,
m,
1
).getDay();


for(
let i=0;
i<first;
i++
){

calendar.innerHTML+=
'<div class="day empty"></div>';

}


const total=
new Date(
y,
m+1,
0
).getDate();


const now=
new Date();


for(
let d=1;
d<=total;
d++
){

const k=
key(
y,
m,
d
);


const e=
document.createElement(
"div"
);


e.className=
"day"+
(
s.attendance[k]
?
" done"
:
""
)+
(
d===now.getDate()&&
m===now.getMonth()&&
y===now.getFullYear()
?
" today"
:
""
);


e.textContent=d;


e.onclick=
async()=>{

if(
s.attendance[k]
){

return;

}


const now2=
new Date();


const selected=
new Date(
y,
m,
d
);


if(
selected>now2
){

alert(
"Future date attendance is not allowed."
);

return;

}


e.style.pointerEvents=
"none";


try{

const data=
await api(
"attendance",
{
userId:userID(),
date:k,
deviceId:deviceID()
}
);


s.attendance[k]=1;


if(
typeof data.newBalance===
"number"
){

s.balance=
data.newBalance;

}else{

s.balance+=12;

}


s.transactions.unshift({

type:
"Attendance Reward",

amount:12,

status:
"Completed",

date:
new Date()
.toLocaleString()

});


save();

render();


alert(
"Attendance marked. ₹12 added to your game balance."
);


}catch(err){

e.style.pointerEvents="";

alert(
err.message||
"Attendance failed."
);

}

};


calendar.appendChild(e);

}


const attCount=
document.getElementById(
"attCount"
);


if(attCount){

attCount.textContent=
Object.keys(
s.attendance
).length;

}

}


/* =========================
   REWARDS
========================= */

function renderRewards(){

const box=
document.getElementById(
"rewardsList"
);


if(!box){

return;

}


if(
!s.purchased.length
){

box.innerHTML=
'<div class="item">No rewards available yet.</div>';

return;

}


box.innerHTML=
s.purchased
.map(i=>{

const p=
plans.find(
x=>x.id===i
);


if(!p){

return "";

}


return `

<div class="item">

<b>
🎁 ${p.name}
</b>

<small>
Daily reward: ₹${p.reward}
</small>

</div>

`;

})
.join("");

}


/* =========================
   DEPOSIT PAGE
========================= */

function showDeposit(){

go("deposit");

}


/* =========================
   COPY UPI
========================= */

function copyUPI(){

const copy=()=>{

alert(
"UPI ID copied: "+
UPI
);

};


if(
navigator.clipboard
){

navigator.clipboard
.writeText(UPI)
.then(copy)
.catch(
()=>fallbackCopy()
);

}else{

fallbackCopy();

}

}


function fallbackCopy(){

const x=
document.createElement(
"textarea"
);


x.value=
UPI;


document.body.appendChild(
x
);


x.select();


document.execCommand(
"copy"
);


x.remove();


alert(
"UPI ID copied: "+
UPI
);

}


/* =========================
   SCREENSHOT PREVIEW
========================= */

const screenshotInput=
document.getElementById(
"paymentScreenshot"
);


if(screenshotInput){

screenshotInput.addEventListener(
"change",
function(){

const file=
this.files[0];


const preview=
document.getElementById(
"preview"
);


if(!file){

if(preview){

preview.innerHTML="";

}

return;

}


if(
file.size>
5*1024*1024
){

alert(
"Screenshot must be under 5 MB."
);


this.value="";


return;

}


const reader=
new FileReader();


reader.onload=
e=>{

if(preview){

preview.innerHTML=
`
<img
src="${e.target.result}"
alt="Screenshot preview"
>
`;

}

};


reader.readAsDataURL(
file
);

}
);

}


/* =========================
   SUBMIT DEPOSIT
========================= */

function submitDeposit(){

const amount=
Number(
document.getElementById(
"depositAmount"
).value
);


const utr=
document.getElementById(
"utr"
).value
.trim();


const file=
document.getElementById(
"paymentScreenshot"
).files[0];


const msg=
document.getElementById(
"depositMsg"
);


const btn=
document.querySelector(
'#deposit button[onclick="submitDeposit()"]'
);


if(
amount<500||
amount>50000
){

msg.textContent=
"Enter an amount between ₹500 and ₹50,000.";

return;

}


if(!utr){

msg.textContent=
"Enter UTR / Transaction ID.";

return;

}


if(!file){

msg.textContent=
"Upload payment screenshot.";

return;

}


if(
file.size>
5*1024*1024
){

msg.textContent=
"Screenshot must be under 5 MB.";

return;

}


if(btn){

btn.disabled=true;

}


msg.textContent=
"Submitting deposit request...";


(async()=>{

try{

const screenshot=
await compressImage(
file
);


const data=
await api(
"deposit",
{
userId:userID(),
amount:amount,
utr:utr,
screenshot:screenshot
}
);


const id=
data.depositId||
("DEP-"+Date.now());


const date=
new Date()
.toLocaleString();


s.deposits.unshift({

id:id,

amount:amount,

utr:utr,

status:
"Pending Verification",

date:date

});


s.transactions.unshift({

type:"Deposit",

amount:amount,

status:
"Pending Verification",

date:date

});


save();


document.getElementById(
"depositAmount"
).value="";


document.getElementById(
"utr"
).value="";


document.getElementById(
"paymentScreenshot"
).value="";


document.getElementById(
"preview"
).innerHTML="";


if(
data.telegramSent===false
){

msg.textContent=
"Deposit saved, but Telegram notification could not be sent.";

}else{

msg.textContent=
"Deposit request submitted. Pending manual verification.";

}


render();


}catch(err){

msg.textContent=
err.message||
"Deposit request failed.";

}finally{

if(btn){

btn.disabled=false;

}

}

})();

}


/* =========================
   WITHDRAW PAGE
========================= */

function showWithdraw(){

go("withdraw");

}


/* =========================
   SUBMIT WITHDRAW
========================= */

function submitWithdraw(){

const amount=
Number(
document.getElementById(
"withdrawAmount"
).value
);


const name=
document.getElementById(
"bankName"
).value
.trim();


const ifsc=
document.getElementById(
"ifsc"
).value
.trim()
.toUpperCase();


const bank=
document.getElementById(
"bank"
).value
.trim();


const account=
document.getElementById(
"accountNumber"
).value
.trim();


const confirmAccount=
document.getElementById(
"confirmAccount"
).value
.trim();


const msg=
document.getElementById(
"withdrawMsg"
);


const btn=
document.querySelector(
'#withdraw button[onclick="submitWithdraw()"]'
);


if(
amount<300||
amount>20000
){

msg.textContent=
"Enter an amount between ₹300 and ₹20,000.";

return;

}


if(
amount>s.balance
){

msg.textContent=
"Insufficient balance.";

return;

}


if(
!name||
!ifsc||
!bank||
!account||
!confirmAccount
){

msg.textContent=
"Please fill all bank details.";

return;

}


if(
account!==confirmAccount
){

msg.textContent=
"Account numbers do not match.";

return;

}


if(
!/^[A-Z]{4}0[A-Z0-9]{6}$/
.test(ifsc)
){

msg.textContent=
"Enter a valid IFSC code.";

return;

}


if(btn){

btn.disabled=true;

}


msg.textContent=
"Submitting withdrawal request...";


(async()=>{

try{

const data=
await api(
"withdraw",
{
userId:userID(),

amount:amount,

accountName:name,

ifsc:ifsc,

bank:bank,

accountNumber:account
}
);


const id=
data.withdrawalId||
("WDR-"+Date.now());


const date=
new Date()
.toLocaleString();


s.withdrawals.unshift({

id:id,

amount:amount,

status:"Pending",

date:date

});


s.transactions.unshift({

type:"Withdrawal",

amount:amount,

status:"Pending",

date:date

});


if(
typeof data.newBalance===
"number"
){

s.balance=
data.newBalance;

}else{

s.balance-=amount;

}


save();


document.getElementById(
"withdrawAmount"
).value="";


if(
data.telegramSent===false
){

msg.textContent=
"Withdrawal saved, but Telegram notification could not be sent.";

}else{

msg.textContent=
"Withdrawal request submitted for manual verification.";

}


render();


}catch(err){

msg.textContent=
err.message||
"Withdrawal request failed.";

}finally{

if(btn){

btn.disabled=false;

}

}

})();

}


/* =========================
   HISTORY
========================= */

function renderHistory(){

const d=
document.getElementById(
"depositHistoryList"
);


const w=
document.getElementById(
"withdrawHistoryList"
);


const t=
document.getElementById(
"transactionList"
);


if(d){

d.innerHTML=
s.deposits.length

?

s.deposits
.map(
x=>`

<div class="item">

<b>
Deposit ₹${fmt(x.amount)}
</b>

<small>
${safe(x.date)}
</small>

<p>
UTR: ${safe(x.utr)}
</p>

<p>
Status: ${safe(x.status)}
</p>

</div>

`
)
.join("")

:

'<div class="item">No deposit requests.</div>';

}


if(w){

w.innerHTML=
s.withdrawals.length

?

s.withdrawals
.map(
x=>`

<div class="item">

<b>
Withdrawal ₹${fmt(x.amount)}
</b>

<small>
${safe(x.date)}
</small>

<p>
Status: ${safe(x.status)}
</p>

</div>

`
)
.join("")

:

'<div class="item">No withdrawal requests.</div>';

}


if(t){

t.innerHTML=
s.transactions.length

?

s.transactions
.map(
x=>`

<div class="item">

<b>
${safe(x.type)}
₹${fmt(x.amount)}
</b>

<small>
${safe(x.date)}
</small>

<p>
Status: ${safe(x.status)}
</p>

</div>

`
)
.join("")

:

'<div class="item">No transactions yet.</div>';

}

}


/* =========================
   HTML SAFETY
========================= */

function safe(x){

return String(x||"")
.replace(
/[&<>"']/g,
a=>({

"&":"&amp;",
"<":"&lt;",
">":"&gt;",
'"':"&quot;",
"'":"&#039;"

}[a])
);

}


/* =========================
   SHARE INVITE
========================= */

function shareInvite(){

window.open(
"https://wa.me/?text="+
encodeURIComponent(
"Join NSG Wellfare: "+
location.href
),
"_blank"
);

}


/* =========================
   COPY INVITE
========================= */

function copyInvite(){

const msg=
document.getElementById(
"inviteMsg"
);


if(
navigator.clipboard
){

navigator.clipboard
.writeText(
location.href
)
.then(
()=>{

msg.textContent=
"Invite link copied.";

}
)
.catch(
()=>{

msg.textContent=
location.href;

}
);

}else{

msg.textContent=
location.href;

}

}


/* =========================
   SUPPORT
========================= */

function support(){

window.open(
SUPPORT,
"_blank"
);

}


/* =========================
   START
========================= */

render();
