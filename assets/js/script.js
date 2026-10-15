/* =========================================================
   SCRIPT  —  behaviour for the portfolio (vanilla JavaScript)
   Content comes from assets/js/data.js. You normally do not
   need to edit this file.
   ========================================================= */
(function () {
  "use strict";

  // data.js declares `const portfolioData`, which is not a window property, so read it directly.
  var D = (typeof portfolioData !== "undefined") ? portfolioData : null;
  if (!D) { console.error("data.js did not load. Check the path in index.html."); return; }

  var root = document.documentElement;
  root.classList.add("js");

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function chips(arr) { return '<ul class="chips">' + arr.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>"; }
  function list(arr) { return '<ul class="check-list">' + arr.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>"; }

  /* ---------- bind simple data to the page ---------- */
  $$("[data-bind]").forEach(function (el) { if (D[el.dataset.bind] != null) el.textContent = D[el.dataset.bind]; });
  $$("[data-text]").forEach(function (el) { if (D[el.dataset.text]) el.textContent = D[el.dataset.text]; });
  $$("[data-href]").forEach(function (el) { if (D[el.dataset.href]) el.setAttribute("href", D[el.dataset.href]); });
  $$("[data-mailto]").forEach(function (el) { el.setAttribute("href", "mailto:" + D[el.dataset.mailto]); });
  $$("[data-tel]").forEach(function (el) { el.setAttribute("href", "tel:" + String(D[el.dataset.tel]).replace(/\s+/g, "")); });
  $$("[data-src]").forEach(function (el) { if (D[el.dataset.src]) el.setAttribute("src", D[el.dataset.src]); });
  var yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- About ---------- */
  var aboutText = $("#about-text");
  if (aboutText) aboutText.innerHTML = D.aboutParagraphs.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
  var approach = $("#approach-list");
  if (approach) approach.innerHTML = D.approach.map(function (a) {
    return "<li><div><strong>" + esc(a.label) + "</strong><span>" + esc(a.text) + "</span></div></li>";
  }).join("");

  /* ---------- Experience timeline ---------- */
  var timeline = $("#timeline");
  if (timeline) timeline.innerHTML = D.experience.map(function (e, i) {
    var current = /present/i.test(e.end);
    return '<li class="tl-item reveal' + (current ? " current" : "") + '"><article class="tl-card">' +
      '<div class="tl-head"><h3 class="tl-role">' + esc(e.role) + '</h3><p class="tl-date">' + esc(e.start) + " – " + esc(e.end) + "</p></div>" +
      '<p class="tl-company">' + esc(e.company) + ' <span>· ' + esc(e.location) + "</span></p>" +
      '<p class="tl-desc">' + esc(e.description) + "</p>" +
      '<h4 class="tl-sub">Key achievements</h4>' + list(e.achievements) +
      (e.impact ? '<p class="tl-impact"><strong>Business impact.</strong> ' + esc(e.impact) + "</p>" : "") +
      (e.responsibilities && e.responsibilities.length
        ? '<details class="tl-more"><summary>Responsibilities</summary>' + list(e.responsibilities) + "</details>" : "") +
      (e.tools && e.tools.length ? chips(e.tools) : "") +
      "</article></li>";
  }).join("");

  /* ---------- Skills, education ---------- */
  var skills = $("#skills-grid");
  if (skills) skills.innerHTML = D.skills.map(function (g, i) {
    return '<section class="skill-card reveal' + (i === D.skills.length - 1 && D.skills.length % 2 === 1 ? " wide" : "") + '">' +
      "<h3>" + esc(g.group) + "</h3>" + chips(g.items) + "</section>";
  }).join("");
  var edu = $("#edu-list");
  if (edu) edu.innerHTML = D.education.map(function (e) {
    return "<li><strong>" + esc(e.title) + "</strong><small>" + esc(e.place) + " · " + esc(e.date) + "</small></li>";
  }).join("");
  var cert = $("#cert-list");
  if (cert) cert.innerHTML = D.certifications.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("");

  /* ---------- Projects ---------- */
  function placeholder(file) {
    return '<div class="ph" role="img" aria-label="Project image placeholder"><div><b>Project image</b>Add <code>' + esc(file.split("/").pop()) + "</code> to assets/images/</div></div>";
  }
  function imageBlock(p) {
    return '<img src="' + esc(p.image) + '" alt="' + esc(p.imageAlt) + '" loading="lazy" data-file="' + esc(p.image) + '">';
  }
  function wireImageFallbacks(ctx) {
    $$("img[data-file]", ctx).forEach(function (img) {
      function fail() {
        var holder = img.parentNode;
        var tmp = document.createElement("div");
        tmp.innerHTML = placeholder(img.dataset.file);
        holder.replaceChild(tmp.firstChild, img);
      }
      img.addEventListener("error", fail, { once: true });
      if (img.complete && img.naturalWidth === 0) fail();
    });
  }

  var grid = $("#project-grid");
  if (grid) {
    grid.innerHTML = D.projects.map(function (p) {
      var metrics = p.metrics && p.metrics.length
        ? '<div class="card-metrics">' + p.metrics.slice(0, 4).map(function (m) {
            return "<div><strong>" + esc(m.value) + "</strong><span>" + esc(m.label) + "</span></div>";
          }).join("") + "</div>" : "";
      return '<article class="card reveal">' +
        '<div class="card-media">' + imageBlock(p) + "</div>" +
        '<div class="card-body">' +
        '<span class="badge">' + esc(p.status) + "</span>" +
        '<p class="card-cat">' + esc(p.category) + "</p>" +
        "<h3>" + esc(p.name) + "</h3>" +
        '<p class="card-sum">' + esc(p.summary) + "</p>" +
        metrics +
        '<p class="card-label">Skills demonstrated</p>' + chips(p.skills) +
        '<p class="card-label">Tools</p>' + chips(p.tools) +
        '<button type="button" class="btn btn-small" data-case="' + esc(p.id) + '">View Case Study <span aria-hidden="true">→</span><span class="sr-only"> for ' + esc(p.name) + "</span></button>" +
        "</div></article>";
    }).join("");
    wireImageFallbacks(grid);
  }

  /* ---------- Case study dialog ---------- */
  var dlg = $("#case-dialog"), caseBody = $("#case-body"), caseCat = $("#case-cat"), lastTrigger = null;

  function step(n, title, inner) {
    return '<section class="case-step"><span class="n" aria-hidden="true">' + n + "</span><div><h3>" + esc(title) + "</h3>" + inner + "</div></section>";
  }
  function para(t) { return "<p>" + esc(t) + "</p>"; }

  function renderCase(p) {
    caseCat.textContent = p.category;
    var metrics = p.metrics && p.metrics.length
      ? '<div class="metric-row">' + p.metrics.map(function (m) {
          return '<div class="metric"><strong>' + esc(m.value) + "</strong><span>" + esc(m.label) + "</span></div>";
        }).join("") + "</div>" : "";

    caseBody.innerHTML =
      '<span class="badge">' + esc(p.status) + "</span>" +
      '<h2 id="case-title">' + esc(p.name) + "</h2>" +
      para(p.summary) +
      (p.statusNote ? '<p class="case-note">' + esc(p.statusNote) + "</p>" : "") +
      '<div class="case-meta">' +
        '<div class="full"><h3>My role</h3><p>' + esc(p.role) + "</p></div>" +
        "<div><h3>Tools</h3>" + chips(p.tools) + "</div>" +
        "<div><h3>Skills demonstrated</h3>" + chips(p.skills) + "</div>" +
        '<div class="full"><h3>Data source</h3><p>' + esc(p.dataSource) + "</p></div>" +
      "</div>" +
      step("01", "Business problem", para(p.problem)) +
      step("02", "Objective", para(p.objective)) +
      step("03", "Approach", chips(p.approach)) +
      step("04", "Analysis", list(p.analysis)) +
      step("05", "Findings", (p.findingsNote ? '<p class="muted">' + esc(p.findingsNote) + "</p>" : "") + list(p.findings)) +
      step("06", "Recommendations", list(p.recommendations)) +
      step("07", "Outcome", para(p.outcome)) +
      step("08", "Business impact", metrics + para(p.impact)) +
      (p.documents ? '<p class="case-note">' + esc(p.documents) + "</p>" : "") +
      '<figure class="case-img" style="margin-top:24px">' + imageBlock(p) + "</figure>";
    wireImageFallbacks(caseBody);
    caseBody.scrollTop = 0;
  }

  function openCase(id, trigger) {
    var p = D.projects.filter(function (x) { return x.id === id; })[0];
    if (!p || !dlg) return;
    lastTrigger = trigger || null;
    renderCase(p);
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    document.body.classList.add("modal-open");
    try { history.replaceState(null, "", "#case-" + id); } catch (e) {}
  }
  function closeCase() {
    if (!dlg) return;
    if (typeof dlg.close === "function") dlg.close(); else dlg.removeAttribute("open");
  }
  if (dlg) {
    dlg.addEventListener("close", function () {
      document.body.classList.remove("modal-open");
      try { history.replaceState(null, "", "#projects"); } catch (e) {}
      if (lastTrigger) lastTrigger.focus();
    });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) closeCase(); }); // click on backdrop
    $("#case-close").addEventListener("click", closeCase);
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-case]");
    if (b) openCase(b.dataset.case, b);
  });
  var m = /^#case-(.+)$/.exec(location.hash);
  if (m) openCase(m[1], null);

  /* ---------- Theme toggle ---------- */
  var themeBtn = $("#theme-toggle");
  function syncThemeLabel() {
    var dark = root.getAttribute("data-theme") === "dark";
    themeBtn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  }
  if (themeBtn) {
    syncThemeLabel();
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      syncThemeLabel();
    });
  }

  /* ---------- Mobile menu ---------- */
  var menuBtn = $("#menu-toggle"), nav = $("#site-nav");
  function setMenu(open) {
    nav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) { setMenu(false); menuBtn.focus(); }
    });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("open") && !nav.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false);
    });
  }

  /* ---------- Header border on scroll + active link ---------- */
  var header = $(".site-header");
  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 8); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  var links = $$(".site-nav a");
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) {
            var on = a.getAttribute("href") === "#" + en.target.id;
            a.classList.toggle("active", on);
            if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach(function (s) { spy.observe(s); });

    /* ---------- Reveal on scroll ---------- */
    var rv = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("visible"); obs.unobserve(en.target); } });
    }, { threshold: 0.08 });
    $$(".reveal").forEach(function (el) { rv.observe(el); });
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- Contact form (Formspree) ---------- */
  var form = $("#contact-form");
  if (form) {
    if (D.formspreeEndpoint) form.setAttribute("action", D.formspreeEndpoint);
    var status = $("#cf-status"), submit = $("#cf-submit");
    var rules = {
      name: function (v) { return v.trim() ? "" : "Please enter your name."; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Please enter a valid email address."; },
      subject: function (v) { return v.trim() ? "" : "Please enter a subject."; },
      message: function (v) { return v.trim().length >= 10 ? "" : "Please write a message of at least 10 characters."; }
    };
    function setError(name, msg) {
      var input = form.elements[name], err = $("#cf-" + name + "-err"), wrap = input.closest(".field");
      wrap.classList.toggle("invalid", !!msg);
      err.hidden = !msg; err.textContent = msg;
      if (msg) { input.setAttribute("aria-invalid", "true"); input.setAttribute("aria-describedby", err.id); }
      else { input.removeAttribute("aria-invalid"); input.removeAttribute("aria-describedby"); }
    }
    function validate() {
      var firstBad = null;
      Object.keys(rules).forEach(function (n) {
        var msg = rules[n](form.elements[n].value);
        setError(n, msg);
        if (msg && !firstBad) firstBad = form.elements[n];
      });
      return firstBad;
    }
    function show(kind, text) {
      status.hidden = false; status.className = "form-status " + kind; status.textContent = text;
    }
    Object.keys(rules).forEach(function (n) {
      form.elements[n].addEventListener("blur", function () { setError(n, rules[n](form.elements[n].value)); });
      form.elements[n].addEventListener("input", function () { if (form.elements[n].getAttribute("aria-invalid")) setError(n, rules[n](form.elements[n].value)); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.hidden = true;
      var bad = validate();
      if (bad) { bad.focus(); return; }
      if (!D.formspreeEndpoint) {
        show("err", "This copy of the site cannot send messages. Please email me at " + D.email + ".");
        return;
      }

      submit.disabled = true;
      var original = submit.textContent;
      submit.textContent = "Sending…";

      fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            show("ok", "Thank you. Your message has been sent and I will reply soon.");
          } else {
            return res.json().then(function (j) {
              throw new Error(j && j.errors ? j.errors.map(function (x) { return x.message; }).join(", ") : "Request failed");
            }, function () { throw new Error("Request failed"); });
          }
        })
        .catch(function () {
          show("err", "Sorry, your message could not be sent. Please try again, or email me directly at " + D.email + ".");
        })
        .then(function () { submit.disabled = false; submit.textContent = original; });
    });
  }
})();
