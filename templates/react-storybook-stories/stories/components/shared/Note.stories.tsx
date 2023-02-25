import type { ComponentMeta, ComponentStory } from '@storybook/react';
import { Note } from '../../../components/shared/Note/Note';

export default {
  title: 'Shared/Note',
  component: Note,
} as ComponentMeta<typeof Note>;

const Template: ComponentStory<typeof Note> = (args) => <Note {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  labelText: 'Note',
  content:
    'This is a sample story file. You should delete this file unless you really want to keep it.',
};
