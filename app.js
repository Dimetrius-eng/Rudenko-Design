const categoryLabels = {
  "All": "Усі роботи",
  "Bathrooms": "Ванні кімнати",
  "Bedrooms": "Спальні",
  "Children's": "Дитячі",
  "Hospitable": "Вітальні",
  "Kitchens": "Кухні",
  "laundries": "Пральні",
  "Offices": "Офіси",
  "Walk-in closets": "Гардеробні",
  "Wall Panels and Decor": "Стінові панелі та декор"
};

const projectTitles = {
  "Apartment Two": "Квартира друга",
  "Buddy's Home": "Дім Бадді",
  "Character traits": "Риси характеру",
  "House of Ideas": "Будинок ідей",
  "Kyiv, Drahomyrova St": "Київ, вул. Драгомирова",
  "Panda's House": "Дім Панди",
  "Podil Loft": "Подільський лофт",
  "Seasons": "Пори року",
  "An Open Book": "Відкрита книга",
  "OFFICE 44": "Офіс 44",
  "Sergey Makhno Studio": "Студія Сергія Махна",
  "Soul Spa": "Спа «Душа»"
};
const projectTitle = project => projectTitles[project.name] || project.name;

const params = new URLSearchParams(location.search);
const page = params.get("page") || "home";
const main = document.querySelector("#main");
const esc = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const imageUrl = value => encodeURI(value).replaceAll("'", "%27");
document.addEventListener("contextmenu", event => {
  if (event.target.closest(".project-image, .gallery-item, .lightbox-image-frame")) event.preventDefault();
}, true);
document.addEventListener("dragstart", event => {
  if (event.target.closest(".project-image, .gallery-item, .lightbox-image-frame")) event.preventDefault();
}, true);
const gmailComposeUrl = (to, subject = "", body = "") => `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
const projectHref = project => `?page=project&category=${encodeURIComponent(project.category)}&project=${encodeURIComponent(project.name)}`;

document.querySelector("#year").textContent = new Date().getFullYear();
const menuToggle = document.querySelector(".menu-toggle");
menuToggle.addEventListener("click", () => {
  const open = document.body.classList.toggle("menu-open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Закрити меню" : "Відкрити меню");
});
document.querySelectorAll(".primary-nav a").forEach(link => {
  const route = link.dataset.route;
  const active = route === page || (route === "projects" && page === "project");
  if (active) link.setAttribute("aria-current", "page");
  link.addEventListener("click", () => document.body.classList.remove("menu-open"));
});

const inquiryModal = document.querySelector("#inquiry-modal");
const inquiryForm = document.querySelector("#inquiry-form");
const spamTrap = document.createElement("input");
spamTrap.type = "text";
spamTrap.name = "_honey";
spamTrap.tabIndex = -1;
spamTrap.autocomplete = "off";
spamTrap.setAttribute("aria-hidden", "true");
spamTrap.className = "form-honeypot";
inquiryForm.append(spamTrap);
let inquiryTrigger = null;
const openInquiry = trigger => {
  inquiryTrigger = trigger;
  inquiryModal.classList.add("is-open");
  inquiryModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  inquiryModal.querySelector("input")?.focus();
};
const closeInquiry = () => {
  inquiryModal.classList.remove("is-open");
  inquiryModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  inquiryTrigger?.focus();
};
document.addEventListener("click", event => {
  const trigger = event.target.closest("[data-open-inquiry]");
  if (!trigger) return;
  event.preventDefault();
  openInquiry(trigger);
});
inquiryModal.querySelector(".inquiry-close").addEventListener("click", closeInquiry);
inquiryModal.addEventListener("click", event => { if (event.target === inquiryModal) closeInquiry(); });
document.addEventListener("keydown", event => { if (event.key === "Escape" && inquiryModal.classList.contains("is-open")) closeInquiry(); });
inquiryForm.addEventListener("submit", async event => {
  event.preventDefault();
  const data = new FormData(inquiryForm);
  const status = inquiryForm.querySelector(".form-status");
  const submit = inquiryForm.querySelector('[type="submit"]');
  const isEnglish = document.documentElement.lang === "en";
  status.classList.add("is-sending");
  status.innerHTML = isEnglish
    ? '<span class="sending-primary">Sending your inquiry<span class="sending-dots" aria-hidden="true"><span>.</span><span>.</span><span>.</span></span></span><span>This may take a few seconds.</span>'
    : '<span class="sending-primary">Надсилаємо ваше звернення<span class="sending-dots" aria-hidden="true"><span>.</span><span>.</span><span>.</span></span></span><span>Це може зайняти кілька секунд.</span>';
  submit.disabled = true;
  try {
    const response = await fetch("https://formsubmit.co/ajax/mydimka08@gmail.com", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        phone: data.get("phone"),
        email: data.get("email") || "не вказано",
        _replyto: data.get("email") || "",
        _url: window.location.href,
        _subject: `Звернення з сайту від ${data.get("name")}`,
        message: data.get("message") || "не вказано",
        _honey: data.get("_honey") || ""
      })
    });
    const responseText = await response.text();
    let result = {};
    try {
      result = responseText ? JSON.parse(responseText) : {};
    } catch {
      result = { message: responseText };
    }
    if (!response.ok || result.success === false || result.success === "false") {
      throw new Error(result.message || `Request failed (${response.status})`);
    }
    status.classList.remove("is-sending");
    status.textContent = document.documentElement.lang === "en" ? "Thank you. Your inquiry has been sent." : "Дякуємо! Ваше звернення надіслано.";
    inquiryForm.reset();
  } catch (error) {
    console.error("Inquiry submission failed:", error);
    status.classList.remove("is-sending");
    status.textContent = document.documentElement.lang === "en"
      ? "We couldn’t send your inquiry. Please try again or email us directly."
      : "Не вдалося надіслати звернення. Спробуйте ще раз або напишіть нам на пошту.";
  } finally {
    status.classList.remove("is-sending");
    submit.disabled = false;
  }
});

const card = project => `<article class="project-card"><a class="project-image" href="${projectHref(project)}" aria-label="Переглянути проєкт ${esc(projectTitle(project))}"><img src="${imageUrl(project.cover)}" alt="Меблі в інтер’єрі проєкту «${esc(projectTitle(project))}»" loading="lazy" draggable="false" /></a><div class="project-meta"><div><p>${esc(categoryLabels[project.category] || project.category)}</p><h3>${esc(projectTitle(project))}</h3></div><a href="${projectHref(project)}" aria-label="Відкрити проєкт ${esc(projectTitle(project))}">↗</a></div></article>`;
const hero = (photo, eyebrow, title, subtitle = "") => `<section class="page-hero"><img src="${imageUrl(photo)}" alt="" /><div class="page-hero-shade"></div><div class="page-hero-content"><p class="eyebrow"><span class="eyebrow-line"></span>RUDENKO DESIGN</p><h1>${title}</h1></div></section>`;

function loadProjects() {
  return (window.RUDENKO_PROJECTS || []).filter(project => !(project.category === "Walk-in closets" && project.name === "Seasons"));
}

function renderAbout() {
  document.title = "Про нас — Rudenko Design";
  main.innerHTML = `${hero("Images/Enhanced/About us/5.webp", "RUDENKO DESIGN", "Про студію")}
    <section class="content-narrow about-intro"><div class="about-intro-photo"><img src="Images/Enhanced/About us/33.webp" alt="Інтер’єр студії Rudenko Design" loading="lazy" /></div><div class="about-copy"><p class="about-kicker">Rudenko Design</p><p>Руслан Руденко — сучасний український дизайнер меблів, засновник і керівник виробничої студії Rudenko Design.</p><p>З 2002 року виробництво меблів стало основним видом діяльності та справою всього життя. У 2008 році, прагнучи запропонувати клієнтам якісний продукт і поділитися своїми вміннями, була заснована власна студія з проєктування та виробництва корпусних меблів і елементів інтер’єру.</p><p>Rudenko Design сьогодні — це команда людей, об’єднаних спільною справою. Ми сповнені новаторських ідей, навчаємося новим технологіям, вивчаємо тенденції та нові напрями в дизайні й виробництві меблів.</p><p>За останні кілька років спільно з провідними архітекторами та дизайнерами інтер’єрів ми втілили в життя низку унікальних проєктів, які отримали заслужене визнання. Багато інтер’єрів, для яких ми створювали меблі, неодноразово брали участь у престижних конкурсах і були високо оцінені журі.</p></div></section>
    <section class="about-details section-pad" aria-label="Наш підхід"><article class="about-detail-copy"><div class="about-detail"><div><p class="eyebrow"><span class="eyebrow-line"></span>Що ми робимо</p><p>Rudenko Design проєктує та виготовляє якісні й функціональні меблі: від масштабних комплексних проєктів до невеликих ідей для домашнього інтер’єру. Ми створюємо авторські меблі за власними ескізами та корпусні меблі за індивідуальними проєктами замовників. Робимо меблі для людей, які цінують лаконічний і водночас простий дизайн, стежать за трендами та прагнуть, щоб інтер’єр відповідав їхнім уявленням про комфорт. Основна частина нашої роботи присвячена виробництву корпусних меблів, але нам також цікаві проєкти з виготовлення м’яких меблів. З особливим задоволенням беремося за нестандартні конструктивні рішення, створюємо меблі для високотехнологічних і сучасних інтер’єрів.</p></div><div><p class="eyebrow"><span class="eyebrow-line"></span>Як ми працюємо</p><p>Понад 14 років досвіду у сфері проєктування та виробництва меблів привели нас до правильного процесу роботи. Насамперед ми складаємо технічне завдання на основі поставленої задачі та побажань замовника, під час обговорення підбираємо матеріали, уточнюємо стиль, функціональність і габарити виробів. До наступної зустрічі ми розробляємо дизайн – прорисовуємо зовнішній вигляд виробу, пропонуємо перші начерки креслень, демонструємо зразки матеріалів. Лише проєкт та ескізи дають розгорнуте уявлення про майбутні меблі та їхнє поєднання з інтер’єром. Після погодження проєкту, ескізів і вибраних матеріалів ми приступаємо до виготовлення меблів. Авторський нагляд – постійний процес у нашій студії. Ми контролюємо роботу на кожному етапі – від вибору постачальників матеріалів до встановлення готового виробу на об’єкті.</p></div><div><p class="eyebrow"><span class="eyebrow-line"></span>Матеріали</p><p>Щоб створити по-справжньому якісні меблі, ми застосовуємо найкращі матеріали та якісні комплектуючі. Це цінні породи деревини, екологічно чисті ДСП та МДФ, сучасна фурнітура від провідних виробників, натуральний струганий шпон та шпон fine-line, скло, дзеркала, натуральний і штучний камінь, метал. Для покриття та обробки дерев’яних елементів використовуємо натуральні рослинні олії та воски.</p></div></div></article></section>
    <section class="about-cta section-pad"><div class="about-questions"><p>Вже готовий проєкт і ви знаходитесь в пошуках надійного партнера для його виготовлення?</p><p>Запропоновані дизайнером ескізи меблів, здається, не відповідають інтер’єру?</p><p>Ідеальні меблі поки що тільки у вашій уяві?</p></div><div class="about-cta-action"><h2>У студії Rudenko Design ми зробимо сучасні меблі з вашої мрії або за готовим проєктом</h2><a class="button button-dark" href="?page=contacts#contact-section">Давайте зустрінемось <span>↗</span></a></div></section>`;
}

function renderProjects(projects) {
  document.title = "Наші роботи — Rudenko Design";
  const selected = params.get("category") || "All";
  const categories = Object.keys(categoryLabels).filter(key => key !== "All" && projects.some(project => project.category === key));
  const filtered = selected === "All" ? projects : projects.filter(project => project.category === selected);
  const pills = [{ key: "All", label: categoryLabels.All }, ...categories.map(key => ({ key, label: categoryLabels[key] }))]
    .map(item => `<a class="category-pill" href="?page=projects${item.key === "All" ? "" : `&category=${encodeURIComponent(item.key)}`}" ${selected === item.key ? 'aria-current="page"' : ""}>${esc(item.label)}</a>`).join("");
  main.innerHTML = `${hero("Images/Enhanced/Projects/Kitchens/Apartment Two/148.webp", "Власне виробництво · індивідуальний дизайн", "Наші роботи", "Меблі, створені для життя та конкретного простору")}
    <section class="portfolio-page"><div class="portfolio-head"><p class="eyebrow eyebrow-dark">Портфоліо</p></div><nav class="category-list" aria-label="Категорії проєктів">${pills}</nav><div class="project-list">${filtered.map(card).join("")}</div></section>
    <section class="contact-strip section-pad portfolio-next"><div><p class="eyebrow">Наступна історія може бути вашою</p><h2>Поділіться своєю<br />ідеєю з нами.</h2></div><a class="button button-dark" href="#inquiry-modal" data-open-inquiry>Обговорити проєкт <span>↗</span></a></section>`;
}

function renderProject(projects) {
  const project = projects.find(item => item.name === params.get("project") && item.category === params.get("category"));
  if (!project) { renderProjects(projects); return; }
  document.title = `${projectTitle(project)} — Rudenko Design`;
  main.innerHTML = `<section class="gallery-page"><nav class="breadcrumbs" aria-label="Навігаційний шлях"><a href="?page=projects">Наші роботи</a><span>/</span><a href="?page=projects&category=${encodeURIComponent(project.category)}">${esc(categoryLabels[project.category] || project.category)}</a><span>/</span><span>${esc(projectTitle(project))}</span></nav><div class="gallery-heading"><div><p class="eyebrow eyebrow-dark">${esc(categoryLabels[project.category] || project.category)}</p><h1>${esc(projectTitle(project))}</h1></div><p>${project.images.length} ${project.images.length === 1 ? "фото проєкту" : "фотографій проєкту"}</p></div><div class="gallery-grid">${project.images.map((src, index) => `<button class="gallery-item" type="button" data-image-index="${index}" aria-label="Відкрити фотографію ${index + 1} проєкту ${esc(projectTitle(project))}"><img src="${imageUrl(src)}" alt="${esc(projectTitle(project))} — фото ${index + 1}" loading="${index < 2 ? "eager" : "lazy"}" draggable="false" /><span class="image-watermark" aria-hidden="true">RUDENKO DESIGN</span></button>`).join("")}</div><div class="gallery-cta"><h2>Маєте схожу ідею для свого простору?</h2><a class="button button-dark" href="#inquiry-modal" data-open-inquiry>Обговорити проєкт <span>↗</span></a></div></section><div class="lightbox" role="dialog" aria-modal="true" aria-label="Перегляд фотографій" aria-hidden="true"><button class="lightbox-close" type="button" aria-label="Закрити">×</button><button class="lightbox-prev" type="button" aria-label="Попередня фотографія">‹</button><div class="lightbox-image-frame"><img alt="" draggable="false" /><span class="image-watermark" aria-hidden="true">RUDENKO DESIGN</span></div><button class="lightbox-next" type="button" aria-label="Наступна фотографія">›</button><p class="lightbox-caption"></p></div>`;
  initLightbox(project);
}

function renderContacts() {
  document.title = "Контакти — Rudenko Design";
  main.innerHTML = `${hero("Images/Enhanced/Projects/Hospitable/Apartment Two/143.webp", "Ми поруч із 2002 року", "Контакти", "Будемо раді познайомитися з вашим проєктом")}
    <section class="contacts-section section-pad" id="contact-section"><div class="contact-visual"><img src="Images/Enhanced/Main page/2.webp" alt="Вітальня з меблями Rudenko Design" loading="lazy" /></div><div class="contact-intro"><p class="about-kicker">RUDENKO DESIGN</p><h2>Зв’яжіться з нами</h2><p>З 2002 року з невеликої майстерні ми виросли до виробничої студії. Сьогодні власне виробництво дозволяє нам виготовляти меблі для приватних осіб і успішно співпрацювати з дизайнерами інтер’єрів, архітекторами та провідними українськими дизайн-студіями.</p><p>Розкажіть менеджеру про свої плани і домовтеся про зустріч. Наш спеціаліст безкоштовно виїде до вас на об’єкт, щоб обговорити проєкт, запропонувати дизайн меблів і показати зразки та палітри.</p><div class="contact-details"><div><span class="detail-label">Телефон</span><a href="tel:+380671507799">+380 (67) 150-77-99</a></div><div><span class="detail-label">Електронна пошта</span><a href="https://mail.google.com/mail/?view=cm&amp;fs=1&amp;to=mebli.rus%40gmail.com" target="_blank" rel="noopener noreferrer">mebli.rus@gmail.com</a></div><div><span class="detail-label">Адреса</span><a href="https://maps.app.goo.gl/83bnbBaeUM26fp3b9" target="_blank" rel="noopener noreferrer">м. Київ, вул. Роберта Лісовського, 3А</a></div><div class="contact-socials" aria-label="Соціальні мережі"><a href="https://www.instagram.com/rudenko_mebli/" target="_blank" rel="noopener noreferrer" aria-label="Instagram Rudenko Design"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="18" cy="6" r=".8" fill="currentColor" stroke="none"/></svg></a><a href="https://www.facebook.com/Rudenkomebli" target="_blank" rel="noopener noreferrer" aria-label="Facebook Rudenko Design"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 21v-8h3l.5-4H14V7c0-1.2.4-2 2-2h1.7V1.4C17 1.2 15.8 1 14.4 1 11 1 9 3 9 6.7V9H6v4h3v8z" fill="currentColor" stroke="none"/></svg></a><a href="https://www.linkedin.com/in/ruslan-rudenko-a6615943/?locale=uk" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Rudenko Design"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8.5A2.5 2.5 0 1 0 5 3.5a2.5 2.5 0 0 0 0 5ZM3 10h4v11H3zm6 0h3.8v1.5h.1A4.2 4.2 0 0 1 16.7 9c4 0 4.8 2.5 4.8 5.8V21h-4v-5.5c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V21H9z" fill="currentColor" stroke="none"/></svg></a></div></div></div></section><section class="location-section section-pad"><iframe title="Розташування виробництва Rudenko Design у Києві" src="https://maps.google.com/maps?q=Rudenko-Design&ll=50.4463013%2C30.6475655&z=17&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></section>`;
}

