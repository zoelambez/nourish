import { useState, useEffect } from "react";

/* ─── Styles ─────────────────────────────────────────────────── */
const injectStyles = () => {
  if (document.getElementById("nourish-styles")) return;
  const el = document.createElement("style");
  el.id = "nourish-styles";
  el.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    ::-webkit-scrollbar{width:4px;}
    ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
    @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
    @keyframes barGrow{from{width:0%;}to{width:var(--w);}}
    .fade-up{animation:fadeUp 0.4s ease both;}
    .pill-tap{cursor:pointer;transition:all 0.15s ease;user-select:none;}
    .pill-tap:hover{transform:scale(1.04);}
    .btn{transition:transform 0.15s ease,filter 0.15s ease;cursor:pointer;border:none;}
    .btn:hover{transform:scale(1.03);filter:brightness(1.1);}
    .btn:active{transform:scale(0.97);}
    .btn:disabled{opacity:0.3;transform:none!important;filter:none!important;cursor:not-allowed;}
    input::-webkit-outer-spin-button,input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
    input[type=number]{-moz-appearance:textfield;}
  `;
  document.head.appendChild(el);
};

/* ─── Quiz steps ─────────────────────────────────────────────── */
const QUIZ = [
  {
    id:"basics", title:"Let's start with you", sub:"Basic info helps us calibrate your nutrition targets",
    fields:[
      {key:"name",     type:"text",   label:"First name", placeholder:"Your name"},
      {key:"age",      type:"select", label:"Age range",  opts:["Under 18","18–25","26–35","36–45","46–55","56+"]},
      {key:"sex",      type:"select", label:"Biological sex", opts:["Female","Male","Prefer not to say"]},
      {key:"activity", type:"select", label:"Activity level", opts:[
        "Sedentary (desk job, little movement)",
        "Lightly active (daily walks, some movement)",
        "Moderately active (3–4 workouts/week)",
        "Very active (5+ intense sessions/week)",
        "Athlete / twice-daily training",
      ]},
    ],
  },
  {
    id:"body", title:"Your body measurements", sub:"Used to calculate BMI and personalised calorie & macro targets",
    fields:[
      {key:"heightCm", type:"number", label:"Height (cm)", placeholder:"e.g. 168", min:100, max:230},
      {key:"weightKg", type:"number", label:"Current weight (kg)", placeholder:"e.g. 65", min:30, max:300},
      {key:"goalWeightKg", type:"number", label:"Goal weight (kg) — optional", placeholder:"e.g. 58", min:30, max:300},
    ],
  },
  {
    id:"goals", title:"What do you want from food?", sub:"Select everything that matters to you",
    fields:[
      {key:"goals", type:"multi", label:"Your goals", opts:[
        {v:"lose_weight",l:"Lose weight",i:"⚖️"},{v:"build_muscle",l:"Build muscle",i:"💪"},
        {v:"energy",l:"More energy",i:"⚡"},{v:"gut_health",l:"Gut health",i:"🌱"},
        {v:"hormone_balance",l:"Hormone balance",i:"🌙"},{v:"inflammation",l:"Less inflammation",i:"🧊"},
        {v:"mental_clarity",l:"Mental clarity",i:"🧠"},{v:"performance",l:"Athletic performance",i:"🏃"},
        {v:"just_healthier",l:"Just eat healthier",i:"🥗"},
      ]},
      {key:"bodyType", type:"select", label:"Body type (best guess)", opts:[
        "Ectomorph — naturally lean, hard to gain",
        "Mesomorph — muscular, responds well",
        "Endomorph — gains weight more easily",
        "Not sure / combination",
      ]},
    ],
  },
  {
    id:"cycle", title:"Hormones & cycle", sub:"Skip freely — this syncs nutrition to your biology",
    fields:[
      {key:"cycleApplies", type:"select", label:"Do you have a menstrual cycle?", opts:["Yes","No / not applicable","Irregular / on hormonal BC"]},
      {key:"cyclePhase", type:"select", label:"Current phase", showIf:{key:"cycleApplies",vals:["Yes","Irregular / on hormonal BC"]}, opts:[
        "Menstrual (days 1–5) — bleeding phase",
        "Follicular (days 6–13) — rising estrogen",
        "Ovulation (days 14–16) — peak estrogen",
        "Luteal (days 17–28) — progesterone peak",
        "Not sure",
      ]},
      {key:"hormoneConditions", type:"multi", label:"Hormonal conditions", opts:[
        {v:"pmdd",l:"PMDD",i:"🌘"},{v:"pcos",l:"PCOS",i:"🔄"},
        {v:"hypothyroid",l:"Hypothyroidism",i:"🦋"},{v:"hyperthyroid",l:"Hyperthyroidism",i:"⚡"},
        {v:"endometriosis",l:"Endometriosis",i:"🩸"},{v:"perimenopause",l:"Perimenopause",i:"🌡️"},
        {v:"none",l:"None",i:"✓"},
      ]},
    ],
  },
  {
    id:"diet_style", title:"Your eating style", sub:"How do you prefer to fuel your body?",
    fields:[
      {key:"dietStyle", type:"multi", label:"Dietary approach", opts:[
        {v:"balanced",l:"Balanced / everything",i:"⚖️"},{v:"keto",l:"Keto (high fat, very low carb)",i:"🥑"},
        {v:"low_carb",l:"Low carb",i:"📉"},{v:"high_protein",l:"High protein",i:"🥩"},
        {v:"mediterranean",l:"Mediterranean",i:"🫒"},{v:"paleo",l:"Paleo",i:"🦴"},
        {v:"plant_based",l:"Plant-based / vegan",i:"🌿"},{v:"vegetarian",l:"Vegetarian",i:"🥦"},
        {v:"carnivore",l:"Carnivore",i:"🔥"},{v:"if",l:"Intermittent fasting",i:"⏱️"},
        {v:"cycle_sync",l:"Cycle syncing",i:"🔁"},
      ]},
      {key:"macroFocus", type:"select", label:"Today's macro focus", opts:[
        "Balanced macros",
        "Higher protein (training day)",
        "Higher fat (keto / fat-adaptation day)",
        "Higher carb (refeed / endurance day)",
        "Lower calorie / lighter day",
      ]},
    ],
  },
  {
    id:"restrictions", title:"Foods to avoid", sub:"We'll make sure your plan respects these completely",
    fields:[
      {key:"allergies", type:"multi", label:"Allergies & intolerances", opts:[
        {v:"gluten",l:"Gluten / wheat",i:"🌾"},{v:"dairy",l:"Dairy / lactose",i:"🥛"},
        {v:"eggs",l:"Eggs",i:"🥚"},{v:"tree_nuts",l:"Tree nuts",i:"🌰"},
        {v:"peanuts",l:"Peanuts",i:"🥜"},{v:"soy",l:"Soy",i:"🫘"},
        {v:"shellfish",l:"Shellfish",i:"🦐"},{v:"fish",l:"Fish",i:"🐟"},
        {v:"nightshades",l:"Nightshades",i:"🍅"},{v:"corn",l:"Corn",i:"🌽"},
        {v:"none",l:"None",i:"✓"},
      ]},
      {key:"fodmap", type:"select", label:"Low-FODMAP diet?", opts:[
        "No — I eat everything",
        "Yes — strictly low-FODMAP (IBS/SIBO)",
        "Partially — avoiding my triggers",
        "Still figuring it out",
      ]},
      {key:"fodmapTriggers", type:"multi", label:"FODMAP triggers (if known)", showIf:{key:"fodmap",vals:["Yes — strictly low-FODMAP (IBS/SIBO)","Partially — avoiding my triggers","Still figuring it out"]}, opts:[
        {v:"onion_garlic",l:"Onion & garlic",i:"🧅"},{v:"lactose",l:"Lactose",i:"🥛"},
        {v:"fructose",l:"Excess fructose",i:"🍎"},{v:"legumes",l:"Legumes / pulses",i:"🫘"},
        {v:"polyols",l:"Polyols (stone fruits)",i:"🍑"},{v:"wheat_fodmap",l:"Wheat / rye",i:"🌾"},
        {v:"cruciferous",l:"Cruciferous veg",i:"🥦"},{v:"none",l:"None / unsure",i:"❓"},
      ]},
      {key:"otherSensitivities", type:"multi", label:"Other sensitivities", opts:[
        {v:"histamine",l:"Histamine intolerance",i:"🤧"},{v:"salicylates",l:"Salicylates",i:"🌿"},
        {v:"oxalates",l:"High-oxalate foods",i:"🍃"},{v:"caffeine",l:"Caffeine sensitive",i:"☕"},
        {v:"sulfites",l:"Sulfites",i:"🍷"},{v:"msg",l:"MSG",i:"🧂"},
        {v:"none",l:"None",i:"✓"},
      ]},
    ],
  },
  {
    id:"preferences", title:"Tastes & lifestyle", sub:"Help us find foods you'll actually enjoy",
    fields:[
      {key:"cuisines", type:"multi", label:"Favourite cuisines", opts:[
        {v:"asian",l:"Asian",i:"🍜"},{v:"mediterranean",l:"Mediterranean",i:"🫒"},
        {v:"mexican",l:"Mexican",i:"🌮"},{v:"american",l:"American",i:"🍔"},
        {v:"indian",l:"Indian",i:"🍛"},{v:"middle_eastern",l:"Middle Eastern",i:"🧆"},
        {v:"japanese",l:"Japanese",i:"🍱"},{v:"italian",l:"Italian",i:"🍝"},
        {v:"no_preference",l:"No preference",i:"🌍"},
      ]},
      {key:"prepTime", type:"select", label:"Max prep time per meal", opts:[
        "Under 10 minutes","10–20 minutes","20–35 minutes","I enjoy cooking — up to an hour",
      ]},
    ],
  },
];

/* ─── Theme ──────────────────────────────────────────────────── */
const getTheme = (profile={}) => {
  const phase = (profile.cyclePhase||"").toLowerCase();
  const diets = profile.dietStyle||[];
  const conds = profile.hormoneConditions||[];
  if (phase.includes("luteal")||conds.includes("pmdd"))  return {bg:"linear-gradient(135deg,#1c0d2e,#130a24,#1a0d28)",a:"#b06be8",rgb:"176,107,232",label:"Luteal · PMDD aware",icon:"🌘"};
  if (phase.includes("follicular"))                       return {bg:"linear-gradient(135deg,#0d1f2e,#0a1824,#0c1e2c)",a:"#5bb3e8",rgb:"91,179,232",label:"Follicular · Rising energy",icon:"🌱"};
  if (phase.includes("ovulat"))                          return {bg:"linear-gradient(135deg,#1a2010,#141c0c,#182012)",a:"#82c45a",rgb:"130,196,90",label:"Ovulation · Peak vitality",icon:"🌕"};
  if (phase.includes("menstrual"))                       return {bg:"linear-gradient(135deg,#2a0d10,#200a0c,#2c0e10)",a:"#e86b6b",rgb:"232,107,107",label:"Menstrual · Rest & restore",icon:"🌑"};
  if (diets.includes("keto"))                            return {bg:"linear-gradient(135deg,#1a1508,#141005,#1c180a)",a:"#e8b45b",rgb:"232,180,91",label:"Keto · High fat",icon:"🥑"};
  if (diets.includes("carnivore")||diets.includes("high_protein")) return {bg:"linear-gradient(135deg,#1f0d08,#180a06,#221008)",a:"#e87a5b",rgb:"232,122,91",label:"High protein",icon:"🥩"};
  if (diets.includes("plant_based")||diets.includes("vegetarian")) return {bg:"linear-gradient(135deg,#0d1f12,#0a180e,#0c1e10)",a:"#5be88a",rgb:"91,232,138",label:"Plant-based",icon:"🌿"};
  return {bg:"linear-gradient(135deg,#111827,#0d1420,#111826)",a:"#60a5fa",rgb:"96,165,250",label:"Balanced",icon:"⚖️"};
};

/* ─── BMI & Macro calculations ───────────────────────────────── */
const calcBMI = (weightKg, heightCm) => {
  if (!weightKg || !heightCm) return null;
  const h = heightCm / 100;
  return +(weightKg / (h * h)).toFixed(1);
};

const getBMICategory = (bmi) => {
  if (!bmi) return null;
  if (bmi < 18.5) return {label:"Underweight",color:"#60a5fa",advice:"Prioritise nutrient-dense calorie surplus foods."};
  if (bmi < 25)   return {label:"Healthy weight",color:"#4ade80",advice:"Focus on maintenance and optimising food quality."};
  if (bmi < 30)   return {label:"Overweight",color:"#fb923c",advice:"A moderate calorie deficit with high protein will support fat loss."};
  return           {label:"Obese",color:"#f87171",advice:"A structured deficit with medical support is recommended."};
};

const calcMacros = (profile) => {
  const w      = parseFloat(profile.weightKg) || 70;
  const h      = parseFloat(profile.heightCm) || 170;
  const gw     = parseFloat(profile.goalWeightKg) || w;
  const isFemale = profile.sex === "Female";
  const isKeto   = (profile.dietStyle||[]).includes("keto");
  const isCarn   = (profile.dietStyle||[]).includes("carnivore");
  const isPlant  = (profile.dietStyle||[]).includes("plant_based")||(profile.dietStyle||[]).includes("vegetarian");
  const hasGoal  = (v) => (profile.goals||[]).includes(v);
  const isHighProt = (profile.dietStyle||[]).includes("high_protein")||(profile.macroFocus||"").includes("protein");

  // Age midpoint
  const ageMap = {"Under 18":16,"18–25":22,"26–35":30,"36–45":40,"46–55":50,"56+":62};
  const age = ageMap[profile.age] || 30;

  // BMR — Mifflin-St Jeor
  const bmr = isFemale
    ? 10*w + 6.25*h - 5*age - 161
    : 10*w + 6.25*h - 5*age + 5;

  // Activity multiplier
  const actMult = {
    "Sedentary":1.2,
    "Lightly active":1.375,
    "Moderately active":1.55,
    "Very active":1.725,
    "Athlete":1.9,
  };
  const actKey = Object.keys(actMult).find(k => (profile.activity||"").includes(k)) || "Moderately active";
  const tdee = Math.round(bmr * actMult[actKey]);

  // Calorie target based on goal
  let targetCal = tdee;
  if (hasGoal("lose_weight"))   targetCal = Math.max(1200, tdee - 400);
  if (hasGoal("build_muscle"))  targetCal = tdee + 250;
  if ((profile.macroFocus||"").includes("Lower calorie")) targetCal = Math.max(1200, tdee - 600);

  // Macro split
  let protPct, fatPct, carbPct;
  if (isKeto)          { protPct=0.25; fatPct=0.70; carbPct=0.05; }
  else if (isCarn)     { protPct=0.40; fatPct=0.60; carbPct=0.00; }
  else if (isHighProt) { protPct=0.35; fatPct=0.25; carbPct=0.40; }
  else if (hasGoal("lose_weight") && !isPlant) { protPct=0.30; fatPct=0.30; carbPct=0.40; }
  else if (hasGoal("build_muscle")) { protPct=0.30; fatPct=0.25; carbPct=0.45; }
  else if (isPlant)    { protPct=0.20; fatPct=0.30; carbPct=0.50; }
  else                 { protPct=0.25; fatPct=0.30; carbPct=0.45; }

  const protCal = Math.round(targetCal * protPct);
  const fatCal  = Math.round(targetCal * fatPct);
  const carbCal = Math.round(targetCal * carbPct);

  const protG = Math.round(protCal / 4);
  const fatG  = Math.round(fatCal  / 9);
  const carbG = Math.round(carbCal / 4);

  // Per-kg protein check
  const minProtG = Math.round(w * (hasGoal("build_muscle") || isHighProt ? 2.0 : 1.6));
  const finalProtG = Math.max(protG, minProtG);

  // Water
  const waterMl = Math.round(w * 35);

  // Weeks to goal
  const weightDiff = w - gw;
  const weeksToGoal = weightDiff > 0
    ? Math.round(Math.abs(weightDiff) / 0.5)  // ~0.5kg/week healthy loss
    : weightDiff < 0
    ? Math.round(Math.abs(weightDiff) / 0.25) // ~0.25kg/week healthy gain
    : null;

  return {
    tdee, targetCal, protG:finalProtG, fatG, carbG,
    protPct:Math.round(protPct*100), fatPct:Math.round(fatPct*100), carbPct:Math.round(carbPct*100),
    waterMl, weeksToGoal, weightDiff,
    fibreG: Math.round(targetCal / 1000 * 14), // 14g per 1000 kcal
  };
};

/* ─── Food plan builder ──────────────────────────────────────── */
const buildPlan = (profile, macros) => {
  const has  = (key,val) => (profile[key]||[]).includes(val);
  const hasA = (v) => has("allergies",v);
  const hasD = (v) => has("dietStyle",v);
  const hasG = (v) => has("goals",v);
  const hasC = (v) => has("hormoneConditions",v);
  const hasF = (v) => has("fodmapTriggers",v);
  const hasS = (v) => has("otherSensitivities",v);
  const phase = (profile.cyclePhase||"").toLowerCase();
  const isLuteal     = phase.includes("luteal")||hasC("pmdd");
  const isFollicular = phase.includes("follicular");
  const isOvulation  = phase.includes("ovulat");
  const isMenstrual  = phase.includes("menstrual");
  const isKeto       = hasD("keto");
  const isPlant      = hasD("plant_based")||hasD("vegetarian");
  const isCarnivore  = hasD("carnivore");
  const isHighProt   = hasD("high_protein")||(profile.macroFocus||"").includes("protein");
  const isLowFodmap  = (profile.fodmap||"").includes("strictly")||(profile.fodmap||"").includes("Partially");
  const isHistamine  = hasS("histamine");
  const noGluten     = hasA("gluten");
  const noDairy      = hasA("dairy");
  const noEggs       = hasA("eggs");
  const noNuts       = hasA("tree_nuts")&&hasA("peanuts");
  const noFish       = hasA("fish");

  const proteins = [];
  if (!isPlant) {
    if (!isHistamine&&!noFish) proteins.push({name:"Salmon (150g)",why:"Omega-3s, B12, vitamin D — anti-inflammatory, ~34g protein",cat:"Fish 🐟",protG:34});
    proteins.push({name:"Chicken breast (150g)",why:"Lean complete protein, mild flavour, works in any cuisine, ~46g protein",cat:"Poultry 🍗",protG:46});
    proteins.push({name:"Turkey mince (150g)",why:"High protein, low fat, rich in tryptophan for mood support, ~42g protein",cat:"Poultry 🍗",protG:42});
    if (!isHistamine&&!noFish) proteins.push({name:"Sardines (1 can, 100g)",why:"Calcium, omega-3, B12 — ~25g protein in one inexpensive tin",cat:"Fish 🐟",protG:25});
    if (!isCarnivore&&!isKeto&&(!isLowFodmap||!hasF("legumes"))) proteins.push({name:"Lentils (200g cooked)",why:"Plant protein + iron + fibre in one, ~18g protein",cat:"Legume 🫘",protG:18});
  }
  if (!noEggs&&!isPlant) proteins.push({name:"Eggs (2 large)",why:"Choline, B vitamins, complete amino acid profile, ~12g protein",cat:"Egg 🥚",protG:12});
  if (isPlant||hasG("gut_health")) {
    if (!isLowFodmap||!hasF("legumes")) proteins.push({name:"Tempeh (150g)",why:"Fermented soy protein with gut-friendly probiotics, ~24g protein",cat:"Plant 🌿",protG:24});
    proteins.push({name:"Hemp seeds (3 tbsp, 30g)",why:"Complete plant protein with omega-3 balance, ~10g protein",cat:"Seed 🌱",protG:10});
    proteins.push({name:"Tofu (150g)",why:"Versatile neutral protein, high calcium, ~12g protein",cat:"Plant 🌿",protG:12});
  }
  if (isHighProt||isCarnivore) proteins.push({name:"Beef, grass-fed (150g)",why:"Creatine, zinc, iron, B12 — ideal for muscle and energy, ~38g protein",cat:"Meat 🥩",protG:38});
  if (isHighProt||hasG("build_muscle")) proteins.push({name:"Greek yogurt (200g)",why:"~20g protein, calcium, probiotics — ideal post-workout",cat:"Dairy 🥛",protG:20});

  const carbs = [];
  if (!isKeto&&!isCarnivore) {
    if (!noGluten) carbs.push({name:"Oats (80g dry)",why:"Beta-glucan fibre lowers cholesterol and steadies blood sugar, ~55g carbs",carbG:55});
    carbs.push({name:"Sweet potato (200g)",why:"Complex carbs, beta-carotene, potassium — sustaining energy, ~40g carbs",carbG:40});
    carbs.push({name:"Quinoa (185g cooked)",why:"Complete protein grain — all 9 essential amino acids, naturally GF, ~40g carbs",carbG:40});
    carbs.push({name:"Brown rice (185g cooked)",why:"Magnesium, B vitamins, slow-digesting energy source, ~45g carbs",carbG:45});
    if (!isLowFodmap||!hasF("legumes")) carbs.push({name:"Black beans (150g cooked)",why:"High fibre + protein combo that feeds gut microbiome, ~24g carbs",carbG:24});
    if (!isLowFodmap||!hasF("legumes")) carbs.push({name:"Chickpeas (150g cooked)",why:"Resistant starch, folate, manganese, ~30g carbs",carbG:30});
  }
  if (isKeto) {
    carbs.push({name:"Cauliflower (unlimited)",why:"The ultimate low-carb swap — mash, rice, pizza base, ~5g net carbs/100g",carbG:5});
    carbs.push({name:"Courgette (unlimited)",why:"Near-zero carb, high water, versatile, ~3g net carbs/100g",carbG:3});
    carbs.push({name:"Shirataki noodles (200g)",why:"Near-zero carb konjac noodles, ~1g net carbs",carbG:1});
    carbs.push({name:"Berries (80g)",why:"Lowest carb fruit — antioxidants, ~8g net carbs, fits ketogenic budget",carbG:8});
  }

  const fats = [];
  fats.push({name:"Avocado (½ medium)",why:"Monounsaturated fat, potassium, folate — anti-inflammatory, ~15g fat",fatG:15});
  if (!isHistamine) fats.push({name:"Extra virgin olive oil (1 tbsp)",why:"Oleocanthal has ibuprofen-like anti-inflammatory effects, ~14g fat",fatG:14});
  if (!noNuts&&!isHistamine) fats.push({name:"Walnuts (30g)",why:"ALA omega-3, antioxidants, supports brain and mood, ~18g fat",fatG:18});
  if (!noNuts) fats.push({name:"Almonds (30g)",why:"Vitamin E, magnesium, calcium — hormone supporting, ~15g fat",fatG:15});
  fats.push({name:"Pumpkin seeds (30g)",why:"Highest plant source of magnesium + zinc — key for PMDD, sleep, immunity, ~13g fat",fatG:13});
  fats.push({name:"Chia seeds (2 tbsp, 20g)",why:"Omega-3, fibre, calcium — easy to add to anything, ~8g fat",fatG:8});
  fats.push({name:"Ground flaxseed (2 tbsp, 15g)",why:"Lignans support hormone balance; omega-3 for non-fish eaters, ~6g fat",fatG:6});
  if (!noDairy&&!isHistamine) fats.push({name:"Full-fat Greek yogurt (200g)",why:"Protein + probiotics + calcium, ~10g fat",fatG:10});
  if (isKeto||isCarnivore) fats.push({name:"Ghee or butter, grass-fed (1 tbsp)",why:"Fat-soluble vitamins A, D, E, K2 — clean keto fuel, ~12g fat",fatG:12});
  if (isKeto) fats.push({name:"MCT oil (1 tbsp)",why:"Fast-burning MCTs convert to ketones efficiently, ~14g fat",fatG:14});

  const vegs = [];
  if (!isLowFodmap||!hasF("cruciferous")) vegs.push({name:"Broccoli",why:"DIM supports oestrogen metabolism; vitamin C, K, folate"});
  if (!isHistamine) vegs.push({name:"Spinach",why:"Iron, folate, magnesium — but limit if histamine sensitive"});
  vegs.push({name:"Kale",why:"Calcium, vitamin K, anti-inflammatory — great bone support"});
  vegs.push({name:"Courgette / zucchini",why:"Very low calorie, high water, FODMAP-friendly filler"});
  vegs.push({name:"Cucumber",why:"Anti-bloat, hydrating, potassium — reduces water retention"});
  vegs.push({name:"Fennel",why:"Natural digestive aid, anti-bloat, mild anise flavour"});
  if (!isLowFodmap||!hasF("onion_garlic")) vegs.push({name:"Garlic",why:"Allicin has potent antimicrobial and immune-boosting properties"});
  vegs.push({name:"Ginger (fresh)",why:"Reduces bloating, nausea, inflammation — gut and hormone friend"});
  vegs.push({name:"Turmeric",why:"Curcumin is one of the most studied anti-inflammatory compounds"});
  vegs.push({name:"Asparagus",why:"Natural diuretic — helps flush water retention; prebiotic fibre"});
  vegs.push({name:"Beetroot",why:"Nitrates improve blood flow and endurance performance"});
  if (!isLowFodmap||!hasF("cruciferous")) vegs.push({name:"Brussels sprouts",why:"Supports liver detox — key for hormone clearance"});

  const nutrients = [];
  if (isLuteal||hasC("pmdd"))     nutrients.push({name:"Magnesium",target:"400mg/day",where:"Pumpkin seeds (156mg/30g), dark chocolate 85%+ (64mg/30g), avocado (58mg), spinach (78mg/100g cooked), almonds (80mg/30g)"});
  if (isLuteal||hasC("pmdd"))     nutrients.push({name:"Vitamin B6",target:"50–100mg/day",where:"Salmon (0.9mg/100g), chicken (0.7mg/100g), turkey (0.6mg/100g), banana (0.4mg), sweet potato (0.3mg)"});
  if (isLuteal||hasC("pmdd"))     nutrients.push({name:"Calcium",target:"1200mg/day",where:"Sardines (382mg/100g), kale (150mg/100g), almonds (76mg/30g), fortified oat milk (120mg/100ml)"});
  if (hasG("reduce_inflammation")||isLuteal) nutrients.push({name:"Omega-3 (EPA+DHA)",target:"2g/day",where:"Salmon (2.2g/100g), sardines (1.5g/100g), mackerel (2.5g/100g), or daily fish oil supplement"});
  if (hasG("energy")||isMenstrual) nutrients.push({name:"Iron",target:`${profile.sex==="Female"?"18mg":"8mg"}/day`,where:"Beef liver (6.5mg/100g), lentils (3.3mg/100g), spinach (3.6mg/100g) — always pair with vitamin C"});
  if (hasG("build_muscle")||isHighProt) nutrients.push({name:"Leucine (key BCAA)",target:"3g per meal minimum",where:"Whey protein, chicken breast, tuna, eggs, lentils — triggers muscle protein synthesis"});
  if (hasG("gut_health")||isLowFodmap) nutrients.push({name:"Prebiotic fibre",target:`${macros.fibreG}g/day`,where:"Oats, chia, flaxseed (if tolerated), asparagus, green banana — feed your microbiome"});
  if (hasC("pcos"))    nutrients.push({name:"Inositol (myo- + D-chiro)",target:"2000mg + 50mg daily",where:"Supplement form primarily. Food: grapefruit, cantaloupe, buckwheat, beans"});
  if (hasC("hypothyroid")) nutrients.push({name:"Selenium + Iodine",target:"55mcg selenium / 150mcg iodine daily",where:"2 Brazil nuts/day (selenium), seaweed, white fish (iodine)"});
  if (hasG("mental_clarity")) nutrients.push({name:"Choline",target:"400–550mg/day",where:"Eggs (147mg each), liver, salmon (65mg/100g), soybeans"});
  if (!nutrients.length) {
    nutrients.push({name:"Protein",target:`${macros.protG}g/day`,where:"Chicken, eggs, fish, legumes, dairy, tempeh"});
    nutrients.push({name:"Fibre",target:`${macros.fibreG}g/day`,where:"Vegetables, legumes, whole grains, chia, flaxseed"});
    nutrients.push({name:"Omega-3",target:"1–2g EPA+DHA/day",where:"Fatty fish 2–3x/week or fish oil supplement"});
  }

  const avoid = [];
  if (noGluten)    avoid.push({food:"Gluten / wheat",reason:"Allergy or intolerance — causes inflammation and gut damage",swap:"Quinoa, rice, certified GF oats, buckwheat, cassava flour"});
  if (noDairy)     avoid.push({food:"Dairy products",reason:"Intolerance — bloating, inflammation",swap:"Oat milk, almond milk, coconut yogurt, cashew cheese"});
  if (noEggs)      avoid.push({food:"Eggs",reason:"Allergy or intolerance",swap:"Flax egg (1 tbsp ground flax + 3 tbsp water) for baking"});
  if (noFish)      avoid.push({food:"All fish & seafood",reason:"Allergy or intolerance",swap:"Algae-based omega-3 supplements, flaxseed, chia"});
  if (isHistamine) avoid.push({food:"High-histamine foods",reason:"Histamine intolerance — hives, headaches, flushing",swap:"Fresh-only meats, cooked-and-eaten-immediately veg, no fermented/aged foods"});
  if (isLowFodmap) {
    if (hasF("onion_garlic")) avoid.push({food:"Onion & garlic",reason:"High-fructan FODMAP trigger",swap:"Garlic-infused oil (FODMAP-safe), chives, spring onion greens only"});
    if (hasF("legumes"))      avoid.push({food:"Legumes & pulses (large portions)",reason:"High GOS FODMAP trigger",swap:"Canned lentils rinsed well in small portions (½ cup often tolerated)"});
    if (hasF("cruciferous"))  avoid.push({food:"Cruciferous veg in large amounts",reason:"High FODMAP trigger for some",swap:"Courgette, carrot, bean sprouts, bok choy — all low-FODMAP"});
    if (hasF("lactose"))      avoid.push({food:"Lactose-containing dairy",reason:"Lactose is a high-FODMAP sugar",swap:"Hard cheeses, lactose-free milk, coconut yogurt (FODMAP-safe)"});
    if (hasF("fructose"))     avoid.push({food:"High-fructose foods (apples, honey, mango)",reason:"Excess fructose FODMAP trigger",swap:"Blueberries, strawberries, kiwi, oranges — all low-FODMAP"});
  }
  if (isKeto) avoid.push({food:"Grains, sugar, most fruit, legumes",reason:"Keep net carbs under 20g/day for ketosis",swap:"Berries in small amounts, cauliflower rice, courgette noodles, monk fruit sweetener"});

  const hydration = [
    {tip:`Drink ${macros.waterMl}ml (${(macros.waterMl/1000).toFixed(1)}L) of water daily`,reason:"Calculated at 35ml per kg of your body weight"},
    {tip:"Start every morning with 500ml water before anything else",reason:"Rehydrates after overnight fast and kickstarts metabolism"},
  ];
  if (isLuteal) hydration.push({tip:"Replace coffee with ginger or dandelion root tea in the luteal phase",reason:"Caffeine amplifies anxiety and cortisol when progesterone is high"});
  if (isKeto)   hydration.push({tip:"Add a daily electrolyte supplement (sodium, potassium, magnesium)",reason:"Keto causes kidneys to excrete more sodium — prevents keto flu and cramps"});
  if (isHighProt||hasG("build_muscle")) hydration.push({tip:"Add 200ml extra water per 10g of protein above 100g",reason:"High protein increases kidney filtration demand"});

  // Phase section
  const phaseSection = (() => {
    if (isLuteal) return {
      title:"Luteal phase priorities",icon:"🌘",
      intro:"Progesterone peaks then drops. Serotonin falls. Cortisol rises. Your body needs more calories and specific nutrients to ease PMDD symptoms.",
      focus:[
        {name:"Magnesium-rich foods",examples:"Pumpkin seeds, dark chocolate (85%+), avocado, spinach, brown rice",why:"Reduces cramps, anxiety, headaches and improves sleep quality"},
        {name:"Vitamin B6 sources",examples:"Salmon, chicken, turkey, banana, sweet potato, sunflower seeds",why:"Critical for serotonin production — directly reduces PMDD mood symptoms"},
        {name:"Calcium-rich foods",examples:"Sardines, kale, bok choy, fortified oat milk, almonds",why:"Studies show 1200mg/day reduces PMDD symptoms significantly"},
        {name:"Complex slow carbs",examples:"Sweet potato, brown rice, oats, quinoa, lentils",why:"Stabilise serotonin naturally without blood sugar spikes"},
        {name:"Anti-bloat foods",examples:"Cucumber, fennel, asparagus, ginger, lemon, parsley, dandelion tea",why:"Counteract water retention caused by progesterone and aldosterone"},
        {name:"Omega-3 sources",examples:"Salmon, sardines, chia seeds, flaxseed, walnuts",why:"Reduces prostaglandins — less cramping, less inflammation"},
      ],
      avoid:["High sodium (bloating)","Refined sugar (serotonin crashes)","Alcohol (worsens anxiety)","Excess caffeine","Ultra-processed foods"],
    };
    if (isFollicular) return {
      title:"Follicular phase priorities",icon:"🌱",
      intro:"Oestrogen is rising. Energy, mood and metabolism are improving. Best time to push harder in training and try new foods.",
      focus:[
        {name:"Iron-rich foods",examples:"Lean red meat, liver, spinach, lentils, pumpkin seeds",why:"Replenish iron lost during menstruation to restore energy"},
        {name:"Phytoestrogen foods",examples:"Flaxseed, edamame, sesame seeds, tempeh",why:"Support rising oestrogen in the first half of your cycle"},
        {name:"Fermented foods",examples:"Kefir, kimchi, sauerkraut, kombucha, live yogurt",why:"Boost microbiome diversity — gut health influences oestrogen metabolism"},
        {name:"Fresh leafy greens",examples:"Spinach, rocket, watercress, mixed leaves",why:"Folate and B vitamins support cell renewal and hormone synthesis"},
        {name:"Higher carb foods",examples:"Oats, brown rice, fruit, sweet potato",why:"Your body uses carbs more efficiently now — good time for higher carb days"},
      ],
      avoid:["Heavily processed foods","Excessive alcohol","Trans fats"],
    };
    if (isOvulation) return {
      title:"Ovulation phase priorities",icon:"🌕",
      intro:"Peak oestrogen. You feel your best. Support your peak with antioxidant-rich, anti-inflammatory foods.",
      focus:[
        {name:"Antioxidant-rich foods",examples:"Berries, pomegranate, dark cherries, colourful veg, green tea",why:"Protect eggs from oxidative stress during peak fertility window"},
        {name:"Zinc-rich foods",examples:"Oysters, pumpkin seeds, beef, chickpeas, cashews",why:"Zinc surges trigger ovulation and support healthy egg maturation"},
        {name:"Cruciferous vegetables",examples:"Broccoli, cauliflower, Brussels sprouts, cabbage",why:"DIM compound helps liver metabolise oestrogen to prevent dominance"},
        {name:"Fibre-rich foods",examples:"Flaxseed, chia, legumes, oats",why:"Binds excess oestrogen in the gut for excretion"},
        {name:"Light, cooling foods",examples:"Cucumber, watermelon, salads, smoothie bowls",why:"Body temperature is slightly higher at ovulation — lighter foods feel good"},
      ],
      avoid:["Heavy fried foods","Excess red meat","Alcohol (disrupts ovulation)"],
    };
    if (isMenstrual) return {
      title:"Menstrual phase priorities",icon:"🌑",
      intro:"The body is shedding. Energy is naturally lower. Focus on warmth, restoration, and replacing what's lost — especially iron.",
      focus:[
        {name:"Iron-rich foods",examples:"Grass-fed beef, liver, spinach, lentils, pumpkin seeds, dark chocolate",why:"Replace iron lost in bleeding — prevents fatigue and brain fog"},
        {name:"Vitamin C (enhances iron absorption)",examples:"Bell peppers, citrus, kiwi, strawberries, broccoli",why:"Pair with iron foods — vitamin C dramatically increases iron absorption"},
        {name:"Warming anti-inflammatory foods",examples:"Ginger tea, turmeric, bone broth, soups and stews",why:"Reduce prostaglandins (cramping), support warmth, ease digestion"},
        {name:"Magnesium",examples:"Dark chocolate, avocado, pumpkin seeds, almonds, brown rice",why:"Eases cramping, improves sleep quality and reduces headaches"},
        {name:"Easy-to-digest meals",examples:"Soups, stews, steamed vegetables, slow-cooked proteins",why:"Digestive capacity is lower now — lighter cooking methods feel better"},
      ],
      avoid:["Excess salt (bloating)","Caffeine (constricts blood vessels, increases cramps)","Alcohol","Cold raw foods (increase cramping for some)"],
    };
    return null;
  })();

  return {proteins, carbs, fats, vegs, nutrients, avoid, hydration, phaseSection};
};

/* ─── Storage helpers (localStorage) ────────────────────────── */
const LS_KEY = "nourish_profiles";

const saveProfile = (profile) => {
  try {
    const all = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    const key = "profile_" + Date.now();
    all[key] = { ...profile, savedAt: new Date().toISOString() };
    localStorage.setItem(LS_KEY, JSON.stringify(all));
    return key;
  } catch(e) { console.error("Save failed:", e); return null; }
};

const loadProfiles = () => {
  try {
    const all = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    return Object.entries(all)
      .map(([key, val]) => ({ key, ...val }))
      .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
  } catch(e) { return []; }
};

const deleteProfile = (key) => {
  try {
    const all = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    delete all[key];
    localStorage.setItem(LS_KEY, JSON.stringify(all));
    return true;
  } catch(e) { return false; }
};

/* ══════════════════════════════════════════════════════════════
   APP
══════════════════════════════════════════════════════════════ */
export default function NourishAI() {
  const [screen, setScreen]         = useState("landing");
  const [step, setStep]             = useState(0);
  const [profile, setProfile]       = useState({});
  const [theme, setTheme]           = useState(getTheme({}));
  const [plan, setPlan]             = useState(null);
  const [macros, setMacros]         = useState(null);
  const [openSection, setOpenSection] = useState("overview");
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // null | "saving" | "saved" | "error"
  const [confirmDelete, setConfirmDelete] = useState(null);

  const mono = {fontFamily:"'IBM Plex Mono', monospace"};
  const T = theme;

  useEffect(() => { injectStyles(); }, []);
  useEffect(() => { setTheme(getTheme(profile)); }, [profile]);

  const setField = (key, val) => setProfile(p => ({...p, [key]: val}));
  const toggleMulti = (key, val) => {
    setProfile(p => {
      const cur = p[key]||[];
      if (val==="none") return {...p,[key]:["none"]};
      const base = cur.filter(v=>v!=="none");
      return {...p,[key]:base.includes(val)?base.filter(v=>v!==val):[...base,val]};
    });
  };

  const progress = (step / QUIZ.length) * 100;
  const canProceed = step > 0 || (profile.name && profile.name.trim().length > 0);

  const finishQuiz = () => {
    const m = calcMacros(profile);
    const p = buildPlan(profile, m);
    setMacros(m);
    setPlan(p);
    setSaveStatus("saving");
    const key = saveProfile(profile);
    setSaveStatus(key ? "saved" : "error");
    setTimeout(() => setSaveStatus(null), 3000);
    setScreen("plan");
    setOpenSection("overview");
  };

  const loadSavedProfiles = () => {
    setProfilesLoading(true);
    const profiles = loadProfiles();
    setSavedProfiles(profiles);
    setProfilesLoading(false);
  };

  const loadProfile = (p) => {
    const {key, savedAt, ...profileData} = p;
    setProfile(profileData);
    const m = calcMacros(profileData);
    const pl = buildPlan(profileData, m);
    setMacros(m);
    setPlan(pl);
    setScreen("plan");
    setOpenSection("overview");
  };

  const handleDelete = (key) => {
    deleteProfile(key);
    setSavedProfiles(prev => prev.filter(p => p.key !== key));
    setConfirmDelete(null);
  };

  // BMI data
  const bmi = calcBMI(parseFloat(profile.weightKg), parseFloat(profile.heightCm));
  const bmiCat = getBMICategory(bmi);

  /* ─── Reusable components ─── */
  const Accordion = ({id, title, icon, badge, children}) => {
    const open = openSection === id;
    return (
      <div style={{background:`rgba(${T.rgb},0.06)`,border:`1px solid rgba(${T.rgb},0.14)`,borderRadius:16,overflow:"hidden",marginBottom:10}}>
        <div onClick={() => setOpenSection(open?null:id)} style={{padding:"16px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:18}}>{icon}</span>
            <span style={{fontSize:17,fontWeight:400}}>{title}</span>
            {badge && <span style={{...mono,fontSize:10,color:`rgba(${T.rgb},0.9)`,background:`rgba(${T.rgb},0.12)`,borderRadius:100,padding:"2px 10px"}}>{badge}</span>}
          </div>
          <span style={{color:"rgba(255,255,255,0.3)",fontSize:12,transition:"transform 0.2s",display:"inline-block",transform:open?"rotate(180deg)":"none"}}>▼</span>
        </div>
        {open && <div style={{padding:"0 18px 18px",animation:"fadeUp 0.25s ease"}}>{children}</div>}
      </div>
    );
  };

  const MacroBar = ({label, grams, pct, color, cal}) => (
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:6}}>
        <span style={{fontSize:15,color:"white"}}>{label}</span>
        <div style={{textAlign:"right"}}>
          <span style={{...mono,fontSize:18,color,fontWeight:500}}>{grams}g</span>
          <span style={{...mono,fontSize:11,color:"rgba(255,255,255,0.35)",marginLeft:6}}>{pct}% · {cal} kcal</span>
        </div>
      </div>
      <div style={{background:"rgba(255,255,255,0.07)",borderRadius:100,height:8,overflow:"hidden"}}>
        <div style={{height:"100%",borderRadius:100,width:`${pct}%`,background:color,boxShadow:`0 0 8px ${color}60`,transition:"width 1s ease"}} />
      </div>
    </div>
  );

  const FoodCard = ({item}) => (
    <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"12px 14px",marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4,gap:8}}>
        <span style={{fontSize:15,color:"white",fontWeight:400}}>{item.name}</span>
        {item.cat && <span style={{...mono,fontSize:9,color:`rgba(${T.rgb},0.85)`,background:`rgba(${T.rgb},0.1)`,borderRadius:100,padding:"2px 8px",whiteSpace:"nowrap",flexShrink:0}}>{item.cat}</span>}
      </div>
      <p style={{...mono,fontSize:11,color:"rgba(255,255,255,0.45)",lineHeight:1.55}}>{item.why}</p>
    </div>
  );

  /* ─── LANDING ─────────────────────────────────────────────── */
  if (screen === "landing") return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'Playfair Display', serif",color:"#f0ece8",display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 24px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",width:600,height:600,borderRadius:"50%",background:`radial-gradient(circle,rgba(${T.rgb},0.1) 0%,transparent 70%)`,top:"50%",left:"50%",transform:"translate(-50%,-50%)",pointerEvents:"none",animation:"float 10s ease-in-out infinite"}} />
      <div className="fade-up" style={{position:"relative",maxWidth:460,width:"100%",textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:20,animation:"float 6s ease-in-out infinite"}}>✦</div>
        <h1 style={{fontSize:44,fontWeight:400,lineHeight:1.15,marginBottom:10}}>
          What your body<br/><em style={{color:T.a}}>actually needs</em>
        </h1>
        <p style={{...mono,fontSize:11,color:"rgba(255,255,255,0.3)",letterSpacing:2.5,textTransform:"uppercase",marginBottom:20}}>
          personalized · hormone-aware · gut-friendly
        </p>
        <p style={{fontSize:15,color:"rgba(255,255,255,0.5)",lineHeight:1.75,marginBottom:32}}>
          A short questionnaire about your body, goals, cycle and sensitivities — then a precision food focus guide with calorie targets, macro splits, and specific quantities.
        </p>
        <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:7,marginBottom:32}}>
          {["BMI-calibrated","Macro targets","Gluten-free","Low-FODMAP","Keto","Vegan","PMDD","PCOS","High protein"].map(t => (
            <span key={t} style={{...mono,fontSize:10,color:"rgba(255,255,255,0.35)",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:100,padding:"4px 12px"}}>{t}</span>
          ))}
        </div>
        <button className="btn" onClick={() => setScreen("quiz")} style={{width:"100%",padding:"18px",borderRadius:14,background:`linear-gradient(135deg,${T.a},${T.a}bb)`,fontFamily:"'Playfair Display', serif",fontSize:18,color:"#0a0a14",fontWeight:500,marginBottom:12,boxShadow:`0 8px 32px rgba(${T.rgb},0.4)`}}>
          Build my personal guide →
        </button>
        <button className="btn" onClick={async () => { setScreen("profiles"); await loadSavedProfiles(); }} style={{width:"100%",padding:"14px",borderRadius:14,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",fontFamily:"'Playfair Display', serif",fontSize:15,color:"rgba(255,255,255,0.55)"}}>
          Load a saved profile
        </button>
        <p style={{...mono,fontSize:10,color:"rgba(255,255,255,0.18)",marginTop:12,letterSpacing:1}}>FREE · PRIVATE · PROFILES SAVED</p>
      </div>
    </div>
  );

  /* ─── SAVED PROFILES ──────────────────────────────────────── */
  if (screen === "profiles") return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'Playfair Display', serif",color:"#f0ece8",padding:"40px 24px"}}>
      <div style={{maxWidth:520,margin:"0 auto"}}>
        <button className="btn" onClick={() => setScreen("landing")} style={{...mono,fontSize:11,color:"rgba(255,255,255,0.4)",background:"none",marginBottom:28,letterSpacing:1}}>← Back</button>
        <h2 style={{fontSize:28,fontWeight:400,marginBottom:6}}>Saved profiles</h2>
        <p style={{...mono,fontSize:11,color:"rgba(255,255,255,0.35)",marginBottom:28}}>Tap a profile to load your personalized guide instantly.</p>

        {profilesLoading && <div style={{textAlign:"center",padding:40,color:"rgba(255,255,255,0.3)"}}>Loading...</div>}

        {!profilesLoading && savedProfiles.length === 0 && (
          <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"32px 24px",textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:12}}>✦</div>
            <p style={{color:"rgba(255,255,255,0.4)",fontSize:15}}>No saved profiles yet.</p>
            <p style={{...mono,fontSize:11,color:"rgba(255,255,255,0.25)",marginTop:6}}>Complete the quiz to create your first one.</p>
          </div>
        )}

        {!profilesLoading && savedProfiles.map(p => (
          <div key={p.key} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:14,padding:"16px 18px",marginBottom:10}}>
            {confirmDelete === p.key ? (
              <div>
                <p style={{fontSize:14,color:"rgba(255,255,255,0.6)",marginBottom:12}}>Delete <strong>{p.name || "this profile"}</strong>?</p>
                <div style={{display:"flex",gap:8}}>
                  <button className="btn" onClick={() => handleDelete(p.key)} style={{flex:1,padding:"10px",borderRadius:10,background:"rgba(248,113,113,0.2)",border:"1px solid rgba(248,113,113,0.3)",color:"#fca5a5",...mono,fontSize:11}}>Yes, delete</button>
                  <button className="btn" onClick={() => setConfirmDelete(null)} style={{flex:1,padding:"10px",borderRadius:10,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.4)",...mono,fontSize:11}}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                <div style={{cursor:"pointer",flex:1}} onClick={() => loadProfile(p)}>
                  <div style={{fontSize:17,color:"white",marginBottom:4}}>{p.name || "Profile"}</div>
                  <div style={{...mono,fontSize:10,color:"rgba(255,255,255,0.3)"}}>
                    {[
                      p.age, p.sex,
                      (p.dietStyle||[]).filter(d=>d!=="none").slice(0,2).map(d=>d.replace(/_/g," ")).join(", "),
                      p.cyclePhase ? p.cyclePhase.split(" ")[0] : null,
                    ].filter(Boolean).join(" · ")}
                  </div>
                  <div style={{...mono,fontSize:9,color:"rgba(255,255,255,0.2)",marginTop:3}}>
                    Saved {new Date(p.savedAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{display:"flex",gap:8,flexShrink:0}}>
                  <button className="btn" onClick={() => loadProfile(p)} style={{padding:"8px 14px",borderRadius:10,background:`rgba(${T.rgb},0.15)`,border:`1px solid rgba(${T.rgb},0.25)`,color:T.a,...mono,fontSize:10}}>Load</button>
                  <button className="btn" onClick={() => setConfirmDelete(p.key)} style={{padding:"8px 10px",borderRadius:10,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.3)",...mono,fontSize:10}}>✕</button>
                </div>
              </div>
            )}
          </div>
        ))}

        <button className="btn" onClick={() => setScreen("quiz")} style={{width:"100%",marginTop:16,padding:"14px",borderRadius:14,background:`rgba(${T.rgb},0.12)`,border:`1px solid rgba(${T.rgb},0.2)`,fontFamily:"'Playfair Display', serif",fontSize:15,color:T.a}}>
          + Create new profile
        </button>
      </div>
    </div>
  );

  /* ─── QUIZ ────────────────────────────────────────────────── */
  if (screen === "quiz") {
    const cfg = QUIZ[step];
    return (
      <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'Playfair Display', serif",color:"#f0ece8",position:"relative"}}>
        <div style={{position:"fixed",top:0,left:0,right:0,height:3,background:"rgba(255,255,255,0.07)",zIndex:100}}>
          <div style={{height:"100%",width:`${progress}%`,background:T.a,transition:"width 0.4s ease",boxShadow:`0 0 10px ${T.a}`}} />
        </div>
        <div style={{maxWidth:540,margin:"0 auto",padding:"64px 24px 130px"}}>
          <div style={{...mono,fontSize:10,color:"rgba(255,255,255,0.28)",letterSpacing:2,textTransform:"uppercase",marginBottom:20}}>
            Step {step+1} of {QUIZ.length}
          </div>
          <h2 className="fade-up" key={step+"h"} style={{fontSize:30,fontWeight:400,lineHeight:1.2,marginBottom:6}}>{cfg.title}</h2>
          <p  className="fade-up" key={step+"p"} style={{...mono,fontSize:12,color:"rgba(255,255,255,0.35)",marginBottom:32,lineHeight:1.6}}>{cfg.sub}</p>

          {/* BMI preview in body step */}
          {cfg.id === "body" && bmi && bmiCat && (
            <div className="fade-up" style={{background:`rgba(${T.rgb},0.08)`,border:`1px solid rgba(${T.rgb},0.18)`,borderRadius:14,padding:"14px 18px",marginBottom:24}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{...mono,fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"rgba(255,255,255,0.3)",marginBottom:4}}>Your BMI</div>
                  <div style={{fontSize:28,fontWeight:400,color:bmiCat.color}}>{bmi} <span style={{fontSize:14,color:"rgba(255,255,255,0.5)"}}>{bmiCat.label}</span></div>
                </div>
              </div>
              <p style={{...mono,fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:8,lineHeight:1.5}}>{bmiCat.advice}</p>
            </div>
          )}

          <div style={{display:"flex",flexDirection:"column",gap:26}}>
            {cfg.fields.map(field => {
              if (field.showIf && !field.showIf.vals.includes(profile[field.showIf.key])) return null;

              if (field.type === "text") return (
                <div key={field.key}>
                  <div style={{...mono,fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"rgba(255,255,255,0.35)",marginBottom:10}}>{field.label}</div>
                  <input type="text" placeholder={field.placeholder} value={profile[field.key]||""} onChange={e=>setField(field.key,e.target.value)}
                    style={{width:"100%",padding:"14px 18px",background:"rgba(255,255,255,0.06)",border:`1px solid ${profile[field.key]?T.a+"50":"rgba(255,255,255,0.1)"}`,borderRadius:12,color:"white",fontSize:18,fontFamily:"'Playfair Display', serif",outline:"none"}} />
                </div>
              );

              if (field.type === "number") return (
                <div key={field.key}>
                  <div style={{...mono,fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"rgba(255,255,255,0.35)",marginBottom:10}}>{field.label}</div>
                  <input type="number" placeholder={field.placeholder} value={profile[field.key]||""} min={field.min} max={field.max}
                    onChange={e=>setField(field.key,e.target.value)}
                    style={{width:"100%",padding:"14px 18px",background:"rgba(255,255,255,0.06)",border:`1px solid ${profile[field.key]?T.a+"50":"rgba(255,255,255,0.1)"}`,borderRadius:12,color:"white",fontSize:22,fontFamily:"'IBM Plex Mono', monospace",outline:"none"}} />
                </div>
              );

              if (field.type === "select") return (
                <div key={field.key}>
                  <div style={{...mono,fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"rgba(255,255,255,0.35)",marginBottom:10}}>{field.label}</div>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {field.opts.map(opt => {
                      const sel = profile[field.key] === opt;
                      return (
                        <div key={opt} className="pill-tap" onClick={() => setField(field.key,opt)} style={{padding:"13px 18px",borderRadius:12,background:sel?`rgba(${T.rgb},0.14)`:"rgba(255,255,255,0.04)",border:`1px solid ${sel?T.a+"60":"rgba(255,255,255,0.08)"}`,color:sel?"white":"rgba(255,255,255,0.5)",fontSize:15,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                          <span>{opt}</span>
                          {sel && <span style={{color:T.a,fontSize:12}}>✓</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );

              if (field.type === "multi") return (
                <div key={field.key}>
                  <div style={{...mono,fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"rgba(255,255,255,0.35)",marginBottom:10}}>{field.label}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                    {field.opts.map(opt => {
                      const sel = (profile[field.key]||[]).includes(opt.v);
                      return (
                        <div key={opt.v} className="pill-tap" onClick={() => toggleMulti(field.key,opt.v)} style={{padding:"9px 16px",borderRadius:100,background:sel?`rgba(${T.rgb},0.16)`:"rgba(255,255,255,0.05)",border:`1px solid ${sel?T.a+"60":"rgba(255,255,255,0.09)"}`,color:sel?"white":"rgba(255,255,255,0.45)",fontSize:13,display:"flex",alignItems:"center",gap:6}}>
                          <span>{opt.i}</span><span>{opt.l}</span>
                          {sel && <span style={{color:T.a,fontSize:10}}>✓</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
              return null;
            })}
          </div>
        </div>

        <div style={{position:"fixed",bottom:0,left:0,right:0,padding:"16px 24px 28px",background:`linear-gradient(to top,#0a0a14f0,transparent)`}}>
          <div style={{maxWidth:540,margin:"0 auto",display:"flex",gap:10}}>
            {step > 0 && (
              <button className="btn" onClick={() => setStep(s=>s-1)} style={{flex:1,padding:"14px",borderRadius:12,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",fontFamily:"'Playfair Display', serif",fontSize:15,color:"rgba(255,255,255,0.55)"}}>← Back</button>
            )}
            <button className="btn" disabled={!canProceed} onClick={() => step < QUIZ.length-1 ? setStep(s=>s+1) : finishQuiz()} style={{flex:2,padding:"14px 20px",borderRadius:12,background:canProceed?`linear-gradient(135deg,${T.a},${T.a}bb)`:"rgba(255,255,255,0.07)",fontFamily:"'Playfair Display', serif",fontSize:16,color:canProceed?"#0a0a14":"rgba(255,255,255,0.25)",fontWeight:500,boxShadow:canProceed?`0 4px 24px rgba(${T.rgb},0.35)`:"none"}}>
              {step < QUIZ.length-1 ? "Continue →" : "✦ Build my guide"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─── PLAN ────────────────────────────────────────────────── */
  if (screen === "plan" && plan && macros) {
    const bmiVal = calcBMI(parseFloat(profile.weightKg), parseFloat(profile.heightCm));
    const bmiInfo = getBMICategory(bmiVal);

    return (
      <div style={{minHeight:"100vh",background:"#0d0d1a",fontFamily:"'Playfair Display', serif",color:"#f0ece8",paddingBottom:60}}>

        {/* Save status toast */}
        {saveStatus && (
          <div style={{position:"fixed",top:16,right:16,zIndex:200,background:saveStatus==="saved"?"rgba(74,222,128,0.15)":"rgba(248,113,113,0.15)",border:`1px solid ${saveStatus==="saved"?"rgba(74,222,128,0.3)":"rgba(248,113,113,0.3)"}`,borderRadius:10,padding:"10px 16px",...mono,fontSize:11,color:saveStatus==="saved"?"#4ade80":"#f87171",animation:"fadeUp 0.3s ease"}}>
            {saveStatus==="saving" ? "Saving profile..." : saveStatus==="saved" ? "✓ Profile saved" : "⚠ Save failed"}
          </div>
        )}

        {/* Header */}
        <div style={{background:T.bg,padding:"26px 22px 28px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 75% 40%,rgba(${T.rgb},0.14) 0%,transparent 60%)`,pointerEvents:"none"}} />
          <div style={{maxWidth:560,margin:"0 auto",position:"relative"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div>
                <div style={{...mono,fontSize:9,letterSpacing:2,color:"rgba(255,255,255,0.28)",textTransform:"uppercase",marginBottom:5}}>{T.icon} {T.label}</div>
                <h1 style={{fontSize:24,fontWeight:400,color:"white"}}>{profile.name ? `${profile.name}'s guide` : "Your guide"} ✦</h1>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
                <button className="btn" onClick={() => { setScreen("quiz"); setStep(0); setProfile({}); setPlan(null); }} style={{...mono,fontSize:9,color:T.a,background:`rgba(${T.rgb},0.1)`,border:`1px solid rgba(${T.rgb},0.25)`,borderRadius:100,padding:"6px 14px",letterSpacing:1,textTransform:"uppercase"}}>+ New</button>
                <button className="btn" onClick={() => { setScreen("profiles"); loadSavedProfiles(); }} style={{...mono,fontSize:9,color:"rgba(255,255,255,0.3)",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:100,padding:"6px 14px",letterSpacing:1,textTransform:"uppercase"}}>Profiles</button>
              </div>
            </div>
            {/* Tags */}
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {[
                ...(profile.dietStyle||[]).filter(d=>d!=="none").slice(0,2).map(d=>d.replace(/_/g," ")),
                ...(profile.allergies||[]).filter(a=>a!=="none").slice(0,2).map(a=>`no ${a}`),
                (profile.fodmap||"").includes("strictly")?"low-FODMAP":null,
                (profile.hormoneConditions||[]).includes("pmdd")?"PMDD":null,
                (profile.hormoneConditions||[]).includes("pcos")?"PCOS":null,
                (profile.otherSensitivities||[]).includes("histamine")?"histamine":null,
              ].filter(Boolean).map((t,i) => (
                <span key={i} style={{...mono,fontSize:9,color:"rgba(255,255,255,0.38)",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:100,padding:"3px 10px",textTransform:"capitalize"}}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        <div style={{maxWidth:560,margin:"16px auto 0",padding:"0 18px"}}>

          {/* ── OVERVIEW ACCORDION ── */}
          <Accordion id="overview" title="Calorie & macro targets" icon="🎯" badge={`${macros.targetCal} kcal`}>
            {/* BMI card */}
            {bmiVal && bmiInfo && (
              <div style={{background:"rgba(0,0,0,0.25)",borderRadius:14,padding:"14px 16px",marginBottom:16,border:`1px solid rgba(${T.rgb},0.12)`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div style={{...mono,fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"rgba(255,255,255,0.3)"}}>Your BMI</div>
                  <span style={{...mono,fontSize:11,color:bmiInfo.color,background:`${bmiInfo.color}18`,borderRadius:100,padding:"2px 10px"}}>{bmiInfo.label}</span>
                </div>
                <div style={{fontSize:36,fontWeight:400,color:bmiInfo.color,marginBottom:4}}>{bmiVal}</div>
                {/* BMI scale */}
                <div style={{position:"relative",marginBottom:10}}>
                  <div style={{height:6,borderRadius:100,background:"linear-gradient(to right,#60a5fa 0%,#4ade80 30%,#fb923c 65%,#f87171 100%)"}} />
                  <div style={{position:"absolute",top:-3,left:`${Math.min(((bmiVal-15)/25)*100,100)}%`,width:12,height:12,borderRadius:"50%",background:"white",transform:"translateX(-50%)",boxShadow:`0 0 8px rgba(${T.rgb},0.6)`}} />
                </div>
                <div style={{display:"flex",justifyContent:"space-between",...mono,fontSize:9,color:"rgba(255,255,255,0.25)"}}>
                  <span>Underweight &lt;18.5</span><span>Healthy 18.5–24.9</span><span>Over 25+</span>
                </div>
                <p style={{...mono,fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:10,lineHeight:1.5}}>{bmiInfo.advice}</p>
                {macros.weeksToGoal && (
                  <p style={{...mono,fontSize:11,color:`rgba(${T.rgb},0.8)`,marginTop:6}}>
                    At a healthy rate, reaching {profile.goalWeightKg}kg takes ~{macros.weeksToGoal} weeks.
                  </p>
                )}
              </div>
            )}

            {/* Calorie summary */}
            <div style={{background:"rgba(0,0,0,0.2)",borderRadius:12,padding:"14px 16px",marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <div>
                  <div style={{...mono,fontSize:9,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Daily target</div>
                  <div style={{fontSize:32,fontWeight:400,color:"white"}}>{macros.targetCal} <span style={{fontSize:14,color:"rgba(255,255,255,0.4)"}}>kcal</span></div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{...mono,fontSize:9,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Maintenance (TDEE)</div>
                  <div style={{fontSize:18,color:"rgba(255,255,255,0.5)"}}>{macros.tdee} kcal</div>
                  <div style={{...mono,fontSize:10,color:macros.targetCal<macros.tdee?"#4ade80":"#fb923c"}}>
                    {macros.targetCal < macros.tdee ? `−${macros.tdee-macros.targetCal} kcal deficit` : `+${macros.targetCal-macros.tdee} kcal surplus`}
                  </div>
                </div>
              </div>
              <div style={{...mono,fontSize:10,color:"rgba(255,255,255,0.3)",borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:10}}>
                Water: {macros.waterMl}ml/day · Fibre: {macros.fibreG}g/day
              </div>
            </div>

            {/* Macro bars */}
            <MacroBar label="Protein" grams={macros.protG} pct={macros.protPct} cal={macros.protG*4} color="#60a5fa" />
            <MacroBar label="Fat"     grams={macros.fatG}  pct={macros.fatPct}  cal={macros.fatG*9}  color="#fbbf24" />
            <MacroBar label="Carbohydrates" grams={macros.carbG} pct={macros.carbPct} cal={macros.carbG*4} color="#34d399" />

            <div style={{...mono,fontSize:10,color:"rgba(255,255,255,0.25)",lineHeight:1.7,marginTop:6,padding:"10px 0",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
              Calculated using Mifflin-St Jeor BMR with {(profile.activity||"").split(" ")[0]} activity multiplier.
              Macro split optimised for your goals and dietary style.
            </div>
          </Accordion>

          {/* Phase section */}
          {plan.phaseSection && (
            <div style={{background:`rgba(${T.rgb},0.09)`,border:`1px solid rgba(${T.rgb},0.2)`,borderRadius:18,padding:"20px 18px",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <span style={{fontSize:22}}>{plan.phaseSection.icon}</span>
                <div>
                  <div style={{fontSize:17,fontWeight:500,color:"white"}}>{plan.phaseSection.title}</div>
                  <div style={{...mono,fontSize:9,color:`rgba(${T.rgb},0.8)`,letterSpacing:1,textTransform:"uppercase"}}>Cycle nutrition</div>
                </div>
              </div>
              <p style={{fontSize:13,color:"rgba(255,255,255,0.55)",lineHeight:1.65,marginBottom:16,fontStyle:"italic"}}>{plan.phaseSection.intro}</p>
              {plan.phaseSection.focus.map((f,i) => (
                <div key={i} style={{background:"rgba(0,0,0,0.2)",borderRadius:12,padding:"12px 14px",marginBottom:8}}>
                  <div style={{fontSize:14,color:"white",marginBottom:4}}>✦ {f.name}</div>
                  <div style={{...mono,fontSize:10,color:`rgba(${T.rgb},0.8)`,marginBottom:4}}>{f.examples}</div>
                  <div style={{...mono,fontSize:11,color:"rgba(255,255,255,0.4)",lineHeight:1.5}}>{f.why}</div>
                </div>
              ))}
              {plan.phaseSection.avoid && (
                <div style={{marginTop:14}}>
                  <div style={{...mono,fontSize:9,letterSpacing:2,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",marginBottom:8}}>Minimise this week</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {plan.phaseSection.avoid.map((a,i) => (
                      <span key={i} style={{...mono,fontSize:10,color:"#f87171",background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:100,padding:"3px 12px"}}>✕ {a}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Nutrients */}
          <Accordion id="nutrients" title="Key nutrients & targets" icon="💊" badge={`${plan.nutrients.length} priorities`}>
            {plan.nutrients.map((n,i) => (
              <div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"12px 14px",marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4,gap:8}}>
                  <span style={{fontSize:15,color:"white"}}>{n.name}</span>
                  <span style={{...mono,fontSize:10,color:T.a,background:`rgba(${T.rgb},0.12)`,borderRadius:100,padding:"2px 10px",whiteSpace:"nowrap",flexShrink:0}}>{n.target}</span>
                </div>
                <p style={{...mono,fontSize:11,color:"rgba(255,255,255,0.45)",lineHeight:1.55}}>Best sources: {n.where}</p>
              </div>
            ))}
          </Accordion>

          {/* Proteins */}
          <Accordion id="proteins" title="Proteins to focus on" icon="🥩" badge={`${macros.protG}g/day · ${macros.protPct}% of calories`}>
            <div style={{background:`rgba(${T.rgb},0.08)`,borderRadius:12,padding:"12px 14px",marginBottom:14,border:`1px solid rgba(${T.rgb},0.15)`}}>
              <div style={{...mono,fontSize:9,letterSpacing:2,textTransform:"uppercase",color:`rgba(${T.rgb},0.7)`,marginBottom:6}}>Daily protein target</div>
              <div style={{fontSize:28,fontWeight:400,color:"white",marginBottom:2}}>{macros.protG}g <span style={{fontSize:13,color:"rgba(255,255,255,0.4)"}}>per day</span></div>
              <div style={{...mono,fontSize:11,color:"rgba(255,255,255,0.4)"}}>
                {macros.protPct}% of your {macros.targetCal} kcal · {Math.round(macros.protG / 4)} kcal from protein · ~{Math.round(macros.protG / 3)}g per meal (3 meals)
              </div>
              <div style={{marginTop:10,background:"rgba(255,255,255,0.07)",borderRadius:100,height:5}}>
                <div style={{height:"100%",borderRadius:100,width:`${macros.protPct}%`,background:"#60a5fa",boxShadow:"0 0 8px #60a5fa60"}} />
              </div>
            </div>
            {plan.proteins.map((item,i) => <FoodCard key={i} item={item} />)}
          </Accordion>

          {/* Fats */}
          <Accordion id="fats" title="Healthy fats" icon="🥑" badge={`${macros.fatG}g/day · ${macros.fatPct}% of calories`}>
            <div style={{background:`rgba(${T.rgb},0.08)`,borderRadius:12,padding:"12px 14px",marginBottom:14,border:`1px solid rgba(${T.rgb},0.15)`}}>
              <div style={{...mono,fontSize:9,letterSpacing:2,textTransform:"uppercase",color:`rgba(${T.rgb},0.7)`,marginBottom:6}}>Daily fat target</div>
              <div style={{fontSize:28,fontWeight:400,color:"white",marginBottom:2}}>{macros.fatG}g <span style={{fontSize:13,color:"rgba(255,255,255,0.4)"}}>per day</span></div>
              <div style={{...mono,fontSize:11,color:"rgba(255,255,255,0.4)"}}>
                {macros.fatPct}% of your {macros.targetCal} kcal · {Math.round(macros.fatG * 9)} kcal from fat · ~{Math.round(macros.fatG / 3)}g per meal
              </div>
              <div style={{marginTop:10,background:"rgba(255,255,255,0.07)",borderRadius:100,height:5}}>
                <div style={{height:"100%",borderRadius:100,width:`${macros.fatPct}%`,background:"#fbbf24",boxShadow:"0 0 8px #fbbf2460"}} />
              </div>
            </div>
            {plan.fats.map((item,i) => <FoodCard key={i} item={item} />)}
          </Accordion>

          {/* Carbs */}
          {plan.carbs.length > 0 && (
            <Accordion id="carbs" title="Carbs & starches" icon="🌾" badge={`${macros.carbG}g/day · ${macros.carbPct}% of calories`}>
              <div style={{background:`rgba(${T.rgb},0.08)`,borderRadius:12,padding:"12px 14px",marginBottom:14,border:`1px solid rgba(${T.rgb},0.15)`}}>
                <div style={{...mono,fontSize:9,letterSpacing:2,textTransform:"uppercase",color:`rgba(${T.rgb},0.7)`,marginBottom:6}}>Daily carb target</div>
                <div style={{fontSize:28,fontWeight:400,color:"white",marginBottom:2}}>{macros.carbG}g <span style={{fontSize:13,color:"rgba(255,255,255,0.4)"}}>per day</span></div>
                <div style={{...mono,fontSize:11,color:"rgba(255,255,255,0.4)"}}>
                  {macros.carbPct}% of your {macros.targetCal} kcal · {Math.round(macros.carbG * 4)} kcal from carbs · Fibre goal: {macros.fibreG}g/day
                </div>
                <div style={{marginTop:10,background:"rgba(255,255,255,0.07)",borderRadius:100,height:5}}>
                  <div style={{height:"100%",borderRadius:100,width:`${macros.carbPct}%`,background:"#34d399",boxShadow:"0 0 8px #34d39960"}} />
                </div>
              </div>
              {plan.carbs.map((item,i) => <FoodCard key={i} item={item} />)}
            </Accordion>
          )}

          {/* Vegetables */}
          <Accordion id="vegs" title="Vegetables & herbs" icon="🥦" badge={`Fill ½ your plate`}>
            <div style={{background:"rgba(52,211,153,0.07)",borderRadius:12,padding:"12px 14px",marginBottom:14,border:"1px solid rgba(52,211,153,0.15)"}}>
              <p style={{...mono,fontSize:11,color:"rgba(52,211,153,0.8)",lineHeight:1.6}}>
                Aim for 5–7 servings of vegetables daily. Vegetables are essentially free calories — pile them on. They should fill at least half your plate at every meal.
              </p>
            </div>
            {plan.vegs.map((item,i) => <FoodCard key={i} item={item} />)}
          </Accordion>

          {/* Foods to avoid */}
          {plan.avoid.length > 0 && (
            <Accordion id="avoid" title="Foods to avoid" icon="🚫" badge={`${plan.avoid.length} restrictions`}>
              {plan.avoid.map((item,i) => (
                <div key={i} style={{background:"rgba(248,113,113,0.06)",border:"1px solid rgba(248,113,113,0.12)",borderRadius:12,padding:"12px 14px",marginBottom:8}}>
                  <div style={{fontSize:15,color:"#fca5a5",marginBottom:4}}>✕ {item.food}</div>
                  <div style={{...mono,fontSize:11,color:"rgba(255,255,255,0.4)",marginBottom:6,lineHeight:1.5}}>{item.reason}</div>
                  <div style={{...mono,fontSize:11,color:"rgba(134,239,172,0.8)"}}>→ Swap: {item.swap}</div>
                </div>
              ))}
            </Accordion>
          )}

          {/* Hydration */}
          <Accordion id="hydration" title="Hydration & timing" icon="💧" badge={`${(macros.waterMl/1000).toFixed(1)}L/day`}>
            {plan.hydration.map((h,i) => (
              <div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"12px 14px",marginBottom:8}}>
                <div style={{fontSize:14,color:"white",marginBottom:4}}>◆ {h.tip}</div>
                <div style={{...mono,fontSize:11,color:"rgba(255,255,255,0.4)",lineHeight:1.5}}>{h.reason}</div>
              </div>
            ))}
          </Accordion>

          <p style={{...mono,textAlign:"center",color:"rgba(255,255,255,0.13)",fontSize:9,lineHeight:1.8,marginTop:16}}>
            Educational guide only — not medical advice.<br/>
            Consult a registered dietitian for clinical nutrition therapy.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
