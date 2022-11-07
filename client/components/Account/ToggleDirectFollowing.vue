<!-- Form for changing password (block style) -->
<template>
  <section>
    <span class="toggle">
      <label :for="field.id">{{ field.label }}:</label>
      <VueToggles
        v-model="field.value"
        :value="field.value"
        checkedBg="#64ffda"
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

<style scoped>
.toggle {
  display: flex;
  /* justify-content: center; */
  flex-direction: row;
  justify-content: space-around;
  border: solid black;
  margin-bottom: var(--s);
  padding: var(--m);

  border: 4px solid;
  border-color: var(--primary-lightest);
  border-radius: var(--m);
}
</style>