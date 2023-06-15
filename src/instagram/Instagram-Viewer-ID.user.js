// ==UserScript==
// @name           Instagram: Viewer ID
// @namespace      http://tampermonkey.net/
// @version        1.17
// @description    View ID of user instagram
// @author         Anonymous
// @match          https://www.instagram.com/*/*
// @grant          none
// @icon           https://www.google.com/s2/favicons?domain=instagram.com
// ==/UserScript==

window.onload = main

function main() {
	document.querySelector('#react-root > section > main > div > header > section > div > h1').innerText += ', ID: ' + window._sharedData.entry_data.ProfilePage[0].graphql.user.id
	oldT = document.querySelector('#react-root > section > main > div > header > section > div > h1').innerText
	vc()
}

function vc() {
	let newT = ''
	try { newT = document.querySelector('#react-root > section > main > div > header > section > div > h1').innerText || null } catch (e) { newT = null }
	if (newT == null) { setTimeout(vc, 100); return }
	if (oldT !== newT) {
		document.querySelector('#react-root > section > main > div > header > section > div > h1').innerText += ', ID: ' + getID(location.href)
		oldT = document.querySelector('#react-root > section > main > div > header > section > div > h1').innerText
		setTimeout(vc, 100)
	} else {
		setTimeout(vc, 100)
	}
}

function getID(url, callback) {
	xhr = new XMLHttpRequest()
	xhr.open('get', url, callback ? true : false)
	xhr.send()
	if (callback !== undefined)
		callback(xhr.responseText.split('"id":')[1].split(',')[0].split('"')[1])
	else
		return xhr.responseText.split('"id":')[1].split(',')[0].split('"')[1]
}