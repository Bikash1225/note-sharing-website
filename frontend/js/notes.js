let currentNotes = [];

document.addEventListener('DOMContentLoaded', () => {
  loadNotes();
  setupFilters();
});

async function loadNotes(filters = {}) {
  try {
    const params = new URLSearchParams(filters);
    const response = await fetch(`/api/notes?${params}`);
    const notes = await response.json();
    
    currentNotes = notes;
    displayNotes(notes);
  } catch (error) {
    console.error('Failed to load notes:', error);
  }
}

function displayNotes(notes) {
  const grid = document.getElementById('notes-grid');
  
  if (notes.length === 0) {
    grid.innerHTML = '<p>No notes found.</p>';
    return;
  }

  grid.innerHTML = notes.map(note => `
    <div class="note-card">
      <div class="note-header">
        <h3 class="note-title">${note.title}</h3>
        <div class="note-meta">
          <span>${note.course} - ${note.subject}</span>
          <span>by ${note.author_name}</span>
          <span>${new Date(note.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      
      ${note.description ? `<div class="note-description">${note.description}</div>` : ''}
      
      ${note.tags ? `
        <div class="note-tags">
          ${note.tags.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('')}
        </div>
      ` : ''}
      
      <div class="note-actions">
        <div class="vote-buttons">
          <button class="vote-btn" onclick="vote(${note.id}, 1)">👍 ${note.votes || 0}</button>
          <button class="vote-btn" onclick="vote(${note.id}, -1)">👎</button>
        </div>
        <a href="/api/notes/download/${note.file_path}" class="download-btn">Download</a>
      </div>
    </div>
  `).join('');
}

async function vote(noteId, type) {
  if (!window.Clerk.user) {
    alert('Please sign in to vote');
    return;
  }

  try {
    const token = await window.Clerk.session.getToken();
    const response = await fetch(`/api/notes/${noteId}/vote`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type })
    });

    if (response.ok) {
      loadNotes();
    } else {
      const error = await response.json();
      alert('Vote failed: ' + error.error);
    }
  } catch (error) {
    console.error('Vote failed:', error);
  }
}

function setupFilters() {
  const applyBtn = document.getElementById('apply-filters');
  
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      const filters = {
        course: document.getElementById('course-filter').value,
        subject: document.getElementById('subject-filter').value,
        tags: document.getElementById('tags-filter').value
      };
      
      // Remove empty filters
      Object.keys(filters).forEach(key => {
        if (!filters[key]) delete filters[key];
      });
      
      loadNotes(filters);
    });
  }
}