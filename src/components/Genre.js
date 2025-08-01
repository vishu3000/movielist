const Genre = ({ genres }) => {
  if (!genres || genres.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {genres.map((genre, index) => (
        <div
          key={index}
          className={`
            bg-transparent
            px-4 py-2 
            rounded-full 
            text-gray-300
            border-gray-300
            text-sm 
            font-medium 
            border
            hover:scale-105 
            
            transition-all
            duration-200
            shadow-md
          `}
        >
          {genre}
        </div>
      ))}
    </div>
  );
};

export default Genre;
