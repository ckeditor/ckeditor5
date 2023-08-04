<script>
	export let breakingChange;
	export let onRemoveClick;
</script>

<div>
	<input type="text" value={breakingChange.type}/>
	<input type="text" value={breakingChange.message}/>
	<button on:click={() => onRemoveClick(breakingChange.id)}>🗑️</button>
</div>
