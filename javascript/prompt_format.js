class LeFormatter {

	static manualButton(text, id, { onClick }) {
		const button = gradioApp().getElementById(id).cloneNode()

		button.id = 'manual-format'
		button.classList.remove('gr-button-lg', 'gr-button-primary', 'lg', 'primary')
		button.classList.add('secondary')
		button.textContent = text
		button.addEventListener('click', onClick)

		return button
	}

	static injectButton(id, { onClick }) {
		const button = gradioApp().getElementById(id)
		button.addEventListener('click', onClick)
	}

	static checkbox(text, def, { onChange }) {
		const label = document.createElement('label')
		label.style.display = 'flex'
		label.style.alignItems = 'center'
		label.style.margin = '2px 8px'

		const checkbox = gradioApp().querySelector('input[type=checkbox]').cloneNode()
		checkbox.checked = def
		checkbox.addEventListener('change', (event) => {
			onChange(event.target.checked)
		})

		const span = document.createElement('span')
		span.style.marginLeft = 'var(--size-2, 4px)'
		span.textContent = text

		label.appendChild(checkbox)
		label.appendChild(span)

		return label
	}

	static formatString(input, dedupe, removeUnderscore) {
		// Fix Bracket & Comma
		input = input.replace(/,\s*\)/g, '),').replace(/,\s*\]/g, '],').replace(/\(\s*,/g, ',(').replace(/\[\s*,/g, ',[')

		// Remove Commas
		let tags = input.split(',').map(word => (removeUnderscore ? word.replace(/_/g, ' ') : word).trim()).filter(word => word !== '')

		// Remove Stray Brackets
		const patterns = [/^\(+$/, /^\)+$/, /^\[+$/, /^\]+$/];
		tags = tags.filter(word => !patterns[0].test(word)).filter(word => !patterns[1].test(word)).filter(word => !patterns[2].test(word)).filter(word => !patterns[3].test(word))

		// Remove Duplicate
		input = dedupe ? [...new Set(tags)].join(', ') : tags.join(', ')

		// Remove Spaces
		input = input.replace(/\s+/g, ' ')

		// Fix Bracket & Space
		input = input.replace(/\s+\)/g, ')').replace(/\s+\]/g, ']').replace(/\(\s+/g, '(').replace(/\[\s+/g, '[')

		// Fix Empty Bracket
		input = input.replace(/\(\s+\)/g, '').replace(/\[\s+\]/g, '')

		while (input.includes('()'))
			input = input.replace(/\(\s*\)/g, '')
		while (input.includes('[]'))
			input = input.replace(/\[\s*\]/g, '')

		return input.trim()
	}

	static grabBrackets(str, index) {
		let openBracket = -1
		let closeBracket = -1

		for (let i = index; i >= 0; i--) {
			if (str[i] === '(') {
				openBracket = i
				break;
			}
			if (str[i] === ')' && i !== index) {
				break;
			}
		}

		for (let i = index; i < str.length; i++) {
			if (str[i] === ')') {
				closeBracket = i
				break;
			}
			if (str[i] === '(' && i !== index) {
				break;
			}
		}

		if (openBracket !== -1 && closeBracket !== -1 && openBracket !== closeBracket)
			return [openBracket, closeBracket]
		else
			return null
	}

	static injectBracketEscape(id) {
		const textarea = gradioApp().getElementById(id).querySelector('textarea')

		textarea.addEventListener('keydown', (event) => {
			if (event.ctrlKey && event.key === '\\') {
				event.preventDefault()

				let cursorPosition = textarea.selectionStart

				if (textarea.selectionStart !== textarea.selectionEnd)
					cursorPosition++

				let result = LeFormatter.grabBrackets(textarea.value, cursorPosition)

				if (result) {
					const original = textarea.value

					if (result[0] !== 0 && textarea.value[result[0] - 1] === '\\' && textarea.value[result[1] - 1] === '\\') {
						textarea.value = original.slice(0, result[0] - 1) + original.slice(result[0] - 1, result[1]).replace(/\\/g, '') + original.slice(result[1])
						textarea.selectionStart = result[0] - 1
						textarea.selectionEnd = result[1] - 1
					}
					else {
						textarea.value = original.slice(0, result[0]) + '\\' + original.slice(result[0], result[1]) + '\\' + original.slice(result[1])
						textarea.selectionStart = result[0]
						textarea.selectionEnd = result[1] + 3
					}

					updateInput(textarea)
				}
			}
		})
	}

} 

onUiLoaded(async () => {
	const Modes = ['txt', 'img']

	let autoRun = true
	let dedupe = false
	let removeUnderscore = false

	const manualBtn = LeFormatter.manualButton('Format', 'txt2img_generate', {
		onClick: () => {
			const ids = ['txt2img_prompt', 'txt2img_neg_prompt', 'img2img_prompt', 'img2img_neg_prompt']

			ids.forEach((id) => {
				const textArea = gradioApp().getElementById(id).querySelector('textarea')

				let lines = textArea.value.split('\n')

				for (let i = 0; i < lines.length; i++)
					lines[i] = LeFormatter.formatString(lines[i], dedupe, removeUnderscore)

				textArea.value = lines.join('\n')
				updateInput(textArea)
			})
		}
	})

	const autoCB = LeFormatter.checkbox('Auto Format', autoRun, {
		onChange: (checked) => {
			autoRun = checked
			manualBtn.style.display = autoRun ? 'none' : 'block'
		}
	})

	manualBtn.style.display = 'none'

	const dedupeCB = LeFormatter.checkbox('Remove Duplicates', dedupe, {
		onChange: (checked) => { dedupe = checked }
	})

	const underlineCB = LeFormatter.checkbox('Remove Underscores', removeUnderscore, {
		onChange: (checked) => { removeUnderscore = checked }
	})

	const formatter = document.createElement('div')
	formatter.id = 'le-formatter'
	formatter.style.display = 'flex'
	formatter.style.flex.direction = 'row'

	formatter.appendChild(autoCB)
	formatter.appendChild(manualBtn)
	formatter.appendChild(dedupeCB)
	formatter.appendChild(underlineCB)

	const tools = document.getElementById('quicksettings')
	tools.after(formatter)

	Modes.forEach((mode) => {

		LeFormatter.injectButton(mode + '2img_generate', {
			onClick: () => {
				if (!autoRun)
					return;

				const ids = [mode + '2img_prompt', mode + '2img_neg_prompt']
				const textAreas = [gradioApp().getElementById(ids[0]).querySelector('textarea'), gradioApp().getElementById(ids[1]).querySelector('textarea')]

				let lines = [textAreas[0].value.split('\n'), textAreas[1].value.split('\n')]

				for (let m = 0; m < 2; m++) {

					for (let i = 0; i < lines[m].length; i++)
						lines[m][i] = LeFormatter.formatString(lines[m][i], dedupe, removeUnderscore)

					textAreas[m].value = lines[m].join('\n')
				}
			}
		})

		LeFormatter.injectBracketEscape(mode + '2img_prompt')
		LeFormatter.injectBracketEscape(mode + '2img_neg_prompt')

	})
})