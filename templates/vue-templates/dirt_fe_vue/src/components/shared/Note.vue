<template>
  <div class="flex items-center gap-x-2">
    <slot>
      <information-circle-icon class="h-4 w-4 text-white" />
    </slot>
    <div
      class="flex flex-col justify-items-start text-left md:flex-row md:items-center md:gap-x-2"
    >
      <span class="underline italic">{{ labelText }}</span>
      <span class="text-slate-400">{{ content }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { InformationCircleIcon } from '@heroicons/vue/20/solid';

export default defineComponent({
  components: {
    InformationCircleIcon,
  },
  props: {
    content: { type: String, required: true },
    labelText: { type: String, required: true },
  },
});
</script>
