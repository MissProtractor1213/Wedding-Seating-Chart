// Improved table click functionality to fix modal closing issues

// Function to show table details when a table is clicked
function showTableDetails(tableId) {
    console.log(`Showing details for table ${tableId}`);
    
    // Make sure guest list exists
    if (!window.guestList || !Array.isArray(window.guestList)) {
        console.error('Guest list not available');
        return;
    }
    
    // Find all guests at this table
    const tableGuests = window.guestList.filter(guest => {
        // Include both normal table ID and tableObject ID for robustness
        return guest.table === tableId || 
               (guest.tableObject && guest.tableObject.id === tableId);
    });
    
    console.log(`Found ${tableGuests.length} guests at table ${tableId}`);
    
    // If we found guests, show the modal
    if (tableGuests.length > 0) {
        createAndShowTableModal(tableId, tableGuests);
    } else {
        // Check if this is an empty table 
        const table = window.venueLayout.tables.find(t => t.id === tableId);
        if (table) {
            createAndShowTableModal(tableId, []);
        } else {
            console.error(`Table ${tableId} not found in venue layout`);
        }
    }
    
    // Highlight the table
    if (typeof window.highlightTable === 'function') {
        window.highlightTable(tableId);
    }
}

// Improved function to properly clean up and close the modal
function closeTableModal() {
    // Remove the modal
    const modal = document.getElementById('tableDetailsModal');
    if (modal) {
        modal.remove();
    }
    
    // Remove the backdrop and ensure it's completely gone from the DOM
    const backdrop = document.getElementById('tableModalBackdrop');
    if (backdrop) {
        backdrop.remove();
    }
    
    // Remove any lingering event listeners that might be blocking clicks
    document.removeEventListener('click', window._tempBackdropClickHandler);
    
    // Remove highlighting from all tables
    document.querySelectorAll('.table, .fixed-element').forEach(element => {
        element.classList.remove('highlighted');
    });
    
    // Make sure there are no invisible elements blocking clicks
    const invisibleElements = document.querySelectorAll('div[style*="position: fixed"][style*="z-index"]');
    invisibleElements.forEach(element => {
        // Only remove if it's related to our modal functionality
        if (element.id === 'tableDetailsModal' || element.id === 'tableModalBackdrop' || 
            element.classList.contains('modal-related')) {
            element.remove();
        }
    });
    
    console.log('Modal and backdrop completely removed from DOM');
}

