$(document).ready(function () {
  const apiKey = 'ba34491fa75542429d4cd05cccb43e21';
  const topHeadlinesUrl = 'https://newsapi.org/v2/top-headlines';
  const everythingUrl = 'https://newsapi.org/v2/everything';
  const defaultCategory = 'technology';
  const countryMap = {
    us: 'us', usa: 'us', america: 'us', 'united states': 'us',
    in: 'in', india: 'in', pk: 'pk', pakistan: 'pk',
    ca: 'ca', canada: 'ca', au: 'au', australia: 'au',
    gb: 'gb', uk: 'gb', 'united kingdom': 'gb',
    de: 'de', germany: 'de', fr: 'fr', france: 'fr',
    jp: 'jp', japan: 'jp', ae: 'ae', dubai: 'ae'
  };
  const categoryMap = {
    technology: 'technology', business: 'business', sports: 'sports',
    health: 'health', entertainment: 'entertainment'
  };

  const sampleArticles = [
    {
      title: 'AI breakthroughs are reshaping global technology',
      description: 'The latest advances in artificial intelligence are redefining digital products and business strategy worldwide.',
      source: { name: 'Tech Horizon' },
      publishedAt: '2026-06-04T09:00:00Z',
      urlToImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      url: 'https://example.com/tech-ai-breakthroughs',
      category: 'technology',
      country: 'us'
    },
    {
      title: 'Global markets react to new business inflation data',
      description: 'Business leaders are recalibrating investment plans after fresh economic indicators from major markets.',
      source: { name: 'Business Daily' },
      publishedAt: '2026-06-04T07:30:00Z',
      urlToImage: 'https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&w=1200&q=80',
      url: 'https://example.com/business-inflation-update',
      category: 'business',
      country: 'us'
    },
    {
      title: 'Sports headline: championship drama on the final day',
      description: 'A thrilling finish at the stadium keeps fans on the edge of their seats in the season’s biggest match.',
      source: { name: 'Sports Pulse' },
      publishedAt: '2026-06-04T08:15:00Z',
      urlToImage: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80',
      url: 'https://example.com/sports-championship-drama',
      category: 'sports',
      country: 'us'
    },
    {
      title: 'Health experts release new wellness guidelines',
      description: 'New recommendations focus on mental health, nutrition, and preventive care for modern lifestyles.',
      source: { name: 'Health Today' },
      publishedAt: '2026-06-04T06:50:00Z',
      urlToImage: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80',
      url: 'https://example.com/health-wellness-guidelines',
      category: 'health',
      country: 'us'
    },
    {
      title: 'Entertainment preview: blockbuster releases this month',
      description: 'Top films and series are arriving this season, promising fresh stories and star-studded casts.',
      source: { name: 'Culture Wire' },
      publishedAt: '2026-06-04T05:40:00Z',
      urlToImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
      url: 'https://example.com/entertainment-blockbuster-preview',
      category: 'entertainment',
      country: 'us'
    },
    {
      title: 'India top news: commerce policy update drives regional growth',
      description: 'New trade policies in India aim to boost regional exports and strengthen economic recovery.',
      source: { name: 'Asia Markets' },
      publishedAt: '2026-06-04T04:20:00Z',
      urlToImage: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80',
      url: 'https://example.com/india-economic-update',
      category: 'business',
      country: 'in'
    }
  ];

  const $newsGrid = $('#newsGrid');
  const $statusPanel = $('#statusPanel');
  const $searchForm = $('#searchForm');
  const $searchInput = $('#searchInput');
  const $categoryButtons = $('.category-btn');
  const $themeToggle = $('#themeToggle');

  let selectedCategory = defaultCategory;
  let isLoading = false;

  function debounce(callback, delay = 600) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback(...args), delay);
    };
  }

  function normalizeText(value) {
    return value.trim().toLowerCase();
  }

  function resolveCountryCode(query) {
    return countryMap[normalizeText(query)];
  }

  function resolveCategoryName(query) {
    return categoryMap[normalizeText(query)];
  }

  function renderSkeletons(count = 6) {
    $newsGrid.empty();
    for (let i = 0; i < count; i += 1) {
      const skeleton = `
        <article class="news-card skeleton-card">
          <div class="skeleton skeleton-image"></div>
          <div class="skeleton-content">
            <div class="skeleton skeleton-line"></div>
            <div class="skeleton skeleton-line short"></div>
            <div class="skeleton skeleton-line sm"></div>
            <div class="skeleton skeleton-line"></div>
          </div>
        </article>`;
      $newsGrid.append(skeleton);
    }
  }

  function renderArticles(articles) {
    $newsGrid.empty();

    if (!Array.isArray(articles) || articles.length === 0) {
      $newsGrid.append(
        `<div class="status-panel"><p class="status-title">No stories found</p><p class="status-copy">Try another category or search term.</p></div>`
      );
      return;
    }

    articles.forEach((article) => {
      const imageUrl = article.urlToImage || 'https://via.placeholder.com/640x360?text=No+Image';
      const description = article.description || 'No description available for this story.';
      const sourceName = article.source?.name || 'Unknown source';
      const publishedAt = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) : 'Unknown date';

      const card = `
        <article class="news-card">
          <img class="news-image" src="${imageUrl}" alt="${article.title || 'News image'}" />
          <div class="news-content">
            <h3 class="news-title">${article.title || 'Untitled story'}</h3>
            <p class="news-description">${description}</p>
            <div class="news-meta">
              <span class="meta-pill">${sourceName}</span>
              <span class="meta-pill">${publishedAt}</span>
            </div>
            <a class="read-more" href="${article.url}" target="_blank" rel="noopener noreferrer">Read More</a>
          </div>
        </article>`;

      $newsGrid.append(card);
    });
  }

  function updateStatus(message) {
    $statusPanel.find('.status-title').text(message);
  }

  function setActiveCategory(category) {
    selectedCategory = category;
    $categoryButtons.removeClass('active');
    $categoryButtons.filter(`[data-category="${category}"]`).addClass('active');
  }

  function fetchNews(query = '') {
    const normalizedQuery = normalizeText(query);
    const isSearch = Boolean(normalizedQuery);

    if (apiKey === 'YOUR_API_KEY_HERE') {
      const filteredArticles = sampleArticles.filter((article) => {
        if (!isSearch) {
          return selectedCategory ? article.category === selectedCategory : true;
        }

        const matchQuery = normalizedQuery;
        const matchesText = [article.title, article.description, article.source.name, article.category]
          .join(' ')
          .toLowerCase()
          .includes(matchQuery);
        const matchesCountry = article.country === resolveCountryCode(matchQuery);
        const matchesCategory = article.category === resolveCategoryName(matchQuery);

        return matchesText || matchesCountry || matchesCategory;
      });

      renderArticles(filteredArticles);
      updateStatus(isSearch ? `Demo results for ${query}` : `Demo ${selectedCategory || 'top'} stories`);
      return;
    }

    if (isLoading) return;
    isLoading = true;
    renderSkeletons();
    updateStatus('Fetching the latest news...');

    const requestData = {
      apiKey,
      language: 'en',
      pageSize: 12,
    };

    let url = topHeadlinesUrl;
    let displayTerm = selectedCategory || 'top headlines';

    if (isSearch) {
      const countryCode = resolveCountryCode(normalizedQuery);
      const categoryName = resolveCategoryName(normalizedQuery);

      if (countryCode) {
        requestData.country = countryCode;
        displayTerm = `top stories in ${normalizedQuery}`;
      } else if (categoryName) {
        requestData.country = 'us';
        requestData.category = categoryName;
        displayTerm = `${categoryName} news`;
      } else {
        url = everythingUrl;
        requestData.q = query;
        requestData.sortBy = 'publishedAt';
        displayTerm = `search results for ${query}`;
      }
    } else {
      requestData.country = 'us';
      if (selectedCategory) {
        requestData.category = selectedCategory;
        displayTerm = selectedCategory;
      }
    }

    $.ajax({
      url,
      method: 'GET',
      data: requestData,
      dataType: 'json',
      success(response) {
        if (response.status !== 'ok') {
          throw new Error(response.message || 'Unable to retrieve news');
        }

        updateStatus(`Displaying ${response.articles.length} stories for ${displayTerm}`);
        renderArticles(response.articles);
      },
      error(xhr) {
        const message = xhr.responseJSON?.message || xhr.statusText || 'Network error. Please try again.';
        $newsGrid.empty();
        $newsGrid.append(
          `<div class="status-panel"><p class="status-title">Unable to load news</p><p class="status-copy">${message}</p></div>`
        );
        updateStatus('Error loading headlines');
      },
      complete() {
        isLoading = false;
      },
    });
  }

  $categoryButtons.on('click', function () {
    const category = $(this).data('category');
    setActiveCategory(category);
    $searchInput.val('');
    fetchNews();
  });

  const debouncedSearch = debounce((query) => {
    if (!query) {
      setActiveCategory(defaultCategory);
      fetchNews();
      return;
    }

    setActiveCategory('');
    updateStatus(`Searching for “${query}”...`);
    fetchNews(query);
  }, 700);

  $searchInput.on('input', function () {
    const query = $(this).val().trim();
    debouncedSearch(query);
  });

  $searchForm.on('submit', function (event) {
    event.preventDefault();
    const query = $searchInput.val().trim();
    if (!query) {
      updateStatus('Please enter a keyword to search.');
      return;
    }
    setActiveCategory('');
    updateStatus(`Searching for “${query}”...`);
    fetchNews(query);
  });

  $themeToggle.on('click', function () {
    $('body').toggleClass('light');
    const mode = $('body').hasClass('light') ? 'light' : 'dark';
    localStorage.setItem('newsAppTheme', mode);
  });

  function loadTheme() {
    const savedTheme = localStorage.getItem('newsAppTheme');
    if (savedTheme === 'light') {
      $('body').addClass('light');
    }
  }

  loadTheme();
  setActiveCategory(defaultCategory);
  fetchNews();
});
