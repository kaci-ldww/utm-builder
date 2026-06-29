const BITLY_TOKEN = "2387c61cc46498dc6f1de82aadb610e031ddab0d";

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
const SOURCES = ["facebook","instagram","tiktok","youtube","fbstories","igstories","igbio","fbevent","twitter"];

const CAMPAIGN_PRESETS = [
    { label: "Brand Awareness", campaign: "brandawareness" },
    { label: "Entertainment",   campaign: "entertainment"  },
    { label: "Gaming",          campaign: "gaming"         },
    { label: "Hotel",           campaign: "hotel"          },
    { label: "Golf",            campaign: "golf"           },
    { label: "Amenities",       campaign: "amenities"      }
];

const CONTENT_BY_CAMPAIGN = {
    entertainment:  ["general","announce","onsale","reminder","onsalereminder","presale","upsell","reschedule","reply","postshow","package","cancellation","passporttosummer"],
    brandawareness: ["explorewinstar","general","gozone","wsapp","winstarwinners","passporttosummer","TCUoffer",],
    gaming:         ["general","promotions","cardgames","ballanddice","jackpot","newplayer","inactives","newmember","egames","10kgames","rmg","offer","passporttosummer","clubpassport","influencer"],
    golf:           ["general","academy","courses","membership","proshop","golftournaments","clubhouse","signup","partnership","retail","passporttosummer"],
    hotel:          ["gaming","shuttle","reply","dining","wsapp","offer","passporttosummer"],
    amenities:      ["pool","dining","spa","shopping","events","gaming","shuttle","golf","clubpassport","mywinstar","giveaway","passporttosummer"],
    wildcard:       []
};

const TERM_BY_CAMPAIGN = {
    entertainment:  ["video","reels","photo","carousel","link","stay","dining","still","motion","comment","dm"],
    brandawareness: ["permissionpass","giveaway","stadium","influencer_shl"],
    gaming:         ["poker","craps","palladium","comment","dm","mywinstar","spaoffer","invite","announcement","reminder","gamefinder","promotions","signup","benefits","ladyluck"],
    golf:           ["teetime","instructors","giveaway","comment","dm"],
    hotel:          ["checkin","gamefinder","comment","dm"],
    amenities:      ["granvia","dcbg","lafleur","laparis","vino","ihop","chipsnales","bachelor","bachelorette","weddings","cascades","spaoffer","newmember","winstarwallet"]
};

const OTHER_IDENTIFIERS = ["video","reels","photo","carousel","link","still","motion","a"];
// ─────────────────────────────────────────────

const APPS_SCRIPT = "function doPost(e) {\n  const sheet = SpreadsheetApp.openById(\"YOUR_SHEET_ID\").getActiveSheet();\n  const data = JSON.parse(e.postData.contents);\n  if (sheet.getLastRow() === 0) {\n    sheet.appendRow([\"Timestamp\",\"URL\",\"Source\",\"Medium\",\"Campaign\",\"Content\",\"Term\",\"Other\",\"Full UTM\"]);\n  }\n  sheet.appendRow([new Date().toISOString(), data.url, data.source, data.medium, data.campaign, data.content, data.term, data.other, data.fullUrl]);\n  return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);\n}";

let autoSlug = true, autoLog = false, sheetsUrl = "", history = [];
let artistList = [];

document.getElementById("apps-script-code").textContent = APPS_SCRIPT;

// ── STATIC BUTTON ROWS ────────────────────────

SOURCES.forEach(function(s) {
    var btn = document.createElement("button");
    btn.className = "preset-btn source-btn";
    btn.textContent = s;
    btn.onclick = function() {
        setActive("source-btns", btn);
        document.getElementById("f-source").value = s;
        updatePreview();
    };
    document.getElementById("source-btns").appendChild(btn);
});

CAMPAIGN_PRESETS.forEach(function(p) {
    var btn = document.createElement("button");
    btn.className = "preset-btn campaign";
    btn.textContent = p.label;
    btn.onclick = function() {
        setActive("campaign-btns", btn);
        document.getElementById("f-campaign").value = p.campaign;
        updateCampaignDynamic();
        updatePreview();
    };
    document.getElementById("campaign-btns").appendChild(btn);
});

// ── DYNAMIC BUTTON ROWS ───────────────────────

