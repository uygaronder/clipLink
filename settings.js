chrome.storage.sync.get(["settings"]).then((settings) => {
    console.log(settings);
    if (settings == undefined) {
        chrome.storage.sync.set({
            settings: {
                darkTheme: true,
            },
        });
    }
});
