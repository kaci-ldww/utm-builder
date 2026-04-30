const CLIENTS = [
    { label: "WinStar",        code: "ws"    },
    { label: "Riverwind",      code: "rw"    },
    { label: "Newcastle",      code: "nc"    },
    { label: "Goldsby Gaming", code: "ggc"   },
    { label: "Quvia",          code: "quvia" }
];

// Per-client artist feed URLs (only clients with entertainment/artist dropdown need one)
const ARTIST_FEED_URLS = {
    ws: "https://script.google.com/macros/s/AKfycbxG2_S7Q0uyow0_25nOt8cleBkWTlwpJ9XJDpXoXIhuN69mbhsxpHVx0redJjmWMxg9Tg/exec?callback=handleArtists",
    rw: "https://script.google.com/macros/s/AKfycbxUshCx5hj5Chj_nsalvL7f1rNqw26HhPuVnwj4k_Duq0LJJxsZ0Wlft5p_SJS7I6Hf/exec?callback=handleArtists"
};

const CLIENT_CONFIG = {
    ws: {
        drivers: [
            { label: "Entertainment",   code: "ent",            utmCampaign: "entertainment",
                content: ["presale","onsale","ticketpush_genre","ticketpush_hotel","ttgt","postshow","bogo","rescheduled","canceled","giveaway"],
                desc: "artist_dropdown", type2: [] },
            { label: "Gaming",          code: "gaming",         utmCampaign: "gaming",
                content: ["promotion","mywinstar","clubpassport","influencer"],
                desc: ["membership","awareness","ladyluck"], type2: ["newmember","uncarded","carded"] },
            { label: "Brand Awareness", code: "brandawareness", utmCampaign: "brandawareness",
                content: ["reengagement","gozone","welcome","giveaway"],
                desc: ["reengagement1","reengagement2","reengagement3"], type2: [] },
            { label: "Amenities",       code: "amenities",      utmCampaign: "hotel",
                content: ["hotel","spa","pool","dining","meet"],
                desc: ["retailpackage","conventions","weddings","catering","prestay1","prestay2"], type2: ["couples"] },
            { label: "Golf",            code: "golf",           utmCampaign: "golf",
                content: ["instruction","retailpackage","membership","tournaments"],
                desc: ["email1","email2","email3"], type2: [] }
        ]
    },
    rw: {
        drivers: [
            { label: "Brand Awareness", code: "brandawareness", utmCampaign: "brandawareness",
                content: ["reengagement","gozone","welcome","giveaway"],
                desc: ["reengagement1","reengagement2","reengagement3"], type2: ["header","footer"] },
            { label: "Entertainment",   code: "ent",            utmCampaign: "entertainment",
                content: ["presale","onsale","ticketpush","knowbeforeyougo","postshow","bogo","rescheduled","canceled","giveaway"],
                desc: "artist_dropdown", type2: ["header","footer","vip","encore"] },
            { label: "Gaming",          code: "gaming",         utmCampaign: "gaming",
                content: ["promotion","wildcard","rwaccount"],
                desc: ["membership","awareness","promo"], type2: ["newmember","uncarded","carded","header","footer"] },
            { label: "Amenities",       code: "amenities",      utmCampaign: "amenities",
                content: ["hotel"],
                desc: ["prestay1","prestay2","giveaway"], type2: [], type2freetext: true }
        ]
    },
    nc: {
        drivers: [
            { label: "Brand Awareness", code: "brandawareness", utmCampaign: "brandawareness",
                content: ["reengagement","gozone","welcome","giveaway"],
                desc: ["reengagement1","reengagement2","reengagement3"], type2: ["header","footer"] },
            { label: "Gaming",          code: "gaming",         utmCampaign: "gaming",
                content: ["promotion","reelrewards","ncaccount"],
                desc: ["membership","awareness","promo"], type2: ["vip","newmember","uncarded","carded","header","footer"] }
        ]
    },
    ggc: {
        drivers: [
            { label: "Brand Awareness", code: "brandawareness", utmCampaign: "brandawareness",
                content: ["reengagement","welcome","promotion","general"],
                desc: ["reengagement1","reengagement2","reengagement3"], type2: ["header","footer"] },
            { label: "Gaming",          code: "gaming",         utmCampaign: "gaming",
                content: ["promotion","playersclub","general"],
                desc: ["membership","awareness","promo"], type2: ["vip","newmember","uncarded","carded","header","footer"] }
        ]
    },
    quvia: {
        drivers: [
            { label: "Brand Awareness", code: "brandawareness", utmCampaign: "brandawareness",
                content: ["general","webinar","productlaunch","onboarding","event","survey","reengagement"],
                desc: ["preevent","postevent","reengagement1","reengagement2","reengagement3","followup","reminder"],
                type2: ["broad"] }
        ]
    }
};

