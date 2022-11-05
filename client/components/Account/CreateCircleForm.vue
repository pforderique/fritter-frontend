<!-- Form for creating freets (block style) -->

<script>
import BlockForm from '@/components/common/BlockForm.vue';

export default {
  name: 'CreateCircleForm',
  mixins: [BlockForm],
  data() {
    return {
      url: '/api/circles/usernames',
      method: 'POST',
      hasBody: true,
      setUsername: true,
      fields: [
        {id: 'name', label: 'Fritter Circle', value: ''},
        {id: 'memberUsernames', label: 'Usernames (comma-separated)', value: ''}
      ],
      title: 'Create a Circle',
      callback: () => {
        const message = 'Successfully created a circle!';
        this.$set(this.alerts, message, 'success');
        setTimeout(() => this.$delete(this.alerts, message), 3000);
      }
    };
  }
};
</script>
