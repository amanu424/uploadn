// import * as lucide from 'lucide';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    lucide.createIcons();
    
    // DOM Elements - Sidebar
    const sidebar = document.getElementById('sidebar');
    const toggleSidebarButton = document.getElementById('toggleSidebar');
    const closeSidebarButton = document.getElementById('closeSidebar');
    const uploadedPhotosContainer = document.getElementById('uploadedPhotosContainer');
    const overlay = document.getElementById('overlay');
    
    // DOM Elements - Upload
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('file-upload');
    const previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const fileName = document.getElementById('fileName');
    const removePhoto = document.getElementById('removePhoto');
    const uploadButton = document.getElementById('uploadButton');
    
    // Variables
    let selectedImage = null;
    
    // Sample uploaded photos (in a real app, these would come from your backend)
    let uploadedPhotos = [
    ];
    
    // Sidebar Functions
    function openSidebar() {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling when sidebar is open
    }
    
    function closeSidebar() {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
    
    function toggleSidebar() {
        if (sidebar.classList.contains('-translate-x-full')) {
            openSidebar();
        } else {
            closeSidebar();
        }
    }
    
    // Sidebar Event Listeners
    toggleSidebarButton.addEventListener('click', toggleSidebar);
    closeSidebarButton.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);
    
    // File input change event
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Create preview
        const fileUrl = URL.createObjectURL(file);
        imagePreview.src = fileUrl;
        fileName.textContent = file.name;
        
        // Show preview, hide upload area
        previewContainer.classList.remove('hidden');
        fileUploadArea.classList.add('hidden');
        
        // Store the file for upload
        selectedImage = file;
        
        // Enable upload button
        uploadButton.classList.remove('bg-gray-300', 'text-gray-500', 'cursor-not-allowed');
        uploadButton.classList.add('bg-blue-600', 'text-white', 'hover:bg-blue-700');
        uploadButton.disabled = false;
    });
    
    // Remove photo button
    removePhoto.addEventListener('click', function() {
        // Hide preview, show upload area
        previewContainer.classList.add('hidden');
        fileUploadArea.classList.remove('hidden');
        
        // Reset file input
        fileInput.value = '';
        
        // Reset selected image
        selectedImage = null;
        
        // Disable upload button
        uploadButton.classList.add('bg-gray-300', 'text-gray-500', 'cursor-not-allowed');
        uploadButton.classList.remove('bg-blue-600', 'text-white', 'hover:bg-blue-700');
        uploadButton.disabled = true;
    });
    
    // Drag and drop functionality
    fileUploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        fileUploadArea.classList.add('border-blue-500', 'bg-blue-50');
    });
    
    fileUploadArea.addEventListener('dragleave', function() {
        fileUploadArea.classList.remove('border-blue-500', 'bg-blue-50');
    });
    
    fileUploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        fileUploadArea.classList.remove('border-blue-500', 'bg-blue-50');
        
        if (e.dataTransfer.files.length) {
            const file = e.dataTransfer.files[0];
            
            // Check if it's an image
            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file (JPG, PNG, GIF)');
                return;
            }
            
            // Create preview
            const fileUrl = URL.createObjectURL(file);
            imagePreview.src = fileUrl;
            fileName.textContent = file.name;
            
            // Show preview, hide upload area
            previewContainer.classList.remove('hidden');
            fileUploadArea.classList.add('hidden');
            
            // Store the file for upload
            selectedImage = file;
            
            // Enable upload button
            uploadButton.classList.remove('bg-gray-300', 'text-gray-500', 'cursor-not-allowed');
            uploadButton.classList.add('bg-blue-600', 'text-white', 'hover:bg-blue-700');
            uploadButton.disabled = false;
        }
    });
    
    // Populate uploaded photos
    function populateUploadedPhotos() {
        uploadedPhotosContainer.innerHTML = '';
        
        if (uploadedPhotos.length === 0) {
            uploadedPhotosContainer.innerHTML = '<p class="text-gray-500 text-center py-8">No photos uploaded yet</p>';
            return;
        }
        
        uploadedPhotos.forEach(photo => {
            const photoElement = document.createElement('div');
            photoElement.className = 'border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow';
            photoElement.innerHTML = `
                <div class="relative aspect-square">
                    <img src="${photo.url}" alt="${photo.name}" class="w-full h-full object-contain">
                </div>
                <div class="p-3 text-sm truncate">${photo.name}</div>
            `;
            uploadedPhotosContainer.appendChild(photoElement);
        });
    }
    
    // Initialize uploaded photos
    populateUploadedPhotos();
    
    // Upload button
    uploadButton.addEventListener('click', async function() {
        if (uploadButton.disabled || !selectedImage) return;
        
        // Disable button and show loading state
        uploadButton.disabled = true;
        uploadButton.innerHTML = `
            <div class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Uploading...</span>
        `;
        
        // Simulate upload process
        console.log('sent')
        console.log(selectedImage)
        console.log(typeof(selectedImage))
        const dataa = new FormData();
        const image = selectedImage;
        dataa.append('id', 'sendIDHere');
        dataa.append('name', 'sendNameHere');
        dataa.append('image', image);
        try {
            const response = await fetch("http://localhost:3000/upload", {
                method: "POST",
                // headers: {'Content-Type': 'multipart/form-data'},
                body: dataa
            })
            const data = await response.json()
            if(!response.ok) {
                return alert("beyene")
            }

            uploadButton.innerHTML = `
                <i data-lucide="check" class="h-4 w-4"></i>
                <span>Uploaded!</span>
            `;
            lucide.createIcons();
            
            // Add to "uploaded photos" (in a real app, this would be handled by your backend)
            const timestamp = new Date().toLocaleTimeString();
            const newPhoto = {
                id: Date.now(),
                url: imagePreview.src,
                name: selectedImage.name || `Photo ${timestamp}.jpg`
            };
            uploadedPhotos.unshift(newPhoto);
            populateUploadedPhotos();
            
            // Reset form after delay
            setTimeout(() => {
                // Reset UI
                previewContainer.classList.add('hidden');
                fileUploadArea.classList.remove('hidden');
                
                // Reset file input
                fileInput.value = '';
                
                // Reset button
                uploadButton.innerHTML = `
                    <i data-lucide="upload" class="h-4 w-4"></i>
                    <span>Upload Photo</span>
                `;
                lucide.createIcons();
                uploadButton.classList.add('bg-gray-300', 'text-gray-500', 'cursor-not-allowed');
                uploadButton.classList.remove('bg-blue-600', 'text-white', 'hover:bg-blue-700');
                uploadButton.disabled = true;
                
                // Reset selected image
                selectedImage = null;
                
                // Show sidebar with new photo
                openSidebar();
            }, 1500);
        } catch(e) {
            alert("Try again")
            uploadButton.innerHTML = `
                    <i data-lucide="upload" class="h-4 w-4"></i>
                    <span>Upload Photo</span>
                `;
                lucide.createIcons();
            uploadButton.classList.remove('bg-gray-300', 'text-gray-500', 'cursor-not-allowed');
            uploadButton.classList.add('bg-blue-600', 'text-white', 'hover:bg-blue-700');
            uploadButton.disabled = false;
            console.log(e);
            return
        }
        // setTimeout(() => {
        //     // Show success state
        //     uploadButton.innerHTML = `
        //         <i data-lucide="check" class="h-4 w-4"></i>
        //         <span>Uploaded!</span>
        //     `;
        //     lucide.createIcons();
            
        //     // Add to "uploaded photos" (in a real app, this would be handled by your backend)
        //     const timestamp = new Date().toLocaleTimeString();
        //     const newPhoto = {
        //         id: Date.now(),
        //         url: imagePreview.src,
        //         name: selectedImage.name || `Photo ${timestamp}.jpg`
        //     };
        //     uploadedPhotos.unshift(newPhoto);
        //     populateUploadedPhotos();
            
        //     // Reset form after delay
        //     setTimeout(() => {
        //         // Reset UI
        //         previewContainer.classList.add('hidden');
        //         fileUploadArea.classList.remove('hidden');
                
        //         // Reset file input
        //         fileInput.value = '';
                
        //         // Reset button
        //         uploadButton.innerHTML = `
        //             <i data-lucide="upload" class="h-4 w-4"></i>
        //             <span>Upload Photo</span>
        //         `;
        //         lucide.createIcons();
        //         uploadButton.classList.add('bg-gray-300', 'text-gray-500', 'cursor-not-allowed');
        //         uploadButton.classList.remove('bg-blue-600', 'text-white', 'hover:bg-blue-700');
        //         uploadButton.disabled = true;
                
        //         // Reset selected image
        //         selectedImage = null;
                
        //         // Show sidebar with new photo
        //         openSidebar();
        //     }, 1500);
        // }, 1500);
    });
    
    // Click on upload area to trigger file input
    fileUploadArea.addEventListener('click', function(e) {
        // Only trigger if the click wasn't on a button or input
        if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'LABEL') {
            fileInput.click();
        }
    });
});