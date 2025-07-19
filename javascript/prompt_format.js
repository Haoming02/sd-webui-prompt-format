class LeFormatter {
	static #aliasData = null;
	static #cardsData = null;

	static forceReload() {
		this.#aliasData = null;
		this.#cardsData = null;
	}

	/** @returns {{RegExp: string}} */
	static get #alias() {
		return (this.#aliasData ??= pfConfigs.getTagAlias());
	}

	/** @returns {string[]} */
	static get #cards() {
		return (this.#cardsData ??= pfConfigs.cacheCards());
	}

	/**
	 * @param {HTMLTextAreaElement} textArea
	 * @param {boolean} dedupe
	 * @param {boolean} rmUnderscore
	 * @param {boolean} autoRefresh
	 * @param {boolean} appendComma
	 */
	static formatPipeline(textArea, dedupe, rmUnderscore, autoRefresh, appendComma) {
		const lines = textArea.value.split("\n");

		for (let i = 0; i < lines.length; i++)
			lines[i] = this.formatString(lines[i], dedupe, rmUnderscore);

		if (!appendComma) textArea.value = lines.join("\n");
		else {
			const val = lines.join(",\n");
			textArea.value = val
				.replace(/\n,\n/g, "\n\n")
				.replace(/\s*,\s*$/g, "")
				.replace(/\s*,\s*$/g, "");
		}

		if (autoRefresh) updateInput(textArea);
	}

	/** @param {string} input @returns {string} */
	static #toExpression(input) {
		return input
			.replace(/[,\n^]\s*> <\s*[,\n$]/g, ", $SHY$,")
			.replace(/[,\n^]\s*:3\s*[,\n$]/g, ", $CAT$,");
	}

	/** @param {string} input @returns {string} */
	static #fromExpression(input) {
		return input
			.replace("$SHY$", "> <")
			.replace("$CAT$", ":3");
	}

	/** @type {Map<string, string>} */
	static #networkDB = new Map();

	/** @param {string} input @returns {string} */
	static #toNetwork(input) {
		this.#networkDB.clear();

		const output = input.replace(/\s*<.+?>\s*/g, (match) => {
			const UID = `@NET${this.#networkDB.size}WORK@`;
			this.#networkDB.set(UID, match.trim());
			return UID;
		});

		return output;
	}

	/** @param {string} input @returns {string} */
	static #fromNetwork(input) {
		const len = this.#networkDB.size;

		for (let i = 0; i < len; i++) {
			const UID = `@NET${i}WORK@`;
			input = input.replace(UID, this.#networkDB.get(UID));
		}

		return input;
	}

	/** @param {string} input @param {boolean} dedupe @param {boolean} rmUnderscore @returns {string} */
	static formatString(input, dedupe, rmUnderscore) {
		// Substitute LoRAs
		input = this.#toNetwork(input);

		// Remove Underscore
		input = rmUnderscore ? this.#rmUnderscore(input) : input;

		// Special Tags
		input = this.#toExpression(input);

		// Restore LoRAs
		input = this.#fromNetwork(input);

		// Fix Commas inside Brackets
		input = input
			.replace(/,+\s*\)/g, "),")
			.replace(/,+\s*\]/g, "],")
			.replace(/,+\s*\>/g, ">,")
			.replace(/,+\s*\}/g, "},")
			.replace(/\(\s*,+/g, ",(")
			.replace(/\[\s*,+/g, ",[")
			.replace(/\<\s*,+/g, ",<")
			.replace(/\{\s*,+/g, ",{");

		// Fix Bracket & Space
		input = input
			.replace(/\s+\)/g, ")")
			.replace(/\s+\]/g, "]")
			.replace(/\s+\>/g, ">")
			.replace(/\s+\}/g, "}")
			.replace(/\(\s+/g, "(")
			.replace(/\[\s+/g, "[")
			.replace(/\<\s+/g, "<")
			.replace(/\{\s+/g, "{");

		// Remove Space around Syntax
		input = input.replace(/\s*\|\s*/g, "|").replace(/\s*\:\s*/g, ":");

		// Sentence -> Tags
		let tags = input.split(",").map((word) => word.trim());

		// Remove Duplicate
		tags = dedupe ? this.#dedupe(tags) : tags;

		// Remove extra Spaces
		input = tags.join(", ").replace(/\s+/g, " ");

		// Remove Empty Brackets
		while (/\(\s*\)|\[\s*\]/.test(input))
			input = input.replace(/\(\s*\)|\[\s*\]/g, "");

		// Space after Comma in Escaped Brackets (for franchise)
		input = input.replace(/\\\(([^\\\)]+?):([^\\\)]+?)\\\)/g, "\\($1: $2\\)");

		// Prune empty Chunks
		input = input.split(",").map((word) => word.trim()).filter((word) => word).join(", ");

		// LoRA Block Weights
		input = input.replace(/<.+?>/g, (match) => {
			return match.replace(/\,\s+/g, ",");
		});

		// Remove empty before Colon
		input = input.replace(/,\s*:(\d)/g, ":$1");

		input = this.#fromExpression(input);

		return input;
	}

	/** @param {string[]} input @returns {string[]} */
	static #dedupe(input) {
		const KEYWORD = /^(AND|BREAK)$/;
		const uniqueSet = new Set();
		const results = [];

		for (const tag of input) {
			const cleanedTag = tag.replace(/\[|\]|\(|\)/g, "").replace(/\s+/g, " ").trim();

			if (KEYWORD.test(cleanedTag)) {
				results.push(tag);
				continue;
			}

			if (!isNaN(cleanedTag)) {
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

			if (substitute == null && !uniqueSet.has(cleanedTag)) {
				uniqueSet.add(cleanedTag);
				results.push(tag);
				continue;
			}

			if (substitute != null && !uniqueSet.has(substitute)) {
				uniqueSet.add(substitute);
				results.push(tag.replace(cleanedTag, substitute));
				continue;
			}

			results.push(tag.replace(cleanedTag, ""));
		}

		return results;
	}

	/** @param {string} input @returns {string} */
	static #rmUnderscore(input) {
		if (!input.trim()) return "";

		for (let i = 0; i < this.#cards.length; i++)
			input = input.replaceAll(this.#cards[i], `@TEXTUAL${i}INVERSION@`);

		input = input.replaceAll("_", " ");

		for (let i = 0; i < this.#cards.length; i++)
			input = input.replaceAll(`@TEXTUAL${i}INVERSION@`, this.#cards[i]);

		return input;
	}
}

(function () {
	onUiLoaded(() => {
		const config = new pfConfigs();
		const formatter = pfUI.setupUIs(config.autoRun, config.dedupe, config.rmUnderscore);

		document.addEventListener("keydown", (e) => {
			if (e.altKey && e.shiftKey && e.code === "KeyF") {
				e.preventDefault();
				for (const field of config.promptFields)
					LeFormatter.formatPipeline(
						field,
						config.dedupe,
						config.rmUnderscore,
						config.refresh,
						config.comma,
					);
			}
		});

		formatter.auto.addEventListener("change", () => {
			config.autoRun = formatter.auto.checked;
			formatter.manual.style.display = config.autoRun ? "none" : "flex";
		});

		formatter.dedupe.addEventListener("change", () => {
			config.dedupe = formatter.dedupe.checked;
		});

		formatter.underscore.addEventListener("change", () => {
			config.rmUnderscore = formatter.underscore.checked;
			formatter.refresh.style.display = config.rmUnderscore ? "flex" : "none";
		});

		formatter.manual.addEventListener("click", () => {
			for (const field of config.promptFields)
				LeFormatter.formatPipeline(
					field,
					config.dedupe,
					config.rmUnderscore,
					config.refresh,
					config.comma,
				);
		});

		formatter.refresh.addEventListener("click", () => {
			LeFormatter.forceReload();
		});

		const tools = document.getElementById("quicksettings");
		tools.after(formatter);

		/** Expandable List of IDs in 1 place */
		const IDs = [
			"txt2img_generate",
			"txt2img_enqueue",
			"img2img_generate",
			"img2img_enqueue",
		];

		for (const id of IDs) {
			const button = document.getElementById(id);
			button?.addEventListener("click", () => {
				if (!config.autoRun) return;
				for (const field of config.promptFields)
					LeFormatter.formatPipeline(
						field,
						config.dedupe,
						config.rmUnderscore,
						config.refresh,
						config.comma,
					);
			});
		}

		if (!config.paste) return;

		/** https://github.com/AUTOMATIC1111/stable-diffusion-webui/blob/v1.10.1/modules/infotext_utils.py#L16 */
		const paramPatterns =
			/\s*(\w[\w \-/]+):\s*("(?:\\.|[^\\"])+"|[^,]*)(?:,|$)/g;

		for (const field of config.promptFields) {
			field.addEventListener("paste", (event) => {
				/** @type {string} */ let paste = (event.clipboardData || window.clipboardData).getData("text");
				if ([...paste.matchAll(paramPatterns)].length > 3) return; // Infotext

				event.preventDefault();

				const commaStart = paste.match(/^\s*\,/);
				const commaEnd = paste.match(/\,\s*$/);

				const multiline = !paste.includes(",");

				if (config.booru) {
					paste = paste.replace(/\s*[\d.]+[kM]\s*|(?:^|,|\s+)\d+(?:\s+|,|\?|$)|[\?\+\-]\s+/g, ", ");
					for (const excl of ["Artist", "Characters", "Character", "Copyright", "Tags", "Tag", "General"])
						paste = paste.replace(excl, "");

					const name_franchise = /\w+?[\_\s]\(.*?\)/g;
					paste = paste.replace(name_franchise, (match) => {
						return match.replace(/[()]/g, "\\$&");
					});
				}

				if (multiline) {
					const lines = [];
					for (const line of paste.split("\n"))
						lines.push(LeFormatter.formatString(line, config.dedupe, config.rmUnderscore));
					paste = lines.filter((l) => l).join("\n");
					if (!paste.includes(",")) paste = paste.replaceAll("\n", ", ");
				} else
					paste = LeFormatter.formatString(paste, config.dedupe, config.rmUnderscore);

				paste = `${commaStart ? ", " : ""}${paste}${commaEnd ? ", " : ""}`;

				const currentText = field.value;
				const cursorPosition = field.selectionStart;

				const newText = currentText.slice(0, cursorPosition) + paste + currentText.slice(field.selectionEnd);
				field.value = newText;
				field.selectionStart = field.selectionEnd = cursorPosition + paste.length;

				updateInput(field);
				return false;
			});
		}
	});
})();
