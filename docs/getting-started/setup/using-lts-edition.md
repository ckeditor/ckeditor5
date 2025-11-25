---
category: setup
menu-title: Using LTS Edition
meta-title: CKEditor 5 LTS Edition | CKEditor 5 Documentation
meta-description: Learn about CKEditor 5 Long-term Support (LTS) Edition for enterprise use cases requiring extended support and maintenance.
order: 140
modified_at: 2025-09-29
badges: [ premium ]
---

# CKEditor&nbsp;5 LTS Edition

CKEditor&nbsp;5 Long-term Support (LTS) Edition provides extended maintenance and support for enterprise customers who require stability and predictable update cycles.

{@snippet getting-started/unlock-feature-lts}

## What is LTS Edition?

CKEditor&nbsp;5 LTS Edition is for teams that need **long-term stability without sacrificing security**. Released once every two years, each LTS version provides up to 3 years of guaranteed security and compatibility fixes with **zero breaking changes**.

### Key advantages over regular releases

<table>
	<thead>
		<tr>
			<th>LTS Edition</th>
			<th>Regular releases</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td><strong>Once every 2 years</strong></td>
			<td>Major version every 2–3 months</td>
		</tr>
		<tr>
			<td><strong>3-year security warranty</strong></td>
			<td>Security fixes only in the latest version</td>
		</tr>
		<tr>
			<td><strong>Third-party API changes assurance</strong></td>
			<td>No third-party compatibility fixes</td>
		</tr>
		<tr>
			<td><strong>Zero breaking changes</strong></td>
			<td>
				Minor breaking changes allowed in minor releases;<br>
				Major breaking changes in major releases
			</td>
		</tr>
		<tr>
			<td><strong>No forced upgrades for 3 years</strong></td>
			<td>Requires regular major updates</td>
		</tr>
	</tbody>
</table>

### Perfect for enterprise environments

With LTS Edition, you can **stick to a single major version for up to 3 years** without compromising on security or quality. You get:

* **6 months of active development** &ndash; New features, enhancements, and bug fixes.
* **2.5 years of maintenance phase** &ndash; Security and critical/high third-party compatibility updates (for example, with browsers or Microsoft Word/Excel).
* **Predictable update cycles** &ndash; Plan deployments without surprise breaking changes.
* **Focus on your business** &ndash; Less time managing editor updates, more time building features.

It means enterprise teams in regulated industries, government, education, or any environment where stability is crucial can deploy once and maintain security without the overhead of frequent major version migrations.

## LTS Edition release schedule

{@img assets/img/lts-schedule.png 800 Timeline chart of CKEditor&nbsp;5 release schedule from Q3 2025 to Q3 2031, showing major versions v47 to v58. LTS releases (v47, v51, v55) have a 6-month Active phase in green followed by a 2.5-year Maintenance phase in yellow. Regular releases (v48, v49, v50, v52, v53, v54, v56, v57, v58) each have shorter Active phases of about 6 months in green, with no Maintenance phase. LTS releases overlap by one year, allowing migration from one LTS line to the next.}

<!-- Source: https://miro.com/app/board/uXjVJCW7oaw=/ -->

Legend:

* **Active phase**: New features and bug fixes. (~6 months)
	* In LTS releases: no breaking changes allowed.
	* In Regular releases: minor breaking changes allowed.
* **Maintenance phase**: Security and critical/high third‑party compatibility updates. Available to LTS Edition customers only. (~2.5 years)

### Schedule details

Schedule details of the **LTS releases**:

