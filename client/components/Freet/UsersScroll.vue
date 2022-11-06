<!-- Reusable component representing a form in a block style -->
<!-- This is just an example; feel free to define any reusable components you want! -->

<template>
  <section>
    <h2>Users you may like</h2>
    <UserComponent
      v-for="user in usersToShow"
      :key="user.id"
      :user="user"
    />
  </section>
</template>

<script>
import UserComponent from '@/components/Freet/UserComponent.vue';

export default {
  name: 'UsersScroll',
  components: {UserComponent},
  data() {
    return {
      following: this.$store.state.user.following ? this.$store.state.user.following : []
    };
  },
  computed: {
    usersToShow() {
      return this.$store.state.allUsers.filter(
        u => u.username !== this.$store.state.username
        && !this.following.includes(u.username));
    }
  },
  methods: {
  }
};
</script>

<style scoped>
</style>
