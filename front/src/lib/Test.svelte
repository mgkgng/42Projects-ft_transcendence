<script>
	import { client } from "$lib/stores/client";
	import { onMount } from "svelte";

	function init_socket()
	{

	}
	function getFriendList() {
		$client.socket.emit("askFriend", {username: "bobby"});
		if (!$client.socket) {
			console.log("no socket");
		}
		console.log('clieckd');
	}
	$: userSearchList = [];
	onMount(() => {
		$client.socket.on("success_getFriendList", (data) => {
				console.log("success", data);
			});
			$client.socket.on("error_getFriendList", (data) => {
				console.log("error", data);
			});
			$client.socket.on("success_isFriendWith", (data) => {
				console.log("success", data);
			});
			$client.socket.on("error_isFriendWith", (data) => {
				console.log("error", data);
			});
			$client.socket.on("success_getAskList", (data) => {
				console.log("success", data);
			});
			$client.socket.on("error_getAskList", (data) => {
				console.log("error", data);
			});
			$client.socket.on("success_askFriend", (data) => {
				console.log("success", data);
			});
			$client.socket.on("error_askFriend", (data) => {
				console.log("error", data);
			});
			$client.socket.on("success_acceptFriend", (data) => {
				console.log("success", data);
			});
			$client.socket.on("error_acceptFriend", (data) => {
				console.log("error", data);
			});
			$client.socket.on("success_refuseFriend", (data) => {
				console.log("success", data);
			});
			$client.socket.on("error_refuseFriend", (data) => {
				console.log("error", data);
			});
			$client.socket.on("success_removeFriend", (data) => {
				console.log("success", data);
			});
			$client.socket.on("error_removeFriend", (data) => {
				console.log("error", data);
			});
			$client.socket.on("success_getUserinDB", (data) => {
				console.log("success", data);
				userSearchList = data.users;
			});
			$client.socket.on("error_getUserinDB", (data) => {
				console.log("error", data);
			});
	});
	$: searchUser = "";
	$: searchUser = searchUser.toLowerCase();
	$: {
		$client.socket.emit("getUserinDB", {username: searchUser});
		console.log("searchUser", searchUser);
	}
	
</script>

<div class="testDiv">
	<button class=".testButton" on:click={getFriendList}>HEKKi</button>
	<input type="text" bind:value={searchUser}>
	{#if searchUser.length > 0 && userSearchList.length > 0}
		{#each userSearchList as user}
			<div class="userSearchListDiv">{user.username}</div>
		{/each}
	{/if}
</div>

<style>
	.testButton {
		background-color: red;
	}
	.testDiv {
		background-color: green;
	}
	.userSearchListDiv {
		background-color: blue;
	}
</style>