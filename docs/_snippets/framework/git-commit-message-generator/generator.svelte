<script>
	import CommitForm from './commitform.svelte';
	import BreakingChangeForm from './breakingchangeform.svelte';

	let id = 0;
	let breakingChangeId = 0;

	let commits = [ {
		id: id,
		type: 'test' + id,
		packageName: '',
		message: '',
		description: '123'
	} ];

	let breakingChanges = [ {
		id: breakingChangeId,
		type: 'test' + breakingChangeId,
		message: ''
	} ];

	function handleAddNewCommitClick() {
		commits = commits.concat( {
			id: ++id,
			type: 'test' + id,
			packageName: '',
			message: '',
			description: ''
		} );
	}

	function handleAddNewBreakingChangeClick() {
		breakingChanges = breakingChanges.concat( {
			id: ++breakingChangeId,
			type: 'test' + breakingChangeId,
			message: ''
		} );
	}

	function handleRemoveCommitClick( removedEntryId ) {
		commits = commits.filter( entry => entry.id !== removedEntryId );
	}

	function handleRemoveBreakingChangeClick( removedEntryId ) {
		breakingChanges = breakingChanges.filter( entry => entry.id !== removedEntryId );
	}
</script>

<div>
    {#each commits as commit}
        <CommitForm
			commit={commit}
			onRemoveClick={handleRemoveCommitClick}
		/>
    {/each}
	<button type="button" on:click={handleAddNewCommitClick}>New Commit</button>
	<hr>
	{#each breakingChanges as breakingChange}
		<BreakingChangeForm
			breakingChange={breakingChange}
			onRemoveClick={handleRemoveBreakingChangeClick}
		/>
	{/each}
	<button type="button" on:click={handleAddNewBreakingChangeClick}>New Breaking Change</button>
</div>
<hr>
<textarea/>
