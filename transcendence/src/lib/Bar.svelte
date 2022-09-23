<style>
	.bar {
		width: 100px;
		height: 10px;
		background-color:rgba(0, 0, 0, 0.8);
		border-radius: 2em;
		cursor: pointer;
	}
</style>

<script>
	let grapped = false;
</script>

<div class="bar" on:mousedown={()=>{
	grapped = true;
}}></div>

<svelte:window on:mouseup={()=>{
	grapped = false;
}} on:mousemove={(e)=>{
	if (grapped)
		console.log(e);
}}/>