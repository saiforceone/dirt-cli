<template>
  <div>
    <tree-root v-for="root in treeData">
      <tree-element
        :root-element="root.rootElement"
        :title="root.label"
        :subtitle="root.description"
      >
        <template v-slot:icon>
          <tree-icon :icon-type="root.kind" />
        </template>
        <tree-element
          :root-element="element.rootElement"
          :title="element.label"
          :subtitle="element.description"
          v-if="root.resources"
          v-for="element in root.resources"
        >
          <template v-slot:icon>
            <tree-icon slot="icon" :icon-type="root.kind" />
          </template>
          <tree-element
            :root-element="subElement.rootElement"
            :content="subElement.description"
            :title="subElement.label"
            v-if="element.resources"
            v-for="subElement in element.resources"
          >
            <template v-slot:icon>
              <tree-icon slot="icon" :icon-type="subElement.kind" />
            </template>
          </tree-element>
        </tree-element>
      </tree-element>
    </tree-root>
  </div>
</template>

<script lang="ts">
// This is a temporary component and really should be deleted / replaced with your own
// imports
import { defineComponent } from 'vue';
import { CodeBracketSquareIcon, FolderIcon } from '@heroicons/vue/20/solid';
// Project configuration
import { projectConfig } from '../../../../@dirt_project/dirt.json';
// Sub components
import TreeRoot from './TreeRoot.vue';
import TreeIcon from './TreeIcon.vue';
import TreeElement from './TreeElement.vue';

// Type definitions
type ProjectResource = {
  readonly rootElement?: boolean;
  readonly label: string;
  readonly description: string;
  readonly kind: 'folder' | 'file';
  resources?: Array<ProjectResource>;
};

export default defineComponent({
  components: {
    CodeBracketSquareIcon,
    FolderIcon,
    TreeRoot,
    TreeIcon,
    TreeElement,
  },
  computed: {
    projectConfig() {
      return projectConfig;
    },
    treeData(): Array<ProjectResource> {
      const data = [
        {
          label: '@dirt_project',
          description: 'Contains project config / settings',
          kind: 'folder',
          rootElement: true,
        },
        {
          label: 'dirt_fe_vue',
          description: 'Contains the Vue app including pages, components, etc.',
          kind: 'folder',
          rootElement: true,
          resources: [
            {
              label: 'src',
              description: 'Frontend source files',
              kind: 'folder',
              resources: [
                {
                  label: 'pages',
                  description:
                    "Contains this application's pages (Inertia views)",
                  kind: 'folder',
                },
                {
                  label: 'components',
                  description:
                    'Contains components used within the application',
                  kind: 'folder',
                },
                {
                  label: 'main.js',
                  description: 'Main entry point of the Inertia application',
                  kind: 'file',
                },
              ],
            },
          ],
        },
        {
          label: this.projectConfig.projectName,
          description: 'Main Django web application',
          kind: 'folder',
          rootElement: true,
        },
      ];

      if (projectConfig.withStorybook) {
        data.unshift({
          label: '.storybook',
          description: 'Contains configuration for StorybookJS',
          kind: 'folder',
          rootElement: true,
        });
      }

      return data;
    },
  },
});
</script>
