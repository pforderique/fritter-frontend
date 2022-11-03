<!-- Page for account settings and management -->
<!-- User should be authenticated in order to see this page -->

<template>
  <main>
    <section v-if="getProfileUser">
      <p>Signed in User >>> {{ $store.state.user }}</p>
      <!-- <p>ALL Users >>> {{ $store.state.allUsers }}</p> -->
      <p>Params >>> {{ $route.params }}</p>
      <header>
        <h2>@{{ $route.params.username }}</h2>
      </header>
      <h4>Joined on {{ getProfileUser.dateJoined }}</h4>

      <!-- this needs to change -->
      <h4>
        {{ getProfileUser.followers.length }} Followers 
        | {{ getProfileUser.following.length }} Following
      </h4>

      <section>
        <p>
          Bot Score: {{ getProfileUser.botscore.score }}% 
          | Bot Threshold: {{ getProfileUser.botscore.threshold }}%
        </p>
      </section>

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
    getProfileUser() {
      // returns user object
      if (this.isOwnProfile) return this.$store.state.user;
      const filteredUsers = this.$store.state.allUsers.filter(user => user.username === this.$route.params.username);
      if(filteredUsers.length !== 1) return null;
      return filteredUsers[0];
    },
    getProfileFreets() {
      // returns list of all freets by this user
      return this.$store.state.freets.filter(
        freet => freet.author === this.$route.params.username);
    }
  }
};
</script>
