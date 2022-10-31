<!-- Page for account settings and management -->
<!-- User should be authenticated in order to see this page -->

<template>
  <main>
    <section>
      <header>
        <h2>@{{ $store.state.username }}</h2>
      </header>
      <!-- <p>USER: {{ $store.state.user }}</p>  -->
      <h4>Joined on {{ $store.state.user.dateJoined }}</h4>
      <h4 v-if="$store.state.user.followers">
        {{ $store.state.user.followers.length }} Followers 
        | {{ $store.state.user.following.length }} Following
      </h4>
      <section v-if="$store.state.user.botscore">
        <p>My Bot Score: {{ $store.state.user.botscore.score }}%</p>
        <p>My Bot Threshold: {{ $store.state.user.botscore.threshold }}%</p>
      </section>
      <section
        v-if="getUsersFreets.length"
      >
        <h2>My Freets</h2>
        <FreetComponent
          v-for="freet in getUsersFreets"
          :key="freet.id"
          :freet="freet"
        />
      </section>
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
    return {
      age: 17
    }
  },
  computed : {
    getUsersFreets() {
      // returns list of all freets by this user
      return this.$store.state.freets.filter(
        freet => freet.author === this.$store.state.username);
    }
  }
};
</script>