const APPS_SCRIPT =
    "function doPost(e) {\n" +
    "  const data = JSON.parse(e.postData.contents);\n" +
    "  const ss = SpreadsheetApp.openById(\"YOUR_SHEET_ID\");\n" +
    "  const sheet = ss.getActiveSheet();\n" +
    "  if (sheet.getLastRow() === 0) {\n" +
    "    sheet.appendRow([\"Timestamp\", \"Client\", \"Email Name\", \"URL\", \"Source\", \"Medium\", \"Campaign\", \"Content\", \"Term\", \"Full UTM\"]);\n" +
    "  }\n" +
    "  sheet.appendRow([\n" +
    "    new Date().toISOString(),\n" +
    "    data.client || \"\",\n" +
    "    data.emailName || \"\",\n" +
    "    data.url,\n" +
    "    data.source,\n" +
    "    data.medium,\n" +
    "    data.campaign,\n" +
    "    data.content,\n" +
    "    data.term,\n" +
    "    data.fullUrl\n" +
    "  ]);\n" +
    "  return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);\n" +
    "}\n" +
    "\n" +
    "function doGet(e) {\n" +
    "  if (e.parameter.action === \"getSerial\") {\n" +
    "    const ss = SpreadsheetApp.openById(\"YOUR_SHEET_ID\");\n" +
    "    let countersSheet = ss.getSheetByName(\"Counters\");\n" +
    "    if (!countersSheet) {\n" +
    "      countersSheet = ss.insertSheet(\"Counters\");\n" +
    "      countersSheet.appendRow([\"key\", \"count\"]);\n" +
    "    }\n" +
    "    const rows = countersSheet.getDataRange().getValues();\n" +
    "    let rowIndex = -1;\n" +
    "    for (let i = 1; i < rows.length; i++) {\n" +
    "      if (rows[i][0] === e.parameter.key) {\n" +
    "        rowIndex = i + 1;\n" +
    "        break;\n" +
    "      }\n" +
    "    }\n" +
    "    let newCount;\n" +
    "    if (rowIndex === -1) {\n" +
    "      newCount = 1;\n" +
    "      countersSheet.appendRow([e.parameter.key, newCount]);\n" +
    "    } else {\n" +
    "      newCount = rows[rowIndex - 1][1] + 1;\n" +
    "      countersSheet.getRange(rowIndex, 2).setValue(newCount);\n" +
    "    }\n" +
    "    return ContentService.createTextOutput(JSON.stringify({ success: true, serial: newCount })).setMimeType(ContentService.MimeType.JSON);\n" +
    "  }\n" +
    "}";

let autoSlug = true, autoLog = false, sheetsUrl = "", history = [];
// Per-client artist cache: { ws: [...], rw: [...] }
let artistCache = {};
let en = { client: "", clientCode: "", driver: "", driverConfig: null, emailType: "", content: "", desc: "", type2: "", month: "", jobId: ""};

document.getElementById("apps-script-code").textContent = APPS_SCRIPT;

// ── ARTIST LOADING (per-client) ───────────────

function loadArtistsForClient(clientCode) {
    var url = ARTIST_FEED_URLS[clientCode];
    if (!url) return; // no artist feed for this client
    if (artistCache[clientCode]) return; // already loaded
    // inject a JSONP script tag; response calls handleArtists(data)
    // We need to know which client the response is for, so we temporarily
    // tag the pending client code on a flag the callback can read.
    window.__pendingArtistClient = clientCode;
    var script = document.createElement("script");
    script.src = url;
    document.body.appendChild(script);
}

