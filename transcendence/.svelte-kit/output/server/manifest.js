export const manifest = {
	appDir: "_app",
	assets: new Set(["favicon.png","fonts/AlphaProta.ttf","fonts/Modernism-Narrow.ttf","fonts/Modernism.ttf","robots.txt","svelte-welcome.png","svelte-welcome.webp"]),
	mimeTypes: {".png":"image/png",".ttf":"font/ttf",".txt":"text/plain",".webp":"image/webp"},
	_: {
		entry: {"file":"_app/immutable/start-b23b902d.js","imports":["_app/immutable/start-b23b902d.js","_app/immutable/chunks/index-afa4dab4.js","_app/immutable/chunks/singletons-f2408b8b.js"],"stylesheets":[]},
		nodes: [
			() => import('./nodes/0.js'),
			() => import('./nodes/1.js'),
			() => import('./nodes/2.js'),
			() => import('./nodes/3.js'),
			() => import('./nodes/4.js')
		],
		routes: [
			{
				id: "",
				pattern: /^\/$/,
				names: [],
				types: [],
				page: { layouts: [0], errors: [1], leaf: 2 },
				endpoint: null
			},
			{
				id: "about",
				pattern: /^\/about\/?$/,
				names: [],
				types: [],
				page: { layouts: [0], errors: [1], leaf: 3 },
				endpoint: null
			},
			{
				id: "play",
				pattern: /^\/play\/?$/,
				names: [],
				types: [],
				page: { layouts: [0], errors: [1], leaf: 4 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
};
