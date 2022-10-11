<script>
	export let target = undefined;

	function portal(elm, target = "body") {
		return {
			update: () => {
				document.querySelector(target)?.appendChild?.(elm);
			},
			destroy: () => {
				elm.parentNode?.removeChild?.(elm);
			}
		}
	}
</script>

<div use:portal={target}>
	<slot />
</div>