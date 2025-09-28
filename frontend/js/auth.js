const CLERK_PUBLISHABLE_KEY = 'pk_test_your-publishable-key-here';

window.Clerk.load({
  publishableKey: CLERK_PUBLISHABLE_KEY
}).then(() => {
  setupAuth();
});

function setupAuth() {
  const signInBtn = document.getElementById('sign-in-btn');
  const signUpBtn = document.getElementById('sign-up-btn');
  const signOutBtn = document.getElementById('sign-out-btn');

  if (signInBtn) {
    signInBtn.addEventListener('click', () => {
      window.Clerk.openSignIn();
    });
  }

  if (signUpBtn) {
    signUpBtn.addEventListener('click', () => {
      window.Clerk.openSignUp();
    });
  }

  if (signOutBtn) {
    signOutBtn.addEventListener('click', () => {
      window.Clerk.signOut();
    });
  }

  window.Clerk.addListener('user', updateAuthUI);
  updateAuthUI(window.Clerk.user);
}

function updateAuthUI(user) {
  const signInBtn = document.getElementById('sign-in-btn');
  const signUpBtn = document.getElementById('sign-up-btn');
  const signOutBtn = document.getElementById('sign-out-btn');

  if (user) {
    if (signInBtn) signInBtn.style.display = 'none';
    if (signUpBtn) signUpBtn.style.display = 'none';
    if (signOutBtn) signOutBtn.style.display = 'block';
    
    syncUser(user);
  } else {
    if (signInBtn) signInBtn.style.display = 'block';
    if (signUpBtn) signUpBtn.style.display = 'block';
    if (signOutBtn) signOutBtn.style.display = 'none';
  }
}

async function syncUser(user) {
  try {
    const token = await window.Clerk.session.getToken();
    await fetch('/api/auth/sync', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: user.primaryEmailAddress.emailAddress,
        name: user.fullName
      })
    });
  } catch (error) {
    console.error('Failed to sync user:', error);
  }
}

function requireAuth() {
  if (!window.Clerk.user) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}