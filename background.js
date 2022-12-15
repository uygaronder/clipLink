chrome.storage.sync.get(null, (data) => {
    const keys = Object.keys(data);
    //console.log(keys);

    if (keys.length == 0) {
        onboarding();
    }
});

chrome.contextMenus.create({
    title: "Copy Selected Text To Clipboard",
    contexts: ["selection"],
    id: "textSelect",
});

chrome.contextMenus.onClicked.addListener(function (info) {
    if (info.menuItemId == "textSelect") {
        console.log("textSelect");
        var id;
        chrome.tabs.query(
            { currentWindow: true, active: true },
            function (tabs) {
                id = tabs[0].id;

                chrome.scripting.executeScript(
                    {
                        func: () => {
                            return window.getSelection().toString();
                        },
                        target: { tabId: id },
                    },
                    function (selection) {
                        const selectedText = selection[0].result;
                        newItem(selectedText);
                    }
                );
            }
        );
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    const selectedText = request.selectedText;
    console.log(selectedText);
    if (selectedText) {
        fetchData(selectedText).then((data) => {
            sendResponse({ response: data });
            chrome.extension.sendMessage(
                { action: "newItem", messege: selectedText },
                function () {}
            );
        });
        return true;
    }
});

function onboarding() {
    chrome.storage.sync.set({
        settings: {
            darkTheme: true,
        },
    });
    chrome.storage.sync.set({
        data: [],
    });
}

function newItem(text) {
    chrome.storage.sync.get(["data"], (pulledData) => {
        let data = pulledData["data"];
        const newData = {
            data: text,
            hidden: false,
            id: Date.now(),
        };
        data.push(newData);
        chrome.storage.sync.set({ data: data });
    });
}
