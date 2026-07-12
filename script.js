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









     