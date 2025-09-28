document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
  
  loadProfile();
  loadUserNotes();
  setupForms();
});

async function loadProfile() {
  try {
    const token = await window.Clerk.session.getToken();
    const response = await fetch('/api/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const user = await response.json();
      displayProfile(user);
    }
  } catch (error) {
    console.error('Failed to load profile:', error);
  }
}

function displayProfile(user) {
  document.getElementById('user-name').textContent = user.name || 'No name';
  document.getElementById('user-email').textContent = user.email;
  document.getElementById('bio').value = user.bio || '';
  
  const profilePic = document.getElementById('profile-pic');
  const placeholder = document.getElementById('profile-pic-placeholder');
  
  if (user.profile_pic) {
    profilePic.src = `/uploads/profiles/${user.profile_pic}`;
    profilePic.style.display = 'block';
    placeholder.style.display = 'none';
  } else {
    profilePic.style.display = 'none';
    placeholder.style.display = 'flex';
  }
}

async function loadUserNotes() {
  try {
    const token = await window.Clerk.session.getToken();
    const response = await fetch('/api/users/notes', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const notes = await response.json();
      displayUserNotes(notes);
    }
  } catch (error) {
    console.error('Failed to load user notes:', error);
  }
}

function displayUserNotes(notes) {
  const grid = document.getElementById('user-notes-grid');
  
  if (notes.length === 0) {
    grid.innerHTML = '<p>No notes uploaded yet.</p>';
    return;
  }

  grid.innerHTML = notes.map(note => `
    <div class="note-card">
      <h4>${note.title}</h4>
      <p>${note.course} - ${note.subject}</p>
      <p>Votes: ${note.votes || 0}</p>
      <p>${new Date(note.created_at).toLocaleDateString()}</p>
    </div>
  `).join('');
}

function setupForms() {
  document.getElementById('bio-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const bio = document.getElementById('bio').value;
    
    try {
      const token = await window.Clerk.session.getToken();
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bio })
      });

      if (response.ok) {
        alert('Bio updated successfully!');
      } else {
        alert('Failed to update bio');
      }
    } catch (error) {
      console.error('Failed to update bio:', error);
    }
  });

  document.getElementById('picture-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    try {
      const token = await window.Clerk.session.getToken();
      const response = await fetch('/api/users/profile/picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        alert('Profile picture updated successfully!');
        loadProfile();
      } else {
        alert('Failed to update profile picture');
      }
    } catch (error) {
      console.error('Failed to update profile picture:', error);
    }
  });
}