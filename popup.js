const clipboardData = document.getElementById("clipboardData");

chrome.storage.sync.get(["data"], (pulledData) => {
    const data = pulledData["data"];
    for (let item of data) {
        const newSpan = document.createElement("span");
        newSpan.id = item["id"];
        newSpan.className = "data";

        const textNode = document.createElement("p");
        textNode.className = "dataText";
        textNode.innerText = item["data"];

        const buttonsSpan = document.createElement("span");
        buttonsSpan.innerHTML = `<span class="dataButtons">
                    <span class="dataButton"><img src="res/star1.svg" alt="Star"></span>
                    <span class="dataButton"><img src="res/eye.svg" alt="Hide"></span>
                    <span class="dataButton"><img src="res/del.svg" alt="Delete"></span>
                </span>`;
        newSpan.appendChild(textNode);
        newSpan.appendChild(buttonsSpan);
        clipboardData.appendChild(newSpan);
    }
});
