import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { restaurants, menuItems } from "./schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

// ─────────────────────────────────────────────────────────────────────────────
//  4 cuisine categories · 3 restaurants each · 4–5 menu items each
//  All prices in PHP (stored as integer, whole peso).
//  All images from images.unsplash.com or plus.unsplash.com (already whitelisted).
// ─────────────────────────────────────────────────────────────────────────────

const mockData = [

  // ═══════════════════════════════════════════════════════════════════════════
  //  PIZZA & ITALIAN
  // ═══════════════════════════════════════════════════════════════════════════

  {
    restaurant: {
      name: "Yellow Cab Pizza Co.",
      cuisine: "Pizza & Italian",
      rating: "4.7",
      imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1170&auto=format&fit=crop",
      deliveryTime: "25–40 mins",
      minOrder: 299,
    },
    menu: [
      {
        name: "New York's Finest (16\")",
        description: "Classic hand-tossed 16\" pizza loaded with pepperoni, Italian sausage, mushrooms, and bell peppers on a tangy tomato base.",
        price: 699,
        category: "Pizza",
        rating: "4.8",
        imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Four Cheese Pizza (10\")",
        description: "A decadent blend of mozzarella, cheddar, parmesan, and cream cheese on a garlic-butter base. No sauce, all soul.",
        price: 445,
        category: "Pizza",
        rating: "4.7",
        imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Charlie Chan Chicken Pasta",
        description: "Cold pasta salad with grilled chicken, peanut dressing, crispy wontons, and sesame seeds. A Yellow Cab signature.",
        price: 295,
        category: "Pasta",
        rating: "4.9",
        imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Crazy Bread (8 pcs)",
        description: "Freshly baked breadsticks brushed with garlic butter and dusted with parmesan. Served with marinara dipping sauce.",
        price: 175,
        category: "Sides",
        rating: "4.6",
        imageUrl: "https://images.unsplash.com/photo-1549194388-b5d8a6bccd35?q=80&w=600&auto=format&fit=crop",
      },
    ],
  },

  {
    restaurant: {
      name: "Sbarro",
      cuisine: "Pizza & Italian",
      rating: "4.4",
      imageUrl: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?q=80&w=1170&auto=format&fit=crop",
      deliveryTime: "20–35 mins",
      minOrder: 199,
    },
    menu: [
      {
        name: "New York-Style Pepperoni Slice",
        description: "A massive, foldable New York slice piled with premium pepperoni and bubbling mozzarella over house tomato sauce.",
        price: 195,
        category: "Pizza",
        rating: "4.5",
        imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Stuffed Spinach & Cheese Slice",
        description: "Deep-dish slice packed with seasoned spinach, ricotta, and mozzarella encased in golden, flaky pizza dough.",
        price: 225,
        category: "Pizza",
        rating: "4.4",
        imageUrl: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Baked Ziti",
        description: "Hearty tube pasta baked in a rich meat sauce with layers of mozzarella and ricotta, finished with a golden crust.",
        price: 255,
        category: "Pasta",
        rating: "4.3",
        imageUrl: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Meat Lasagna",
        description: "Classic lasagna layered with Bolognese, béchamel, and three cheeses. Slow-baked for a deep, satisfying richness.",
        price: 275,
        category: "Pasta",
        rating: "4.5",
        imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop",
      },
    ],
  },

  {
    restaurant: {
      name: "Pizza Hut Philippines",
      cuisine: "Pizza & Italian",
      rating: "4.5",
      imageUrl: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=1170&auto=format&fit=crop",
      deliveryTime: "30–45 mins",
      minOrder: 350,
    },
    menu: [
      {
        name: "Super Supreme (Regular)",
        description: "The loaded classic — pepperoni, ham, beef, Italian sausage, mushrooms, onions, green pepper, and black olives.",
        price: 499,
        category: "Pizza",
        rating: "4.6",
        imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Cheesy Bites Pizza (Large)",
        description: "Signature pan pizza ringed with 28 cheese-stuffed bites. Rich tomato sauce, mozzarella, and your choice of toppings.",
        price: 649,
        category: "Pizza",
        rating: "4.7",
        imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Tuscani Creamy Chicken Pasta",
        description: "Penne tossed in a velvety cream sauce with grilled chicken, mushrooms, and a hint of garlic. Comfort in every bite.",
        price: 295,
        category: "Pasta",
        rating: "4.5",
        imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Breadsticks (4 pcs)",
        description: "Soft, pull-apart breadsticks brushed with herb-garlic butter and topped with parmesan. Perfect for sharing.",
        price: 149,
        category: "Sides",
        rating: "4.3",
        imageUrl: "https://images.unsplash.com/photo-1549194388-b5d8a6bccd35?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Mozzarella Sticks (6 pcs)",
        description: "Golden-fried mozzarella sticks with a molten cheese center. Served with a side of spiced marinara.",
        price: 199,
        category: "Sides",
        rating: "4.4",
        imageUrl: "https://images.unsplash.com/photo-1531749668029-2db88e4276c7?q=80&w=600&auto=format&fit=crop",
      },
    ],
  },


  // ═══════════════════════════════════════════════════════════════════════════
  //  ASIAN & SUSHI
  // ═══════════════════════════════════════════════════════════════════════════

  {
    restaurant: {
      name: "Genki Sushi",
      cuisine: "Asian & Sushi",
      rating: "4.8",
      imageUrl: "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1170&auto=format&fit=crop",
      deliveryTime: "30–45 mins",
      minOrder: 400,
    },
    menu: [
      {
        name: "Salmon Aburi (2 pcs)",
        description: "Fresh Norwegian salmon nigiri torched to golden perfection, drizzled with Genki's signature aburi sauce and spring onion.",
        price: 195,
        category: "Sushi",
        rating: "4.9",
        imageUrl: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Tuna Sashimi (5 pcs)",
        description: "Restaurant-grade bluefin tuna, sliced thick and served chilled with wasabi, pickled ginger, and soy sauce.",
        price: 275,
        category: "Sashimi",
        rating: "4.8",
        imageUrl: "https://images.unsplash.com/photo-1582450871972-ab5ca641643d?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Spicy Crabstick Roll (8 pcs)",
        description: "Imitation crab, cucumber, and avocado wrapped in sushi rice and nori, topped with spicy mayo and tobiko.",
        price: 245,
        category: "Rolls",
        rating: "4.7",
        imageUrl: "https://images.unsplash.com/photo-1617196034223-f2e5db36416b?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Chicken Karaage (5 pcs)",
        description: "Japanese-style fried chicken marinated in soy, ginger, and mirin. Crispy outside, juicy inside. Served with kewpie mayo.",
        price: 185,
        category: "Starters",
        rating: "4.8",
        imageUrl: "https://images.unsplash.com/photo-1562802378-063ec186a863?q=80&w=600&auto=format&fit=crop",
      },
    ],
  },

  {
    restaurant: {
      name: "Hap Chan",
      cuisine: "Asian & Sushi",
      rating: "4.5",
      imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=1170&auto=format&fit=crop",
      deliveryTime: "20–35 mins",
      minOrder: 200,
    },
    menu: [
      {
        name: "Wonton Noodle Soup",
        description: "Silky egg noodles in a clear Cantonese broth, topped with plump pork-and-shrimp wontons and bok choy.",
        price: 185,
        category: "Noodles",
        rating: "4.6",
        imageUrl: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Yang Chow Fried Rice",
        description: "Wok-tossed jasmine rice with egg, char siu pork, shrimp, spring onion, and peas. A Chinese-Filipino staple.",
        price: 225,
        category: "Rice",
        rating: "4.5",
        imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Sweet & Sour Pork",
        description: "Crispy battered pork fillet tossed in a bright, tangy pineapple-tomato glaze with bell peppers and onions.",
        price: 265,
        category: "Mains",
        rating: "4.4",
        imageUrl: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Hakaw Shrimp Dumpling (4 pcs)",
        description: "Steamed dim sum dumplings filled with whole shrimp and bamboo shoots, wrapped in a translucent rice skin.",
        price: 165,
        category: "Dim Sum",
        rating: "4.7",
        imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Siomai (6 pcs)",
        description: "Open-topped steamed dumplings with seasoned ground pork, water chestnuts, and shiitake mushroom. Served with soy-calamansi.",
        price: 145,
        category: "Dim Sum",
        rating: "4.5",
        imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&auto=format&fit=crop",
      },
    ],
  },

  {
    restaurant: {
      name: "Tokyo Tokyo",
      cuisine: "Asian & Sushi",
      rating: "4.4",
      imageUrl: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?q=80&w=1170&auto=format&fit=crop",
      deliveryTime: "20–30 mins",
      minOrder: 150,
    },
    menu: [
      {
        name: "Gyudon (Beef Rice Bowl)",
        description: "Simmered beef and onion in a sweet-savory dashi broth served over a generous bowl of steamed Japanese rice.",
        price: 199,
        category: "Rice Bowls",
        rating: "4.5",
        imageUrl: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Tonkotsu Ramen",
        description: "Rich, cloudy pork bone broth with springy noodles, chashu pork belly, soft-boiled egg, nori, and bamboo shoots.",
        price: 265,
        category: "Ramen",
        rating: "4.6",
        imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Chicken Teriyaki Plate",
        description: "Grilled chicken thigh glazed with house teriyaki sauce, served with steamed rice, shredded cabbage, and miso soup.",
        price: 235,
        category: "Mains",
        rating: "4.4",
        imageUrl: "https://images.unsplash.com/photo-1519984388953-d2406bc725e1?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Salmon Maki Roll (8 pcs)",
        description: "Fresh salmon, cucumber, and cream cheese rolled in seasoned sushi rice and toasted nori. Clean, simple, delicious.",
        price: 195,
        category: "Sushi",
        rating: "4.5",
        imageUrl: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?q=80&w=600&auto=format&fit=crop",
      },
    ],
  },


  // ═══════════════════════════════════════════════════════════════════════════
  //  BURGERS & FAST FOOD
  // ═══════════════════════════════════════════════════════════════════════════

  {
    restaurant: {
      name: "McDonald's Philippines",
      cuisine: "Burgers & Fast Food",
      rating: "4.7",
      imageUrl: "https://plus.unsplash.com/premium_photo-1683619761468-b06992704398?q=80&w=665&auto=format&fit=crop",
      deliveryTime: "20–30 mins",
      minOrder: 39,
    },
    menu: [
      {
        name: "Big Mac",
        description: "Two all-beef patties, special sauce, lettuce, cheese, pickles, and onions on a sesame seed bun. The legend.",
        price: 160,
        category: "Burgers",
        rating: "4.7",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "McSpicy Chicken Sandwich",
        description: "A crispy, spiced chicken fillet with shredded lettuce and mayo on a toasted bun. Bold heat, every bite.",
        price: 155,
        category: "Burgers",
        rating: "4.6",
        imageUrl: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "6-pc. Chicken McNuggets",
        description: "Tender, juicy all-white meat chicken nuggets with a perfectly seasoned golden coating. Choose your dipping sauce.",
        price: 140,
        category: "Chicken",
        rating: "4.6",
        imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "World Famous Fries (Large)",
        description: "Golden, crispy, perfectly salted. Thin-cut fries cooked in a proprietary blend. Iconic for a reason.",
        price: 85,
        category: "Sides",
        rating: "4.8",
        imageUrl: "https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=600&auto=format&fit=crop",
      },
    ],
  },

  {
    restaurant: {
      name: "Shake Shack",
      cuisine: "Burgers & Fast Food",
      rating: "4.8",
      imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1065&auto=format&fit=crop",
      deliveryTime: "25–40 mins",
      minOrder: 350,
    },
    menu: [
      {
        name: "ShackBurger",
        description: "Juicy Angus beef smash patty with American cheese, lettuce, tomato, and Shake Shack's signature ShackSauce on a potato bun.",
        price: 395,
        category: "Burgers",
        rating: "4.9",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "SmokeShack",
        description: "ShackBurger topped with chopped applewood smoked bacon, cherry peppers, and ShackSauce. Bold, smoky, and indulgent.",
        price: 465,
        category: "Burgers",
        rating: "4.8",
        imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Chick'n Shack",
        description: "Crispy, all-natural chicken breast fried in refined coconut oil with lettuce, pickles, and buttermilk herb mayo.",
        price: 385,
        category: "Chicken",
        rating: "4.7",
        imageUrl: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Crinkle-Cut Cheese Fries",
        description: "Thick, crinkle-cut fries smothered in a rich, velvety Shack-made cheese sauce. Best shared — but you won't want to.",
        price: 265,
        category: "Sides",
        rating: "4.8",
        imageUrl: "https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Vanilla Shake",
        description: "Dense, creamy frozen custard blended to order with whole milk. Real custard, not soft serve. Made fresh daily.",
        price: 295,
        category: "Drinks",
        rating: "4.9",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop",
      },
    ],
  },

  {
    restaurant: {
      name: "Army Navy Burger + Burrito",
      cuisine: "Burgers & Fast Food",
      rating: "4.6",
      imageUrl: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=1172&auto=format&fit=crop",
      deliveryTime: "20–35 mins",
      minOrder: 200,
    },
    menu: [
      {
        name: "The Original Burger",
        description: "Fresh, never-frozen Angus beef patty with American cheese, pickles, onion, lettuce, and signature Army Navy sauce.",
        price: 289,
        category: "Burgers",
        rating: "4.6",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Chicken Burrito",
        description: "Flour tortilla stuffed with grilled chicken, Mexican rice, black beans, pico de gallo, sour cream, and cheddar.",
        price: 269,
        category: "Burritos",
        rating: "4.7",
        imageUrl: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Beef & Cheese Quesadilla",
        description: "Crispy flour tortilla filled with seasoned ground beef and melted cheddar-jack cheese. Served with salsa and sour cream.",
        price: 235,
        category: "Burritos",
        rating: "4.5",
        imageUrl: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Loaded Army Fries",
        description: "Thick-cut fries piled with chili beef, melted cheese sauce, jalapeños, and a drizzle of sour cream.",
        price: 195,
        category: "Sides",
        rating: "4.6",
        imageUrl: "https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=600&auto=format&fit=crop",
      },
    ],
  },


  // ═══════════════════════════════════════════════════════════════════════════
  //  CHICKEN & FILIPINO
  // ═══════════════════════════════════════════════════════════════════════════

  {
    restaurant: {
      name: "Jollibee",
      cuisine: "Chicken & Filipino",
      rating: "4.8",
      imageUrl: "https://images.unsplash.com/photo-1626082928501-8b0d4c82c61e?q=80&w=1170&auto=format&fit=crop",
      deliveryTime: "15–25 mins",
      minOrder: 0,
    },
    menu: [
      {
        name: "Chickenjoy (1-pc.) w/ Rice",
        description: "Jollibee's legendary fried chicken — crispy, juicy, with a secret marinade. Served with steamed rice and gravy.",
        price: 95,
        category: "Chicken",
        rating: "4.9",
        imageUrl: "https://images.unsplash.com/photo-1626082928501-8b0d4c82c61e?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Chickenjoy Bucket (6-pc.)",
        description: "Six pieces of the iconic Chickenjoy served family-style. A mix of parts, all with that signature crunch.",
        price: 499,
        category: "Chicken",
        rating: "4.9",
        imageUrl: "https://images.unsplash.com/photo-1598514982205-f36b96d1ea8d?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Jolly Spaghetti",
        description: "Sweet-style Filipino spaghetti in a rich tomato-meat sauce topped with sliced hotdog, ground beef, and cheddar cheese.",
        price: 65,
        category: "Pasta",
        rating: "4.7",
        imageUrl: "https://images.unsplash.com/photo-1626808642875-0aa54548ebfd?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Yumburger",
        description: "Jollibee's simple, affordable burger — a seasoned beef patty with ketchup on a soft bun. A Filipino comfort classic.",
        price: 40,
        category: "Burgers",
        rating: "4.5",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Peach Mango Pie",
        description: "Deep-fried pastry filled with sweet Philippine peaches and mango jam. Golden, flaky, and uniquely Jollibee.",
        price: 35,
        category: "Desserts",
        rating: "4.8",
        imageUrl: "https://images.unsplash.com/photo-1621955964441-c173e01c135b?q=80&w=600&auto=format&fit=crop",
      },
    ],
  },

  {
    restaurant: {
      name: "Mang Inasal",
      cuisine: "Chicken & Filipino",
      rating: "4.6",
      imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=1170&auto=format&fit=crop",
      deliveryTime: "15–25 mins",
      minOrder: 0,
    },
    menu: [
      {
        name: "Chicken Inasal Paa (Large)",
        description: "Whole chicken leg marinated in calamansi, vinegar, lemongrass, and annatto, then charcoal-grilled. Served with rice and achara.",
        price: 145,
        category: "Chicken",
        rating: "4.8",
        imageUrl: "https://images.unsplash.com/photo-1598514982205-f36b96d1ea8d?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Chicken Inasal Pecho (Large)",
        description: "Plump chicken breast, citrus-marinated and fire-grilled on charcoal. Brushed with chicken oil for a rich, smoky finish.",
        price: 165,
        category: "Chicken",
        rating: "4.8",
        imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Pork BBQ (2 sticks)",
        description: "Skewered pork shoulder marinated overnight in a sweet soy-garlic blend, grilled over live charcoal. Filipino street food at its best.",
        price: 130,
        category: "Grills",
        rating: "4.6",
        imageUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Halo-Halo (Regular)",
        description: "The iconic Filipino shaved ice dessert — with ube halaya, leche flan, sago, nata de coco, beans, and creamy evaporated milk.",
        price: 95,
        category: "Desserts",
        rating: "4.7",
        imageUrl: "https://images.unsplash.com/photo-1488900128323-21503983a07e?q=80&w=600&auto=format&fit=crop",
      },
    ],
  },

  {
    restaurant: {
      name: "KFC Philippines",
      cuisine: "Chicken & Filipino",
      rating: "4.7",
      imageUrl: "https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?q=80&w=1167&auto=format&fit=crop",
      deliveryTime: "15–30 mins",
      minOrder: 0,
    },
    menu: [
      {
        name: "Original Recipe Chicken (1-pc.)",
        description: "The Colonel's 11 herbs and spices. Pressure-fried for a crispy crust and unbeatable juiciness. A global icon.",
        price: 100,
        category: "Chicken",
        rating: "4.7",
        imageUrl: "https://images.unsplash.com/photo-1626082928501-8b0d4c82c61e?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Zinger Burger",
        description: "A fiery, crispy chicken fillet with extra seasoning, coleslaw, and mayo in a toasted sesame bun. Hot and crunchy.",
        price: 160,
        category: "Burgers",
        rating: "4.6",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Famous Bowl",
        description: "Mashed potato topped with bite-sized crispy chicken, sweet corn, gravy, and shredded cheese. All in one satisfying bowl.",
        price: 80,
        category: "Mains",
        rating: "4.5",
        imageUrl: "https://images.unsplash.com/photo-1588673756209-6449195b28d1?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Fully Loaded Box",
        description: "Two pcs. chicken, go cup rice, mashed potato with gravy, coleslaw, and a drink. A complete meal, fully loaded.",
        price: 229,
        category: "Meals",
        rating: "4.6",
        imageUrl: "https://images.unsplash.com/photo-1598514982205-f36b96d1ea8d?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Coleslaw (Regular)",
        description: "KFC's signature creamy coleslaw — crisp shredded cabbage and carrots in a sweet, tangy dressing. Classic side.",
        price: 49,
        category: "Sides",
        rating: "4.4",
        imageUrl: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?q=80&w=600&auto=format&fit=crop",
      },
    ],
  },

];

// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Seeding database...");

  for (const data of mockData) {
    const [insertedRestaurant] = await db
      .insert(restaurants)
      .values(data.restaurant)
      .returning();

    console.log(`✅ Inserted: ${insertedRestaurant.name} (${data.restaurant.cuisine})`);

    const menuToInsert = data.menu.map((item) => ({
      ...item,
      restaurantId: insertedRestaurant.id,
    }));

    await db.insert(menuItems).values(menuToInsert);
    console.log(`   └─ ${menuToInsert.length} menu items added.`);
  }

  console.log("\n🎉 Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});