* **Cadence**: One LTS release every 2 years (early October).
* **Current LTS release**: As of October 2025 → **`v47.x`**.
* **Active phase (first 6 months)**: New features and bug fixes; no breaking changes.
* **Maintenance phase (next 2.5 years)**: Security fixes and critical/high-severity third-party compatibility updates (for example, browsers or Microsoft Office). Begins with a technical release that separates the LTS-only distribution.
* **Overlap**: Consecutive LTS releases overlap with each other for 1 year, simplifying migration.
* **Limited breaking changes exception**: A closed, pre‑announced set of new features in an LTS release may introduce minor breaking changes during the Active phase. See the [list of exceptions for `v47.x`](#features-excluded-from-the-no-breaking-changes-guarantee-v47x).

Unlike the LTS releases, the Regular releases (for example, `v48.x`, `v49.x`) may include minor breaking changes in minor releases (for example, in `v48.1.0`, `v48.2.0`). Read more in the {@link updating/versioning-policy Versioning policy} guide.

### Practical example

Here is how the lifecycle looks for an integrator using the LTS Edition:

1. **Initial installation (October 2025):** The integrator deploys `v47.0.0`.
2. **Active and maintenance phases (2025–2028):**
	* They may install subsequent **patch releases** (`v47.x.x`) within the same LTS line.
	* These updates include bug fixes, security patches, and critical compatibility adjustments, but **never breaking changes**.
	* Customers are notified whenever a security or compatibility update is available.
3. **Migration window (starting October 2027):**
	* The next **LTS release**, `v51.x`, becomes available.
	* A **1-year overlap period** begins, giving the integrator flexibility to plan and execute the migration without disruption.
4. **End of support (October 2028):**
	* The `v47.x` LTS line reaches the end of its 3-year support cycle.
	* From this point onward, the integrator must be on the `v51.x` LTS release (or later) to continue receiving updates.

### Features excluded from the "no breaking changes" guarantee (v47.x)

Due to the rapid development of the {@link features/ckeditor-ai-overview CKEditor AI} feature (released in October 2025), during the Active phase of `v47.x`, new releases may include minor breaking changes in this feature. No breaking changes will be allowed for this feature in the Maintenance phase (after April 2026).

The {@link features/ai-assistant-overview CKEditor&nbsp;5 AI Assistant} feature (introduced in `v40.0.0`) is not affected by this exception.

## Installing the LTS Edition

The LTS Edition releases of CKEditor&nbsp;5 are available through standard distribution channels: npm, ZIP, and CDN. Using the editor versions released in the Maintenance phase requires a subscription, which includes the CKEditor&nbsp;5 LTS Edition add-on. [Contact sales](https://ckeditor.com/contact-sales/) to learn more.

To install an LTS version:

* Choose the latest release of CKEditor&nbsp;5 in the current LTS line. Starting October 2025, this is the newest version in the `v47.x.x` line.
* Choose a compatible version of the React, Angular, or Vue integrations (if you use one). See the [Compatibility](#compatibility) section below.
* Choose a compatible version of CKBox (if you use it). See the [Compatibility](#compatibility) section below.

Apart from making sure to use the right versions of all dependencies, follow the instructions below.

### npm

When installing CKEditor&nbsp;5 LTS Edition from npm, make sure to specify the major version like this:

```bash
npm install ckeditor5@47
npm install ckeditor5-premium-features@47
```

These commands will install the latest version in the `v47.x.x` line.

Apart from this, follow the matching guides covering the technology of your choice (for example, React, Angular, Vue, or vanilla JS) in the {@link getting-started/index Getting started} section.

### ZIP

When installing CKEditor&nbsp;5 LTS Edition from ZIP, make sure to choose the LTS version:

* <a href="https://cdn.ckeditor.com/ckeditor5/{%CKEDITOR_5_VERSION_LTS_V47%}/zip/ckeditor5-{%CKEDITOR_5_VERSION_LTS_V47%}.zip">Download ZIP: CKEditor&nbsp;5&nbsp;LTS version</a>
* <a href="https://cdn.ckeditor.com/ckeditor5-premium-features/{%CKEDITOR_5_VERSION_LTS_V47%}/zip/ckeditor5-premium-features-{%CKEDITOR_5_VERSION_LTS_V47%}.zip">Download ZIP: CKEditor 5 with Premium features LTS version</a>

Apart from this, follow the matching guides covering the technology of your choice (for example, React, Angular, Vue, or vanilla JS) in the {@link getting-started/index Getting started} section.

### CDN

When installing CKEditor&nbsp;5 LTS Edition from CDN, make sure to choose the LTS version:

```html
<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/{%CKEDITOR_5_VERSION_LTS_V47%}/ckeditor5.css" />
<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5-premium-features/{%CKEDITOR_5_VERSION_LTS_V47%}/ckeditor5-premium-features.css" />

<script src="https://cdn.ckeditor.com/ckeditor5/{%CKEDITOR_5_VERSION_LTS_V47%}/ckeditor5.umd.js"></script>
<script src="https://cdn.ckeditor.com/ckeditor5-premium-features/{%CKEDITOR_5_VERSION_LTS_V47%}/ckeditor5-premium-features.umd.js"></script>
```

Or specify `version: '{%CKEDITOR_5_VERSION_LTS_V47%}'` when using functions such as {@link getting-started/setup/loading-cdn-resources `useCKEditorCloud()`}.

Apart from this, follow the matching guides covering the technology of your choice (for example, React, Angular, Vue, or vanilla JS) in the {@link getting-started/index Getting started} section.

## LTS additional warranties

The LTS Edition comes with extended guarantees beyond regular release policies, designed to give enterprise teams stability and peace of mind.

Please note that time limitations apply to all warranties described in this section.

### 3-year security warranty

Throughout the Active and Maintenance phases (a total of 3 years), the LTS release will receive security fixes for any detected vulnerabilities.

If dependency has a vulnerability and provides a patch, CKEditor&nbsp;5 will ship a new LTS patch release.

### Third-party API changes assurance

Third-party APIs include:

* Officially supported frameworks (React, Angular, Vue).
* Supported browsers, mobile environments, and operating systems.
* Microsoft Word/Excel and Google Docs.

The LTS Edition ensures fixes for **critical or high-severity regressions** caused by changes in these third-party products.

* Fixes are delivered throughout the 3-year Active and Maintenance phases.
* Exceptions apply if regressions cannot be resolved on the CKEditor side (for example, if they require fixes from the third-party vendor).

In short, CKEditor&nbsp;5&nbsp;LTS aims to ensure the integration quality remains stable during the entire 3-year support window.

## Compatibility

This section outlines compatibility rules and guarantees specific to the LTS Edition.

### Compatibility with CKEditor Cloud Services

The cloud-hosted CKEditor Cloud Services support CKEditor 5 versions **up to 5 years old**, which includes all currently supported LTS releases.

### Compatibility with CKEditor Cloud Services On-Premises

The latest On-Premises CKEditor Cloud Services support CKEditor 5 versions **up to 5 years old**, covering all active LTS releases.

### Compatibility with browser versions, operating systems, and other third-party APIs/software products

The CKEditor&nbsp;5&nbsp;LTS Edition follows the same compatibility guarantees as regular releases, with the added benefit of **extended maintenance**:

* **Supported environments:** All browsers, operating systems, and mobile platforms officially listed in the {@link support/browser-compatibility Browser compatibility} guide.
* **Assurance period:** Critical/high-severity regressions caused by updates in these environments will be fixed for the full 3-year LTS lifecycle. See [Third-party API changes assurance](#3-year-security-warranty) for details.

It ensures that CKEditor 5 remains stable and reliable in evolving ecosystems, while minimizing disruption in long-term projects.

### Compatibility with React, Angular, and Vue versions

The LTS Edition ensures predictable integration with major JavaScript frameworks used in enterprise applications.

* **Framework coverage:** Each LTS release supports the versions of React, Angular, and Vue that were officially listed as supported on the day the LTS release was published.
* **Ongoing support:** In addition, all new versions of these frameworks released during the 3-year LTS support period will also be supported.
* **Support window:** It means your project can safely adopt both the originally supported framework versions and any new framework releases that appear during the lifecycle of the LTS line.
* **Updates:** Compatibility fixes will be provided if critical or high-severity regressions appear in any of the covered framework versions.

For details on which framework versions are supported by a given LTS line, see the [Compatibility matrix](#compatibility-matrix) below.

### Compatibility with add-ons delivered by CKEditor’s partners

CKEditor integrates with several add-ons delivered by trusted partners, including:

* **Spell and grammar checker** by *WebSpellChecker*.
* **Math equations and Chemical formulas** by *Wiris*.
* **Image optimizer** by *Uploadcare*.

Please note that the **LTS Edition does not guarantee ongoing compatibility with these third-party services**.

If your project depends on any of these integrations, we recommend [contacting us](https://ckeditor.com/contact-sales/) to discuss available options and support arrangements.

### Compatibility matrix

When installing CKEditor&nbsp;5&nbsp;LTS Edition, ensure you use the compatible versions of other products from the CKEditor Ecosystem.

Refer to the table below to see which versions of each ecosystem library should be used together with CKEditor&nbsp;5&nbsp;LTS Edition.

<!-- Note: Class on the table itself caused problems with Umberto. -->
<div class="lts-compat-matrix">
	<table>
		<thead>
			<tr>
				<th>Software</th>
				<th>Supported versions</th>
				<th>Notes</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<th>React</th>
				<td>
					<code>&gt;=16.13.1</code>
				</td>
				<td>
					Use with <a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-react"><code>@ckeditor/ckeditor5-react</code></a> in version <code>^11.0.0</code>
				</td>
			</tr>
			<tr>
				<th>Angular</th>
				<td>
					<code>&gt;=16.0.0</code>
				</td>
				<td>
					Use with <a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-angular"><code>@ckeditor/ckeditor5-angular</code></a> in version <code>^10.0.0</code>
				</td>
			</tr>
			<tr>
				<th>Vue</th>
				<td>
					<code>&gt;=3.0.0</code>
				</td>
				<td>
					Use with <a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-vue"><code>@ckeditor/ckeditor5-vue</code></a> in version <code>^7.3.0</code>
				</td>
			</tr>
			<tr>
				<th>CKBox</th>
				<td>
					<code>&gt;=2.8.2</code>
				</td>
				<td></td>
			</tr>
		</tbody>
	</table>
</div>

## FAQ

### What is the current CKEditor&nbsp;5&nbsp;LTS version?

The current LTS version line is `v47.x`.

The latest release in this line is `v{%CKEDITOR_5_VERSION_LTS_V47%}`.

### Will I need to upgrade CKEditor 5 if I use the LTS Edition?

No major upgrades are required for 3 years, unless you choose to adopt a newer version earlier.

We do recommend installing patch releases within the LTS line, as they may include stability improvements or security fixes. These updates never introduce breaking changes. They are safe and easy to adopt.

### Can I switch from a regular release to the LTS Edition later?

Yes. You can switch to the LTS Edition at any time, though adopting it early maximizes your stability window.

### Can I switch from the LTS Edition to a regular release?

Yes. You can switch to a regular release whenever you want (for example, to access a new feature). Once the next LTS release is published, you can return to the LTS line.

Remember that while on a regular release, you lose the additional warranties offered by the LTS Edition.

### What happens after the 3-year LTS support period ends?

You can either upgrade to the next LTS release or move to the latest regular release.

To ensure a seamless transition, each LTS release overlaps with the next for a period of one year.

### I need additional custom guarantees or services. What should I do?

CKEditor offers enterprise-grade services, including <abbr title="Service Level Agreement">SLAs</abbr>, custom development, and dedicated support.

[Contact our sales team](https://ckeditor.com/contact-sales/) to discuss your needs.

<style>
	.lts-compat-matrix thead th {
		text-align: center;
	}
	.lts-compat-matrix tbody th {
		text-align: left;
		font-weight: var(--font-weight-regular);
		width: 15%
	}
	.lts-compat-matrix td {
		text-align: left;
	}
</style>