function handleArtists(artists) {
    var clientCode = window.__pendingArtistClient || "";
    if (clientCode) {
        artistCache[clientCode] = artists;
        window.__pendingArtistClient = null;
    }
    // If the currently selected client+driver is waiting for this data, re-render
    if (en.clientCode === clientCode && en.driverConfig && en.driverConfig.desc === "artist_dropdown") {
        renderEnDescBtns(en.driverConfig);
    }
}

function getArtistList(clientCode) {
    return artistCache[clientCode] || [];
}

// ── CLIENT BUTTONS ────────────────────────────
CLIENTS.forEach(function(c) {
    var btn = document.createElement("button");
    btn.className = "preset-btn client-btn";
    btn.textContent = c.label;
    btn.onclick = function() {
        setActive("client-btns", btn);
        en.client = c.label;
        en.clientCode = c.code;
        en.driver = ""; en.driverConfig = null;
        en.emailType = ""; en.content = ""; en.desc = ""; en.type2 = "";
        en.jobId = "";
        updateJobIdButton();
        // Pre-fetch artist list for this client if it has one
        loadArtistsForClient(c.code);
        renderDriverBtns(c.code);
        renderEmailTypeBtns();
        document.getElementById("en-content-btns").innerHTML = '<span class="empty-hint">Select a business driver first</span>';
        document.getElementById("en-desc-btns").innerHTML = '<span class="empty-hint">Select a business driver first</span>';
        document.getElementById("type2-section").style.display = "none";
        document.getElementById("type2-btns").innerHTML = "";
        buildEmailName();
    };
    document.getElementById("client-btns").appendChild(btn);
});

function renderDriverBtns(clientCode) {
    var container = document.getElementById("driver-btns");
    container.innerHTML = "";
    var drivers = (CLIENT_CONFIG[clientCode] || {}).drivers || [];
    drivers.forEach(function(d) {
        var btn = document.createElement("button");
        btn.className = "preset-btn driver-btn";
        btn.textContent = d.label;
        btn.onclick = function() {
            setActive("driver-btns", btn);
            en.driver = d.code; en.driverConfig = d;
            en.content = ""; en.desc = ""; en.type2 = "";
            en.job = "";
            updateJobIdButton();
            renderEnContentBtns(d);
            renderEnDescBtns(d);
            renderType2Btns(d);
            buildEmailName();
        };
        container.appendChild(btn);
    });
}

function renderEmailTypeBtns() {
    var container = document.getElementById("emailtype-btns");
    container.innerHTML = "";
    ["adhoc","automation","newsletter"].forEach(function(val) {
        var btn = document.createElement("button");
        btn.className = "preset-btn emailtype-btn";
        btn.textContent = val;
        btn.onclick = function() { setActive("emailtype-btns", btn); en.emailType = val; buildEmailName(); };
        container.appendChild(btn);
    });
}

function renderEnContentBtns(d) {
    var container = document.getElementById("en-content-btns");
    container.innerHTML = "";
    var options = d.content || [];
    if (!options.length) { container.innerHTML = '<span class="empty-hint">No content options for this driver</span>'; return; }
    options.forEach(function(val) {
        var btn = document.createElement("button");
        btn.className = "preset-btn content-btn";
        btn.textContent = val;
        btn.onclick = function() { setActive("en-content-btns", btn); en.content = val; buildEmailName(); };
        container.appendChild(btn);
    });
}

function renderEnDescBtns(d) {
    var container = document.getElementById("en-desc-btns");
    container.innerHTML = "";
    en.desc = "";
    if (d.desc === "artist_dropdown") {
        var artists = getArtistList(en.clientCode);
        var sel = document.createElement("select");
        sel.className = "styled"; sel.style.maxWidth = "300px";
        var defOpt = document.createElement("option");
        defOpt.value = "";
        defOpt.textContent = artists.length ? "-- Select artist --" : "Loading artists...";
        sel.appendChild(defOpt);
        artists.forEach(function(a) {
            var opt = document.createElement("option");
            opt.value = a.code; opt.textContent = a.name;
            sel.appendChild(opt);
        });
        sel.onchange = function() { en.desc = this.value; buildEmailName(); };
        container.appendChild(sel);
        return;
    }
    var options = d.desc || [];
    if (!options.length) { container.innerHTML = '<span class="empty-hint">No description options for this driver</span>'; return; }
    options.forEach(function(val) {
        var btn = document.createElement("button");
        btn.className = "preset-btn desc-btn";
        btn.textContent = val;
        btn.onclick = function() { setActive("en-desc-btns", btn); en.desc = val; buildEmailName(); };
        container.appendChild(btn);
    });
}

