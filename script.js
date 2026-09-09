const UPI="yadav-rishab@fam";
const SUPPORT="https://t.me/Hammerff7gcz";


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


function save(){
localStorage.setItem(
"nsgState",
JSON.stringify(s)
);
}


function fmt(n){
return Number(n||0).toLocaleString(
"en-IN",
{
minimumFractionDigits:2,
maximumFractionDigits:2
}
);
}


function userID(){

let x=localStorage.getItem("nsgUid");

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


function go(page){

document
.querySelectorAll(".page")
.forEach(
p=>p.classList.remove("active")
);

const target=document.getElementById(page);

if(target){
target.classList.add("active");
}

window.scrollTo(0,0);

render();

}


function render(){

document.getElementById(
"topBalance"
).textContent=fmt(s.balance);


document.getElementById(
"homeBalance"
).textContent=fmt(s.balance);


document.getElementById(
"withdrawBalance"
).textContent=fmt(s.balance);


document.getElementById(
"profileId"
).textContent=userID();


document.getElementById(
"userIdHome"
).textContent=userID();


document.getElementById(
"inviteLink"
).value=location.href;


renderProducts();
renderCalendar();
renderRewards();
renderHistory();

}


function productHTML(p){

const bought=
s.purchased.includes(p.id);


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

${bought?"Purchased":"Select Product"}

</button>

</div>

`;

}


function renderProducts(){

const html=
plans.map(productHTML).join("");


document.getElementById(
"homeProducts"
).innerHTML=html;


document.getElementById(
"productList"
).innerHTML=html;

}


function buy(i){

const p=
plans.find(x=>x.id===i);


if(!p)return;


if(s.purchased.includes(i)){
return;
}


if(s.balance<p.price){

alert(
"Insufficient balance."
);

return;

}


s.balance-=p.price;

s.purchased.push(i);


s.transactions.unshift({

type:"Product",
amount:p.price,
status:"Completed",
date:new Date().toLocaleString()

});


save();

render();


alert(
"Product selected successfully."
);

}


let cd=new Date();


function month(v){

cd.setMonth(
cd.getMonth()+v
);

renderCalendar();

}


function key(y,m,d){

return (
y+
"-"+
String(m+1).padStart(2,"0")+
"-"+
String(d).padStart(2,"0")
);

}


function renderCalendar(){

const y=cd.getFullYear();
const m=cd.getMonth();

const calendar=
document.getElementById(
"calendar"
);


document.getElementById(
"monthTitle"
).textContent=
new Intl.DateTimeFormat(
"en-IN",
{
month:"long",
year:"numeric"
}
).format(cd);


calendar.innerHTML="";


const first=
new Date(y,m,1).getDay();


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


const now=new Date();


for(
let d=1;
d<=total;
d++
){

const k=
key(y,m,d);


const e=
document.createElement(
"div"
);


e.className=
"day"+
(s.attendance[k]?" done":"")+
(
d===now.getDate()&&
m===now.getMonth()&&
y===now.getFullYear()
?" today":""
);


e.textContent=d;


e.onclick=()=>{

if(!s.attendance[k]){

s.attendance[k]=1;

save();

renderCalendar();

}

};


calendar.appendChild(e);

}


document.getElementById(
"attCount"
).textContent=
Object.keys(
s.attendance
).length;

}


function renderRewards(){

const box=
document.getElementById(
"rewardsList"
);


if(!s.purchased.length){

box.innerHTML=
'<div class="item">No rewards available yet.</div>';

return;

}


box.innerHTML=
s.purchased
.map(i=>{

const p=
plans.find(x=>x.id===i);

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


function showDeposit(){

go("deposit");

}


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

x.value=UPI;

document.body.appendChild(x);

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


document
.getElementById(
"paymentScreenshot"
)
.addEventListener(
"change",
function(){

const file=this.files[0];

const preview=
document.getElementById(
"preview"
);


if(!file){

preview.innerHTML="";

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

preview.innerHTML=
`
<img
src="${e.target.result}"
alt="Screenshot preview"
>
`;

};


reader.readAsDataURL(file);

}
);


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
).value.trim();


const file=
document.getElementById(
"paymentScreenshot"
).files[0];


const msg=
document.getElementById(
"depositMsg"
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


const r={

id:
"DEP-"+Date.now(),

amount:amount,

utr:utr,

status:
"Pending Verification",

date:
new Date().toLocaleString()

};


s.deposits.unshift(r);


s.transactions.unshift({

type:"Deposit",

amount:amount,

status:
"Pending Verification",

date:r.date

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


msg.textContent=
"Deposit request submitted. Pending manual verification.";


render();

}


function showWithdraw(){

go("withdraw");

}


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
).value.trim();


const ifsc=
document.getElementById(
"ifsc"
).value.trim().toUpperCase();


const bank=
document.getElementById(
"bank"
).value.trim();


const account=
document.getElementById(
"accountNumber"
).value.trim();


const confirmAccount=
document.getElementById(
"confirmAccount"
).value.trim();


const msg=
document.getElementById(
"withdrawMsg"
);


if(
amount<300||
amount>20000
){

msg.textContent=
"Enter an amount between ₹300 and ₹20,000.";

return;

}


if(amount>s.balance){

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
!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)
){

msg.textContent=
"Enter a valid IFSC code.";

return;

}


const r={

id:
"WDR-"+Date.now(),

amount:amount,

status:"Pending",

date:
new Date().toLocaleString()

};


s.withdrawals.unshift(r);


s.transactions.unshift({

type:"Withdrawal",

amount:amount,

status:"Pending",

date:r.date

});


s.balance-=amount;


save();


document.getElementById(
"withdrawAmount"
).value="";


msg.textContent=
"Withdrawal request submitted for manual verification.";


render();

}


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


d.innerHTML=
s.deposits.length

?

s.deposits
.map(x=>`

<div class="item">

<b>
Deposit ₹${fmt(x.amount)}
</b>

<small>
${x.date}
</small>

<p>
UTR: ${safe(x.utr)}
</p>

<p>
Status: ${x.status}
</p>

</div>

`)
.join("")

:

'<div class="item">No deposit requests.</div>';


w.innerHTML=
s.withdrawals.length

?

s.withdrawals
.map(x=>`

<div class="item">

<b>
Withdrawal ₹${fmt(x.amount)}
</b>

<small>
${x.date}
</small>

<p>
Status: ${x.status}
</p>

</div>

`)
.join("")

:

'<div class="item">No withdrawal requests.</div>';


t.innerHTML=
s.transactions.length

?

s.transactions
.map(x=>`

<div class="item">

<b>
${safe(x.type)}
₹${fmt(x.amount)}
</b>

<small>
${x.date}
</small>

<p>
Status: ${safe(x.status)}
</p>

</div>

`)
.join("")

:

'<div class="item">No transactions yet.</div>';

}


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


function copyInvite(){

const msg=
document.getElementById(
"inviteMsg"
);


if(
navigator.clipboard
){

navigator.clipboard
.writeText(location.href)
.then(
()=>{
msg.textContent=
"Invite link copied."
}
)
.catch(
()=>{
msg.textContent=
location.href
}
);

}else{

msg.textContent=
location.href;

}

}


function support(){

window.open(
SUPPORT,
"_blank"
);

}


render();
