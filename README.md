# Movie List App

A Netflix-style movie browsing application built with Next.js, featuring real movie data from The Movie Database (TMDb) API and an interactive 3D carousel.

## ✨ Features

- **Real Movie Data**: Fetches live movie information from TMDb API
- **Interactive 3D Carousel**: Beautiful Aceternity UI-inspired carousel for "More Like This" section
- **Netflix-Style Design**: Professional movie details pages with hero sections
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Movie Navigation**: Click through movie cards to explore different films

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- TMDb API Key (free from [themoviedb.org](https://www.themoviedb.org/settings/api))

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd movielist
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
   ```

   To get your free TMDb API key:

   - Visit [TMDb](https://www.themoviedb.org)
   - Create an account
   - Go to Settings → API
   - Request an API key (choose "Developer" option)

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎬 Testing the Movie Details & Carousel

To test the movie details page and carousel, visit URLs like:

- `/moviedetails/550` - Fight Club
- `/moviedetails/27205` - Inception
- `/moviedetails/299536` - Avengers: Infinity War
- `/moviedetails/299534` - Avengers: Endgame
- `/moviedetails/157336` - Interstellar

The carousel will automatically load similar movies and allow you to:

- Navigate with arrow controls
- Click on movie posters to view details
- Use dot indicators to jump to specific movies
- Experience 3D hover effects

## 🎨 Carousel Features

Based on [Aceternity UI Carousel](https://ui.aceternity.com/components/carousel), featuring:

- **3D Perspective Effects**: Movies tilt and scale based on focus
- **Interactive Mouse Movement**: Subtle parallax effects on hover
- **Smooth Animations**: Fluid transitions between slides
- **Navigation Controls**: Previous/Next buttons and dot indicators
- **Real Movie Data**: Live posters and information from TMDb

## 🛠 Tech Stack

- **Next.js 15** - React framework
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **TMDb API** - Movie data
- **Tabler Icons** - UI icons

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/
│   │   └── MovieCarousel.js    # 3D movie carousel
│   ├── Header.js               # Navigation header
│   └── ...
├── pages/
│   ├── moviedetails/
│   │   └── [msid]/
│   │       └── index.js        # Movie details page
│   └── index.js                # Home page
├── services/
│   └── tmdbApi.js              # TMDb API integration
└── lib/
    └── utils.js                # Utility functions
```

## 🎯 Usage Examples

### Basic Movie Details

```javascript
// Visit any movie by TMDb ID
/moviedetails/[movie_id];
```

### API Integration

```javascript
// Fetch movie data
const movie = await TMDBApi.getMovieById(movieId);

// Use in carousel
<MovieCarousel movies={movie.moreLikeThis} onMovieClick={handleMovieClick} />;
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [The Movie Database (TMDb)](https://www.themoviedb.org) for movie data
- [Aceternity UI](https://ui.aceternity.com) for carousel inspiration
- [Tabler Icons](https://tabler-icons.io) for beautiful icons
