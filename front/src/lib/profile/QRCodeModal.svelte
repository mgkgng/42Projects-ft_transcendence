<script type="ts">
	import { onMount } from "svelte";
    export let src_img : any;

    onMount(() => {
        console.log(src_img)
    });
</script>

<div class="container">
    <img src={src_img} />
</div>