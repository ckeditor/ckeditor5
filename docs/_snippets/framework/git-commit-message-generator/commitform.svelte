<script>
	import Select from 'svelte-select';

	/* global CKEDITOR5_PACKAGES */

	export let commit;
	export let onRemoveClick;
	export let onValueChanged;
	export let packages;

	let types = [ 'Fix', 'Feature', 'Other', 'Docs', 'Internal', 'Tests', 'Revert', 'Release' ];

	function handleMultiselectValueAdded( items ) {
		onValueChanged( commit.id, 'packageName', items );
	}

	function handleMultiselectValueRemoved( items ) {
		const itemsArr = Array.isArray( items ) ? items : [ items ];
		onValueChanged( commit.id, 'packageName', commit.packageName.filter( p => !itemsArr
			.map( i => i.value ).includes( p.value )
		) );
	}
</script>

<style>
    .commit-form {
        display: flex;
        flex-flow: column;
        margin-bottom: 20px;
    }

    .commit-form__header {
        display: flex;
        margin-bottom: 10px;
    }

    .commit-form__type {
        width: 200px;
    }

    .commit-form__scope {
        width: 100%;
        margin: 0 10px;
    }

    .commit-form__message {
        border: 1px solid #b2b8bf;
        border-radius: 5px;
        padding: 2px 5px;
        height: 48px;
        margin-bottom: 10px;
    }

    .commit-form__description {
        border: 1px solid #b2b8bf;
        border-radius: 5px;
        padding: 2px 5px;
        resize: vertical;
        min-height: 48px;
        margin-bottom: 10px;
    }

    .commit-form__remove {
        height: 48px;
    }
</style>

<div class="commit-form">
    <div class="commit-form__header">
        <div class="commit-form__type">
            <Select
                    --height="48px"
                    items={types}
                    placeholder="Type"
                    value={commit.type}
                    on:change={event => onValueChanged(commit.id, 'type', event.detail.value)}
            />
        </div>
        <div class="commit-form__scope">
            <Select
                    --input-padding="0px"
                    items={packages}
                    multiple={true}
                    placeholder="(scope)"
                    value={commit.packageName}
                    on:change={event => handleMultiselectValueAdded(event.detail)}
                    on:clear={event => handleMultiselectValueRemoved(event.detail)}
            />
        </div>
        <button class="commit-form__remove" on:click={() => onRemoveClick(commit.id)}>🗑️</button>
    </div>

    <input
            placeholder="Short message."
            class="commit-form__message"
            type="text"
            value={commit.message}
            on:input={event => onValueChanged(commit.id, 'message', event.target.value)}
            required
    />

    <textarea
            placeholder="Add an optional extended description..."
            style="width: 100%"
            class="commit-form__description"
            value={commit.description}
            on:input={event => onValueChanged(commit.id, 'description', event.target.value)}
    />

</div>
