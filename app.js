// ================= SETTINGS =================
let warningDays = Number(localStorage.getItem("warningDays")) || 3;

// ================= DATA =================
let items = JSON.parse(localStorage.getItem("items")) || [];
let currentCategory = "All";

// ================= DATE HELPER =================
function normalizeDate(d){
if(!d) return new Date("Invalid");
const x=new Date(d+"T00:00:00");
x.setHours(0,0,0,0);
return x;
}

// ================= NAV =================
function showScreen(id){
document.querySelectorAll(".screen").forEach(s=>{
s.classList.remove("active");
});

document.getElementById(id).classList.add("active");
}

// ================= ADD ITEM =================
document.getElementById("addForm").addEventListener("submit",e=>{
e.preventDefault();

const name=document.getElementById("name").value.trim();
const qty=document.getElementById("qty").value;
const main=document.getElementById("mainCat").value;
const sub=document.getElementById("subCat").value;
const cat=main+" - "+sub;
const date=document.getElementById("date").value;

if(!name||!qty||!cat||!date) return;

items.push({name,qty,cat,date});
localStorage.setItem("items",JSON.stringify(items));

e.target.reset();
updateUI();
});

// ================= UPDATE UI =================
function updateUI(){

const list=document.getElementById("list");
const alertList=document.getElementById("alertList");
const filters=document.getElementById("filters");
const search=document.getElementById("search").value.toLowerCase();

list.innerHTML="";
alertList.innerHTML="";
filters.innerHTML="";

let total=0,expired=0,soon=0,safe=0;

const today=new Date();
today.setHours(0,0,0,0);

items.sort((a,b)=>normalizeDate(a.date)-normalizeDate(b.date));

const categories=["All",...new Set(items.map(i=>i.cat))];

filters.innerHTML=categories.map(c=>`
<button onclick="filterCategory('${c}')" class="${c===currentCategory?'active':''}">
${c}
</button>
`).join("");

items.forEach((i,index)=>{

if(currentCategory!=="All" && i.cat!==currentCategory) return;
if(search && !i.name.toLowerCase().includes(search)) return;

total++;

const expDate=normalizeDate(i.date);
const diffDays=Math.floor((expDate-today)/(1000*60*60*24));

let status,label;

if(diffDays<=0){status="expired";label="EXPIRED";expired++;}
else if(diffDays<=warningDays){status="expiring";label="EXPIRING";soon++;}
else{status="safe";label="SAFE";safe++;}

list.innerHTML+=`
<div class="item">
<b>${i.name}</b>
<span class="badge ${status}">${label}</span><br>
Qty: ${i.qty}<br>
Category: ${i.cat}<br>
Exp: ${i.date}<br>
<button onclick="deleteItem(${index})">Delete</button>
</div>
`;

if(status==="expired"||status==="expiring"){
alertList.innerHTML+=`
<div class="item">
<b>${i.name}</b>
<span class="badge ${status}">${label}</span>
</div>
`;
}
});

if(list.innerHTML==="") list.innerHTML=`<div class="empty">No items found</div>`;
if(alertList.innerHTML==="") alertList.innerHTML=`<div class="empty">No alerts</div>`;

document.getElementById("total").textContent=total;
document.getElementById("expired").textContent=expired;
document.getElementById("soon").textContent=soon;
document.getElementById("safe").textContent=safe;
}

// ================= FILTER =================
function filterCategory(cat){
currentCategory=cat;
updateUI();
}

// ================= DELETE =================
function deleteItem(index){
if(confirm("Delete this item?")){
items.splice(index,1);
localStorage.setItem("items",JSON.stringify(items));
updateUI();
}
}

// ================= SEARCH =================
document.getElementById("search").addEventListener("input",updateUI);

// ================= WARNING DAYS =================
function saveWarningDays(){
const days=document.getElementById("warnDays").value;
localStorage.setItem("warningDays",days);
warningDays=days;
alert("Saved!");
updateUI();
}

// ================= RESET DATA =================
function resetData(){
if(!confirm("Delete ALL inventory?")) return;
items=[];
localStorage.removeItem("items");
updateUI();
}

// ================= EXPORT =================
function exportData(){
if(items.length===0){
alert("No data to export");
return;
}

let csv="Item Name,Quantity,Category,Expiration Date\n";
items.forEach(i=>{
csv+=`"${i.name}","${i.qty}","${i.cat}","${i.date}"\n`;
});

const blob=new Blob([csv],{type:"text/csv"});
const url=URL.createObjectURL(blob);
const a=document.createElement("a");
a.href=url;
a.download="inventory-backup.csv";
a.click();
URL.revokeObjectURL(url);
}

// ================= CATEGORY SYSTEM =================
const CATEGORY_PRESETS={
food:{name:"Food / Ingredients",subs:["Meat","Vegetables","Fruit","Dairy","Seafood","Frozen","Pantry","Pastry","Beverages","Others"]},
medicine:{name:"Medicine",subs:["Tablet","Syrup","Injection","Vitamins","First Aid","Antibiotics","Others"]},
cosmetics:{name:"Cosmetics",subs:["Skincare","Makeup","Haircare","Fragrance","Personal Care","Others"]}
};

let selectedCategoryType=localStorage.getItem("categoryType")||"food";

function saveCategoryType(){
const type=document.getElementById("categoryType").value;

localStorage.setItem("categoryType",type);
selectedCategoryType=type;

// reload category dropdown
initCategories();

alert("Category type saved!");
}

function loadSubCategories(){
const main=document.getElementById("mainCat");
const sub=document.getElementById("subCat");

const type=main.value || selectedCategoryType;
const preset=CATEGORY_PRESETS[type];

sub.innerHTML="";

if(!preset) return;

preset.subs.forEach(s=>{
const opt=document.createElement("option");
opt.value=s;
opt.textContent=s;
sub.appendChild(opt);
});
}

function initCategories(){
const main=document.getElementById("mainCat");

main.innerHTML="";

Object.keys(CATEGORY_PRESETS).forEach(key=>{
const opt=document.createElement("option");
opt.value=key;
opt.textContent=CATEGORY_PRESETS[key].name;
main.appendChild(opt);
});

main.value=selectedCategoryType;
loadSubCategories();
}

document.addEventListener("DOMContentLoaded",()=>{
initCategories();
updateUI();
});

function initCategories(){

const main=document.getElementById("mainCat");
const sub=document.getElementById("subCat");

main.innerHTML="";
sub.innerHTML="";

// only show the selected category type
const preset=CATEGORY_PRESETS[selectedCategoryType];

const opt=document.createElement("option");
opt.value=selectedCategoryType;
opt.textContent=preset.name;
main.appendChild(opt);

main.value=selectedCategoryType;

// load its sub categories
preset.subs.forEach(s=>{
const subOpt=document.createElement("option");
subOpt.value=s;
subOpt.textContent=s;
sub.appendChild(subOpt);
});
}

document.addEventListener("DOMContentLoaded",()=>{

// load saved category in settings UI
document.getElementById("categoryType").value=selectedCategoryType;

initCategories();
updateUI();

});