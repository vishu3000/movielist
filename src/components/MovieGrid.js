import MovieRow from "./MovieRow";

export default function MovieGrid({ rows }) {
  return (
    <div className="pt-20">
      {rows.map((row, index) => (
        <MovieRow key={index} title={row.title} url={row.url} type={row.type} />
      ))}
    </div>
  );
}
