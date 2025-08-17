document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const nameSearchInput = document.getElementById('nameSearch');
    const searchButton = document.getElementById('searchButton');
    const resultContainer = document.getElementById('resultContainer');
    const noResultContainer = document.getElementById('noResultContainer');
    const guestNameElement = document.getElementById('guestName');
    const tableNameElement = document.getElementById('tableName');
    const seatNumberElement = document.getElementById('seatNumber');
    const tablematesListElement = document.getElementById('tablematesList');
    const venueMapElement = document.getElementById('venueMap');
    const englishBtn = document.getElementById('englishBtn');
    const vietnameseBtn = document.getElementById('vietnameseBtn');
    const backButton = document.getElementById('backButton');
    const tryAgainButton = document.getElementById('tryAgainButton');

    // Set default language as a global variable
    window.currentLanguage = 'en';

    // Check if there's a saved language preference in localStorage
    if (localStorage.getItem('weddinglanguage')) {
        window.currentLanguage = localStorage.getItem('weddinglanguage');
    }

    // Add this logging code to check if data is loading
    console.log("DOM fully loaded");

    // Add event listeners
    if (searchButton) {
        searchButton.addEventListener('click', searchGuest);
        console.log("Search button event listener added");
    } else {
        console.error("Search button not found in the DOM");
    }

    if (nameSearchInput) {
        nameSearchInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                searchGuest();
            }
        });
        console.log("Search input event listener added");
    } else {
        console.error("Search input not found in the DOM");
    }

    // Back button functionality
    if (backButton) {
        backButton.addEventListener('click', function() {
            resultContainer.classList.add('hidden');
            nameSearchInput.value = '';

            // Remove highlighting from all tables
            document.querySelectorAll('.table').forEach(table => {
                table.classList.remove('highlighted');
            });
            
            // Clear any notices
            const noticeEl = document.getElementById('searchNotice');
            if (noticeEl) {
                noticeEl.remove();
            }
        });
        console.log("Back button event listener added");
    }

    // Try again button functionality
    if (tryAgainButton) {
        tryAgainButton.addEventListener('click', function() {
            noResultContainer.classList.add('hidden');
            nameSearchInput.value = '';
            nameSearchInput.focus();
        });
        console.log("Try again button event listener added");
    }

    // Add language button event listeners
    if (englishBtn) {
        englishBtn.addEventListener('click', function() {
            setLanguage('en');
        });
        console.log("English button event listener added");
    }

    if (vietnameseBtn) {
        vietnameseBtn.addEventListener('click', function() {
            setLanguage('vi');
        });
        console.log("Vietnamese button event listener added");
    }

    // Function to set language
    function setLanguage(lang) {
        window.currentLanguage = lang;

        // Save language preference to localStorage
        localStorage.setItem('weddinglanguage', window.currentLanguage);

        // Update the language button state
        updateLanguageButtonState();

        // Apply translations
        applyTranslations();

        // Reinitialize the venue map with new language
        if (typeof window.initializeVenueMap === 'function') {
            console.log('Reinitializing venue map after language change');
            window.initializeVenueMap();
        }
        
        // Update any notices that might be showing
        updateSearchNotices();
    }
    
    // Function to update search notices when language changes
    function updateSearchNotices() {
        const noticeEl = document.getElementById('searchNotice');
        if (noticeEl && noticeEl.hasAttribute('data-notice-type')) {
            const noticeType = noticeEl.getAttribute('data-notice-type');
            const selectedSide = document.querySelector('input[name="side"]:checked').value;
            const nameInput = document.getElementById('nameSearch');
            const searchName = nameInput ? nameInput.value : '';
            
            if (noticeType === 'opposite-side') {
                const oppositeSide = selectedSide === 'bride' ? 'groom' : 'bride';
                const oppositeSideName = window.currentLanguage === 'en' 
                    ? (oppositeSide === 'bride' ? 'Bride' : 'Groom') 
                    : (oppositeSide === 'bride' ? 'Cô Dâu' : 'Chú Rể');
                
                const guestName = guestNameElement ? guestNameElement.textContent : '';
                
                noticeEl.textContent = window.currentLanguage === 'en'
                    ? `Note: You selected the wrong side. "${guestName}" is a guest of the ${oppositeSideName}.`
                    : `Lưu ý: Bạn đã chọn sai bên. "${guestName}" là khách của ${oppositeSideName}.`;
            } else if (noticeType === 'fuzzy-match') {
                noticeEl.textContent = window.currentLanguage === 'en'
                    ? `Showing closest match for "${searchName}"`
                    : `Hiển thị kết quả gần nhất cho "${searchName}"`;
            }
        }
    }

    // Function to update language button state
    function updateLanguageButtonState() {
        if (window.currentLanguage === 'en') {
            englishBtn.classList.add('active');
            vietnameseBtn.classList.remove('active');
        } else {
            vietnameseBtn.classList.add('active');
            englishBtn.classList.remove('active');
        }
    }

    // Set initial active language button
    updateLanguageButtonState();

    // Function to apply translations to all elements
    function applyTranslations() {
        // Get all elements with the data-lang-key attribute
        const elements = document.querySelectorAll('[data-lang-key]');

        // Update each element with the corresponding translation
        elements.forEach(element => {
            const key = element.getAttribute('data-lang-key');

            // Handle input placeholders separately
            if (element.tagName === 'INPUT') {
                element.placeholder = translations[window.currentLanguage][key];
            } else if (element.tagName === 'BUTTON') {
                element.textContent = translations[window.currentLanguage][key];
            } else {
                element.textContent = translations[window.currentLanguage][key];
            }
        });

        // Update any dynamic content that's currently visible
        if (!resultContainer.classList.contains('hidden') && seatNumberElement.textContent) {
            const seatNumberMatch = seatNumberElement.textContent.match(/\d+/);
            if (seatNumberMatch) {
                const seatNumber = seatNumberMatch[0];
                seatNumberElement.textContent = getSeatNumberText(seatNumber, window.currentLanguage);
            }
        }
    }

    // Make the applyTranslations function globally available
    window.applyTranslations = applyTranslations;

    // UPDATED: Find guest function with cross-side search capability
    function findGuest(searchName, selectedSide) {
        // Make sure guestList exists
        if (!window.guestList || !Array.isArray(window.guestList)) {
            console.error('Guest list is not properly initialized');
            return { guest: null, foundOnOppositeSide: false };
        }

        console.log(`Finding guest: name="${searchName}", selected side="${selectedSide}"`);

        // IMPROVEMENT: Make search more robust by trimming spaces, handling special characters, etc.
        const normalizedSearchName = searchName.toLowerCase().trim();

        // Step 1: Try to find the guest on the selected side
        let guest = findGuestOnSide(normalizedSearchName, selectedSide);
        
        // Step 2: If not found, try the opposite side
        if (!guest) {
            const oppositeSide = selectedSide.toLowerCase() === 'bride' ? 'groom' : 'bride';
            console.log(`Guest not found on ${selectedSide} side, trying ${oppositeSide} side`);
            
            const oppositeGuest = findGuestOnSide(normalizedSearchName, oppositeSide);
            
            if (oppositeGuest) {
                console.log(`Found guest on ${oppositeSide} side instead`);
                return { 
                    guest: oppositeGuest, 
                    foundOnOppositeSide: true, 
                    oppositeSide: oppositeSide 
                };
            }
        }

        // Return the result with flag indicating if found on selected side
        return { 
            guest: guest, 
            foundOnOppositeSide: false 
        };
    }

    // Helper function to find a guest on a specific side
    function findGuestOnSide(normalizedSearchName, side) {
        // First try an exact match - case insensitive
        const exactMatch = window.guestList.find(guest => {
            // Convert to lowercase and trim for case-insensitive comparison
            const guestNameNormalized = (guest.name || "").toLowerCase().trim();
            const vietnameseNameNormalized = (guest.vietnamese_name || "").toLowerCase().trim();

            // Compare with guest side - convert to lowercase for consistent comparison
            const guestSide = (guest.side || "").toLowerCase();
            const searchSide = side.toLowerCase();

            return guestSide === searchSide && (
                guestNameNormalized === normalizedSearchName ||
                vietnameseNameNormalized === normalizedSearchName
            );
        });

        if (exactMatch) {
            console.log("Found exact match:", exactMatch.name);
            return exactMatch;
        }

        // Then try partial matches
        const partialMatch = window.guestList.find(guest => {
            // Converting to lowercase and trimming
            const guestNameNormalized = (guest.name || "").toLowerCase().trim();
            const vietnameseNameNormalized = (guest.vietnamese_name || "").toLowerCase().trim();

            // Compare with guest side - convert to lowercase
            const guestSide = (guest.side || "").toLowerCase();
            const searchSide = side.toLowerCase();

            return guestSide === searchSide && (
                guestNameNormalized.includes(normalizedSearchName) ||
                normalizedSearchName.includes(guestNameNormalized) ||
                vietnameseNameNormalized.includes(normalizedSearchName) ||
                normalizedSearchName.includes(vietnameseNameNormalized)
            );
        });

        if (partialMatch) {
            console.log("Found partial match:", partialMatch.name);
            return partialMatch;
        }

        // If no exact or partial match, try fuzzy matching
        console.log("No exact or partial match found, trying fuzzy matching");
        return findClosestMatch(normalizedSearchName, side);
    }

    // Function to find the closest matching guest using fuzzy matching
    function findClosestMatch(searchName, side) {
        if (!window.guestList || !Array.isArray(window.guestList)) {
            return null;
        }

        // Filter guests by side - normalize to lowercase for consistent comparison
        const sideGuests = window.guestList.filter(guest =>
            (guest.side || "").toLowerCase() === side.toLowerCase()
        );

        // No guests on this side
        if (sideGuests.length === 0) {
            console.log(`No guests found on ${side} side`);
            return null;
        }

        let bestMatch = null;
        let bestScore = 0;

        // Calculate similarity score for each guest
        sideGuests.forEach(guest => {
            // Check similarity with English name
            const nameScore = calculateSimilarity(searchName, (guest.name || "").toLowerCase());

            // Check similarity with Vietnamese name if available
            let vnNameScore = 0;
            if (guest.vietnamese_name) {
                vnNameScore = calculateSimilarity(searchName, guest.vietnamese_name.toLowerCase());
            }

            // Use the better score between English and Vietnamese names
            const bestGuestScore = Math.max(nameScore, vnNameScore);

            // Only log for the best matches to avoid console spam
            if (bestGuestScore > 0.6) {
                console.log(`Guest "${guest.name}" similarity score: ${bestGuestScore.toFixed(2)}`);
            }

            // Update the best match if this score is better
            if (bestGuestScore > bestScore) {
                bestScore = bestGuestScore;
                bestMatch = guest;
            }
        });

        console.log(`Best match: ${bestMatch ? bestMatch.name : 'none'} with score ${bestScore.toFixed(2)}`);

        // VERY STRICT THRESHOLD: Only return a match if the similarity is above 0.85 (85% similar)
        // This only allows for 1-2 character typos, not completely different names
        return bestScore > 0.85 ? bestMatch : null;
    }

    // Function to calculate similarity between two strings
    function calculateSimilarity(str1, str2) {
        // Strict similarity algorithm using Levenshtein distance
        
        // First check for very similar strings (typos)
        const distance = levenshteinDistance(str1, str2);
        const maxLength = Math.max(str1.length, str2.length);
        
        // Calculate similarity based on edit distance
        const similarity = 1 - (distance / maxLength);
        
        // REMOVED containment bonus to be stricter - only pure similarity counts
        // This prevents partial matches from inflating the score
        
        return similarity;
    }
    
    // Helper function to calculate Levenshtein distance (edit distance)
    function levenshteinDistance(str1, str2) {
        const matrix = [];
        
        // If strings are equal, distance is 0
        if (str1 === str2) return 0;
        
        // If one string is empty, distance is length of the other
        if (str1.length === 0) return str2.length;
        if (str2.length === 0) return str1.length;
        
        // Initialize the matrix
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        // Calculate distances
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,  // substitution
                        matrix[i][j - 1] + 1,       // insertion
                        matrix[i - 1][j] + 1        // deletion
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    // Function to highlight a table, including VIP table (ID 46)
    function highlightTable(tableId) {
        console.log('Highlighting table:', tableId);
        
        // Remove highlight from all tables and fixed elements
        document.querySelectorAll('.table, .fixed-element').forEach(element => {
            element.classList.remove('highlighted');
        });
        
        // Convert tableId to a number if it's a string
        const tableIdNum = parseInt(tableId);
        
        // Check if this is the VIP table (table 46)
        if (tableIdNum === 46) {
            // Multiple approaches to find the VIP table element
            let vipElementFound = false;
            
            // Approach 1: Find by ID containing "vipTable"
            const vipElements = document.querySelectorAll('[id*="vipTable"]');
            if (vipElements.length > 0) {
                vipElements.forEach(element => {
                    element.classList.add('highlighted');
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    vipElementFound = true;
                });
            }
            
            // Approach 2: Find by data attribute
            if (!vipElementFound) {
                const dataElements = document.querySelectorAll('[data-table-id="46"]');
                if (dataElements.length > 0) {
                    dataElements.forEach(element => {
                        element.classList.add('highlighted');
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        vipElementFound = true;
                    });
                }
            }
            
            // Approach 3: Find by class and text content
            if (!vipElementFound) {
                const fixedElements = document.querySelectorAll('.fixed-element');
                for (const element of fixedElements) {
                    if (element.textContent.toLowerCase().includes('vip')) {
                        element.classList.add('highlighted');
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        vipElementFound = true;
                        break;
                    }
                }
            }
            
            if (!vipElementFound) {
                console.error('VIP Table element could not be found');
            }
        } else {
            // Regular table highlighting
            const tableElement = document.getElementById(`table-${tableIdNum}`);
            if (tableElement) {
                tableElement.classList.add('highlighted');
                tableElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                console.error(`Table element with ID table-${tableIdNum} not found`);
            }
        }
        
        return true; // Return success
    }

    // Function to display guest information
    function displayGuestInfo(guest) {
        if (!guest) {
            console.error("displayGuestInfo called with null guest");
            return;
        }

        console.log("Displaying guest info:", guest);

        // Show the result container
        resultContainer.classList.remove('hidden');

        // Set guest name
        if (guestNameElement) {
            guestNameElement.textContent = guest.name;
        }

        // Check if this is a VIP table guest
        const isVipGuest = guest.table === 46 || (guest.tableObject && guest.tableObject.id === 46);

        // Set table name based on whether it's a VIP table
        if (tableNameElement) {
            if (isVipGuest) {
                // Get the correct translation for VIP Table
                const vipTableText = window.currentLanguage === 'vi' ? 'Bàn VIP' : 'VIP Table';
                tableNameElement.textContent = vipTableText;
            } else if (guest.tableObject && guest.tableObject.name) {
                tableNameElement.textContent = guest.tableObject.name;
            } else {
                tableNameElement.textContent = `Table ${guest.table}`;
            }
        }

        // Set seat number
        if (seatNumberElement) {
            seatNumberElement.textContent = guest.seat ? getSeatNumberText(guest.seat, window.currentLanguage) : '';
        }

        // Highlight the table
        highlightTable(guest.table);

        // Display tablemates
        if (tablematesListElement) {
            tablematesListElement.innerHTML = ''; // Clear previous list

            // Find tablemates based on guest's table
            let tablemates = [];
            
            if (isVipGuest) {
                // For VIP guests, find other VIP guests
                tablemates = window.guestList.filter(g => 
                    (g.table === 46 || (g.tableObject && g.tableObject.id === 46)) && 
                    g.name !== guest.name
                );
            } else if (guest.tableObject && guest.tableObject.guests) {
                // Use the tableObject's guest list if available
                tablemates = guest.tableObject.guests.filter(g => g.name !== guest.name);
            } else if (guest.table) {
                // Otherwise find guests at the same table number
                tablemates = window.guestList.filter(g => 
                    g.table === guest.table && 
                    g.name !== guest.name
                );
            }
            
            console.log("Tablemates:", tablemates);

            if (tablemates.length > 0) {
                tablemates.forEach(tablemate => {
                    const li = document.createElement('li');
                    li.textContent = tablemate.name;
                    tablematesListElement.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.textContent = window.currentLanguage === 'en' ? 'No other guests at this table' : 'Không có khách nào khác ở bàn này';
                tablematesListElement.appendChild(li);
            }
        }
    }

    // Function to get the correct seat number text based on the language
    function getSeatNumberText(seatNumber, lang) {
        if (lang === 'vi') {
            return `Số ghế của bạn là: ${seatNumber}`;
        } else {
            return `Your seat number is: ${seatNumber}`;
        }
    }

    // Updated searchGuest function to handle results from both sides
    function searchGuest() {
        console.log("Search function called");

        // Check if guest list exists and venue layout exists
        if (!window.guestList || !Array.isArray(window.guestList) || window.guestList.length === 0) {
            console.error("Guest list is not properly loaded. Current value:", window.guestList);

            // Try loading sample data if available
            if (typeof window.loadSampleGuestData === 'function') {
                console.log("Attempting to load sample guest data");
                window.loadSampleGuestData();
            } else {
                const errorMsg = document.getElementById('errorMessage');
                if (errorMsg) {
                    errorMsg.textContent = "Error: Guest list not loaded. Please try refreshing the page.";
                    errorMsg.classList.remove('hidden');
                }
                return;
            }
        }

        // Make sure venue layout exists
        if (!window.venueLayout || !window.venueLayout.tables) {
            console.error("Venue layout is not properly loaded. Current value:", window.venueLayout);
            if (typeof window.initializeVenueMap === 'function') {
                console.log("Attempting to initialize venue map");
                window.initializeVenueMap();
            }
        }

        // Get the search input and normalize it
        const searchName = nameSearchInput.value.trim().toLowerCase();

        // Get the selected side
        const sideInput = document.querySelector('input[name="side"]:checked');
        if (!sideInput) {
            console.error("No side selected");
            return;
        }
        const selectedSide = sideInput.value;

        console.log(`Searching for "${searchName}" on "${selectedSide}" side`);

        // ADDED DEBUG: Log the guest list for debugging
        if (window.guestList) {
            console.log("Available guests sample:", window.guestList.slice(0, 5).map(g => `${g.name} (Table ${g.table}, Side: ${g.side})`));
        }

        // Hide previous results
        resultContainer.classList.add('hidden');
        noResultContainer.classList.add('hidden');

        // Don't search if input is empty
        if (!searchName) {
            console.log("Search input is empty");
            return;
        }

        // Find the guest in our data, potentially on either side
        const result = findGuest(searchName, selectedSide);
        
        if (result.guest) {
            console.log("Guest found:", result.guest, "On opposite side:", result.foundOnOppositeSide);
            const guest = result.guest;

            // ADDED: Make sure guest has a tableObject
            if (!guest.tableObject && guest.table) {
                // Try to find the table in venueLayout
                if (window.venueLayout && window.venueLayout.tables) {
                    guest.tableObject = window.venueLayout.tables.find(t => t.id === parseInt(guest.table));
                    console.log("Added tableObject to guest:", guest.tableObject);
                }
            }

            // Display guest information
            displayGuestInfo(guest);

            // Create or update a notice for opposite side or fuzzy match
            let noticeEl = document.getElementById('searchNotice');
            if (!noticeEl) {
                noticeEl = document.createElement('p');
                noticeEl.id = 'searchNotice';
                noticeEl.style.fontStyle = 'italic';
                noticeEl.style.marginTop = '10px';
                noticeEl.style.fontSize = '0.9rem';
                
                // Insert it after the guest name
                const guestNameElement = document.getElementById('guestName');
                if (guestNameElement && guestNameElement.parentNode) {
                    guestNameElement.parentNode.insertBefore(noticeEl, guestNameElement.nextSibling);
                }
            }
            
            // Apply styles to notice based on the type of message
            if (result.foundOnOppositeSide) {
                noticeEl.setAttribute('data-notice-type', 'opposite-side');
                noticeEl.style.color = '#e67e22'; // Orange for warning
                noticeEl.style.backgroundColor = '#fef9e7';
                noticeEl.style.padding = '10px';
                noticeEl.style.borderRadius = '5px';
                noticeEl.style.border = '1px solid #fadbd8';
                
                // Toggle the radio button to reflect the actual side
                const oppositeSideInput = document.querySelector(`input[name="side"][value="${result.oppositeSide}"]`);
                if (oppositeSideInput) {
                    oppositeSideInput.checked = true;
                }
                
                // Set the message based on language
                const oppositeSideName = window.currentLanguage === 'en' 
                    ? (result.oppositeSide === 'bride' ? 'Bride' : 'Groom') 
                    : (result.oppositeSide === 'bride' ? 'Cô Dâu' : 'Chú Rể');
                    
                noticeEl.textContent = window.currentLanguage === 'en'
                    ? `Note: You selected the wrong side. "${guest.name}" is a guest of the ${oppositeSideName}.`
                    : `Lưu ý: Bạn đã chọn sai bên. "${guest.name}" là khách của ${oppositeSideName}.`;
            } 
            // Show fuzzy match notice if it's not an exact match
            else {
                const guestNameLower = guest.name.toLowerCase();
                const vietnameseLower = guest.vietnamese_name ? guest.vietnamese_name.toLowerCase() : '';
                const searchNameLower = nameSearchInput.value.toLowerCase().trim();
                
                if (guestNameLower !== searchNameLower && vietnameseLower !== searchNameLower) {
                    noticeEl.setAttribute('data-notice-type', 'fuzzy-match');
                    noticeEl.style.color = '#666'; // Gray for information
                    noticeEl.style.backgroundColor = 'transparent';
                    noticeEl.style.padding = '0';
                    noticeEl.style.border = 'none';
                    
                    const message = window.currentLanguage === 'en'
                        ? `Showing closest match for "${nameSearchInput.value}"`
                        : `Hiển thị kết quả gần nhất cho "${nameSearchInput.value}"`;

                    noticeEl.textContent = message;
                } else {
                    // No need for a notice if it's an exact match
                    noticeEl.remove();
                }
            }
        } else {
            console.log("Guest not found on either side");
            // Show no result message
            noResultContainer.classList.remove('hidden');
        }
    }

    // Make sure the highlightTable function is globally available
    window.highlightTable = highlightTable;
    window.displayGuestInfo = displayGuestInfo;
    window.getSeatNumberText = getSeatNumberText;
    window.searchGuest = searchGuest;

    // Initialize the application by loading data and setting up the UI
    if (typeof window.initializeFromCSV === 'function') {
        window.initializeFromCSV();
    } else {
        console.error("initializeFromCSV function not found. Ensure csv-processor.js is loaded.");
    }
});
