<script>
	import Select from 'svelte-select';

	export let commit;
	export let onRemoveClick;
	export let onValueChanged;

	let types = [ 'Fix', 'Feature', 'Other', 'Docs', 'Internal', 'Tests', 'Revert', 'Release' ];
	// TODO get names from some other place
	let scopes = [
		'adapter-ckfinder',
		'alignment',
		'autoformat',
		'autosave',
		'basic-styles',
		'block-quote',
		'build-balloon',
		'build-balloon-block',
		'build-classic',
		'build-decoupled-document',
		'build-inline',
		'build-multi-root',
		'ckbox',
		'ckfinder',
		'clipboard',
		'cloud-services',
		'code-block',
		'core',
		'easy-image',
		'editor-balloon',
		'editor-classic',
		'editor-decoupled',
		'editor-inline',
		'editor-multi-root',
		'engine',
		'enter',
		'essentials',
		'find-and-replace',
		'font',
		'heading',
		'highlight',
		'horizontal-line',
		'html-embed',
		'html-support',
		'image',
		'indent',
		'language',
		'link',
		'list',
		'markdown-gfm',
		'media-embed',
		'mention',
		'minimap',
		'page-break',
		'paragraph',
		'paste-from-office',
		'remove-format',
		'restricted-editing',
		'select-all',
		'show-blocks',
		'source-editing',
		'special-characters',
		'style',
		'table',
		'theme-lark',
		'typing',
		'ui',
		'undo',
		'upload',
		'utils',
		'watchdog',
		'widget',
		'word-count'
	];
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
			placeholder="(scope)"
			value={commit.packageName}
			on:change={event => onValueChanged(commit.id, 'packageName', event.detail.value)}
		/>
		<input
			type="text"
			value={commit.message}
			on:change={event => onValueChanged(commit.id, 'message', event.target.value)}
		/>
		<button on:click={() => onRemoveClick(commit.id)}>🗑️</button>
	</div>
	<textarea
		style="width: 100%"
		value={commit.description}
		on:change={event => onValueChanged(commit.id, 'description', event.target.value)}
	/>
</div>
