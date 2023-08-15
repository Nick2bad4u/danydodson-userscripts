// ==UserScript==
// @name         ChatGPT: DAN
// @namespace    https://github.com/danydodson/userscripts
// @updateURL    https://github.com/madkarmaa/automatic-chatgpt-dan/raw/master/script.user.js
// @downloadURL  https://github.com/madkarmaa/automatic-chatgpt-dan/raw/master/script.user.js
// @icon         https://raw.githubusercontent.com/madkarmaa/automatic-chatgpt-dan/master/images/icon.png
// @version      4.5.0
// @description  Remove filters and limitations from ChatGPT
// @author       mk_
// @match        *://chat.openai.com/*
// @require      https://code.jquery.com/jquery-3.6.4.min.js
// @require      https://raw.githubusercontent.com/moment/moment/develop/min/moment.min.js
// @grant        GM_info
// @grant        GM_addStyle
// ==/UserScript==

// @source          https://github.com/madkarmaa/automatic-chatgpt-dan
// @supportURL      https://github.com/madkarmaa/automatic-chatgpt-dan

(async () => {
	'use strict'

	// ---------- Init values ----------
	const mdFileUrl = 'https://raw.githubusercontent.com/0xk1h0/ChatGPT_DAN/main/README.md'
	const version = 'https://raw.githubusercontent.com/madkarmaa/automatic-chatgpt-dan/master/version.json'
	const updateURL = 'https://github.com/madkarmaa/automatic-chatgpt-dan/raw/master/script.user.js'
	const newIcon = 'https://raw.githubusercontent.com/madkarmaa/automatic-chatgpt-dan/master/images/page-favicon.png'
	const cacheExpireTime = 24 * 60 * 60 * 1000 // 24 hours
	const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent)
	var notifyUpdate = false
	var PROMPTS_LIST

	function changePageIcon(url) {
		var link = document.querySelectorAll("link[rel*='icon']")

		if (link.length > 0) {
			link.forEach((l) => {
				l.href = url
			})
		}
	}

	async function loadChatGptJs() {
		const chatgptJsUrls = {
			jsDelivr:
				'https://cdn.jsdelivr.net/gh/kudoai/chatgpt.js@bdc3e03cc0b1fbcfcc886022d5690880aa40442c/dist/chatgpt-1.7.6.min.js',
			github: 'https://raw.githubusercontent.com/kudoai/chatgpt.js/main/dist/chatgpt-1.7.6.min.js',
		}
		let resp

		resp = await fetch(chatgptJsUrls.jsDelivr)
		if (!resp.ok) resp = await fetch(chatgptJsUrls.github)

		const text = await resp.text()
		const chatgptJsScript = document.createElement('script')
		chatgptJsScript.textContent = text
		document.head.appendChild(chatgptJsScript)
	}

	const additionalMdFiles = [
		{
			author: 'RIllEX0',
			url: 'https://raw.githubusercontent.com/RIllEX0/ChatGPT_Bypass_Limit/main/README.md',
		},
		{
			author: 'marcelokula1',
			url: 'https://raw.githubusercontent.com/marcelokula1/ManyGpts/main/README.md',
		},
		{
			author: 'AbdullhHassan',
			url: 'https://raw.githubusercontent.com/AbdullhHassan/ChatGPT-Prompts/main/README.md',
		},
	]

	const CSS = `
:root {
--dark: #4d00ff;
--light: #b300fc;
}

.noselect {
-webkit-touch-callout: none !important;
-webkit-user-select: none !important;
-khtml-user-select: none !important;
-moz-user-select: none !important;
-ms-user-select: none !important;
user-select: none !important;
}

#dan-send-button {
background: linear-gradient(225deg, var(--dark), var(--light));
background-color: var(--light);
background-size: 200% 200%;
background-position: 0% 50%;
transition: background-position 0.2s ease-in-out;
display: flex;
justify-content: center;
align-items: center;
border: none;
}

#dan-send-button:hover {
background-position: 100% 50%;
background-color: var(--dark);
}

#dan-option-select {
-webkit-appearance: none;
-moz-appearance: none;
appearance: none;
background-image: none;
background-color: var(--gray-900, rgb(32, 33, 35));
cursor: help;
}

#dan-option-select:focus {
outline: none;
border-color: rgba(255, 255, 255, 0.2);
-webkit-box-shadow: none;
box-shadow: none;
}

#dan-notification-div {
position: fixed;
top: 10px;
right: 10px;
background: linear-gradient(135deg, var(--dark), var(--light));
background-color: var(--dark);
display: none;
min-height: 35px;
transition: all 1s;
padding: 5px 10px;
border: none;
border-radius: 0.375rem;
z-index: 39;
margin-left: 10px;
color: #fff;
}

#dan-menu {
width: 50%;
height: 75%;
color: white;
background-color: var(--gray-900, rgb(32, 33, 35));
position: absolute;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
margin: 0;
padding: 0;
z-index: 51;
}

#dan-menu-overlay {
position: absolute;
left: 0;
top: 0;
margin: 0;
padding: 0;
z-index: 50;
width: 100%;
height: 100%;
background-color: rgba(52, 53, 65, .9);
}

#toggle-custom-dan {
display: flex;
justify-content: space-between;
}

#dan-new-span {
pointer-events: none;
color: white;
animation: animateBg 1s linear infinite;
background-image: linear-gradient(90deg, var(--dark), var(--light), var(--dark), var(--light));
background-size: 300% 100%;
}

#exit-button {
position: absolute;
top: 0;
right: 0;
margin: 10px;
padding: 0;
height: fit-content;
width: fit-content;
}

#dan-suggest-link {
position: absolute;
bottom: 0;
right: 0;
margin: 10px;
padding: 0;
height: fit-content;
width: fit-content;
text-decoration: none;
font-size: 14px;
}

#dan-suggest-link:hover {
text-decoration: underline;
}

#filesContainer {
display: flex;
flex-direction: column;
margin: 10px;
gap: 15px;
}

#fileContainer {
display: flex;
flex-direction: row;
gap: 10px;
}

.round {
position: relative;
}

.round label {
background-color: #fff;
border: 1px solid #ccc;
border-radius: 50%;
cursor: pointer;
height: 28px;
left: 0;
position: absolute;
top: 0;
width: 28px;
}

.round label:after {
border: 2px solid #fff;
border-top: none;
border-right: none;
content: "";
height: 6px;
left: 7px;
opacity: 0;
position: absolute;
top: 8px;
transform: rotate(-45deg);
width: 12px;
}

.round input[type="checkbox"] {
visibility: hidden;
}

.round input[type="checkbox"]:checked + label {
background: linear-gradient(135deg, var(--dark), var(--light));
background-color: var(--light);
background-size: 200% 200%;
background-position: 0% 50%;
transition: background-position 0.2s ease-in-out;
border-color: var(--gray-900, rgb(32, 33, 35));
}

.round input[type="checkbox"]:checked + label:after {
opacity: 1;
}

.round input[type="checkbox"]:checked + label:hover {
background-position: 100% 50%;
background-color: var(--dark);
}

#additional-prompts:hover {
text-decoration: underline;
}

#files-header {
margin: 10px;
margin-right: 35px;
background: linear-gradient(135deg, var(--dark), var(--light));
background: -webkit-linear-gradient(135deg, var(--dark), var(--light));
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
padding: 0;
}

input.dan-checkbox[type="checkbox"] {
position: relative;
width: 45px;
height: 22.5px;
-webkit-appearance: none;
appearance: none;
background: #ccc;
outline: none;
border-radius: 2rem;
border: none;
cursor: pointer;
box-shadow: none;
}

input.dan-checkbox[type="checkbox"]::before {
content: "";
width: 22.5px;
height: 22.5px;
border-radius: 50%;
background: #fff;
position: absolute;
top: 0;
left: 0;
transition: 0.5s;
}

input.dan-checkbox[type="checkbox"]:checked::before {
transform: translateX(100%);
background: #fff;
}

input.dan-checkbox[type="checkbox"]:checked {
background: linear-gradient(225deg, var(--dark), var(--light));
background-color: var(--light);
}

@keyframes animateBg {
0% { background-position: 0% 0%; }
100% { background-position: 100% 0%; }
}

@-webkit-keyframes animateBg {
0% { background-position: 0% 0%; }
100% { background-position: 100% 0%; }
}

@media screen and (max-width: 800px) {
#dan-menu {
	width: 90%;
}
}
`

	// Initialize
	GM_addStyle(CSS)
	changePageIcon(newIcon)
	await loadChatGptJs()
	await chatgpt.isLoaded()

	// Function to parse the md file and get the required contents from it
	async function getGPTUnlockersWeb(mdFileUrl) {
		let text = await (await fetch(mdFileUrl)).text()
		let regexp = /<details(?: ?[^>]+)?>([\s\S]+?)<\/details>/gm
		let matches = [...text.matchAll(regexp)]

		let removeHTMLEntities = (str) => str.replace(/<\/?(?:blockquote|a)[^>]*>/gm, '')
		matches = matches.map((match) => match[1])
		matches = matches.map((match) => {
			let summary = match.match(/<summary(?: ?[^>]+)?>((?:.|\n)+?)<\/summary>/)[1]
			let details = match.replace(/<summary(?: ?[^>]+)?>((?:.|\n)+?)<\/summary>/, '')
			return {
				summary: removeHTMLEntities(summary),
				details: removeHTMLEntities(details),
			}
		})

		let firstLineFilter = ['by', 'from']

		matches = matches.map((match) => {
			return {
				summary: match.summary,
				details: match.details
					.split('\n')
					.map((line) => line.trim())
					.filter((line) => line.length)
					.join('\n'),
			}
		})

		matches = matches.map((match) => {
			return {
				summary: match.summary,
				details: match.details
					.split('\n')
					.map((line, i) => {
						if (i == 0) {
							if (firstLineFilter.some((x) => line.toLowerCase().startsWith(x))) {
								return null
							}
						}
						return line
					})
					.filter((x) => x)
					.join('\n'),
			}
		})

		return matches
	}

	// Function to check for script updates
	async function getVersion(versionUrl) {
		let ver = JSON.parse(await (await fetch(versionUrl)).text())
		return ver.version
	}

	// Function to load the data
	async function getData(storageKey, mdUrl) {
		let cachedMdFile, promptsData

		// Try to load the cached data
		cachedMdFile = JSON.parse(localStorage.getItem(storageKey))

		// Check if the prompts are already cached and less than 24h old
		if (cachedMdFile && Date.now() - cachedMdFile.timestamp < cacheExpireTime) {
			console.log('\x1b[32m' + GM_info.script.name + ': Using cached .md file' + '\x1b[0m')
			promptsData = cachedMdFile.prompts
		}

		// Else retrieve them from the internet and cache them
		else {
			console.log('\x1b[33m' + GM_info.script.name + ': Retrieving .md file' + '\x1b[0m')
			promptsData = await getGPTUnlockersWeb(mdUrl)

			localStorage.setItem(
				storageKey,

				JSON.stringify({
					prompts: promptsData,
					timestamp: Date.now(),
				})
			)
		}

		return promptsData
	}

	// Function to get the new version's commit message
	async function getLatestCommitMessage() {
		const url = 'https://api.github.com/repos/madkarmaa/automatic-chatgpt-dan/commits?path=script.user.js'

		try {
			const response = await fetch(url)
			const commits = await response.json()

			if (commits.length > 0) {
				const msg = commits[0].commit.message
				return msg.replace(/\n/g, '<br>')
			} else {
				return 'No commits found in the repository.'
			}
		} catch (error) {
			console.error('Error:', error.message)
			return 'An error occurred while fetching the commit message.'
		}
	}

	// Helper function to generate elements
	function createEl(tag, attrs) {
		const el = document.createElement(tag)
		Object.entries(attrs).forEach(([key, value]) => (el[key] = value))
		return el
	}

	// Function to check for a newer version of the script
	function isNewerVersion(version1, version2) {
		// version1 is the online version, version2 is the current version
		const v1 = version1.split('.').map(Number)
		const v2 = version2.split('.').map(Number)

		for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
			const num1 = v1[i] || 0
			const num2 = v2[i] || 0

			if (num1 < num2) {
				return false
			} else if (num1 > num2) {
				return true
			}
		}

		return false
	}

	// Function to check for avaiable updates
	async function checkForUpdates() {
		notifyUpdate = isNewerVersion(await getVersion(version), GM_info.script.version)
	}

	// Function to dynamically update the prompts display
	function updatePrompts() {
		// Clear all elements
		$(selectOption).empty()

		// Insert new elements
		for (let i = 0; i < PROMPTS_LIST.length; i++) {
			const prompt = PROMPTS_LIST[i]
			const option = document.createElement('option')
			option.title = prompt.summary
			option.value = prompt.details
			option.text = prompt.summary
			selectOption.add(option)
		}
	}

	// Function to update the script manually outside the userscript manager
	function update() {
		const win = window.open(updateURL, '_blank')

		function closeWindow() {
			win.close()
		}

		chatgpt.alert(
			`<span class="noselect" style="color: var(--light);">${GM_info.script.name}</span>`,
			'<div class="noselect">Close the empty window to apply changes</div>',
			closeWindow
		)

		const timer = setInterval(() => {
			if (win.closed) {
				clearInterval(timer)
				window.location.reload()
			}
		}, 10)
	}

	// Check for updates and parse the prompts
	await checkForUpdates()
	PROMPTS_LIST = await getData('gpt_prompts', mdFileUrl)

	// ---------- Create the UI elements ----------
	// The button that sends the message in the chat
	const pasteButton = createEl('button', {
		id: 'dan-send-button',
		title: 'Click to send the DAN message',
		style: 'margin: 2px 0; max-height: 44px;', // v-margins + cap height
		className: 'noselect',
	})

	// "NEW" span
	const newSpan = createEl('span', {
		id: 'dan-new-span',
		textContent: 'NEW',
		className: 'rounded-md px-1.5 py-0.5 text-xs font-medium uppercase', // bg-yellow-200 text-gray-800
	})

	// Create the SVG element
	const sendSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
	sendSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
	sendSvg.setAttribute('viewBox', '0 0 16 16')
	sendSvg.setAttribute('fill', 'none')
	sendSvg.setAttribute('class', 'h-4 w-4 m-1 md:m-0')
	sendSvg.setAttribute('stroke-width', '2')

	// Create the path element
	const sendSvgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
	sendSvgPath.setAttribute(
		'd',
		'M.5 1.163A1 1 0 0 1 1.97.28l12.868 6.837a1 1 0 0 1 0 1.766L1.969 15.72A1 1 0 0 1 .5 14.836V10.33a1 1 0 0 1 .816-.983L8.5 8 1.316 6.653A1 1 0 0 1 .5 5.67V1.163Z'
	)
	sendSvgPath.setAttribute('fill', 'white')

	// Append the SVG
	sendSvg.appendChild(sendSvgPath)
	pasteButton.appendChild(sendSvg)

	// The prompts selection
	const selectOption = createEl('select', {
		name: 'option-select',
		id: 'dan-option-select',
		title: 'Select a DAN prompt',
		style: 'margin: 2px 0; max-height: 44px;', // v-margins + cap height
		className: 'noselect',
	})

	// The last update notification element
	const lastUpdate = new Date(JSON.parse(localStorage.getItem('gpt_prompts')).timestamp)

	const notificationDiv = createEl('div', {
		id: 'dan-notification-div',
		textContent: 'The DAN prompts were last updated ' + moment(lastUpdate).fromNow(),
		className: 'noselect',
	})
	document.body.appendChild(notificationDiv)

	// ---------- Add the functionality to the UI elements ----------
	updatePrompts()

	// The send button
	$(pasteButton).on('click', function () {
		const selectedOptionValue = document.querySelector('#dan-option-select').value
		chatgpt.send(selectedOptionValue, 'click')
	})

	// Community prompts button
	const toggleDanMenu = createEl('div', {
		id: 'toggle-custom-dan',
		className: 'noselect',
		textContent: 'Community prompts',
		title: 'These prompts come from additional repositories.\nOpen an issue on my GitHub and suggest yours!',
		style: 'margin: 2px 0; max-height: 44px;', // v-margins + cap height
	})
	toggleDanMenu.appendChild(newSpan)

	// DAN prompts menu
	const danMenuOverlay = createEl('div', {
		id: 'dan-menu-overlay',
	})

	const danMenu = createEl('div', {
		id: 'dan-menu',
		className: 'rounded-md border border-white/20 noselect',
	})
	danMenuOverlay.style.display = 'none'
	danMenuOverlay.appendChild(danMenu)

	const exitButton = createEl('button', { id: 'exit-button' })
	const suggestLink = createEl('a', {
		id: 'dan-suggest-link',
		textContent: 'Suggest your prompts | Report issue',
		href: 'https://github.com/madkarmaa/automatic-chatgpt-dan/issues',
		target: '_blank',
	})
	const filesContainer = createEl('div', {
		id: 'filesContainer',
	})
	const header = createEl('h2', {
		textContent: 'Select additional prompts',
		id: 'files-header',
	})

	additionalMdFiles.forEach((fileData, idx) => {
		let checkID = 'dan-checkbox' + idx
		const storedValue = localStorage.getItem(checkID)
		let isChecked
		let promptsData

		if (storedValue !== null) {
			isChecked = JSON.parse(storedValue)
		} else {
			isChecked = false
		}

		const inp = createEl('input', {
			type: 'checkbox',
			id: checkID,
			className: 'dan-checkbox',
			checked: isChecked,
		})

		getData('prompts-' + checkID, fileData.url).then((data) => {
			promptsData = data

			if ($(inp).is(':checked')) {
				data.forEach((item) => {
					PROMPTS_LIST.push(item)
				})
				updatePrompts()
			}
		})

		const singleContainer = createEl('div', { id: 'fileContainer' })
		const text = createEl('a', {
			id: 'additional-prompts',
			textContent: fileData.author,
			href: 'https://github.com/' + fileData.author,
			title: 'https://github.com/' + fileData.author,
			target: '_blank',
		})

		$(inp).on('change', function () {
			var checked = $(this).is(':checked')
			localStorage.setItem(checkID, checked)

			if (checked) {
				promptsData.forEach((item) => {
					PROMPTS_LIST.push(item)
				})
				updatePrompts()
			} else {
				for (let i = 0; i < promptsData.length; i++) {
					for (let j = 0; j < PROMPTS_LIST.length; j++) {
						if (promptsData[i] == PROMPTS_LIST[j]) {
							PROMPTS_LIST.splice(j, 1)
						}
					}
				}
				updatePrompts()
			}
		})

		singleContainer.append(inp, text)
		filesContainer.appendChild(singleContainer)
	})

	const exitSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
	exitSvg.setAttribute('stroke', '#fff')
	exitSvg.setAttribute('fill', 'none')
	exitSvg.setAttribute('stroke-width', '2')
	exitSvg.setAttribute('viewBox', '0 0 24 24')
	exitSvg.setAttribute('stroke-linecap', 'round')
	exitSvg.setAttribute('stroke-linejoin', 'round')
	exitSvg.setAttribute('class', 'text-gray-900 dark:text-gray-200')
	exitSvg.setAttribute('height', '20')
	exitSvg.setAttribute('width', '20')

	const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
	line1.setAttribute('x1', '18')
	line1.setAttribute('y1', '6')
	line1.setAttribute('x2', '6')
	line1.setAttribute('y2', '18')

	const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
	line2.setAttribute('x1', '6')
	line2.setAttribute('y1', '6')
	line2.setAttribute('x2', '18')
	line2.setAttribute('y2', '18')

	exitSvg.appendChild(line1)
	exitSvg.appendChild(line2)
	exitButton.appendChild(exitSvg)

	danMenu.append(header, exitButton, suggestLink, filesContainer)
	document.body.appendChild(danMenuOverlay)

	toggleDanMenu.addEventListener('click', function () {
		if (danMenuOverlay.style.display === 'none') {
			$(danMenuOverlay).fadeIn(300)
		} else {
			$(danMenuOverlay).fadeOut(300)
		}
	})

	exitButton.addEventListener('click', function () {
		$(danMenuOverlay).fadeOut(300)
	})

	document.addEventListener('click', function (event) {
		if (!danMenu.contains(event.target) && event.target !== toggleDanMenu) {
			$(danMenuOverlay).fadeOut(300)
		}
	})

	// Add the elements to the page
	function addElementsToDOM() {
		const navBar = document.querySelector('nav[aria-label="Chat history"]') || {}

		for (var navLink of document.querySelectorAll('nav[aria-label="Chat history"] a')) {
			if (navLink.text.match(/.*chat/)) {
				toggleDanMenu.setAttribute('class', navLink.classList)
				selectOption.setAttribute('class', navLink.classList)
				pasteButton.setAttribute('class', navLink.classList)
				navLink.parentNode.style.margin = '2px 0' // add v-margins to ensure consistency across all inserted buttons
				break
			}
		}

		try {
			if (!navBar.contains(selectOption))
				try {
					navBar.insertBefore(selectOption, navBar.querySelector('a').parentNode)
				} catch (error) {
					console.error(error)
				}
			if (!navBar.contains(toggleDanMenu))
				try {
					navBar.insertBefore(toggleDanMenu, navBar.querySelector('a').parentNode)
				} catch (error) {
					console.error(error)
				}
			if (!navBar.contains(pasteButton))
				try {
					navBar.insertBefore(pasteButton, navBar.querySelector('a').parentNode)
				} catch (error) {
					console.error(error)
				}
		} catch (error) {
			// Ignore errors that are caused by resizing the window too fast
			if (error instanceof TypeError) {
				console.warn(GM_info.script.name + ': Common resize error.')
			} else {
				throw error
			}
		}
	}

	function DOMhandler() {
		if (isMobile || window.innerWidth < 780) {
			const spans = document.getElementsByTagName('span')
			for (let i = 0; i < spans.length; i++) {
				const span = spans[i]

				if (span.textContent === 'Open sidebar') {
					const openSidebar = span.closest('button')

					$(openSidebar).on('click', () => {
						setTimeout(function () {
							addElementsToDOM()
						}, 25)
					})
					break
				}
			}
		} else {
			addElementsToDOM()

			var changesObserver = new MutationObserver((mutations) => {
				mutations.forEach((mutation) => {
					if (mutation.type === 'childList' && mutation.addedNodes.length) {
						addElementsToDOM()
					}
				})
			})

			changesObserver.observe(document.documentElement, {
				childList: true,
				subtree: true,
			})
		}
	}

	// Add event listener for the window resize event
	window.addEventListener('resize', DOMhandler)
	DOMhandler()

	const historyDisabledDiv = $('button.btn-primary:contains("Enable")').toArray()[0].parentNode.parentNode
	historyDisabledDiv.style = 'top: 35% !important;'

	// Notifications
	$(notificationDiv)
		.css({ right: '-1000px', display: 'block' })
		.animate({ right: '10px' }, 1000)
		.delay(3000)
		.animate({ right: '-1000px' }, 1000, function () {
			setTimeout(function () {
				$(notificationDiv).css('right', '-1000px').hide()
			}, 200)
		})

	if (notifyUpdate) {
		const message = await getLatestCommitMessage()

		chatgpt.alert(
			`<span class="noselect" style="color: var(--light);">${GM_info.script.name}</span>`,
			`
<h2 class="noselect">New script update!
	<span style="color: var(--light);">${GM_info.script.version}</span>
	→
	<span style="color: var(--light);">${await getVersion(version)}</span>
</h2>
<div class="noselect" style="margin-bottom: 5px;">What's new in this version?</div>
<div class="noselect" style="background-color: #353740; padding: 10px; height: fit-content; width: 100%; border-radius: 5px;">
	<span style="font-family: monospace; color: white;">${message}</span>
</div>
		`,
			update
		)
	}
})()
