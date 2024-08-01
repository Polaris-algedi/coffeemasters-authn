import API from "./API.js";
import Router from "./Router.js";

const Auth = {
  isLoggedIn: false,
  account: null,
  postLogin: (response, user) => {
    if (response.ok) {
      Auth.isLoggedIn = true;
      Auth.account = user;
      Auth.updateStatus();
      Router.go("/account");
    } else {
      alert(response.message);
    }
  },
  register: async (event) => {
    event.preventDefault();
    const user = {
      name: event.target["register_name"].value, // document.getElementById("register_name").value,
      email: event.target["register_email"].value, // document.getElementById("register_email").value,
      password: event.target["register_password"].value, // document.getElementById("register_password").value,
    };

    const result = await API.register(user);
    Auth.postLogin(result, user);
  },

  login: async (event) => {
    event.preventDefault();

    const credentials = {
      email: event.target["login_email"].value, // document.getElementById("login_email").value,
      password: event.target["login_password"].value, // document.getElementById("login_password").value,
    };

    const result = await API.login(credentials);
    Auth.postLogin(result, {
      ...credentials,
      name: result.name,
    });
  },

  logout: () => {
    Auth.isLoggedIn = false;
    Auth.account = null;
    Auth.updateStatus();
    Router.go("/");
  },

  updateStatus() {
    if (Auth.isLoggedIn && Auth.account) {
      document
        .querySelectorAll(".logged_out")
        .forEach((e) => (e.style.display = "none"));
      document
        .querySelectorAll(".logged_in")
        .forEach((e) => (e.style.display = "block"));
      document
        .querySelectorAll(".account_name")
        .forEach((e) => (e.innerHTML = Auth.account.name));
      document
        .querySelectorAll(".account_username")
        .forEach((e) => (e.innerHTML = Auth.account.email));
    } else {
      document
        .querySelectorAll(".logged_out")
        .forEach((e) => (e.style.display = "block"));
      document
        .querySelectorAll(".logged_in")
        .forEach((e) => (e.style.display = "none"));
    }
  },
  init: () => {},
};
Auth.updateStatus();

export default Auth;

// make it a global object
window.Auth = Auth;
