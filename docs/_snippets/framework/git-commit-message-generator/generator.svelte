<script>
	import CommitForm from './commitform.svelte';
	import BreakingChangeForm from './breakingchangeform.svelte';

	let id = 0;
	let breakingChangeId = 0;

	let commits = [ {
		id: id,
		type: 'Internal',
		packageName: [],
		message: '',
		description: ''
	} ];

	let breakingChanges = [ {
		id: breakingChangeId,
		type: 'MINOR',
		message: ''
	} ];

	$: textareaData = buildMessage( commits, breakingChanges );

	function buildMessage( otherCommits, otherBreakingChanges ) {
		const commitMessages = otherCommits
				.filter( value => {
					if ( !value.message ) {
						return false;
					}

					if ( !value.message.trim().length ) {
						return false;
					}

					return true;
				} )
				.map( value => {
					let parts = `${ value.type || 'Internal' }`

					if ( value.packageName.length ) {
						let scope = '('
						scope += value.packageName.map( item => item.value ).join( ', ' )
						scope += ')'
						parts += ` ${ scope }`
					}

					parts += `: ${ value.message }`;

					if ( value.description ) {
						parts += `\n\n${ value.description }`;
					}

					return parts;
				} );

		const commitBreakingChanges = breakingChanges
				.filter( value => {
					if ( !value.message ) {
						return false;
					}

					if ( !value.message.trim().length ) {
						return false;
					}

					return true;
				} )
				.map( value => {
					return `${ value.type || 'MINOR' } BREAKING CHANGE: ${ value.message }`;
				} );

		return [
			commitMessages.join( '\n\n' ),
			commitBreakingChanges.join( '\n\n' )
		].join( '\n\n' );
	}

	function handleAddNewCommitClick() {
		commits = commits.concat( {
			id: ++id,
			type: 'Internal',
			packageName: [],
			message: '',
			description: ''
		} );
	}

	function handleAddNewBreakingChangeClick() {
		breakingChanges = breakingChanges.concat( {
			id: ++breakingChangeId,
			type: 'MINOR',
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
			breakingChange
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
<textarea readonly style="width: 100%; height: 200px; resize: none;" value={ textareaData } />
