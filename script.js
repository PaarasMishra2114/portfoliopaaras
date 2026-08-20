document.documentElement.classList.add("js");

document.getElementById("year").textContent = new Date().getFullYear();

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const progressBar = document.querySelector(".scroll-progress span");

function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
}

updateProgress();
window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);

const revealItems = document.querySelectorAll("[data-reveal]");

if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

const heroPanel = document.querySelector(".hero-panel");

if (heroPanel && !prefersReducedMotion.matches && window.matchMedia("(pointer: fine)").matches) {
  heroPanel.addEventListener("pointermove", (event) => {
    const box = heroPanel.getBoundingClientRect();
    const rotateY = ((event.clientX - box.left) / box.width - 0.5) * 3;
    const rotateX = ((event.clientY - box.top) / box.height - 0.5) * -3;
    heroPanel.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  heroPanel.addEventListener("pointerleave", () => {
    heroPanel.style.transform = "";
  });
}

if (!prefersReducedMotion.matches && "IntersectionObserver" in window) {
  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const counter = entry.target;
        const target = Number(counter.dataset.count);
        const suffix = counter.dataset.suffix || "";
        const startedAt = performance.now();
        const duration = 720;

        function animate(now) {
          const elapsed = Math.min((now - startedAt) / duration, 1);
          const eased = 1 - Math.pow(1 - elapsed, 3);
          counter.textContent = `${Math.round(target * eased)}${suffix}`;
          if (elapsed < 1) window.requestAnimationFrame(animate);
        }

        counter.textContent = `0${suffix}`;
        window.requestAnimationFrame(animate);
        observer.unobserve(counter);
      });
    },
    { threshold: 0.7 }
  );

  document.querySelectorAll("[data-count]").forEach((counter) => counterObserver.observe(counter));
}

document.querySelectorAll(".project-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const details = document.getElementById(button.getAttribute("aria-controls"));
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    details.hidden = expanded;
  });
});

const skillTabs = Array.from(document.querySelectorAll("[data-skill-tab]"));
const skillPanels = Array.from(document.querySelectorAll("[data-skill-panel]"));

function selectSkillTab(selectedTab) {
  const selectedSkill = selectedTab.dataset.skillTab;

  skillTabs.forEach((tab) => {
    const isSelected = tab === selectedTab;
    tab.setAttribute("aria-selected", String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
  });

  skillPanels.forEach((panel) => {
    panel.hidden = panel.dataset.skillPanel !== selectedSkill;
  });
}

skillTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectSkillTab(tab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? skillTabs.length - 1
        : (index + (event.key === "ArrowRight" ? 1 : -1) + skillTabs.length) % skillTabs.length;
    skillTabs[nextIndex].focus();
    selectSkillTab(skillTabs[nextIndex]);
  });
});

const certificateDialog = document.getElementById("certificate-dialog");
const certificateDialogImage = document.getElementById("certificate-dialog-image");
const certificateDialogTitle = document.getElementById("certificate-dialog-title");
const certificateDialogClose = document.getElementById("certificate-dialog-close");

document.querySelectorAll("[data-certificate-open]").forEach((button) => {
  button.addEventListener("click", () => {
    const title = button.dataset.certificateTitle;
    certificateDialogTitle.textContent = title;
    certificateDialogImage.src = button.dataset.certificateImage;
    certificateDialogImage.alt = `${title} certificate for Paaras Mishra`;
    certificateDialog.showModal();
  });
});

certificateDialogClose.addEventListener("click", () => certificateDialog.close());

certificateDialog.addEventListener("click", (event) => {
  if (event.target === certificateDialog) certificateDialog.close();
});

const certificateFilters = Array.from(document.querySelectorAll("[data-certificate-filter]"));
const certificateCards = Array.from(document.querySelectorAll("[data-certificate]"));

certificateFilters.forEach((filter) => {
  filter.addEventListener("click", () => {
    const category = filter.dataset.certificateFilter;
    certificateFilters.forEach((item) => {
      item.setAttribute("aria-pressed", String(item === filter));
    });
    certificateCards.forEach((card) => {
      card.hidden = category !== "all" && card.dataset.certificateCategory !== category;
    });
  });
});

const credentialTabs = Array.from(document.querySelectorAll("[data-credential-tab]"));
const credentialGrid = document.querySelector(".certificate-grid");

function selectCredentialTab(selectedTab) {
  const selectedGroup = selectedTab.dataset.credentialTab;
  credentialTabs.forEach((tab) => tab.setAttribute("aria-selected", String(tab === selectedTab)));

  if (!credentialGrid) return;
  let activeGroup = "";
  Array.from(credentialGrid.children).forEach((item) => {
    if (item.matches("[data-credential-group]")) activeGroup = item.dataset.credentialGroup;
    const visible = selectedGroup === "all" || activeGroup === selectedGroup;
    item.hidden = !visible;
  });
}

credentialTabs.forEach((tab) => tab.addEventListener("click", () => selectCredentialTab(tab)));

const sections = Array.from(document.querySelectorAll("main section[id]"));
const navLinks = Array.from(document.querySelectorAll("[data-nav-link]"));

if ("IntersectionObserver" in window) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries.find((entry) => entry.isIntersecting);
      if (!visible) return;
      navLinks.forEach((link) => {
        const active = link.getAttribute("href") === `#${visible.target.id}`;
        link.toggleAttribute("aria-current", active);
      });
    },
    { rootMargin: "-25% 0px -65% 0px", threshold: 0.01 }
  );

  sections.forEach((section) => navObserver.observe(section));
}
