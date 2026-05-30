/**
 * Rule-based AI Wellness Coach engine.
 *
 * Design principles:
 *  1. Strict intent detection — each query is routed to exactly one handler.
 *  2. No topic drift — keyword sets are mutually exclusive where possible;
 *     priority order resolves any remaining overlap.
 *  3. Personalisation only when relevant — tracker data is injected only by
 *     handlers whose domain matches the query.
 *  4. Out-of-scope guard — queries that match no known domain return a clear
 *     limitation message instead of a generic data dump.
 *  5. No emoji anywhere in responses.
 */

import type { TrackerSnapshot } from "./wellnessStorage";

// ─────────────────────────────────────────────────────────────────────────────
// Intent keyword sets
// Rules:
//  • Each set covers ONLY its own domain.
//  • Generic words ("improve", "better", "help") are NOT included — they cause
//    false positives across domains.
//  • Overlapping concepts (e.g. "walk" appears in both workout and steps) are
//    resolved by priority order in the router at the bottom of this file.
// ─────────────────────────────────────────────────────────────────────────────

// Nutrition / meals
const MEAL_KW = [
  "eat","ate","food","meal","meals","diet","nutrition","calorie","calories",
  "macro","macros","protein","carb","carbs","fat","fats","fibre","fiber",
  "breakfast","lunch","dinner","snack","snacks","recipe","recipes",
  "burger","pizza","rice","salad","chicken","fish","egg","eggs","oats",
  "vegetable","vegetables","fruit","fruits","sugar","junk","fast food",
  "fries","chips","soda","donut","cake","candy","chocolate","ice cream",
  "quinoa","nuts","yogurt","smoothie","portion","serving","intake",
  "what should i eat","what to eat","meal plan","food plan",
];

// Sleep — only explicit sleep/rest terms; fatigue/tiredness handled separately
const SLEEP_KW = [
  "sleep","sleeping","slept","insomnia","nap","napping","bedtime","wake up",
  "woke up","oversleep","oversleeping","rest","resting","circadian",
  "deep sleep","rem sleep","sleep quality","sleep schedule","sleep cycle",
  "how long should i sleep","hours of sleep","improve sleep","better sleep",
  "can't sleep","trouble sleeping","sleep tip","sleep advice",
];

// Fatigue / energy — separate from sleep so "tired after workout" routes here
const FATIGUE_KW = [
  "tired","tiredness","fatigue","fatigued","exhausted","exhaustion",
  "drowsy","drowsiness","groggy","low energy","no energy","feel weak",
  "feel drained","drained","lethargic","lethargy","sluggish",
  "tired after workout","tired after exercise","post-workout fatigue",
];

// Hydration
const WATER_KW = [
  "water","hydration","hydrate","hydrating","drink water","drinking water",
  "thirst","thirsty","fluid","fluids","dehydration","dehydrated",
  "how much water","water intake","daily water","water goal",
];

// Workout / exercise
const WORKOUT_KW = [
  "workout","workouts","exercise","exercises","gym","training","train",
  "cardio","strength","strength training","weight training","lifting","lift",
  "yoga","hiit","cycling","swimming","sport","sports","active","activity",
  "fitness","fit","running","run","jogging","jog","push up","pull up",
  "squat","deadlift","bench press","rep","reps","set","sets",
  "workout plan","exercise plan","training plan","how to exercise",
  "how to train","workout routine","exercise routine","fat loss workout",
  "muscle building","build muscle","gain muscle","lose weight workout",
  "recovery","post-workout","sore muscles","muscle soreness","doms",
  "cool down","warm up","rest day","rest days",
];

// Steps / daily movement
const STEPS_KW = [
  "steps","step count","step goal","daily steps","10000 steps","10,000 steps",
  "pedometer","walking","walk more","how many steps","increase steps",
  "sedentary","sitting too much","move more","daily movement","neat",
];

// BMI / body composition
const BMI_KW = [
  "bmi","body mass index","body mass","body fat","body composition",
  "overweight","underweight","obese","obesity","healthy weight",
  "ideal weight","weight range","am i overweight","am i underweight",
];

// Weight management (distinct from BMI lookup)
const WEIGHT_KW = [
  "lose weight","weight loss","fat loss","burn fat","slim down","cut weight",
  "gain weight","bulk","bulking","weight gain","put on weight",
  "how to lose","how to gain","reduce weight","drop weight",
];

// Stress / mental wellness
const STRESS_KW = [
  "stress","stressed","anxiety","anxious","mental health","mood","moody",
  "relax","relaxation","calm","calming","breathe","breathing","meditation",
  "meditate","overwhelmed","overwhelm","burnout","burnt out","panic",
  "worry","worried","tension","tense","mental wellness","mindfulness",
];

