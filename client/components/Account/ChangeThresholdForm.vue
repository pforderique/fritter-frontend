<!-- Form for changing password (block style) -->

<script>
import BlockForm from '@/components/common/BlockForm.vue';

export default {
  name: 'ChangeThresholdForm',
  mixins: [BlockForm],
  data() {
    return {
      url: `/api/botscores/${this.$store.state.user.botscore._id}`,
      method: 'PATCH',
      hasBody: true,
      // setUsername: true,
      fields: [
        {id: 'threshold', label: 'Bot Threshold', value: `${this.$store.state.user.botscore.threshold}`, dontClear: true}
      ],
      title: 'Set Bot Threshold',
      callback: () => {
        // update user store
        const message = 'Successfully changed threshold!';
        this.$set(this.alerts, message, 'success');
        setTimeout(() => this.$delete(this.alerts, message), 3000);
      }
    };
  }
};
</script>
