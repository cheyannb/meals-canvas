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
    const [recipeCount, setRecipeCount] = useState(0);
    const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail') || '');
    const [showEmailInput, setShowEmailInput] = useState(false);

    React.useEffect(() => {
        const count = parseInt(localStorage.getItem('recipeCount') || '0');
        const email = userEmail;
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');
        
        setRecipeCount(count);
        
        if (sessionId && email) {
            localStorage.setItem('hasSubscription', 'true');
            setHasSubscription(true);
        }
        
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

    const handleSubscribe = async () => {
        if (!userEmail) {
            setShowEmailInput(true);
            return;
        }

        if (window.self !== window.top) {
            alert('Checkout works only from a published app. Please open the app in a new tab.');
            return;
        }

        try {
            const response = await base44.functions.invoke('createCheckoutSession', { email: userEmail });
            localStorage.setItem('userEmail', userEmail);
            window.location.href = response.data.url;
        } catch (error) {
            console.error('Checkout failed:', error);
            alert('Checkout failed. Please try again.');
        }
    };

    const generateRecipe = async () => {
        if (!ingredients.trim()) return;

        // Check if user has reached the limit
        if (recipeCount >= 3 && !hasSubscription) {
            handleSubscribe();
            return;
        }

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
            
            // Increment recipe count only if no subscription
            if (!hasSubscription) {
                const newCount = recipeCount + 1;
                setRecipeCount(newCount);
                localStorage.setItem('recipeCount', newCount.toString());
            }
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
        if (!userEmail) {
            handleSubscribe();
            return;
        }
        
        const active = await checkSubscription(userEmail);
        
        if (!active) {
            handleSubscribe();
            return;
        }

        setSaving(true);
        try {
            await base44.entities.Recipe.create({
                ...recipe,
                image_url: imageUrl,
                user_email: userEmail
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
                {!hasSubscription && (
                    <p className="text-sm text-orange-600 mt-2 font-medium">
                        {recipeCount}/3 free recipes used
                    </p>
                )}
            </div>

            {!hasSubscription && !userEmail && (
                <Card className="bg-orange-50 border-orange-200">
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-3">
                            <Input
                                type="email"
                                placeholder="your@email.com"
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                                className="text-lg py-6"
                                autoFocus
                            />
                            <Button onClick={() => {
                                if (userEmail) {
                                    localStorage.setItem('userEmail', userEmail);
                                }
                            }} className="w-full py-6 text-lg bg-orange-600 hover:bg-orange-700">
                                Save Email for Easy Checkout
                            </Button>
                        </div>
                        <p className="text-xs text-gray-600 mt-3 text-center">
                            We'll remember your email for when you're ready to subscribe
                        </p>
                    </CardContent>
                </Card>
            )}

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
                        ) : recipeCount >= 3 && !hasSubscription ? (
                            <>
                                <Lock className="w-4 h-4 mr-2" />
                                Subscribe to Generate More ($2.99/month)
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
                                    {hasSubscription ? 'Save Recipe' : 'Subscribe to Save - $2.99/month'}
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}