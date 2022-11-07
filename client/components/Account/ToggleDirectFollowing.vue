<!-- Form for changing password (block style) -->
<template>
  <section>
    <p>{{ $store.state.user }}</p>
    <span>
      <label :for="field.id">{{ field.label }}:</label>
      <VueToggles
        v-model="field.value"
        :value="field.value"
        @click="onClick"
      />
    </span>
  </section>
</template>

<script>
export default {
  name: 'ToggleDirectFollowing',
  data() {
    return {
      field: {id: 'showDirectFollowingOnly', label: 'Show Direct Following Only', value: this.$store.state.user.showDirectFollowingOnly}
    };
  },
  methods: {
    async onClick() {
      this.field.value = !this.field.value;
      const url = '/api/users';
      const options = {
        method: 'PATCH',
        body: JSON.stringify({showDirectFollowingOnly: this.field.value}),
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin' // Sends express-session credentials with request
      };
      try {
        const r = await fetch(url, options);
        if (!r.ok) {
          const res = await r.json();
          console.log('error!')
          throw new Error(res.error);
        }

        const res = await r.json();
        this.$store.commit('setUsername', res.user ? res.user.username : null);
        this.$store.commit('setUser', res.user ? res.user : {});
        this.$store.commit('refreshFreets');

      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    }
  }
};
</script>
<!-- <script>
import BlockForm from '@/components/common/BlockForm.vue';

export default {
  name: 'ToggleDirectFollowing',
  mixins: [BlockForm],
  data() {
    return {
      url: `/api/users`,
      method: 'PATCH',
      hasBody: true,
      setUsername: true,
      fields: [
        {id: 'showDirectFollowingOnly', label: 'Show Direct Following Only', value: this.$store.state.user.showDirectFollowingOnly}
      ],
      title: 'Toggle Option',
      callback: () => {
        // update user store
        const message = 'Successfully changed option!';
        this.$set(this.alerts, message, 'success');
        setTimeout(() => this.$delete(this.alerts, message), 3000);
      }
    };
  }
};
</script> -->
