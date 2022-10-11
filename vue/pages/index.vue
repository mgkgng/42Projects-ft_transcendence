<template>
	<Test />
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
	name: 'App',
	data: () => ({
		messages: []
	}),
	mounted() {
		console.log("server connected.");
		const ws = new WebSocket('ws://localhost:3000');
		ws.onmessage = event => {
			this.messages = JSON.parse(event.data);
		}
	}
})

</script>
