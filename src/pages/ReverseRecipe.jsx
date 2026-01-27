import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ChefHat } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ReverseRecipe() {
    const [mealDescription, setMealDescription] = useState('');
    const [ingredients, setIngredients] = useState(null);
    const [loading, setLoading] = useState(false);

    const generateIngredients = async () => {
        if (!mealDescription.trim()) return;

        setLoading(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Given this finished meal description: "${mealDescription}", provide a complete list of ingredients needed to make it, with specific measurements. Return a JSON object with: dish_name (string), ingredients (array of strings with measurements), serving_size (number), estimated_prep_time (string), estimated_cook_time (string).`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        dish_name: { type: "string" },
                        ingredients: { type: "array", items: { type: "string" } },
                        serving_size: { type: "number" },
                        estimated_prep_time: { type: "string" },
                        estimated_cook_time: { type: "string" }
                    }
                }
            });
            setIngredients(response);
        } catch (error) {
            console.error('Ingredient generation failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Reverse Recipe Generator</h1>
                <p className="text-gray-600">Describe a finished meal and get the ingredients list</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Describe Your Meal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        placeholder="e.g., A creamy carbonara pasta with crispy bacon, parmesan cheese, and black pepper..."
                        value={mealDescription}
                        onChange={(e) => setMealDescription(e.target.value)}
                        className="min-h-32"
                    />
                    <Button 
                        onClick={generateIngredients} 
                        disabled={loading || !mealDescription.trim()}
                        className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Finding Ingredients...
                            </>
                        ) : (
                            <>
                                <ChefHat className="w-4 h-4 mr-2" />
                                Get Ingredients List
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {ingredients && (
                <Card>
                    <CardHeader>
                        <CardTitle>{ingredients.dish_name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-4 text-sm text-gray-600">
                            <span>🍽️ Servings: {ingredients.serving_size}</span>
                            <span>⏱️ Prep: {ingredients.estimated_prep_time}</span>
                            <span>🍳 Cook: {ingredients.estimated_cook_time}</span>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3 text-lg">Ingredients You'll Need:</h3>
                            <ul className="space-y-2">
                                {ingredients.ingredients.map((ing, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <span className="text-orange-600 font-bold">•</span>
                                        <span className="text-gray-700">{ing}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}