# Netflix-like Movie List Component Structure

This project implements a Netflix-like interface with modular React components.

## Component Hierarchy

```
src/
├── components/
│   ├── index.js          # Component exports
│   ├── Header.js         # Netflix header with navigation
│   ├── MovieCard.js      # Individual movie thumbnail
│   ├── MovieRow.js       # Horizontal row of movies
│   └── MovieGrid.js      # Container for multiple rows
├── data/
│   └── movieData.js      # Sample movie data
└── pages/
    └── index.js          # Main page using all components
```

## Components

### Header.js

- Fixed position header with Netflix branding
- Navigation links (Home, TV Shows, Movies, etc.)
- User controls (search, notifications, profile)
- Responsive design with mobile considerations

### MovieCard.js

- Individual movie thumbnail component
- Supports various badges (TOP 10, Recently Added, New Season)
- Progress bar for "Continue Watching" section
- Hover effects and transitions
- Netflix "N" logo overlay

### MovieRow.js

- Horizontal scrolling row of movies
- Section title display
- Handles progress bars for watched content
- Responsive spacing and layout

### MovieGrid.js

- Container component for multiple movie rows
- Manages spacing and layout
- Integrates with header positioning

## Features

- **Responsive Design**: Works on mobile and desktop
- **Dark Theme**: Netflix-like dark background
- **Hover Effects**: Smooth transitions and scaling
- **Progress Tracking**: Visual progress bars for watched content
- **Badge System**: TOP 10, Recently Added, New Season badges
- **Custom Scrollbars**: Styled horizontal scrollbars for movie rows

## Data Structure

The `movieData.js` file contains sample data with the following structure:

```javascript
{
  rows: [
    {
      title: "Section Title",
      showProgress: boolean, // Optional
      movies: [
        {
          title: "Movie Title",
          isTop10: boolean,
          isRecentlyAdded: boolean,
          isNewSeason: boolean,
          progress: number, // 0-100
          badge: string,
        },
      ],
    },
  ];
}
```

## Styling

- Uses Tailwind CSS for styling
- Custom scrollbar styling for movie rows
- Netflix red (#E50914) for branding elements
- Dark theme with proper contrast ratios
- Responsive breakpoints for different screen sizes
