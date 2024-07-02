function getRenderedDOM() {
  return document.documentElement.outerHTML;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // console.log(request);
  // console.log(sender);
  // console.log(character);
  // console.log(options);
  // console.log(sendResponse);

  if (request.action === 'analyzeDom') {
    if (!character) {
      loadOptions();
      createCharacter();
    }

    chrome.runtime.sendMessage({
      action: 'analyzeDom',
      dom: getRenderedDOM(),
    });
  }
});
