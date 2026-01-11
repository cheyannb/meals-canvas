import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Image as ImageIcon, Save, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function RecipeGenerator() {
    const [ingredients, setIngredients] = useState('');
    const [recipe, setRecipe] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatingImage, setGeneratingImage] = useState(false);
    const [saving, setSaving] = useState(false);
    const [hasSubscription, setHasSubscription] = useState(false);
    const [checkingSubscription, setCheckingSubscription] = useState(false);

    const checkSubscription = async () => {
        setCheckingSubscription(true);
        try {
            const response = await base44.functions.invoke('checkSubscription', {});
            setHasSubscription(response.data.hasActiveSubscription);
            return response.data.hasActiveSubscription;
        } catch (error) {
            console.error('Subscription check failed:', error);
            return false;
        } finally {
            setCheckingSubscription(false);
        }
    };

    const handleSubscribe = async () => {
        if (window.self !== window.top) {
            alert('Checkout works only from a published app. Please open the app in a new tab.');
            return;
        }

        try {
            const response = await base44.functions.invoke('createCheckoutSession', {});
            window.location.href = response.data.url;
        } catch (error) {
            console.error('Checkout failed:', error);
        }
    };

    const generateRecipe = async () => {
        if (!ingredients.trim()) return;

        setLoading(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Create a detailed recipe using these ingredients: ${ingredients}. 
                Return a JSON object with: title (string), ingredients (array of strings with measurements), 
                instructions (array of strings), prep_time (string), cook_time (string), servings (number), difficulty (Easy/Medium/Hard).`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        ingredients: { type: "array", items: { type: "string" } },
                        instructions: { type: "array", items: { type: "string" } },
                        prep_time: { type: "string" },
                        cook_time: { type: "string" },
                        servings: { type: "number" },
                        difficulty: { type: "string" }
                    }
                }
            });
            setRecipe(response);
        } catch (error) {
            console.error('Recipe generation failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateImage = async () => {
        if (!recipe) return;

        setGeneratingImage(true);
        try {
            const response = await base44.integrations.Core.GenerateImage({
                prompt: `A beautiful, professional food photography shot of ${recipe.title}. High quality, appetizing, well-plated dish on a clean background. Bright, natural lighting.`
            });
            setImageUrl(response.url);
        } catch (error) {
            console.error('Image generation failed:', error);
        } finally {
            setGeneratingImage(false);
        }
    };

    const saveRecipe = async () => {
        const active = await checkSubscription();
        
        if (!active) {
            handleSubscribe();
            return;
        }

        setSaving(true);
        try {
            await base44.entities.Recipe.create({
                ...recipe,
                image_url: imageUrl
            });
            alert('Recipe saved successfully!');
            setRecipe(null);
            setImageUrl('');
            setIngredients('');
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Recipe Generator</h1>
                <p className="text-gray-600">Enter your ingredients and let AI create a delicious recipe</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Ingredients</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        placeholder="e.g., chicken, tomatoes, garlic, olive oil..."
                        value={ingredients}
                        onChange={(e) => setIngredients(e.target.value)}
                        className="min-h-32"
                    />
                    <Button 
                        onClick={generateRecipe} 
                        disabled={loading || !ingredients.trim()}
                        className="w-full"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating Recipe...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generate Recipe
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {recipe && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>{recipe.title}</span>
                            <div className="flex gap-2">
                                <Badge variant="outline">{recipe.difficulty}</Badge>
                                <Badge variant="outline">{recipe.servings} servings</Badge>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-4 text-sm text-gray-600">
                            <span>⏱️ Prep: {recipe.prep_time}</span>
                            <span>🍳 Cook: {recipe.cook_time}</span>
                        </div>

                        {imageUrl && (
                            <img 
                                src={imageUrl} 
                                alt={recipe.title}
                                className="w-full h-64 object-cover rounded-lg"
                            />
                        )}

                        {!imageUrl && (
                            <Button 
                                onClick={generateImage} 
                                disabled={generatingImage}
                                variant="outline"
                                className="w-full"
                            >
                                {generatingImage ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Generating Image...
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon className="w-4 h-4 mr-2" />
                                        Generate Recipe Image
                                    </>
                                )}
                            </Button>
                        )}

                        <div>
                            <h3 className="font-semibold mb-2">Ingredients</h3>
                            <ul className="list-disc list-inside space-y-1">
                                {recipe.ingredients.map((ing, idx) => (
                                    <li key={idx} className="text-gray-700">{ing}</li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">Instructions</h3>
                            <ol className="list-decimal list-inside space-y-2">
                                {recipe.instructions.map((step, idx) => (
                                    <li key={idx} className="text-gray-700">{step}</li>
                                ))}
                            </ol>
                        </div>

                        <Button 
                            onClick={saveRecipe} 
                            disabled={saving || checkingSubscription}
                            className="w-full bg-green-600 hover:bg-green-700"
                        >
                            {saving || checkingSubscription ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {checkingSubscription ? 'Checking...' : 'Saving...'}
                                </>
                            ) : (
                                <>
                                    {hasSubscription ? <Save className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                                    {hasSubscription ? 'Save Recipe' : 'Subscribe to Save ($2.99/month)'}
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}