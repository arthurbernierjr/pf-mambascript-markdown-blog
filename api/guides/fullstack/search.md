---
title: "Full-Stack Search"
subTitle: "Implementing Search Functionality"
excerpt: "Search is essential - learn to implement it properly."
featureImage: "/img/fullstack-search.png"
date: "2026-02-01"
order: 907
---

# Explanation

## Search Implementation

Search involves frontend UI, backend processing, and database queries. The right approach depends on data size and requirements.

### Search Options

| Approach | Best For | Complexity |
|----------|----------|------------|
| Database queries | Small datasets | Low |
| Full-text search | Medium datasets | Medium |
| Elasticsearch | Large datasets | High |
| Algolia | Quick setup | Low |

---

# Demonstration

## Example 1: Basic Database Search

```javascript
// Backend: MongoDB text search
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    category: String,
    price: Number,
    tags: [String]
});

// Create text index
productSchema.index({
    name: 'text',
    description: 'text',
    tags: 'text'
}, {
    weights: {
        name: 10,
        tags: 5,
        description: 1
    }
});

const Product = mongoose.model('Product', productSchema);

// Search endpoint
router.get('/search', async (req, res) => {
    const {
        q,
        category,
        minPrice,
        maxPrice,
        sort = 'relevance',
        page = 1,
        limit = 20
    } = req.query;

    const query = {};

    // Text search
    if (q) {
        query.$text = { $search: q };
    }

    // Filters
    if (category) {
        query.category = category;
    }

    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Sorting
    let sortOption = {};
    switch (sort) {
        case 'price_asc':
            sortOption = { price: 1 };
            break;
        case 'price_desc':
            sortOption = { price: -1 };
            break;
        case 'newest':
            sortOption = { createdAt: -1 };
            break;
        default:
            if (q) {
                sortOption = { score: { $meta: 'textScore' } };
            }
    }

    const skip = (page - 1) * limit;

    const [results, total] = await Promise.all([
        Product.find(query)
            .select(q ? { score: { $meta: 'textScore' } } : {})
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit)),
        Product.countDocuments(query)
    ]);

    res.json({
        data: results,
        meta: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
        }
    });
});
```

## Example 2: PostgreSQL Full-Text Search

```javascript
// Knex migration
exports.up = function(knex) {
    return knex.raw(`
        ALTER TABLE products ADD COLUMN search_vector tsvector;

        CREATE INDEX products_search_idx ON products USING gin(search_vector);

        UPDATE products SET search_vector =
            setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
            setweight(to_tsvector('english', coalesce(array_to_string(tags, ' '), '')), 'C');

        CREATE FUNCTION products_search_trigger() RETURNS trigger AS $$
        BEGIN
            NEW.search_vector :=
                setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
                setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
                setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'C');
            RETURN NEW;
        END
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER products_search_update
            BEFORE INSERT OR UPDATE ON products
            FOR EACH ROW EXECUTE FUNCTION products_search_trigger();
    `);
};

// Search query
async function searchProducts(query, options = {}) {
    const { category, minPrice, maxPrice, page = 1, limit = 20 } = options;

    let sql = knex('products')
        .select('*')
        .select(knex.raw('ts_rank(search_vector, plainto_tsquery(?)) as rank', [query]))
        .whereRaw('search_vector @@ plainto_tsquery(?)', [query]);

    if (category) {
        sql = sql.where('category', category);
    }

    if (minPrice) {
        sql = sql.where('price', '>=', minPrice);
    }

    if (maxPrice) {
        sql = sql.where('price', '<=', maxPrice);
    }

    const offset = (page - 1) * limit;

    const [results, [{ count }]] = await Promise.all([
        sql.clone().orderBy('rank', 'desc').offset(offset).limit(limit),
        sql.clone().count('* as count')
    ]);

    return {
        data: results,
        total: parseInt(count),
        page,
        limit
    };
}
```

## Example 3: Elasticsearch

