const inputBox = document.getElementById("inputBox");
const sync = document.getElementById("sync");
const dark = document.getElementById("dark");
const clipboardData = document.getElementById("clipboardData");

function defRender() {
    chrome.storage.sync.get(["data"], (pulledData) =>
        render(pulledData["data"], false)
    );
}

function render(data, search) {
    console.log(data);
    clipboardData.innerHTML = "";
    for (let item of data) {
        const dragSpan = document.createElement("span");
        dragSpan.innerHTML = `<span class="dragspan"><img src="res/drag.svg" alt="drag"></span>`;

        const newSpan = document.createElement("span");
        newSpan.id = item["id"];
        newSpan.className = "data";
        newSpan.onclick = () => {
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
        if (!search) {
            frontSpan.appendChild(dragSpan);
        }
        frontSpan.appendChild(textNode);

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
    let itemSpan = document.getElementById(item["id"]);
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
    chrome.storage.sync.get(null).then((result) => console.log(result));
});

sync.addEventListener("click", () => {
    defRender();
});

defRender();
