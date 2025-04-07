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

    // Make our helper functions globally available
    window.highlightTable = highlightTable;
    window.displayGuestInfo = displayGuestInfo;
    window.getSeatNumberText = getSeatNumberText;
    window.searchGuest = searchGuest;
    window.showDisambiguationUI = showDisambiguationUI;
    window.hideDisambiguationUI = hideDisambiguationUI;

    // Add CSS for disambiguation UI
    function addDisambiguationStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .disambiguation-container {
                background-color: white;
                padding: 25px;
                border-radius: 20px;
                box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
                margin: 30px auto;
                max-width: 700px;
                text-align: center;
                font-family: 'Lato', sans-serif;
                animation: fade-in 0.3s ease-out;
            }
            
            @keyframes fade-in {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .disambiguation-container h3 {
                font-family: 'Playfair Display', serif;
                font-size: 1.8rem;
                color: #333;
                margin-bottom: 15px;
            }
            
            .disambiguation-container p {
                font-size: 1.1rem;
                margin-bottom: 20px;
                color: #555;
            }
            
            .disambiguation-list {
                list-style-type: none;
                padding: 0;
                margin: 20px 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
            }
            
            .disambiguation-button {
                background-color: #c896e0;
                color: white;
                padding: 12px 25px;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                font-size: 0.95rem;
                width: 100%;
                min-width: 250px;
                text-align: center;
                font-family: 'Lato', sans-serif;
                transition: background-color 0.3s, transform 0.2s;
            }
            
            .disambiguation-button:hover {
                background-color: #b57ad1;
                transform: translateY(-2px);
            }
            
            .disambiguation-button:active {
                transform: translateY(1px);
            }
            
            #cancelDisambiguation {
                background-color: #f0f0f0;
                color: #666;
                padding: 10px 20px;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                font-size: 0.9rem;
                margin-top: 15px;
                transition: background-color 0.3s;
            }
            
            #cancelDisambiguation:hover {
                background-color: #e4e4e4;
            }
            
            .opposite-side-notice {
                color: #e67e22;
                background-color: #fef9e7;
                padding: 10px;
                margin: 10px auto 15px auto;
                border-radius: 5px;
                border: 1px solid #fadbd8;
                max-width: 90%;
            }
            
            @media (max-width: 768px) {
                .disambiguation-container {
                    padding: 20px;
                    margin: 20px 15px;
                }
                
                .disambiguation-container h3 {
                    font-size: 1.5rem;
                }
                
                .disambiguation-button {
                    min-width: 220px;
                }
            }
        `;
        
        document.head.appendChild(styleElement);
    }
    
    // Initialize the application
    function initializeApplication() {
        // Add disambiguation styles
        addDisambiguationStyles();
        
        // Make sure any existing disambiguation container is hidden at start
        hideDisambiguationUI();
        
        // Load guest data and initialize venue map
        if (typeof window.initializeFromCSV === 'function') {
            window.initializeFromCSV()
                .then(success => {
                    if (success) {
                        console.log('Guest data loaded successfully');
                    } else {
                        console.error('Failed to load guest data');
                    }
                })
                .catch(error => {
                    console.error('Error loading guest data:', error);
                });
        } else {
            console.error("initializeFromCSV function not found. Ensure csv-processor.js is loaded.");
        }
    }
    
    // Initialize the application
    initializeApplication();
});
