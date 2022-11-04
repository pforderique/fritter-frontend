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
    allUsers: [], // object for every user.
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
        const followersUrl = `/api/follows?followee=${user.username}`;
        const followingUrl = `/api/follows?follower=${user.username}`;

        const [botscore, followers, following] = await Promise.all([
          fetch(botscoreUrl).then(async r => r.json()),
          fetch(followersUrl).then(async r => r.json()),
          fetch(followingUrl).then(async r => r.json())
        ])
        
        user.botscore = botscore;
        const followerUsernames = [''].splice(1); // remove the first empty string
        for (const follow of followers) {
          followerUsernames.push(follow.follower);
        }

        const followingUsernames = [''].splice(1); // remove the first empty string
        for (const follow of following) {
          followingUsernames.push(follow.following);
        }

        user.followers = followerUsernames;
        user.following = followingUsernames;
      }

      state.user = user;
    },
    updateUser(state, user) {
      // sets the user, but must only be used if the current user object just
      // has a modification!!!
      state.user = user;
    },
    async setAllUsers(state, users) {
      for (const user of users) {
        const botscoreUrl = `/api/botscores?username=${user.username}`;
        const followersUrl = `/api/follows?followee=${user.username}`;
        const followingUrl = `/api/follows?follower=${user.username}`;

        const [botscore, followers, following] = await Promise.all([
          fetch(botscoreUrl).then(async r => r.json()),
          fetch(followersUrl).then(async r => r.json()),
          fetch(followingUrl).then(async r => r.json())
        ])
        
        user.botscore = botscore;
        const followerUsernames = [''].splice(1); // remove the first empty string
        for (const follow of followers) {
          followerUsernames.push(follow.follower);
        }

        const followingUsernames = [''].splice(1); // remove the first empty string
        for (const follow of following) {
          followingUsernames.push(follow.following);
        }

        user.followers = followerUsernames;
        user.following = followingUsernames;
      }

      state.allUsers = users;
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
      
      let botscoreCache = new Map();
      let circleCache = new Map();
      for (const freet of freets) {
        if (botscoreCache.has(freet.author) && circleCache.has(freet._id)) {
          freet.botscore = botscoreCache.get(freet.author);
          freet.circle = circleCache.get(freet.author);
        } else {
          const botUrl = `/api/botscores?username=${freet.author}`;
          const circleUrl = `/api/circles?username=${freet.author}`;

          const [botscore, authorCircles] = await Promise.all([
            fetch(botUrl).then(async r => r.json()),
            fetch(circleUrl).then(async r => r.json())
          ])

          // will be either the list of members allowed to see this freet OR undef
          const circleObj = authorCircles.find(
            circle => circle.name === freet.circle);
          const newCircleObj = {
            name: freet.circle,
            members: circleObj ? circleObj.members : undefined
          };

          freet.botscore = botscore;
          freet.circle = newCircleObj;

          botscoreCache.set(freet.author, botscore);
          circleCache.set(freet._id, newCircleObj);
        }
      }
      console.log('freets assembled in store: ', freets);

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
      const freets = await fetch(url).then(async r => r.json());
      let botscoreCache = new Map();
      let circleCache = new Map();
      for (const freet of freets) {
        if (botscoreCache.has(freet.author) && circleCache.has(freet._id)) {
          freet.botscore = botscoreCache.get(freet.author);
          freet.circle = circleCache.get(freet.author);
        } else {
          const botUrl = `/api/botscores?username=${freet.author}`;
          const circleUrl = `/api/circles?username=${freet.author}`;

          const [botscore, authorCircles] = await Promise.all([
            fetch(botUrl).then(async r => r.json()),
            fetch(circleUrl).then(async r => r.json())
          ])

          // will be either the list of members allowed to see this freet OR undef
          const circleObj = authorCircles.find(
            circle => circle.name === freet.circle);
          const newCircleObj = {
            name: freet.circle,
            members: circleObj ? circleObj.members : undefined
          };

          freet.botscore = botscore;
          freet.circle = newCircleObj;

          botscoreCache.set(freet.author, botscore);
          circleCache.set(freet._id, newCircleObj);
        }
      }
      console.log('freets assembled in store: ', freets);

      state.freets = freets;
    }
    
  },
  getters: {
    
  },
  // Store data across page refreshes, only discard on browser close
  plugins: [createPersistedState()]
});

export default store;
