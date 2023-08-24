<script>
	import Select from 'svelte-select';

	export let breakingChange;
	export let onRemoveClick;
	export let onValueChanged;
	export let packages;

	let breakingChangeTypes = [ 'MAJOR', 'MINOR' ];

	function handleMultiselectValueAdded( items ) {
		onValueChanged(breakingChange.id, 'packageName', items );
	}

	function handleMultiselectValueRemoved( items ) {
		const itemsArr = Array.isArray(items) ? items : [ items ];
		onValueChanged(breakingChange.id, 'packageName', breakingChange.packageName.filter(p => !itemsArr
				.map(i => i.value).includes(p.value)
		));
	}
</script>

<style>
	.breaking-change {
		display: flex;
		flex-flow: column;
		margin-top: 20px;
	}

	.breaking-change__header {
		display: flex;
		margin-bottom: 10px;
	}

	.breaking-change__type {
		width: 200px;
	}

	.breaking-change__scope {
		width: 100%;
		margin: 0 10px;
	}

	.breaking-change__message {
		border: 1px solid #b2b8bf;
		border-radius: 5px;
		padding: 2px 5px;
		height: 48px;
		margin-bottom: 10px;
	}
</style>

<div class="breaking-change">
	<div class="breaking-change__header">
		<div class="breaking-change__type">
			<Select
					--height="48px"
					items={breakingChangeTypes}
					placeholder="Type"
					value={breakingChange.type}
					on:change={event => onValueChanged(breakingChange.id, 'type', event.detail.value)}
			/>
		</div>
		<div class="breaking-change__scope">
			<Select
					--input-padding="0px"
					items={packages}
					multiple={true}
					placeholder="(scope)"
					value={breakingChange.packageName}
					on:change={event => handleMultiselectValueAdded(event.detail)}
					on:clear={event => handleMultiselectValueRemoved(event.detail)}
			/>
		</div>
		<button on:click={() => onRemoveClick(breakingChange.id)}>🗑️</button>
	</div>

	<input
		placeholder="Short message."
		class="breaking-change__message"
		type="text"
		value={breakingChange.message}
		on:input={event => onValueChanged(breakingChange.id, 'message', event.target.value)}
	/>

</div>
