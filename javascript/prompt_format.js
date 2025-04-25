class LeFormatter {

	static #cachedCardsInternal = null;
	static #aliasInternal = null;

	static forceReload() {
		this.#cachedCardsInternal = null;
		this.#aliasInternal = null;
	}

	/** @returns {string[]} */
	static get #cachedCards() {
		if (this.#cachedCardsInternal == null)
			this.#cachedCardsInternal = pfConfigs.cacheCards();

		return this.#cachedCardsInternal;
	}

	/** @returns {Map<RegExp, string>} */
	static get #alias() {
		if (this.#aliasInternal == null)
			this.#aliasInternal = pfConfigs.getTagAlias();

		return this.#aliasInternal;
	}

	/**
	 * @param {HTMLTextAreaElement} textArea
	 * @param {boolean} dedupe
	 * @param {boolean} removeUnderscore
	 * @param {boolean} autoRefresh
	 * @param {boolean} appendComma
	 */
	static formatPipeline(textArea, dedupe, removeUnderscore, autoRefresh, appendComma) {
		const lines = textArea.value.split('\n');

		for (let i = 0; i < lines.length; i++)
			lines[i] = this.formatString(lines[i], dedupe, removeUnderscore);

		if (!appendComma)
			textArea.value = lines.join('\n');
		else {
			const val = lines.join(',\n');
			textArea.value = val.replace(/\n,\n/g, '\n\n');
		}

		if (autoRefresh)
			updateInput(textArea);
	}

	/** @param {string[]} tags @returns {string[]} */
	static #joinExtraNet(tags) {
		let isNet = false;
		let i = 0;

		while (i < tags.length) {
			if (!isNet) {
				if (tags[i].startsWith('<'))
					isNet = true;
				i++;
			}
			else {
				isNet = !tags[i].endsWith('>');
				tags[i - 1] = `${tags[i - 1]}, ${tags.splice(i, 1)[0]}`;
			}
		}

		return tags;
	}

	/** @param {string} input @returns {string} */
	static #toExpression(input) {
		return input
			.replace(/[,\n]\s*> <\s*[,\n]/g, ", $SHY$,")
			.replace(/[,\n]\s*:3\s*[,\n]/g, ", $CAT$,");
	}

	/** @param {string} input @returns {string} */
	static #fromExpression(input) {
		return input
			.replace("$SHY$", "> <")
			.replace("$CAT$", ":3");
	}

	/** @param {string} input @param {boolean} dedupe @param {boolean} removeUnderscore @returns {string} */
	static formatString(input, dedupe, removeUnderscore) {

		// Remove Underscore
		input = removeUnderscore ? this.#removeUnderscore(input) : input;

		// Special Tags
		input = this.#toExpression(input);

		// Fix Commas inside Brackets
		input = input
			.replace(/,+\s*\)/g, '),')
			.replace(/,+\s*\]/g, '],')
			.replace(/,+\s*\>/g, '>,')
			.replace(/,+\s*\}/g, '},')
			.replace(/\(\s*,+/g, ',(')
			.replace(/\[\s*,+/g, ',[')
			.replace(/\<\s*,+/g, ',<')
			.replace(/\{\s*,+/g, ',{');

		// Fix Bracket & Space
		input = input
			.replace(/\s+\)/g, ')')
			.replace(/\s+\]/g, ']')
			.replace(/\s+\>/g, '>')
			.replace(/\s+\}/g, '}')
			.replace(/\(\s+/g, '(')
			.replace(/\[\s+/g, '[')
			.replace(/\<\s+/g, '<')
			.replace(/\{\s+/g, '{');

		// Remove Space around Syntax
		input = input
			.replace(/\s*\|\s*/g, '|')
			.replace(/\s*\:\s*/g, ':');

		// Sentence -> Tags
		let tags = input.split(',').map(word => word.trim());

		// ["<lora:name:weight:lbw=1", "2", "3>"] -> ["<lora:name:weight:lbw=1,2,3>"]
		tags = this.#joinExtraNet(tags);

		// Remove Duplicate
		tags = dedupe ? this.#dedupe(tags) : tags;

		// Remove extra Spaces
		input = tags.join(', ').replace(/\s+/g, ' ');

		// Remove Empty Brackets
		while (/\(\s*\)|\[\s*\]/.test(input))
			input = input.replace(/\(\s*\)|\[\s*\]/g, '');

		// Space after Comma in Escaped Brackets (for franchise)
		input = input.replace(/\\\(([^\\\)]+?):([^\\\)]+?)\\\)/g, '\\($1: $2\\)');
		// Prune empty Chunks
		input = input.split(',').map(word => word.trim()).filter(word => word).join(', ')
		// LoRA Block Weights
		input = input.replace(/\<[^\>]+\>/g, (match) => {
			return match.replace(/\,\s+/g, ',');
		});
		// Remove empty before Colon
		input = input.replace(/\,\s*\:(\d)/g, ':$1');

		input = this.#fromExpression(input);

		return input;
	}

	/** @param {string[]} input @returns {string[]} */
	static #dedupe(input) {
		const KEYWORD = /^(AND|BREAK)$/;
		const uniqueSet = new Set();
		const results = [];

		for (const tag of input) {
			const cleanedTag = tag.replace(/\[|\]|\(|\)/g, '').replace(/\s+/g, ' ').trim();

			if (KEYWORD.test(cleanedTag)) {
				results.push(tag);
				continue;
			}

			let substitute = null;
			for (const [pattern, mainTag] of this.#alias) {
				if (pattern.test(cleanedTag)) {
					substitute = mainTag;
					break;
				}
			}

			if ((substitute == null) && (!uniqueSet.has(cleanedTag))) {
				uniqueSet.add(cleanedTag);
				results.push(tag);
				continue;
			}

			if ((substitute != null) && (!uniqueSet.has(substitute))) {
				uniqueSet.add(substitute);
				results.push(tag.replace(cleanedTag, substitute));
				continue;
			}

			results.push(tag.replace(cleanedTag, ''));
		}

		return results;
	}

	/** @param {string} input @returns {string} */
	static #removeUnderscore(input) {
		if (!input.trim())
			return "";

		const syntax = /\,\|\:\<\>\(\)\[\]\{\}/;
		const pattern = new RegExp(`([${syntax.source}]+|[^${syntax.source}]+)`, 'g');
		const parts = input.match(pattern);

		const processed = parts.map((part) => {
			if (new RegExp(`[${syntax.source}]+`).test(part))
				return part;
			if (/^\s+$/.test(part))
				return part;

			if (!this.#cachedCards.includes(part.trim()))
				part = part.replaceAll('_', ' ');

			return part;
		});

		return processed.join('');
	}
}

