var selected = "flag";

chrome.contextMenus.create({
    title: "test",
    contexts: ["selection"],
    id: "textSelect",
});

function onSelect() {
    console.log(selected);
}

chrome.contextMenus.onClicked.addListener(function (info) {
    if (info.menuItemId == "textSelect") {
        var id;
        chrome.tabs.query(
            { currentWindow: true, active: true },
            function (tabs) {
                id = tabs[0].id;
                chrome.scripting.executeScript(
                    {
                        code: "window.getSelection().toString();",
                        target: { tabId: id },
                    },
                    function (selection) {
                        selected = selection[0];
                        console.log(selected);
                    }
                );
            }
        );
    }
});

function getString() {
    window.getSelection().toString();
}
