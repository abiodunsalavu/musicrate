const albums = [
  { id: 1, title: "Psychodrama", artist: "Dave", year: 2019, rating: 5 },
  { id: 2, title: "The Off-Season", artist: "J. Cole", year: 2021, rating: 5 },
  { id: 3, title: "Blonde", artist: "Frank Ocean", year: 2016, rating: 5 },
  { id: 4, title: "DAMN.", artist: "Kendrick Lamar", year: 2017, rating: 5 },
];

export default async function AlbumPage({ params }) {
    const {id} = await params;
    const album = albums.find((a) => a.id === Number(id));

    if (!album) {
        return <main className="p-8">Album not found</main>;
    }
    return ( 
        <main className="p-8">
            <h1 className="text-2xl font-bold mb-6">{album.title}</h1>
            <p className="text-sm text-gray-500">{album.artist} · {album.year}</p>
            <p className="text-sm mt-1">{"★".repeat(album.rating)}</p>
        </main>
    );
}