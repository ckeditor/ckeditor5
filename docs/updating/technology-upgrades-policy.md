---
menu-title: Technology upgrades policy
meta-title: Policy for technology upgrades | CKEditor 5 Documentation
meta-description: How and when CKEditor 5 is upgrading the core technologies that it is built upon.
category: updating
order: 50
modified_at: 2025-12-11
---

# Technology upgrades policy

This document describes how CKEditor&nbsp;5 handles upgrades of its core technologies. The goal is to provide a stable, predictable upgrade path for everyone who builds with CKEditor&nbsp;5 or contributes to it.

It covers the following technical areas:

* JavaScript and CSS (browser support),
* TypeScript,
* Node.js,
* Framework integrations (Vue, Angular, React).

## Our primary goal

Adopt the established best practices of each technology's community, instead of inventing our own rules. We believe that aligning with well-known standards makes the development process more transparent and easier for plugin authors and for projects that consume CKEditor&nbsp;5.

## Why this policy exists

This policy will help you:

* Understand when CKEditor&nbsp;5 introduces breaking changes,
* Prepare your plugins and applications for major upgrades,
* Avoid guessing which Node.js, TypeScript, or browser versions you should support,
* Follow stable patterns instead of learning each change in isolation.

## Upgrade frequency and release cadence

* CKEditor&nbsp;5 updates its technology baselines **only in major releases**.  
* Minor and patch releases do not introduce breaking changes related to tooling or browser support.  
* This predictable cycle lets the developers plan ahead and avoid unexpected breakages.

## What this means for plugin authors and applications

When you upgrade to a new major version of CKEditor&nbsp;5:

* Check the updated minimum version of TypeScript,
* If you use our tooling or forked one of our repositories, check the updated minimum version of Node,
* Review browser support changes,
* Update framework integrations to supported versions,
* Follow the corresponding migration guide for detailed instructions.

## Detailed rules

### Impact matrix

The table below summarizes how technology-baseline updates affect three key groups: end-users of the editor, projects consuming CKEditor&nbsp;5, and plugin authors.

| Area | End-users of the editor | Projects consuming CKEditor&nbsp;5 | Plugin authors |
|------|--------------------------|-------------------------------|----------------|
| **JavaScript and CSS (Browser Support)** |Yes|Yes|Yes|
| **TypeScript** |No|Yes|Yes|
| **Node.js** |No|No|Yes|
| **Framework integrations (Vue, Angular, React)** |  No | Yes | No |

### JavaScript and CSS (Browser Support)

**Approach:** Once a year, we will update the build target to align with the "Widely available" category defined by the [Baseline web](https://web.dev/baseline) platform standard.

**Reasoning:** Driven by major browser vendors like Google and Mozilla, Baseline provides a clear definition of web features that are mature and safe to use. The “Widely available” category, which we will target, includes features stable across all major browsers for at least 30 months. This approach allows us to balance progress with stability, ensuring CKEditor&nbsp;5 works for the vast majority of users while leveraging modern web platform features. Its status as a reliable standard is reinforced by growing support from developer tools like [MDN](https://developer.mozilla.org/en-US/blog/baseline-unified-view-stable-web-features/), [caniuse](https://caniuse.com/proxy), [Vite](https://vite.dev/blog/announcing-vite7), [ESLint](https://web.dev/blog/eslint-baseline-integration), and [Angular](https://angular.dev/reference/versions#browser-support).

<info-box important>
	It is important to clarify that setting the build target to Baseline's "Widely available" does not mean we guarantee compatibility with every browser that technically falls within that window.

	Our primary goal is to provide a robust and modern editing experience. If a conflict arises between modern browser behavior and a bug in an older browser (for example, related to complex features like selection handling), we will prioritize ensuring correct functionality in modern browsers.
</info-box>

### TypeScript

**Approach:** We will follow the [DefinitelyTyped support window](https://github.com/DefinitelyTyped/DefinitelyTyped?tab=readme-ov-file#support-window). This means the minimum supported TypeScript version will be the oldest version that is less than 2 years old, updated approximately every 6 months.

**Reasoning:** DefinitelyTyped is the de facto standard for TypeScript' `(@types/... packages)` type definitions in the entire JavaScript ecosystem. Virtually every typed project relies on it, including CKEditor&nbsp;5. By mirroring their support policy, we ensure maximum compatibility and interoperability.

### Node.js

**Approach:** We will update the development environment to the [latest Active Long-Term Support (LTS) version of Node.js](https://nodejs.org/en/about/previous-releases) approximately every 6 months. We may update more often if Node releases critical security fixes that impact development or CI environments.

**Reasoning:** The Node.js community recommends using either Active LTS or Maintenance LTS for production environments. We chose Active LTS because it provides high stability and security of an LTS release while giving us access to more modern features than versions in the older Maintenance LTS phase.

### Framework integrations (Vue, Angular, React)

**Approach:** We will support all officially supported and actively maintained versions of each integration framework. If a library does not publish a clear support window, we will base our decision on usage data, such as community adoption trends and download statistics.

**Reasoning:** Our goal is to ensure that CKEditor&nbsp;5 integrations are compatible with the versions that most developers use without stretching our resources to maintain legacy frameworks that are no longer relevant or safe. This strikes a balance between stability and staying current with modern development practices.