function renderType2Btns(d) {
    var section = document.getElementById("type2-section");
    var container = document.getElementById("type2-btns");
    en.type2 = "";
    container.innerHTML = "";
    if (d.type2freetext) {
        section.style.display = "block";
        var input = document.createElement("input");
        input.type = "text";
        input.placeholder = "type optional modifier";
        input.style.maxWidth = "200px";
        input.oninput = function() { en.type2 = this.value; buildEmailName(); };
        container.appendChild(input);
        return;
    }
    var options = d.type2 || [];
    if (!options.length) { section.style.display = "none"; return; }
    section.style.display = "block";
    options.forEach(function(val) {
        var btn = document.createElement("button");
        btn.className = "preset-btn type2-btn";
        btn.textContent = val;
        btn.onclick = function() {
            if (en.type2 === val) { btn.classList.remove("active-sel"); en.type2 = ""; }
            else { container.querySelectorAll(".preset-btn").forEach(function(b) { b.classList.remove("active-sel"); }); btn.classList.add("active-sel"); en.type2 = val; }
            buildEmailName();
        };
        container.appendChild(btn);
    });
}

function updateJobIdButton() {
    var btn = document.getElementById("btn-generate-jobid");
    var useBtn = document.getElementById("en-use-btn");
    if (!btn) return;
    btn.disabled = !(en.clientCode && en.driver);
    useBtn.disabled = !en.jobId;
    buildEmailName();
}

function generateJobId() {
    if (!en.clientCode || !en.driver) return;
    var btn = document.getElementById("btn-generate-jobid");
    btn.textContent = "Generating...";
    btn.disabled = true;
    var key = en.clientCode + "_" + en.driver;
    var driverShort = en.driver.slice(0, 3).toLowerCase();
    var callbackName = "jsonp_cb_" + Date.now();
    var script = document.createElement("script");
    window[callbackName] = function(json) {
        delete window[callbackName];
        document.body.removeChild(script);
        if (json.success) {
            en.jobId = en.clientCode + "-" + driverShort + "-" + json.serial;
            btn.textContent = "Regenerate Job ID";
            btn.disabled = false;
            updateJobIdButton();
        } else {
            btn.textContent = "Error — Retry";
            btn.disabled = false;
        }
    };
    script.src = sheetsUrl + "?action=getSerial&key=" + encodeURIComponent(key) + "&callback=" + callbackName;
    script.onerror = function() {
        delete window[callbackName];
        document.body.removeChild(script);
        btn.textContent = "Error — Retry";
        btn.disabled = false;
    };
    document.body.appendChild(script);
}

function buildEmailName() {
    en.month = document.getElementById("en-month").value;
    var prefix = en.clientCode || "";
    var parts = [prefix, en.driver, en.emailType, en.content, en.desc];
    if (en.type2) parts.push(en.type2);
    parts.push(en.month);
    var filtered = parts.filter(function(p) { return p && p.trim() !== ""; });
    var name = filtered.join("_");
    if (en.jobId) name = name + "_" + en.jobId;
    var preview = document.getElementById("en-preview");
    var copyBtn = document.getElementById("en-copy-btn");
    var useBtn = document.getElementById("en-use-btn");
    if (filtered.length > 1) {
        preview.textContent = name; preview.classList.remove("empty");
        copyBtn.disabled = false; useBtn.disabled = false;
    } else {
        preview.textContent = "Fill in the fields above to generate your email name";
        preview.classList.add("empty");
        copyBtn.disabled = true; useBtn.disabled = true;
    }
}

function copyEmailName() {
    var name = document.getElementById("en-preview").textContent;
    if (!name || document.getElementById("en-preview").classList.contains("empty")) return;
    navigator.clipboard.writeText(name);
    var btn = document.getElementById("en-copy-btn");
    btn.textContent = "Copied!"; btn.classList.add("copied");
    setTimeout(function() { btn.textContent = "Copy Name"; btn.classList.remove("copied"); }, 2000);
}

