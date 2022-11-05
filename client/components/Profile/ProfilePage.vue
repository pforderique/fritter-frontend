<!-- Page for account settings and management -->
<!-- User should be authenticated in order to see this page -->

<template>
  <main>
    <section v-if="getProfileUser">
      <p>Signed in User >>> {{ $store.state.user }}</p>
      <!-- <p>ALL Users >>> {{ $store.state.allUsers }}</p> -->
      <!-- <p>Params >>> {{ $route.params }}</p> -->
      <header>
        <h2>@{{ $route.params.username }}</h2>
      </header>
      <h4 v-if="getProfileUser.dateJoined">
        Joined on {{ getProfileUser.dateJoined }}
      </h4>
      <h4 v-else>
        Loading info...
      </h4>

      <!-- this needs to change -->
      <h4 v-if="getProfileUser.followers">
        {{ getProfileUser.followers.length }} Followers 
        | {{ getProfileUser.following.length }} Following
      </h4>
      <h4 v-else>
        loading followers...
      </h4>

      <section>
        <p v-if="getProfileUser.botscore">
          Bot Score: {{ getProfileUser.botscore.score }}% 
          | Bot Threshold: {{ getProfileUser.botscore.threshold }}%
        </p>
        <p v-else>
          loading botscore...
        </p>
      </section>

      <p v-if="isOwnProfile">
        My Circles: {{ getNumCircles ? getProfileUser.circles.join(', ') : 'No Circles' }}
      </p>
      <p v-else>
        Circles: {{ getNumCircles ? getNumCircles : 'No Circles' }}
      </p>

      <button
        v-if="!isOwnProfile"
        @click="onFollowClick"
      >
        {{ isFollowing ? 'Following' : 'Follow' }}
      </button>

      <section
        v-if="getProfileFreets.length"
      >
        <h2>{{ isOwnProfile ? 'My' : $route.params.username + "'s" }} Freets</h2>
        <FreetComponent
          v-for="freet in getProfileFreets"
          :key="freet.id"
          :freet="freet"
        />
      </section>
    </section>
    <section v-else>
      <h2>User {{ $route.params.username }} not found</h2>
    </section>
  </main>
</template>

<script>
import FreetComponent from '@/components/Freet/FreetComponent.vue';

export default {
  name: 'ProfilePage',
  components: {
    FreetComponent
  },
  data() {
    return {}
  },
  computed : {
    isOwnProfile() {
      return this.$store.state.username === this.$route.params.username;
    },
    isFollowing() {
      return this.$store.state.user.following.includes(this.$route.params.username);
    },
    getProfileUser() {
      // returns user object
      if (this.isOwnProfile) return this.$store.state.user;
      const filteredUser = this.$store.state.allUsers.find(user => user.username === this.$route.params.username);
      return filteredUser;
    },
    getProfileFreets() {
      // returns list of all freets by this user
      return this.$store.state.freets.filter(
        freet => freet.author === this.$route.params.username);
    },
    getNumCircles() {
      return (this.getProfileUser.circles ?? []).length;
    },
  },
  methods: {
    async onFollowClick() {
      // button should update by itself? else move isFollowing to data?
      const updatedUser = this.$store.state.user;

      if (this.isFollowing) {
        // unfollow user, then update current user too! (to remove this guy from following list)
        const getUrl = `/api/follows?followee=${this.$route.params.username}&follower=${this.$store.state.username}`;
        const followObj = await fetch(getUrl).then(async r => r.json());

        const deleteUrl = `/api/follows/${followObj._id}`
        await fetch(deleteUrl, { method: 'DELETE' }).then(async r => r.json());

        // remove profile user from signed in users following 
        updatedUser.following = updatedUser.following.filter(
          username => username !== this.$route.params.username);

        // remove signed in user from profiles followers 
        this.getProfileUser.followers = this.getProfileUser.followers.filter(
          username => username !== this.$store.state.username
        );
      } else {
        const postUrl = `/api/follows/${this.$route.params.username}`;
        const options = {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          credentials: 'same-origin' // Sends express-session credentials with request
        };
        await fetch(postUrl, options).then(async r => r.json());
        // add profile user to signed in users following   
        updatedUser.following.push(this.$route.params.username);
        // add signed in user to profiles followers 
        this.getProfileUser.followers.push(this.$store.state.username);
      }

      // update user
      this.$store.commit('updateUser', updatedUser);
    }
  }
};
</script>
