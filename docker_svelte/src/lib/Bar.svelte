<style>
	.bar {
		position: relative;
		width: 100px;
		height: 10px;
		background-color:rgba(0, 0, 0, 0.8);
		border-radius: 2em;
		cursor: pointer;
	}
</style>

<script>
	import { io } from "socket.io-client";
	let grapped = false;

</script>

<div class="bar" on:mousedown={()=>{
	grapped = true;
}}></div>

<svelte:window
on:mouseup={()=>{
	grapped = false;
}}

on:mousemove={(event)=>{
	if (grapped)
		console.log(event);
}}

/>