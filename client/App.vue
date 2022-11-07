<template>
  <div id="app">
    <header>
      <NavBar />
    </header>
    <router-view />
  </div>
</template>

<script>
import NavBar from '@/components/common/NavBar.vue';

export default {
  name: 'App',
  components: {NavBar},
  beforeCreate() {
    // Sync stored username to current session
    fetch('/api/users/session', {
      credentials: 'same-origin' // Sends express-session credentials with request
    }).then(res => res.json()).then(res => {
      const user = res.user;
      this.$store.commit('setUser', user ? user : {});
      this.$store.commit('setUsername', user ? user.username : null);
    });

    // GRAB ALL users... will be needed for profiles.
    fetch('/api/users', {
      credentials: 'same-origin' // Sends express-session credentials with request
    }).then(res => res.json()).then(res => {
      this.$store.commit('setAllUsers', res ? res : []);
    });

    // Clear alerts on page refresh
    this.$store.state.alerts = {};
  }
};
</script>

<style>
:root {
  --primary-darkest: #031227;
  --primary-dark: #0a192f;
  --primary-light: #112240;
  --primary-lightest: #233554;
  --primary-shadow: rgba(2, 12, 27, 0.7);

  --green: #64ffda;
  --green-tint: rgba(100, 255, 218, 0.1);

  --primary-highlight: #64ffda;
  /* --primary-highlight: rgb(255, 242, 64); */
  /* --primary-highlight: rgb(255, 166, 0); */
  /* --primary-highlight: rgb(255, 0, 242); */

  --grey: #b3b0b0;
  --white: #e6f1ff;

  --pink: #f57dff;
  --blue: #57cbff;

  --xs: 4px;
  --s: 8px;
  --m: 16px;
  --l: 24px;
  --xl: 48px;
  --xxl: 96px;

  --duration: 1500ms;
  --delay: 0ms;

  --primary-font: "SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace;
  --secondary-font: "Goldman", "Open Sans", sans-serif;
  --font-sans: "Calibre", "Inter", "San Francisco", "SF Pro Text", -apple-system,
    system-ui, sans-serif;
}

* {
  box-sizing: border-box;
  font-family: var(--primary-font);
  color: #fff;
}

body {
  height: 100vh;
  flex-direction: column;
  display: flex;
  padding: 0;
  margin: 0;
  font-size: 1.2em;
  background-color: #112240;
}

a {
  color: var(--primary-highlight);
}

a:hover {
  text-decoration: none;
  color: var(--grey);
}

input {
  background-color: #000000;
}

button{
  background-color: transparent;
  border-color: var(--primary-highlight);
  border-radius: var(--m);
  color: var(--primary-highlight);
  padding: var(--s) var(--m);
  transition-duration: 250ms;
}

button:hover {
  background-color: var(--primary-highlight);
  color: var(--primary-darkest);
  text-decoration: none;
  transform: rotate(-1deg);
  cursor: pointer;
}

main {
  padding: 0 5em 5em;
}

.alerts {
    position: absolute;
    z-index: 99;
    bottom: 0;
    top: 100%;
    left: 50%;
    transform: translate(-50%, 10%);
    width: 100%;
    text-align: center;
}

.alerts article {
    border-radius: 5px;
    padding: 10px 20px;
    color: #fff;
}

.alerts p {
    margin: 0;
}

.alerts .error {
    background-color: rgb(166, 23, 33);
}

.alerts .success {
    background-color: rgb(45, 135, 87);
}
</style>
