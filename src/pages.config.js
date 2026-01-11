import Home from './pages/Home';
import MyRecipes from './pages/MyRecipes';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "MyRecipes": MyRecipes,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};