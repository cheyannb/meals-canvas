import React from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function MyRecipes() {
    const { data: recipes, isLoading } = useQuery({
        queryKey: ['recipes'],
        queryFn: () => base44.entities.Recipe.list('-created_date'),
        initialData: []
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-4xl font-bold mb-8">My Saved Recipes</h1>
            
            {recipes.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">No recipes saved yet. Generate and save your first recipe!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.map((recipe) => (
                        <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            {recipe.image_url && (
                                <img 
                                    src={recipe.image_url} 
                                    alt={recipe.title}
                                    className="w-full h-48 object-cover"
                                />
                            )}
                            <CardHeader>
                                <CardTitle className="text-xl">{recipe.title}</CardTitle>
                                <div className="flex gap-2 mt-2">
                                    <Badge variant="outline">{recipe.difficulty}</Badge>
                                    <Badge variant="outline">{recipe.servings} servings</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>⏱️ Prep: {recipe.prep_time}</p>
                                    <p>🍳 Cook: {recipe.cook_time}</p>
                                    <p className="mt-2 font-medium">{recipe.ingredients?.length} ingredients</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}