```javascript
const { Client } = require('@elastic/elasticsearch');

const client = new Client({
    node: process.env.ELASTICSEARCH_URL
});

// Create index with mappings
async function createProductIndex() {
    await client.indices.create({
        index: 'products',
        body: {
            settings: {
                analysis: {
                    analyzer: {
                        product_analyzer: {
                            type: 'custom',
                            tokenizer: 'standard',
                            filter: ['lowercase', 'asciifolding', 'snowball']
                        }
                    }
                }
            },
            mappings: {
                properties: {
                    name: {
                        type: 'text',
                        analyzer: 'product_analyzer',
                        boost: 2
                    },
                    description: {
                        type: 'text',
                        analyzer: 'product_analyzer'
                    },
                    category: {
                        type: 'keyword'
                    },
                    tags: {
                        type: 'keyword'
                    },
                    price: {
                        type: 'float'
                    },
                    createdAt: {
                        type: 'date'
                    },
                    suggest: {
                        type: 'completion'
                    }
                }
            }
        }
    });
}

// Index a product
async function indexProduct(product) {
    await client.index({
        index: 'products',
        id: product.id,
        body: {
            ...product,
            suggest: {
                input: [product.name, ...product.tags]
            }
        }
    });
}

// Search products
async function searchProducts(query, filters = {}) {
    const { category, minPrice, maxPrice, page = 1, size = 20 } = filters;

    const must = [
        {
            multi_match: {
                query,
                fields: ['name^2', 'description', 'tags'],
                fuzziness: 'AUTO'
            }
        }
    ];

    const filter = [];

    if (category) {
        filter.push({ term: { category } });
    }

    if (minPrice || maxPrice) {
        filter.push({
            range: {
                price: {
                    ...(minPrice && { gte: minPrice }),
                    ...(maxPrice && { lte: maxPrice })
                }
            }
        });
    }

    const result = await client.search({
        index: 'products',
        body: {
            query: {
                bool: { must, filter }
            },
            highlight: {
                fields: {
                    name: {},
                    description: {}
                }
            },
            aggs: {
                categories: {
                    terms: { field: 'category' }
                },
                price_ranges: {
                    range: {
                        field: 'price',
                        ranges: [
                            { to: 50 },
                            { from: 50, to: 100 },
                            { from: 100, to: 500 },
                            { from: 500 }
                        ]
                    }
                }
            },
            from: (page - 1) * size,
            size
        }
    });

    return {
        data: result.hits.hits.map(hit => ({
            ...hit._source,
            _score: hit._score,
            _highlight: hit.highlight
        })),
        total: result.hits.total.value,
        aggregations: result.aggregations
    };
}

// Autocomplete suggestions
async function getSuggestions(prefix) {
    const result = await client.search({
        index: 'products',
        body: {
            suggest: {
                product_suggest: {
                    prefix,
                    completion: {
                        field: 'suggest',
                        size: 5,
                        skip_duplicates: true
                    }
                }
            }
        }
    });

    return result.suggest.product_suggest[0].options.map(opt => opt.text);
}
```

## Example 4: Frontend Search UI

```jsx
// SearchPage.jsx
function SearchPage() {
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState({});
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const debouncedQuery = useDebounce(query, 300);

    // Search on query or filter change
    useEffect(() => {
        if (!debouncedQuery) {
            setResults(null);
            return;
        }

        const search = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    q: debouncedQuery,
                    ...filters
                });
                const response = await fetch(`/api/search?${params}`);
                const data = await response.json();
                setResults(data);
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setLoading(false);
            }
        };

        search();
    }, [debouncedQuery, filters]);

    return (
        <div className="search-page">
            <SearchBar
                value={query}
                onChange={setQuery}
                loading={loading}
            />

            <div className="search-content">
                <SearchFilters
                    filters={filters}
                    onChange={setFilters}
                    aggregations={results?.aggregations}
                />

                <SearchResults
                    results={results?.data}
                    total={results?.total}
                    loading={loading}
                />
            </div>
        </div>
    );
}

// SearchBar with autocomplete
function SearchBar({ value, onChange, loading }) {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        if (value.length < 2) {
            setSuggestions([]);
            return;
        }

        const fetchSuggestions = async () => {
            const response = await fetch(`/api/search/suggest?q=${value}`);
            const data = await response.json();
            setSuggestions(data);
        };

        const timer = setTimeout(fetchSuggestions, 150);
        return () => clearTimeout(timer);
    }, [value]);

    return (
        <div className="search-bar">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search products..."
            />

            {loading && <Spinner />}

            {showSuggestions && suggestions.length > 0 && (
                <ul className="suggestions">
                    {suggestions.map((suggestion, i) => (
                        <li
                            key={i}
                            onClick={() => {
                                onChange(suggestion);
                                setShowSuggestions(false);
                            }}
                        >
                            {suggestion}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

// Faceted filters
function SearchFilters({ filters, onChange, aggregations }) {
    return (
        <aside className="filters">
            <FilterSection title="Category">
                {aggregations?.categories?.buckets.map(bucket => (
                    <label key={bucket.key}>
                        <input
                            type="checkbox"
                            checked={filters.category === bucket.key}
                            onChange={(e) => onChange({
                                ...filters,
                                category: e.target.checked ? bucket.key : undefined
                            })}
                        />
                        {bucket.key} ({bucket.doc_count})
                    </label>
                ))}
            </FilterSection>

            <FilterSection title="Price">
                <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice || ''}
                    onChange={(e) => onChange({
                        ...filters,
                        minPrice: e.target.value || undefined
                    })}
                />
                <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice || ''}
                    onChange={(e) => onChange({
                        ...filters,
                        maxPrice: e.target.value || undefined
                    })}
                />
            </FilterSection>
        </aside>
    );
}
```

