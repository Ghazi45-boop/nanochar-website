const sampleRecommendations = {
    "acidic-maize": "Apply 2.5 tons of Premium Biochar to raise PH and boost maize yield.",
    "neutral-maize": "Apply 1.5 tons of Biochar Conditioner for steady nutrient release.",
    "acidic-cassava": "Apply 2 tons/hectare of Premium Biochar; cassava tolerates acidity but yields improve with treatment.",
    "neutral-vegetables": "Apply 1 ton/hectare of Biochar Soil Conditioner for improved moisture retention.",
};

function getRecommendation() {
const ph = document.getElementById("soil.Ph").value;
const crop = document.getElementById("cropType").value;
const key = ph + "-" + crop;
  const result = sampleRecommendations[key]
    || "Apply 1.5 tons/hectare of Biochar Soil Conditioner as a general starting point.";

const box = document.getElementById("resultBox");
 box.innerHTML = "<strong>Sample Recommendation:</strong> " + result +
 "<br><em>This is preview output. Real assesments launch in the next version of the platform.</em>";
box.style.display = "block";
}
document.addEventListener("DOMContentLoaded", () => {
  initHamburgerMenu();
  initStickyHeaderShadow();
  initScrollReveal();
  initStatCounters();
  initBackToTop();
});

function initHamburgerMenu() {
  const btn = document.getElementById("hamburgerBtn");
  const nav = document.getElementById("siteNav");
  if (!btn || !nav) return;
  btn.addEventListener("click", () => {
    nav.classList.toggle("nav-open");
    btn.classList.toggle("active");
  });
}

function initStickyHeaderShadow() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 10);
  });
}

function initScrollReveal() {
  const targets = document.querySelectorAll(
    ".section, .card, .glass-card, .service-card, .mv-card, .stat-card, .contact-info-card"
  );
  targets.forEach(el => el.classList.add("reveal"));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
}

function initStatCounters() {
  const counters = document.querySelectorAll(".stat-number[data-count]");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute("data-count"), 10);
  const suffix = el.getAttribute("data-suffix") || "";
  const duration = 1200;
  const startTime = performance.now();

  function update(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    el.textContent = Math.floor(progress * target) + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(update);
}

function initBackToTop() {
  const btn = document.createElement("button");
  btn.id = "backToTopBtn";
  btn.setAttribute("aria-label", "Back to top");
  btn.innerHTML = "↑";
  document.body.appendChild(btn);

  window.addEventListener("scroll", () => {
    btn.classList.toggle("visible", window.scrollY > 400);
  });
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
async function signUp() {
  const email = document.getElementById("authEmail").value;
  const password = document.getElementById("authPassword").value;
  const { data, error } = await supabaseClient.auth.signUp({ email, password });
  const msg = document.getElementById("authMessage");
  msg.textContent = error ? error.message : "Account created! Check your email to confirm, then log in.";
}

async function signIn() {
  const email = document.getElementById("authEmail").value;
  const password = document.getElementById("authPassword").value;
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  const msg = document.getElementById("authMessage");
  if (error) { msg.textContent = error.message; return; }
  msg.textContent = "Logged in!";
  document.getElementById("authBox").style.display = "none";
  document.getElementById("dashboardBox").style.display = "block";
  loadFarms();
}

async function addFarm() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  const farm_name = document.getElementById("farmName").value;
  const location = document.getElementById("farmLocation").value;

  const { error } = await supabaseClient.from("farms").insert({
    farmer_id: user.id, farm_name, location,
  });

  if (error) { alert(error.message); return; }
  loadFarms();
}

async function loadFarms() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  const { data } = await supabaseClient
    .from("farms").select("*").eq("farmer_id", user.id)
    .order("created_at", { ascending: false });

  const list = document.getElementById("farmsList");
  list.innerHTML = data.map(f =>
    "<p><strong>" + f.farm_name + "</strong> — " + (f.location || "no location set") + "</p>"
  ).join("");
}

async function submitAssessment() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  const soil_ph = document.getElementById("assessPh").value;
  const crop_type = document.getElementById("assessCrop").value;

  const { data: farms } = await supabaseClient
    .from("farms").select("id").eq("farmer_id", user.id)
    .order("created_at", { ascending: false }).limit(1);
  if (!farms || !farms.length) { alert("Add a farm first."); return; }

  const { data: assessment, error: assessError } = await supabaseClient
    .from("soil_assessments")
    .insert({ farm_id: farms[0].id, farmer_id: user.id, soil_ph, crop_type })
    .select().single();
  if (assessError) { alert(assessError.message); return; }

  const { data: rules } = await supabaseClient
    .from("recommendation_rules")
    .select("recommendation")
    .eq("soil_ph", soil_ph).eq("crop_type", crop_type).limit(1);

  const resultText = (rules && rules.length)
    ? rules[0].recommendation
    : "Apply 1.5 tons/hectare of Biochar Soil Conditioner as a general starting point.";

  await supabaseClient.from("recommendations").insert({
    assessment_id: assessment.id, farmer_id: user.id, recommendation_text: resultText,
  });

  const box = document.getElementById("recommendationResult");
  box.innerHTML = "<strong>Your recommendation:</strong> " + resultText;
  box.style.display = "block";
}








     