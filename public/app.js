// VSL-Alchemist Frontend JavaScript

class VSLAlchemist {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        if (this.token) {
            this.loadDashboard();
        }
    }

    setupEventListeners() {
        // Auth modal controls
        document.getElementById('loginBtn').addEventListener('click', () => this.showAuth('login'));
        document.getElementById('signupBtn').addEventListener('click', () => this.showAuth('signup'));
        document.getElementById('ctaBtn').addEventListener('click', () => this.showAuth('signup'));

        // Modal controls
        document.querySelector('.close').addEventListener('click', () => this.hideAuth());
        document.getElementById('authModal').addEventListener('click', (e) => {
            if (e.target.id === 'authModal') this.hideAuth();
        });

        // Form switching
        document.getElementById('showSignup').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchAuthForm('signup');
        });
        document.getElementById('showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchAuthForm('login');
        });

        // Form submissions
        document.getElementById('loginFormElement').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('signupFormElement').addEventListener('submit', (e) => this.handleSignup(e));

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.hideAuth();
        });
    }

    showAuth(type = 'login') {
        document.getElementById('authModal').style.display = 'block';
        this.switchAuthForm(type);
    }

    hideAuth() {
        document.getElementById('authModal').style.display = 'none';
    }

    switchAuthForm(type) {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        
        if (type === 'login') {
            loginForm.style.display = 'block';
            signupForm.style.display = 'none';
        } else {
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('token', this.token);
                this.showAlert('Login successful!', 'success');
                this.hideAuth();
                this.loadDashboard();
            } else {
                this.showAlert(data.error || 'Login failed', 'error');
            }
        } catch (error) {
            this.showAlert('Network error. Please try again.', 'error');
            console.error('Login error:', error);
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('token', this.token);
                this.showAlert('Account created successfully!', 'success');
                this.hideAuth();
                this.loadDashboard();
            } else {
                this.showAlert(data.error || 'Registration failed', 'error');
            }
        } catch (error) {
            this.showAlert('Network error. Please try again.', 'error');
            console.error('Signup error:', error);
        }
    }

    async loadDashboard() {
        try {
            // Load dashboard HTML
            const dashboardHtml = await fetch('/dashboard.html');
            if (dashboardHtml.ok) {
                const html = await dashboardHtml.text();
                document.body.innerHTML = html;
                this.setupDashboardEventListeners();
                this.loadUserData();
            } else {
                // Fallback: create dashboard inline
                this.createDashboard();
            }
        } catch (error) {
            console.error('Dashboard load error:', error);
            this.createDashboard();
        }
    }

    createDashboard() {
        document.body.innerHTML = `
            <nav class="navbar">
                <div class="nav-container">
                    <div class="nav-brand">
                        <h2>🧪 VSL-Alchemist</h2>
                    </div>
                    <div class="nav-links">
                        <span>Welcome, ${this.user?.email || 'User'}!</span>
                        <button id="logoutBtn" class="btn btn-outline">Logout</button>
                    </div>
                </div>
            </nav>

            <div class="dashboard">
                <div class="container">
                    <div class="dashboard-header">
                        <h1>Dashboard</h1>
                        <button id="newCampaignBtn" class="btn btn-primary">New Campaign</button>
                    </div>

                    <div class="dashboard-nav">
                        <button class="tab-btn active" data-tab="profiles">Business Profiles</button>
                        <button class="tab-btn" data-tab="campaigns">Campaigns</button>
                    </div>

                    <div id="profiles-tab" class="tab-content active">
                        <div class="card">
                            <h3>Create Business Profile</h3>
                            <form id="profileForm">
                                <div class="form-group">
                                    <textarea id="offer" placeholder="Describe your high-ticket offer..." required></textarea>
                                </div>
                                <div class="form-group">
                                    <textarea id="avatar" placeholder="Describe your ideal client avatar..." required></textarea>
                                </div>
                                <div class="form-group">
                                    <textarea id="problems" placeholder="What problems do your clients face?" required></textarea>
                                </div>
                                <div class="form-group">
                                    <textarea id="desires" placeholder="What do your clients desire most?" required></textarea>
                                </div>
                                <div class="form-group">
                                    <select id="tone" required>
                                        <option value="">Select brand tone</option>
                                        <option value="Professional">Professional</option>
                                        <option value="Funny">Funny</option>
                                        <option value="Inspiring">Inspiring</option>
                                        <option value="Direct">Direct</option>
                                    </select>
                                </div>
                                <button type="submit" class="btn btn-primary">Save Profile</button>
                            </form>
                        </div>

                        <div class="card">
                            <h3>Your Business Profiles</h3>
                            <div id="profilesList" class="loading">
                                <div class="spinner"></div>
                                Loading profiles...
                            </div>
                        </div>
                    </div>

                    <div id="campaigns-tab" class="tab-content">
                        <div class="card">
                            <h3>Generate New Campaign</h3>
                            <form id="campaignForm">
                                <div class="form-group">
                                    <select id="campaignProfile" required>
                                        <option value="">Select business profile</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.5rem;">
                                        <label style="font-weight: 600;">VSL Title:</label>
                                        <button type="button" id="generateTitlesBtn" class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
                                            ✨ Generate Ideas
                                        </button>
                                    </div>
                                    <input type="text" id="vslTitle" placeholder="Enter your VSL title or generate suggestions above" required>
                                    <small style="color: #666; font-size: 0.9rem; margin-top: 0.25rem; display: block;">
                                        💡 Tip: Use the "Generate Ideas" button to get AI-powered title suggestions
                                    </small>
                                </div>

                                <div class="form-group">
                                    <label for="campaignLanguage" style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Language:</label>
                                    <select id="campaignLanguage">
                                        <option value="">Auto-detect from profile</option>
                                    </select>
                                    <small style="color: #666; font-size: 0.9rem;">The system will automatically detect the language from your business profile, or you can override it here.</small>
                                </div>

                                <div id="titleSuggestions" style="display: none; margin-bottom: 1.5rem;">
                                    <h4 style="margin-bottom: 1rem; color: var(--primary-color);">💡 AI-Generated Title Suggestions:</h4>
                                    <p style="color: #666; font-size: 0.9rem; margin-bottom: 1rem;">Click "Use This" to select a title, then scroll down to generate your campaign.</p>
                                    <div id="titlesList" class="titles-grid"></div>
                                    <div style="text-align: center; margin-top: 1rem;">
                                        <button type="button" class="btn btn-outline" onclick="app.handleGenerateTitles()">
                                            🔄 Generate More Ideas
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="form-actions">
                                    <button type="submit" class="btn btn-primary btn-large">🚀 Generate Campaign</button>
                                    <small style="color: #666; font-size: 0.9rem; margin-top: 0.5rem; display: block;">
                                        This will create VSL scripts, video ads, ad copy, and headlines in your selected language.
                                    </small>
                                </div>
                            </form>
                        </div>

                        <div class="card">
                            <h3>Your Campaigns</h3>
                            <div id="campaignsList" class="loading">
                                <div class="spinner"></div>
                                Loading campaigns...
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="alertMessage" class="alert" style="display: none;"></div>
        `;

        this.setupDashboardEventListeners();
        this.loadUserData();
    }

    setupDashboardEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                this.switchTab(tabId);
            });
        });

        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());

        // Forms
        document.getElementById('profileForm')?.addEventListener('submit', (e) => this.handleCreateProfile(e));
        document.getElementById('campaignForm')?.addEventListener('submit', (e) => this.handleGenerateCampaign(e));
        
        // Title generation
        document.getElementById('generateTitlesBtn')?.addEventListener('click', () => this.handleGenerateTitles());
    }

    switchTab(tabId) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabId}-tab`);
        });
    }

    async loadUserData() {
        await Promise.all([
            this.loadProfiles(),
            this.loadCampaigns(),
            this.loadLanguages()
        ]);
    }

    async loadLanguages() {
        try {
            const response = await fetch('/api/campaigns/languages', {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                this.availableLanguages = data.languages;
                this.populateLanguageSelect();
            }
        } catch (error) {
            console.error('Load languages error:', error);
        }
    }

    populateLanguageSelect() {
        const select = document.getElementById('campaignLanguage');
        if (!select || !this.availableLanguages) return;

        select.innerHTML = '<option value="">Auto-detect from profile</option>' +
            this.availableLanguages.map(lang => `
                <option value="${lang.code}">${lang.name}</option>
            `).join('');
    }

    async loadProfiles() {
        try {
            const response = await fetch('/api/profiles', {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                this.displayProfiles(data.profiles);
                this.populateProfileSelect(data.profiles);
            } else {
                document.getElementById('profilesList').innerHTML = '<p>No profiles found.</p>';
            }
        } catch (error) {
            console.error('Load profiles error:', error);
            document.getElementById('profilesList').innerHTML = '<p>Error loading profiles.</p>';
        }
    }

    async loadCampaigns() {
        try {
            const response = await fetch('/api/campaigns', {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                this.displayCampaigns(data.campaigns);
            } else {
                document.getElementById('campaignsList').innerHTML = '<p>No campaigns found.</p>';
            }
        } catch (error) {
            console.error('Load campaigns error:', error);
            document.getElementById('campaignsList').innerHTML = '<p>Error loading campaigns.</p>';
        }
    }

    displayProfiles(profiles) {
        const container = document.getElementById('profilesList');
        if (profiles.length === 0) {
            container.innerHTML = '<p>No business profiles yet. Create one above!</p>';
            return;
        }

        container.innerHTML = `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Offer</th>
                            <th>Tone</th>
                            <th>Language</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${profiles.map(profile => `
                            <tr>
                                <td>
                                    <div class="offer-cell">
                                        <strong>${profile.offer.substring(0, 60)}${profile.offer.length > 60 ? '...' : ''}</strong>
                                        <small>${profile.avatar.substring(0, 80)}${profile.avatar.length > 80 ? '...' : ''}</small>
                                    </div>
                                </td>
                                <td><span class="tone-badge tone-${profile.tone.toLowerCase()}">${profile.tone}</span></td>
                                <td><span class="language-badge">${this.getLanguageName(profile.language)}</span></td>
                                <td>${new Date(profile.created_at).toLocaleDateString()}</td>
                                <td>
                                    <button class="btn-small btn-outline" onclick="app.editProfile(${profile.id})">✏️ Edit</button>
                                    <button class="btn-small btn-danger" onclick="app.deleteProfile(${profile.id})">🗑️ Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    displayCampaigns(campaigns) {
        const container = document.getElementById('campaignsList');
        if (campaigns.length === 0) {
            container.innerHTML = '<p>No campaigns yet. Generate one above!</p>';
            return;
        }

        container.innerHTML = `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Campaign Title</th>
                            <th>Language</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${campaigns.map(campaign => `
                            <tr>
                                <td>
                                    <div class="campaign-cell">
                                        <strong>${campaign.title}</strong>
                                        <small>${campaign.content ? 'Content generated' : 'No content'}</small>
                                    </div>
                                </td>
                                <td><span class="language-badge">${this.getLanguageName(campaign.language || 'en')}</span></td>
                                <td>${new Date(campaign.created_at).toLocaleDateString()}</td>
                                <td>
                                    <button class="btn-small btn-primary" onclick="app.viewCampaign(${campaign.id})">👁️ View</button>
                                    <button class="btn-small btn-outline" onclick="app.exportCampaign(${campaign.id})">📥 Export</button>
                                    <button class="btn-small btn-danger" onclick="app.deleteCampaign(${campaign.id})">🗑️ Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    getLanguageName(code) {
        const languageNames = {
            'en': 'English',
            'pl': 'Polish', 
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German'
        };
        return languageNames[code] || 'English';
    }

    populateProfileSelect(profiles) {
        const select = document.getElementById('campaignProfile');
        if (!select) return;

        select.innerHTML = '<option value="">Select business profile</option>' +
            profiles.map(profile => `
                <option value="${profile.id}">${profile.offer.substring(0, 50)}...</option>
            `).join('');
    }

    async handleCreateProfile(e) {
        e.preventDefault();
        const formData = {
            offer: document.getElementById('offer').value,
            avatar: document.getElementById('avatar').value,
            problems: document.getElementById('problems').value,
            desires: document.getElementById('desires').value,
            tone: document.getElementById('tone').value,
        };

        try {
            const response = await fetch('/api/profiles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                this.showAlert('Business profile created successfully!', 'success');
                document.getElementById('profileForm').reset();
                this.loadProfiles();
            } else {
                const data = await response.json();
                this.showAlert(data.error || 'Failed to create profile', 'error');
            }
        } catch (error) {
            this.showAlert('Network error. Please try again.', 'error');
            console.error('Create profile error:', error);
        }
    }

    async handleGenerateTitles() {
        const profileSelect = document.getElementById('campaignProfile');
        const businessProfileId = parseInt(profileSelect.value);
        
        if (!businessProfileId) {
            this.showAlert('Please select a business profile first', 'warning');
            return;
        }

        const generateBtn = document.getElementById('generateTitlesBtn');
        const originalText = generateBtn.textContent;
        generateBtn.textContent = '🔄 Generating...';
        generateBtn.disabled = true;

        try {
            const response = await fetch('/api/campaigns/generate-titles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`,
                },
                body: JSON.stringify({ businessProfileId }),
            });

            if (response.ok) {
                const data = await response.json();
                this.displayTitleSuggestions(data.titles);
                this.showAlert('Title suggestions generated! Select one to continue.', 'success');
            } else {
                const data = await response.json();
                this.showAlert(data.error || 'Failed to generate titles', 'error');
            }
        } catch (error) {
            this.showAlert('Network error. Please try again.', 'error');
            console.error('Generate titles error:', error);
        } finally {
            generateBtn.textContent = originalText;
            generateBtn.disabled = false;
        }
    }

    displayTitleSuggestions(titles) {
        const suggestionsDiv = document.getElementById('titleSuggestions');
        const titlesList = document.getElementById('titlesList');
        
        titlesList.innerHTML = titles.map((title, index) => `
            <div class="title-suggestion">
                <div class="title-content">
                    <span class="title-text">${title}</span>
                    <div class="title-actions">
                        <button class="btn-small btn-primary" onclick="app.selectTitle('${title.replace(/'/g, "\\'")}')">✓ Use This</button>
                    </div>
                </div>
            </div>
        `).join('');
        
        suggestionsDiv.style.display = 'block';
    }

    selectTitle(title) {
        document.getElementById('vslTitle').value = title;
        this.showAlert('Title selected! You can now generate your campaign.', 'success');
        
        // Hide the suggestions after selection
        document.getElementById('titleSuggestions').style.display = 'none';
        
        // Scroll to the campaign form and highlight the generate button
        const campaignForm = document.getElementById('campaignForm');
        campaignForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add a subtle highlight to the generate button
        const generateBtn = campaignForm.querySelector('button[type="submit"]');
        generateBtn.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.3)';
        setTimeout(() => {
            generateBtn.style.boxShadow = '';
        }, 2000);
    }

    async handleGenerateCampaign(e) {
        e.preventDefault();
        const businessProfileId = parseInt(document.getElementById('campaignProfile').value);
        const vslTitle = document.getElementById('vslTitle').value;
        const language = document.getElementById('campaignLanguage').value;

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Generating...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/campaigns/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`,
                },
                body: JSON.stringify({ businessProfileId, vslTitle, language }),
            });

            if (response.ok) {
                const data = await response.json();
                this.showAlert('Campaign generated successfully!', 'success');
                document.getElementById('campaignForm').reset();
                this.loadCampaigns();
                this.viewCampaignData(data.campaign);
            } else {
                const data = await response.json();
                this.showAlert(data.error || 'Failed to generate campaign', 'error');
            }
        } catch (error) {
            this.showAlert('Network error. Please try again.', 'error');
            console.error('Generate campaign error:', error);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    async viewCampaign(campaignId) {
        try {
            const response = await fetch(`/api/campaigns/${campaignId}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                this.viewCampaignData(data.campaign);
            } else {
                this.showAlert('Failed to load campaign details', 'error');
            }
        } catch (error) {
            this.showAlert('Network error. Please try again.', 'error');
            console.error('View campaign error:', error);
        }
    }

    viewCampaignData(campaign) {
        // Configure marked.js for better rendering
        marked.setOptions({
            breaks: true,
            gfm: true,
            headerIds: false
        });

        // Create modal or new page to display campaign content
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content campaign-modal" style="max-width: 900px; max-height: 85vh; overflow-y: auto;">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <div class="campaign-content">
                    <div class="campaign-header">
                        <h1 class="campaign-title">${campaign.metadata.title}</h1>
                        <div class="campaign-meta">
                            <span class="meta-item">📅 ${new Date(campaign.metadata.generatedAt).toLocaleDateString()}</span>
                            <span class="meta-item">🎯 ${campaign.metadata.businessProfile.tone} Tone</span>
                        </div>
                    </div>
                    
                    <div class="campaign-sections">
                        <div class="section">
                            <h2 class="section-title">📝 VSL Scripts</h2>
                            <div class="version-tabs">
                                <button class="version-tab active" onclick="app.switchVersion('vsl-a')">Version A</button>
                                <button class="version-tab" onclick="app.switchVersion('vsl-b')">Version B</button>
                            </div>
                            <div id="vsl-a" class="version-content active">
                                <div class="markdown-content">${marked.parse(campaign.vsl.vslScriptA)}</div>
                            </div>
                            <div id="vsl-b" class="version-content">
                                <div class="markdown-content">${marked.parse(campaign.vsl.vslScriptB)}</div>
                            </div>
                        </div>

                        <div class="section">
                            <h2 class="section-title">🎬 Video Ad Scripts</h2>
                            <div class="scripts-grid">
                                ${campaign.ads.videoScripts.map((script, i) => `
                                    <div class="script-card">
                                        <h4 class="script-title">Video Script ${i + 1}</h4>
                                        <div class="markdown-content">${marked.parse(script)}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="section">
                            <h2 class="section-title">✍️ Ad Copy</h2>
                            <div class="version-tabs">
                                <button class="version-tab active" onclick="app.switchVersion('copy-a')">Version A</button>
                                <button class="version-tab" onclick="app.switchVersion('copy-b')">Version B</button>
                            </div>
                            <div id="copy-a" class="version-content active">
                                <div class="markdown-content">${marked.parse(campaign.ads.adCopyA)}</div>
                            </div>
                            <div id="copy-b" class="version-content">
                                <div class="markdown-content">${marked.parse(campaign.ads.adCopyB)}</div>
                            </div>
                        </div>

                        <div class="section">
                            <h2 class="section-title">🎯 Headlines</h2>
                            <div class="headlines-grid">
                                <div class="headline-card">
                                    <h4>Headline A</h4>
                                    <div class="headline-text">${campaign.ads.headlineA}</div>
                                </div>
                                <div class="headline-card">
                                    <h4>Headline B</h4>
                                    <div class="headline-text">${campaign.ads.headlineB}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="campaign-actions">
                        <button class="btn btn-primary" onclick="app.exportCampaign(${campaign.id})">📥 Export Campaign</button>
                        <button class="btn btn-outline" onclick="app.copyToClipboard()">📋 Copy All</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    switchVersion(versionId) {
        // Hide all version contents
        document.querySelectorAll('.version-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Remove active class from all tabs
        document.querySelectorAll('.version-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show selected version content
        document.getElementById(versionId).classList.add('active');
        
        // Add active class to clicked tab
        event.target.classList.add('active');
    }

    async exportCampaign(campaignId) {
        try {
            const response = await fetch(`/api/campaigns/${campaignId}/export`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `campaign-${campaignId}.json`;
                a.click();
                window.URL.revokeObjectURL(url);
                this.showAlert('Campaign exported successfully!', 'success');
            } else {
                this.showAlert('Failed to export campaign', 'error');
            }
        } catch (error) {
            this.showAlert('Network error. Please try again.', 'error');
            console.error('Export campaign error:', error);
        }
    }

    copyToClipboard() {
        const content = document.querySelector('.campaign-content').innerText;
        navigator.clipboard.writeText(content).then(() => {
            this.showAlert('Campaign content copied to clipboard!', 'success');
        }).catch(() => {
            this.showAlert('Failed to copy to clipboard', 'error');
        });
    }

    logout() {
        localStorage.removeItem('token');
        this.token = null;
        this.user = null;
        location.reload();
    }

    showAlert(message, type = 'success') {
        const alert = document.getElementById('alertMessage');
        alert.textContent = message;
        alert.className = `alert ${type}`;
        alert.style.display = 'block';

        setTimeout(() => {
            alert.style.display = 'none';
        }, 5000);
    }

    async editProfile(profileId) {
        try {
            const response = await fetch(`/api/profiles/${profileId}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                this.showEditProfileModal(data.profile);
            } else {
                this.showAlert('Failed to load profile for editing', 'error');
            }
        } catch (error) {
            this.showAlert('Network error. Please try again.', 'error');
            console.error('Edit profile error:', error);
        }
    }

    showEditProfileModal(profile) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <div style="padding: 2rem;">
                    <h2>Edit Business Profile</h2>
                    <form id="editProfileForm">
                        <div class="form-group">
                            <label>Offer</label>
                            <textarea id="editOffer" required>${profile.offer}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Target Avatar</label>
                            <textarea id="editAvatar" required>${profile.avatar}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Problems</label>
                            <textarea id="editProblems" required>${profile.problems}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Desires</label>
                            <textarea id="editDesires" required>${profile.desires}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Tone</label>
                            <select id="editTone" required>
                                <option value="Professional" ${profile.tone === 'Professional' ? 'selected' : ''}>Professional</option>
                                <option value="Funny" ${profile.tone === 'Funny' ? 'selected' : ''}>Funny</option>
                                <option value="Inspiring" ${profile.tone === 'Inspiring' ? 'selected' : ''}>Inspiring</option>
                                <option value="Direct" ${profile.tone === 'Direct' ? 'selected' : ''}>Direct</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Save Changes</button>
                            <button type="button" class="btn btn-outline" onclick="this.closest('.modal').remove()">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Handle form submission
        document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleUpdateProfile(profile.id, {
                offer: document.getElementById('editOffer').value,
                avatar: document.getElementById('editAvatar').value,
                problems: document.getElementById('editProblems').value,
                desires: document.getElementById('editDesires').value,
                tone: document.getElementById('editTone').value
            });
        });
    }

    async handleUpdateProfile(profileId, formData) {
        try {
            const response = await fetch(`/api/profiles/${profileId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                this.showAlert('Profile updated successfully!', 'success');
                document.querySelector('.modal').remove();
                this.loadProfiles();
            } else {
                const data = await response.json();
                this.showAlert(data.error || 'Failed to update profile', 'error');
            }
        } catch (error) {
            this.showAlert('Network error. Please try again.', 'error');
            console.error('Update profile error:', error);
        }
    }

    async deleteProfile(profileId) {
        if (!confirm('Are you sure you want to delete this business profile? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/profiles/${profileId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
            });

            if (response.ok) {
                this.showAlert('Profile deleted successfully!', 'success');
                this.loadProfiles();
            } else {
                const data = await response.json();
                this.showAlert(data.error || 'Failed to delete profile', 'error');
            }
        } catch (error) {
            this.showAlert('Network error. Please try again.', 'error');
            console.error('Delete profile error:', error);
        }
    }

    async deleteCampaign(campaignId) {
        if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/campaigns/${campaignId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
            });

            if (response.ok) {
                this.showAlert('Campaign deleted successfully!', 'success');
                this.loadCampaigns();
            } else {
                const data = await response.json();
                this.showAlert(data.error || 'Failed to delete campaign', 'error');
            }
        } catch (error) {
            this.showAlert('Network error. Please try again.', 'error');
            console.error('Delete campaign error:', error);
        }
    }
}

// Initialize the app
const app = new VSLAlchemist();

// Make app globally available for inline event handlers
window.app = app;