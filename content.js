console.log("test");

chrome.contextMenus.onClicked.addListener(function (info) {
    if (info.menuItemId == "textSelect") {
        var info;
        chrome.tabs.query(
            { currentWindow: true, active: true },
            function (tabs) {
                chrome.scripting.executeScript(
                    {
                        func: () => {
                            info = window.getSelection().toString();
                        },
                        target: { tabId: tabs[0].id },
                    },
                    function (selection) {
                        selected = selection[0];
                    }
                );
            }
        );
        console.log(info.selectionText);
    }
});