function updateCampaignDynamic() {
    var campaign = document.getElementById("f-campaign").value.trim().toLowerCase();

    renderBtnRow("content-btns", CONTENT_BY_CAMPAIGN[campaign] || [], "content-btn", function(val) {
        document.getElementById("f-content").value = val;
        updatePreview();
    }, "f-content");

    renderBtnRow("term-btns", TERM_BY_CAMPAIGN[campaign] || [], "term-btn", function(val) {
        document.getElementById("f-term").value = val;
        updatePreview();
    }, "f-term");

    var otherHint = document.getElementById("other-hint");
    var otherContainer = document.getElementById("other-btns");

    if (campaign === "entertainment") {
        otherHint.textContent = "artist — from sheet";
        otherContainer.innerHTML = "";
        var sel = document.createElement("select");
        sel.className = "styled";
        sel.style.maxWidth = "300px";
        var defaultOpt = document.createElement("option");
        defaultOpt.value = "";
        defaultOpt.textContent = artistList.length ? "-- Select artist --" : "Loading artists...";
        sel.appendChild(defaultOpt);
        artistList.forEach(function(a) {
            var opt = document.createElement("option");
            opt.value = a.code; opt.textContent = a.name;
            sel.appendChild(opt);
        });
        sel.onchange = function() {
            document.getElementById("f-other").value = this.value;
            updatePreview();
        };
        otherContainer.appendChild(sel);
    } else {
        otherHint.textContent = "format type";
        renderBtnRow("other-btns", OTHER_IDENTIFIERS, "other-btn", function(val) {
            document.getElementById("f-other").value = val;
            updatePreview();
        }, "f-other");
    }

    document.getElementById("f-content").value = "";
    document.getElementById("f-term").value = "";
    document.getElementById("f-other").value = "";
}

function renderBtnRow(containerId, values, btnClass, onClickFn, fieldId) {
    var container = document.getElementById(containerId);
    container.innerHTML = "";
    if (!values || values.length === 0) {
        container.innerHTML = '<span class="empty-hint">No presets for this campaign</span>';
        return;
    }
    values.forEach(function(val) {
        var btn = document.createElement("button");
        btn.className = "preset-btn " + btnClass;
        btn.textContent = val;
        btn.onclick = function() {
            setActive(containerId, btn);
            document.getElementById(fieldId).value = val;
            onClickFn(val);
        };
        container.appendChild(btn);
    });
}

function setActive(containerId, activeBtn) {
    var container = document.getElementById(containerId);
    container.querySelectorAll(".preset-btn").forEach(function(b) { b.classList.remove("active-sel"); });
    activeBtn.classList.add("active-sel");
}

// ── CORE FUNCTIONS ────────────────────────────

function slugify(str) { return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, ""); }
function fmt(v) { return autoSlug ? slugify(v) : v; }

function getFields() {
    return {
        url:      document.getElementById("f-url").value.trim(),
        source:   document.getElementById("f-source").value.trim(),
        medium:   document.getElementById("f-medium").value.trim(),
        campaign: document.getElementById("f-campaign").value.trim(),
        content:  document.getElementById("f-content").value.trim(),
        term:     document.getElementById("f-term").value.trim(),
        other:    document.getElementById("f-other").value.trim()
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
    if (f.other)    params.set("utm_other",    fmt(f.other));
    var qs = params.toString();
    var base = f.url.includes("?") ? f.url + "&" : f.url + "?";
    return { url: f.url, source: f.source, medium: f.medium, campaign: f.campaign, content: f.content, term: f.term, other: f.other, params: Object.fromEntries(params), full: qs ? base + qs : f.url };
}

function isValid() {
    var f = getFields();
    return !!(f.url && f.source && f.medium && f.campaign);
}

function updatePreview() {
    var valid = isValid();
    document.getElementById("copy-btn").disabled = !valid;
    document.getElementById("shorten-btn").disabled = !isValid();
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

async function shortenUrl(longurl){
    try {
        const response = await fetch("https://api-ssl.bitly.com/v4/shorten", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${BITLY_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ long_url: longurl })
        });
        const data = await response.json();
        return data.link || null;
    } catch (error) {
        console.error("Error shortening URL:", error);
        return null;
    }
}

var lastShortUrl = null;

async function handleShorten() {
    if (!isValid()) return;
    var built = buildURL();
    var btn = document.getElementById("shorten-btn");
    btn.textContent = "Shortening..."; btn.disabled = true;

    var short = await shortenUrl(built.full);
    btn.textContent = "Shorten"; btn.disabled = false;

    if (short) {
        lastShortUrl = short;
        document.getElementById("short-url-display").textContent = short;
        document.getElementById("short-url-card").style.display = "block";
    } else {
        showLogStatus("err", "Bitly error");
        setTimeout(function() { document.getElementById("log-status").style.display = "none"; }, 3000);
    }
}

function copyShortUrl() {
    if (!lastShortUrl) return;
    navigator.clipboard.writeText(lastShortUrl);
    var btn = document.getElementById("copy-short-btn");
    btn.textContent = "Copied!";
    setTimeout(function() { btn.textContent = "Copy Short URL"; }, 2000);
}

