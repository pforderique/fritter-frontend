import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

/**
 * Storage for data that needs to be accessed from various compoentns.
 */
const store = new Vuex.Store({
  state: {
    filter: null, // Username to filter shown freets by (null = show all)
    freets: [], // All freets created in the app, including their botscore object!
    botscores: [], // All botscores created in the app
    username: null, // Username of the logged in user
    user: {}, // the user object containing global info about user
    alerts: {} // global success/error messages encountered during submissions to non-visible forms
  },
  mutations: {
    alert(state, payload) {
      /**
       * Add a new message to the global alerts.
       */
      Vue.set(state.alerts, payload.message, payload.status);
      setTimeout(() => {
        Vue.delete(state.alerts, payload.message);
      }, 3000);
    },
    setUsername(state, username) {
      /**
       * Update the stored username to the specified one.
       * @param username - new username to set
       */
      state.username = username;
    },
    async setUser(state, user) {
      /**
       * Update the stored username to the specified one.
       * @param user - new user object to set
       */
      if (Object.keys(user).length) {
        const botscoreUrl = `/api/botscores?username=${user.username}`;
        const botscore = await fetch(botscoreUrl).then(async r => r.json());
        user.botscore = botscore;

        const followersUrl =  `/api/follows?followee=${user.username}`;
        const followingUrl =  `/api/follows?follower=${user.username}`;
        const followers = await fetch(followersUrl).then(async r => r.json());
        const following = await fetch(followingUrl).then(async r => r.json());

        user.followers = followers;
        user.following = following;
        // TODO(pf): add more features to object like follows, etc.
      }

      state.user = user;
    },
    updateFilter(state, filter) {
      /**
       * Update the stored freets filter to the specified one.
       * @param filter - Username of the user to fitler freets by
       */
      state.filter = filter;
    },
    async updateFreets(state, freets) {
      /**
       * Update the stored freets to the provided freets.
       * @param freets - Freets to store
       */
      
      // Add the botscore object for every freet to be rendered.
      for (const freet of freets) {
        const url = `/api/botscores?username=${freet.author}`;
        const botscore = await fetch(url).then(async r => r.json());
        freet.botscore = botscore;
      }

      state.freets = freets;
    },
    updateBotscores(state, botscores) {
      /**
       * Update the stored freets to the provided freets.
       * @param botscores - Freets to store
       */
      state.botscores = botscores;
    },
    async refreshFreets(state) {
      /**
       * Request the server for the currently available freets.
       */
      const url = state.filter ? `/api/users/${state.filter}/freets` : '/api/freets';
      const res = await fetch(url).then(async r => r.json());

      for (const freet of res) {
        const url = `/api/botscores?username=${freet.author}`;
        const botscore = await fetch(url).then(async r => r.json());
        freet.botscore = botscore;
      }

      state.freets = res;
    }
  },
  // Store data across page refreshes, only discard on browser close
  plugins: [createPersistedState()]
});

export default store;
