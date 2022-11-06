<!-- Default page that also displays freets -->

<template>
  <main>
    <section v-if="$store.state.username">
      <header>
        <h2>Welcome @{{ $store.state.username }}</h2>
      </header>
      <CreateFreetForm />
    </section>
    <section v-else>
      <header>
        <h2>Welcome to Fritter!</h2>
      </header>
      <article>
        <h3>
          <router-link to="/login">
            Sign in
          </router-link>
          to create, edit, and delete freets.
        </h3>
      </article>
    </section>
    <section>
      <header>
        <div class="left">
          <h2>
            {{ $store.state.username ? 'My Feed' : 'Viewing all freets' }}
            <span v-if="$store.state.filter">
              filtered by @{{ $store.state.filter }}
            </span>
          </h2>
        </div>
        <div class="right">
          <GetFreetsForm
            ref="getFreetsForm"
            value="author"
            placeholder="🔍 Filter by author (optional)"
            button="🔄 Get freets"
          />
        </div>
      </header>
      <section
        v-if="getFeed.length"
      >
        <FreetComponent
          v-for="freet in getFeed"
          :key="freet.id"
          :freet="freet"
        />
      </section>
      <article
        v-else
      >
        <h3>No freets found.</h3>
      </article>
      <UsersScroll />
    </section>
  </main>
</template>

<script>
import FreetComponent from '@/components/Freet/FreetComponent.vue';
import CreateFreetForm from '@/components/Freet/CreateFreetForm.vue';
import GetFreetsForm from '@/components/Freet/GetFreetsForm.vue';
import UsersScroll from '@/components/Freet/UsersScroll.vue';

export default {
  name: 'FreetPage',
  components: {FreetComponent, GetFreetsForm, CreateFreetForm, UsersScroll},
  data() {
    return {
      refresh: 0
    }
  },
  computed : {
    getFeed() {
      this.refresh;
      // returns all freets if user not logged in, or info not loaded,
      // else returns actual feed
      if (!this.$store.state.freets) {
        return [];
      }
      if (!this.$store.state.username 
        || !this.$store.state.user.botscore
        || !this.$store.state.user.following) {
        return this.$store.state.freets;
      }

      const randUsername = (!this.$store.state.user.showDirectFollowingOnly
                          && this.$store.state.user.following) ?
                          this.$store.state.user.following[0] : undefined;

      const feed = this.$store.state.freets.filter(freet => 
        // author is not self
        freet.author !== this.$store.state.username
        // botscore requirement
        && freet.botscore.score <= this.$store.state.user.botscore.threshold
        // author is someone user follows or a follower follows (if enabled)
        && (this.$store.state.user.following.includes(freet.author)
          || (randUsername && freet.author === randUsername))
        // user is in the tweet's circle
        && (!freet.circle || freet.circle.name === 'All Followers'
          || freet.circle.members.includes(this.$store.state.username))
      );

      return feed;
    }
  },
  mounted() {
    this.$refs.getFreetsForm.submit();
  }
};
</script>

<style scoped>
section {
  display: flex;
  flex-direction: column;
}

header, header > * {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

button {
    margin-right: 10px;
}

section .scrollbox {
  flex: 1 0 50vh;
  padding: 3%;
  overflow-y: scroll;
}
</style>
