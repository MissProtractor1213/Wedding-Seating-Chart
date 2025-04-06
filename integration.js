// Add this to initialization.js or create a new integration.js file

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Wedding Seating Chart: Integration script loaded');
    
    // Make sure translations are globally available
    window.translations = translations;
    
    // Set default language as a global variable
    if (!window.currentLanguage) {
        window.currentLanguage = localStorage.getItem('weddinglanguage') || 'en';
    }
    
    // Function to load sample guest data as fallback
    window.loadSampleGuestData = function() {
        console.log("Loading sample guest data as fallback");
        
        // Sample data for testing - includes guests at various tables, not just Table 35
        const sampleGuests = [
            // Table 35 guests from example
            {name: "Tina Reckelbus", table: 35, tableObject: {id: 35, name: "Table 35"}, side: "bride"},
            {name: "Elan Reckelbus", table: 35, tableObject: {id: 35, name: "Table 35"}, side: "bride"},
            {name: "Lucy Tran", table: 35, tableObject: {id: 35, name: "Table 35"}, side: "bride"},
            {name: "Edwin Chen", table: 35, tableObject: {id: 35, name: "Table 35"}, side: "bride"},
            {name: "Mackenzie Cruz", table: 35, tableObject: {id: 35, name: "Table 35"}, side: "bride"},
            {name: "Teagan Stump", table: 35, tableObject: {id: 35, name: "Table 35"}, side: "bride"},
            {name: "Lorna Agyare", table: 35, tableObject: {id: 35, name: "Table 35"}, side: "bride"},
            {name: "Garrison Burgan", table: 35, tableObject: {id: 35, name: "Table 35"}, side: "bride"},
            {name: "Yvonne Nguyen", table: 35, tableObject: {id: 35, name: "Table 35"}, side: "bride"},
            {name: "MyViet Nguyen", table: 35, tableObject: {id: 35, name: "Table 35"}, side: "bride"},
            
            // Add sample guests for other tables to test highlighting for all tables
            {name: "John Smith", table: 1, tableObject: {id: 1, name: "Table 1"}, side: "bride"},
            {name: "Jane Doe", table: 1, tableObject: {id: 1, name: "Table 1"}, side: "bride"},
            
            {name: "Michael Johnson", table: 10, tableObject: {id: 10, name: "Table 10"}, side: "groom"},
            {name: "Sarah Williams", table: 10, tableObject: {id: 10, name: "Table 10"}, side: "groom"},
            
            {name: "Robert Brown", table: 20, tableObject: {id: 20, name: "Table 20"}, side: "groom"},
            {name: "Emily Davis", table: 20, tableObject: {id: 20, name: "Table 20"}, side: "groom"},
            
            {name: "David Wilson", table: 30, tableObject: {id: 30, name: "Table 30"}, side: "bride"},
            {name: "Jessica Taylor", table: 30, tableObject: {id: 30, name: "Table 30"}, side: "bride"},
            
            {name: "Thomas Miller", table: 40, tableObject: {id: 40, name: "Table 40"}, side: "groom"},
            {name: "Jennifer Moore", table: 40, tableObject: {id: 40, name: "Table 40"}, side: "groom"}
        ];
        
        // Store data globally
        window.guestList = sampleGuests;
        
        console.log("Sample data loaded with", sampleGuests.length, "guests at various tables");
        return true;
    };
    
    // Test function to highlight any table (for debugging)
    window.testHighlightTable = function(tableNumber) {
        console.log(`Testing highlight of Table ${tableNumber}`);
        
        // Call the highlightTable function to highlight the table
        if (typeof window.highlightTable === 'function') {
            window.highlightTable(tableNumber);
            console.log(`Called highlightTable function for Table ${tableNumber}`);
        } else {
            // Fallback if the function isn't available
            const tableElement = document.getElementById(`table-${tableNumber}`);
            if (tableElement) {
                // Remove highlight from all tables
                document.querySelectorAll('.table').forEach(table => {
                    table.classList.remove('highlighted');
                });
                
                // Add highlight to the specified table
                tableElement.classList.add('highlighted');
                tableElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                console.log(`Table ${tableNumber} highlighted directly`);
            } else {
                console.error(`Could not find table element for Table ${tableNumber}`);
            }
        }
        
        // Show the result container with table info
        const resultContainer = document.getElementById('resultContainer');
        if (resultContainer) {
            const tableNameElement = document.getElementById('tableName');
            if (tableNameElement) {
                tableNameElement.textContent = `Table ${tableNumber}`;
            }
            
            // Create a sample guest name
            const guestNameElement = document.getElementById('guestName');
            if (guestNameElement) {
                guestNameElement.textContent = `Test Guest at Table ${tableNumber}`;
            }
            
            // Show the container
            resultContainer.classList.remove('hidden');
            console.log(`Displayed test result for Table ${tableNumber}`);
        }
    };
    
    // Function to ensure all tables can be highlighted
    window.checkAllTables = function() {
        // Get all the table elements in the venue map
        const tables = document.querySelectorAll('.table');
        console.log(`Found ${tables.length} table elements in the venue map`);
        
        // Log the IDs of each table
        const tableIds = Array.from(tables).map(table => table.id);
        console.log('Table element IDs:', tableIds);
        
        // Check if there are any missing tables
        const missingTables = [];
        for (let i = 1; i <= 45; i++) {
            if (!document.getElementById(`table-${i}`)) {
                missingTables.push(i);
            }
        }
        
        if (missingTables.length > 0) {
            console.warn(`Missing table elements for tables: ${missingTables.join(', ')}`);
        } else {
            console.log('All tables (1-45) are present in the DOM');
        }
        
        // Test highlighting a few tables to ensure it works
        setTimeout(() => window.testHighlightTable(1), 1000);
        setTimeout(() => window.testHighlightTable(20), 2000);
        setTimeout(() => window.testHighlightTable(35), 3000);
        
        return {
            totalTables: tables.length,
            missingTables: missingTables
        };
    };
    
    // Add button to manually test table highlighting
    window.addTestButtons = function() {
        const testContainer = document.createElement('div');
        testContainer.style.position = 'fixed';
        testContainer.style.bottom = '10px';
        testContainer.style.right = '10px';
        testContainer.style.zIndex = '1000';
        testContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        testContainer.style.padding = '10px';
        testContainer.style.borderRadius = '5px';
        testContainer.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
        
        // Create a title
        const title = document.createElement('p');
        title.textContent = 'Test Table Highlighting:';
        title.style.marginBottom = '5px';
        title.style.fontSize = '12px';
        testContainer.appendChild(title);
        
        // Create three buttons to test different tables
        const tables = [1, 20, 35];
        tables.forEach(tableNum => {
            const button = document.createElement('button');
            button.textContent = `Table ${tableNum}`;
            button.style.fontSize = '12px';
            button.style.padding = '5px';
            button.style.margin = '2px';
            button.addEventListener('click', () => window.testHighlightTable(tableNum));
            testContainer.appendChild(button);
        });
        
        // Add a close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.fontSize = '10px';
        closeButton.style.padding = '3px';
        closeButton.style.marginTop = '5px';
        closeButton.style.backgroundColor = '#ffcccc';
        closeButton.addEventListener('click', () => testContainer.remove());
        testContainer.appendChild(closeButton);
        
        // Add the container to the document
        document.body.appendChild(testContainer);
    };
    
    // URL parameter check for debug mode
    if (window.location.href.includes('debug=true')) {
        console.log('Debug mode activated');
        setTimeout(window.addTestButtons, 2000);
    }
    
    console.log('Integration script initialization complete');
});
