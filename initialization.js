// This file ensures proper initialization of the wedding seating chart application

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - starting application initialization');
    
    // CHANGED: Set Vietnamese as the default language instead of English
    if (!window.currentLanguage) {
        window.currentLanguage = localStorage.getItem('weddinglanguage') || 'vi'; // Changed from 'en' to 'vi'
    }
    
    // ADDED: Display loading message
    const loadingMessage = document.createElement('div');
    loadingMessage.id = 'loadingMessage';
    loadingMessage.style.padding = '15px';
    loadingMessage.style.backgroundColor = '#f8f9fa';
    loadingMessage.style.border = '1px solid #ddd';
    loadingMessage.style.borderRadius = '5px';
    loadingMessage.style.textAlign = 'center';
    loadingMessage.style.margin = '20px auto';
    loadingMessage.style.maxWidth = '400px';
    
    // CHANGED: Set loading message in Vietnamese by default
    loadingMessage.innerHTML = '<p>Đang tải dữ liệu khách mời... Vui lòng đợi.</p>';
    
    // Add it after the header
    const headerElement = document.querySelector('header');
    if (headerElement && headerElement.parentNode) {
        headerElement.parentNode.insertBefore(loadingMessage, headerElement.nextSibling);
    } else {
        // Fallback to adding at the beginning of body
        document.body.insertBefore(loadingMessage, document.body.firstChild);
    }
    
    // ADDED: Function to handle initialization success
    function onInitializationSuccess() {
        console.log('Application successfully initialized');
        
        // Remove loading message
        const loadingMessage = document.getElementById('loadingMessage');
        if (loadingMessage) {
            loadingMessage.remove();
        }
        
        // Explicitly initialize the venue map
        if (typeof window.initializeVenueMap === 'function') {
            console.log('Explicitly calling initializeVenueMap');
            window.initializeVenueMap();
        } else {
            console.error('initializeVenueMap function not available');
        }
        
        // Update UI elements to show everything is ready
        const searchButton = document.getElementById('searchButton');
        if (searchButton) {
            searchButton.disabled = false;
        }
        
        // ADDED: Apply Vietnamese translations by default after initialization
        if (typeof window.applyTranslations === 'function') {
            window.applyTranslations();
        }
        
        // ADDED: Update language button state to show Vietnamese as active
        const englishBtn = document.getElementById('englishBtn');
        const vietnameseBtn = document.getElementById('vietnameseBtn');
        if (englishBtn && vietnameseBtn) {
            englishBtn.classList.remove('active');
            vietnameseBtn.classList.add('active');
        }
        
        // Log some stats for debugging
        if (window.guestList && Array.isArray(window.guestList)) {
            console.log(`Loaded ${window.guestList.length} guests`);
            console.log('Sample guests:', window.guestList.slice(0, 3));
        }
        
        if (window.venueLayout && window.venueLayout.tables) {
            console.log(`Loaded ${window.venueLayout.tables.length} tables`);
        }
    }
    
    // ADDED: Function to handle initialization failure
    function onInitializationFailure(error) {
        console.error('Application initialization failed:', error);
        
        // Remove loading message
        const loadingMessage = document.getElementById('loadingMessage');
        if (loadingMessage) {
            loadingMessage.remove();
        }
        
        // CHANGED: Show error message in Vietnamese
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.textContent = `Không thể khởi tạo ứng dụng: ${error.message}`;
            errorMessage.classList.remove('hidden');
        }
    }
    
    // Check if the initializeFromCSV function exists
    if (typeof window.initializeFromCSV === 'function') {
        // Call the initialization function
        window.initializeFromCSV()
            .then(success => {
                if (success) {
                    onInitializationSuccess();
                } else {
                    onInitializationFailure(new Error('Khởi tạo trả về false'));
                }
            })
            .catch(error => {
                onInitializationFailure(error);
            });
    } else {
        console.error('initializeFromCSV function not found!');
        
        // ADDED: Check if we should attempt to load script dynamically
        const scriptElement = document.createElement('script');
        scriptElement.src = 'csv-processor.js';
        scriptElement.onload = function() {
            console.log('Dynamically loaded csv-processor.js');
            if (typeof window.initializeFromCSV === 'function') {
                window.initializeFromCSV()
                    .then(onInitializationSuccess)
                    .catch(onInitializationFailure);
            } else {
                onInitializationFailure(new Error('Không tìm thấy hàm initializeFromCSV sau khi tải script'));
            }
        };
        scriptElement.onerror = function() {
            onInitializationFailure(new Error('Không thể tải csv-processor.js động'));
        };
        document.head.appendChild(scriptElement);
    }
    
    // Add a function to retry initialization
    window.retryInitialization = function() {
        console.log('Retrying initialization...');
        
        // Hide error message
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.classList.add('hidden');
        }
        
        // Show loading message again (in Vietnamese)
        const loadingMessage = document.getElementById('loadingMessage');
        if (loadingMessage) {
            loadingMessage.style.display = 'block';
            loadingMessage.innerHTML = '<p>Đang tải dữ liệu khách mời... Vui lòng đợi.</p>';
        }
        
        // Try to initialize again
        if (typeof window.initializeFromCSV === 'function') {
            window.initializeFromCSV()
                .then(success => {
                    if (success) {
                        onInitializationSuccess();
                    } else {
                        onInitializationFailure(new Error('Thử lại khởi tạo trả về false'));
                    }
                })
                .catch(error => {
                    onInitializationFailure(error);
                });
        } else {
            console.error('Retry failed: initializeFromCSV function not found');
            onInitializationFailure(new Error('Không tìm thấy các hàm cần thiết để thử lại'));
        }
    };
    
    // Add retry button functionality if it exists
    const retryButton = document.getElementById('retryButton');
    if (retryButton) {
        retryButton.addEventListener('click', window.retryInitialization);
    }
});

