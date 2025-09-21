# AI-Powered Fashion Curator - System Architecture

## Project Overview

**AI-Powered Fashion Curator** is an intelligent e-commerce platform that combines real-time web scraping, Google Gemini AI, and modern web technologies to create personalized outfit recommendations from Meesho's product catalog.

---

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                              │
├─────────────────────────────────────────────────────────────────┤
│  React + TypeScript Frontend (Vite)                            │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   Search UI     │ │  Product Display│ │ Wishlist Mgmt   │   │
│  │   Components    │ │   Components    │ │   Components    │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│              │                   │                   │         │
│              └───────────────────┼───────────────────┘         │
│                                  │                             │
└──────────────────────────────────┼─────────────────────────────┘
                                   │ HTTP/CORS
┌──────────────────────────────────┼─────────────────────────────┐
│                        API TIER  │                             │
├──────────────────────────────────┼─────────────────────────────┤
│  Flask REST API Server (Port 5002)                             │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   /api/search   │ │ /api/llmsearch  │ │/api/image-search│   │
│  │  Basic Search   │ │  AI-Enhanced    │ │  Vision-Based   │   │
│  │                 │ │    Search       │ │    Search       │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│              │                   │                   │         │
│              └───────────────────┼───────────────────┘         │
│                                  │                             │
└──────────────────────────────────┼─────────────────────────────┘
                                   │
┌──────────────────────────────────┼─────────────────────────────┐
│                    PROCESSING TIER│                             │
├──────────────────────────────────┼─────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │             Google Gemini AI Service                   │   │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐ │   │
│  │  │ Query Generation│ │ Image Analysis  │ │Result Proc. │ │   │
│  │  │ & Enhancement   │ │ & Understanding │ │& Filtering  │ │   │
│  │  └─────────────────┘ └─────────────────┘ └─────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │             Selenium Web Scraper                       │   │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐ │   │
│  │  │ Chrome Driver   │ │ Parallel Scraping│ │ Data Extract│ │   │
│  │  │ Pool Management │ │ Thread Pool      │ │ & Transform │ │   │
│  │  └─────────────────┘ └─────────────────┘ └─────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                   │
┌──────────────────────────────────┼─────────────────────────────┐
│                      DATA TIER   │                             │
├──────────────────────────────────┼─────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  Meesho.com                             │   │
│  │           (External Data Source)                        │   │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐ │   │
│  │  │  Product Pages  │ │  Search Results │ │  Categories │ │   │
│  │  │                 │ │                 │ │             │ │   │
│  │  └─────────────────┘ └─────────────────┘ └─────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  Supabase                               │   │
│  │            (User Data Storage)                          │   │
│  │  ┌─────────────────┐ ┌─────────────────┐              │   │
│  │  │ User Preferences│ │ Wishlist Folders│              │   │
│  │  │                 │ │                 │              │   │
│  │  └─────────────────┘ └─────────────────┘              │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technology Stack

### Frontend (Client Tier)
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.2
- **Styling**: Tailwind CSS 3.4.1 with custom Meesho brand colors
- **Icons**: Lucide React 0.344.0
- **HTTP Client**: Native Fetch API

### Backend (API + Processing Tier)
- **Framework**: Flask (Python)
- **AI Integration**: Google Gemini AI (gemini-1.5-flash)
- **Web Scraping**: Selenium WebDriver with Chrome
- **Parallel Processing**: ThreadPoolExecutor (max 4 workers)
- **Image Processing**: PIL (Python Imaging Library)
- **CORS**: Flask-CORS for cross-origin requests

### Data Layer
- **Primary Data Source**: Meesho.com (via web scraping)
- **User Data**: Supabase (PostgreSQL)
- **Session Management**: Local browser storage

---

## 🎯 Core System Features

### 1. Intelligent Search System
- **Basic Search**: Direct product queries to Meesho
- **AI-Enhanced Search**: Natural language processing with query generation
- **Visual Search**: Image-based product discovery using Gemini Vision

### 2. Real-Time Web Scraping
- **Multi-threaded Selenium**: Parallel scraping with driver pooling
- **Anti-Detection**: Stealth browsing with realistic user agents
- **Dynamic Content**: JavaScript-rendered page handling

### 3. AI-Powered Recommendations
- **Outfit Completion**: Smart complement suggestions
- **Style Analysis**: Fashion trend understanding
- **Personalization**: User preference learning

### 4. Advanced Wishlist Management
- **Folder Organization**: Custom categorization system
- **Outfit Collections**: Complete look storage
- **Smart Filtering**: AI-based organization

---

## 🔄 Data Flow Architecture

### Search Request Flow
```
User Input → React Component → TypeScript Service → Flask API → 
Gemini AI (Query Enhancement) → Selenium Scraper → Meesho.com → 
Data Extraction → Result Processing → API Response → UI Update
```

### Image Search Flow
```
Image Upload → React Component → Base64 Encoding → Flask API → 
Gemini Vision (Image Analysis) → Search Query Generation → 
Parallel Scraping → Result Aggregation → UI Display
```

### Outfit Completion Flow
```
Product Selection → React Component → Outfit Modal → Wishlist Service → 
Supabase Database → Folder Creation/Selection → Success Notification
```

---

## 📊 Performance Characteristics

### Scalability Metrics
- **Concurrent Scraping**: Up to 4 parallel threads
- **API Response Time**: ~2-5 seconds for AI-enhanced searches
- **Driver Pool**: Reusable Chrome instances for efficiency
- **Caching Strategy**: Result deduplication and merging

### Reliability Features
- **Error Handling**: Comprehensive exception management
- **Fallback Systems**: Mock data when external services fail
- **Retry Logic**: Automatic retry for failed scraping attempts
- **Graceful Degradation**: Partial results when some queries fail

---

## 🚀 Deployment Architecture

### Development Environment
```
localhost:5173 (Vite Dev Server) ← → localhost:5002 (Flask API)
                                   ↓
                              Google Gemini API
                                   ↓
                              Meesho.com (Scraping Target)
                                   ↓
                              Supabase Cloud Database
```

### Production Considerations
- **Frontend**: Static hosting (Vercel, Netlify)
- **Backend**: Container deployment (Docker)
- **Database**: Supabase production tier
- **Monitoring**: Application performance monitoring
- **Caching**: Redis for scraped data caching

---

## 🔐 Security & Compliance

### Data Protection
- **User Privacy**: No sensitive data storage in scraping
- **API Security**: Environment variable management
- **CORS Policy**: Restricted cross-origin access
- **Input Validation**: Request sanitization

### Ethical Scraping
- **Rate Limiting**: Respectful request timing
- **User Agent Rotation**: Realistic browsing simulation
- **Terms Compliance**: Adherence to Meesho's robots.txt
- **Data Usage**: Non-commercial educational purpose

---

## 📈 Future Enhancement Roadmap

### Phase 1: Performance Optimization
- Redis caching layer implementation
- Database query optimization
- CDN integration for static assets

### Phase 2: Advanced AI Features
- Style preference learning algorithms
- Seasonal trend integration
- Size and fit recommendations

### Phase 3: Scale & Integration
- Multi-platform scraping support
- Real-time inventory tracking
- Mobile application development

---

This architecture provides a robust foundation for an AI-powered fashion recommendation system with real-time data capabilities and intelligent user experiences.