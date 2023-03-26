document.getElementById("groupTabs").addEventListener("click", groupTabs);
document.getElementById("closeDuplicates").addEventListener("click", closeDuplicates);
document.getElementById("search").addEventListener("input", filterTabs);

updateTabCount();

function groupTabs() {
  chrome.tabs.query({}, (tabs) => {
    const groupedTabs = {};
    tabs.forEach((tab) => {
      const domain = new URL(tab.url).hostname;
      if (!groupedTabs[domain]) {
        groupedTabs[domain] = [];
      }
      groupedTabs[domain].push(tab);
    });

    displayTabs(groupedTabs);
  });
}

function closeDuplicates() {
  chrome.tabs.query({}, (tabs) => {
    const uniqueUrls = new Set();
    const duplicateTabs = [];

    tabs.forEach((tab) => {
      if (uniqueUrls.has(tab.url)) {
        duplicateTabs.push(tab);
      } else {
        uniqueUrls.add(tab.url);
      }
    });

    duplicateTabs.forEach((tab) => {
      chrome.tabs.remove(tab.id);
    });

    updateTabCount();
  });
}

function updateTabCount() {
  chrome.tabs.query({}, (tabs) => {
    const tabCount = tabs.length;
    document.getElementById("tabCount").innerText = `Total tabs: ${tabCount}`;
  });
}

function displayTabs(tabs) {
  const container = document.getElementById("tabsContainer");
  container.innerHTML = "";

  for (const domain in tabs) {
    tabs[domain].forEach((tab) => {
      const tabItem = document.createElement("div");
      tabItem.className = "tabItem";
      tabItem.dataset.title = tab.title;

      const title = document.createElement("span");
      title.className = "tabTitle";
      title.innerText = tab.title;

      const pinButton = document.createElement("button");
      pinButton.innerText = tab.pinned ? "Unpin" : "Pin";
      pinButton.addEventListener("click", () => {
        togglePin(tab.id, tab.pinned);
      });

      const closeButton = document.createElement("button");
      closeButton.innerText = "Close";
      closeButton.addEventListener("click", () => {
        chrome.tabs.remove(tab.id, () => {
          tabItem.remove();
          updateTabCount();
        });
      });

      tabItem.appendChild(title);
      tabItem.appendChild(pinButton);
      tabItem.appendChild(closeButton);
      container.appendChild(tabItem);
    });
  }
}

function togglePin(tabId, pinned) {
  chrome.tabs.update(tabId, { pinned: !pinned }, (tab) => {
    groupTabs();
    updateTabCount();
  });
}

function filterTabs(event) {
  const searchText = event.target.value.toLowerCase();
  const tabItems = document.querySelectorAll(".tabItem");

  tabItems.forEach((item) => {
    const title = item.dataset.title.toLowerCase();
    if (title.includes(searchText)) {
      item.style.display = "flex";
    } else {
      item.style.display = "none";
    }
  });
}
