<!-- Form for changing password (block style) -->

<script>
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
</script>