function initLightbox(project) {
  const box = document.querySelector(".lightbox");
  main.addEventListener("contextmenu", event => {
    if (event.target.closest(".gallery-item, .lightbox-image-frame")) event.preventDefault();
  });
  main.addEventListener("dragstart", event => {
    if (event.target.closest(".gallery-item, .lightbox-image-frame")) event.preventDefault();
  });
  const image = box.querySelector("img");
  const caption = box.querySelector(".lightbox-caption");
  let active = 0;
  const show = index => {
    active = (index + project.images.length) % project.images.length;
    image.src = imageUrl(project.images[active]);
    image.alt = `${projectTitle(project)} — фото ${active + 1}`;
    caption.textContent = `${projectTitle(project)} · ${active + 1} / ${project.images.length}`;
  };
  const close = () => { box.classList.remove("is-open"); box.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; };
  document.querySelectorAll(".gallery-item").forEach(button => button.addEventListener("click", () => { show(Number(button.dataset.imageIndex)); box.classList.add("is-open"); box.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; box.querySelector(".lightbox-close").focus(); }));
  box.querySelector(".lightbox-close").addEventListener("click", close);
  box.querySelector(".lightbox-prev").addEventListener("click", () => show(active - 1));
  box.querySelector(".lightbox-next").addEventListener("click", () => show(active + 1));
  box.addEventListener("click", event => { if (event.target === box) close(); });
  document.addEventListener("keydown", event => { if (!box.classList.contains("is-open")) return; if (event.key === "Escape") close(); if (event.key === "ArrowLeft") show(active - 1); if (event.key === "ArrowRight") show(active + 1); });
}

