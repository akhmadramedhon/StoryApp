import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import {getAccessToken, getLogout} from "../utils/auth";
import {
  generateAuthenticatedNavigationListTemplate, generateSubscribeButtonTemplate,
  generateUnauthenticatedNavigationListTemplate, generateUnsubscribeButtonTemplate
} from "../template";
import {isServiceWorkerAvailable, setupSkipToContent, transitionHelper} from "../utils";
import {isCurrentPushSubscriptionAvailable, subscribe, unsubscribe} from "../utils/notification-helper";
import Swal from "sweetalert2";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #skipLinkButton = null;

  constructor({ navigationDrawer, drawerButton, content, skipLinkButton }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#skipLinkButton = skipLinkButton;

    this.#init();
  }

  #init() {
    setupSkipToContent(this.#skipLinkButton, this.#content)
    this.#setupDrawer();
    this.#setupNavigationList();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      const isOpen = this.#navigationDrawer.classList.toggle('open');
      this.#drawerButton.textContent = isOpen ? '✖' : '☰';
    });
  
    document.body.addEventListener('click', (event) => {
      const clickedOutsideDrawer = !this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target);
  
      if (clickedOutsideDrawer) {
        this.#navigationDrawer.classList.remove('open');
        this.#drawerButton.textContent = '☰'; // pastikan icon kembali jadi hamburger
      }
  
      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
          this.#drawerButton.textContent = '☰'; // kembali ke hamburger saat navigasi
        }
      });
    });
  }
  

  #setupNavigationList() {
    const isLogin = !!getAccessToken();
    const navList = this.#navigationDrawer.children.namedItem('nav-list');

    if (!isLogin) {
      navList.innerHTML = generateUnauthenticatedNavigationListTemplate();
      return;
    }

    navList.innerHTML = generateAuthenticatedNavigationListTemplate();

    const logoutButton = document.getElementById('logout-button');

logoutButton.addEventListener('click', (event) => {
  event.preventDefault();

  Swal.fire({
    title: "Apakah Anda yakin ingin keluar?",
    text: "Anda harus login kembali untuk mengakses akun.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Ya, keluar",
    cancelButtonText: "Batal"
  }).then((result) => {
    if (result.isConfirmed) {
      getLogout(); // fungsi logout kamu
      Swal.fire({
        title: "Berhasil keluar",
        text: "Anda telah keluar dari akun.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        location.hash = '/login';
      });
    }
  });
});

  }

  async setupPushNotification() {
    const pushNotificationTools = document.getElementById('push-notification-tools');
  
    if (!pushNotificationTools) {
      console.warn('Element #push-notification-tools tidak ditemukan di halaman ini.');
      return;
    }
  
    const isSubscribed = await isCurrentPushSubscriptionAvailable();
  
    if (isSubscribed) {
      pushNotificationTools.innerHTML = generateUnsubscribeButtonTemplate();
      document.getElementById('unsubscribe-button').addEventListener('click', () => {
        unsubscribe().finally(() => {
          this.setupPushNotification();
        });
      });
  
      return;
    }
  
    pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();
document.getElementById('subscribe-button').addEventListener('click', () => {
  subscribe().finally(() => {
    this.setupPushNotification(); // <- method publik
  });
});

  }
  

  async renderPage() {
    const url = getActiveRoute();
    const route = routes[url] || routes['*'];

    if (!route) {
      console.error(`No route handler found for ${url}`);
      return;
    }

    const page = route();

    const transition = transitionHelper({
      updateDOM: async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
      }
    });

    transition.ready.catch(console.error);
    transition.updateCallbackDone.then(() => {
      scrollTo({ top: 0, behavior: 'instant' });
      this.#setupNavigationList();

      if (isServiceWorkerAvailable()) {
        this.setupPushNotification();
      }
    })
  }
}

export default App;
