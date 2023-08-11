<script>
	import CommitForm from './commitform.svelte';
	import BreakingChangeForm from './breakingchangeform.svelte';

	let id = 0;
	let breakingChangeId = 0;

	let commits = [ {
		id: id,
		type: '',
		packageName: '',
		message: '',
		description: ''
	} ];

	let breakingChanges = [ {
		id: breakingChangeId,
		type: '',
		message: ''
	} ];

	function handleAddNewCommitClick() {
		commits = commits.concat( {
			id: ++id,
			type: '',
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

	function handleOnCommitValueChanged( commitId, propertyName, newValue ) {
		commits = commits.map( commit => commit.id === commitId ?
			( { ...commit, [propertyName]: newValue } ) :
			commit
		);
	}

	function handleOnBreakingChangeValueChanged( breakingChangeId, propertyName, newValue ) {
		breakingChanges = breakingChanges.map( breakingChange => breakingChange.id === breakingChangeId ?
			( { ...breakingChange, [propertyName]: newValue } ) :
			breakingChangeId
		);
	}
</script>

<div>
    {#each commits as commit}
        <CommitForm
			commit={commit}
			onRemoveClick={handleRemoveCommitClick}
			onValueChanged={handleOnCommitValueChanged}

		/>
    {/each}
	<button type="button" on:click={handleAddNewCommitClick}>New Commit</button>
	<hr>
	{#each breakingChanges as breakingChange}
		<BreakingChangeForm
			breakingChange={breakingChange}
			onRemoveClick={handleRemoveBreakingChangeClick}
			onValueChanged={handleOnBreakingChangeValueChanged}
		/>
	{/each}
	<button type="button" on:click={handleAddNewBreakingChangeClick}>New Breaking Change</button>
</div>
<hr>
<textarea style="width: 100%"/>
<div>{JSON.stringify( commits )}</div>
<div>{JSON.stringify( breakingChanges )}</div>
