export default function SpotifyButton({ ...props }) {
  return (
    <button
      className="text-white bg-spotify hover:bg-spotify-active focus:ring-4 focus:outline-hidden focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 "
      {...props}
    >
      {props.children}
    </button>
  );
}