// Add this to the initialization.js file or create a new script file

// Function to initialize the application
function initializeApplication() {
    console.log('Initializing wedding seating application...');
    
    // IMPORTANT FIX: Make sure translations are accessible globally
    window.translations = translations;
    
    // CHANGED: Set Vietnamese as default language if not already set
    if (!window.currentLanguage) {
        window.currentLanguage = 'vi'; // Changed from 'en' to 'vi'
    }
    
    // Make sure we have the venue map initialization function
    if (typeof window.initializeVenueMap !== 'function') {
        console.error('Venue map initialization function not found');
        // CHANGED: Display error message in Vietnamese
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.textContent = 'Không thể khởi tạo bản đồ địa điểm. Vui lòng làm mới trang.';
            errorMessage.classList.remove('hidden');
        }
        return;
    }
    
    // Initialize the venue map
    try {
        console.log('Calling initializeVenueMap...');
        const result = window.initializeVenueMap();
        console.log('Venue map initialization result:', result);
    } catch (error) {
        console.error('Error initializing venue map:', error);
    }
    
    // Attach event listener to search button
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            const nameInput = document.getElementById('nameSearch');
            if (nameInput && nameInput.value.trim()) {
                searchGuest(nameInput.value.trim());
            }
        });
    }
    
    // Initialize language switchers
    initializeLanguageSwitchers();
    
    console.log('Application initialization complete');
}

// Function to search for a guest
function searchGuest(name) {
    console.log('Searching for guest:', name);
    
    // In a real application, you would search your guest list here
    // For demonstration, we'll just show a sample result for any name
    
    const resultContainer = document.getElementById('resultContainer');
    const noResultContainer = document.getElementById('noResultContainer');
    
    // Show the result
    if (resultContainer) {
        // Set guest name
        const guestNameElement = document.getElementById('guestName');
        if (guestNameElement) {
            guestNameElement.textContent = name;
        }
        
        // Show the result container
        resultContainer.classList.remove('hidden');
        
        // Hide no result container if it's visible
        if (noResultContainer) {
            noResultContainer.classList.add('hidden');
        }
    }
}

// Function to highlight a table
function highlightTable(tableId) {
    console.log('Highlighting table:', tableId);
    
    // Remove highlight from all tables
    document.querySelectorAll('.table').forEach(table => {
        table.classList.remove('highlighted');
    });
    
    // Add highlight to the selected table
    const tableElement = document.getElementById(`table-${tableId}`);
    if (tableElement) {
        tableElement.classList.add('highlighted');
        
        // Scroll to make sure the table is visible
        tableElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        console.error(`Table element with ID table-${tableId} not found`);
    }
}

// Function to initialize language switchers
function initializeLanguageSwitchers() {
    const englishBtn = document.getElementById('englishBtn');
    const vietnameseBtn = document.getElementById('vietnameseBtn');
    
    if (englishBtn) {
        englishBtn.addEventListener('click', function() {
            setLanguage('en');
        });
    }
    
    if (vietnameseBtn) {
        vietnameseBtn.addEventListener('click', function() {
            setLanguage('vi');
        });
    }
}

// Function to set language
function setLanguage(lang) {
    console.log('Setting language to:', lang);
    
    window.currentLanguage = lang;
    
    // Save preference to localStorage
    localStorage.setItem('weddinglanguage', lang);
    
    // Update UI elements
    updateLanguageButtons();
    applyTranslations();
    
    // Update venue map
    if (typeof window.initializeVenueMap === 'function') {
        window.initializeVenueMap();
    }
}

// Function to update language buttons
function updateLanguageButtons() {
    const englishBtn = document.getElementById('englishBtn');
    const vietnameseBtn = document.getElementById('vietnameseBtn');
    
    if (englishBtn && vietnameseBtn) {
        if (window.currentLanguage === 'en') {
            englishBtn.classList.add('active');
            vietnameseBtn.classList.remove('active');
        } else {
            englishBtn.classList.remove('active');
            vietnameseBtn.classList.add('active');
        }
    }
}

// Function to apply translations
function applyTranslations() {
    const elements = document.querySelectorAll('[data-lang-key]');
    
    elements.forEach(element => {
        const key = element.getAttribute('data-lang-key');
        
        if (window.translations && 
            window.translations[window.currentLanguage] && 
            window.translations[window.currentLanguage][key]) {
            
            if (element.tagName === 'INPUT') {
                element.placeholder = window.translations[window.currentLanguage][key];
            } else {
                element.textContent = window.translations[window.currentLanguage][key];
            }
        }
    });
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing application...');
    
    // CHANGED: Set Vietnamese as default language if not set
    if (!window.currentLanguage) {
        window.currentLanguage = localStorage.getItem('weddinglanguage') || 'vi'; // Changed from 'en' to 'vi'
    }
    
    // Initialize the application
    initializeApplication();
});

// Make functions available globally
window.searchGuest = searchGuest;
window.highlightTable = highlightTable;
window.setLanguage = setLanguage;
window.applyTranslations = applyTranslations;
