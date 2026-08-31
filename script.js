(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     Sticky nav shrink on scroll
     --------------------------------------------------------- */
  var nav = document.getElementById("nav");
  function handleNavScroll() {
    if (window.scrollY > 12) {
      nav.classList.add("is-scrolled");
    } else {
      nav.classList.remove("is-scrolled");
    }
  }
  if (nav) {
    window.addEventListener("scroll", handleNavScroll, { passive: true });
    handleNavScroll();
  }

  /* ---------------------------------------------------------
     Mobile menu toggle
     --------------------------------------------------------- */
  var burger = document.getElementById("burger");
  var mobileMenu = document.getElementById("mobileMenu");

  function closeMenu() {
    mobileMenu.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  function openMenu() {
    mobileMenu.classList.add("is-open");
    burger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  if (burger && mobileMenu) {
    burger.addEventListener("click", function () {
      var isOpen = mobileMenu.classList.contains("is-open");
      isOpen ? closeMenu() : openMenu();
    });
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
  }

  /* ---------------------------------------------------------
     Scroll-triggered reveal animations
     --------------------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------------------------------------------------------
     Stat counters — animate numbers up when scrolled into view
     --------------------------------------------------------- */
  var statEls = document.querySelectorAll(".stat__num");

  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"), 10);
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var isDecimal = el.getAttribute("data-decimal") === "true";
    var duration = 1600;
    var startTime = null;

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = easeOutExpo(progress);
      var current = target * eased;
      var display = isDecimal ? (current / 10).toFixed(1) : Math.round(current).toLocaleString("en-US");
      el.textContent = prefix + display + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        var finalDisplay = isDecimal ? (target / 10).toFixed(1) : target.toLocaleString("en-US");
        el.textContent = prefix + finalDisplay + suffix;
      }
    }
    window.requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    var statObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    statEls.forEach(function (el) {
      statObserver.observe(el);
    });
  } else {
    statEls.forEach(animateCount);
  }

  /* ---------------------------------------------------------
     Hero stack: switch to gentle float loop once entrance
     animation finishes
     --------------------------------------------------------- */
  if (!prefersReducedMotion) {
    var stackBlocks = document.querySelectorAll(".stack__block");
    stackBlocks.forEach(function (block) {
      block.addEventListener("animationend", function handler(e) {
        if (e.animationName === "stackIn") {
          block.style.opacity = "1";
          block.style.transform = "none";
          block.classList.add("float");
          block.removeEventListener("animationend", handler);
        }
      });
    });
  }

  /* ---------------------------------------------------------
     FAQ accordion
     --------------------------------------------------------- */
  var faqItems = document.querySelectorAll(".faq__item");
  faqItems.forEach(function (item) {
    var question = item.querySelector(".faq__question");
    question.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");

      // Close any other open item for a clean single-open accordion.
      faqItems.forEach(function (other) {
        if (other !== item) {
          other.classList.remove("is-open");
          other.querySelector(".faq__question").setAttribute("aria-expanded", "false");
        }
      });

      item.classList.toggle("is-open", !isOpen);
      question.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  /* ---------------------------------------------------------
     Contact form — client-side only demo submit
     --------------------------------------------------------- */
  var contactForm = document.getElementById("contactForm");
  var contactStatus = document.getElementById("contactStatus");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }
      var submitBtn = contactForm.querySelector("button[type='submit']");
      var originalLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";

      // Simulated send — replace with a real endpoint call when wiring up a backend.
      window.setTimeout(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
        contactStatus.innerHTML = "<i class='fa-solid fa-circle-check'></i> Message sent — we'll reply within one business day.";
        contactStatus.classList.add("is-visible");
        contactForm.reset();
      }, 700);
    });
  }

  /* ---------------------------------------------------------
     Newsletter form (blog page) — client-side only demo submit
     --------------------------------------------------------- */
  var newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = newsletterForm.querySelector("input");
      var status = document.getElementById("newsletterStatus");
      if (!input.value) return;
      if (status) {
        status.innerHTML = "<i class='fa-solid fa-circle-check'></i> Subscribed — welcome to the stack.";
        status.classList.add("is-visible");
      }
      newsletterForm.reset();
    });
  }

  /* ---------------------------------------------------------
     Blog filter chips (visual filter only — demo)
     --------------------------------------------------------- */
  var filterChips = document.querySelectorAll(".blog-filter__chip");
  filterChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      filterChips.forEach(function (c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");
    });
  });

  /* ---------------------------------------------------------
     Auth page: login / signup tab switch
     --------------------------------------------------------- */
  var authTabs = document.querySelectorAll(".auth__tab");
  var authPanels = document.querySelectorAll(".auth__panel");
  authTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var targetId = tab.getAttribute("data-panel");
      authTabs.forEach(function (t) { t.classList.remove("is-active"); });
      authPanels.forEach(function (p) { p.classList.remove("is-active"); });
      tab.classList.add("is-active");
      var panel = document.getElementById(targetId);
      if (panel) panel.classList.add("is-active");
    });
  });

  /* ---------------------------------------------------------
     Auth page: password visibility toggle
     --------------------------------------------------------- */
  document.querySelectorAll(".auth__field-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var input = btn.parentElement.querySelector("input");
      var icon = btn.querySelector("i");
      if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    });
  });

  /* ---------------------------------------------------------
     Smooth-scroll offset for sticky nav (anchor clicks)
     --------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target || !nav) return;
      e.preventDefault();
      var navHeight = nav.offsetHeight;
      var top = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 12;
      window.scrollTo({ top: top, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  });
})();