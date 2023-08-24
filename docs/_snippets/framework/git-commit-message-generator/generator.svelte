<script>
	import CommitForm from './commitform.svelte';
	import BreakingChangeForm from './breakingchangeform.svelte';

	let scopes = CKEDITOR5_PACKAGES.map( shortPackageName => shortPackageName.replace( /^ckeditor5-/, '' ) );

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
		packageName: [],
		message: '',
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
					let parts = `${ value.type || 'MINOR' } BREAKING CHANGE`;

					if ( value.packageName.length ) {
						let scope = '('
						scope += value.packageName.map( item => item.value ).join( ', ' )
						scope += ')'
						parts += ` ${ scope }`
					}

					parts += `: ${ value.message }`;

					return parts;
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

<style>
    .textarea-output {
        border: 1px solid #b2b8bf;
        border-radius: 5px;
        padding: 2px 5px;
        width: 100%;
        height: 200px;
        resize: none;
        min-height: 48px;
        margin-bottom: 10px;
		margin-top: 20px;
    }
</style>

<div>
    {#each commits as commit}
        <CommitForm
			commit={commit}
			packages={scopes}
			onRemoveClick={handleRemoveCommitClick}
			onValueChanged={handleOnCommitValueChanged}
		/>
    {/each}

	<button type="button" on:click={handleAddNewCommitClick}>New Commit</button>
	<button type="button" on:click={handleAddNewBreakingChangeClick}>New Breaking Change</button>

	{#each breakingChanges as breakingChange}
		<BreakingChangeForm
			packages={scopes}
			breakingChange={breakingChange}
			onRemoveClick={handleRemoveBreakingChangeClick}
			onValueChanged={handleOnBreakingChangeValueChanged}
		/>
	{/each}
</div>

<textarea readonly class="textarea-output" value={ textareaData } />
