chrome.storage.sync.get(null, (data) => {
    const keys = Object.keys(data);

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
                        newItem(selection[0].result);
                        iconAlert();
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

chrome.commands.onCommand.addListener(function (command) {
    if (command === "copyNewItem") {
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
                        if (selection[0].result != "")
                            newItem(selection[0].result);
                        iconAlert();
                    }
                );
            }
        );
    } else if (command === "openPopup") {
        console.log("popup");
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
    console.log(text);
    text = text.trim();
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
    iconAlert();
}

function iconAlert() {
    chrome.action.setIcon({
        path: {
            19: "/res/clipboard-alert-19x19.png",
            38: "/res/clipboard-alert-38x38.png",
        },
    });
    setTimeout(() => {
        chrome.action.setIcon({
            path: {
                19: "/res/clipboard-19x19.png",
                38: "/res/clipboard-38x38.png",
            },
        });
    }, 200);
}
