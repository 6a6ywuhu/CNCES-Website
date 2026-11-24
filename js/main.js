(function () {
  "use strict";

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", String(!isOpen));
      toggle.setAttribute("aria-expanded", String(!isOpen));
      toggle.setAttribute("aria-label", !isOpen ? "Close menu" : "Open menu");
    });
  }

  var dropdowns = document.querySelectorAll(".has-dropdown");
  dropdowns.forEach(function (dropdown) {
    var button = dropdown.querySelector(".dropdown-toggle");
    if (!button) return;

    function open() {
      dropdown.setAttribute("data-open", "true");
      button.setAttribute("aria-expanded", "true");
    }
    function close() {
      dropdown.setAttribute("data-open", "false");
      button.setAttribute("aria-expanded", "false");
    }

    button.addEventListener("click", function () {
      var isOpen = dropdown.getAttribute("data-open") === "true";
      dropdowns.forEach(close);
      if (!isOpen) open();
    });

    // Desktop hover support
    dropdown.addEventListener("mouseenter", function () {
      if (window.innerWidth >= 960) open();
    });
    dropdown.addEventListener("mouseleave", function () {
      if (window.innerWidth >= 960) close();
    });
  });

  document.addEventListener("click", function (e) {
    dropdowns.forEach(function (dropdown) {
      if (!dropdown.contains(e.target)) {
        dropdown.setAttribute("data-open", "false");
        var btn = dropdown.querySelector(".dropdown-toggle");
        if (btn) btn.setAttribute("aria-expanded", "false");
      }
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      dropdowns.forEach(function (dropdown) {
        dropdown.setAttribute("data-open", "false");
        var btn = dropdown.querySelector(".dropdown-toggle");
        if (btn) btn.setAttribute("aria-expanded", "false");
      });
      if (nav && nav.getAttribute("data-open") === "true" && toggle) {
        nav.setAttribute("data-open", "false");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      }
    }
  });

  // Close mobile menu when a nav link (not a dropdown toggle) is activated
  if (nav) {
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.innerWidth < 960 && nav.getAttribute("data-open") === "true") {
          nav.setAttribute("data-open", "false");
          if (toggle) {
            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("aria-label", "Open menu");
          }
        }
      });
    });
  }
})();


// Jobber request form. Every request button on the site (data-jobber="general") opens this form.
// Paste the form's link from Jobber: Settings > Requests and Bookings > ... > Share links > Copy link.
// Until the link is pasted, the buttons keep their fallback link (the email address or the request section).
// Each link gets a utm_source tag, which Jobber records as the client's lead source:
//   - "website-<page>" (e.g. website-ev-charging) for a visitor who came to the site any other way;
//   - the visitor's own utm_source if they arrived on a tagged link, e.g. "google-business-profile" from the
//     Google profile's website link, kept for the rest of their visit;
//   - "google-ads" for a visitor who arrived from a Google ad (gclid) without a utm_source.
// utm_content always carries the page the request was sent from.
(function () {
  "use strict";

  var JOBBER_FORMS = {
    general: "https://clienthub.getjobber.com/hubs/f93dfcfe-424c-492d-a964-4271c9e2da35/public/requests/2259691/new"
  };

  var KEY = "cnce_landing";
  var params = new URLSearchParams(window.location.search);
  var landing = null;
  var source = params.get("utm_source");
  if (!source && params.get("gclid")) source = "google-ads";

  if (source) {
    landing = {
      source: source,
      medium: params.get("utm_medium") || (params.get("gclid") ? "cpc" : ""),
      campaign: params.get("utm_campaign") || ""
    };
    try { window.sessionStorage.setItem(KEY, JSON.stringify(landing)); } catch (e) { /* storage blocked */ }
  } else {
    try { landing = JSON.parse(window.sessionStorage.getItem(KEY) || "null"); } catch (e) { landing = null; }
  }

  var file = window.location.pathname.split("/").pop().replace(/\.html$/, "");
  var page = file && file !== "index" ? file : "home";

  document.querySelectorAll("[data-jobber]").forEach(function (link) {
    var form = link.getAttribute("data-jobber");
    var base = JOBBER_FORMS[form];
    if (!base) return;
    var url;
    try { url = new URL(base); } catch (e) { return; }

    var leadSource = landing && landing.source ? landing.source : "website-" + page;
    url.searchParams.set("utm_source", leadSource);
    url.searchParams.set("utm_medium", landing && landing.medium ? landing.medium : "website");
    if (landing && landing.campaign) url.searchParams.set("utm_campaign", landing.campaign);
    url.searchParams.set("utm_content", page);
    link.href = url.toString();

    link.addEventListener("click", function () {
      if (window.cnceTrack) window.cnceTrack("request_click", { form: form, lead_source: leadSource, page: page });
    });
  });
})();

// Analytics: Google Tag Manager is installed in each page's head. These events go to its dataLayer:
// request_click (a request button was clicked; the form itself is sent on Jobber's page, which Tag Manager
// can't see) and phone_click (a phone number was tapped). In Tag Manager, a Custom Event trigger for each
// name sends it to Google Analytics.
(function () {
  "use strict";

  window.dataLayer = window.dataLayer || [];

  window.cnceTrack = function (name, params) {
    var data = { event: name };
    if (params) for (var k in params) data[k] = params[k];
    window.dataLayer.push(data);
  };

  document.addEventListener("click", function (e) {
    var link = e.target.closest && e.target.closest('a[href^="tel:"]');
    if (link) window.cnceTrack("phone_click", { link_url: link.getAttribute("href") });
  });
})();
