// Scroll-reveal: adds .visible to each .topic-section when it enters the viewport.
// IntersectionObserver is supported in all modern browsers.

(function () {
  const sections = document.querySelectorAll('.topic-section');

  if (!sections.length) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.06,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  sections.forEach(function (section) {
    observer.observe(section);
  });
})();
