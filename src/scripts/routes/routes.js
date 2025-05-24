import HomePage from '../pages/home/home-page';
import {checkAuthenticatedRoute, checkUnauthenticatedRouteOnly} from "../utils/auth";
import LoginPage from "../pages/autentikasi/login/login-page";
import RegisterPage from "../pages/autentikasi/register/register-page";
import AddPage from "../pages/add/add-page";
import DetailPage from "../pages/story-detail/detail-page";
import SavedPage from "../pages/saved/saved-page";
import NotFound from "../pages/not-found/not-found";

const routes = {
  '/login': () => checkUnauthenticatedRouteOnly(new LoginPage()),
  '/register': () => checkUnauthenticatedRouteOnly(new RegisterPage()),

  '/': () => checkAuthenticatedRoute(new HomePage()),
  '/new': () => checkAuthenticatedRoute(new AddPage()),
  '/story/:id': () => checkAuthenticatedRoute(new DetailPage()),
  '/saved': () => checkAuthenticatedRoute(new SavedPage()),
  '*': () => checkAuthenticatedRoute(new NotFound()),
};

export default routes;