function useEmailName() {
    var preview = document.getElementById("en-preview");
    if (!preview || preview.classList.contains("empty")) return;
    var d = en.driverConfig;
    if (d) document.getElementById("f-campaign").value = d.utmCampaign || en.driver;
    if (en.emailType) document.getElementById("f-source").value = en.emailType;
    if (en.content) document.getElementById("f-content").value = en.content;
    var termParts = [en.desc, en.type2].filter(function(p) { return p && p.trim() !== ""; });
    document.getElementById("f-term").value = termParts.join("_");

    if (en.jobId) {
        var termVal = document.getElementById("f-term").value.trim();
        var contentVal = document.getElementById("f-content").value.trim();
        if (termVal) {
            document.getElementById("f-term").value = termVal + "_" + en.jobId;
        } else if (contentVal) {
            document.getElementById("f-content").value = contentVal + "_" + en.jobId;
        } else {
            var campaignVal = document.getElementById("f-campaign").value.trim();
            document.getElementById("f-campaign").value = campaignVal + "_" + en.jobId;
        }
    }

    updatePreview();
    document.getElementById("f-url").scrollIntoView({ behavior: "smooth", block: "center" });
}

function slugify(str) { return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, ""); }
function fmt(v) { return autoSlug ? slugify(v) : v; }

function getFields() {
    return {
        url:      document.getElementById("f-url").value.trim(),
        source:   document.getElementById("f-source").value.trim(),
        medium:   document.getElementById("f-medium").value.trim(),
        campaign: document.getElementById("f-campaign").value.trim(),
        content:  document.getElementById("f-content").value.trim(),
        term:     document.getElementById("f-term").value.trim()
    };
}

function buildURL() {
    var f = getFields();
    if (!f.url) return { url: "", full: "", params: {} };
    var params = new URLSearchParams();
    if (f.source)   params.set("utm_source",   fmt(f.source));
    if (f.medium)   params.set("utm_medium",   fmt(f.medium));
    if (f.campaign) params.set("utm_campaign", fmt(f.campaign));
    if (f.content)  params.set("utm_content",  fmt(f.content));
    if (f.term)     params.set("utm_term",     fmt(f.term));
    var qs = params.toString();
    var base = f.url.includes("?") ? f.url + "&" : f.url + "?";
    return { url: f.url, source: f.source, medium: f.medium, campaign: f.campaign, content: f.content, term: f.term, params: Object.fromEntries(params), full: qs ? base + qs : f.url };
}

function isValid() { var f = getFields(); return !!(f.url && f.source && f.medium && f.campaign); }

function updatePreview() {
    var valid = isValid();
    document.getElementById("copy-btn").disabled = !valid;
    var built = buildURL();
    var previewCard = document.getElementById("preview-card");
    if (!built.url) { previewCard.style.display = "none"; return; }
    previewCard.style.display = "block";
    previewCard.className = "card" + (valid ? " valid" : "");
    var label = document.getElementById("preview-label");
    label.textContent = valid ? "Generated URL" : "Preview - complete required fields";
    label.className = "preview-label " + (valid ? "valid" : "invalid");
    var parts = built.full.split("?");
    var html = '<span class="c-base">' + parts[0] + '</span>';
    if (parts[1]) {
        html += '<span class="c-sep">?</span>';
        parts[1].split("&").forEach(function(part, i) {
            var kv = part.split("=");
            if (i > 0) html += '<span class="c-sep">&amp;</span>';
            html += '<span class="c-key">' + kv[0] + '</span><span class="c-sep">=</span><span class="c-val">' + decodeURIComponent(kv[1] || "") + '</span>';
        });
    }
    document.getElementById("url-preview").innerHTML = html;
}

