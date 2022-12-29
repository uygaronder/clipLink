const clipboardData = document.getElementById("clipboardData");

function render() {
    clipboardData.innerHTML = "";
    chrome.storage.sync.get(["data"], (pulledData) => {
        const data = pulledData["data"];
        console.log(data);
        for (let item of data) {
            const dragSpan = document.createElement("span");
            dragSpan.innerHTML = `<span class="dragspan"><img src="res/drag.svg" alt="drag"></span>`;

            const newSpan = document.createElement("span");
            newSpan.id = item["id"];
            newSpan.className = "data";

            let text = item["data"];
            if (item["hidden"]) {
                text = item["data"][0];
                text = text + "*".repeat(item["data"].length - 1);
            }
            const textNode = document.createElement("p");
            textNode.className = "dataText";
            textNode.innerText = text;

            const buttonsSpan = document.createElement("span");
            buttonsSpan.className = "dataButtons";
            /*
            buttonsSpan.innerHTML = `<span class="dataButtons">
                        <span class="dataButton" onclick="hideItem()"><img src="res/eye.svg" alt="Hide"></span>
                        <span class="dataButton" onclick="deleteItem()"><img src="res/del.svg" alt="Delete"></span>
                    </span>`;
            */
            const hideButton = document.createElement("span");
            hideButton.onclick = () => {
                hideItem(data, data.indexOf(item));
            };
            hideButton.innerHTML = `<img src="res/eye.svg" alt="Hide">`;
            hideButton.className = "dataButton";

            const delButton = document.createElement("span");
            delButton.onclick = () => {
                delItem(data, data.indexOf(item));
            };
            delButton.innerHTML = `<img src="res/del.svg" alt="Delete">`;
            delButton.className = "dataButton";

            buttonsSpan.appendChild(hideButton);
            buttonsSpan.appendChild(delButton);

            newSpan.appendChild(dragSpan);
            newSpan.appendChild(textNode);
            newSpan.appendChild(buttonsSpan);
            clipboardData.appendChild(newSpan);
        }
    });
}

function hideItem(data, index) {
    data[index]["hidden"] = !data[index]["hidden"];
    chrome.storage.sync.set({ [`data`]: data }).then(() => render());
    //render();
}

function delItem(data, index) {
    console.log(data, index);
    data.splice(index, 1);
    console.log(data);
    chrome.storage.sync.set({ [`data`]: data }).then(() => render());
    //render();
}

render();
