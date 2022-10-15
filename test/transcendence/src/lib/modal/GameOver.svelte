<style lang="scss">
	button {
		width: 50px;
		height: 50px;
		background-color: $main;
		cursor: pointer;
		color: #fff;
	}
</style>

<script lang="ts">
    import { goto } from "$app/navigation";

</script>

<p>Testing Modal...</p>
<button on:click = {() => {
	goto('/');
}}>HOME</button>