function initCarousel() {
  const carousel = document.querySelector("[data-carousel]");
  if (!carousel) return;
  const slides = [...carousel.querySelectorAll("[data-slide]")];
  const tabs = [...carousel.querySelectorAll("[data-go-to]")];
  const track = carousel.querySelector(".carousel-track");
  let active = 0;
  const show = index => {
    active = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${active * 25}%)`;
    slides.forEach((slide, position) => {
      const selected = position === active;
      slide.classList.toggle("is-active", selected);
      slide.setAttribute("aria-hidden", String(!selected));
      slide.inert = !selected;
    });
    tabs.forEach((tab, position) => {
      const selected = position === active;
      tab.classList.toggle("is-active", selected);
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
  };
  tabs.forEach(tab => tab.addEventListener("click", () => show(Number(tab.dataset.goTo))));
  carousel.querySelector('[data-direction="previous"]').addEventListener("click", () => show(active - 1));
  carousel.querySelector('[data-direction="next"]').addEventListener("click", () => show(active + 1));
  carousel.querySelector('[role="tablist"]').addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? slides.length - 1 : active + (event.key === "ArrowRight" ? 1 : -1);
    show(next);
    tabs[active].focus();
  });
}

async function renderDynamicPage() {
  try {
    const projects = page === "projects" || page === "project" ? loadProjects() : [];
    if (page === "about") renderAbout();
    else if (page === "projects") renderProjects(projects);
    else if (page === "project") renderProject(projects);
    else if (page === "contacts") renderContacts();
    else {
      document.title = "Rudenko Design — меблі з характером";
      initCarousel();
    }
    const pageHeroImage = main.querySelector(".page-hero img");
    if (document.documentElement.classList.contains("route-pending") && pageHeroImage) {
      await pageHeroImage.decode().catch(() => {});
      document.documentElement.classList.add("route-revealing");
    }
    document.documentElement.classList.remove("route-pending");
    if (location.hash) requestAnimationFrame(() => document.querySelector(location.hash)?.scrollIntoView({ behavior: "smooth" }));
  } catch (error) {
    main.innerHTML = `<section class="not-found"><div><h1>Не вдалося завантажити сторінку</h1><p>Оновіть сторінку. Якщо помилка повториться, перевірте файли сайту.</p></div></section>`;
    document.documentElement.classList.remove("route-pending");
  }
}

renderDynamicPage();
