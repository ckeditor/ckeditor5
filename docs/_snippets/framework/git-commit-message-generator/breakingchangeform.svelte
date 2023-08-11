<script>
	import Select from 'svelte-select';

	export let breakingChange;
	export let onRemoveClick;
	export let onValueChanged;

	let breakingChangeTypes = [ 'MAJOR', 'MINOR' ];
</script>

<div style="display: flex">
	<Select
		items={breakingChangeTypes}
		placeholder="Type"
		value={breakingChange.type}
		on:change={event => onValueChanged(breakingChange.id, 'type', event.detail.value)}
	/>
	<input
		type="text"
		value={breakingChange.message}
		on:change={event => onValueChanged(breakingChange.id, 'message', event.target.value)}
	/>
	<button on:click={() => onRemoveClick(breakingChange.id)}>🗑️</button>
</div>
