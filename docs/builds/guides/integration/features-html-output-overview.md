---
menu-title: Features' HTML output
category: builds-integration
order: 90
modified_at: 2021-06-07
---

# Features' HTML output overview

Listed below are all official CKEditor 5 packages as well as some partner packages together with their possible HTML output. If a plugin generates a different HTML output depending on its configuration, it is described in the "HTML output" column.

The classes, styles or attributes applied to an HTML element are all **possible** results. It does not mean they all will always be used.

If a given plugin does not generate any output, the "HTML output" is described as "None".  Wildcard character `*` means any value is possible.

The data used to generate the following tables comes from the package metadata. You can read more about it in the {@link framework/guides/contributing/package-metadata package metadata} guide.

<style>
	table.features-html-output p {
		padding: 0;
	}

	table.features-html-output th.plugin {
		width: 33.333%;
	}

	table.features-html-output td.plugin a,
	table.features-html-output td.plugin code {
		white-space: nowrap;
	}

	table.features-html-output td.html-output > code {
		display: block;
		padding: 0;
		background: none;
		white-space: pre-wrap;
	}

	table.features-html-output td.html-output > code + * {
		margin-top: 1em;
	}
</style>

{@exec ../scripts/docs/features-html-output/build-features-html-output.js}
