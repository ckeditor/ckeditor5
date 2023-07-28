<script>
	import Entry from './entry.svelte';

	let entries = [];

	function onClickButton() {
		entries = entries.concat( new Date() );
	}
</script>

<div>
    {#each entries as item, index}
        <Entry id={index}></Entry>
    {/each}
</div>

<hr>

<button type="button" on:click={onClickButton}>New</button>
