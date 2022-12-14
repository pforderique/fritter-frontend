<!-- Reusable component representing a single freet and its actions -->
<!-- We've tagged some elements with classes; consider writing CSS using those classes to style them... -->

<template>
  <article
    class="freet"
  >
    <header>      
      <span>
        <h3>
          <span
            class="author"
            @click="$router.push(`/profile/${freet.author}`)"
          >
            @{{ freet.author }}
          </span>
          <span v-if="freet.botscore">| BS: {{ freet.botscore.score }}%</span>
        </h3>
      </span>

      <div
        v-if="$store.state.username === freet.author"
        class="actions"
      >
        <button
          v-if="editing"
          @click="submitEdit"
        >
          ✅ Save changes
        </button>
        <button
          v-if="editing"
          @click="stopEditing"
        >
          🚫 Discard changes
        </button>
        <button
          v-if="!editing"
          @click="startEditing"
        >
          ✏️ Edit
        </button>
        <button @click="deleteFreet">
          🗑️ Delete
        </button>
      </div>
    </header>
    <textarea
      v-if="editing"
      class="content"
      :value="draft"
      @input="draft = $event.target.value"
    />
    <p
      v-else
      class="content"
    >
      {{ freet.content }}
    </p>

    <span>{{ likes === undefined ? 'loading likes...' : likes.length }} {{ ' ' }}</span>
    <span v-if="$store.state.username">
      <button @click="onLikeClick">
        <span
          v-if="userLikedPost"
          icon="fa-solid fa-heart"
          class="liked"
        >
          ❤️
        </span>
        <font-awesome-icon
          v-else
          icon="fa-regular fa-heart"
          class="unliked"
        />
      </button> |
    </span>
    <span v-else>Likes | </span>
    <i
      v-if="freet.circle"
      class="subinfo"
    >
      Group: {{ freet.circle.name }}
    </i>
    <i v-else>
      Loading group...
    </i>
    <p class="date">
      Posted at {{ freet.dateModified }}
      <i v-if="freet.dateModified !== freet.dateCreated">(edited)</i>
    </p>
    <section class="alerts">
      <article
        v-for="(status, alert, index) in alerts"
        :key="index"
        :class="status"
      >
        <p>{{ alert }}</p>
      </article>
    </section>
  </article>
</template>

<script>
export default {
  name: 'FreetComponent',
  props: {
    // Data from the stored freet
    freet: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      editing: false, // Whether or not this freet is in edit mode
      draft: this.freet.content, // Potentially-new content for this freet
      alerts: {}, // Displays success/error messages encountered during freet modification
      likes: this.freet.likes ? [...this.freet.likes] : []
    };
  },
  computed: {
    userLikedPost() {
      return this.likes.includes(this.$store.state.username);
    }
  },
  methods: {
    async onLikeClick() {
      if (this.userLikedPost) {
        // unlike freet
        const getUrl = `/api/likes?username=${this.$store.state.username}`;
        const likeObj = (await fetch(getUrl).then(async r => r.json())).find(
          like => like.freetId === this.freet._id);

        const deleteUrl = `/api/likes/${likeObj._id}`
        await fetch(deleteUrl, { method: 'DELETE' });
        this.likes = this.likes.filter(
          like => like !== this.$store.state.username);
      } else {
        // like freet
        const postUrl = '/api/likes';
        const options = {
          method: 'POST',
          body: JSON.stringify({freetId: this.freet._id}),
          headers: {'Content-Type': 'application/json'},
          credentials: 'same-origin' // Sends express-session credentials with request
        };
        await fetch(postUrl, options);
        this.likes = this.likes.concat([this.$store.state.username]);
      }
      this.$store.commit('refreshFreets');
    },
    startEditing() {
      /**
       * Enables edit mode on this freet.
       */
      this.editing = true; // Keeps track of if a freet is being edited
      this.draft = this.freet.content; // The content of our current "draft" while being edited
    },
    stopEditing() {
      /**
       * Disables edit mode on this freet.
       */
      this.editing = false;
      this.draft = this.freet.content;
    },
    deleteFreet() {
      /**
       * Deletes this freet.
       */
      const params = {
        method: 'DELETE',
        callback: () => {
          this.$store.commit('alert', {
            message: 'Successfully deleted freet!', status: 'success'
          });
        }
      };
      this.request(params);
    },
    submitEdit() {
      /**
       * Updates freet to have the submitted draft content.
       */
      if (this.freet.content === this.draft) {
        const error = 'Error: Edited freet content should be different than current freet content.';
        this.$set(this.alerts, error, 'error'); // Set an alert to be the error text, timeout of 3000 ms
        setTimeout(() => this.$delete(this.alerts, error), 3000);
        return;
      }

      const params = {
        method: 'PATCH',
        message: 'Successfully edited freet!',
        body: JSON.stringify({content: this.draft}),
        callback: () => {
          this.$set(this.alerts, params.message, 'success');
          setTimeout(() => this.$delete(this.alerts, params.message), 3000);
        }
      };
      this.request(params);
    },
    async request(params) {
      /**
       * Submits a request to the freet's endpoint
       * @param params - Options for the request
       * @param params.body - Body for the request, if it exists
       * @param params.callback - Function to run if the the request succeeds
       */
      const options = {
        method: params.method, headers: {'Content-Type': 'application/json'}
      };
      if (params.body) {
        options.body = params.body;
      }

      try {
        const r = await fetch(`/api/freets/${this.freet._id}`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }

        this.editing = false;
        this.$store.commit('refreshFreets');

        params.callback();
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    }
  }
};
</script>

<style scoped>
.freet {
    border: 1px solid rgb(0, 210, 164);
    border-radius: 8px;
    border-width: var(--xs);
    padding: 20px 30px;
    position: relative;
    margin: var(--m) 0;
}

.freet:hover {
  background-color: rgba(0, 196, 154, 0.034);
}
.author:hover {
  color: rgb(164, 118, 255);
  cursor: pointer;
}

textarea {
  color: black;
}

.content {
  padding: var(--l) 0;
}

.date {
  color: var(--grey);
  font-size: small;
  text-align: right;
}

</style>
