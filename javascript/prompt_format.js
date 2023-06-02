class LeFormatter {

	static injectButton(id, { onClick }) {
		const button = gradioApp().getElementById(id)
		button.addEventListener('click', onClick)
	}

	static checkbox(text, { onChange }) {
		const label = document.createElement('label')
		label.style.display = 'flex'
		label.style.alignItems = 'center'
		label.style.margin = '2px 8px'

		const checkbox = gradioApp().querySelector('input[type=checkbox]').cloneNode()
		checkbox.checked = false
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

}

function injectBracketEscape(id) {
	const textarea = gradioApp().getElementById(id).querySelector('textarea')

	textarea.addEventListener('keydown', (event) => {
		if (event.ctrlKey && event.key === '\\') {
			event.preventDefault()

			let cursorPosition = textarea.selectionStart;

			if (textarea.selectionStart !== textarea.selectionEnd)
				cursorPosition++

			let result = pf_GrabBrackets(textarea.value, cursorPosition)

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

function pf_GrabBrackets(str, index) {
	let openBracket = -1;
	let closeBracket = -1;

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
		return [openBracket, closeBracket];
	else
		return null
}

function fixBracketComma(input) {
	return input.replace(/,\)/g, '),').replace(/,\]/g, '],').replace(/\(,/g, ',(').replace(/\[,/g, ',[');
}

function fixBracketSpace(input) {
	return input.replace(/ \)/g, ')').replace(/ \]/g, ']').replace(/\( /g, '(').replace(/\[ /g, '[');
}

function fixBracketEmpty(input) {
	let temp = input.replace(/\(\s+\)/g, '').replace(/\[\s+\]/g, '')

	while (temp.includes('()'))
		temp = temp.replace(/\(\s*\)/g, '')
	while (temp.includes('[]'))
		temp = temp.replace(/\[\s*\]/g, '')
	return temp
}

function formatString(input, dedupe, deunderline) {
	const tags = fixBracketComma(input).split(',').map(word => (deunderline ? word.replace(/_/g, ' ').trim() : word.trim())).filter(word => word !== '');
	const sentence = dedupe ? [...new Set(tags)].join(', ') : tags.join(', ');
	return fixBracketEmpty(fixBracketSpace(sentence.replace(/\s+/g, ' ')).trim());
}

onUiLoaded(async () => {

	// SETTINGS
	const iterations = 1
	// SETTINGS

	let dedupe = false
	let deunderline = false

	const dedupeCB = LeFormatter.checkbox('Remove Duplicates', {
		onChange: (checked) => { dedupe = checked }
	})

	const underlineCB = LeFormatter.checkbox('Remove Underscores', {
		onChange: (checked) => { deunderline = checked }
	})

	const formatter = document.createElement('div')
	formatter.id = 'le-formatter'
	formatter.style.display = 'flex';
	formatter.style.flex.direction = 'row';

	formatter.appendChild(dedupeCB)
	formatter.appendChild(underlineCB)

	const tools = document.getElementById('quicksettings')
	tools.after(formatter)

	const Modes = ['txt', 'img']

	Modes.forEach((mode) => {

		LeFormatter.injectButton(mode + '2img_generate', {
			onClick: () => {
				const ids = [mode + '2img_prompt', mode + '2img_neg_prompt']
				const textAreas = [gradioApp().getElementById(ids[0]).querySelector('textarea'), gradioApp().getElementById(ids[1]).querySelector('textarea')]

				let lines = [textAreas[0].value.split('\n'), textAreas[1].value.split('\n')]

				for (let i = 0; i < lines[0].length; i++)
					for (let it = 0; it < iterations; it++)
						lines[0][i] = formatString(lines[0][i], dedupe, deunderline)

				for (let i = 0; i < lines[1].length; i++)
					for (let it = 0; it < iterations; it++)
						lines[1][i] = formatString(lines[1][i], dedupe, deunderline)


				textAreas[0].value = lines[0].join('\n')
				updateInput(textAreas[0])

				textAreas[1].value = lines[1].join('\n')
				updateInput(textAreas[1])
			}
		})

		injectBracketEscape(mode + '2img_prompt')
		injectBracketEscape(mode + '2img_neg_prompt')

	})
})