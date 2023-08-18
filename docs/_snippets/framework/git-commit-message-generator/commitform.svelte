<script>
	import Select from 'svelte-select';

	/* global CKEDITOR5_PACKAGES */

	export let commit;
	export let onRemoveClick;
	export let onValueChanged;

	let types = [ 'Fix', 'Feature', 'Other', 'Docs', 'Internal', 'Tests', 'Revert', 'Release' ];
	let scopes = CKEDITOR5_PACKAGES.map( shortPackageName => shortPackageName.replace( /^ckeditor5-/, '' ) );

	function handleMultiselectValueAdded( items ) {
		onValueChanged(commit.id, 'packageName', items );
	}

	function handleMultiselectValueRemoved( items ) {
		const itemsArr = Array.isArray(items) ? items : [ items ];
		onValueChanged(commit.id, 'packageName', commit.packageName.filter(p => !itemsArr
			.map(i => i.value).includes(p.value)
		));
	}
</script>

<div>
	<div style="display: flex">
		<Select
			items={types}
			placeholder="Type"
			value={commit.type}
			on:change={event => onValueChanged(commit.id, 'type', event.detail.value)}
		/>
		<Select
			items={scopes}
			multiple={true}
			placeholder="(scope)"
			value={commit.packageName}
			on:change={event => handleMultiselectValueAdded(event.detail)}
			on:clear={event => handleMultiselectValueRemoved(event.detail)}
		/>
		<input
			type="text"
			value={commit.message}
			on:input={event => onValueChanged(commit.id, 'message', event.target.value)}
		/>
		<button on:click={() => onRemoveClick(commit.id)}>🗑️</button>
	</div>
	<textarea
		style="width: 100%"
		value={commit.description}
		on:input={event => onValueChanged(commit.id, 'description', event.target.value)}
	/>
</div>
