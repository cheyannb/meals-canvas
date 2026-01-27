import Home from './pages/Home';
import MyRecipes from './pages/MyRecipes';
import Checkout from './pages/Checkout';
import ReverseRecipe from './pages/ReverseRecipe';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "MyRecipes": MyRecipes,
    "Checkout": Checkout,
    "ReverseRecipe": ReverseRecipe,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};