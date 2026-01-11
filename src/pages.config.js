import Home from './pages/Home';
import MyRecipes from './pages/MyRecipes';
import Checkout from './pages/Checkout';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "MyRecipes": MyRecipes,
    "Checkout": Checkout,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};