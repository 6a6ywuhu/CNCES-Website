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

  var serviceSelect = document.getElementById("service");
  var wanted = new URLSearchParams(window.location.search).get("service");
  if (serviceSelect && wanted) {
    Array.prototype.forEach.call(serviceSelect.options, function (o) {
      if (o.value === wanted) serviceSelect.value = wanted;
    });
  }

  document.querySelectorAll("form[data-ajax-form]").forEach(function (form) {
    var submitBtn = form.querySelector("[data-submit]");
    var statusBox = form.querySelector(".form-status");
    var submitBtnDefaultHTML = submitBtn ? submitBtn.innerHTML : "";
    var successMsg = form.getAttribute("data-success") || "Thanks — your message has been sent. Wade will be in touch shortly.";

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }
      if (statusBox) {
        statusBox.className = "form-status";
        statusBox.textContent = "";
      }

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (response) {
          if (!response.ok) throw new Error("Request failed");
          if (statusBox) {
            statusBox.className = "form-status success";
            statusBox.textContent = successMsg;
          }
          form.reset();
        })
        .catch(function () {
          if (statusBox) {
            statusBox.className = "form-status error";
            statusBox.textContent = "Something went wrong sending your message. Please call 604 616 1975 or email wade@cnce.ca directly.";
          }
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = submitBtnDefaultHTML;
          }
        });
    });
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

// Reveal buttons: show a hidden panel (e.g. the EPR request form) on click or when its anchor is linked
(function () {
  "use strict";

  document.querySelectorAll("[data-reveal]").forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute("aria-controls"));
    if (!panel) return;
    var section = btn.closest("section[id]");

    function setOpen(open) {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      panel.hidden = !open;
    }
    function openFromHash() {
      if (section && window.location.hash === "#" + section.id) {
        setOpen(true);
        var first = panel.querySelector("input:not([type=hidden]):not([name=_gotcha])");
        if (first) first.focus({ preventScroll: true });
      }
    }

    btn.addEventListener("click", function () {
      setOpen(panel.hidden);
    });
    window.addEventListener("hashchange", openFromHash);
    document.querySelectorAll('a[href="#' + (section ? section.id : "") + '"]').forEach(function (a) {
      a.addEventListener("click", function () {
        setOpen(true);
        setTimeout(openFromHash, 0);
      });
    });
    openFromHash();
  });
})();
