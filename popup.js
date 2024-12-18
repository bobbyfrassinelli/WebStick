document.addEventListener('DOMContentLoaded', async () => {
    const addNoteBtn = document.getElementById('addNoteBtn');
    const pagesList = document.getElementById('pagesList');
  
    // Get current tab URL
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    const currentUrl = tab.url;
  
    // Set up 'Add Note' button: sends a message to content script to add a note
    addNoteBtn.addEventListener('click', () => {
      chrome.tabs.sendMessage(tab.id, { action: "addNote" });
    });
  
    // List all pages with notes
    const allData = await chrome.storage.local.get(null);
    for (const [pageUrl, notes] of Object.entries(allData)) {
      const li = document.createElement('li');
      li.textContent = `${pageUrl} (${notes.length} note${notes.length>1?'s':''})`;
  
      const visitBtn = document.createElement('button');
      visitBtn.textContent = 'Visit';
      visitBtn.addEventListener('click', () => {
        chrome.tabs.update({ url: pageUrl });
      });
  
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete Notes';
      deleteBtn.addEventListener('click', async () => {
        await chrome.storage.local.remove(pageUrl);
        li.remove();
      });
  
      li.appendChild(visitBtn);
      li.appendChild(deleteBtn);
      pagesList.appendChild(li);
    }
  });
  