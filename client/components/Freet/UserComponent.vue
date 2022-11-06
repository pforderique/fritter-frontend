<!-- Reusable component representing a single user and its actions -->
<!-- We've tagged some elements with classes; consider writing CSS using those classes to style them... -->

<template>
  <article
    class="user"
    @click="$router.push(`/profile/${user.username}`)"
  >
    <header>      
      <span>
        <h3>
          @{{ user.username }}
        </h3>
        <span v-if="user.followers">Followers: {{ user.followers.length }} {{ ' ' }}</span>
        <span v-if="user.following">| Following: {{ user.following.length }} {{ ' ' }}</span>
        <span v-if="user.botscore">| BS: {{ user.botscore.score }}%</span>
      </span>
    </header>
  </article>
</template>

<script>
export default {
  name: 'UserComponent',
  props: {
    // Data from the stored user
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      followers: this.user.followers ? [...this.user.followers] : [],
      following: this.user.following ? [...this.user.following] : []
    };
  },
  computed: {
    userFollows() {
      // return this.likes.includes(this.$store.state.username);
      return false;
    }
  },
  methods: {
  }
};
</script>

<style scoped>
.user {
  border: 1px solid rgb(85, 0, 255);
  border-radius: 8px;
  border-width: 2px;
  padding: 20px;
  position: relative;
}
.user:hover {
  background-color: rgba(85, 0, 255, 0.062);
  cursor: pointer;
}
.username:hover {
  color: rgb(85, 0, 255);
  cursor: pointer;
}
</style>
