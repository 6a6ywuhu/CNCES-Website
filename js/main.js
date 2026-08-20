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

  var contactForm = document.getElementById("contact-form");
  if (contactForm) {
    var submitBtn = document.getElementById("form-submit");
    var statusBox = document.getElementById("form-status");
    var submitBtnDefaultHTML = submitBtn ? submitBtn.innerHTML : "";

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }
      if (statusBox) {
        statusBox.className = "";
        statusBox.textContent = "";
      }

      fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" }
      })
        .then(function (response) {
          if (response.ok) {
            if (statusBox) {
              statusBox.className = "success";
              statusBox.textContent = "Thanks — your project details have been sent. Wade will be in touch shortly.";
            }
            contactForm.reset();
          } else {
            return response.json().then(function (data) {
              var errorMsg = (data && data.errors && data.errors.length)
                ? data.errors.map(function (er) { return er.message; }).join(", ")
                : "Something went wrong sending your message.";
              throw new Error(errorMsg);
            });
          }
        })
        .catch(function () {
          if (statusBox) {
            statusBox.className = "error";
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
  }

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
