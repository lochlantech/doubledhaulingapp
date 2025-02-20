document.addEventListener('DOMContentLoaded', function () {
  checkAuth();
  loadPhotos();

  // Preview photo before upload
  document.getElementById('photo').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const preview = document.getElementById('photoPreview');
        preview.innerHTML = `<img src="${e.target.result}" class="img-fluid mt-2" style="max-height: 200px;">`;
      }
      reader.readAsDataURL(file);
    }
  });

  // Handle form submission
  document.getElementById('photoUploadForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData();
    const photoFile = document.getElementById('photo').files[0];
    const description = document.getElementById('description').value;

    formData.append('photo', photoFile);
    formData.append('description', description);

    try {
      const response = await fetch(`${API_URL}/photos/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        showStatus('Photo uploaded successfully!', 'success');
        loadPhotos(); // Reload the photo gallery
        document.getElementById('photoUploadForm').reset();
        document.getElementById('photoPreview').innerHTML = '';
      } else {
        showStatus(data.error || 'Upload failed', 'danger');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showStatus('Failed to upload photo', 'danger');
    }
  });
});

async function loadPhotos() {
  try {
    const response = await fetch(`${API_URL}/photos`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const photos = await response.json();
    const gallery = document.getElementById('photoGallery');

    gallery.innerHTML = photos.map(photo => `
            <div class="col-md-4 col-sm-6">
                <div class="card">
                    <img src="${API_URL}${photo.photoUrl}" class="card-img-top" alt="Uploaded photo">
                    <div class="card-body">
                        <p class="card-text">${photo.description || ''}</p>
                        <small class="text-muted">Uploaded by: ${photo.username}</small>
                        <br>
                        <small class="text-muted">Date: ${new Date(photo.createdAt).toLocaleDateString()}</small>
                        ${canDeletePhoto(photo) ? `
                            <button onclick="deletePhoto('${photo._id}')" class="btn btn-danger btn-sm mt-2">Delete</button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');

  } catch (error) {
    console.error('Error loading photos:', error);
    showStatus('Failed to load photos', 'danger');
  }
}

function canDeletePhoto(photo) {
  const userData = JSON.parse(localStorage.getItem('user'));
  return userData && (userData._id === photo.userId || userData.role === 'admin');
}

async function deletePhoto(photoId) {
  if (!confirm('Are you sure you want to delete this photo?')) return;

  try {
    const response = await fetch(`${API_URL}/photos/${photoId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.ok) {
      showStatus('Photo deleted successfully', 'success');
      loadPhotos();
    } else {
      const data = await response.json();
      showStatus(data.error || 'Failed to delete photo', 'danger');
    }
  } catch (error) {
    console.error('Delete error:', error);
    showStatus('Failed to delete photo', 'danger');
  }
}

function showStatus(message, type) {
  const statusDiv = document.getElementById('uploadStatus');
  statusDiv.className = `alert alert-${type}`;
  statusDiv.textContent = message;
  statusDiv.classList.remove('d-none');
  setTimeout(() => statusDiv.classList.add('d-none'), 3000);
} 