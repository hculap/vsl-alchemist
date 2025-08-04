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
                this.showAlert('Logowanie pomyślne!', 'success');
                this.hideAuth();
                this.loadDashboard();
            } else {
                this.showAlert(data.error || 'Logowanie nie powiodło się', 'error');
            }
        } catch (error) {
            this.showAlert('Błąd sieci. Spróbuj ponownie.', 'error');
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
                this.showAlert('Konto utworzone pomyślnie!', 'success');
                this.hideAuth();
                this.loadDashboard();
            } else {
                this.showAlert(data.error || 'Rejestracja nie powiodła się', 'error');
            }
        } catch (error) {
            this.showAlert('Błąd sieci. Spróbuj ponownie.', 'error');
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
                        <span>Witaj, ${this.user?.email || 'Użytkowniku'}!</span>
                        <button id="logoutBtn" class="btn btn-outline">Wyloguj się</button>
                    </div>
                </div>
            </nav>

            <div class="dashboard">
                <div class="container">
                    <div class="dashboard-header">
                        <h1>Panel Sterowania</h1>
                        <button id="newCampaignBtn" class="btn btn-primary">Nowa Kampania</button>
                    </div>

                    <div class="dashboard-nav">
                        <button class="tab-btn active" data-tab="profiles">Profile Biznesowe</button>
                        <button class="tab-btn" data-tab="campaigns">Kampanie</button>
                    </div>

                    <div id="profiles-tab" class="tab-content active">
                        <div class="card">
                            <h3>Utwórz Profil Biznesowy</h3>
                            <form id="profileForm">
                                <div class="form-group">
                                    <textarea id="offer" placeholder="Opisz swoją premium ofertę..." required></textarea>
                                </div>
                                <div class="form-group">
                                    <textarea id="avatar" placeholder="Opisz swojego idealnego klienta..." required></textarea>
                                </div>
                                <div class="form-group">
                                    <textarea id="problems" placeholder="Jakie problemy mają Twoi klienci?" required></textarea>
                                </div>
                                <div class="form-group">
                                    <textarea id="desires" placeholder="Czego najbardziej pragną Twoi klienci?" required></textarea>
                                </div>
                                <div class="form-group">
                                    <select id="tone" required>
                                        <option value="">Wybierz ton marki</option>
                                        <option value="Professional">Profesjonalny</option>
                                        <option value="Funny">Zabawny</option>
                                        <option value="Inspiring">Inspirujący</option>
                                        <option value="Direct">Bezpośredni</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="profileLanguage" style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Język:</label>
                                    <select id="profileLanguage" required>
                                        <option value="">Wybierz język</option>
                                    </select>
                                    <small style="color: #666; font-size: 0.9rem;">Język w którym będzie generowana treść dla tego profilu.</small>
                                </div>
                                <button type="submit" class="btn btn-primary">Zapisz Profil</button>
                            </form>
                        </div>

                        <div class="card">
                            <h3>Twoje Profile Biznesowe</h3>
                            <div id="profilesList" class="loading">
                                <div class="spinner"></div>
                                Ładowanie profili...
                            </div>
                        </div>
                    </div>

                    <div id="campaigns-tab" class="tab-content">
                        <div class="card">
                            <h3>Wygeneruj Nową Kampanię</h3>
                            <form id="campaignForm">
                                <div class="form-group">
                                    <select id="campaignProfile" required>
                                        <option value="">Wybierz profil biznesowy</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.5rem;">
                                        <label style="font-weight: 600;">Tytuł VSL:</label>
                                        <button type="button" id="generateTitlesBtn" class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
                                            ✨ Generuj Pomysły
                                        </button>
                                    </div>
                                    <input type="text" id="vslTitle" placeholder="Wprowadź tytuł VSL lub wygeneruj sugestie powyżej" required>
                                    <small style="color: #666; font-size: 0.9rem; margin-top: 0.25rem; display: block;">
                                        💡 Wskazówka: Użyj przycisku "Generuj Pomysły" aby otrzymać sugestie tytułów napędzane AI
                                    </small>
                                </div>

                                <div class="form-group">
                                    <label for="campaignLanguage" style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Język:</label>
                                    <select id="campaignLanguage">
                                        <option value="">Auto-wykryj z profilu</option>
                                    </select>
                                    <small style="color: #666; font-size: 0.9rem;">System automatycznie wykryje język z Twojego profilu biznesowego, lub możesz go nadpisać tutaj.</small>
                                </div>

                                <div id="titleSuggestions" style="display: none; margin-bottom: 1.5rem;">
                                    <h4 style="margin-bottom: 1rem; color: var(--primary-color);">💡 Sugestie Tytułów Wygenerowane przez AI:</h4>
                                    <p style="color: #666; font-size: 0.9rem; margin-bottom: 1rem;">Kliknij "Użyj Tego" aby wybrać tytuł, następnie przewiń w dół aby wygenerować kampanię.</p>
                                    <div id="titlesList" class="titles-grid"></div>
                                    <div style="text-align: center; margin-top: 1rem;">
                                        <button type="button" class="btn btn-outline" onclick="app.handleGenerateTitles()">
                                            🔄 Generuj Więcej Pomysłów
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="form-actions">
                                    <button type="submit" class="btn btn-primary btn-large">🚀 Wygeneruj Kampanię</button>
                                    <small style="color: #666; font-size: 0.9rem; margin-top: 0.5rem; display: block;">
                                        To utworzy skrypty VSL, reklamy wideo, kopię reklamową i nagłówki w wybranym języku.
                                    </small>
                                </div>
                            </form>
                        </div>

                        <div class="card">
                            <h3>Twoje Kampanie</h3>
                            <div id="campaignsList" class="loading">
                                <div class="spinner"></div>
                                Ładowanie kampanii...
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

        select.innerHTML = '<option value="">Polski (domyślny)</option>' +
            this.availableLanguages.map(lang => `
                <option value="${lang.code}">${lang.name}</option>
            `).join('');
        
        // Also populate the profile language select
        const profileLanguageSelect = document.getElementById('profileLanguage');
        if (profileLanguageSelect && this.availableLanguages) {
            profileLanguageSelect.innerHTML = '<option value="">Wybierz język</option>' +
                this.availableLanguages.map(lang => `
                    <option value="${lang.code}">${lang.name}</option>
                `).join('');
        }
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
                document.getElementById('profilesList').innerHTML = '<p>Nie znaleziono profili.</p>';
            }
        } catch (error) {
            console.error('Load profiles error:', error);
            document.getElementById('profilesList').innerHTML = '<p>Błąd ładowania profili.</p>';
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
                document.getElementById('campaignsList').innerHTML = '<p>Nie znaleziono kampanii.</p>';
            }
        } catch (error) {
            console.error('Load campaigns error:', error);
            document.getElementById('campaignsList').innerHTML = '<p>Błąd ładowania kampanii.</p>';
        }
    }

    displayProfiles(profiles) {
        const container = document.getElementById('profilesList');
        if (profiles.length === 0) {
            container.innerHTML = '<p>Brak profili biznesowych. Utwórz jeden powyżej!</p>';
            return;
        }

        container.innerHTML = `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Oferta</th>
                            <th>Ton</th>
                            <th>Język</th>
                            <th>Utworzono</th>
                            <th>Akcje</th>
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
                                    <button class="btn-small btn-outline" onclick="app.editProfile(${profile.id})">✏️ Edytuj</button>
                                    <button class="btn-small btn-danger" onclick="app.deleteProfile(${profile.id})">🗑️ Usuń</button>
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
            container.innerHTML = '<p>Brak kampanii. Wygeneruj jedną powyżej!</p>';
            return;
        }

        container.innerHTML = `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Tytuł Kampanii</th>
                            <th>Język</th>
                            <th>Utworzono</th>
                            <th>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${campaigns.map(campaign => `
                            <tr>
                                <td>
                                    <div class="campaign-cell">
                                        <strong>${campaign.title}</strong>
                                        <small>${campaign.content ? 'Treść wygenerowana' : 'Brak treści'}</small>
                                    </div>
                                </td>
                                <td><span class="language-badge">${this.getLanguageName(campaign.language || 'en')}</span></td>
                                <td>${new Date(campaign.created_at).toLocaleDateString()}</td>
                                <td>
                                    <button class="btn-small btn-primary" onclick="app.viewCampaign(${campaign.id})">👁️ Zobacz</button>
                                    <button class="btn-small btn-outline" onclick="app.exportCampaign(${campaign.id})">📥 Eksportuj</button>
                                    <button class="btn-small btn-danger" onclick="app.deleteCampaign(${campaign.id})">🗑️ Usuń</button>
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
            'en': 'Angielski',
            'pl': 'Polski', 
            'es': 'Hiszpański',
            'fr': 'Francuski',
            'de': 'Niemiecki'
        };
        return languageNames[code] || 'Polski';
    }

    populateProfileSelect(profiles) {
        const select = document.getElementById('campaignProfile');
        if (!select) return;

        select.innerHTML = '<option value="">Wybierz profil biznesowy</option>' +
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
            language: document.getElementById('profileLanguage').value,
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
                this.showAlert('Profil biznesowy utworzony pomyślnie!', 'success');
                document.getElementById('profileForm').reset();
                this.loadProfiles();
            } else {
                const data = await response.json();
                this.showAlert(data.error || 'Nie udało się utworzyć profilu', 'error');
            }
        } catch (error) {
            this.showAlert('Błąd sieci. Spróbuj ponownie.', 'error');
            console.error('Create profile error:', error);
        }
    }

    async handleGenerateTitles() {
        const profileSelect = document.getElementById('campaignProfile');
        const businessProfileId = parseInt(profileSelect.value);
        
        if (!businessProfileId) {
            this.showAlert('Proszę najpierw wybrać profil biznesowy', 'warning');
            return;
        }

        const generateBtn = document.getElementById('generateTitlesBtn');
        const originalText = generateBtn.textContent;
        generateBtn.textContent = '🔄 Generowanie...';
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
                this.showAlert('Sugestie tytułów wygenerowane! Wybierz jeden aby kontynuować.', 'success');
            } else {
                const data = await response.json();
                this.showAlert(data.error || 'Nie udało się wygenerować tytułów', 'error');
            }
        } catch (error) {
            this.showAlert('Błąd sieci. Spróbuj ponownie.', 'error');
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
                        <button class="btn-small btn-primary" onclick="app.selectTitle('${title.replace(/'/g, "\\'")}')">✓ Użyj Tego</button>
                    </div>
                </div>
            </div>
        `).join('');
        
        suggestionsDiv.style.display = 'block';
    }

    selectTitle(title) {
        document.getElementById('vslTitle').value = title;
        this.showAlert('Tytuł wybrany! Możesz teraz wygenerować swoją kampanię.', 'success');
        
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
        submitBtn.textContent = 'Generowanie...';
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
                this.showAlert('Kampania wygenerowana pomyślnie!', 'success');
                document.getElementById('campaignForm').reset();
                this.loadCampaigns();
                this.viewCampaignData(data.campaign);
            } else {
                const data = await response.json();
                this.showAlert(data.error || 'Nie udało się wygenerować kampanii', 'error');
            }
        } catch (error) {
            this.showAlert('Błąd sieci. Spróbuj ponownie.', 'error');
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
                this.showAlert('Nie udało się załadować szczegółów kampanii', 'error');
            }
        } catch (error) {
            this.showAlert('Błąd sieci. Spróbuj ponownie.', 'error');
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
                            <h2 class="section-title">📝 Skrypty VSL</h2>
                            <div class="version-tabs">
                                <button class="version-tab active" onclick="app.switchVersion('vsl-a')">Wersja A</button>
                                <button class="version-tab" onclick="app.switchVersion('vsl-b')">Wersja B</button>
                            </div>
                            <div id="vsl-a" class="version-content active">
                                <div class="markdown-content">${marked.parse(campaign.vsl.vslScriptA)}</div>
                            </div>
                            <div id="vsl-b" class="version-content">
                                <div class="markdown-content">${marked.parse(campaign.vsl.vslScriptB)}</div>
                            </div>
                        </div>

                        <div class="section">
                            <h2 class="section-title">🎬 Skrypty Reklam Wideo</h2>
                            <div class="scripts-grid">
                                ${campaign.ads.videoScripts.map((script, i) => `
                                    <div class="script-card">
                                        <h4 class="script-title">Skrypt Wideo ${i + 1}</h4>
                                        <div class="markdown-content">${marked.parse(script)}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="section">
                            <h2 class="section-title">✍️ Kopia Reklamowa</h2>
                            <div class="version-tabs">
                                <button class="version-tab active" onclick="app.switchVersion('copy-a')">Wersja A</button>
                                <button class="version-tab" onclick="app.switchVersion('copy-b')">Wersja B</button>
                            </div>
                            <div id="copy-a" class="version-content active">
                                <div class="markdown-content">${marked.parse(campaign.ads.adCopyA)}</div>
                            </div>
                            <div id="copy-b" class="version-content">
                                <div class="markdown-content">${marked.parse(campaign.ads.adCopyB)}</div>
                            </div>
                        </div>

                        <div class="section">
                            <h2 class="section-title">🎯 Nagłówki</h2>
                            <div class="headlines-grid">
                                <div class="headline-card">
                                    <h4>Nagłówek A</h4>
                                    <div class="headline-text">${campaign.ads.headlineA}</div>
                                </div>
                                <div class="headline-card">
                                    <h4>Nagłówek B</h4>
                                    <div class="headline-text">${campaign.ads.headlineB}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="campaign-actions">
                        <button class="btn btn-primary" onclick="app.exportCampaign(${campaign.id})">📥 Eksportuj Kampanię</button>
                        <button class="btn btn-outline" onclick="app.copyToClipboard()">📋 Skopiuj Wszystko</button>
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
                this.showAlert('Kampania wyeksportowana pomyślnie!', 'success');
            } else {
                this.showAlert('Nie udało się wyeksportować kampanii', 'error');
            }
        } catch (error) {
            this.showAlert('Błąd sieci. Spróbuj ponownie.', 'error');
            console.error('Export campaign error:', error);
        }
    }

    copyToClipboard() {
        const content = document.querySelector('.campaign-content').innerText;
        navigator.clipboard.writeText(content).then(() => {
            this.showAlert('Treść kampanii skopiowana do schowka!', 'success');
        }).catch(() => {
            this.showAlert('Nie udało się skopiować do schowka', 'error');
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
                this.showAlert('Nie udało się załadować profilu do edycji', 'error');
            }
        } catch (error) {
            this.showAlert('Błąd sieci. Spróbuj ponownie.', 'error');
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
                    <h2>Edytuj Profil Biznesowy</h2>
                    <form id="editProfileForm">
                        <div class="form-group">
                            <label>Oferta</label>
                            <textarea id="editOffer" required>${profile.offer}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Avatar Docelowy</label>
                            <textarea id="editAvatar" required>${profile.avatar}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Problemy</label>
                            <textarea id="editProblems" required>${profile.problems}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Pragnienia</label>
                            <textarea id="editDesires" required>${profile.desires}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Ton</label>
                            <select id="editTone" required>
                                <option value="Professional" ${profile.tone === 'Professional' ? 'selected' : ''}>Profesjonalny</option>
                                <option value="Funny" ${profile.tone === 'Funny' ? 'selected' : ''}>Zabawny</option>
                                <option value="Inspiring" ${profile.tone === 'Inspiring' ? 'selected' : ''}>Inspirujący</option>
                                <option value="Direct" ${profile.tone === 'Direct' ? 'selected' : ''}>Bezpośredni</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Język</label>
                            <select id="editLanguage" required>
                                ${this.availableLanguages ? this.availableLanguages.map(lang => 
                                    `<option value="${lang.code}" ${profile.language === lang.code ? 'selected' : ''}>${lang.name}</option>`
                                ).join('') : '<option value="pl" selected>Polski</option>'}
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Zapisz Zmiany</button>
                            <button type="button" class="btn btn-outline" onclick="this.closest('.modal').remove()">Anuluj</button>
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
                tone: document.getElementById('editTone').value,
                language: document.getElementById('editLanguage').value
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
                this.showAlert('Profil zaktualizowany pomyślnie!', 'success');
                document.querySelector('.modal').remove();
                this.loadProfiles();
            } else {
                const data = await response.json();
                this.showAlert(data.error || 'Nie udało się zaktualizować profilu', 'error');
            }
        } catch (error) {
            this.showAlert('Błąd sieci. Spróbuj ponownie.', 'error');
            console.error('Update profile error:', error);
        }
    }

    async deleteProfile(profileId) {
        if (!confirm('Czy na pewno chcesz usunąć ten profil biznesowy? Tej akcji nie można cofnąć.')) {
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
                this.showAlert('Profil usunięty pomyślnie!', 'success');
                this.loadProfiles();
            } else {
                const data = await response.json();
                this.showAlert(data.error || 'Nie udało się usunąć profilu', 'error');
            }
        } catch (error) {
            this.showAlert('Błąd sieci. Spróbuj ponownie.', 'error');
            console.error('Delete profile error:', error);
        }
    }

    async deleteCampaign(campaignId) {
        if (!confirm('Czy na pewno chcesz usunąć tę kampanię? Tej akcji nie można cofnąć.')) {
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
                this.showAlert('Kampania usunięta pomyślnie!', 'success');
                this.loadCampaigns();
            } else {
                const data = await response.json();
                this.showAlert(data.error || 'Nie udało się usunąć kampanii', 'error');
            }
        } catch (error) {
            this.showAlert('Błąd sieci. Spróbuj ponownie.', 'error');
            console.error('Delete campaign error:', error);
        }
    }
}

// Initialize the app
const app = new VSLAlchemist();

// Make app globally available for inline event handlers
window.app = app;