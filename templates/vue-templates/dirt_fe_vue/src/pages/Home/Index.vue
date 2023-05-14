<template>
  <div class="w-full bg-gradient-to-b from-[#02111B] to-[#30292F]">
    <div
      class="flex flex-col container mx-auto md:max-w-5xl gap-y-8 text-center h-full p-4"
    >
      <svg
        class="self-center"
        fill="#fff"
        height="100px"
        width="100px"
        style="margin-top: 1rem"
        version="1.1"
        id="Capa_1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 490 490"
        xml:space="preserve"
      >
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          <path
            d="M316.624,0l-18.061,24.729l59.624,43.557L207.064,273.202l-93.413-68.225l-59.774,81.363 c-20.034,27.255-28.212,60.835-23.009,94.549c5.248,34.043,23.428,63.96,51.207,84.248C105.039,481.912,131.757,490,158.205,490 c39.455,0,78.298-17.986,103.251-51.94l59.848-81.422l-89.521-65.383L382.903,86.342l59.697,43.611l18.06-24.729L316.624,0z M236.786,419.94c-31.741,43.163-93.039,52.328-136.651,20.468c-21.156-15.444-35.015-38.244-39.007-64.184 c-3.947-25.611,2.228-51.102,17.418-71.764l41.713-56.754l158.195,115.54L236.786,419.94z"
          ></path>
        </g>
      </svg>
      <h1 class="text-white text-center text-7xl font-heading">
        Ready to get D.I.R.T-y?
      </h1>
      <p class="text-slate-400 text-lg">
        <span class="font-bold text-white">D.I.R.T Stack:</span> The modern way
        of building reactive fullstack Django web applications.
        <span class="text-white">D.I.R.T</span> combines the power of
        <span class="font-bold text-white">D</span>jango,
        <span class="font-bold text-white">I</span>nertiaJs,
        <span class="font-bold text-white">R</span>eactive UI of
        <span class="font-bold capitalize underline">{{
          projectConfig.frontend
        }}</span>
        and smoothness of <span class="font-bold text-white">T</span>ailwindcss.
      </p>

      <h2 class="text-white text-4xl font-heading">Ready to dig in?</h2>
      <div
        class="flex px-2 py-4 bg-slate-800 border-[#30292F] border-2 text-white rounded items-center gap-x-2"
      >
        <note
          labelText="You should replace this page with your own index page in"
          content="dirt_fe_vue/pages/Home/Index.vue"
        />
      </div>
      <h2 class="text-white text-4xl font-heading">
        Important Files & Folders
      </h2>
      <div
        class="flex flex-col px-2 py-2 gap-y-2 bg-slate-800 border-[#30292F] border-2 text-white rounded text-left"
      >
        <tree />
      </div>
      <p class="text-slate-400 text-lg">
        <span class="font-heading text-white">D.I.R.T</span>, truly down to
        earth, built on a solid foundation with
      </p>
      <div class="grid grid-cols-2 md:grid-cols-4 px-4 md:px-0 gap-8 md:gap-2">
        <a
          class="w-fit text-white hover:text-white flex items-center gap-x-2"
          target="_blank"
          href="https://www.djangoproject.com/"
        >
          <django-icon :size="iconSize" style="fill: white" />
          <span class="text-2xl">Django</span>
        </a>
        <a
          class="w-fit flex items-center"
          target="_blank"
          href="https://inertiajs.com/"
        >
          <svg
            class="block fill-current text-white"
            viewBox="0 0 275.3 50.5"
            style="height: 25px"
          >
            <path
              d="M231.2 16.1h-17.8l17.2 17.2-17.2 17.2h17.8l17.2-17.2z"
            ></path>
            <path
              d="M258.1 16.1h-17.8l17.2 17.2-17.2 17.2h17.8l17.2-17.2z"
            ></path>
            <path
              d="M6 15.3h10.3l-6 34.2H0l6-34.2zm.6-9.1C7.2 2.9 10.3 0 13.7 0s5.7 2.8 5.2 6.2c-.5 3.4-3.7 6.2-7.2 6.2s-5.6-3-5.1-6.2zM54.3 28.5l-3.7 21H40.4L43.8 30c.8-4.4-1.6-6.2-4.9-6.2-3.4 0-6.5 2-7.5 6.6L28 49.5H17.8l6-34.2h10.3l-.5 3.2c2.3-2.6 6.2-4.2 10.1-4.2 6.9.1 12.2 5.1 10.6 14.2zM94.5 32.4c-.1.8-.5 2.7-1.1 4.1H68.9c.6 3.8 3.8 4.8 7 4.8 2.9 0 5.2-.8 7.2-2.7l7.2 5.9c-4 4-8.7 6-15 6-11.8 0-18-8.5-16.3-18.7a20.7 20.7 0 0 1 20.5-17.4c9.8 0 16.9 7.6 15 18zm-9.7-3.7c-.3-3.8-3-5.3-6.2-5.3a8.9 8.9 0 0 0-8.3 5.3h14.5zM123.9 14.6l-2 11.6c-4-.6-10.5.8-11.7 7.8l.1-.4-2.8 15.9H97.3l6-34.2h10.3l-1.1 6.2c2.1-4.7 6.6-6.9 11.4-6.9zM137.8 37.3c-.5 3.1 2 3.3 6.6 2.9l-1.6 9.3c-12.3 1.4-16.9-2.7-15.2-12.2l2.1-12.1h-5.5l1.8-9.9h5.4l1.2-6.5 10.8-3.1-1.7 9.6h7.1l-1.8 9.9h-7l-2.2 12.1zM155.3 15.3h10.3l-6 34.2h-10.3l6-34.2zm.6-9.1c.5-3.3 3.7-6.2 7.1-6.2s5.7 2.8 5.2 6.2c-.5 3.4-3.7 6.2-7.2 6.2s-5.7-3-5.1-6.2zM208.1 15.3l-6 34.2h-10.3l.4-2.3a15.5 15.5 0 0 1-10.3 3.3c-11.1 0-15.3-9.6-13.5-18.9 1.6-8.8 8.6-17.2 19.2-17.2 4.5 0 7.7 1.8 9.6 4.6l.6-3.6h10.3zm-13.2 17.2c.9-5.2-1.9-8.4-6.6-8.4a9.5 9.5 0 0 0-9.5 8.3c-.9 5.1 1.8 8.3 6.6 8.3 4.6.1 8.6-3.1 9.5-8.2z"
            ></path>
          </svg>
        </a>
        <a
          class="text-white hover:text-white flex items-center gap-x-2"
          target="_blank"
          href="https://vuejs.org/"
        >
          <vuedotjs-icon :size="iconSize" style="fill: white" />
          <span class="text-2xl">VueJS</span>
        </a>
        <a
          class="text-white hover:text-white flex items-center gap-x-2"
          target="_blank"
          href="https://tailwindcss.com/"
        >
          <tailwindcss-icon :size="iconSize" style="fill: white" />
          <span class="text-2xl">Tailwindcss</span>
        </a>
      </div>
      <p class="text-slate-400 text-lg">
        and <span class="font-bold text-white">supercharged</span> by
      </p>
      <div class="flex items-center justify-between self-center gap-x-8">
        <div class="flex flex-col items-center">
          <a
            class="text-white hover:text-white flex items-center gap-x-2"
            href="https://vitejs.dev/"
            target="_blank"
          >
            <vite-icon :size="iconSize" style="fill: white" />
            <span class="text-2xl">ViteJs</span>
          </a>
        </div>

        <div
          v-if="projectConfig.withStorybook"
          class="flex flex-col text-white items-center gap-y-2"
        >
          <a
            class="text-white hover:text-white flex items-center gap-x-2"
            href="https://storybook.js.org/"
            target="_blank"
          >
            <storybook-icon :size="iconSize" style="fill: white" />
            <span class="text-2xl">StorybookJS</span>
          </a>
        </div>
      </div>

      <h2 class="text-center text-white text-4xl font-heading">
        Get Connected
      </h2>
      <div class="flex self-center gap-x-8 text-white">
        <a
          class="flex text-whit text-2xl hover:text-white items-center hover:text-white gap-x-2"
          target="_blank"
          href="https://github.com/saiforceone/dirt-cli"
        >
          <github-icon :size="iconSize" style="fill: white" />
          <span class="font-heading">Git D.I.R.T-y</span>
        </a>
        <a
          class="flex text-white text-2xl hover:text-white items-center hover:text-white gap-x-2"
          target="_blank"
          href="https://discord.gg/sY3a5VN3y9"
        >
          <discord-icon :size="iconSize" style="fill: white" />
          <span class="font-heading">P.C.E Discord</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { FolderArrowDownIcon } from '@heroicons/vue/24/solid';
import {
  DiscordIcon,
  DjangoIcon,
  GithubIcon,
  StorybookIcon,
  TailwindcssIcon,
  ViteIcon,
  VuedotjsIcon,
} from 'vue3-simple-icons';
import { projectConfig } from '../../../../@dirt_project/dirt.json';

// Component imports
import Note from '~/components/shared/Note.vue';
import Tree from '~/components/temp/Tree.vue';

export default defineComponent({
  components: {
    FolderArrowDownIcon,
    ViteIcon,
    VuedotjsIcon,
    TailwindcssIcon,
    DiscordIcon,
    GithubIcon,
    DjangoIcon,
    StorybookIcon,
    Note,
    Tree,
  },
  computed: {
    iconSize() {
      return '40';
    },
    projectConfig() {
      return projectConfig;
    },
  },
  name: 'Index.vue',
});
</script>