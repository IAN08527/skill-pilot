import axios from 'axios';
import * as cheerio from 'cheerio';
import { promises as fs } from 'node:fs';
import path from 'node:path';

// Rate limiting configuration
const DELAY_BETWEEN_REQUESTS = 2000; // 2 seconds
const MAX_RETRIES = 3;

// Helper function to add delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to calculate relevance score
const calculateRelevance = (title, searchTerm) => {
    if (!title || !searchTerm) return 0;
    const titleLower = title.toLowerCase();
    const searchTerms = searchTerm.toLowerCase().split(/\s+/).filter(t => t.length > 2);

    let score = 0;
    // Exact match is highest priority
    if (titleLower.includes(searchTerm.toLowerCase())) score += 15;

    // Boost for introductory/beginner terms
    const introBoosters = ["introduction", "beginner", "complete", "masterclass", "basics", "fundamental", "course", "handbook"];
    introBoosters.forEach(boost => {
        if (titleLower.includes(boost)) score += 5;
    });

    // Partial term matches
    searchTerms.forEach(term => {
        if (titleLower.includes(term)) score += 5;
    });

    return score;
};

// Helper function to generate random user agent
const getUserAgent = () => {
    const agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];
    return agents[Math.floor(Math.random() * agents.length)];
};

// Scraper for Coursera
export async function scrapeCourseraSearch(searchTerm = 'programming', maxResults = 10, page = 1) {
    const courses = [];
    const url = `https://www.coursera.org/search?query=${encodeURIComponent(searchTerm)}${page > 1 ? `&page=${page}` : ''}`;

    try {
        console.log(`Scraping Coursera for: ${searchTerm}`);
        const response = await axios.get(url, {
            headers: {
                'User-Agent': getUserAgent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);

        // Coursera uses React, so we need to extract from script tags or data attributes
        $('script[type="application/ld+json"]').each((i, elem) => {
            if (courses.length >= maxResults) return false;

            try {
                const data = JSON.parse($(elem).html());
                if (data['@type'] === 'Course') {
                    courses.push({
                        id: `coursera_${Date.now()}_${i}`,
                        title: data.name || 'Unknown Course',
                        platform: 'Coursera',
                        thumbnail: data.image || 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Coursera_logo.png',
                        rating: parseFloat(data.aggregateRating?.ratingValue) || 4.0,
                        reviewCount: parseInt(data.aggregateRating?.reviewCount) || 0,
                        price: data.offers?.price === '0' ? 'Free' : 'Paid',
                        duration: data.timeRequired || 'Varies',
                        level: data.educationalLevel || 'All Levels',
                        url: data.url || url
                    });
                }
            } catch (e) {
                // Skip invalid JSON
            }
        });

        // Fallback: scrape visible elements
        if (courses.length === 0) {
            $('.cds-ProductCard-base').slice(0, maxResults).each((i, elem) => {
                const $card = $(elem);
                courses.push({
                    id: `coursera_${Date.now()}_${i}`,
                    title: $card.find('h3').text().trim() || 'Course Title',
                    platform: 'Coursera',
                    thumbnail: $card.find('img').attr('src') || 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Coursera_logo.png',
                    rating: parseFloat($card.find('[data-testid="rating"]').text()) || 4.5,
                    reviewCount: parseInt($card.find('.ratings-text').text().replace(/[^0-9]/g, '')) || 1000,
                    price: $card.text().includes('Free') ? 'Free' : 'Paid',
                    duration: '4 weeks',
                    level: 'Intermediate',
                    url: `https://www.coursera.org${$card.find('a').attr('href') || ''}`
                });
            });
        }

        console.log(`✓ Scraped ${courses.length} courses from Coursera`);
    } catch (error) {
        console.error('Error scraping Coursera:', error.message);
    }

    return courses;
}

// Scraper for GeeksforGeeks
export async function scrapeGeeksForGeeks(searchTerm = 'programming', maxResults = 10, page = 1) {
    const courses = [];
    const url = `https://www.geeksforgeeks.org/courses/search?query=${encodeURIComponent(searchTerm)}${page > 1 ? `&page=${page}` : ''}`;

    try {
        console.log(`Scraping GeeksforGeeks for: ${searchTerm}`);
        const response = await axios.get(url, {
            headers: {
                'User-Agent': getUserAgent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Connection': 'keep-alive'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);

        // GFG search results use specific classes, or fallback to general course card classes
        let cards = $('a[href^="/courses/"], .course-card, .courses_card');

        // If searching but no results, try falling back to the main courses page
        if (cards.length === 0 && url.includes('/search')) {
            console.log('GFG search returned no results, falling back to main courses page...');
            try {
                const fallbackResponse = await axios.get('https://www.geeksforgeeks.org/courses', {
                    headers: { 'User-Agent': getUserAgent() },
                    timeout: 10000
                });
                const $fallback = cheerio.load(fallbackResponse.data);
                cards = $fallback('a[href^="/courses/"], .course-card, .courses_card, [class*="CourseCard_title"], [class*="courseCard"]');
            } catch (fallbackError) {
                console.error('GFG fallback failed:', fallbackError.message);
            }
        }

        cards.slice(0, maxResults).each((i, elem) => {
            const $card = $(elem);

            // Try to get title from h5 or h3 or matching title class
            const title = $card.find('h5, h3, h4, .course-title, [class*="title"], [class*="CourseCard_title"]').first().text().trim();
            if (!title || title.length < 3) return;

            const rawThumbnail = $card.find('img').attr('src') || $card.find('img').attr('data-src');
            const defaultGFGLogo = '/geeksforgeeks.png';

            courses.push({
                id: `gfg_${Date.now()}_${i}`,
                title: title,
                platform: 'GeeksforGeeks',
                thumbnail: (rawThumbnail && !rawThumbnail.includes('icon')) ? rawThumbnail : defaultGFGLogo,
                rating: parseFloat($card.find('.rating, [class*="rating"], [class*="Rating"]').text()) || 4.6,
                reviewCount: parseInt($card.find('.reviews, [class*="review"], [class*="Review"]').text().replace(/[^0-9]/g, '')) || 800,
                price: $card.text().toLowerCase().includes('free') ? 'Free' : 'Paid',
                duration: $card.find('.duration, [class*="duration"], [class*="Time"]').text().trim() || '8 weeks',
                level: $card.find('.level, [class*="level"]').text().trim() || 'Beginner',
                url: (() => {
                    const href = $card.attr('href') || $card.find('a').attr('href') || '/courses';
                    if (href.startsWith('http')) return href;
                    if (href.startsWith('/')) return `https://www.geeksforgeeks.org${href}`;
                    return `https://www.geeksforgeeks.org/courses/search?query=${encodeURIComponent(searchTerm)}`;
                })()
            });
        });

        console.log(`✓ Scraped ${courses.length} courses from GeeksforGeeks`);
    } catch (error) {
        console.error('Error scraping GeeksforGeeks:', error.message);
    }

    return courses;
}

// Main scraper function with retry logic
export async function scrapeAllPlatforms(searchTerm = 'programming', maxPerPlatform = 15, page = 1) {
    const allCourses = [];

    try {
        // Scrape Coursera
        const courseraCourses = await scrapeCourseraSearch(searchTerm, maxPerPlatform, page);
        allCourses.push(...courseraCourses.map(c => ({
            ...c,
            relevance: calculateRelevance(c.title, searchTerm)
        })));
        await delay(DELAY_BETWEEN_REQUESTS);

        // Scrape GeeksforGeeks
        const gfgCourses = await scrapeGeeksForGeeks(searchTerm, maxPerPlatform, page);
        allCourses.push(...gfgCourses.map(c => ({
            ...c,
            relevance: calculateRelevance(c.title, searchTerm)
        })));

        // Sort by relevance and then rating
        const rankedCourses = allCourses
            .filter(c => c.relevance > 0 || !searchTerm) // Only show relevant results if searching
            .sort((a, b) => b.relevance - a.relevance || b.rating - a.rating);

        return {
            success: true,
            timestamp: new Date().toISOString(),
            searchTerm,
            page,
            totalCourses: rankedCourses.length,
            courses: rankedCourses,
            hasMore: rankedCourses.length >= (maxPerPlatform * 0.8) // Heuristic for more results
        };
    } catch (error) {
        console.error('Error in scrapeAllPlatforms:', error.message);
        return {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
            courses: []
        };
    }
}

// Load fallback data
export async function loadFallbackData() {
    try {
        // In Next.js, we might need a different way to resolve the path
        // but since this is running in a Node context in the API, path.join should work
        // if we are careful about __dirname. 
        // Better to use process.cwd() or similar if possible.
        const fallbackPath = path.join(process.cwd(), 'modules', 'courses.json');
        const data = await fs.readFile(fallbackPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading fallback data:', error.message);
        return { success: false, courses: [] };
    }
}

// Main execution with fallback
export async function getCourses(searchTerm = 'programming', maxPerPlatform = 15, page = 1) {
    let result = await scrapeAllPlatforms(searchTerm, maxPerPlatform, page);

    // If scraping failed or returned no courses, use fallback (only on first page)
    if ((!result.success || result.courses.length === 0) && page === 1) {
        result = await loadFallbackData();
    }

    return result;
}


