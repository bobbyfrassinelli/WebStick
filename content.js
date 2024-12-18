(function() {
    const pageUrl = window.location.href;
    
    // Get notes for this page from storage using callback
    chrome.storage.local.get([pageUrl], (storageData) => {
      let notes = storageData[pageUrl] || [];
  
      // Render existing notes
      notes.forEach(noteData => {
        createNoteElement(noteData);
      });
  
      // Listen for messages from the popup to add a note
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "addNote") {
          const newNote = {
            id: `note_${Date.now()}`,
            content: "",
            x: 100, y: 100,
            width: 200, height: 150
          };
          notes.push(newNote);
          updateNotesInStorage();
          createNoteElement(newNote);
        }
      });
  
      function createNoteElement(noteData) {
        const noteDiv = document.createElement('div');
        noteDiv.classList.add('sticky-note');
        noteDiv.style.position = 'fixed';
        noteDiv.style.left = noteData.x + 'px';
        noteDiv.style.top = noteData.y + 'px';
        noteDiv.style.width = noteData.width + 'px';
        noteDiv.style.height = noteData.height + 'px';
        noteDiv.style.zIndex = 999999;
  
        const textarea = document.createElement('textarea');
        textarea.value = noteData.content;
        textarea.addEventListener('input', () => {
          noteData.content = textarea.value;
          updateNotesInStorage();
        });
  
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'X';
        deleteBtn.style.position = 'absolute';
        deleteBtn.style.top = '0';
        deleteBtn.style.right = '0';
        deleteBtn.addEventListener('click', () => {
          notes = notes.filter(n => n.id !== noteData.id);
          updateNotesInStorage();
          noteDiv.remove();
        });
  
        noteDiv.appendChild(textarea);
        noteDiv.appendChild(deleteBtn);
        document.body.appendChild(noteDiv);
  
        // Implement dragging
        let isDragging = false, offsetX=0, offsetY=0;
        noteDiv.addEventListener('mousedown', (e) => {
          // Allow dragging if clicked on note or textarea background
          if (e.target === noteDiv || e.target === textarea) {
            isDragging = true;
            offsetX = e.clientX - noteDiv.offsetLeft;
            offsetY = e.clientY - noteDiv.offsetTop;
            document.body.style.userSelect = 'none';
          }
        });
        document.addEventListener('mousemove', (e) => {
          if (isDragging) {
            noteDiv.style.left = (e.clientX - offsetX) + 'px';
            noteDiv.style.top = (e.clientY - offsetY) + 'px';
          }
        });
        document.addEventListener('mouseup', () => {
          if (isDragging) {
            isDragging = false;
            document.body.style.userSelect = '';
            // Update position in storage
            noteData.x = parseInt(noteDiv.style.left);
            noteData.y = parseInt(noteDiv.style.top);
            noteData.width = parseInt(noteDiv.style.width);
            noteData.height = parseInt(noteDiv.style.height);
            updateNotesInStorage();
          }
        });
  
        // Observe style changes (like resizing)
        const observer = new MutationObserver(() => {
          noteData.width = parseInt(noteDiv.style.width);
          noteData.height = parseInt(noteDiv.style.height);
          updateNotesInStorage();
        });
        observer.observe(noteDiv, { attributes: true, attributeFilter: ['style'] });
      }
  
      function updateNotesInStorage() {
        chrome.storage.local.set({ [pageUrl]: notes });
      }
    });
  })();
  