// Function to create and show the table details modal with improved event handling
function createAndShowTableModal(tableId, tableGuests) {
    // First, ensure any existing modal is properly closed
    closeTableModal();
    
    // Get current language for translations
    const lang = window.currentLanguage || 'en';
    
    // Create modal container
    const modal = document.createElement('div');
    modal.id = 'tableDetailsModal';
    modal.className = 'table-modal';
    
    // Set modal styles
    modal.style.position = 'fixed';
    modal.style.left = '50%';
    modal.style.top = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.maxWidth = '400px';
    modal.style.width = '90%';
    modal.style.backgroundColor = 'white';
    modal.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
    modal.style.borderRadius = '15px';
    modal.style.padding = '25px';
    modal.style.zIndex = '1000';
    modal.style.maxHeight = '80vh';
    modal.style.overflowY = 'auto';
    
    // Get table name - different for VIP table
    let tableName;
    if (tableId === 46) {
        tableName = lang === 'en' ? 'VIP Table' : 'Bàn VIP';
    } else {
        // Find the table from the venue layout
        const tableObj = window.venueLayout.tables.find(t => t.id === tableId);
        tableName = tableObj && tableObj.name ? tableObj.name : `Table ${tableId}`;
    }
    
    // Create modal content
    const modalContent = document.createElement('div');
    
    // Create title
    const title = document.createElement('h3');
    title.textContent = tableName;
    title.style.textAlign = 'center';
    title.style.color = '#333';
    title.style.fontFamily = "'Playfair Display', serif";
    title.style.fontSize = '1.8rem';
    title.style.marginBottom = '15px';
    
    // Create divider
    const divider = document.createElement('div');
    divider.className = 'divider';
    divider.innerHTML = `
        <span class="divider-line" style="height: 1px; width: 100px; background-color: #e0c8ae; display: inline-block;"></span>
        <span class="heart-icon" style="display: inline-block; margin: 0 15px; color: #e0c8ae; font-size: 1.2rem;">🌸</span>
        <span class="divider-line" style="height: 1px; width: 100px; background-color: #e0c8ae; display: inline-block;"></span>
    `;
    divider.style.display = 'flex';
    divider.style.alignItems = 'center';
    divider.style.justifyContent = 'center';
    divider.style.margin = '20px 0';
    
    // Create subtitle
    const subtitle = document.createElement('h4');
    subtitle.textContent = lang === 'en' ? 'Guests at this table:' : 'Khách tại bàn này:';
    subtitle.style.fontFamily = "'Lato', sans-serif";
    subtitle.style.fontSize = '1.2rem';
    subtitle.style.color = '#666';
    subtitle.style.textAlign = 'center';
    subtitle.style.marginBottom = '15px';
    
    // Create guest list
    const guestList = document.createElement('ul');
    guestList.style.listStyleType = 'none';
    guestList.style.padding = '0';
    guestList.style.display = 'flex';
    guestList.style.flexDirection = 'column';
    guestList.style.alignItems = 'center';
    guestList.style.gap = '10px';
    
    if (tableGuests.length > 0) {
        tableGuests.forEach(guest => {
            const listItem = document.createElement('li');
            listItem.textContent = guest.name;
            listItem.style.backgroundColor = '#f5f1ed';
            listItem.style.padding = '10px 20px';
            listItem.style.borderRadius = '20px';
            listItem.style.minWidth = '150px';
            listItem.style.textAlign = 'center';
            guestList.appendChild(listItem);
        });
    } else {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = lang === 'en' ? 'No guests assigned to this table' : 'Không có khách được phân công cho bàn này';
        emptyMessage.style.fontStyle = 'italic';
        emptyMessage.style.color = '#888';
        guestList.appendChild(emptyMessage);
    }
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.textContent = lang === 'en' ? 'Close' : 'Đóng';
    closeButton.style.backgroundColor = '#c896e0';
    closeButton.style.color = 'white';
    closeButton.style.padding = '12px 25px';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '10px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '0.9rem';
    closeButton.style.marginTop = '20px';
    closeButton.style.width = '100%';
    closeButton.style.fontFamily = "'Lato', sans-serif";
    closeButton.style.letterSpacing = '1px';
    
    // Improved close button click handler
    closeButton.addEventListener('click', function(event) {
        // Prevent event from propagating
        event.stopPropagation();
        closeTableModal();
    });
    
    // Create backdrop with improved event handling
    const backdrop = document.createElement('div');
    backdrop.id = 'tableModalBackdrop';
    backdrop.style.position = 'fixed';
    backdrop.style.top = '0';
    backdrop.style.left = '0';
    backdrop.style.width = '100%';
    backdrop.style.height = '100%';
    backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    backdrop.style.zIndex = '999';
    
    // Store the click handler so we can remove it later
    window._tempBackdropClickHandler = function(event) {
        // Only close if clicking directly on the backdrop, not on the modal
        if (event.target === backdrop) {
            closeTableModal();
        }
    };
    
    // Use capturing phase to handle clicks before they reach other elements
    backdrop.addEventListener('click', window._tempBackdropClickHandler);
    
    // Prevent clicks on the modal from closing it
    modal.addEventListener('click', function(event) {
        event.stopPropagation();
    });
    
    // Also add escape key to close modal
    const escKeyHandler = function(event) {
        if (event.key === 'Escape') {
            closeTableModal();
            document.removeEventListener('keydown', escKeyHandler);
        }
    };
    document.addEventListener('keydown', escKeyHandler);
    
    // Assemble modal
    modalContent.appendChild(title);
    modalContent.appendChild(divider);
    modalContent.appendChild(subtitle);
    modalContent.appendChild(guestList);
    modalContent.appendChild(closeButton);
    
    modal.appendChild(modalContent);
    
    // Add to the document
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
    
    // Add animation
    modal.style.opacity = '0';
    modal.style.transform = 'translate(-50%, -48%)';
    modal.style.transition = 'opacity 0.3s, transform 0.3s';
    
    // Trigger animation
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.transform = 'translate(-50%, -50%)';
    }, 10);
}

