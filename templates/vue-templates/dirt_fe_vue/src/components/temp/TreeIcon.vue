<template>
  <div>
    <code-bracket-square-icon v-if="iconType === 'file'" class="h-8 w-8" />
    <folder-icon v-if="iconType === 'folder'" class="h-8 w-8" />
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import { CodeBracketSquareIcon, FolderIcon } from '@heroicons/vue/20/solid';

type IconType = 'file' | 'folder';

export default defineComponent({
  components: {
    CodeBracketSquareIcon,
    FolderIcon,
  },
  props: {
    iconType: {
      type: String as PropType<IconType>,
      required: true,
    },
  },
  name: 'TreeIcon.vue',
});
</script>