(function () {
	onUiLoaded(() => {

		const config = new pfConfigs();
		const formatter = pfUI.setupUIs(config.autoRun, config.dedupe, config.removeUnderscore);

		document.addEventListener('keydown', (e) => {
			if (e.altKey && e.shiftKey && e.code === 'KeyF') {
				e.preventDefault();
				for (const field of config.promptFields)
					LeFormatter.formatPipeline(field, config.dedupe, config.removeUnderscore, true, config.comma);
			}
		});

		formatter.auto.addEventListener("change", () => {
			config.autoRun = formatter.auto.checked;
			formatter.manual.style.display = config.autoRun ? 'none' : 'flex';
		});

		formatter.dedupe.addEventListener("change", () => {
			config.dedupe = formatter.dedupe.checked;
		});

		formatter.underscore.addEventListener("change", () => {
			config.removeUnderscore = formatter.underscore.checked;
			formatter.refresh.style.display = config.removeUnderscore ? 'flex' : 'none';
		});

		formatter.manual.addEventListener("click", () => {
			for (const field of config.promptFields)
				LeFormatter.formatPipeline(field, config.dedupe, config.removeUnderscore, config.refresh, config.comma);
		});

		formatter.refresh.addEventListener("click", () => {
			LeFormatter.forceReload();
		});

		const tools = document.getElementById('quicksettings');
		tools.after(formatter);

		/** Expandable List of IDs in 1 place */
		const IDs = [
			'txt2img_generate',
			'txt2img_enqueue',
			'img2img_generate',
			'img2img_enqueue'
		];

		for (const id of IDs) {
			const button = document.getElementById(id);
			button?.addEventListener('click', () => {
				if (config.autoRun) {
					for (const field of config.promptFields)
						LeFormatter.formatPipeline(field, config.dedupe, config.removeUnderscore, config.refresh, config.comma);
				}
			});
		}

		if (!config.paste)
			return;

		/** https://github.com/AUTOMATIC1111/stable-diffusion-webui/blob/v1.10.1/modules/infotext_utils.py#L16 */
		const paramPatterns = /\s*(\w[\w \-/]+):\s*("(?:\\.|[^\\"])+"|[^,]*)(?:,|$)/g;

		for (const field of config.promptFields) {
			field.addEventListener('paste', (event) => {
				let paste = (event.clipboardData || window.clipboardData).getData('text');
				if ([...paste.matchAll(paramPatterns)].length > 3)
					return;  // Infotext

				event.preventDefault();

				const commaStart = paste.match(/^\s*\,/);
				const commaEnd = paste.match(/\,\s*$/);

				if (config.booru) {
					paste = paste.replace(/\s*[\d.]+[kM]\s*|\s*[\d]{3,}\s*|[\?\+\-]\s+/g, ", ");
					for (const excl of ["Artist", "Characters", "Character", "Copyright", "Tags", "Tag", "General"])
						paste = paste.replace(excl, "");

					const name_franchise = /\w+?[\_\s]\(.*?\)/g;
					paste = paste.replace(name_franchise, (match) => {
						return match.replace(/[()]/g, '\\$&');
					});
				}

				paste = LeFormatter.formatString(paste, config.dedupe, config.removeUnderscore);
				paste = `${commaStart ? ", " : ""}${paste}${commaEnd ? ", " : ""}`

				const currentText = field.value;
				const cursorPosition = field.selectionStart;

				const newText = currentText.slice(0, cursorPosition) + paste + currentText.slice(field.selectionEnd);
				field.value = newText;
				field.selectionStart = field.selectionEnd = cursorPosition + paste.length;

				updateInput(field);
			});
		}

	});
})();
