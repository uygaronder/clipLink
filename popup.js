const inputBox = document.getElementById("inputBox");
const sync = document.getElementById("sync");
const dark = document.getElementById("dark");
const clipboardData = document.getElementById("clipboardData");
let body;

function defRender() {
    chrome.storage.sync.get(["data"], (pulledData) =>
        render(pulledData["data"], false)
    );
}

function render(data, search) {
    console.log(data);
    clipboardData.innerHTML = "";
    for (let item of data) {
        const newSpan = document.createElement("span");
        newSpan.id = item["id"];
        newSpan.className = "data";
        if (!search) {
            newSpan.draggable = "true";
        }

        const textContainer = document.createElement("span");
        textContainer.className = "textContainer";
        textContainer.onclick = () => {
            copyText(item);
        };

        const textNode = document.createElement("p");
        textNode.className = "dataText";
        let text = item["data"];
        if (item["hidden"]) {
            text = item["data"][0];
            text = text + "*".repeat(item["data"].length - 1);
        } else {
            textNode.title = item["data"];
        }
        if (item["data"].length > 20) {
            text = text.substring(0, 10) + "...";
        }

        textNode.innerText = text;

        const buttonsSpan = document.createElement("span");
        buttonsSpan.className = "dataButtons";

        const hideButton = document.createElement("span");
        hideButton.onclick = () => {
            hideItem(item["id"]);
        };
        hideButton.innerHTML = `<img src="res/eye.svg" alt="Hide">`;
        hideButton.className = "dataButton";

        const delButton = document.createElement("span");
        delButton.onclick = () => {
            delItem(item["id"]);
        };
        delButton.innerHTML = `<img src="res/del.svg" alt="Delete">`;
        delButton.className = "dataButton";

        buttonsSpan.appendChild(hideButton);
        buttonsSpan.appendChild(delButton);

        const frontSpan = document.createElement("span");
        frontSpan.className = "frontSpan";

        textContainer.appendChild(textNode);
        frontSpan.appendChild(textContainer);

        newSpan.appendChild(frontSpan);
        newSpan.appendChild(buttonsSpan);
        clipboardData.appendChild(newSpan);
    }
}

function hideItem(id) {
    chrome.storage.sync.get(["data"], (pulledData) => {
        let data = pulledData["data"];
        for (var i = 0; i < data.length; i++) {
            if (data[i]["id"] == id) {
                data[i]["hidden"] = !data[i]["hidden"];
                i = data.length;
            }
        }
        chrome.storage.sync
            .set({ [`data`]: data })
            .then(() => (inputBox.value == "" ? defRender() : search()));
    });
}

function delItem(id) {
    chrome.storage.sync.get(["data"], (pulledData) => {
        let data = pulledData["data"];
        for (var i = 0; i < data.length; i++) {
            if (data[i]["id"] == id) {
                data.splice(i, 1);
                i = data.length - 1;
            }
        }
        chrome.storage.sync
            .set({ [`data`]: data })
            .then(() => (inputBox.value == "" ? defRender() : search()));
    });
}

function copyText(item) {
    navigator.clipboard.writeText(item["data"]);
    const itemSpan = document.getElementById(item["id"]);

    const copiedPrompt = document.createElement("span");
    copiedPrompt.className = "copiedPrompt";
    copiedPrompt.innerText = "Copied";

    const textContainer = itemSpan.getElementsByClassName("textContainer")[0];

    textContainer.appendChild(copiedPrompt);
    setTimeout(() => {
        copiedPrompt.style = "opacity:0";
    }, 300);
    setTimeout(() => {
        textContainer.removeChild(copiedPrompt);
    }, 500);
}

document.addEventListener("keypress", (event) => {
    if (event.key == "Enter" && inputBox.value != "") {
        newItem(inputBox.value);
        inputBox.value = "";
    }
});

function newItem(text) {
    text = text.trim();
    chrome.storage.sync.get(["data"], (pulledData) => {
        let data = pulledData["data"];
        const newData = {
            data: text,
            hidden: false,
            id: Date.now(),
        };
        data.push(newData);
        chrome.storage.sync.set({ data: data }).then(() => defRender());
    });
}

inputBox.addEventListener("keyup", () => search());

function search() {
    if (inputBox.value != "") {
        chrome.storage.sync.get(["data"], (pulledData) => {
            /*for (let item of pulledData["data"]) {
                console.log(item);
            }*/
            const result = pulledData["data"].filter((item) =>
                item["data"]
                    .toLowerCase()
                    .includes(inputBox.value.toLowerCase())
            );
            render(result, true);
        });
    } else {
        defRender();
    }
}

dark.addEventListener("click", () => {
    chrome.storage.sync.get(null).then((result) => {
        let newSettings = result.settings;
        newSettings.darkTheme = !result.settings.darkTheme;
        chrome.storage.sync
            .set({
                [`settings`]: newSettings,
            })
            .then(() => themeSet());
    });
});

sync.addEventListener("click", () => {
    sync.className = "syncSpin";
    setTimeout(() => {
        sync.classList.remove("syncSpin");
    }, 1000);
    defRender();
});

function themeSet() {
    chrome.storage.sync.get(null).then((result) => {
        if (result.settings.darkTheme) {
            body.classList.add("dark");
        } else {
            body.classList.remove("dark");
        }
    });
}

defRender();

let dragId;
clipboardData.ondrop = (event) => dropItem(event);
clipboardData.ondragover = (event) => dragOver(event);
clipboardData.ondragstart = (event) => dragStart(event);

function getShell(div) {
    let countdown = 20;
    while (countdown > 0 && div.className != "data") {
        div = div.parentElement;
    }
    return div;
}

function checkPlacement(div, mouseY) {
    // true to top false to bottom
    return (div[1] - div[0]) / 2 > div[1] - mouseY;
}

function dragOver(e) {
    e.preventDefault();
}

function dragStart(e) {
    dragId = e.target.id;
}

function dropItem(e) {
    e.preventDefault();
    let overIndex;
    let itemIndex;

    chrome.storage.sync.get("data").then((result) => {
        let data = result.data;
        let targetDiv = getShell(e.target);
        let itemDiv = document.getElementById(dragId);

        const toTop = checkPlacement(
            [
                targetDiv.getBoundingClientRect().top,
                targetDiv.getBoundingClientRect().bottom,
            ],
            e.y
        );

        for (var i = 0; i < data.length; i++) {
            if (!itemIndex && data[i].id == itemDiv.id) {
                itemIndex = i;
                itemToChange = data.splice(i, 1)[0];
                break;
            }
        }

        for (var i = 0; i < data.length; i++) {
            if (!overIndex && data[i].id == targetDiv.id) {
                overIndex = i;
                break;
            }
        }

        if (overIndex > itemIndex) {
            //data.splice(item);
        }
        data.splice(toTop ? overIndex + 1 : overIndex, 0, itemToChange);
        chrome.storage.sync.set({ data: data }).then(() => defRender());
    });
}

window.onload = () => {
    body = document.getElementsByTagName("body")[0];
    themeSet();
};
