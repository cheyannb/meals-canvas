import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { ChefHat, BookOpen } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ChefHat className="w-8 h-8 text-orange-600" />
                            <span className="text-2xl font-bold text-gray-900">Recipe Generator</span>
                        </div>
                        <div className="flex gap-6">
                            <Link 
                                to={createPageUrl('Home')} 
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                    currentPageName === 'Home' 
                                        ? 'bg-orange-100 text-orange-700 font-medium' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <ChefHat className="w-4 h-4" />
                                Generate
                            </Link>
                            <Link 
                                to={createPageUrl('MyRecipes')} 
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                    currentPageName === 'MyRecipes' 
                                        ? 'bg-orange-100 text-orange-700 font-medium' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <BookOpen className="w-4 h-4" />
                                My Recipes
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
            <main>
                {children}
            </main>
        </div>
    );
}