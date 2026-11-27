const revealItems = document.querySelectorAll(
  ".hero-copy, .hero-art, .about-content, .strengths-heading, .card--strength, .services-heading, .card--service, .projects-heading, .card--project, .project-card, .team-heading, .team-member, .process-heading, .process-step, .contact-main"
);

revealItems.forEach((item, index) => {
  item.classList.add("reveal");
  item.style.setProperty("--reveal-delay", `${Math.min(index % 3, 2) * 90}ms`);
});

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        } else {
          entry.target.classList.remove("is-visible");
        }
      });
    },
    { threshold: 0.05, rootMargin: "0px 0px -24px 0px" }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
