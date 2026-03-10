// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- FRONTEND ---
    const chatbotBtn = document.querySelector('.ai-chatbot-btn');
    const chatbotPanel = document.querySelector('.ai-chatbot-panel');
    const closeChatbot = document.querySelector('.close-chatbot');
    const sendBtn = document.querySelector('.send-btn');
    const inputField = document.querySelector('.chatbot-input input');
    const messagesContainer = document.querySelector('.chatbot-messages');

    if (chatbotBtn && chatbotPanel) {
        chatbotBtn.addEventListener('click', () => {
            chatbotPanel.classList.toggle('hidden');
            chatbotBtn.classList.remove('bubble-animation');
        });

        closeChatbot.addEventListener('click', () => {
            chatbotPanel.classList.add('hidden');
        });
    }

    // --- REAL AI BACKEND LOGIC ---
    async function sendAIResponse(userMessage) {
        // Add a temporary "Typing..." message
        const typingMsg = document.createElement('div');
        typingMsg.classList.add('message', 'bot');
        typingMsg.innerHTML = "<em>Analyzing your request...</em>";
        messagesContainer.appendChild(typingMsg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try {
            // Call the local Python API Server
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: userMessage })
            });
            
            const data = await response.json();
            
            // Remove the typing message
            messagesContainer.removeChild(typingMsg);
            
            // Show the real response from Python
            if (data.success) {
                addMessage(data.reply, 'bot');
            } else {
                addMessage("Sorry, the backend Database is having issues.", 'bot');
            }
        } catch (error) {
            if (messagesContainer.contains(typingMsg)) {
                messagesContainer.removeChild(typingMsg);
            }
            addMessage("⚠️ Server offline: Make sure the Python backend is running!", 'bot');
            console.error(error);
        }
    }

    function processUserMessage() {
        if (!inputField) return;
        const text = inputField.value.trim();
        if (text === '') return;

        addMessage(text, 'user');
        inputField.value = '';

        // Call the real Python Backend
        sendAIResponse(text);
    }

    function addMessage(text, sender) {
        if(!messagesContainer) return;

        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender);
        msgDiv.innerHTML = text; 
        messagesContainer.appendChild(msgDiv);
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    if(sendBtn) {
        sendBtn.addEventListener('click', processUserMessage);
    }
    
    if(inputField) {
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                processUserMessage();
            }
        });
    }

    // ==========================================
    // DOCUMENT CHECKER LOGIC (DRAG & DROP)
    // ==========================================
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileList = document.getElementById('file-list');
    const verifyBtn = document.getElementById('verify-btn');
    
    if (dropZone && fileInput) {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Highlight drop zone when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, unhighlight, false);
        });

        function highlight(e) {
            dropZone.classList.add('dragover');
        }

        function unhighlight(e) {
            dropZone.classList.remove('dragover');
        }

        // Handle dropped files
        dropZone.addEventListener('drop', handleDrop, false);

        function handleDrop(e) {
            let dt = e.dataTransfer;
            let files = dt.files;
            handleFiles(files);
        }

        // Handle selected files from browse button
        fileInput.addEventListener('change', function() {
            handleFiles(this.files);
        });

        let uploadedFiles = [];

        function handleFiles(files) {
            files = [...files];
            
            files.forEach(file => {
                // Simulate checking file size (Max 5MB)
                if(file.size > 5 * 1024 * 1024) {
                    alert(`File ${file.name} is too large. Max 5MB.`);
                    return;
                }
                
                uploadedFiles.push(file.name);
                renderFileList();
            });
        }

        function renderFileList() {
            fileList.innerHTML = '';
            uploadedFiles.forEach((fileName, index) => {
                const fileDiv = document.createElement('div');
                fileDiv.className = 'uploaded-file-item';
                
                let iconClass = 'fa-file';
                if(fileName.endsWith('.pdf')) iconClass = 'fa-file-pdf';
                if(fileName.endsWith('.jpg') || fileName.endsWith('.png')) iconClass = 'fa-image';

                fileDiv.innerHTML = `
                    <div class="file-name">
                        <i class="fa-regular ${iconClass}"></i>
                        <span>${fileName}</span>
                    </div>
                    <button class="file-remove" onclick="removeFile(${index})"><i class="fa-solid fa-trash"></i></button>
                `;
                fileList.appendChild(fileDiv);
            });
        }

        // Make removeFile global for the inline onclick attribute
        window.removeFile = function(index) {
            uploadedFiles.splice(index, 1);
            renderFileList();
        }

        // Simulate AI Verification when button is clicked
        if(verifyBtn) {
            verifyBtn.addEventListener('click', () => {
                const originalText = verifyBtn.innerHTML;
                verifyBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> AI Scanning Documents...';
                
                setTimeout(() => {
                    simulateVerificationResults();
                    verifyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Verification Complete';
                    verifyBtn.classList.remove('btn-primary');
                    verifyBtn.style.background = '#22c55e';
                    
                    setTimeout(() => {
                        verifyBtn.innerHTML = originalText;
                        verifyBtn.classList.add('btn-primary');
                        verifyBtn.style.background = '';
                    }, 3000);
                }, 1500);
            });
        }

        function simulateVerificationResults() {
            const hasIncome = uploadedFiles.some(f => f.toLowerCase().includes('income'));
            const hasAadhar = uploadedFiles.some(f => f.toLowerCase().includes('aadhar') || f.toLowerCase().includes('id'));
            const hasMarksheet = uploadedFiles.some(f => f.toLowerCase().includes('mark') || f.toLowerCase().includes('certificate'));
            
            let score = 25; // Base score for ID photo
            
            updateStatusItem('status-income', hasIncome, 'Income Certificate');
            if(hasIncome) score += 25;
            
            updateStatusItem('status-aadhar', hasAadhar, 'Aadhar Card');
            if(hasAadhar) score += 25;
            
            updateStatusItem('status-marksheet', hasMarksheet, 'Previous Year Marksheet');
            if(hasMarksheet) score += 25;
            
            // Update Readiness Bar
            const bar = document.getElementById('readiness-bar');
            const text = document.getElementById('readiness-text');
            
            bar.style.width = `${score}%`;
            bar.className = 'progress-fill';
            
            if(score < 50) {
                bar.classList.add('warning');
                text.innerText = `${score}% (Missing critical documents)`;
            } else if(score < 100) {
                bar.classList.add('good');
                text.innerText = `${score}% (Almost Ready)`;
            } else {
                bar.classList.add('perfect');
                text.innerText = `100% (Ready to Apply!)`;
            }
        }

        function updateStatusItem(elementId, isVerified, name) {
            const el = document.getElementById(elementId);
            if(!el) return;
            
            if(isVerified) {
                el.className = 'check-item verified';
                el.innerHTML = `
                    <div class="check-icon"><i class="fa-solid fa-check"></i></div>
                    <div class="check-details">
                        <h4>${name}</h4>
                        <p class="status-text text-success">Verified by AI Document Scanner</p>
                    </div>
                `;
            } else {
                el.className = 'check-item missing';
                el.innerHTML = `
                    <div class="check-icon"><i class="fa-solid fa-xmark"></i></div>
                    <div class="check-details">
                        <h4>${name}</h4>
                        <p class="status-text text-danger">Missing - Expected to be uploaded.</p>
                    </div>
                `;
            }
        }
    }

    // ==========================================
    // USER AUTHENTICATION (LOGIN & SIGNUP)
    // ==========================================
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const alertBox = document.getElementById('login-alert');
            const btn = document.getElementById('login-submit-btn');
            
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';
            
            try {
                const res = await fetch('http://localhost:5000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                
                if(data.success) {
                    alertBox.style.display = 'block';
                    alertBox.className = 'warning-box mb-3 p-3';
                    alertBox.style.background = 'rgba(34, 197, 94, 0.1)';
                    alertBox.style.color = '#22c55e';
                    alertBox.style.borderColor = '#22c55e';
                    alertBox.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${data.message}`;
                    setTimeout(() => window.location.href = 'index.html', 1500);
                } else {
                    alertBox.style.display = 'block';
                    alertBox.className = 'warning-box mb-3 p-3';
                    alertBox.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${data.message}`;
                }
            } catch (err) {
                alertBox.style.display = 'block';
                alertBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Error connecting to backend server. Is Python running?`;
            }
            btn.innerHTML = 'Login <i class="fa-solid fa-arrow-right"></i>';
        });
    }

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fname = document.getElementById('signup-fname').value;
            const lname = document.getElementById('signup-lname').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirm = document.getElementById('signup-confirm').value;
            const alertBox = document.getElementById('signup-alert');
            const btn = document.getElementById('signup-submit-btn');
            
            if (password !== confirm) {
                alertBox.style.display = 'block';
                alertBox.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> Passwords do not match.`;
                return;
            }

            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating account...';
            
            try {
                const res = await fetch('http://localhost:5000/api/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: `${fname} ${lname}`, email, password })
                });
                const data = await res.json();
                
                if(data.success) {
                    alertBox.style.display = 'block';
                    alertBox.style.background = 'rgba(34, 197, 94, 0.1)';
                    alertBox.style.color = '#22c55e';
                    alertBox.style.borderColor = '#22c55e';
                    alertBox.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${data.message} Redirecting to login...`;
                    setTimeout(() => window.location.href = 'login.html', 2000);
                } else {
                    alertBox.style.display = 'block';
                    alertBox.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${data.message}`;
                }
            } catch (err) {
                alertBox.style.display = 'block';
                alertBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Error connecting to backend server. Is Python running?`;
            }
            btn.innerHTML = 'Sign Up Now <i class="fa-solid fa-arrow-right"></i>';
        });
    }
});
