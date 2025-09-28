document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
  
  loadUsers();
  loadAllNotes();
});

async function loadUsers() {
  try {
    const token = await window.Clerk.session.getToken();
    const response = await fetch('/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const users = await response.json();
      displayUsers(users);
    } else if (response.status === 403) {
      document.body.innerHTML = '<p>Admin access required</p>';
    }
  } catch (error) {
    console.error('Failed to load users:', error);
  }
}

function displayUsers(users) {
  const container = document.getElementById('users-list');
  
  container.innerHTML = users.map(user => `
    <div class="user-item">
      <div>
        <strong>${user.name || 'No name'}</strong> (${user.email})
        ${user.is_admin ? '<span style="color: green;">[Admin]</span>' : ''}
        ${user.is_banned ? '<span style="color: red;">[Banned]</span>' : ''}
      </div>
      <div>
        ${!user.is_banned ? 
          `<button class="ban-btn" onclick="banUser('${user.clerk_uid}')">Ban</button>` :
          `<button class="unban-btn" onclick="unbanUser('${user.clerk_uid}')">Unban</button>`
        }
      </div>
    </div>
  `).join('');
}

async function loadAllNotes() {
  try {
    const response = await fetch('/api/notes');
    const notes = await response.json();
    displayAdminNotes(notes);
  } catch (error) {
    console.error('Failed to load notes:', error);
  }
}

function displayAdminNotes(notes) {
  const container = document.getElementById('admin-notes-list');
  
  container.innerHTML = notes.map(note => `
    <div class="admin-note-item">
      <div>
        <strong>${note.title}</strong> by ${note.author_name}
        <br>
        <small>${note.course} - ${note.subject}</small>
      </div>
      <div>
        <button class="delete-btn" onclick="deleteNote(${note.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

async function banUser(userId) {
  const reason = prompt('Ban reason:');
  if (!reason) return;

  try {
    const token = await window.Clerk.session.getToken();
    const response = await fetch(`/api/admin/users/${userId}/ban`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason })
    });

    if (response.ok) {
      loadUsers();
    } else {
      alert('Failed to ban user');
    }
  } catch (error) {
    console.error('Failed to ban user:', error);
  }
}

async function unbanUser(userId) {
  try {
    const token = await window.Clerk.session.getToken();
    const response = await fetch(`/api/admin/users/${userId}/unban`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      loadUsers();
    } else {
      alert('Failed to unban user');
    }
  } catch (error) {
    console.error('Failed to unban user:', error);
  }
}

async function deleteNote(noteId) {
  if (!confirm('Are you sure you want to delete this note?')) return;

  try {
    const token = await window.Clerk.session.getToken();
    const response = await fetch(`/api/admin/notes/${noteId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      loadAllNotes();
    } else {
      alert('Failed to delete note');
    }
  } catch (error) {
    console.error('Failed to delete note:', error);
  }
}