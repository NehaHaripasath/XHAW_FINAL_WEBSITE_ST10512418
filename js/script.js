/* =========================================================
   Pawsitive Pet Academy: site behaviour
   1. Course data            5. Fee calculator
   2. Helpers                6. Navigation (drop-down, mobile menu)
   3. Rendering              7. Router (hash pages)
   4. Validation             8. Start-up
   ========================================================= */
"use strict";

/* ---------- 1. Course data (same as the mobile app) ---------- */
const courses = [
  {n:"Canine Obedience Training", fee:1500, t:"long",  e:"\u{1F415}", p:"To teach effective dog obedience and behavioural training techniques.", c:["Basic commands","Leash training","Behaviour correction","Positive reinforcement","Socialisation techniques"]},
  {n:"Pet Grooming",              fee:1500, t:"long",  e:"✂️", p:"To provide professional grooming skills for domestic pets.", c:["Coat care","Bathing techniques","Nail trimming","Ear and eye cleaning","Grooming equipment"]},
  {n:"Animal Behaviour",          fee:1500, t:"long",  e:"\u{1F408}", p:"To understand common pet behaviours and improve communication with animals.", c:["Animal psychology","Reading body language","Stress management","Behaviour modification","Enrichment activities"]},
  {n:"Pet Business Management",   fee:1500, t:"long",  e:"\u{1F4BC}", p:"To prepare learners to operate a successful pet-related business.", c:["Customer service","Marketing","Business planning","Financial management","Legal requirements"]},
  {n:"Puppy Care",                fee:750,  t:"short", e:"\u{1F436}", p:"To provide new puppy owners with essential care knowledge.", c:["Feeding","Vaccinations","Toilet training","Exercise","Socialisation"]},
  {n:"Pet First Aid",             fee:750,  t:"short", e:"\u{1FA79}", p:"To provide emergency first aid knowledge for pets.", c:["Minor injuries","CPR basics","Poison awareness","Heatstroke","Emergency transport"]},
  {n:"Basic Dog Walking",         fee:750,  t:"short", e:"\u{1F9AE}", p:"To teach safe and professional dog walking practices.", c:["Walking equipment","Handling multiple dogs","Safety procedures","Exercise routines"]}
];

// Discount tiers: [minimum number of courses, percentage off]
const TIERS = [[1,0],[2,5],[3,10],[4,15]];
const VAT_RATE = 15;
const TYPE_LABEL = {long:"Six-month programme", short:"Six-week short course"};
const TITLES = {home:"Home", about:"About Us", courses:"Courses", fees:"Calculate Fees", contact:"Contact Us"};

let selected = [];        // array of chosen course indexes
const enquiries = [];     // array of confirmed quote requests

/* ---------- 2. Helpers ---------- */
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));

