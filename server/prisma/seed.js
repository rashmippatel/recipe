import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    // Ingredients
    const ingredients = [
        { name: 'tomato', unit: 'g' },
        { name: 'onion', unit: 'g' },
        { name: 'potato', unit: 'g' },
        { name: 'egg', unit: 'pcs' },
        { name: 'milk', unit: 'ml' },
        { name: 'flour', unit: 'g' },
        { name: 'rice', unit: 'g' },
        { name: 'lentils', unit: 'g' },
        { name: 'spinach', unit: 'g' },
        { name: 'paneer', unit: 'g' },
        { name: 'chicken', unit: 'g' },
        { name: 'garlic', unit: 'g' },
        { name: 'ginger', unit: 'g' },
        { name: 'chili', unit: 'g' },
        { name: 'oil', unit: 'ml' },
        { name: 'butter', unit: 'g' },
        { name: 'turmeric', unit: 'g' },
        { name: 'cumin', unit: 'g' },
        { name: 'coriander', unit: 'g' },
        { name: 'salt', unit: 'g' },
        { name: 'cheese', unit: 'g' },
        { name: 'bread', unit: 'pcs' },
        { name: 'poha', unit: 'g' },
        { name: 'butter chicken sauce', unit: 'g' },
        { name: 'pizza dough', unit: 'g' },
        { name: 'tomato sauce', unit: 'g' },
        { name: 'mozzarella', unit: 'g' },
        { name: 'capsicum', unit: 'g' }
    ];
    for (const ing of ingredients) {
        await prisma.ingredient.upsert({
            where: { name: ing.name },
            update: {},
            create: ing,
        });
    }
    const byName = async (name) => prisma.ingredient.findUniqueOrThrow({ where: { name } });
    async function createRecipe(data) {
        return prisma.recipe.create({
            data: {
                name: data.name,
                isVeg: data.isVeg,
                cookTimeMin: data.cookTimeMin,
                mealTypesCsv: data.mealTypes.join(','),
                instructions: data.instructions,
                sourceType: data.sourceType,
                sourceUrl: data.sourceUrl ?? null,
                famous: Boolean(data.famous),
                ingredients: {
                    create: await Promise.all(data.ingredients.map(async (i) => ({
                        quantity: i.quantity,
                        ingredient: { connect: { id: (await byName(i.name)).id } },
                    }))),
                },
            },
        });
    }
    // Recipes (veg and non-veg)
    await createRecipe({
        name: 'Masala Omelette',
        isVeg: false,
        cookTimeMin: 10,
        mealTypes: ['Breakfast'],
        instructions: 'Beat eggs with spices, cook with onions, tomatoes, chilies.',
        sourceType: 'other',
        ingredients: [
            { name: 'egg', quantity: 2 },
            { name: 'onion', quantity: 30 },
            { name: 'tomato', quantity: 30 },
            { name: 'chili', quantity: 5 },
            { name: 'oil', quantity: 10 },
            { name: 'salt', quantity: 3 },
        ],
    });
    await createRecipe({
        name: 'Poha',
        isVeg: true,
        cookTimeMin: 20,
        mealTypes: ['Breakfast'],
        instructions: 'Rinse poha, temper spices, cook with onions and potatoes.',
        sourceType: 'other',
        ingredients: [
            { name: 'poha', quantity: 150 },
            { name: 'onion', quantity: 40 },
            { name: 'potato', quantity: 100 },
            { name: 'oil', quantity: 10 },
            { name: 'cumin', quantity: 3 },
            { name: 'salt', quantity: 3 },
        ],
    });
    await createRecipe({
        name: 'Veg Sandwich',
        isVeg: true,
        cookTimeMin: 10,
        mealTypes: ['Breakfast', 'Evening Snack'],
        instructions: 'Layer bread with tomato, cucumber, cheese, grill lightly.',
        sourceType: 'other',
        ingredients: [
            { name: 'bread', quantity: 2 },
            { name: 'tomato', quantity: 40 },
            { name: 'cheese', quantity: 30 },
            { name: 'butter', quantity: 10 },
            { name: 'salt', quantity: 2 },
        ],
    });
    await createRecipe({
        name: 'Aloo Paratha',
        isVeg: true,
        cookTimeMin: 45,
        mealTypes: ['Breakfast', 'Lunch'],
        instructions: 'Prepare potato filling, stuff in dough, roll and pan-fry.',
        sourceType: 'other',
        ingredients: [
            { name: 'flour', quantity: 200 },
            { name: 'potato', quantity: 200 },
            { name: 'salt', quantity: 3 },
            { name: 'butter', quantity: 10 },
        ],
    });
    await createRecipe({
        name: 'Paneer Bhurji',
        isVeg: true,
        cookTimeMin: 25,
        mealTypes: ['Lunch', 'Dinner'],
        instructions: 'Saute onions, tomatoes, spices; scramble paneer; cook briefly.',
        sourceType: 'other',
        ingredients: [
            { name: 'paneer', quantity: 200 },
            { name: 'onion', quantity: 60 },
            { name: 'tomato', quantity: 80 },
            { name: 'turmeric', quantity: 2 },
            { name: 'coriander', quantity: 2 },
            { name: 'oil', quantity: 10 },
            { name: 'salt', quantity: 3 },
        ],
    });
    await createRecipe({
        name: 'Spinach Dal',
        isVeg: true,
        cookTimeMin: 35,
        mealTypes: ['Lunch', 'Dinner'],
        instructions: 'Cook lentils; temper with spinach, garlic, cumin, spices.',
        sourceType: 'other',
        ingredients: [
            { name: 'lentils', quantity: 150 },
            { name: 'spinach', quantity: 150 },
            { name: 'garlic', quantity: 10 },
            { name: 'cumin', quantity: 3 },
            { name: 'turmeric', quantity: 2 },
            { name: 'salt', quantity: 3 },
            { name: 'oil', quantity: 10 },
        ],
    });
    await createRecipe({
        name: 'Tomato Soup',
        isVeg: true,
        cookTimeMin: 30,
        mealTypes: ['Evening Snack', 'Dinner'],
        instructions: 'Simmer tomatoes with aromatics, blend, season, and serve.',
        sourceType: 'other',
        ingredients: [
            { name: 'tomato', quantity: 400 },
            { name: 'onion', quantity: 50 },
            { name: 'garlic', quantity: 10 },
            { name: 'butter', quantity: 10 },
            { name: 'salt', quantity: 3 },
        ],
    });
    await createRecipe({
        name: 'Chicken Curry',
        isVeg: false,
        cookTimeMin: 45,
        mealTypes: ['Lunch', 'Dinner'],
        instructions: 'Brown chicken, simmer with onion-tomato masala and spices.',
        sourceType: 'other',
        ingredients: [
            { name: 'chicken', quantity: 500 },
            { name: 'onion', quantity: 150 },
            { name: 'tomato', quantity: 150 },
            { name: 'garlic', quantity: 10 },
            { name: 'ginger', quantity: 10 },
            { name: 'oil', quantity: 20 },
            { name: 'turmeric', quantity: 3 },
            { name: 'coriander', quantity: 3 },
            { name: 'salt', quantity: 5 },
        ],
    });
    await createRecipe({
        name: 'Grilled Chicken Wrap',
        isVeg: false,
        cookTimeMin: 30,
        mealTypes: ['Lunch'],
        instructions: 'Grill chicken, wrap with veggies and sauce in flatbread.',
        sourceType: 'other',
        ingredients: [
            { name: 'chicken', quantity: 200 },
            { name: 'tomato', quantity: 60 },
            { name: 'onion', quantity: 40 },
            { name: 'lettuce', quantity: 50 },
            { name: 'salt', quantity: 3 },
        ].filter((i) => i.name !== 'lettuce'),
    });
    await createRecipe({
        name: 'Egg Fried Rice',
        isVeg: false,
        cookTimeMin: 25,
        mealTypes: ['Lunch', 'Dinner'],
        instructions: 'Stir-fry rice with eggs, veggies, and seasoning.',
        sourceType: 'other',
        ingredients: [
            { name: 'rice', quantity: 200 },
            { name: 'egg', quantity: 2 },
            { name: 'onion', quantity: 40 },
            { name: 'oil', quantity: 15 },
            { name: 'salt', quantity: 3 },
        ],
    });
    // Famous ones
    await createRecipe({
        name: 'Butter Chicken',
        isVeg: false,
        cookTimeMin: 60,
        mealTypes: ['Lunch', 'Dinner'],
        instructions: 'Marinate chicken, cook in butter tomato gravy.',
        sourceType: 'website',
        famous: true,
        ingredients: [
            { name: 'chicken', quantity: 600 },
            { name: 'butter', quantity: 50 },
            { name: 'tomato', quantity: 300 },
            { name: 'butter chicken sauce', quantity: 200 },
            { name: 'cream', quantity: 100 },
            { name: 'salt', quantity: 5 },
        ].filter((i) => i.name !== 'cream'),
    });
    await createRecipe({
        name: 'Margherita Pizza',
        isVeg: true,
        cookTimeMin: 30,
        mealTypes: ['Lunch', 'Dinner'],
        instructions: 'Top dough with tomato sauce and mozzarella; bake.',
        sourceType: 'website',
        famous: true,
        ingredients: [
            { name: 'pizza dough', quantity: 300 },
            { name: 'tomato sauce', quantity: 100 },
            { name: 'mozzarella', quantity: 150 },
            { name: 'salt', quantity: 2 },
        ],
    });
    // More veg
    await createRecipe({
        name: 'Paneer Tikka',
        isVeg: true,
        cookTimeMin: 35,
        mealTypes: ['Evening Snack', 'Dinner'],
        instructions: 'Marinate paneer, grill; serve with onions and capsicum.',
        sourceType: 'other',
        ingredients: [
            { name: 'paneer', quantity: 250 },
            { name: 'capsicum', quantity: 80 },
            { name: 'onion', quantity: 60 },
            { name: 'salt', quantity: 3 },
            { name: 'oil', quantity: 10 },
        ],
    });
    await createRecipe({
        name: 'Spinach Omelette',
        isVeg: false,
        cookTimeMin: 12,
        mealTypes: ['Breakfast'],
        instructions: 'Beat eggs, fold in spinach, cook until set.',
        sourceType: 'other',
        ingredients: [
            { name: 'egg', quantity: 2 },
            { name: 'spinach', quantity: 60 },
            { name: 'salt', quantity: 2 },
            { name: 'oil', quantity: 10 },
        ],
    });
    await createRecipe({
        name: 'Cumin Rice',
        isVeg: true,
        cookTimeMin: 20,
        mealTypes: ['Lunch', 'Dinner'],
        instructions: 'Temper cumin in oil, toss with cooked rice and salt.',
        sourceType: 'other',
        ingredients: [
            { name: 'rice', quantity: 200 },
            { name: 'cumin', quantity: 3 },
            { name: 'oil', quantity: 10 },
            { name: 'salt', quantity: 3 },
        ],
    });
    await createRecipe({
        name: 'Garlic Butter Paneer',
        isVeg: true,
        cookTimeMin: 15,
        mealTypes: ['Evening Snack', 'Dinner'],
        instructions: 'Saute paneer with garlic in butter, season with salt.',
        sourceType: 'other',
        ingredients: [
            { name: 'paneer', quantity: 200 },
            { name: 'garlic', quantity: 10 },
            { name: 'butter', quantity: 20 },
            { name: 'salt', quantity: 3 },
        ],
    });
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
