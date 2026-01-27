import Checkout from './pages/Checkout';
import Home from './pages/Home';
import MyRecipes from './pages/MyRecipes';
import ReverseRecipe from './pages/ReverseRecipe';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Checkout": Checkout,
    "Home": Home,
    "MyRecipes": MyRecipes,
    "ReverseRecipe": ReverseRecipe,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};