// Money is handled in whole cents so every line of the quote adds up exactly,
// and formatted by hand so it looks the same in every browser and locale.
function R(cents){
  const n = Math.round(cents), neg = n < 0, a = Math.abs(n);
  const rands = String(Math.floor(a / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return (neg ? "-" : "") + "R" + rands + "." + String(a % 100).padStart(2, "0");
}
const rand = n => R(n * 100);

function discountFor(count){
  let pct = 0;
  TIERS.forEach(([min, p]) => { if (count >= min) pct = p; });
  return pct;
}

/* ---------- 3. Rendering ---------- */
function updateBadge(){
  const b = $("badge");
  b.hidden = !selected.length;
  $("badge-n").textContent = selected.length;
}
function setSelected(list){
  selected = [...new Set(list)].sort((a, b) => a - b);
  updateBadge();
}
function clearQuote(){ $("result").innerHTML = ""; $("msg").innerHTML = ""; }

function renderCourseCards(){
  ["long", "short"].forEach(t => {
    $(t).innerHTML = courses.map((c, i) => c.t !== t ? "" :
      `<div class="card"><div class="pic ${t === "short" ? "warm" : ""}" aria-hidden="true">${c.e}</div>
       <h3>${c.n}</h3><p class="fee">${rand(c.fee)}</p><p>${c.p}</p>
       <a href="#course-${i}" aria-label="View details for ${c.n}">View details</a></div>`).join("");
  });
  $("compare").tBodies[0].innerHTML = courses.map((c, i) =>
    `<tr><td><a href="#course-${i}">${c.n}</a></td><td>${TYPE_LABEL[c.t]}</td>
     <td>${c.t === "long" ? "6 months" : "6 weeks"}</td><td class="r">${rand(c.fee)}</td></tr>`).join("");
}

function renderPicks(){
  $("picks").innerHTML = courses.map((c, i) =>
    `<label class="chk"><input type="checkbox" value="${i}" ${selected.includes(i) ? "checked" : ""}> ${c.n} (${rand(c.fee)})</label>`).join("");
  document.querySelectorAll("#picks input").forEach(box => box.addEventListener("change", () => {
    setSelected([...document.querySelectorAll("#picks input:checked")].map(x => +x.value));
    clearQuote();                 // never leave an out-of-date quote on screen
    if (selected.length) setFieldError("picks", "");
  }));
}

function renderTiers(){
  $("tiers").innerHTML = TIERS.map(([min, p], k) => {
    const label = k === TIERS.length - 1 ? `${min} or more` : String(min);
    return `<tr><td>${label}</td><td class="r">${p ? p + "%" : "None"}</td></tr>`;
  }).join("");
}

function renderDropMenu(){
  const group = (t, title) => `<p class="drop-group" id="grp-${t}">${title}</p><ul aria-labelledby="grp-${t}">` +
    courses.map((c, i) => c.t !== t ? "" : `<li><a class="drop-link" href="#course-${i}" data-course="${i}">${c.n}</a></li>`).join("") + "</ul>";
  $("drop-menu").innerHTML = group("long", "Six-month programmes") + group("short", "Six-week short courses") +
    `<a class="drop-link all" href="#courses">View all courses</a>`;
}

function showDetail(i){
  const c = courses[i], on = selected.includes(i);
  $("detail").innerHTML = `<p><a href="#courses">&larr; All courses</a></p>
  <div class="two"><div>
    <h1>${c.n}</h1>
    <p><span class="tag ${c.t === "short" ? "warm" : ""}">${TYPE_LABEL[c.t]}</span></p>
    <p class="fee">Course fee: ${rand(c.fee)}</p>
    <h2 class="sub">Purpose</h2><p>${c.p}</p>
    <h2 class="sub">Content</h2><ul class="tick">${c.c.map(x => `<li>${x}</li>`).join("")}</ul>
    <button class="btn" id="add" type="button" aria-pressed="${on}">${on ? "Remove from my selection" : "Add to my selection"}</button>
    <a class="btn alt" href="#fees">Go to fees</a>
  </div>
  <div class="pic ${c.t === "short" ? "warm" : ""}" role="img" aria-label="${c.n}">${c.e}</div></div>`;
  $("add").addEventListener("click", () => {
    setSelected(on ? selected.filter(x => x !== i) : [...selected, i]);
    clearQuote();
    showDetail(i);
    $("add").focus();
  });
}

/* ---------- 4. Validation ---------- */
// Normalise a South African number: strip spaces, dashes and brackets, turn +27 / 27 into 0.
function cleanPhone(v){
  let p = v.replace(/[\s\-().]/g, "");
  if (/^\+27\d{9}$/.test(p)) p = "0" + p.slice(3);
  else if (/^27\d{9}$/.test(p)) p = "0" + p.slice(2);
  return p;
}

// Each rule returns an error message, or "" when the value is fine.
const RULES = {
  nm: v => {
    if (!v) return "Enter your name.";
    if (/\d/.test(v)) return "Your name cannot contain numbers.";
    if (!/^\p{L}[\p{L}\p{M} '\u2019-]*\p{L}\p{M}*$/u.test(v)) return "Use letters only (at least two). Spaces, hyphens and apostrophes are fine.";
    return "";
  },
  ph: v => {
    if (!v) return "Enter your phone number.";
    if (/[a-z]/i.test(v)) return "A phone number cannot contain letters.";
    if (!/^0\d{9}$/.test(cleanPhone(v))) return "Enter a 10-digit South African number, like 082 123 4567 or +27 82 123 4567.";
    return "";
  },
  em: v => {
    if (!v) return "Enter your email address.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Enter a valid email address, like name@example.com.";
    return "";
  },
  intake: v => v ? "" : "Choose a preferred intake from the drop-down.",
  picks: () => selected.length ? "" : "Tick at least one course."
};
const FIELD_LABEL = {nm:"Name", ph:"Phone number", em:"Email address", intake:"Preferred intake", picks:"Courses"};

function fieldValue(id){
  if (id === "picks") return selected;
  return $(id).value.trim().replace(/\s+/g, " ");
}
function setFieldError(id, message){
  const el = id === "picks" ? $("picks-set") : $(id);
  $(id + "-err").textContent = message;
  if (message) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid");
}
function validateAll(){
  const errors = [];
  Object.keys(RULES).forEach(id => {
    const message = RULES[id](fieldValue(id));
    setFieldError(id, message);
    if (message) errors.push({id, message});
  });
  return errors;
}

/* ---------- 5. Fee calculator ---------- */
function buildQuote(indexes){
  const count = indexes.length;
  const pct = discountFor(count);
  const sub = indexes.reduce((s, i) => s + courses[i].fee * 100, 0);   // cents
  const disc = Math.round(sub * pct / 100);
  const after = sub - disc;
  const vat = Math.round(after * VAT_RATE / 100);
  return {count, pct, sub, disc, after, vat, total: after + vat};
}

function calculate(event){
  event.preventDefault();
  $("result").innerHTML = "";
  let errors;
  try {
    errors = validateAll();
  } catch (e) {
    // Very old browsers without Unicode regex support land here.
    $("msg").innerHTML = `<div class="err" tabindex="-1" id="errbox"><strong>Something went wrong checking the form.</strong> Please try a newer browser or call us on 031 000 0000.</div>`;
    $("errbox").focus();
    return;
  }

  if (errors.length){
    $("msg").innerHTML = `<div class="err" tabindex="-1" id="errbox"><strong>Please fix ${errors.length === 1 ? "this problem" : "these " + errors.length + " problems"}:</strong>
      <ul>${errors.map(e => `<li><a href="#" data-focus="${e.id}">${FIELD_LABEL[e.id]}</a>: ${e.message}</li>`).join("")}</ul></div>`;
    document.querySelectorAll("[data-focus]").forEach(a => a.addEventListener("click", ev => {
      ev.preventDefault();
      const id = a.dataset.focus;
      (id === "picks" ? document.querySelector("#picks input") : $(id)).focus();
    }));
    $("errbox").focus();
    return;
  }

  $("msg").innerHTML = "";
  const q = buildQuote(selected);
  const name = fieldValue("nm"), phone = cleanPhone($("ph").value), mail = fieldValue("em"), intake = $("intake").value;

  $("result").innerHTML = `<h2>Your quote</h2>
  <div class="table-wrap"><table>
    <caption>Quote for ${esc(name)}, ${esc(intake)} intake</caption>
    <thead><tr><th scope="col">Course</th><th scope="col" class="r">Fee</th></tr></thead>
    <tbody>
      ${selected.map(i => `<tr><td>${courses[i].n}</td><td class="r">${rand(courses[i].fee)}</td></tr>`).join("")}
      <tr><td>Subtotal (${q.count} course${q.count > 1 ? "s" : ""})</td><td class="r">${R(q.sub)}</td></tr>
      <tr class="discount"><td>Discount (${q.pct}%)</td><td class="r">${q.disc ? "-" : ""}${R(q.disc)}</td></tr>
      <tr><td>Amount after discount</td><td class="r">${R(q.after)}</td></tr>
      <tr><td>VAT (${VAT_RATE}%)</td><td class="r">${R(q.vat)}</td></tr>
      <tr class="total"><td>Total (quote only)</td><td class="r">${R(q.total)}</td></tr>
    </tbody>
  </table></div>
  <button class="btn" id="book" type="button">Request a consultant to contact me</button>
  <button class="btn alt" id="print" type="button">Print quote</button>`;

  $("print").addEventListener("click", () => window.print());
  $("book").addEventListener("click", () => {
    enquiries.push({name, phone, mail, intake, courses: selected.map(i => courses[i].n), total: q.total / 100, at: new Date().toISOString()});
    $("result").innerHTML = "";
    $("msg").innerHTML = `<div class="ok" tabindex="-1" id="okbox">Thanks ${esc(name)}. A consultant will contact you on ${esc(phone)} to finalise your booking for the ${esc(intake)} intake.</div>`;
    $("okbox").focus();
    // Start fresh so the same request cannot be sent twice by accident.
    $("quote-form").reset();
    ["nm", "ph", "em", "intake", "picks"].forEach(id => setFieldError(id, ""));
    setSelected([]);
    renderPicks();
  });
}

/* ---------- 6. Navigation ---------- */
function setDrop(open){
  $("drop-btn").setAttribute("aria-expanded", String(open));
  $("drop-menu").hidden = !open;
}
function setMobileMenu(open){
  $("menu-btn").setAttribute("aria-expanded", String(open));
  $("nav").classList.toggle("open", open);
}

$("drop-btn").addEventListener("click", e => {
  e.stopPropagation();
  const open = $("drop-btn").getAttribute("aria-expanded") !== "true";
  setDrop(open);
  if (open) $("drop-menu").querySelector("a").focus();
});
$("menu-btn").addEventListener("click", e => {
  e.stopPropagation();
  setMobileMenu(!$("nav").classList.contains("open"));
});
// Close menus on outside click, on Escape, and after choosing a link.
document.addEventListener("click", e => {
  if (!e.target.closest(".drop")) setDrop(false);
  if (!e.target.closest("header")) setMobileMenu(false);
});
document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if ($("drop-btn").getAttribute("aria-expanded") === "true"){ setDrop(false); $("drop-btn").focus(); }
  else if ($("nav").classList.contains("open")){ setMobileMenu(false); $("menu-btn").focus(); }
});
// Arrow keys move through the drop-down links.
$("drop-menu").addEventListener("keydown", e => {
  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
  e.preventDefault();
  const links = [...$("drop-menu").querySelectorAll("a")];
  const k = links.indexOf(document.activeElement);
  links[(k + (e.key === "ArrowDown" ? 1 : -1) + links.length) % links.length].focus();
});
// Close the drop-down when keyboard focus leaves it.
$("nav").querySelector(".drop").addEventListener("focusout", e => {
  if (!e.currentTarget.contains(e.relatedTarget)) setDrop(false);
});
$("nav").addEventListener("click", e => {
  if (e.target.closest("a")){ setDrop(false); setMobileMenu(false); }
});
// Clear a field's error as soon as the user fixes it.
["nm", "ph", "em", "intake"].forEach(id => {
  const check = () => { if ($(id).hasAttribute("aria-invalid")) setFieldError(id, RULES[id](fieldValue(id))); };
  $(id).addEventListener("input", check);
  $(id).addEventListener("change", check);
});

/* ---------- 7. Router: each "page" is a section shown by the URL hash ---------- */
function route(event){
  setDrop(false);
  setMobileMenu(false);
  const h = location.hash.slice(1) || "home";
  let v = h, courseIndex = -1;
  if (h.startsWith("course-")){
    const raw = h.slice(7);
    courseIndex = /^\d+$/.test(raw) ? Number(raw) : -1;
    if (courseIndex >= 0 && courseIndex < courses.length){
      v = "detail";
      showDetail(courseIndex);
      document.title = courses[courseIndex].n + " | Pawsitive Pet Academy";
    } else v = "home";        // unknown course number: fall back to Home instead of breaking
  }
  if (!Object.prototype.hasOwnProperty.call(TITLES, v) && v !== "detail") v = "home";
  if (v !== "detail") document.title = TITLES[v] + " | Pawsitive Pet Academy";

  document.querySelectorAll(".view").forEach(s => s.classList.toggle("on", s.id === v));
  const active = v === "detail" ? "courses" : v;
  document.querySelectorAll("#nav [data-v]").forEach(a => {
    const on = a.dataset.v === active;
    a.classList.toggle("on", on);
    if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
  document.querySelectorAll("#drop-menu a[data-course]").forEach(a =>
    a.classList.toggle("on", Number(a.dataset.course) === courseIndex && v === "detail"));
  if (v === "fees"){ renderPicks(); clearQuote(); }
  window.scrollTo(0, 0);
  // After a page change, move focus to the new heading so screen readers announce it.
  if (event){
    const h1 = document.querySelector(".view.on h1");
    if (h1){ h1.setAttribute("tabindex", "-1"); h1.focus({preventScroll: true}); }
  }
}

/* ---------- 8. Start-up ---------- */
$("quote-form").addEventListener("submit", calculate);
$("skip").addEventListener("click", e => { e.preventDefault(); $("main").focus(); });
$("year").textContent = new Date().getFullYear();
renderCourseCards();
renderPicks();
renderTiers();
renderDropMenu();
updateBadge();
window.addEventListener("hashchange", route);
route();
