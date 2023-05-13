import type { Meta, StoryObj } from '@storybook/vue3';

import Note from '~/components/shared/Note.vue';

const meta: Meta<typeof Note> = {
  title: 'Shared/Note',
  component: Note,
};

export default meta;
type Story = StoryObj<typeof Note>;

// @ts-ignore
export const Primary: Story = {
  render: (args) => ({
    components: { Note },
    setup() {
      return args;
    },
    template: '<Note primary v-bind="args" />',
  }),
  args: {
    labelText: 'Some Note',
    content: 'Some content here...',
  },
};
