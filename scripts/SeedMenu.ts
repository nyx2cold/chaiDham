// scripts/seedMenu.ts
// Run with: npx ts-node -r tsconfig-paths/register scripts/seedMenu.ts

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI!;

const MenuItemSchema = new mongoose.Schema(
  {
    name:         String,
    description:  String,
    price:        Number,
    category:     String,
    image:        { type: String, default: "" },
    isVeg:        { type: Boolean, default: true },
    isBestseller: { type: Boolean, default: false },
    isAvailable:  { type: Boolean, default: true },
  },
  { timestamps: true }
);

const MenuItem =
  mongoose.models.MenuItem || mongoose.model("MenuItem", MenuItemSchema);

const items = [
  // ── Chai ──
  {
    name: "Masala Chai",
    description: "Classic Indian spiced tea brewed with ginger, cardamom, and fresh milk.",
    price: 30,
    category: "chai",
    isVeg: true,
    isBestseller: true,
    image: "",
  },
  {
    name: "Adrak Chai",
    description: "Strong ginger tea with a warming kick — perfect for cold Dehradun mornings.",
    price: 25,
    category: "chai",
    isVeg: true,
    isBestseller: false,
    image: "",
  },
  {
    name: "Elaichi Chai",
    description: "Delicate cardamom tea, subtly sweet and wonderfully fragrant.",
    price: 25,
    category: "chai",
    isVeg: true,
    isBestseller: false,
    image: "",
  },
  {
    name: "Cutting Chai",
    description: "Half-glass strong tea, Mumbai-style. Bold, brisk, and straight to the point.",
    price: 20,
    category: "chai",
    isVeg: true,
    isBestseller: true,
    image: "",
  },

  // ── Snacks ──
  {
    name: "Samosa (2 pcs)",
    description: "Crispy golden pastry stuffed with spiced potato and peas. Served with green chutney.",
    price: 30,
    category: "snacks",
    isVeg: true,
    isBestseller: true,
    image: "",
  },
  {
    name: "Bread Pakoda",
    description: "Thick bread slices stuffed with masala potato, dipped in besan batter and deep fried.",
    price: 40,
    category: "snacks",
    isVeg: true,
    isBestseller: false,
    image: "",
  },
  {
    name: "Veg Puff",
    description: "Flaky puff pastry filled with spiced mixed vegetables. Fresh from the oven.",
    price: 25,
    category: "snacks",
    isVeg: true,
    isBestseller: false,
    image: "",
  },
  {
    name: "Egg Puff",
    description: "Buttery puff pastry with a whole boiled egg and spiced masala filling.",
    price: 30,
    category: "snacks",
    isVeg: false,
    isBestseller: false,
    image: "",
  },

  // ── Maggi ──
  {
    name: "Classic Maggi",
    description: "The OG — Maggi noodles tossed in its iconic masala with a desi tadka.",
    price: 50,
    category: "maggi",
    isVeg: true,
    isBestseller: true,
    image: "",
  },
  {
    name: "Egg Maggi",
    description: "Classic Maggi topped with a fried egg. Extra protein, extra satisfaction.",
    price: 65,
    category: "maggi",
    isVeg: false,
    isBestseller: false,
    image: "",
  },
  {
    name: "Cheese Maggi",
    description: "Creamy Maggi loaded with melted cheese. Comfort food at its finest.",
    price: 70,
    category: "maggi",
    isVeg: true,
    isBestseller: false,
    image: "",
  },
  {
    name: "Veggie Maggi",
    description: "Maggi loaded with fresh vegetables — carrots, capsicum, corn and peas.",
    price: 60,
    category: "maggi",
    isVeg: true,
    isBestseller: false,
    image: "",
  },

  // ── Cold Drinks ──
  {
    name: "Cold Coffee",
    description: "Chilled blended coffee with milk and sugar. Thick, creamy, and energising.",
    price: 60,
    category: "cold-drinks",
    isVeg: true,
    isBestseller: false,
    image: "",
  },
  {
    name: "Mango Lassi",
    description: "Thick chilled yoghurt blended with sweet Alphonso mango pulp.",
    price: 55,
    category: "cold-drinks",
    isVeg: true,
    isBestseller: true,
    image: "",
  },
  {
    name: "Lemon Soda",
    description: "Fresh lemon juice with chilled soda, black salt and mint. Instantly refreshing.",
    price: 40,
    category: "cold-drinks",
    isVeg: true,
    isBestseller: false,
    image: "",
  },

  // ── Specials ──
  {
    name: "Kulhad Chai",
    description: "Our signature chai served in a traditional clay kulhad. The real desi experience.",
    price: 40,
    category: "specials",
    isVeg: true,
    isBestseller: true,
    image: "",
  },
  {
    name: "ChaiDham Special Platter",
    description: "Masala chai + 2 samosas + classic Maggi. The ultimate ChaiDham experience.",
    price: 99,
    category: "specials",
    isVeg: true,
    isBestseller: true,
    image: "",
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");
  await MenuItem.deleteMany({});
  console.log("Cleared existing menu items");
  await MenuItem.insertMany(items);
  console.log(`Seeded ${items.length} menu items`);
  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});