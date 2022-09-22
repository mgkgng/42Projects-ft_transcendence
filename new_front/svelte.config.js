import sveltePreprocess from 'svelte-preprocess'
import adapter from '@sveltejs/adapter-node';

const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: sveltePreprocess({
    scss: {
      prependData: `@import "src/var.scss";`,
      renderSync: true
    }
  }),
  kit: {
    adapter: adapter({
      out: 'build'
    })
  }
}

export default config;