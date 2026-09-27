// ===== 旅行网站逻辑层 =====
// 依赖 data.js 的全局变量：DEFAULT_TRIP、presetExpenses、adjSights、adjEmoji、TIPS、VLOG_DAYS

// Tab 切换
    const tabBtns = document.querySelectorAll(".nav-btn");
    const tabContents = document.querySelectorAll(".section");
    tabBtns.forEach(btn => { btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(tab).classList.add("active");
      window.scrollTo({ top: document.getElementById("nav").offsetTop - 60, behavior: "smooth" });
    }); });

    const TRIP_KEY = "travel_trip_2026";
    let trip = [];
    function loadTrip() {
      const saved = localStorage.getItem(TRIP_KEY);
      if (saved) { try { trip = JSON.parse(saved); } catch(e) { trip = JSON.parse(JSON.stringify(DEFAULT_TRIP)); } }
      else { trip = JSON.parse(JSON.stringify(DEFAULT_TRIP)); saveTrip(); }
    }
    function saveTrip() { localStorage.setItem(TRIP_KEY, JSON.stringify(trip)); }
    function resetTrip() { trip = JSON.parse(JSON.stringify(DEFAULT_TRIP)); saveTrip(); renderAll(); document.getElementById("adjustResult").innerHTML = "<h4>✅ 已恢复</h4><p>行程已恢复为默认方案</p>"; document.getElementById("adjustResult").classList.add("show"); }
    function renderTimeline() {
      const box = document.getElementById("timelineBox");
      const colors = ["#c05e3f","#c08a3e","#b8a24c","#6b8e7a","#4a6fa5","#7e6b8f","#c05e3f","#9a9a95"];
      box.innerHTML = trip.map((d, i) => {
        const detail = d.spots.length ? d.spots.map(s => s[0]).join(" → ") : d.detail;
        return `<div class="timeline-item"><div class="timeline-dot" style="border-color:${colors[i%8]}"></div><div class="timeline-content"><div class="timeline-date" style="color:${colors[i%8]}">${d.date}</div><div class="timeline-title">${d.title}</div><div class="timeline-detail">${detail}</div></div></div>`;
      }).join("");
    }
    function renderRoutes() {
      const box = document.getElementById("routesBox");
      const routeGroups = [
        ["重庆 · 南岸区到渝中区", ["10/2"], "上午南岸区步行游览（弹子石、下浩里、龙门浩相邻）；下午过江逛解放碑、十八梯、山城步道；晚上看洪崖洞夜景，上千厮门大桥拍全景"],
        ["重庆 · 渝中区深度游", ["10/3"], "上午鹅岭二厂拍照，李子坝看轻轨穿楼；下午三峡博物馆（需预约）；傍晚湖广会馆；晚上朝天门夜景"],
        ["重庆到成都 · 转场", ["10/4"], "上午光环购物公园，下午高铁 G7628 到成都，入住希尔顿嘉悦里，晚上天府广场散步"],
        ["成都 · 广汉与都江堰一日游", ["10/5"], "三星堆约3小时，下午打车去都江堰约1小时，晚上坐高铁 S5058 回犀浦，再打车回酒店"],
        ["成都 · 文化游与返程", ["10/6","10/7"], "10月6日上午杜甫草堂、下午成都博物馆、晚上东郊记忆；10月7日上午武侯祠+锦里，15:00出发去机场"]
      ];
      const highlight = ["三星堆","都江堰","洪崖洞","李子坝","成都博物馆"];
      box.innerHTML = routeGroups.map(rg => {
        const days = rg[1];
        const spots = [];
        days.forEach(dk => {
          const d = trip.find(t => t.day === dk);
          if (d) d.spots.forEach(s => { if (!spots.includes(s[0])) spots.push(s[0]); });
        });
        const flow = spots.map(n => `<span class="route-node${highlight.includes(n) ? " highlight" : ""}">${n}</span>`).join(`<span class="route-arrow">→</span>`);
        return `<div class="route-card"><h3>${rg[0]}</h3><div class="route-flow">${flow}</div><div class="route-tip">💡 ${rg[2]}</div></div>`;
      }).join("");
    }
    function renderDays() {
      const box = document.getElementById("daysBox");
      const badgeColors = ["linear-gradient(135deg,#c05e3f,#c08a3e)","linear-gradient(135deg,#c08a3e,#b8a24c)","linear-gradient(135deg,#b8a24c,#6b8e7a)","linear-gradient(135deg,#6b8e7a,#4a6fa5)","linear-gradient(135deg,#4a6fa5,#7e6b8f)","linear-gradient(135deg,#7e6b8f,#b87b8b)","linear-gradient(135deg,#c05e3f,#b87b8b)","linear-gradient(135deg,#9a9a95,#b0b0ab)"];
      box.innerHTML = trip.map((d, i) => {
        let rows = "";
        d.fixed.forEach(r => {
          rows += `<div class="schedule-row"><span class="schedule-time">${r[0]}</span><span class="schedule-tag tag-${r[1]}">${r[2]}</span><span class="schedule-desc">${r[3]}</span></div>`;
        });
        if (d.spots.length) {
          const chips = d.spots.map(s => `<span class="spot-chip"><span class="e">${s[1]}</span>${s[0]}</span>`).join("");
          rows += `<div class="schedule-row"><span class="schedule-time">游览</span><span class="schedule-tag tag-sight">景点</span><div class="spot-row">${chips}</div></div>`;
        }
        return `<div class="day-card"><div class="day-header"><div class="day-badge" style="background:${badgeColors[i%8]}"><span class="num">${d.num}</span><span class="label">DAY</span></div><div class="day-info"><h3>${d.date} · ${d.title}</h3><p>${d.subtitle}</p></div><div class="weather-chip">${d.weather}</div><div class="day-actions"><button onclick="addNote('${d.day}')">+ 备注</button></div></div><div class="schedule-list">${rows}</div><div class="day-notes-area" id="notes-${d.day}"></div></div>`;
      }).join("");
    }
    function renderMap() {
      const box = document.getElementById("mapBox");
      const cqDays = trip.filter(d => d.city === "重庆");
      const transDays = trip.filter(d => d.city === "转场");
      const cdDays = trip.filter(d => d.city === "成都");
      function dayHtml(d) {
        const spots = d.spots.map((s, i) => {
          const color = s[2] || d.color;
          return `<div class="flow-spot"><div class="node" style="background:${color}"><span class="em">${s[1]}</span><span class="idx">${i+1}</span></div><span class="nm">${s[0]}</span></div>`;
        }).join(`<span class="flow-arrow">→</span>`);
        return `<div class="flow-day"><div class="flow-day-label"><span class="badge" style="background:${d.color}">${d.label}</span><span class="zone">${d.zone}</span></div><div class="flow-spots">${spots}</div></div>`;
      }
      let html = "";
      if (cqDays.length) html += `<div class="city-block cq"><div class="city-title"><span class="ct-em">🏔️</span> 重庆 <span style="font-size:0.85rem;color:var(--text2);font-weight:400;margin-left:6px">两江交汇 · 山城</span></div><div class="city-sub">Day 1-2 · 10月2日至3日</div>${cqDays.map(dayHtml).join("")}</div>`;
      if (transDays.length) html += `<div class="city-block transition"><div class="city-title"><span class="ct-em">🚄</span> 转场日 <span style="font-size:0.85rem;color:var(--text2);font-weight:400;margin-left:6px">10月4日 · 重庆 → 成都</span></div><div class="city-sub">上午游重庆 · 傍晚抵成都</div>${transDays.map(dayHtml).join("")}</div>`;
      if (cdDays.length) html += `<div class="city-block cd"><div class="city-title"><span class="ct-em">🐼</span> 成都 <span style="font-size:0.85rem;color:var(--text2);font-weight:400;margin-left:6px">天府之国 · 休闲之都</span></div><div class="city-sub">Day 4-6 · 10月5日至7日</div>${cdDays.map(dayHtml).join("")}</div>`;
      box.innerHTML = html;
    }
    function renderAll() { renderTimeline(); renderRoutes(); renderDays(); renderMap(); renderAllNotes(); renderTips(); renderVlog(); }
    const NOTES_KEY = "travel_notes_2026";
    let dayNotes = {};
    function loadNotes() {
      const saved = localStorage.getItem(NOTES_KEY);
      if (saved) dayNotes = JSON.parse(saved);
      renderAllNotes();
    }
    function saveNotes() { localStorage.setItem(NOTES_KEY, JSON.stringify(dayNotes)); }
    function renderAllNotes() { Object.keys(dayNotes).forEach(day => renderDayNotes(day)); }
    function renderDayNotes(day) {
      const container = document.getElementById("notes-" + day);
      if (!container) return;
      const notes = dayNotes[day] || [];
      if (notes.length === 0) { container.innerHTML = ""; return; }
      container.innerHTML = notes.map((n, i) => '<div class="note-bubble">' + escHtml(n) + '<button class="note-delete" onclick="deleteNote(\'' + day + '\',' + i + ')">×</button></div>').join("");
    }
    function addNote(day) {
      openModal("添加备注 - " + day, (text) => {
        if (!text.trim()) return;
        if (!dayNotes[day]) dayNotes[day] = [];
        dayNotes[day].push(text.trim());
        saveNotes(); renderDayNotes(day);
      });
    }
    function deleteNote(day, index) {
      dayNotes[day].splice(index, 1);
      if (dayNotes[day].length === 0) delete dayNotes[day];
      saveNotes(); renderDayNotes(day);
    }
    function escHtml(text) { const div = document.createElement("div"); div.textContent = text; return div.innerHTML; }
    function openModal(title, callback) {
      const overlay = document.getElementById("modalBg");
      document.getElementById("modalTitle").textContent = title;
      const textarea = document.getElementById("modalInput");
      textarea.value = ""; overlay.classList.add("show"); setTimeout(() => textarea.focus(), 100);
      document.getElementById("modalSave").onclick = () => { callback(textarea.value); closeModal(); };
      document.getElementById("modalCancel").onclick = closeModal;
      overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
    }
    function closeModal() { document.getElementById("modalBg").classList.remove("show"); }

    function parseAdj(text) {
      text = text.trim(); if (!text) return null;
      let result = { type:"unknown", day:null, sight:null, newSight:null, msg:"" };
      for (let i = 0; i < adjDates.length; i++) {
        if (text.includes(adjDates[i])) {
          const d = adjDates[i];
          if (d.startsWith("10月")) result.day = d.replace("10月","10/").replace("日","");
          else if (d.startsWith("10/")) result.day = d;
          else if (d === "一号") result.day = "10/1"; else if (d === "二号") result.day = "10/2";
          else if (d === "三号") result.day = "10/3"; else if (d === "四号") result.day = "10/4";
          else if (d === "五号") result.day = "10/5"; else if (d === "六号") result.day = "10/6";
          else if (d === "七号") result.day = "10/7"; else if (d === "八号") result.day = "10/8";
          else if (d === "第一天") result.day = "10/1"; else if (d === "第二天") result.day = "10/2";
          else if (d === "第三天") result.day = "10/3"; else if (d === "第四天") result.day = "10/4";
          else if (d === "第五天") result.day = "10/5"; else if (d === "第六天") result.day = "10/6";
          else if (d === "第七天") result.day = "10/7"; else if (d === "第八天") result.day = "10/8";
          break;
        }
      }
      let foundSight = null;
      for (const [sight, keywords] of Object.entries(adjSights)) {
        for (const kw of keywords) { if (text.includes(kw)) { foundSight = sight; break; } }
        if (foundSight) break;
      }
      result.sight = foundSight;
      const hasRemove = adjRemove.some(k => text.includes(k));
      const hasAdd = adjAdd.some(k => text.includes(k));
      const hasReplace = adjReplace.some(k => text.includes(k));
      if (hasRemove && foundSight) { result.type = "remove"; result.msg = "在 " + (result.day||"?") + " 删除 " + foundSight; }
      else if (hasReplace && foundSight) {
        let newSight = null;
        for (const [s2, kws] of Object.entries(adjSights)) {
          if (s2 === foundSight) continue;
          for (const kw of kws) { if (text.includes(kw)) { newSight = s2; break; } }
          if (newSight) break;
        }
        if (newSight) { result.type = "replace"; result.newSight = newSight; result.msg = "在 " + (result.day||"?") + " 把 " + foundSight + " 换成 " + newSight; }
        else { result.type = "replace-need-target"; result.msg = "要替换 " + foundSight + "，但没说换成什么"; }
      }
      else if (hasAdd && foundSight) { result.type = "add"; result.msg = "在 " + (result.day||"?") + " 添加 " + foundSight; }
      else { result.type = "note"; result.msg = "已记录为备注"; }
      return result;
    }
    function applyAdjust() {
      const input = document.getElementById("adjustInput");
      const text = input.value.trim();
      const resultDiv = document.getElementById("adjustResult");
      if (!text) return;
      const result = parseAdj(text);
      resultDiv.classList.remove("error");
      if ((result.type === "remove" || result.type === "add" || result.type === "replace") && result.day && result.sight) {
        const d = trip.find(t => t.day === result.day);
        if (!d) { resultDiv.innerHTML = "<h4>⚠️ 未找到该日期</h4><p>请确认日期在 10月1日-10月8日 之间</p>"; resultDiv.classList.add("show","error"); return; }
        if (result.type === "remove") {
          const before = d.spots.length;
          d.spots = d.spots.filter(s => !s[0].includes(result.sight) && !result.sight.includes(s[0]));
          const removed = before - d.spots.length;
          if (removed > 0) { resultDiv.innerHTML = "<h4>✅ 已删除</h4><p>" + result.msg + "（共移除 " + removed + " 个）</p>"; resultDiv.classList.add("show"); }
          else { resultDiv.innerHTML = "<h4>⚠️ 未找到</h4><p>" + result.day + " 的行程里没有 " + result.sight + "</p>"; resultDiv.classList.add("show","error"); return; }
        } else if (result.type === "add") {
          d.spots.push([result.sight, adjEmoji[result.sight] || "📍"]);
          resultDiv.innerHTML = "<h4>✅ 已添加</h4><p>" + result.msg + "</p>"; resultDiv.classList.add("show");
        } else if (result.type === "replace") {
          const idx = d.spots.findIndex(s => s[0].includes(result.sight) || result.sight.includes(s[0]));
          if (idx >= 0) { d.spots[idx] = [result.newSight, adjEmoji[result.newSight] || "📍"]; resultDiv.innerHTML = "<h4>✅ 已替换</h4><p>" + result.msg + "</p>"; resultDiv.classList.add("show"); }
          else { resultDiv.innerHTML = "<h4>⚠️ 未找到</h4><p>" + result.day + " 的行程里没有 " + result.sight + "</p>"; resultDiv.classList.add("show","error"); return; }
        }
        saveTrip(); renderAll(); input.value = "";
      } else if (result.type === "note") {
        const day = result.day || "预备";
        if (!dayNotes[day]) dayNotes[day] = [];
        dayNotes[day].push("【备注】" + text);
        saveNotes(); renderAllNotes();
        resultDiv.innerHTML = "<h4>✅ 已记录</h4><p>已保存为 " + day + " 的备注</p>"; resultDiv.classList.add("show"); input.value = "";
      } else {
        resultDiv.innerHTML = "<h4>❓ 未能识别</h4><p>请尝试更明确的表达，例如：10月5日不去三星堆了，或 10月2日增加春熙路</p>"; resultDiv.classList.add("show","error");
      }
    }
    function setAdjustText(t) { document.getElementById("adjustInput").value = t; document.getElementById("adjustInput").focus(); }
    const STORAGE_KEY = "travel_ledger_2026";

    let expenses = [];
    function loadExpenses() { const saved = localStorage.getItem(STORAGE_KEY); if (saved) expenses = JSON.parse(saved); else { expenses = presetExpenses.map((e,i) => ({...e,id:i+1})); saveExpenses(); } }
    function saveExpenses() { localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses)); }
    function addExpense() {
      const date = document.getElementById("expenseDate").value;
      const category = document.getElementById("expenseCategory").value;
      const item = document.getElementById("expenseItem").value.trim();
      const amount = parseFloat(document.getElementById("expenseAmount").value);
      if (!item || !amount || amount <= 0) { alert("请填写完整的费用信息"); return; }
      expenses.push({id:Date.now(),date,category,item,amount});
      saveExpenses(); renderLedger(); renderOverviewCharts();
      document.getElementById("expenseItem").value = ""; document.getElementById("expenseAmount").value = "";
    }
    function deleteExpense(id) { expenses = expenses.filter(e => e.id !== id); saveExpenses(); renderLedger(); renderOverviewCharts(); }
    let currentFilter = "all";
    function renderLedger() {
      const tbody = document.getElementById("ledgerTableBody");
      const filtered = currentFilter === "all" ? expenses : expenses.filter(e => e.category === currentFilter);
      tbody.innerHTML = filtered.map(e => `<tr><td>${e.date}</td><td><span class="schedule-tag tag-${getCatClass(e.category)}">${e.category}</span></td><td>${e.item}</td><td><strong>¥${e.amount.toFixed(1)}</strong></td><td><button class="del-btn" onclick="deleteExpense(${e.id})">🗑️</button></td></tr>`).join("");
      updateSummary();
    }
    function getCatClass(cat) { const m = {"交通":"transport","住宿":"hotel","餐饮":"food","门票":"ticket","购物":"sight","其他":"transport"}; return m[cat] || "transport"; }
    function updateSummary() {
      const cats = ["交通","住宿","餐饮","门票","购物","其他"];
      const colors = {"交通":"#4a6fa5","住宿":"#c05e3f","餐饮":"#c08a3e","门票":"#6b8e7a","购物":"#7e6b8f","其他":"#9a9a95"};
      const bd = {}; cats.forEach(c => bd[c] = 0); expenses.forEach(e => bd[e.category] += e.amount);
      const total = expenses.reduce((s,e) => s + e.amount, 0);
      if (currentFilter === "all") { document.getElementById("totalLabel").textContent = "已记录总费用"; document.getElementById("totalAmount").textContent = "¥" + total.toFixed(1); document.getElementById("totalSub").textContent = "共 " + expenses.length + " 笔记录"; }
      else { const val = bd[currentFilter] || 0; const cnt = expenses.filter(e => e.category === currentFilter).length; document.getElementById("totalLabel").textContent = currentFilter + "费用小计"; document.getElementById("totalAmount").textContent = "¥" + val.toFixed(1); document.getElementById("totalSub").textContent = "共 " + cnt + " 笔 · 占总费用 " + (total>0?Math.round(val/total*100):0) + "%"; }
      const maxVal = Math.max(...Object.values(bd));
      document.getElementById("categoryChart").innerHTML = cats.map(cat => { const val = bd[cat]; const pct = maxVal>0?(val/maxVal*100):0; return `<div class="chart-row"><span class="chart-label">${cat}</span><div class="chart-track"><div class="chart-fill" style="width:${pct}%;background:${colors[cat]}"></div></div><span class="chart-value">¥${val.toFixed(0)}</span></div>`; }).join("");
    }
    document.querySelectorAll(".filter-pill").forEach(btn => { btn.addEventListener("click", () => { document.querySelectorAll(".filter-pill").forEach(b => b.classList.remove("active")); btn.classList.add("active"); currentFilter = btn.dataset.filter; renderLedger(); }); });
    function renderOverviewCharts() {
      const cats = ["交通","住宿","餐饮","门票","购物","其他"];
      const colors = {"交通":"#4a6fa5","住宿":"#c05e3f","餐饮":"#c08a3e","门票":"#6b8e7a","购物":"#7e6b8f","其他":"#9a9a95"};
      const bd = {}; cats.forEach(c => bd[c] = 0); expenses.forEach(e => bd[e.category] += e.amount);
      const total = expenses.reduce((s,e) => s + e.amount, 0) || 1;
      const pieBox = document.getElementById("pieBox");
      if (pieBox) {
        const cx=80, cy=80, rOuter=66, rInner=44; let angle=-90; let paths=""; let legend="";
        const polar = (r,deg) => { const rad=deg*Math.PI/180; return {x:cx+r*Math.cos(rad), y:cy+r*Math.sin(rad)}; };
        cats.forEach(cat => { const val = bd[cat]; if (val<=0) return; const sweep = val/total*360; const a1=angle, a2=angle+sweep; angle=a2;
          const p1=polar(rOuter,a2), p2=polar(rOuter,a1), p3=polar(rInner,a1), p4=polar(rInner,a2); const largeArc = sweep>180?1:0;
          paths += `<path d="M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} A ${rOuter} ${rOuter} 0 ${largeArc} 0 ${p2.x.toFixed(1)} ${p2.y.toFixed(1)} L ${p3.x.toFixed(1)} ${p3.y.toFixed(1)} A ${rInner} ${rInner} 0 ${largeArc} 1 ${p4.x.toFixed(1)} ${p4.y.toFixed(1)} Z" fill="${colors[cat]}"/>`;
          legend += `<div class="pie-leg"><span class="sw" style="background:${colors[cat]}"></span>${cat}<b>¥${val.toFixed(0)}</b><span class="pct">${Math.round(val/total*100)}%</span></div>`;
        });
        pieBox.innerHTML = `<svg width="160" height="160" viewBox="0 0 160 160">${paths}<text x="80" y="75" text-anchor="middle" font-size="11" fill="#b0b0ab">总计</text><text x="80" y="94" text-anchor="middle" font-size="15" font-weight="700" fill="#2c2c2c">¥${(total*1).toFixed(0)}</text></svg><div id="pieLegend">${legend}</div>`;
      }
      const barBox = document.getElementById("barBox");
      if (barBox) { const maxVal = Math.max(...Object.values(bd)); barBox.innerHTML = cats.map(cat => { const val = bd[cat]; const pct = maxVal>0?(val/maxVal*100):0; return `<div class="bar-row"><span class="lbl">${cat}</span><div class="trk"><div class="fill" style="width:${pct}%;background:${colors[cat]}"></div></div><span class="val">¥${val.toFixed(0)}</span></div>`; }).join(""); }
    }
    document.querySelectorAll("details.info-cell").forEach(d => { d.addEventListener("toggle", () => { if (d.open) { document.querySelectorAll("details.info-cell").forEach(o => { if (o !== d) o.open = false; }); } }); });

// 出行提醒渲染
function renderTips() {
  const box = document.getElementById("tipsBox");
  box.innerHTML = TIPS.map(t => `<div class="tip-item"><span class="tip-icon">${t.icon}</span><span>${t.text}</span></div>`).join("");
}

// Vlog 拍摄计划渲染
function renderVlog() {
  const box = document.getElementById("vlogBox");
  box.innerHTML = VLOG_DAYS.map(v => `<div class="vlog-card"><h3>${v.title}</h3><ul class="shot-list">${v.shots.map(s => `<li>${s}</li>`).join("")}</ul></div>`).join("");
}
