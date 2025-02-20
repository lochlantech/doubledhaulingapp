document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadUserPhotos();
});

async function loadUserPhotos() {
    try {
        const response = await fetch(`${API_URL}/photos/user`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch photos');
        }

        const photos = await response.json();
        const gallery = document.getElementById('photoGallery');

        if (photos.length === 0) {
            gallery.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">You haven't uploaded any photos yet.</p>
                    <a href="uploadphoto.html" class="btn btn-primary">Upload Your First Photo</a>
                </div>
            `;
            return;
        }

        gallery.innerHTML = photos.map(photo => `
            <div class="col-md-4 col-sm-6 mb-4">
                <div class="card h-100">
                    <img src="${API_URL}${photo.photoUrl}" class="card-img-top" alt="Your photo">
                    <div class="card-body">
                        <p class="card-text">${photo.description || 'No description'}</p>
                        <small class="text-muted">Uploaded on: ${new Date(photo.createdAt).toLocaleDateString()}</small>
                        <div class="mt-2">
                            <button onclick="deletePhoto('${photo._id}')" class="btn btn-danger btn-sm">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading photos:', error);
        showStatus('Failed to load your photos', 'danger');
    }
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
            loadUserPhotos();
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
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.className = `alert alert-${type}`;
    statusDiv.textContent = message;
    statusDiv.classList.remove('d-none');
    setTimeout(() => statusDiv.classList.add('d-none'), 3000);
} 