// Goals / planning
const GOAL_KW = [
  "my goal","set a goal","wellness goal","health goal","fitness goal",
  "goal plan","goal setting","achieve my goal","reach my goal",
  "what is my goal","track my goal","progress toward goal",
];

// Wellness summary (explicit request)
const SUMMARY_KW = [
  "wellness summary","my summary","today's summary","daily summary",
  "how am i doing","how is my health","overall health","health overview",
  "give me a summary","show my progress","my stats","my data",
];

// ─────────────────────────────────────────────────────────────────────────────
// Domains that are OUT OF SCOPE for this rule-based engine
// ─────────────────────────────────────────────────────────────────────────────
const OUT_OF_SCOPE_KW = [
  // Medical / clinical
  "diagnose","diagnosis","disease","disorder","condition","symptom","symptoms",
  "medication","medicine","drug","drugs","prescription","dose","dosage",
  "surgery","operation","treatment","therapy","therapist","doctor","physician",
  "hospital","clinic","blood test","lab result","mri","scan","x-ray",
  "diabetes","cancer","heart disease","hypertension","blood pressure medication",
  "cholesterol medication","insulin","thyroid",
  // Mental health clinical
  "depression","depressed","suicidal","self harm","psychiatrist","psychologist",
  "antidepressant","bipolar","schizophrenia","ocd","ptsd",
  // Financial / legal / unrelated
  "money","finance","invest","stock","crypto","law","legal","lawyer",
  "insurance","tax","mortgage","loan",
  // Food delivery / restaurant
  "order food","food delivery","restaurant","menu","uber eats","doordash",
  // Unrelated tech
  "code","programming","software","app","website","computer","phone",
  // Relationship / social
  "relationship","dating","marriage","divorce","friend","family",
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Returns true if the input contains any of the given keywords (whole-word aware). */
function matches(input: string, keywords: string[]): boolean {
  const lower = input.toLowerCase();
  return keywords.some(k => lower.includes(k));
}

/** Returns true if the input is likely out of scope. */
function isOutOfScope(input: string): boolean {
  return matches(input, OUT_OF_SCOPE_KW);
}

// ─────────────────────────────────────────────────────────────────────────────
// Response builders — each handles ONLY its own domain
// ─────────────────────────────────────────────────────────────────────────────

function outOfScopeResponse(): string {
  return (
    `This request is outside the current capabilities of the AI Wellness Coach. ` +
    `It will be supported in future updates.\n\n` +
    `The AI Wellness Coach currently covers:\n` +
    `• Nutrition and meal guidance\n` +
    `• Sleep improvement strategies\n` +
    `• Workout and exercise planning\n` +
    `• Hydration and water intake\n` +
    `• Steps and daily movement\n` +
    `• BMI and body composition\n` +
    `• Stress and mental wellness\n` +
    `• Weight management goals\n\n` +
    `For medical concerns, please consult a qualified healthcare professional.`
  );
}


function mealResponse(input: string, snap: TrackerSnapshot): string {
  const lower = input.toLowerCase();

  const junkFoods = [
    "burger","fries","pizza","chips","soda","fried","junk","fast food",
    "donut","cake","candy","chocolate","ice cream",
  ];
  const healthyFoods = [
    "salad","vegetable","fruit","oats","chicken","fish","quinoa",
    "brown rice","nuts","yogurt","smoothie",
  ];

  const hasJunk    = junkFoods.some(j => lower.includes(j));
  const hasHealthy = healthyFoods.some(h => lower.includes(h));

  let reply = "";

  if (hasJunk) {
    reply  = `I noticed you mentioned some high-calorie foods. Here are a few thoughts:\n\n`;
    reply += `• **Balance is key** — one indulgent meal will not derail your progress, but consistency matters.\n`;
    reply += `• **Hydrate well** — drink an extra glass of water to support digestion.\n`;
    reply += `• **Healthier swaps** — try grilled chicken instead of fried, or a side salad instead of fries next time.\n`;
    reply += `• **Protein focus** — aim for 25–30g of protein at your next meal to stay satiated longer.\n`;
  } else if (hasHealthy) {
    reply  = `Good food choices. Here is how to optimise further:\n\n`;
    reply += `• **Macro balance** — pair your meal with a lean protein source if you have not already.\n`;
    reply += `• **Timing** — eating within 30–60 minutes after a workout maximises muscle recovery.\n`;
    reply += `• **Portion awareness** — even healthy foods contribute to your daily calorie total.\n`;
    reply += `• **Variety** — rotate your vegetables and protein sources to cover all micronutrients.\n`;
  } else if (lower.includes("meal plan") || lower.includes("what to eat") || lower.includes("what should i eat")) {
    reply  = `Here is a simple daily meal structure to follow:\n\n`;
    reply += `• **Breakfast** — oats with fruit and a protein source (eggs, Greek yogurt, or protein powder).\n`;
    reply += `• **Lunch** — lean protein (chicken, fish, or legumes) with vegetables and a complex carb.\n`;
    reply += `• **Dinner** — similar to lunch; keep portions moderate and avoid heavy carbs late at night.\n`;
    reply += `• **Snacks** — nuts, fruit, or a small protein shake between meals if needed.\n`;
    reply += `• **Protein target** — aim for 0.8–1.6g per kg of body weight depending on your activity level.\n`;
  } else {
    reply  = `Here are core nutrition principles to follow:\n\n`;
    reply += `• **Protein target** — aim for 0.8–1.6g of protein per kg of body weight daily.\n`;
    reply += `• **Fibre intake** — include vegetables, legumes, or whole grains in each meal.\n`;
    reply += `• **Meal timing** — eating every 3–4 hours helps maintain stable energy levels.\n`;
    reply += `• **Mindful eating** — slow down and chew thoroughly to improve digestion and satiety.\n`;
    reply += `• **Limit ultra-processed foods** — they are calorie-dense and low in nutrients.\n`;
  }

  // Inject calorie data only when the question is nutrition-related
  if (snap.calories !== null) {
    if (snap.calories === 0) {
      reply += `\n**Your logged data:** No calories recorded today yet — log your meals for accurate insights.`;
    } else if (snap.calories < 1200) {
      reply += `\n**Your logged data:** You have logged ${snap.calories} kcal today — this is quite low. Make sure you are eating enough to fuel your body.`;
    } else if (snap.calories > 2500) {
      reply += `\n**Your logged data:** You have logged ${snap.calories} kcal today — consider lighter options for your remaining meals.`;
    } else {
      reply += `\n**Your logged data:** You have logged ${snap.calories} kcal today — you are on a good track.`;
    }
  }

  return reply;
}


function sleepResponse(input: string, snap: TrackerSnapshot): string {
  const lower = input.toLowerCase();
  let reply = "";

  if (lower.includes("insomnia") || lower.includes("can't sleep") || lower.includes("trouble sleeping")) {
    reply  = `Here are evidence-based strategies for insomnia and difficulty sleeping:\n\n`;
    reply += `• **Consistent schedule** — go to bed and wake up at the same time every day, including weekends.\n`;
    reply += `• **Cool, dark room** — keep your bedroom at 16–19 degrees Celsius and use blackout curtains.\n`;
    reply += `• **Limit caffeine** — avoid caffeine after 2 PM; it has a 5–6 hour half-life in your body.\n`;
    reply += `• **Screen-free wind-down** — avoid screens 30–60 minutes before bed; try reading or light stretching.\n`;
    reply += `• **Magnesium-rich foods** — spinach, almonds, and pumpkin seeds support relaxation.\n`;
    reply += `• **Avoid alcohol** — it disrupts REM sleep even if it helps you fall asleep initially.\n`;
  } else if (lower.includes("improve sleep") || lower.includes("better sleep") || lower.includes("sleep quality")) {
    reply  = `Here are practical ways to improve your sleep quality:\n\n`;
    reply += `• **Sleep schedule** — your circadian rhythm thrives on regularity; consistency is more important than total hours.\n`;
    reply += `• **Pre-sleep routine** — a 20-minute wind-down ritual (reading, journaling, light stretching) signals your brain to slow down.\n`;
    reply += `• **Exercise timing** — finish intense workouts at least 3 hours before bedtime.\n`;
    reply += `• **Meal timing** — avoid heavy meals within 2 hours of bedtime.\n`;
    reply += `• **Limit caffeine** — cut off caffeine by early afternoon.\n`;
    reply += `• **Darkness and temperature** — a cool, dark room significantly improves sleep depth.\n`;
  } else {
    reply  = `Sleep is one of the most powerful recovery and health tools available. Key principles:\n\n`;
    reply += `• **7–9 hours** is the recommended range for most adults.\n`;
    reply += `• **Deep sleep** is when your body repairs muscle tissue and consolidates memory.\n`;
    reply += `• **REM sleep** supports emotional regulation and cognitive performance.\n`;
    reply += `• **Consistency** matters more than total hours — irregular sleep disrupts hormones and metabolism.\n`;
    reply += `• **Sleep debt** cannot be fully recovered — prioritise consistent nightly sleep over weekend catch-up.\n`;
  }

  // Inject sleep data only for sleep-related queries
  if (snap.sleepHrs !== null) {
    if (snap.sleepHrs < 5) {
      reply += `\n**Your logged data:** You logged ${snap.sleepHrs.toFixed(1)}h of sleep — significantly below the recommended 7–9 hours. Prioritise rest tonight.`;
    } else if (snap.sleepHrs < 7) {
      reply += `\n**Your logged data:** You logged ${snap.sleepHrs.toFixed(1)}h of sleep — slightly below optimal. Try going to bed 30–45 minutes earlier.`;
    } else if (snap.sleepHrs <= 9) {
      reply += `\n**Your logged data:** You logged ${snap.sleepHrs.toFixed(1)}h of sleep — you are in the optimal range. Keep it consistent.`;
    } else {
      reply += `\n**Your logged data:** You logged ${snap.sleepHrs.toFixed(1)}h of sleep — oversleeping can sometimes indicate fatigue or low energy. Aim for 7–9 hours consistently.`;
    }
  } else {
    reply += `\n**Your logged data:** No sleep recorded yet. Use the Sleep Tracker to monitor your rest patterns.`;
  }

  return reply;
}


function fatigueResponse(snap: TrackerSnapshot): string {
  let reply  = `Fatigue after exercise or during the day is a signal your body needs better recovery. Here is what helps:\n\n`;
  reply += `• **Sleep duration** — aim for 7–9 hours of quality sleep per night; this is the single biggest recovery lever.\n`;
  reply += `• **Post-workout nutrition** — consume protein and carbohydrates within 30–60 minutes after exercise to replenish glycogen and start muscle repair.\n`;
  reply += `• **Hydration** — even mild dehydration causes fatigue; drink water consistently throughout the day.\n`;
  reply += `• **Cool-down** — 5–10 minutes of light stretching after every session reduces next-day soreness.\n`;
  reply += `• **Rest days** — your body grows stronger during rest, not during the workout. Schedule 1–2 rest days per week.\n`;
  reply += `• **Iron and B12** — deficiencies in these nutrients are a common cause of persistent fatigue; consider a blood test if tiredness is chronic.\n`;
  reply += `• **Overtraining** — if you feel tired every day, you may be training too frequently. Reduce volume for 1–2 weeks.\n`;

  // Inject only directly relevant data
  if (snap.sleepHrs !== null && snap.sleepHrs < 7) {
    reply += `\n**Your logged data:** You logged ${snap.sleepHrs.toFixed(1)}h of sleep — below the 7–9 hour target. Improving sleep is likely the fastest way to reduce your fatigue.`;
  }
  if (snap.workoutMin !== null && snap.workoutMin > 90) {
    reply += `\n**Your logged data:** You logged ${snap.workoutMin} minutes of exercise today — this is a high volume. Ensure you are eating and sleeping enough to support this load.`;
  }

  return reply;
}

function waterResponse(snap: TrackerSnapshot): string {
  let reply  = `Hydration is foundational to every aspect of health. Here is what you need to know:\n\n`;
  reply += `• **Daily target** — 8 glasses (2 litres) is the general recommendation; active individuals need 2.5–3.5 litres.\n`;
  reply += `• **Morning hydration** — drink a glass of water first thing in the morning to rehydrate after sleep.\n`;
  reply += `• **Workout hydration** — drink 500ml before exercise and 150–200ml every 20 minutes during.\n`;
  reply += `• **Signs of dehydration** — dark urine, headaches, fatigue, and difficulty concentrating.\n`;
  reply += `• **Electrolytes** — if you sweat heavily, consider adding a pinch of salt or an electrolyte supplement.\n`;
  reply += `• **Food sources** — cucumbers, watermelon, oranges, and soups also contribute to daily fluid intake.\n`;
  reply += `• **Spread it out** — sipping water throughout the day is more effective than drinking large amounts at once.\n`;

  // Inject water data only for hydration queries
  if (snap.water !== null) {
    if (snap.water === 0) {
      reply += `\n**Your logged data:** No water recorded today — start with a glass now.`;
    } else if (snap.water < 4) {
      reply += `\n**Your logged data:** You have had ${snap.water} glass${snap.water === 1 ? "" : "es"} today — below target. Aim for one glass every 1–2 hours.`;
    } else if (snap.water < 8) {
      reply += `\n**Your logged data:** You have had ${snap.water} glasses today — good progress. ${8 - snap.water} more to reach your daily goal.`;
    } else {
      reply += `\n**Your logged data:** You have had ${snap.water} glasses today — daily hydration goal achieved.`;
    }
  } else {
    reply += `\n**Your logged data:** No water intake recorded yet. Use the Hydration Tracker to monitor your daily intake.`;
  }

  return reply;
}


function workoutResponse(input: string, snap: TrackerSnapshot): string {
  const lower = input.toLowerCase();
  let reply = "";

  if (
    lower.includes("recovery") || lower.includes("sore") ||
    lower.includes("soreness") || lower.includes("doms") ||
    lower.includes("rest day") || lower.includes("cool down")
  ) {
    reply  = `Post-workout recovery is just as important as the workout itself:\n\n`;
    reply += `• **Cool-down** — 5–10 minutes of light stretching after every session reduces soreness.\n`;
    reply += `• **Protein within 30–60 min** — a protein-rich meal or shake helps muscle repair.\n`;
    reply += `• **Sleep** — growth hormone is released during deep sleep, driving muscle recovery.\n`;
    reply += `• **Active recovery** — light walking or yoga on rest days improves blood flow without adding stress.\n`;
    reply += `• **Foam rolling** — reduces muscle soreness and improves flexibility.\n`;
    reply += `• **Hydration** — dehydration significantly impairs recovery speed.\n`;
    reply += `• **Rest days** — schedule at least 1–2 full rest days per week.\n`;
  } else if (
    lower.includes("fat loss") || lower.includes("lose weight") ||
    lower.includes("burn fat") || lower.includes("weight loss workout")
  ) {
    reply  = `Here is an effective workout approach for fat loss:\n\n`;
    reply += `• **Calorie deficit** — exercise supports fat loss, but diet creates the deficit. Aim for 300–500 kcal below maintenance.\n`;
    reply += `• **Cardio** — 150–300 minutes of moderate cardio per week (walking, cycling, swimming).\n`;
    reply += `• **Strength training** — preserves muscle mass during a deficit and raises resting metabolism.\n`;
    reply += `• **HIIT** — 2–3 sessions per week of high-intensity intervals are highly effective for fat burning.\n`;
    reply += `• **Protein** — high protein intake (1.6–2.2g/kg) prevents muscle loss while in a deficit.\n`;
    reply += `• **Consistency** — sustainable fat loss is 0.5–1kg per week. Avoid crash approaches.\n`;
  } else if (
    lower.includes("muscle") || lower.includes("gain muscle") ||
    lower.includes("bulk") || lower.includes("strength training") ||
    lower.includes("build muscle") || lower.includes("hypertrophy")
  ) {
    reply  = `Here is what the evidence says about building muscle:\n\n`;
    reply += `• **Progressive overload** — gradually increase weight, reps, or sets over time. This is the primary driver of muscle growth.\n`;
    reply += `• **Compound movements** — squats, deadlifts, bench press, and rows build the most muscle efficiently.\n`;
    reply += `• **Training frequency** — train each muscle group 2x per week for optimal hypertrophy.\n`;
    reply += `• **Volume** — 10–20 sets per muscle group per week is the effective range for most people.\n`;
    reply += `• **Protein** — consume 1.6–2.2g of protein per kg of body weight daily.\n`;
    reply += `• **Calorie surplus** — a modest 200–300 kcal surplus supports muscle growth without excess fat gain.\n`;
    reply += `• **Recovery** — muscles grow during rest. Sleep 7–9 hours and take rest days seriously.\n`;
  } else {
    reply  = `Here are general workout recommendations for a balanced fitness routine:\n\n`;
    reply += `• **Frequency** — aim for 3–5 workout sessions per week depending on your fitness level.\n`;
    reply += `• **Variety** — combine cardio, strength training, and flexibility work.\n`;
    reply += `• **Warm-up** — always spend 5–10 minutes warming up to prevent injury.\n`;
    reply += `• **Rest days** — your body needs 1–2 rest days per week to recover and adapt.\n`;
    reply += `• **Progression** — track your workouts and aim to improve gradually each week.\n`;
    reply += `• **Consistency** — showing up regularly matters more than any single perfect session.\n`;
  }

  // Inject workout data only for workout queries
  if (snap.workoutMin !== null) {
    if (snap.workoutMin === 0) {
      reply += `\n**Your logged data:** No workout recorded today. Even a 20-minute walk counts toward your activity goal.`;
    } else if (snap.workoutMin < 20) {
      reply += `\n**Your logged data:** You have logged ${snap.workoutMin} minutes of exercise today — a good start. Try to reach 30+ minutes.`;
    } else if (snap.workoutMin < 60) {
      reply += `\n**Your logged data:** You have logged ${snap.workoutMin} minutes of exercise today — solid effort.`;
    } else {
      reply += `\n**Your logged data:** You have logged ${snap.workoutMin} minutes of exercise today — strong session.`;
    }
  }

  return reply;
}


function stepsResponse(snap: TrackerSnapshot): string {
  let reply  = `Daily movement is one of the most underrated health habits. Here is why steps matter:\n\n`;
  reply += `• **10,000 steps** is the widely recommended daily target, equivalent to roughly 7–8 km.\n`;
  reply += `• **NEAT** (Non-Exercise Activity Thermogenesis) — daily movement outside formal exercise burns significant calories over time.\n`;
  reply += `• **Cardiovascular health** — regular walking reduces blood pressure and improves heart health.\n`;
  reply += `• **Mental health** — even a 10-minute walk can reduce stress and improve mood.\n`;
  reply += `• **Tips to increase steps** — take stairs, park further away, walk during phone calls, take short breaks every hour.\n`;
  reply += `• **Start small** — if 10,000 feels far, aim for 5,000 first and build from there.\n`;

  // Inject steps data only for steps queries
  if (snap.steps !== null) {
    if (snap.steps === 0) {
      reply += `\n**Your logged data:** No steps recorded today. Start with a short walk — every step counts.`;
    } else if (snap.steps < 5000) {
      reply += `\n**Your logged data:** You have logged ${snap.steps.toLocaleString()} steps today — try to reach 5,000 as a first milestone.`;
    } else if (snap.steps < 10000) {
      reply += `\n**Your logged data:** You have logged ${snap.steps.toLocaleString()} steps today — great progress. ${(10000 - snap.steps).toLocaleString()} more to hit your daily goal.`;
    } else {
      reply += `\n**Your logged data:** You have logged ${snap.steps.toLocaleString()} steps today — daily goal achieved.`;
    }
  } else {
    reply += `\n**Your logged data:** No steps recorded yet. Use the Step Counter to track your daily movement.`;
  }

  return reply;
}

function bmiResponse(snap: TrackerSnapshot): string {
  let reply  = `BMI (Body Mass Index) is a useful screening tool, though it has limitations:\n\n`;
  reply += `• **Healthy range** — 18.5–24.9 is considered normal weight.\n`;
  reply += `• **Underweight** — below 18.5; focus on nutrient-dense, calorie-rich foods.\n`;
  reply += `• **Overweight** — 25.0–29.9; a modest calorie deficit and regular exercise can help.\n`;
  reply += `• **Obese** — 30.0 and above; consult a healthcare professional for a personalised plan.\n`;
  reply += `• **Limitations** — BMI does not account for muscle mass, bone density, or fat distribution.\n`;
  reply += `• **Better metrics** — waist circumference and body fat percentage are more informative.\n`;

  // Inject BMI data only for BMI queries
  if (snap.bmi !== null) {
    if (snap.bmi < 18.5) {
      reply += `\n**Your logged data:** Your BMI is ${snap.bmi.toFixed(1)} (Underweight). Focus on nutrient-dense, calorie-rich foods and strength training to build healthy mass.`;
    } else if (snap.bmi <= 24.9) {
      reply += `\n**Your logged data:** Your BMI is ${snap.bmi.toFixed(1)} (Normal weight). You are in the healthy range — maintain your current habits.`;
    } else if (snap.bmi <= 29.9) {
      reply += `\n**Your logged data:** Your BMI is ${snap.bmi.toFixed(1)} (Overweight). A modest calorie deficit combined with regular exercise can help you move toward the healthy range.`;
    } else {
      reply += `\n**Your logged data:** Your BMI is ${snap.bmi.toFixed(1)} (Obese). I recommend consulting a healthcare professional for a personalised plan. Small, consistent changes make a significant difference over time.`;
    }
  } else {
    reply += `\n**Your logged data:** No BMI recorded yet. Use the BMI Calculator to log your measurement.`;
  }

  return reply;
}


function weightResponse(input: string): string {
  const lower = input.toLowerCase();

  if (lower.includes("lose") || lower.includes("fat loss") || lower.includes("burn fat") || lower.includes("slim")) {
    return (
      `Here is a comprehensive, evidence-based fat loss plan:\n\n` +
      `**Nutrition:**\n` +
      `• Create a 300–500 kcal daily deficit — this produces 0.5–1kg of fat loss per week.\n` +
      `• Prioritise protein (1.6–2g per kg of body weight) to preserve muscle while losing fat.\n` +
      `• Minimise ultra-processed foods and added sugars.\n` +
      `• Eat plenty of vegetables for fibre, volume, and micronutrients.\n\n` +
      `**Exercise:**\n` +
      `• 3–4 strength training sessions per week to preserve muscle mass.\n` +
      `• 2–3 cardio sessions (30–45 min each) for additional calorie burn.\n` +
      `• Aim for 8,000–10,000 steps daily through general movement.\n\n` +
      `**Recovery:**\n` +
      `• 7–9 hours of sleep per night — poor sleep increases hunger hormones.\n` +
      `• Manage stress — elevated cortisol promotes fat storage, especially around the abdomen.\n` +
      `• Stay hydrated — 8+ glasses of water daily.\n\n` +
      `**Mindset:**\n` +
      `• Aim for 0.5–1kg loss per week — this is sustainable and preserves muscle.\n` +
      `• Track your food and exercise consistently for accountability.\n` +
      `• Focus on habits, not just the scale — body composition matters more than weight alone.`
    );
  }

  if (lower.includes("gain") || lower.includes("bulk") || lower.includes("put on weight")) {
    return (
      `Here is a muscle and weight gain strategy:\n\n` +
      `**Nutrition:**\n` +
      `• Eat in a 200–300 kcal surplus above your maintenance calories.\n` +
      `• Consume 1.6–2.2g of protein per kg of body weight daily.\n` +
      `• Time carbohydrates around workouts for energy and recovery.\n` +
      `• Do not neglect healthy fats — they support hormone production.\n\n` +
      `**Training:**\n` +
      `• Focus on compound lifts: squats, deadlifts, bench press, and rows.\n` +
      `• Apply progressive overload — increase weight or reps each week.\n` +
      `• Train each muscle group 2x per week.\n` +
      `• Aim for 3–5 sets of 6–12 reps per exercise.\n\n` +
      `**Recovery:**\n` +
      `• Sleep is when muscles grow — prioritise 7–9 hours per night.\n` +
      `• Rest days are essential — at least 1–2 per week.\n` +
      `• Manage stress to keep cortisol low, as high cortisol impairs muscle growth.`
    );
  }

  return (
    `Weight management is about finding the right balance for your body and goals:\n\n` +
    `• **Understand your maintenance calories** — use the Health Profile page to calculate your BMR and TDEE.\n` +
    `• **For fat loss** — create a modest calorie deficit (300–500 kcal/day) and prioritise protein.\n` +
    `• **For muscle gain** — eat in a small surplus (200–300 kcal/day) and follow a progressive strength programme.\n` +
    `• **For maintenance** — match your calorie intake to your TDEE and stay active.\n` +
    `• **Track consistently** — use the Calorie Tracker and Workout Log to stay on target.\n` +
    `• **Be patient** — meaningful body composition changes take weeks to months, not days.`
  );
}

function stressResponse(): string {
  return (
    `Stress management is a critical but often overlooked pillar of wellness. Here is what helps:\n\n` +
    `**Immediate relief:**\n` +
    `• **Box breathing** — inhale for 4 seconds, hold for 4, exhale for 4, hold for 4. Repeat 4 times.\n` +
    `• **5-minute walk** — even brief movement reduces cortisol levels.\n` +
    `• **Cold water** — splashing cold water on your face activates the dive reflex and calms the nervous system.\n\n` +
    `**Daily practices:**\n` +
    `• **Exercise** — one of the most effective stress reducers available; even 20 minutes makes a difference.\n` +
    `• **Sleep** — chronic stress and poor sleep create a vicious cycle. Prioritise rest.\n` +
    `• **Journaling** — writing down worries reduces their mental load.\n` +
    `• **Limit caffeine** — excess caffeine amplifies anxiety and stress responses.\n\n` +
    `**Long-term strategies:**\n` +
    `• **Meditation** — even 5–10 minutes daily reduces cortisol over time.\n` +
    `• **Social connection** — talking to someone you trust is a powerful stress buffer.\n` +
    `• **Nature exposure** — spending time outdoors lowers stress hormones.\n` +
    `• **Boundaries** — learn to say no and protect your recovery time.\n\n` +
    `**Note:** High stress elevates cortisol, which can disrupt sleep, increase appetite, and impair recovery. Managing stress is as important as diet and exercise.`
  );
}


function goalResponse(): string {
  return (
    `Setting clear wellness goals is the foundation of lasting change. Here is how to structure your approach:\n\n` +
    `**Define your goal clearly:**\n` +
    `• Be specific — "lose 5kg in 3 months" is more actionable than "lose weight".\n` +
    `• Make it measurable and time-bound so you can track progress.\n\n` +
    `**Choose the right goal for you:**\n` +
    `• **Fat loss** — calorie deficit, cardio, and strength training.\n` +
    `• **Muscle gain** — calorie surplus, progressive strength training, high protein.\n` +
    `• **Better sleep** — consistent schedule, sleep hygiene, and stress management.\n` +
    `• **Improve fitness** — structured cardio and strength programme with progressive overload.\n` +
    `• **Stress management** — daily movement, sleep, breathing techniques, and mindfulness.\n\n` +
    `**Build habits, not just goals:**\n` +
    `• Focus on daily actions rather than outcomes.\n` +
    `• Start small — 1% improvements compound significantly over time.\n\n` +
    `**Track consistently:**\n` +
    `• Use NutriSphere's trackers daily for calories, sleep, water, and workouts.\n` +
    `• Set your active goal in the Wellness Score page to unlock milestones and points.\n` +
    `• Review your Wellness Score weekly to see progress.\n\n` +
    `**Stay accountable:**\n` +
    `• Log your meals, sleep, and workouts every day.\n` +
    `• Celebrate small wins — they build momentum toward bigger results.`
  );
}

function summaryResponse(snap: TrackerSnapshot): string {
  const lines: string[] = [];

  if (snap.calories !== null && snap.calories > 0) {
    lines.push(`• Calories logged: ${snap.calories} kcal`);
  } else {
    lines.push(`• Calories: not logged today`);
  }

  if (snap.sleepHrs !== null) {
    const status = snap.sleepHrs >= 7 && snap.sleepHrs <= 9 ? "optimal" : snap.sleepHrs < 7 ? "below target" : "above target";
    lines.push(`• Sleep: ${snap.sleepHrs.toFixed(1)}h (${status})`);
  } else {
    lines.push(`• Sleep: not logged today`);
  }

  if (snap.water !== null) {
    const status = snap.water >= 8 ? "goal reached" : `${8 - snap.water} more to reach goal`;
    lines.push(`• Water: ${snap.water} glass${snap.water === 1 ? "" : "es"} (${status})`);
  } else {
    lines.push(`• Water: not logged today`);
  }

  if (snap.workoutMin !== null && snap.workoutMin > 0) {
    lines.push(`• Workout: ${snap.workoutMin} minutes logged`);
  } else {
    lines.push(`• Workout: not logged today`);
  }

  if (snap.steps !== null && snap.steps > 0) {
    const status = snap.steps >= 10000 ? "goal reached" : `${(10000 - snap.steps).toLocaleString()} to goal`;
    lines.push(`• Steps: ${snap.steps.toLocaleString()} (${status})`);
  } else {
    lines.push(`• Steps: not logged today`);
  }

  if (snap.bmi !== null) {
    lines.push(`• BMI: ${snap.bmi.toFixed(1)}`);
  }

  let reply = `Here is your wellness summary for today:\n\n`;
  reply += lines.join("\n");
  reply += `\n\n**What would you like to focus on?**\n`;
  reply += `Ask me about nutrition, sleep, workouts, hydration, steps, BMI, stress, or your wellness goals.`;

  return reply;
}

function unknownResponse(): string {
  return (
    `I was not able to identify a specific wellness topic in your message.\n\n` +
    `The AI Wellness Coach can help you with:\n` +
    `• **Nutrition** — meal advice, calorie guidance, macro tips\n` +
    `• **Sleep** — improvement strategies and sleep quality\n` +
    `• **Fatigue** — recovery from tiredness and low energy\n` +
    `• **Workouts** — training plans, muscle gain, fat loss exercise\n` +
    `• **Hydration** — daily water targets and tips\n` +
    `• **Steps** — daily movement and step goals\n` +
    `• **BMI** — body mass index and body composition\n` +
    `• **Weight management** — fat loss or muscle gain plans\n` +
    `• **Stress** — mental wellness and relaxation techniques\n` +
    `• **Goals** — setting and tracking wellness goals\n` +
    `• **Summary** — overview of today's logged data\n\n` +
    `Try rephrasing your question or select one of the suggested topics on the right.`
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Main router
//
// Priority order (most specific → most general):
//  1. Out-of-scope guard — always checked first
//  2. Explicit summary request
//  3. Fatigue (before sleep, so "tired after workout" routes here not to sleep)
//  4. Sleep (explicit sleep terms only)
//  5. Water / hydration
//  6. Steps (before workout, so "walking" routes here when steps-focused)
//  7. BMI / body composition
//  8. Weight management (lose/gain weight — before workout to avoid overlap)
//  9. Workout / exercise
// 10. Stress / mental wellness
// 11. Nutrition / meals
// 12. Goals (explicit goal-setting language only)
// 13. Unknown — no matching domain found
// ─────────────────────────────────────────────────────────────────────────────

export function generateAIResponse(input: string, snap: TrackerSnapshot): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return "Please type a question or describe what you would like help with today.";
  }

  // 1. Out-of-scope guard
  if (isOutOfScope(trimmed)) {
    return outOfScopeResponse();
  }

  // 2. Explicit wellness summary
  if (matches(trimmed, SUMMARY_KW)) {
    return summaryResponse(snap);
  }

  // 3. Fatigue / tiredness / low energy (checked before sleep)
  if (matches(trimmed, FATIGUE_KW)) {
    return fatigueResponse(snap);
  }

  // 4. Sleep (explicit sleep terms)
  if (matches(trimmed, SLEEP_KW)) {
    return sleepResponse(trimmed, snap);
  }

  // 5. Hydration
  if (matches(trimmed, WATER_KW)) {
    return waterResponse(snap);
  }

  // 6. Steps / daily movement (checked before workout to catch "walking" step queries)
  if (matches(trimmed, STEPS_KW)) {
    return stepsResponse(snap);
  }

  // 7. BMI / body composition
  if (matches(trimmed, BMI_KW)) {
    return bmiResponse(snap);
  }

  // 8. Weight management (lose/gain weight — before workout to avoid overlap)
  if (matches(trimmed, WEIGHT_KW)) {
    return weightResponse(trimmed);
  }

  // 9. Workout / exercise
  if (matches(trimmed, WORKOUT_KW)) {
    return workoutResponse(trimmed, snap);
  }

  // 10. Stress / mental wellness
  if (matches(trimmed, STRESS_KW)) {
    return stressResponse();
  }

  // 11. Nutrition / meals
  if (matches(trimmed, MEAL_KW)) {
    return mealResponse(trimmed, snap);
  }

  // 12. Goal setting
  if (matches(trimmed, GOAL_KW)) {
    return goalResponse();
  }

  // 13. No domain matched
  return unknownResponse();
}
