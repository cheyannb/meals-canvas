import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ChefHat, Save, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ReverseRecipe() {
    const [mealDescription, setMealDescription] = useState('');
    const [ingredients, setIngredients] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [hasSubscription, setHasSubscription] = useState(false);
    const [checkingSubscription, setCheckingSubscription] = useState(false);
    const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail') || '');

    React.useEffect(() => {
        const email = userEmail;
        if (email) {
            checkSubscription(email);
        }
    }, []);

    const checkSubscription = async (email) => {
        if (!email) return false;
        
        setCheckingSubscription(true);
        try {
            const response = await base44.functions.invoke('checkSubscription', { email });
            setHasSubscription(response.data.hasActiveSubscription);
            if (response.data.hasActiveSubscription) {
                localStorage.setItem('hasSubscription', 'true');
            }
            return response.data.hasActiveSubscription;
        } catch (error) {
            console.error('Subscription check failed:', error);
            return false;
        } finally {
            setCheckingSubscription(false);
        }
    };

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

    const saveRecipe = async () => {
        if (!userEmail) {
            window.location.href = '/Checkout';
            return;
        }
        
        const active = await checkSubscription(userEmail);
        
        if (!active) {
            window.location.href = '/Checkout';
            return;
        }

        setSaving(true);
        try {
            await base44.entities.Recipe.create({
                title: ingredients.dish_name,
                ingredients: ingredients.ingredients,
                instructions: ["This recipe was generated from a meal description. Add your cooking instructions here."],
                prep_time: ingredients.estimated_prep_time,
                cook_time: ingredients.estimated_cook_time,
                servings: ingredients.serving_size,
                user_email: userEmail
            });
            alert('Recipe saved successfully!');
            setIngredients(null);
            setMealDescription('');
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setSaving(false);
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

                        <Button 
                            onClick={saveRecipe} 
                            disabled={saving || checkingSubscription}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-lg py-6"
                        >
                            {saving || checkingSubscription ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {checkingSubscription ? 'Checking...' : 'Saving...'}
                                </>
                            ) : (
                                <>
                                    {hasSubscription ? <Save className="w-5 h-5 mr-2" /> : <Lock className="w-5 h-5 mr-2" />}
                                    {hasSubscription ? 'Save to My Recipes' : 'Subscribe to Save - $2.99/month'}
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}