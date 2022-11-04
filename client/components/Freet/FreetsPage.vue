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
    </section>
  </main>
</template>

<script>
import FreetComponent from '@/components/Freet/FreetComponent.vue';
import CreateFreetForm from '@/components/Freet/CreateFreetForm.vue';
import GetFreetsForm from '@/components/Freet/GetFreetsForm.vue';

export default {
  name: 'FreetPage',
  components: {FreetComponent, GetFreetsForm, CreateFreetForm},
  data() {
    return {
      refresh: 0
    }
  },
  computed : {
    getFeed() {
      this.refresh;
      // returns all freets if user not logged in, else returns freets
      // filtered by only those that user is following.
      if (!this.$store.state.username) {
        return this.$store.state.freets;
      }
      // returns freets made by users that the user follows
      //  and that are below or at the user'd bot threshold
      //  and are in the "circle" of the freet
      // console.log("feed before filter:", this.$store.state.freets);
      return this.$store.state.freets.filter(
        freet => freet.author !== this.$store.state.username
        && freet.botscore.score <= this.$store.state.user.botscore.threshold
        && this.$store.state.user.following.includes(freet.author)
        && (freet.circle.name === 'All Followers'
          || freet.circle.members.includes(this.$store.state.username))
      );
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
