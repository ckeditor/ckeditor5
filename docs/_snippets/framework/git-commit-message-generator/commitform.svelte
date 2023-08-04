<script>
	export let commit;
	export let onRemoveClick;
</script>

<div>
	<div>
		<input type="text" value={commit.type}/>
		<input type="text" value={commit.packageName}/>
		<input type="text" value={commit.message}/>
		<button on:click={() => onRemoveClick(commit.id)}>🗑️</button>
	</div>
	<textarea value={commit.description} />
</div>
