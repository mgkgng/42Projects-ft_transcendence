import adapter from '@sveltejs/adapter-auto';
import sveltePreprocess from 'svelte-preprocess'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: sveltePreprocess({
		scss: {
			prependData: `@import "$lib/scss/var.scss";`,
			renderSync: true
		}
	}),

	kit: {
		adapter: adapter(),
	}
};

export default config;