async function handleCopy() {
    if (!isValid()) return;
    var built = buildURL();
    navigator.clipboard.writeText(built.full);
    var btn = document.getElementById("copy-btn");
    btn.textContent = "Copied!"; btn.classList.add("copied");
    setTimeout(function() { btn.textContent = "Copy URL"; btn.classList.remove("copied"); }, 2000);
    var emailName = document.getElementById("en-preview").classList.contains("empty") ? "" : document.getElementById("en-preview").textContent;
    var entry = { url: built.full, baseUrl: built.url, client: en.client, emailName: emailName, params: { utm_source: built.source, utm_medium: built.medium, utm_campaign: built.campaign, utm_content: built.content, utm_term: built.term }, ts: Date.now(), logged: false };
    if (sheetsUrl && autoLog) {
        showLogStatus("loading", "Logging...");
        var ok = await logToSheets(entry);
        entry.logged = ok;
        showLogStatus(ok ? "ok" : "err", ok ? "Logged to Sheet" : "Sheet error");
        setTimeout(function() { document.getElementById("log-status").style.display = "none"; }, 3000);
    }
    history.unshift(entry);
    if (history.length > 20) history.pop();
    updateHistoryTab();
}

function showLogStatus(type, msg) {
    var el = document.getElementById("log-status");
    el.style.display = "inline"; el.className = "log-status " + type; el.textContent = msg;
}

async function logToSheets(entry) {
    if (!sheetsUrl) return false;
    try {
        await fetch(sheetsUrl, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ client: entry.client || "", emailName: entry.emailName || "", url: entry.baseUrl, source: entry.params.utm_source, medium: entry.params.utm_medium, campaign: entry.params.utm_campaign, content: entry.params.utm_content || "", term: entry.params.utm_term || "", fullUrl: entry.url }) });
        return true;
    } catch(e) { return false; }
}

function resetForm() {
    en.jobId = "";
    var jobBtn = document.getElementById("btn-generate-jobid");
    if (jobBtn) { jobBtn.textContent = "Generate Job ID"; jobBtn.disabled = true; }
    en = { client: "", clientCode: "", driver: "", driverConfig: null, emailType: "", content: "", desc: "", type2: "", month: "" };
    document.querySelectorAll(".preset-btn").forEach(function(b) { b.classList.remove("active-sel"); });
    document.getElementById("driver-btns").innerHTML = '<span class="empty-hint">Select a client first</span>';
    document.getElementById("emailtype-btns").innerHTML = '<span class="empty-hint">Select a client first</span>';
    document.getElementById("en-content-btns").innerHTML = '<span class="empty-hint">Select a business driver first</span>';
    document.getElementById("en-desc-btns").innerHTML = '<span class="empty-hint">Select a business driver first</span>';
    document.getElementById("type2-section").style.display = "none";
    document.getElementById("type2-btns").innerHTML = "";
    document.getElementById("en-month").value = "";
    document.getElementById("en-preview").textContent = "Fill in the fields above to generate your email name";
    document.getElementById("en-preview").classList.add("empty");
    document.getElementById("en-copy-btn").disabled = true;
    document.getElementById("en-use-btn").disabled = true;
    ["f-url","f-source","f-campaign","f-content","f-term"].forEach(function(id) { document.getElementById(id).value = ""; });
    document.getElementById("f-medium").value = "email";
    document.getElementById("preview-card").style.display = "none";
    document.getElementById("copy-btn").disabled = true;
    document.getElementById("log-status").style.display = "none";
}

function toggleSlug() { autoSlug = !autoSlug; document.getElementById("toggle-slug").classList.toggle("on", autoSlug); updatePreview(); }
function toggleAutoLog() { autoLog = !autoLog; document.getElementById("toggle-autolog").classList.toggle("on", autoLog); }