## Example 5: Search Analytics

```javascript
// Track search queries
async function trackSearch(userId, query, results) {
    await db.searchLogs.create({
        userId,
        query,
        resultCount: results.total,
        timestamp: new Date()
    });
}

// Track clicks
async function trackClick(userId, searchId, productId, position) {
    await db.clickLogs.create({
        userId,
        searchId,
        productId,
        position,
        timestamp: new Date()
    });
}

// Popular searches
async function getPopularSearches(limit = 10) {
    return db.searchLogs.aggregate([
        {
            $match: {
                timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            }
        },
        {
            $group: {
                _id: { $toLower: '$query' },
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: limit },
        {
            $project: {
                query: '$_id',
                count: 1
            }
        }
    ]);
}

// Zero-result queries (need improvement)
async function getZeroResultQueries() {
    return db.searchLogs.aggregate([
        {
            $match: {
                resultCount: 0,
                timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }
        },
        {
            $group: {
                _id: { $toLower: '$query' },
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 50 }
    ]);
}
```

## Example 6: Search with Algolia

```javascript
// Backend: Index products
const algoliasearch = require('algoliasearch');

const client = algoliasearch(
    process.env.ALGOLIA_APP_ID,
    process.env.ALGOLIA_ADMIN_KEY
);
const index = client.initIndex('products');

// Configure index
await index.setSettings({
    searchableAttributes: [
        'name',
        'description',
        'tags'
    ],
    attributesForFaceting: [
        'category',
        'filterOnly(price)'
    ],
    customRanking: [
        'desc(popularity)',
        'asc(price)'
    ]
});

// Index products
async function syncProducts() {
    const products = await Product.find();
    const records = products.map(p => ({
        objectID: p._id.toString(),
        name: p.name,
        description: p.description,
        category: p.category,
        tags: p.tags,
        price: p.price,
        image: p.image
    }));

    await index.saveObjects(records);
}

// Frontend: React InstantSearch
import {
    InstantSearch,
    SearchBox,
    Hits,
    RefinementList,
    Pagination,
    Configure
} from 'react-instantsearch-hooks-web';
import algoliasearch from 'algoliasearch/lite';

const searchClient = algoliasearch(
    process.env.REACT_APP_ALGOLIA_APP_ID,
    process.env.REACT_APP_ALGOLIA_SEARCH_KEY
);

function Search() {
    return (
        <InstantSearch searchClient={searchClient} indexName="products">
            <Configure hitsPerPage={20} />

            <SearchBox placeholder="Search products..." />

            <div className="search-panel">
                <div className="filters">
                    <RefinementList attribute="category" />
                </div>

                <div className="results">
                    <Hits hitComponent={ProductHit} />
                    <Pagination />
                </div>
            </div>
        </InstantSearch>
    );
}

function ProductHit({ hit }) {
    return (
        <div className="product-hit">
            <img src={hit.image} alt={hit.name} />
            <h3>{hit.name}</h3>
            <p>${hit.price}</p>
        </div>
    );
}
```

**Key Takeaways:**
- Start simple with database search
- Use full-text indexing for better results
- Implement debouncing on frontend
- Track analytics to improve
- Consider managed solutions like Algolia

---

# Imitation

### Challenge 1: Build Product Search

**Task:** Create a search with filters, pagination, and autocomplete.

<details>
<summary>Solution</summary>

Combine Examples 1-4 above to build a complete search solution with MongoDB text search, React frontend with debouncing, and autocomplete suggestions.

</details>

---

# Practice

### Exercise 1: Fuzzy Search
**Difficulty:** Intermediate

Add fuzzy matching for typo tolerance.

### Exercise 2: Search Synonyms
**Difficulty:** Advanced

Implement synonym support in search.

---

## Summary

**What you learned:**
- Database search options
- Full-text search setup
- Elasticsearch basics
- Frontend search UI
- Search analytics

**Next Steps:**
- Read: [Performance](/api/guides/concepts/performance)
- Practice: Add search to your app
- Explore: Algolia, Meilisearch

---

## Resources

- [Elasticsearch Guide](https://www.elastic.co/guide/en/elasticsearch/reference/current/)
- [Algolia Documentation](https://www.algolia.com/doc/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
