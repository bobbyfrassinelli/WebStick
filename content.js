(async function() {
    // Create the sticky note container
    const noteDiv = document.createElement('div');
    noteDiv.id = 'sticky-note';
  
    // Create textarea inside sticky note
    const noteTextarea = document.createElement('textarea');
    noteDiv.appendChild(noteTextarea);
  
    document.body.appendChild(noteDiv);
  
    // Get the current page URL (without query params/hash if desired)
    const pageUrl = window.location.origin + window.location.pathname;
  
    // Load saved notes from chrome.storage
    const storageData = await chrome.storage.local.get([pageUrl]);
    if (storageData[pageUrl]) {
      noteTextarea.value = storageData[pageUrl];
    }
  
    // Listen for changes in the textarea and save them
    noteTextarea.addEventListener('input', async () => {
      const noteContent = noteTextarea.value;
      await chrome.storage.local.set({ [pageUrl]: noteContent });
    });
  })();
  