async function handleCopy() {
    if (!isValid()) return;
    var built = buildURL();
    navigator.clipboard.writeText(built.full);
    var btn = document.getElementById("copy-btn");
    btn.textContent = "Copied!"; btn.classList.add("copied");
    setTimeout(function() { btn.textContent = "Copy URL"; btn.classList.remove("copied"); }, 2000);
    var entry = { url: built.full, baseUrl: built.url, params: { utm_source: built.source, utm_medium: built.medium, utm_campaign: built.campaign, utm_content: built.content, utm_term: built.term, utm_other: built.other }, ts: Date.now(), logged: false };
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
            body: JSON.stringify({ url: entry.baseUrl, source: entry.params.utm_source, medium: entry.params.utm_medium, campaign: entry.params.utm_campaign, content: entry.params.utm_content || "", term: entry.params.utm_term || "", other: entry.params.utm_other || "", fullUrl: entry.url }) });
        return true;
    } catch(e) { return false; }
}

function resetForm() {
    ["f-url","f-source","f-campaign","f-content","f-term","f-other"].forEach(function(id) { document.getElementById(id).value = ""; });
    document.getElementById("f-medium").value = "social";
    document.querySelectorAll(".preset-btn").forEach(function(b) { b.classList.remove("active-sel"); });
    document.getElementById("content-btns").innerHTML = '<span class="empty-hint">Select a campaign first</span>';
    document.getElementById("term-btns").innerHTML = '<span class="empty-hint">Select a campaign first</span>';
    document.getElementById("other-btns").innerHTML = '<span class="empty-hint">Select a campaign first</span>';
    document.getElementById("other-hint").textContent = "based on campaign";
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
        var truncUrl = item.url.length > 72 ? item.url.slice(0, 72) + "..." : item.url;
        var sheetBtn = sheetsUrl ? '<button class="btn-mini' + (item.logged ? " logged" : "") + '" id="hlog-' + i + '" onclick="logHistoryItem(' + i + ')">' + (item.logged ? "Logged" : "Sheet") + '</button>' : "";
        return '<div class="history-item"><div class="history-info"><div class="history-tags">' + (item.params.utm_source||"") + ' / ' + (item.params.utm_medium||"") + ' / ' + (item.params.utm_campaign||"") + '</div><div class="history-url">' + truncUrl + '</div></div><div class="history-actions"><button class="btn-mini" onclick="loadHistory(' + i + ')">Load</button><button class="btn-mini" id="hcopy-' + i + '" onclick="copyHistoryItem(' + i + ')">Copy</button>' + sheetBtn + '</div></div>';
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
    document.getElementById("f-medium").value = item.params.utm_medium || "social";
    document.getElementById("f-campaign").value = item.params.utm_campaign || "";
    document.getElementById("f-content").value = item.params.utm_content || "";
    document.getElementById("f-term").value = item.params.utm_term || "";
    document.getElementById("f-other").value = item.params.utm_other || "";
    updateCampaignDynamic();
    switchTab("builder"); updatePreview();
}

function updateSaveBtn() { document.getElementById("save-sheets-btn").disabled = !document.getElementById("sheets-url-input").value.trim(); }

function saveSheets() {
    sheetsUrl = document.getElementById("sheets-url-input").value.trim();
    if (sheetsUrl) {
        localStorage.setItem("utm_social_sheets_url", sheetsUrl);
    } else {
        localStorage.removeItem("utm_social_sheets_url");
    }
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

// Load artists via JSONP to avoid CORS issues
function loadArtists() {
    var script = document.createElement("script");
    script.src = "https://script.google.com/macros/s/AKfycbxG2_S7Q0uyow0_25nOt8cleBkWTlwpJ9XJDpXoXIhuN69mbhsxpHVx0redJjmWMxg9Tg/exec?callback=handleArtists";
    document.body.appendChild(script);
}

function handleArtists(artists) {
    artistList = artists;
    // If entertainment is already selected, re-render the dropdown
    var campaign = document.getElementById("f-campaign").value.trim().toLowerCase();
    if (campaign === "entertainment") updateCampaignDynamic();
}

loadArtists();

updateHistoryTab();

// Restore saved Sheets URL from localStorage
(function() {
    var saved = localStorage.getItem("utm_social_sheets_url");
    if (saved) {
        sheetsUrl = saved;
        document.getElementById("sheets-url-input").value = saved;
        document.getElementById("sheets-connected").style.display = "flex";
        document.getElementById("autolog-row").style.display = "flex";
        updateHistoryTab();
    }
})();