function updateHistoryTab() {
    var el = document.getElementById("history-list");
    document.getElementById("tab-history").textContent = history.length ? "History (" + history.length + ")" : "History";
    if (history.length === 0) { el.innerHTML = '<div class="empty-state"><div class="empty-icon">&#128203;</div><div class="empty-text">No UTMs generated yet.</div></div>'; return; }
    var rows = history.map(function(item, i) {
        var truncUrl = item.url.length > 72 ? item.url.slice(0,72) + "..." : item.url;
        var sheetBtn = sheetsUrl ? '<button class="btn-mini' + (item.logged ? " logged" : "") + '" id="hlog-' + i + '" onclick="logHistoryItem(' + i + ')">' + (item.logged ? "Logged" : "Sheet") + '</button>' : "";
        return '<div class="history-item"><div class="history-info"><div class="history-tags">' + (item.client ? item.client + ' · ' : '') + (item.params.utm_source||"") + ' / ' + (item.params.utm_medium||"") + ' / ' + (item.params.utm_campaign||"") + '</div><div class="history-url">' + truncUrl + '</div></div><div class="history-actions"><button class="btn-mini" onclick="loadHistory(' + i + ')">Load</button><button class="btn-mini" id="hcopy-' + i + '" onclick="copyHistoryItem(' + i + ')">Copy</button>' + sheetBtn + '</div></div>';
    });
    el.innerHTML = '<div class="history-meta"><span>' + history.length + ' link' + (history.length !== 1 ? "s" : "") + ' this session</span><button class="btn-ghost" onclick="clearHistory()">Clear all</button></div>' + rows.join("");
}

function clearHistory() { history = []; updateHistoryTab(); }

function copyHistoryItem(i) {
    navigator.clipboard.writeText(history[i].url);
    var btn = document.getElementById("hcopy-" + i);
    btn.textContent = "Copied"; btn.classList.add("green");
    setTimeout(function() { btn.textContent = "Copy"; btn.classList.remove("green"); }, 1500);
}

async function logHistoryItem(i) {
    if (history[i].logged) return;
    var btn = document.getElementById("hlog-" + i);
    btn.textContent = "...";
    var ok = await logToSheets(history[i]);
    if (ok) { history[i].logged = true; btn.textContent = "Logged"; btn.classList.add("logged"); }
    else { btn.textContent = "Sheet"; }
}

function loadHistory(i) {
    var item = history[i];
    document.getElementById("f-url").value = item.baseUrl || item.url.split("?")[0];
    document.getElementById("f-source").value = item.params.utm_source || "";
    document.getElementById("f-medium").value = item.params.utm_medium || "email";
    document.getElementById("f-campaign").value = item.params.utm_campaign || "";
    document.getElementById("f-content").value = item.params.utm_content || "";
    document.getElementById("f-term").value = item.params.utm_term || "";
    switchTab("builder"); updatePreview();
}

function updateSaveBtn() { document.getElementById("save-sheets-btn").disabled = !document.getElementById("sheets-url-input").value.trim(); }

function saveSheets() {
    sheetsUrl = document.getElementById("sheets-url-input").value.trim();
    if (sheetsUrl) { localStorage.setItem("utm_email_sheets_url", sheetsUrl); }
    else { localStorage.removeItem("utm_email_sheets_url"); }
    document.getElementById("sheets-connected").style.display = "flex";
    document.getElementById("autolog-row").style.display = "flex";
    var btn = document.getElementById("save-sheets-btn");
    btn.textContent = "Saved!";
    setTimeout(function() { btn.textContent = "Save & Connect"; }, 2000);
    updateHistoryTab();
}

function copyScript() {
    navigator.clipboard.writeText(APPS_SCRIPT);
    var btn = document.getElementById("copy-script-btn");
    btn.textContent = "Copied"; btn.classList.add("copied");
    setTimeout(function() { btn.textContent = "Copy"; btn.classList.remove("copied"); }, 2000);
}

function switchTab(tab) {
    document.querySelectorAll(".tab-btn").forEach(function(btn, i) { btn.classList.toggle("active", ["builder","history","sheets"][i] === tab); });
    document.querySelectorAll(".panel").forEach(function(p) { p.classList.remove("active"); });
    document.getElementById("panel-" + tab).classList.add("active");
    if (tab === "history") updateHistoryTab();
}

function setActive(containerId, activeBtn) {
    var container = document.getElementById(containerId);
    container.querySelectorAll(".preset-btn").forEach(function(b) { b.classList.remove("active-sel"); });
    activeBtn.classList.add("active-sel");
}

buildEmailName();
updateHistoryTab();

(function() {
    var saved = localStorage.getItem("utm_email_sheets_url");
    if (saved) {
        sheetsUrl = saved;
        document.getElementById("sheets-url-input").value = saved;
        document.getElementById("sheets-connected").style.display = "flex";
        document.getElementById("autolog-row").style.display = "flex";
        updateHistoryTab();
    }
})();