// Enhanced venue map initialization to add click handlers for tables
function enhanceVenueMap() {
    // Check if the original initializeVenueMap exists
    if (!window.originalInitVenueMap && window.initializeVenueMap) {
        // Store the original function
        window.originalInitVenueMap = window.initializeVenueMap;
        
        // Replace with our enhanced version
        window.initializeVenueMap = function() {
            // Call the original function
            const result = window.originalInitVenueMap.apply(this, arguments);
            
            // After the map is initialized, add click handlers to all tables
            const tables = document.querySelectorAll('.table');
            
            tables.forEach(table => {
                // Extract the table ID from the element ID (format: "table-X")
                const tableId = parseInt(table.id.split('-')[1]);
                
                // Remove any existing click handlers
                const oldHandler = table._tableClickHandler;
                if (oldHandler) {
                    table.removeEventListener('click', oldHandler);
                }
                
                // Create a new click handler with event stopping
                table._tableClickHandler = function(event) {
                    // Stop the event from propagating up
                    event.stopPropagation();
                    showTableDetails(tableId);
                };
                
                // Add the click handler
                table.addEventListener('click', table._tableClickHandler);
                
                // Add a title attribute for better UX
                table.title = window.currentLanguage === 'en' ? 
                    'Click to see guests at this table' : 
                    'Nhấp để xem khách tại bàn này';
                    
                // Add a cursor style to indicate it's clickable
                table.style.cursor = 'pointer';
            });
            
            // Also add click handlers to VIP table (it's a fixed element)
            const vipElements = document.querySelectorAll('[data-is-vip="true"], [id*="vipTable"]');
            vipElements.forEach(element => {
                // Remove any existing click handlers
                const oldHandler = element._vipClickHandler;
                if (oldHandler) {
                    element.removeEventListener('click', oldHandler);
                }
                
                // Create new click handler for VIP table with event stopping
                element._vipClickHandler = function(event) {
                    // Stop the event from propagating
                    event.stopPropagation();
                    showTableDetails(46); // VIP table is ID 46
                };
                
                // Add the click handler
                element.addEventListener('click', element._vipClickHandler);
                
                // Add a title attribute for better UX
                element.title = window.currentLanguage === 'en' ? 
                    'Click to see VIP guests' : 
                    'Nhấp để xem khách VIP';
                    
                // Add a cursor style to indicate it's clickable
                element.style.cursor = 'pointer';
            });
            
            console.log('Added improved table click handlers to venue map');
            return result;
        };
    }
}

// Make sure our functions are available globally
window.showTableDetails = showTableDetails;
window.createAndShowTableModal = createAndShowTableModal;
window.closeTableModal = closeTableModal;
window.enhanceVenueMap = enhanceVenueMap;

// When the document is loaded, initialize our enhancements
document.addEventListener('DOMContentLoaded', function() {
    console.log('Enhancing table click functionality');
    
    // Enhance the venue map initialization function
    enhanceVenueMap();
    
    // If the venue map is already initialized, add our improved click handlers
    setTimeout(function() {
        const tables = document.querySelectorAll('.table');
        if (tables.length > 0) {
            console.log('Found existing tables, adding improved click handlers');
            tables.forEach(table => {
                // Extract the table ID from the element ID (format: "table-X")
                const tableId = parseInt(table.id.split('-')[1]);
                
                // Remove any existing click handlers
                const oldHandler = table._tableClickHandler;
                if (oldHandler) {
                    table.removeEventListener('click', oldHandler);
                }
                
                // Add improved click handler with event stopping
                table._tableClickHandler = function(event) {
                    // Stop the event from propagating
                    event.stopPropagation();
                    showTableDetails(tableId);
                };
                
                // Add the click handler
                table.addEventListener('click', table._tableClickHandler);
                
                // Add cursor style
                table.style.cursor = 'pointer';
            });
        }
    }, 500); // Short delay to ensure the DOM is fully processed
});

// Check for any existing modal or backdrop on page load and clean them up
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        closeTableModal(); // Clean up any lingering modals
    }, 300);
});
